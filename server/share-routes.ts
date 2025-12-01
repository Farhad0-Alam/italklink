import { Router } from 'express';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Track social share
router.post('/track', asyncHandler(async (req, res) => {
  const { productId, platform, sharedBy, shareLink, ipAddress } = req.body;

  if (!productId || !platform || !shareLink) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const share = await storage.createSocialShare({
    productId,
    platform,
    sharedBy,
    shareLink,
    ipAddress,
  });

  res.json({ success: true, data: share });
}));

// Get product share stats
router.get('/stats/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const stats = await storage.getProductShareStats(productId);
  const total = await storage.getProductShareCount(productId);

  res.json({ 
    success: true, 
    data: { 
      total,
      byPlatform: stats 
    } 
  });
}));

// Get share count for platform
router.get('/count/:productId/:platform', asyncHandler(async (req, res) => {
  const { productId, platform } = req.params;
  const count = await storage.getProductShareCount(productId, platform);

  res.json({ success: true, data: { count } });
}));

export default router;
