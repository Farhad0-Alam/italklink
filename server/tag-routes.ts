import { Router } from 'express';
import { storage } from './storage';
import { asyncHandler } from './middleware/error-handling';

const router = Router();

// Get all tags (public)
router.get('/', asyncHandler(async (req, res) => {
  const tags = await storage.getAllTags();
  res.json({ success: true, data: tags });
}));

// Get tags for a product
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const tags = await storage.getTagsForProduct(productId);
  res.json({ success: true, data: tags });
}));

export default router;
