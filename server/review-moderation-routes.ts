import { Router, RequestHandler } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Admin-only middleware
const isAdmin: RequestHandler = (req, res, next) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// Get all pending reviews (admin only)
router.get('/pending', requireAuth, isAdmin, asyncHandler(async (req, res) => {
  const reviews = await storage.getPendingReviews();
  res.json({ success: true, data: reviews });
}));

// Approve a review (admin only)
router.post('/:reviewId/approve', requireAuth, isAdmin, asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const adminId = req.user!.id;

  const review = await storage.approveReview(reviewId, adminId);
  res.json({ success: true, data: review });
}));

// Reject a review (admin only)
router.post('/:reviewId/reject', requireAuth, isAdmin, asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reason } = req.body;
  const adminId = req.user!.id;

  if (!reason) {
    return res.status(400).json({ error: 'Rejection reason required' });
  }

  const review = await storage.rejectReview(reviewId, adminId, reason);
  res.json({ success: true, data: review });
}));

// Flag review as suspicious (admin only)
router.post('/:reviewId/flag', requireAuth, isAdmin, asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { reason } = req.body;

  if (!reason) {
    return res.status(400).json({ error: 'Flag reason required' });
  }

  const review = await storage.flagReview(reviewId, reason);
  res.json({ success: true, data: review });
}));

// Get all reviews for a product
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const reviews = await storage.getAllReviewsForProduct(productId);
  
  // Only show approved reviews to public, pending/rejected only to admin
  const isAdmin = req.user?.role === 'admin' || req.user?.role === 'super_admin';
  const filteredReviews = isAdmin ? reviews : reviews.filter(r => r.status === 'approved');
  
  res.json({ success: true, data: filteredReviews });
}));

export default router;
