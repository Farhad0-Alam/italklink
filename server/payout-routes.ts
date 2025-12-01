import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Get seller's payout methods
router.get('/methods', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const methods = await storage.getSellerPayoutMethods(userId);
  res.json({ success: true, data: methods });
}));

// Create payout method (Stripe Connect)
router.post('/methods', requireAuth, asyncHandler(async (req, res) => {
  const { stripeConnectAccountId, payoutMethod, accountHolderName, bankCountry, bankCurrency } = req.body;
  const userId = req.user!.id;

  if (!stripeConnectAccountId || !payoutMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const method = await storage.createPayoutMethod({
    sellerId: userId,
    stripeConnectAccountId,
    payoutMethod,
    accountHolderName,
    bankCountry,
    bankCurrency: bankCurrency || 'usd',
  });

  res.json({ success: true, data: method });
}));

// Verify payout method
router.patch('/methods/:methodId/verify', requireAuth, asyncHandler(async (req, res) => {
  const { methodId } = req.params;
  const userId = req.user!.id;

  const method = await storage.getPayoutMethodById(methodId);
  if (!method || method.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const updated = await storage.updatePayoutMethod(methodId, { isVerified: true, stripeConnectStatus: 'active' });
  res.json({ success: true, data: updated });
}));

// Delete payout method
router.delete('/methods/:methodId', requireAuth, asyncHandler(async (req, res) => {
  const { methodId } = req.params;
  const userId = req.user!.id;

  const method = await storage.getPayoutMethodById(methodId);
  if (!method || method.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  await storage.deletePayoutMethod(methodId);
  res.json({ success: true, message: 'Payout method deleted' });
}));

// Get seller's payouts
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const payouts = await storage.getSellerPayouts(userId);
  res.json({ success: true, data: payouts });
}));

// Request payout
router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { minAmount = 5000 } = req.body; // $50 minimum payout

  const method = await storage.getSellerPrimaryPayoutMethod(userId);
  if (!method) {
    return res.status(400).json({ error: 'No verified payout method found' });
  }

  const earnings = await storage.calculateSellerEarnings(userId);
  if (earnings < minAmount) {
    return res.status(400).json({ error: `Minimum payout amount is $${(minAmount / 100).toFixed(2)}` });
  }

  const payout = await storage.createPayout({
    sellerId: userId,
    payoutMethodId: method.id,
    amount: earnings,
    currency: 'usd',
    periodStartDate: new Date(new Date().setDate(1)),
    periodEndDate: new Date(),
  });

  // TODO: Integrate with Stripe Connect to create actual transfer
  res.json({ success: true, data: payout });
}));

// Get payout by ID
router.get('/:payoutId', requireAuth, asyncHandler(async (req, res) => {
  const { payoutId } = req.params;
  const userId = req.user!.id;

  const payout = await storage.getPayoutById(payoutId);
  if (!payout || payout.sellerId !== userId) {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  res.json({ success: true, data: payout });
}));

// Get seller earnings summary
router.get('/earnings/summary', requireAuth, asyncHandler(async (req, res) => {
  const userId = req.user!.id;
  const { startDate, endDate } = req.query;

  const earnings = await storage.calculateSellerEarnings(
    userId,
    startDate ? new Date(startDate as string) : undefined,
    endDate ? new Date(endDate as string) : undefined,
  );

  res.json({ success: true, data: { earnings, formattedAmount: `$${(earnings / 100).toFixed(2)}` } });
}));

export default router;
