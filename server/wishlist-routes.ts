import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get user's wishlist
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const wishlist = await storage.getUserWishlist(req.user.id);
  
  res.json({
    success: true,
    data: wishlist,
  });
}));

// Add to wishlist
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { productId, notes } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }
  
  const existing = await storage.getWishlistItem(req.user.id, productId);
  if (existing) {
    return res.status(409).json({ error: 'Product already in wishlist' });
  }
  
  const item = await storage.addToWishlist(req.user.id, {
    productId,
    notes: notes || undefined,
  });
  
  res.json({
    success: true,
    data: item,
  });
}));

// Remove from wishlist
router.delete('/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  await storage.removeFromWishlist(req.user.id, productId);
  
  res.json({
    success: true,
  });
}));

// Update wishlist item notes
router.patch('/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { notes } = req.body;
  
  const item = await storage.updateWishlistItem(req.user.id, productId, { notes });
  
  res.json({
    success: true,
    data: item,
  });
}));

// Check if product is in wishlist
router.get('/check/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  
  const item = await storage.getWishlistItem(req.user.id, productId);
  
  res.json({
    success: true,
    inWishlist: !!item,
  });
}));

export default router;
