import { Router } from 'express';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { like, gte, lte, desc, eq, and, or } from 'drizzle-orm';

const router = Router();

// Search products with filters
router.get('/', asyncHandler(async (req, res) => {
  const { q = '', category, minPrice, maxPrice, sort = 'newest', limit = '20', offset = '0' } = req.query;

  const products = await storage.searchProducts({
    query: q as string,
    category: category as string,
    minPrice: minPrice ? parseInt(minPrice as string) : undefined,
    maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
    sortBy: sort as string,
    limit: parseInt(limit as string),
    offset: parseInt(offset as string),
  });

  res.json({
    success: true,
    data: products,
  });
}));

// Get unique categories
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await storage.getProductCategories();
  
  res.json({
    success: true,
    data: categories,
  });
}));

// Get price range
router.get('/price-range', asyncHandler(async (req, res) => {
  const range = await storage.getProductPriceRange();
  
  res.json({
    success: true,
    data: range,
  });
}));

// Search suggestions
router.get('/suggestions', asyncHandler(async (req, res) => {
  const { q = '' } = req.query;
  
  if (!q || (q as string).length < 2) {
    return res.json({ success: true, data: [] });
  }

  const suggestions = await storage.getSearchSuggestions(q as string);
  
  res.json({
    success: true,
    data: suggestions,
  });
}));

export default router;
