import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get seller's analytics dashboard
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const analytics = await storage.getSellerAnalytics(req.user.id);
  
  res.json({
    success: true,
    data: analytics,
  });
}));

// Get sales by date range
router.get('/sales/:dateRange', requireAuth, asyncHandler(async (req, res) => {
  const { dateRange } = req.params; // 7d, 30d, 90d, 1y
  
  const sales = await storage.getSellerSalesByDateRange(req.user.id, dateRange);
  
  res.json({
    success: true,
    data: sales,
  });
}));

// Get top products
router.get('/top-products', requireAuth, asyncHandler(async (req, res) => {
  const products = await storage.getSellerTopProducts(req.user.id, 10);
  
  res.json({
    success: true,
    data: products,
  });
}));

// Get revenue breakdown
router.get('/revenue', requireAuth, asyncHandler(async (req, res) => {
  const revenue = await storage.getSellerRevenueBreakdown(req.user.id);
  
  res.json({
    success: true,
    data: revenue,
  });
}));

// Get customer insights
router.get('/customers', requireAuth, asyncHandler(async (req, res) => {
  const insights = await storage.getSellerCustomerInsights(req.user.id);
  
  res.json({
    success: true,
    data: insights,
  });
}));

export default router;
