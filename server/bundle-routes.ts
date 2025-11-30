import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get all bundles (public)
router.get('/', asyncHandler(async (req, res) => {
  const bundles = await storage.getActiveBundles();
  res.json({ success: true, data: bundles });
}));

// Get bundle by ID
router.get('/:bundleId', asyncHandler(async (req, res) => {
  const { bundleId } = req.params;
  const bundle = await storage.getBundleById(bundleId);
  
  if (!bundle) {
    return res.status(404).json({ error: 'Bundle not found' });
  }

  const items = await storage.getBundleItems(bundleId);
  res.json({ success: true, data: { ...bundle, items } });
}));

// Get seller's bundles
router.get('/seller/:sellerId', asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const bundles = await storage.getSellerBundles(sellerId);
  res.json({ success: true, data: bundles });
}));

// Create bundle (seller only)
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const { title, description, slug, bundlePrice, discountPercentage, productIds } = req.body;
  const userId = req.user!.id;

  if (!title || !slug || !bundlePrice || !productIds?.length) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Get products to calculate original price
  let originalPrice = 0;
  for (const productId of productIds) {
    const product = await storage.getProductById(productId);
    if (product) originalPrice += product.price || 0;
  }

  const bundle = await storage.createBundle({
    sellerId: userId,
    title,
    description,
    slug,
    originalPrice,
    bundlePrice,
    discountPercentage,
  }, productIds);

  res.json({ success: true, data: bundle });
}));

// Update bundle
router.patch('/:bundleId', requireAuth, asyncHandler(async (req, res) => {
  const { bundleId } = req.params;
  const { title, description, bundlePrice, discountPercentage } = req.body;
  const userId = req.user!.id;

  const bundle = await storage.getBundleById(bundleId);
  if (!bundle || bundle.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updated = await storage.updateBundle(bundleId, {
    title,
    description,
    bundlePrice,
    discountPercentage,
  });

  res.json({ success: true, data: updated });
}));

// Delete bundle
router.delete('/:bundleId', requireAuth, asyncHandler(async (req, res) => {
  const { bundleId } = req.params;
  const userId = req.user!.id;

  const bundle = await storage.getBundleById(bundleId);
  if (!bundle || bundle.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await storage.deleteBundle(bundleId);
  res.json({ success: true, message: 'Bundle deleted' });
}));

export default router;
