import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get product variations
router.get('/product/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const variations = await storage.getProductVariations(productId);
  res.json({ success: true, data: variations });
}));

// Create variation
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { productId, sku, title, price, discountPrice, stock } = req.body;
  const userId = req.user!.id;

  if (!productId || !title || !price) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const product = await storage.getProductById(productId);
  if (!product || product.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const variation = await storage.createVariation({
    productId,
    sku,
    title,
    price,
    discountPrice,
    stock: stock || 0,
  });

  res.json({ success: true, data: variation });
}));

// Update variation
router.patch('/:variationId', requireAuth, asyncHandler(async (req, res) => {
  const { variationId } = req.params;
  const userId = req.user!.id;

  const variation = await storage.getVariationById(variationId);
  if (!variation) return res.status(404).json({ error: 'Variation not found' });

  const product = await storage.getProductById(variation.productId);
  if (!product || product.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updated = await storage.updateVariation(variationId, req.body);
  res.json({ success: true, data: updated });
}));

// Delete variation
router.delete('/:variationId', requireAuth, asyncHandler(async (req, res) => {
  const { variationId } = req.params;
  const userId = req.user!.id;

  const variation = await storage.getVariationById(variationId);
  if (!variation) return res.status(404).json({ error: 'Variation not found' });

  const product = await storage.getProductById(variation.productId);
  if (!product || product.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await storage.deleteVariation(variationId);
  res.json({ success: true, message: 'Variation deleted' });
}));

// Get variant options for product
router.get('/options/product/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const options = await storage.getProductVariantOptions(productId);
  res.json({ success: true, data: options });
}));

// Create variant option
router.post('/options', requireAuth, asyncHandler(async (req, res) => {
  const { productId, name, type, values } = req.body;
  const userId = req.user!.id;

  if (!productId || !name || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const product = await storage.getProductById(productId);
  if (!product || product.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const option = await storage.createVariantOption({
    productId,
    name,
    type,
    values: values || [],
  });

  res.json({ success: true, data: option });
}));

// Delete variant option
router.delete('/options/:optionId', requireAuth, asyncHandler(async (req, res) => {
  const { optionId } = req.params;
  
  await storage.deleteVariantOption(optionId);
  res.json({ success: true, message: 'Option deleted' });
}));

// Get variation attributes
router.get('/:variationId/attributes', asyncHandler(async (req, res) => {
  const { variationId } = req.params;
  const attributes = await storage.getVariationAttributes(variationId);
  res.json({ success: true, data: attributes });
}));

export default router;
