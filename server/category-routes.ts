import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get all categories for a seller
router.get('/seller/:sellerId', asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const categories = await storage.getSellerCategories(sellerId);
  res.json({ success: true, data: categories });
}));

// Get category by slug
router.get('/:slug', asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const category = await storage.getCategoryBySlug(slug);
  if (!category) return res.status(404).json({ error: 'Category not found' });
  res.json({ success: true, data: category });
}));

// Create category
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { name, slug, description, icon } = req.body;
  const userId = req.user!.id;

  if (!name || !slug) {
    return res.status(400).json({ error: 'Name and slug required' });
  }

  const category = await storage.createCategory({ name, slug, description, icon }, userId);
  res.json({ success: true, data: category });
}));

// Update category
router.patch('/:categoryId', requireAuth, asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user!.id;

  const category = await storage.getCategoryById(categoryId);
  if (!category || category.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updated = await storage.updateCategory(categoryId, req.body);
  res.json({ success: true, data: updated });
}));

// Delete category
router.delete('/:categoryId', requireAuth, asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const userId = req.user!.id;

  const category = await storage.getCategoryById(categoryId);
  if (!category || category.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await storage.deleteCategory(categoryId);
  res.json({ success: true, message: 'Category deleted' });
}));

// Add product to category
router.post('/:categoryId/products/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { categoryId, productId } = req.params;
  const userId = req.user!.id;

  const category = await storage.getCategoryById(categoryId);
  if (!category || category.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await storage.addProductToCategory(productId, categoryId);
  res.json({ success: true, message: 'Product added to category' });
}));

export default router;
