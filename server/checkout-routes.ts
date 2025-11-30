import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import Stripe from 'stripe';
import { nanoid } from 'nanoid';

const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
});

// Create checkout session
router.post('/checkout', requireAuth, asyncHandler(async (req, res) => {
  const { items, total } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  try {
    // Fetch products
    const products = await Promise.all(
      items.map(item => storage.getDigitalProduct(item.productId))
    );

    // Create line items for Stripe
    const lineItems = items.map((item, index) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: products[index]?.title || 'Product',
          description: products[index]?.shortDescription,
        },
        unit_amount: products[index]?.price || 0,
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.VITE_APP_URL || 'http://localhost:5000'}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_APP_URL || 'http://localhost:5000'}/cart`,
      metadata: {
        userId: req.user.id,
        itemCount: items.length.toString(),
      },
    });

    res.json({
      success: true,
      data: {
        checkoutUrl: session.url,
        sessionId: session.id,
      },
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
}));

// Handle Stripe webhook
router.post('/webhook', asyncHandler(async (req, res) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Payment completed:', session.id);

    // Create order in database
    try {
      const cart = await storage.getCart(session.metadata?.userId || '');
      
      for (const item of cart) {
        const downloadToken = nanoid();
        const itemPrice = item.product.price * item.quantity;
        
        const order = await storage.createShopOrder({
          productId: item.productId,
          sellerId: item.product.sellerId,
          buyerId: session.metadata?.userId,
          buyerEmail: session.customer_email || '',
          buyerName: session.customer_details?.name,
          amount: itemPrice,
          sellerAmount: Math.round(itemPrice * 0.5),
          commissionAmount: Math.round(itemPrice * 0.2),
          stripeSessionId: session.id,
          downloadToken,
          paymentStatus: 'completed',
        } as any);

        console.log('Order created:', order.id);
      }

      // Clear cart
      await storage.clearCart(session.metadata?.userId || '');
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  }

  res.json({ received: true });
}));

export default router;
