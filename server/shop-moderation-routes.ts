import { Router } from 'express';
import { requireAuth, requireAdmin } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get pending products for moderation (admin only)
router.get('/queue', requireAdmin, asyncHandler(async (req, res) => {
  const pendingProducts = await storage.getPendingProducts();
  
  res.json({
    success: true,
    data: pendingProducts,
  });
}));

// Get all products with moderation status (admin only)
router.get('/all', requireAdmin, asyncHandler(async (req, res) => {
  const { status, sort = 'newest' } = req.query;
  
  const products = await storage.getAllProductsForModeration(status as string, sort as string);
  
  res.json({
    success: true,
    data: products,
  });
}));

// Approve a product (admin only)
router.post('/:productId/approve', requireAdmin, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { notes } = req.body;
  
  await storage.updateProductModeration(productId, 'approved', notes);
  
  res.json({
    success: true,
    message: 'Product approved',
  });
}));

// Reject a product (admin only)
router.post('/:productId/reject', requireAdmin, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { reason } = req.body;
  
  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason required' });
  }
  
  await storage.updateProductModeration(productId, 'rejected', reason);
  
  res.json({
    success: true,
    message: 'Product rejected',
  });
}));

// Get moderation stats (admin only)
router.get('/stats', requireAdmin, asyncHandler(async (req, res) => {
  const stats = await storage.getModerationStats();
  
  res.json({
    success: true,
    data: stats,
  });
}));

// Get seller's moderation history (seller/admin)
router.get('/seller/:sellerId', asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const userId = req.user?.id;
  
  // Only admin or the seller themselves can view
  if (userId !== sellerId && !req.user?.isAdmin) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  const history = await storage.getSellerModerationHistory(sellerId);
  
  res.json({
    success: true,
    data: history,
  });
}));

export default router;
