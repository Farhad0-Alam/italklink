import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Admin-only middleware check
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get commission settings
router.get('/settings', asyncHandler(async (req, res) => {
  const settings = await storage.getCommissionSettings();
  res.json({ success: true, data: settings || { sellerPercentage: 50, affiliatePercentage: 30, platformPercentage: 20 } });
}));

// Update commission settings (admin)
router.patch('/settings', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { sellerPercentage, affiliatePercentage, platformPercentage } = req.body;
  
  if (!sellerPercentage || !affiliatePercentage || !platformPercentage) {
    return res.status(400).json({ error: 'All percentages required' });
  }
  
  if (sellerPercentage + affiliatePercentage + platformPercentage !== 100) {
    return res.status(400).json({ error: 'Commission percentages must sum to 100%' });
  }

  const settings = await storage.updateCommissionSettings({
    sellerPercentage,
    affiliatePercentage,
    platformPercentage,
  });

  res.json({ success: true, data: settings });
}));

// Get all category commission rates
router.get('/categories', asyncHandler(async (req, res) => {
  const rates = await storage.getAllCategoryCommissionRates();
  res.json({ success: true, data: rates });
}));

// Create category commission rate (admin)
router.post('/categories', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { categoryId, sellerPercentage, affiliatePercentage, platformPercentage } = req.body;
  
  if (!categoryId || !sellerPercentage || !affiliatePercentage || !platformPercentage) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (sellerPercentage + affiliatePercentage + platformPercentage !== 100) {
    return res.status(400).json({ error: 'Commission percentages must sum to 100%' });
  }

  const rate = await storage.createCategoryCommissionRate({
    categoryId,
    sellerPercentage,
    affiliatePercentage,
    platformPercentage,
  });

  res.json({ success: true, data: rate });
}));

// Update category commission rate (admin)
router.patch('/categories/:rateId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { rateId } = req.params;
  const { sellerPercentage, affiliatePercentage, platformPercentage } = req.body;

  if (sellerPercentage + affiliatePercentage + platformPercentage !== 100) {
    return res.status(400).json({ error: 'Commission percentages must sum to 100%' });
  }

  const rate = await storage.updateCategoryCommissionRate(rateId, {
    sellerPercentage,
    affiliatePercentage,
    platformPercentage,
  });

  res.json({ success: true, data: rate });
}));

// Delete category commission rate (admin)
router.delete('/categories/:rateId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { rateId } = req.params;
  await storage.deleteCategoryCommissionRate(rateId);
  res.json({ success: true, message: 'Commission rate deleted' });
}));

// Get all promotional rates
router.get('/promotions', asyncHandler(async (req, res) => {
  const rates = await storage.getAllPromotionalRates();
  res.json({ success: true, data: rates });
}));

// Create promotional rate (admin)
router.post('/promotions', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { name, description, sellerPercentage, affiliatePercentage, platformPercentage, categoryId, startDate, endDate } = req.body;
  
  if (!name || !sellerPercentage || !affiliatePercentage || !platformPercentage || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  if (sellerPercentage + affiliatePercentage + platformPercentage !== 100) {
    return res.status(400).json({ error: 'Commission percentages must sum to 100%' });
  }

  const rate = await storage.createPromotionalRate({
    name,
    description,
    sellerPercentage,
    affiliatePercentage,
    platformPercentage,
    categoryId,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
  });

  res.json({ success: true, data: rate });
}));

// Update promotional rate (admin)
router.patch('/promotions/:rateId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { rateId } = req.params;
  const { sellerPercentage, affiliatePercentage, platformPercentage } = req.body;

  if (sellerPercentage + affiliatePercentage + platformPercentage !== 100) {
    return res.status(400).json({ error: 'Commission percentages must sum to 100%' });
  }

  const rate = await storage.updatePromotionalRate(rateId, { ...req.body });
  res.json({ success: true, data: rate });
}));

// Delete promotional rate (admin)
router.delete('/promotions/:rateId', requireAuth, requireAdmin, asyncHandler(async (req, res) => {
  const { rateId } = req.params;
  await storage.deletePromotionalRate(rateId);
  res.json({ success: true, message: 'Promotional rate deleted' });
}));

export default router;
