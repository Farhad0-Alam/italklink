import { Router } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { requireAuth, requireAdmin } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { z } from 'zod';

const stripeKey = process.env.STRIPE_SECRET_KEY || process.env.TESTING_STRIPE_SECRET_KEY;

if (!stripeKey) {
  console.warn('⚠️  Billing routes: Stripe not configured - using mock mode');
}

const stripe = stripeKey ? new Stripe(stripeKey, {
  apiVersion: '2024-11-20.acacia',
}) : null as any;

const router = Router();

const createPlanSchema = z.object({
  name: z.string().min(1),
  planType: z.string(),
  price: z.number().int().min(0),
  currency: z.string().default('USD'),
  frequency: z.string(),
  discount: z.number().int().min(0).max(100).default(0),
  businessCardsLimit: z.number().int().min(0).default(1),
  cardLabel: z.string().optional(),
  trialDays: z.number().int().min(0).default(0),
  features: z.array(z.number()).default([]),
  templates: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  stripePriceId: z.string().optional(),
  extraCardOptions: z.array(z.any()).default([]),
  hasUnlimitedOption: z.boolean().default(false),
  unlimitedPrice: z.number().int().min(0).default(0),
  templateLimit: z.number().int().default(-1),
  description: z.string().optional(),
  baseUsers: z.number().int().min(1).default(1),
  pricePerUser: z.number().int().min(0).default(0),
  setupFee: z.number().int().min(0).default(0),
  allowUserSelection: z.boolean().default(false),
  minUsers: z.number().int().min(1).default(1),
  maxUsers: z.number().int().nullable().optional(),
});

const createCouponSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(['percentage', 'fixed']),
  discountValue: z.number().min(0),
  description: z.string().optional(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional(),
  maxUses: z.number().int().min(0).optional(),
  usesPerUser: z.number().int().min(0).optional(),
  minOrderAmount: z.number().int().min(0).optional(),
  applicablePlans: z.array(z.number()).optional(),
  isActive: z.boolean().default(true),
});

const validateCouponSchema = z.object({
  code: z.string().min(1),
  planId: z.number().int(),
  userCount: z.number().int().min(1),
});

const createCheckoutSchema = z.object({
  planId: z.number().int(),
  userCount: z.number().int().min(1),
  couponCode: z.string().optional(),
  isYearly: z.boolean().default(false),
});

router.post('/admin/plans', requireAdmin, asyncHandler(async (req, res) => {
  const planData = createPlanSchema.parse(req.body);
  const plan = await storage.createPlan(planData);
  res.json({ success: true, data: plan });
}));

router.put('/admin/plans/:id', requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const planData = createPlanSchema.partial().parse(req.body);
  const plan = await storage.updatePlan(id, planData);
  res.json({ success: true, data: plan });
}));

router.get('/admin/plans', requireAdmin, asyncHandler(async (req, res) => {
  const plans = await storage.getPlans();
  res.json({ success: true, data: plans });
}));

router.delete('/admin/plans/:id', requireAdmin, asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  await storage.deletePlan(id);
  res.json({ success: true, message: 'Plan deleted successfully' });
}));

router.post('/admin/coupons', requireAdmin, asyncHandler(async (req, res) => {
  const couponData = createCouponSchema.parse(req.body);
  const coupon = await storage.createCoupon({
    ...couponData,
    usedCount: 0,
  });
  res.json({ success: true, data: coupon });
}));

router.get('/admin/coupons', requireAdmin, asyncHandler(async (req, res) => {
  const coupons = await storage.getCoupons();
  res.json({ success: true, data: coupons });
}));

router.put('/admin/coupons/:id', requireAdmin, asyncHandler(async (req, res) => {
  const couponData = createCouponSchema.partial().parse(req.body);
  const coupon = await storage.updateCoupon(req.params.id, couponData);
  res.json({ success: true, data: coupon });
}));

router.delete('/admin/coupons/:id', requireAdmin, asyncHandler(async (req, res) => {
  await storage.deleteCoupon(req.params.id);
  res.json({ success: true, message: 'Coupon deleted successfully' });
}));

router.get('/plans', asyncHandler(async (req, res) => {
  const plans = await storage.getPlans();
  res.json({ success: true, data: plans });
}));

router.post('/coupons/validate', asyncHandler(async (req, res) => {
  const { code, planId, userCount } = validateCouponSchema.parse(req.body);
  const validation = await storage.validateCoupon(code, planId, userCount);
  res.json({ success: true, data: validation });
}));

router.post('/checkout/create-session', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { planId, userCount, couponCode, isYearly } = createCheckoutSchema.parse(req.body);
  
  const plans = await storage.getPlans();
  const plan = plans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found' });
  }

  let monthlyAmount = plan.price;
  
  if (userCount > (plan.baseUsers || 1)) {
    const additionalUsers = userCount - (plan.baseUsers || 1);
    monthlyAmount += additionalUsers * (plan.pricePerUser || 0);
  }
  
  let totalAmount = monthlyAmount;
  let yearlyDiscount = 0;
  
  if (isYearly) {
    const yearlyBeforeDiscount = monthlyAmount * 12;
    yearlyDiscount = Math.floor(yearlyBeforeDiscount * 0.20);
    totalAmount = yearlyBeforeDiscount - yearlyDiscount;
  }
  
  totalAmount += plan.setupFee || 0;

  let discountAmount = 0;
  let couponId: string | undefined;

  if (couponCode) {
    const validation = await storage.validateCoupon(couponCode, planId, userCount);
    if (validation.valid && validation.discount) {
      const coupon = await storage.getCouponByCode(couponCode);
      couponId = coupon?.id;
      
      if (coupon.type === 'percentage') {
        discountAmount = Math.floor((totalAmount * validation.discount) / 100);
      } else {
        discountAmount = validation.discount;
      }
    }
  }

  const finalAmount = Math.max(totalAmount - discountAmount, 0);

  let stripeCustomerId = req.user.stripeCustomerId;
  
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: req.user.email || undefined,
      name: req.user.username,
      metadata: {
        userId: req.user.id,
      },
    });
    stripeCustomerId = customer.id;
    await storage.updateUser(req.user.id, { stripeCustomerId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan.name} - ${userCount} user${userCount > 1 ? 's' : ''}${isYearly ? ' (Yearly - 20% off)' : ''}`,
            description: plan.description || undefined,
          },
          unit_amount: finalAmount,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/dashboard?payment=success`,
    cancel_url: `${process.env.REPLIT_DEV_DOMAIN || 'http://localhost:5000'}/pricing?payment=cancelled`,
    metadata: {
      userId: req.user.id,
      planId: planId.toString(),
      userCount: userCount.toString(),
      couponId: couponId || '',
      pricePaid: finalAmount.toString(),
      isYearly: isYearly.toString(),
      yearlyDiscount: yearlyDiscount.toString(),
    },
  });

  res.json({ success: true, data: { url: session.url, sessionId: session.id } });
}));

router.post('/webhooks/stripe', asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  if (!sig) {
    return res.status(400).send('No signature');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('STRIPE_WEBHOOK_SECRET is not configured');
    return res.status(500).send('Webhook secret not configured');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const { userId, planId, userCount, couponId, pricePaid } = session.metadata || {};
    
    if (userId && planId && userCount && pricePaid) {
      const plans = await storage.getPlans();
      const plan = plans.find(p => p.id === parseInt(planId));
      
      if (plan) {
        await storage.createUserSubscription({
          userId,
          planId: parseInt(planId),
          couponId: couponId || null,
          stripeSubscriptionId: null,
          stripeCustomerId: session.customer as string,
          userCount: parseInt(userCount),
          pricePaid: parseInt(pricePaid),
          features: plan.features || {},
          startDate: new Date(),
          endDate: null,
          isActive: true,
          status: 'active',
          metadata: {
            sessionId: session.id,
            paymentIntent: session.payment_intent,
          },
        });

        if (couponId) {
          const coupon = await storage.getCouponById(couponId);
          if (coupon) {
            await storage.updateCoupon(couponId, {
              usedCount: (coupon.usedCount || 0) + 1,
            });
          }
        }
      }
    }
  }

  res.json({ received: true });
}));

router.get('/subscription', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const subscription = await storage.getUserSubscription(req.user.id);
  res.json({ success: true, data: subscription });
}));

router.post('/subscription/cancel', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const subscription = await storage.getUserSubscription(req.user.id);
  
  if (!subscription) {
    return res.status(404).json({ success: false, message: 'No active subscription found' });
  }

  await storage.cancelUserSubscription(subscription.id);
  
  res.json({ success: true, message: 'Subscription cancelled successfully' });
}));

export default router;
