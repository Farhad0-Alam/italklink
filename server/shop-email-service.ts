import sgMail from '@sendgrid/mail';
import { storage } from './storage';

const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      console.log('SendGrid API key not configured, skipping email');
      return true;
    }

    sgMail.setApiKey(apiKey);
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@talklink.app',
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
};

export const shopEmailService = {
  async sendPurchaseConfirmation(orderId: string) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;

    const product = await storage.getProductById(order.productId);
    if (!product) return;

    const html = `
      <h2>Purchase Confirmation</h2>
      <p>Thank you for your purchase!</p>
      <p><strong>Order Details:</strong></p>
      <ul>
        <li>Order ID: ${order.id}</li>
        <li>Product: ${product.title}</li>
        <li>Amount: $${(order.amount / 100).toFixed(2)}</li>
        <li>Date: ${new Date(order.createdAt!).toLocaleDateString()}</li>
      </ul>
      <p>Your download link has been sent to your email. You can access it immediately.</p>
      <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}/shop/purchases" 
         style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
        View Your Purchases
      </a>
    `;

    await sendEmail(
      order.buyerEmail,
      `Purchase Confirmation - ${product.title}`,
      html
    );
  },

  async sendDownloadLink(orderId: string, downloadToken: string) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;

    const product = await storage.getProductById(order.productId);
    if (!product) return;

    const downloadUrl = `${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}/downloads/${downloadToken}`;

    const html = `
      <h2>Your Download is Ready!</h2>
      <p>Thank you for your purchase of <strong>${product.title}</strong>.</p>
      <p>Click the button below to download your file:</p>
      <a href="${downloadUrl}" 
         style="background: #10b981; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; display: inline-block;">
        Download File
      </a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        This link will expire in 30 days. You can download the file up to 5 times.
      </p>
    `;

    await sendEmail(
      order.buyerEmail,
      `Download Available - ${product.title}`,
      html
    );
  },

  async sendOrderUpdate(orderId: string, status: string) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;

    const product = await storage.getProductById(order.productId);
    if (!product) return;

    const statusMessages: Record<string, string> = {
      completed: 'Your payment has been confirmed and your download is ready!',
      pending: 'We have received your order and are processing payment.',
      failed: 'Payment processing failed. Please try again or contact support.',
      refunded: 'Your refund has been processed. You will see it in your account within 3-5 business days.',
    };

    const html = `
      <h2>Order Status Update</h2>
      <p>Order #${order.id}</p>
      <p><strong>Status:</strong> ${status.toUpperCase()}</p>
      <p>${statusMessages[status] || 'Your order status has been updated.'}</p>
      <p>
        <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}/shop/purchases" 
           style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          View Order Details
        </a>
      </p>
    `;

    await sendEmail(
      order.buyerEmail,
      `Order Status Update - ${product.title}`,
      html
    );
  },

  async sendSellerNotification(orderId: string) {
    const order = await storage.getOrderById(orderId);
    if (!order) return;

    const product = await storage.getProductById(order.productId);
    if (!product) return;

    const seller = await storage.getUser(order.sellerId);
    if (!seller) return;

    const html = `
      <h2>New Sale!</h2>
      <p>You have a new purchase on TalkLink.</p>
      <p><strong>Sale Details:</strong></p>
      <ul>
        <li>Product: ${product.title}</li>
        <li>Buyer Email: ${order.buyerEmail}</li>
        <li>Amount: $${(order.amount / 100).toFixed(2)}</li>
        <li>Your Earnings: $${(order.sellerAmount / 100).toFixed(2)}</li>
        <li>Date: ${new Date(order.createdAt!).toLocaleDateString()}</li>
      </ul>
      <p>
        <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}/shop/seller" 
           style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          View Seller Dashboard
        </a>
      </p>
    `;

    await sendEmail(
      seller.email || '',
      `New Sale - ${product.title}`,
      html
    );
  },

  async sendLowStockAlert(productId: string) {
    const product = await storage.getProductById(productId);
    if (!product) return;

    const seller = await storage.getUser(product.sellerId);
    if (!seller) return;

    const html = `
      <h2>Low Stock Alert</h2>
      <p>Your product is running low in inventory.</p>
      <p><strong>Product:</strong> ${product.title}</p>
      <p><strong>Current Views This Month:</strong> ${product.views || 0}</p>
      <p><strong>Current Sales This Month:</strong> ${product.purchases || 0}</p>
      <p>
        <a href="${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}/shop/seller/products" 
           style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
          Manage Products
        </a>
      </p>
    `;

    await sendEmail(
      seller.email || '',
      `Low Stock Alert - ${product.title}`,
      html
    );
  },
};
