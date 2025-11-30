import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { z } from 'zod';

const router = Router();

// Create refund request (buyer only)
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const userId = req.user!.id;
  
  if (!orderId || !reason) {
    return res.status(400).json({ error: 'Order ID and reason required' });
  }
  
  const order = await storage.getOrderById(orderId);
  if (!order || order.buyerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  if (order.paymentStatus !== 'completed') {
    return res.status(400).json({ error: 'Only completed orders can be refunded' });
  }

  const refund = await storage.createRefundRequest({
    orderId,
    buyerId: userId,
    sellerId: order.sellerId,
    reason,
    status: 'requested',
  });
  
  res.json({ success: true, data: refund });
}));

// Get refund requests (buyer/seller/admin)
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { status, orderId } = req.query;
  const userId = req.user!.id;
  
  let refunds = await storage.getRefundRequests(
    status as string,
    orderId as string,
    userId,
    req.user!.role
  );
  
  res.json({ success: true, data: refunds });
}));

// Get single refund
router.get('/:refundId', requireAuth, asyncHandler(async (req, res) => {
  const { refundId } = req.params;
  
  const refund = await storage.getRefundById(refundId);
  if (!refund) {
    return res.status(404).json({ error: 'Refund not found' });
  }
  
  // Check authorization
  if (
    req.user!.id !== refund.buyerId &&
    req.user!.id !== refund.sellerId &&
    req.user!.role !== 'admin'
  ) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  res.json({ success: true, data: refund });
}));

// Approve refund (seller or admin)
router.post('/:refundId/approve', requireAuth, asyncHandler(async (req, res) => {
  const { refundId } = req.params;
  
  const refund = await storage.getRefundById(refundId);
  if (!refund) {
    return res.status(404).json({ error: 'Refund not found' });
  }
  
  // Only seller or admin can approve
  if (req.user!.id !== refund.sellerId && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  await storage.updateRefundStatus(refundId, 'approved');
  
  res.json({ success: true, message: 'Refund approved' });
}));

// Reject refund (seller or admin)
router.post('/:refundId/reject', requireAuth, asyncHandler(async (req, res) => {
  const { refundId } = req.params;
  const { reason } = req.body;
  
  const refund = await storage.getRefundById(refundId);
  if (!refund) {
    return res.status(404).json({ error: 'Refund not found' });
  }
  
  // Only seller or admin can reject
  if (req.user!.id !== refund.sellerId && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  await storage.updateRefundStatus(refundId, 'rejected', reason);
  
  res.json({ success: true, message: 'Refund rejected' });
}));

// Process refund (admin only - integrates with Stripe)
router.post('/:refundId/process', requireAuth, asyncHandler(async (req, res) => {
  if (req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Admin only' });
  }
  
  const { refundId } = req.params;
  
  const refund = await storage.getRefundById(refundId);
  if (!refund || refund.status !== 'approved') {
    return res.status(400).json({ error: 'Refund must be approved first' });
  }
  
  // Process refund through Stripe
  const stripeRefundId = await storage.processStripeRefund(
    refund.orderId,
    refund.amount
  );
  
  await storage.updateRefundStatus(refundId, 'processed', undefined, stripeRefundId);
  
  res.json({ success: true, message: 'Refund processed', stripeRefundId });
}));

// Cancel refund request
router.post('/:refundId/cancel', requireAuth, asyncHandler(async (req, res) => {
  const { refundId } = req.params;
  
  const refund = await storage.getRefundById(refundId);
  if (!refund) {
    return res.status(404).json({ error: 'Refund not found' });
  }
  
  // Only buyer can cancel
  if (req.user!.id !== refund.buyerId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  if (refund.status !== 'requested') {
    return res.status(400).json({ error: 'Can only cancel requested refunds' });
  }
  
  await storage.updateRefundStatus(refundId, 'cancelled');
  
  res.json({ success: true, message: 'Refund cancelled' });
}));

export default router;
