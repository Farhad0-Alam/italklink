import { Router } from 'express';
import Stripe from 'stripe';
import { storage } from './storage';
import { requireAuth, requireAdmin } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { z } from 'zod';
import { db } from './db';
import { users, userPlans, subscriptionPlans } from '@shared/schema';
import { eq, desc, and } from 'drizzle-orm';

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
  // Element features - array of element type IDs allowed for this plan
  elementFeatures: z.array(z.number()).default([]),
  // Template IDs - array of template IDs allowed for this plan
  templateIds: z.array(z.string()).default([]),
  // Module features - object controlling access to platform modules
  moduleFeatures: z.object({
    analytics: z.boolean().optional(),
    crm: z.boolean().optional(),
    appointments: z.boolean().optional(),
    emailSignature: z.boolean().optional(),
    nfc: z.boolean().optional(),
    voiceConversation: z.boolean().optional(),
    digitalShop: z.boolean().optional(),
    bulkGeneration: z.boolean().optional(),
    customDomain: z.boolean().optional(),
    apiAccess: z.boolean().optional(),
    whiteLabel: z.boolean().optional(),
    prioritySupport: z.boolean().optional(),
    visitorNotifications: z.boolean().optional(),
  }).passthrough().default({}),
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
  pricingFeatures: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    icon: z.string().optional().default('Check')
  })).default([]),
  // Legacy field for backward compatibility (maps to elementFeatures)
  features: z.array(z.number()).optional(),
  // Legacy field for backward compatibility (maps to templateIds)  
  templates: z.array(z.string()).optional(),
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

const createSubscriptionCheckoutSchema = z.object({
  planId: z.number().int(),
  isYearly: z.boolean().default(false),
  userCount: z.number().int().min(1).optional(),
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
    return res.status(401).json({ success: false, message: 'Please sign up or login to continue' });
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
    payment_method_types: [
      'card',
      'alipay',
      'wechat_pay',
      'paypal',
      'klarna',
      'affirm',
      'afterpay_clearpay',
      'acss_debit',
      'au_becs_debit',
      'bacs_debit',
      'bancontact',
      'boleto',
      'eps',
      'giropay',
      'ideal',
      'link',
      'mobilepay',
      'p24',
      'pix',
      'promptpay',
      'sepa_debit',
      'sofort',
      'twint',
      'us_bank_account',
    ],
    payment_method_options: {
      acss_debit: {
        mandate_options: {
          payment_schedule: 'sporadic',
          transaction_type: 'personal',
        },
      },
      wechat_pay: {
        client: 'web' as const,
      },
      us_bank_account: {
        financial_connections: {
          permissions: ['payment_method', 'balances'],
        },
      },
    } as any,
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
    success_url: `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/dashboard?payment=success`,
    cancel_url: `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/pricing?payment=cancelled`,
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

  // Update user plan immediately (skip webhook)
  await storage.updateUser(req.user.id, { planType: 'paid' });
  
  // Create subscription record
  await storage.createUserSubscription({
    userId: req.user.id,
    planId: planId,
    couponId: couponId || null,
    stripeSubscriptionId: null,
    stripeCustomerId: stripeCustomerId,
    userCount: userCount,
    pricePaid: finalAmount,
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
  
  if (subscription) {
    const plans = await storage.getPlans();
    const plan = plans.find(p => p.id === subscription.planId);
    res.json({ success: true, data: { ...subscription, plan } });
  } else {
    res.json({ success: true, data: null });
  }
}));

// Get current user's plan with all feature access information
// Used by frontend to check element, template, and module access
router.get('/user/plan', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  // Get user's subscription
  const subscription = await storage.getUserSubscription(req.user.id);
  
  // Get user data for planId reference
  const user = await storage.getUser(req.user.id);
  
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Get all plans to find the user's plan
  const plans = await storage.getPlans();
  
  // Find user's plan - either from subscription or from user's planId
  let userPlan = null;
  
  if (subscription && subscription.planId) {
    userPlan = plans.find(p => p.id === subscription.planId);
  } else if (user.planId) {
    userPlan = plans.find(p => p.id === user.planId);
  }
  
  // If no plan found, return locked state - user must select a plan
  // No default free plan fallback - mandatory plan selection system
  if (!userPlan) {
    return res.json({
      success: true,
      data: {
        hasPlan: false,
        isPlanAssigned: false, // Explicit flag for mandatory plan selection
        plan: null,
        elementFeatures: [], // No features without a plan
        templateIds: [], // No templates without a plan
        moduleFeatures: {}, // No modules without a plan
        businessCardsLimit: 0, // Cannot create cards without a plan
        isAdmin: user.role === 'admin',
        unlimitedElements: false,
        unlimitedTemplates: false,
        unlimitedModules: false,
      }
    });
  }

  // Determine unlimited access flags
  // A plan has unlimited access if no specific features are defined (empty arrays/objects)
  // OR if the plan has explicit unlimited flags
  const hasUnlimitedElements = (userPlan as any).unlimitedElements === true;
  const hasUnlimitedTemplates = (userPlan as any).unlimitedTemplates === true;
  const hasUnlimitedModules = (userPlan as any).unlimitedModules === true;

  // Return the user's plan with all feature access information
  res.json({
    success: true,
    data: {
      hasPlan: true,
      isPlanAssigned: true, // User has an assigned plan
      plan: userPlan,
      elementFeatures: userPlan.elementFeatures || [],
      templateIds: userPlan.templateIds || [],
      moduleFeatures: userPlan.moduleFeatures || {},
      businessCardsLimit: userPlan.businessCardsLimit,
      subscription: subscription ? {
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isActive: subscription.isActive,
      } : null,
      isAdmin: user.role === 'admin',
      unlimitedElements: hasUnlimitedElements,
      unlimitedTemplates: hasUnlimitedTemplates,
      unlimitedModules: hasUnlimitedModules,
    }
  });
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

router.post('/checkout/create-subscription', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const { planId, isYearly } = createSubscriptionCheckoutSchema.parse(req.body);
  
  const plans = await storage.getPlans();
  const plan = plans.find(p => p.id === planId);
  
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found' });
  }

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

  let priceId = plan.stripePriceId;
  
  if (!priceId) {
    const product = await stripe.products.create({
      name: plan.name,
      description: plan.description || undefined,
      metadata: {
        planId: planId.toString(),
      },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: plan.price,
      currency: 'usd',
      recurring: {
        interval: isYearly ? 'year' : 'month',
      },
      metadata: {
        planId: planId.toString(),
      },
    });

    priceId = price.id;
    await storage.updatePlan(planId, { stripePriceId: priceId });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/dashboard?subscription=success`,
    cancel_url: `https://${process.env.REPLIT_DEV_DOMAIN || 'localhost:5000'}/pricing?subscription=cancelled`,
    metadata: {
      userId: req.user.id,
      planId: planId.toString(),
    },
    subscription_data: {
      trial_period_days: plan.trialDays || undefined,
      metadata: {
        userId: req.user.id,
        planId: planId.toString(),
      },
    },
  });

  // Update user plan immediately (skip webhook)
  await storage.updateUser(req.user.id, { planType: 'paid' });
  
  // Create subscription record
  await storage.createSubscription({
    userId: req.user.id,
    planId: planId,
    status: 'active',
    stripeSubscriptionId: session.subscription as string || null,
    stripeCustomerId: stripeCustomerId,
    stripePriceId: priceId,
    startDate: new Date(),
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(Date.now() + (isYearly ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)),
  });

  res.json({ success: true, data: { url: session.url, sessionId: session.id } });
}));

router.post('/subscription/manage-recurring', requireAuth, asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated' });
  }

  const subscription = await storage.getSubscription(req.user.id);
  
  if (!subscription || !subscription.stripeSubscriptionId) {
    return res.status(404).json({ success: false, message: 'No active recurring subscription found' });
  }

  if (req.body.action === 'cancel') {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await storage.cancelSubscription(subscription.id);

    return res.json({ success: true, message: 'Subscription will be cancelled at the end of the billing period' });
  }

  if (req.body.action === 'reactivate') {
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    await storage.updateSubscription(subscription.id, {
      status: 'active',
      canceledAt: null,
    });

    return res.json({ success: true, message: 'Subscription reactivated successfully' });
  }

  return res.status(400).json({ success: false, message: 'Invalid action' });
}));

router.post('/webhooks/stripe/recurring', asyncHandler(async (req, res) => {
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

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      if (session.mode === 'subscription' && session.subscription) {
        const { userId, planId } = session.metadata || {};
        
        if (userId && planId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await storage.createSubscription({
            userId,
            planId: parseInt(planId),
            status: 'active',
            stripeSubscriptionId: stripeSubscription.id,
            stripeCustomerId: session.customer as string,
            stripePriceId: stripeSubscription.items.data[0]?.price.id,
            startDate: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            nextBillingDate: new Date(stripeSubscription.current_period_end * 1000),
          });

          await storage.updateUser(userId, {
            subscriptionStatus: 'active',
            stripeSubscriptionId: stripeSubscription.id,
          });
        }
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      
      const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
      
      if (dbSubscription) {
        const status = subscription.status === 'active' ? 'active' : 
                      subscription.status === 'past_due' ? 'past_due' :
                      subscription.status === 'canceled' ? 'canceled' :
                      subscription.status === 'unpaid' ? 'unpaid' : 'active';
        
        await storage.updateSubscription(dbSubscription.id, {
          status,
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          nextBillingDate: new Date(subscription.current_period_end * 1000),
          canceledAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
        });

        await storage.updateUser(dbSubscription.userId, {
          subscriptionStatus: status,
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      const dbSubscription = await storage.getSubscriptionByStripeId(subscription.id);
      
      if (dbSubscription) {
        await storage.updateSubscription(dbSubscription.id, {
          status: 'canceled',
          endDate: new Date(),
          canceledAt: new Date(),
        });

        await storage.updateUser(dbSubscription.userId, {
          subscriptionStatus: 'canceled',
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.subscription) {
        const dbSubscription = await storage.getSubscriptionByStripeId(invoice.subscription as string);
        
        if (dbSubscription) {
          await storage.updateSubscription(dbSubscription.id, {
            status: 'active',
          });

          await storage.updateUser(dbSubscription.userId, {
            subscriptionStatus: 'active',
          });
          
          // Auto-extend userPlans using Stripe's actual billing period dates
          const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          
          // Use Stripe's actual period dates for accurate billing cycle alignment
          const periodStart = new Date(stripeSubscription.current_period_start * 1000);
          const periodEnd = new Date(stripeSubscription.current_period_end * 1000);
          const interval = stripeSubscription.items.data[0]?.price?.recurring?.interval; // 'month' or 'year'
          
          // Get the plan from the subscription
          const planId = dbSubscription.planId;
          
          // Use Stripe's period timestamps as unique identifiers to match exact periods
          // This avoids any timezone or date normalization issues
          const stripePeriodStartTs = stripeSubscription.current_period_start;
          const stripePeriodEndTs = stripeSubscription.current_period_end;
          
          // Query for existing userPlans matching planId and look for exact period match
          const existingPlansForUser = await db.select()
            .from(userPlans)
            .where(and(
              eq(userPlans.userId, dbSubscription.userId),
              eq(userPlans.planId, planId)
            ))
            .orderBy(desc(userPlans.startsAt));
          
          // Find exact match by comparing timestamps (within 1 second tolerance for rounding)
          const matchingRecord = existingPlansForUser.find((p) => {
            if (!p.startsAt || !p.endsAt) return false;
            const startsAtTs = Math.floor(p.startsAt.getTime() / 1000);
            const endsAtTs = Math.floor(p.endsAt.getTime() / 1000);
            return Math.abs(startsAtTs - stripePeriodStartTs) <= 1 && 
                   Math.abs(endsAtTs - stripePeriodEndTs) <= 1;
          });
          
          const periodNote = `Stripe ${interval === 'year' ? 'Yearly' : 'Monthly'} - ${periodStart.toISOString().split('T')[0]} to ${periodEnd.toISOString().split('T')[0]}`;
          
          if (matchingRecord) {
            // Update existing record only if it matches exact period timestamps
            await db.update(userPlans)
              .set({ 
                startsAt: periodStart,
                endsAt: periodEnd,
                note: periodNote
              })
              .where(eq(userPlans.id, matchingRecord.id));
              
            console.log(`[Stripe Webhook] Updated existing period for user ${dbSubscription.userId}`);
          } else {
            // Create a new userPlans entry for this unique renewal period
            await db.insert(userPlans).values({
              userId: dbSubscription.userId,
              planId: planId,
              startsAt: periodStart,
              endsAt: periodEnd,
              note: periodNote
            });
            
            console.log(`[Stripe Webhook] Created new period for user ${dbSubscription.userId} - ${periodNote}`);
          }
          
          // Update user's subscriptionEndsAt with Stripe's period end
          await db.update(users)
            .set({ 
              subscriptionEndsAt: periodEnd,
              planId: planId, // Ensure planId is synced
              updatedAt: new Date()
            })
            .where(eq(users.id, dbSubscription.userId));
        }
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      
      if (invoice.subscription) {
        const dbSubscription = await storage.getSubscriptionByStripeId(invoice.subscription as string);
        
        if (dbSubscription) {
          await storage.updateSubscription(dbSubscription.id, {
            status: 'past_due',
          });

          await storage.updateUser(dbSubscription.userId, {
            subscriptionStatus: 'past_due',
          });
        }
      }
      break;
    }
  }

  res.json({ received: true });
}));

// Admin: Assign plan to user
const assignPlanSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  planId: z.number().int().positive('Plan ID must be a positive integer'),
  validUntil: z.string().optional(), // ISO date string
  notes: z.string().optional(),
});

router.post('/admin/users/:userId/assign-plan', requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { planId, validUntil, notes } = assignPlanSchema.parse({
    userId,
    ...req.body,
  });

  // Get the user
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Get the plan
  const plans = await storage.getPlans();
  const plan = plans.find(p => p.id === planId);
  if (!plan) {
    return res.status(404).json({ success: false, message: 'Plan not found' });
  }

  // Calculate valid until date
  let planValidUntil: Date | null = null;
  if (validUntil) {
    planValidUntil = new Date(validUntil);
  } else if (plan.customDurationDays && plan.customDurationDays > 0) {
    planValidUntil = new Date();
    planValidUntil.setDate(planValidUntil.getDate() + plan.customDurationDays);
  }

  // Update user with plan assignment
  await storage.updateUser(userId, {
    planId: plan.id,
    planName: plan.name,
    planType: plan.planType as 'free' | 'paid',
    businessCardsLimit: plan.businessCardsLimit,
    planValidUntil,
    planAssignedAt: new Date(),
    planAssignedBy: req.user?.id,
    planAssignmentNotes: notes,
  });

  // Also create a subscription record if one doesn't exist
  const existingSubscription = await storage.getUserSubscription(userId);
  if (!existingSubscription) {
    await storage.createUserSubscription({
      userId,
      planId: plan.id,
      couponId: null,
      stripeSubscriptionId: null,
      stripeCustomerId: null,
      userCount: 1,
      pricePaid: 0, // Admin assigned, no payment
      features: plan.features || {},
      startDate: new Date(),
      endDate: planValidUntil,
      isActive: true,
      status: 'active',
      metadata: {
        assignedBy: req.user?.id,
        assignmentNotes: notes,
        assignmentType: 'admin_assigned',
      },
    });
  } else {
    // Update existing subscription
    await storage.updateUserSubscription(existingSubscription.id, {
      planId: plan.id,
      isActive: true,
      status: 'active',
      endDate: planValidUntil,
      features: plan.features || {},
      metadata: {
        ...(existingSubscription.metadata as object || {}),
        lastAssignedBy: req.user?.id,
        lastAssignmentNotes: notes,
        lastAssignmentType: 'admin_assigned',
        lastAssignedAt: new Date().toISOString(),
      },
    });
  }

  // Get the updated user
  const updatedUser = await storage.getUser(userId);

  res.json({
    success: true,
    message: `Successfully assigned ${plan.name} to user`,
    data: {
      user: updatedUser,
      plan: plan,
      validUntil: planValidUntil,
    },
  });
}));

// Admin: Remove plan from user
router.delete('/admin/users/:userId/plan', requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get the user
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Get free plan or default values
  const plans = await storage.getPlans();
  const freePlan = plans.find(p => p.planType === 'free');

  // Reset user to free plan
  await storage.updateUser(userId, {
    planId: freePlan?.id || null,
    planName: freePlan?.name || 'Free',
    planType: 'free',
    businessCardsLimit: freePlan?.businessCardsLimit || 1,
    planValidUntil: null,
    planAssignedAt: null,
    planAssignedBy: null,
    planAssignmentNotes: null,
  });

  // Deactivate any active subscription
  const subscription = await storage.getUserSubscription(userId);
  if (subscription) {
    await storage.updateUserSubscription(subscription.id, {
      isActive: false,
      status: 'canceled',
      endDate: new Date(),
      metadata: {
        ...(subscription.metadata as object || {}),
        removedBy: req.user?.id,
        removedAt: new Date().toISOString(),
        removalType: 'admin_removed',
      },
    });
  }

  res.json({
    success: true,
    message: 'Successfully removed plan from user',
    data: {
      userId,
      newPlan: freePlan?.name || 'Free',
    },
  });
}));

// Admin: Get user's current plan details
router.get('/admin/users/:userId/plan', requireAdmin, asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get the user
  const user = await storage.getUser(userId);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Get user's subscription
  const subscription = await storage.getUserSubscription(userId);

  // Get all plans
  const plans = await storage.getPlans();

  // Find user's plan
  let userPlan = null;
  if (subscription && subscription.planId) {
    userPlan = plans.find(p => p.id === subscription.planId);
  } else if (user.planId) {
    userPlan = plans.find(p => p.id === user.planId);
  }

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        planId: user.planId,
        planName: user.planName,
        planType: user.planType,
        planValidUntil: user.planValidUntil,
        planAssignedAt: user.planAssignedAt,
        planAssignedBy: user.planAssignedBy,
        businessCardsLimit: user.businessCardsLimit,
      },
      plan: userPlan,
      subscription: subscription ? {
        id: subscription.id,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isActive: subscription.isActive,
      } : null,
    },
  });
}));

export default router;
