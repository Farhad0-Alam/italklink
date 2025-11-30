import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get buyer's order history
router.get('/buyer', requireAuth, asyncHandler(async (req, res) => {
  const { limit = '20', offset = '0' } = req.query;
  
  const orders = await storage.getBuyerOrders(req.user.id, {
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });
  
  const total = await storage.getBuyerOrderCount(req.user.id);
  
  res.json({
    success: true,
    data: {
      orders,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    },
  });
}));

// Get seller's orders
router.get('/seller', requireAuth, asyncHandler(async (req, res) => {
  const { limit = '20', offset = '0', status } = req.query;
  
  const orders = await storage.getSellerOrders(req.user.id, {
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
    status: status as string,
  });
  
  const total = await storage.getSellerOrderCount(req.user.id);
  
  res.json({
    success: true,
    data: {
      orders,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    },
  });
}));

// Get order details
router.get('/:orderId', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const order = await storage.getShopOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  res.json({
    success: true,
    data: order,
  });
}));

// Generate invoice
router.get('/:orderId/invoice', asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  
  const order = await storage.getShopOrder(orderId);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }
  
  const product = await storage.getDigitalProduct(order.productId);
  
  const invoice = {
    orderId: order.id,
    productName: product?.title,
    productPrice: order.amount,
    buyerName: order.buyerName,
    buyerEmail: order.buyerEmail,
    sellerAmount: order.sellerAmount,
    platformCommission: order.commissionAmount,
    createdAt: order.createdAt,
  };
  
  res.json({
    success: true,
    data: invoice,
  });
}));

export default router;
