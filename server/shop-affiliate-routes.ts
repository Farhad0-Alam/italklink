import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { nanoid } from 'nanoid';

const router = Router();

// Get affiliate dashboard
router.get('/dashboard', requireAuth, asyncHandler(async (req, res) => {
  const dashboard = await storage.getAffiliateCommissionDashboard(req.user.id);
  
  res.json({
    success: true,
    data: dashboard,
  });
}));

// Generate affiliate link for product
router.post('/generate-link', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.body;
  
  if (!productId) {
    return res.status(400).json({ error: 'Product ID required' });
  }
  
  const product = await storage.getProductById(productId);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  
  // Generate unique affiliate code
  const affiliateCode = `${req.user.id.slice(0, 8)}_${nanoid(6)}`.toUpperCase();
  const affiliateLink = `/product/${product.slug}?aff=${affiliateCode}`;
  
  res.json({
    success: true,
    data: {
      affiliateCode,
      affiliateLink,
      shareUrl: `${process.env.REPLIT_DEPLOYMENT_URL || 'http://localhost:5000'}${affiliateLink}`,
    },
  });
}));

// Get commission breakdown for affiliate
router.get('/breakdown', requireAuth, asyncHandler(async (req, res) => {
  const breakdown = await storage.getAffiliateCommissionBreakdown(req.user.id);
  
  res.json({
    success: true,
    data: breakdown,
  });
}));

// Get affiliate commission history
router.get('/history', requireAuth, asyncHandler(async (req, res) => {
  const history = await storage.getAffiliateCommissionHistory(req.user.id);
  
  res.json({
    success: true,
    data: history,
  });
}));

export default router;
