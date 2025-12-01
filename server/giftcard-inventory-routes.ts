import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Generate gift card (seller only)
router.post('/create', requireAuth, asyncHandler(async (req, res) => {
  const { amount, senderName, recipientEmail, message } = req.body;
  const sellerId = req.user!.id;

  if (!amount || amount < 100) {
    return res.status(400).json({ error: 'Minimum gift card amount is $1.00' });
  }

  const code = `GC-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  const gift = await storage.createGiftCard({
    code,
    amount,
    createdBy: sellerId,
    senderName,
    recipientEmail,
    message,
    expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  res.json({ success: true, data: gift });
}));

// Redeem gift card
router.post('/redeem', requireAuth, asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.user!.id;

  if (!code) {
    return res.status(400).json({ error: 'Gift card code required' });
  }

  const gift = await storage.getGiftCardByCode(code);
  if (!gift) {
    return res.status(404).json({ error: 'Invalid gift card code' });
  }

  if (gift.status !== 'active') {
    return res.status(400).json({ error: 'Gift card is no longer active' });
  }

  if (gift.expiresAt && new Date(gift.expiresAt) < new Date()) {
    return res.status(400).json({ error: 'Gift card has expired' });
  }

  const redeemed = await storage.redeemGiftCard(code, userId);
  res.json({ success: true, data: redeemed, message: `$${(redeemed.remainingBalance / 100).toFixed(2)} credit applied!` });
}));

// Get seller's gift cards
router.get('/my-cards', requireAuth, asyncHandler(async (req, res) => {
  const sellerId = req.user!.id;
  const cards = await storage.getSellerGiftCards(sellerId);
  res.json({ success: true, data: cards });
}));

// Get product inventory
router.get('/inventory/:productId', asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const inv = await storage.getProductInventory(productId);
  res.json({ success: true, data: inv || null });
}));

// Update inventory (seller only)
router.patch('/inventory/:productId', requireAuth, asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { totalStock, lowStockThreshold } = req.body;

  let inv = await storage.getProductInventory(productId);
  if (!inv) {
    inv = await storage.createProductInventory({
      productId,
      totalStock: totalStock || 0,
      lowStockThreshold: lowStockThreshold || 5,
    });
  } else {
    const isLowStock = totalStock && totalStock <= (lowStockThreshold || inv.lowStockThreshold);
    inv = await storage.updateProductInventory(inv.id, {
      totalStock: totalStock !== undefined ? totalStock : inv.totalStock,
      remainingStock: totalStock !== undefined ? totalStock : inv.remainingStock,
      lowStockThreshold: lowStockThreshold || inv.lowStockThreshold,
      isLowStock,
    });
  }

  res.json({ success: true, data: inv });
}));

// Get low stock products (admin only)
router.get('/admin/low-stock', requireAuth, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  const products = await storage.getLowStockProducts();
  res.json({ success: true, data: products });
}));

export default router;
