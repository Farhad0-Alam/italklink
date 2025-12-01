import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get all available subscription plans
router.get('/plans', asyncHandler(async (req, res) => {
  const plans = await storage.getAllSubscriptionPlans();
  res.json({ success: true, data: plans });
}));

// Get seller's current subscription
router.get('/my-subscription', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const subscription = await storage.getSellerSubscription(userId);
  
  if (!subscription) {
    return res.json({ success: true, data: null });
  }

  res.json({ success: true, data: subscription });
}));

// Subscribe to a plan
router.post('/subscribe', requireAuth, asyncHandler(async (req, res) => {
  const { planId, billingCycle } = req.body;
  const userId = req.user!.id;

  if (!planId) {
    return res.status(400).json({ error: 'Plan ID required' });
  }

  const plan = await storage.getSubscriptionPlanById(planId);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }

  const subscription = await storage.createSellerSubscription({
    sellerId: userId,
    planId,
    billingCycle: billingCycle || 'monthly',
  });

  res.json({ success: true, data: subscription });
}));

// Upgrade/change plan
router.patch('/upgrade', requireAuth, asyncHandler(async (req, res) => {
  const { planId } = req.body;
  const userId = req.user!.id;

  if (!planId) {
    return res.status(400).json({ error: 'Plan ID required' });
  }

  const currentSub = await storage.getSellerSubscription(userId);
  if (!currentSub) {
    return res.status(404).json({ error: 'No active subscription' });
  }

  const updated = await storage.updateSellerSubscription(currentSub.id, { planId });
  res.json({ success: true, data: updated });
}));

// Cancel subscription
router.post('/cancel', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  
  const currentSub = await storage.getSellerSubscription(userId);
  if (!currentSub) {
    return res.status(404).json({ error: 'No active subscription' });
  }

  const canceled = await storage.cancelSellerSubscription(currentSub.id);
  res.json({ success: true, data: canceled });
}));

export default router;
