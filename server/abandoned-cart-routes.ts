import { Router } from 'express';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import sgMail from '@sendgrid/mail';

const router = Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

// Track abandoned cart
router.post('/track', asyncHandler(async (req, res) => {
  const { userId, cartItems, cartValue, userEmail, userName } = req.body;

  if (!userId || !cartItems || !cartValue || !userEmail) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const cart = await storage.createAbandonedCart({
    userId,
    cartItems,
    cartValue,
    userEmail,
    userName,
  });

  res.json({ success: true, data: cart });
}));

// Send recovery emails (admin/cron job)
router.post('/send-recovery-emails', asyncHandler(async (req, res) => {
  const carts = await storage.getAbandonedCartsNotRecovered();
  const now = new Date();
  let sent = 0;

  for (const cart of carts) {
    const hoursSinceAbandonment = (now.getTime() - new Date(cart.abandonedAt!).getTime()) / (1000 * 60 * 60);

    // Email 1: After 1 hour
    if (hoursSinceAbandonment >= 1 && !cart.recoveryEmail1Sent) {
      try {
        await sgMail.send({
          to: cart.userEmail,
          from: 'noreply@talklink.com',
          subject: `Don't forget! Your cart has ${cart.cartItems?.length || 0} items`,
          html: `
            <h2>Hi ${cart.userName || 'there'},</h2>
            <p>You left ${cart.cartItems?.length || 0} items in your cart worth $${(cart.cartValue / 100).toFixed(2)}.</p>
            <p><a href="${process.env.VITE_APP_URL || 'https://talklink.com'}/shop/cart" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Your Purchase</a></p>
            <p>This offer expires in 24 hours.</p>
          `,
        });
        await storage.updateAbandonedCart(cart.id, { recoveryEmail1Sent: new Date() });
        sent++;
      } catch (error) {
        console.error(`Failed to send email 1 to ${cart.userEmail}:`, error);
      }
    }

    // Email 2: After 24 hours
    if (hoursSinceAbandonment >= 24 && !cart.recoveryEmail2Sent) {
      try {
        await sgMail.send({
          to: cart.userEmail,
          from: 'noreply@talklink.com',
          subject: `Last chance! Your cart expires soon`,
          html: `
            <h2>Final reminder, ${cart.userName || 'there'}!</h2>
            <p>Your cart is about to expire. Complete your purchase now!</p>
            <p><a href="${process.env.VITE_APP_URL || 'https://talklink.com'}/shop/cart" style="background: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Checkout Now</a></p>
          `,
        });
        await storage.updateAbandonedCart(cart.id, { recoveryEmail2Sent: new Date() });
        sent++;
      } catch (error) {
        console.error(`Failed to send email 2 to ${cart.userEmail}:`, error);
      }
    }

    // Email 3: After 48 hours
    if (hoursSinceAbandonment >= 48 && !cart.recoveryEmail3Sent) {
      try {
        await sgMail.send({
          to: cart.userEmail,
          from: 'noreply@talklink.com',
          subject: `Hurry! Your cart expires today`,
          html: `
            <h2>${cart.userName || 'Hi there'},</h2>
            <p>Your cart expires TODAY. Don't miss out on these digital products!</p>
            <p><a href="${process.env.VITE_APP_URL || 'https://talklink.com'}/shop/cart" style="background: #f97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Complete Purchase - Last Chance</a></p>
          `,
        });
        await storage.updateAbandonedCart(cart.id, { recoveryEmail3Sent: new Date() });
        sent++;
      } catch (error) {
        console.error(`Failed to send email 3 to ${cart.userEmail}:`, error);
      }
    }
  }

  res.json({ success: true, data: { sent, total: carts.length } });
}));

// Mark cart as recovered
router.post('/:cartId/recover', asyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID required' });
  }

  const cart = await storage.markAbandonedCartRecovered(cartId, orderId);
  res.json({ success: true, data: cart });
}));

export default router;
