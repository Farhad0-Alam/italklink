import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { insertShopReviewSchema } from '@shared/schema';

const router = Router();

// Get reviews for a product
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = '10', offset = '0' } = req.query;
  
  const reviews = await storage.getProductReviews(productId, {
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });
  
  const stats = await storage.getProductReviewStats(productId);
  
  res.json({
    success: true,
    data: {
      reviews,
      stats,
    },
  });
}));

// Create review
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const validation = insertShopReviewSchema.safeParse(req.body);
  
  if (!validation.success) {
    return res.status(400).json({ error: 'Invalid review data' });
  }
  
  // Check if user already reviewed this product
  const existingReview = await storage.getUserProductReview(req.user.id, validation.data.productId);
  if (existingReview) {
    return res.status(409).json({ error: 'You have already reviewed this product' });
  }
  
  // Verify purchase
  const order = await storage.getShopOrder(validation.data.orderId);
  if (!order || order.buyerId !== req.user.id) {
    return res.status(403).json({ error: 'You can only review products you have purchased' });
  }
  
  const review = await storage.createShopReview({
    ...validation.data,
    buyerId: req.user.id,
  });
  
  res.json({
    success: true,
    data: review,
  });
}));

// Update review (seller response)
router.patch('/:reviewId', requireAuth, asyncHandler(async (req, res) => {
  const { reviewId } = req.params;
  const { sellerResponse } = req.body;
  
  if (!sellerResponse) {
    return res.status(400).json({ error: 'Seller response required' });
  }
  
  const review = await storage.getShopReview(reviewId);
  if (!review) {
    return res.status(404).json({ error: 'Review not found' });
  }
  
  // Verify user is the seller
  const product = await storage.getDigitalProduct(review.productId);
  if (!product || product.sellerId !== req.user.id) {
    return res.status(403).json({ error: 'Only seller can respond to reviews' });
  }
  
  const updated = await storage.updateShopReview(reviewId, {
    sellerResponse,
    sellerResponseAt: new Date(),
  });
  
  res.json({
    success: true,
    data: updated,
  });
}));

export default router;
