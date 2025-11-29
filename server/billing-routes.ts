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
  pricingFeatures: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    icon: z.string().optional().default('Check')
  })).default([]),
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
      'google_pay',
      'apple_pay',
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
      'jcb',
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

export default router;
