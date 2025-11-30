import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { z } from 'zod';

const router = Router();

// Validate coupon code
router.post('/validate', asyncHandler(async (req, res) => {
  const { code } = req.body;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code required' });
  }
  
  const coupon = await storage.validateCoupon(code, req.user?.id || null);
  
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }
  
  res.json({
    success: true,
    data: coupon,
  });
}));

// Apply coupon to order (calculate discount)
router.post('/apply', asyncHandler(async (req, res) => {
  const { code, amount } = req.body;
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Coupon code required' });
  }
  
  if (!amount || amount < 0) {
    return res.status(400).json({ error: 'Valid amount required' });
  }
  
  const coupon = await storage.validateCoupon(code, req.user?.id || null);
  if (!coupon) {
    return res.status(404).json({ error: 'Invalid or expired coupon code' });
  }
  
  // Calculate discount
  let discount = 0;
  if (coupon.discountType === 'percentage') {
    discount = Math.floor((amount * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount) {
      discount = Math.min(discount, coupon.maxDiscountAmount);
    }
  } else {
    discount = coupon.discountValue;
  }
  
  // Check minimum order
  if (coupon.minimumOrderAmount && amount < coupon.minimumOrderAmount) {
    return res.status(400).json({ 
      error: `Minimum order amount of $${(coupon.minimumOrderAmount / 100).toFixed(2)} required` 
    });
  }
  
  const finalAmount = Math.max(0, amount - discount);
  
  res.json({
    success: true,
    data: {
      originalAmount: amount,
      discount,
      finalAmount,
      couponCode: code,
    },
  });
}));

export default router;
