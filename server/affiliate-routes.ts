import express from 'express';
import { z } from 'zod';
import { db } from './db';
import { 
  affiliates, 
  clicks, 
  conversions, 
  commissionRules, 
  payouts, 
  balances, 
  riskFlags, 
  disputes, 
  eventsOutbox,
  fxRates,
  marketingAssets,
  users,
  subscriptionPlans,
  type Affiliate,
  type InsertAffiliate,
  type Click,
  type InsertClick,
  type Conversion,
  type InsertConversion,
  type CommissionRule,
  type InsertCommissionRule,
  type Payout,
  type InsertPayout
} from '../shared/schema';
import { eq, desc, asc, and, or, sql, count, sum, gte, lte, between } from 'drizzle-orm';
import crypto from 'crypto';
import { stripeAffiliateService } from './stripeAffiliateService';

const router = express.Router();

// Middleware for authenticated users (no affiliate requirement)
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  next();
};

// Middleware to check if user is affiliate
const requireAffiliate = async (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    const affiliate = await db.select().from(affiliates).where(eq(affiliates.userId, req.user.id)).limit(1);
    if (!affiliate.length) {
      return res.status(403).json({ message: 'Affiliate access required' });
    }
    req.affiliate = affiliate[0];
    next();
  } catch (error) {
    res.status(500).json({ message: 'Failed to verify affiliate status' });
  }
};

// Utility functions
function generateAffiliateCode(firstName: string, lastName: string): string {
  const base = `${firstName}${lastName}`.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${base.substring(0, 4)}${random}`;
}

function calculateCommission(amount: number, rate: string, type: 'percentage' | 'flat'): number {
  if (type === 'percentage') {
    return Math.round(amount * parseFloat(rate));
  } else {
    return parseInt(rate);
  }
}

function generateFingerprint(req: any): string {
  const data = `${req.ip}-${req.get('User-Agent')}-${req.get('Accept-Language')}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
}

// AFFILIATE ONBOARDING & MANAGEMENT ROUTES

// Apply to become affiliate
router.post('/apply', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { country, website, sourceInfo } = req.body;

    // Validate input
    if (!country) {
      return res.status(400).json({ message: 'Country is required' });
    }

    // Check if user is already an affiliate
    const existingAffiliate = await db.select().from(affiliates).where(eq(affiliates.userId, req.user.id)).limit(1);
    if (existingAffiliate.length > 0) {
      const affiliate = existingAffiliate[0];
      // Prevent reapplication from rejected affiliates within 30 days
      if (affiliate.status === 'rejected' && affiliate.updatedAt) {
        const daysSinceRejection = (Date.now() - affiliate.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceRejection < 30) {
          return res.status(400).json({ message: 'You must wait 30 days after rejection to reapply' });
        }
      } else if (affiliate.status !== 'rejected') {
        return res.status(400).json({ message: 'User is already an affiliate' });
      }
    }

    // Generate unique affiliate code
    let code = generateAffiliateCode(req.user.firstName || 'USER', req.user.lastName || '');
    let attempts = 0;
    while (attempts < 10) {
      const existing = await db.select().from(affiliates).where(eq(affiliates.code, code)).limit(1);
      if (!existing.length) break;
      code = generateAffiliateCode(req.user.firstName || 'USER', req.user.lastName || '') + Math.random().toString(36).substring(2, 4).toUpperCase();
      attempts++;
    }

    // Create affiliate record
    const [newAffiliate] = await db.insert(affiliates).values({
      userId: req.user.id,
      code,
      country,
      website,
      sourceInfo,
      status: 'pending'
    }).returning();

    // Create initial balance entry
    await db.insert(balances).values({
      affiliateId: newAffiliate.id,
      delta: 0,
      currency: 'USD',
      kind: 'credit',
      refType: 'adjustment',
      refId: newAffiliate.id,
      description: 'Initial balance',
      runningBalance: 0
    });

    // Queue approval notification event
    await db.insert(eventsOutbox).values({
      eventType: 'affiliate.applied',
      payload: {
        affiliateId: newAffiliate.id,
        userId: req.user.id,
        code: newAffiliate.code,
        country,
        website
      }
    });

    res.json({ 
      success: true,
      message: 'Affiliate application submitted successfully', 
      data: { affiliate: newAffiliate, code: newAffiliate.code }
    });
  } catch (error) {
    console.error('Failed to create affiliate:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get affiliate profile (accessible to all authenticated users)
router.get('/me', requireAuth, async (req, res) => {
  try {
    // Check if user has affiliate record
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.userId, req.user.id)).limit(1);
    
    if (!affiliate) {
      return res.status(404).json({ message: 'No affiliate account found' });
    }
    
    // Get recent stats
    const [clicksResult] = await db.select({ count: count() })
      .from(clicks)
      .where(eq(clicks.affiliateId, affiliate.id));

    const [conversionsResult] = await db.select({ 
      count: count(),
      totalEarnings: sum(conversions.commissionAmount)
    })
      .from(conversions)
      .where(and(
        eq(conversions.affiliateId, affiliate.id),
        eq(conversions.status, 'approved')
      ));

    const [pendingEarnings] = await db.select({
      amount: sum(conversions.commissionAmount),
      count: count()
    })
      .from(conversions)
      .where(and(
        eq(conversions.affiliateId, affiliate.id),
        eq(conversions.status, 'pending')
      ));

    // Get available balance for payout
    const [balanceResult] = await db.select({ balance: sum(balances.delta) })
      .from(balances)
      .where(eq(balances.affiliateId, affiliate.id));

    res.json({
      success: true,
      data: {
        ...affiliate,
        availableBalance: (balanceResult?.balance || 0),
        stats: {
          totalClicks: clicksResult.count || 0,
          totalConversions: conversionsResult.count || 0,
          totalEarnings: conversionsResult.totalEarnings || 0,
          pendingEarnings: pendingEarnings.amount || 0,
          pendingConversions: pendingEarnings.count || 0
        }
      }
    });
  } catch (error) {
    console.error('Failed to get affiliate profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update affiliate profile
router.patch('/me', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { website, payoutMethod, payoutDetails, minPayoutThreshold, cookieDurationDays } = req.body;

    const updates: Partial<Affiliate> = {};
    if (website !== undefined) updates.website = website;
    if (payoutMethod !== undefined) updates.payoutMethod = payoutMethod;
    if (payoutDetails !== undefined) updates.payoutDetails = payoutDetails;
    if (minPayoutThreshold !== undefined) updates.minPayoutThreshold = minPayoutThreshold;
    if (cookieDurationDays !== undefined) {
      // Validate cookie duration (7-90 days)
      const days = Math.max(7, Math.min(90, parseInt(cookieDurationDays)));
      updates.cookieDurationDays = days;
    }

    const [updatedAffiliate] = await db.update(affiliates)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(affiliates.id, affiliate.id))
      .returning();

    res.json({ success: true, message: 'Profile updated successfully', data: updatedAffiliate });
  } catch (error) {
    console.error('Failed to update affiliate profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Submit KYC documents
router.post('/kyc', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { taxInfo, documents } = req.body;

    await db.update(affiliates)
      .set({
        kycStatus: 'submitted',
        taxInfo,
        kycDocuments: documents,
        kycSubmittedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, affiliate.id));

    // Queue KYC review notification
    await db.insert(eventsOutbox).values({
      eventType: 'affiliate.kyc_submitted',
      payload: {
        affiliateId: affiliate.id,
        userId: affiliate.userId
      }
    });

    res.json({ success: true, message: 'KYC documents submitted for review' });
  } catch (error) {
    console.error('Failed to submit KYC:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Stripe Connect onboarding
router.post('/stripe-connect/link', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    
    // Check if KYC is approved first
    if (affiliate.kycStatus !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'KYC must be approved before connecting Stripe account' 
      });
    }

    // Get the return URL from request (or use default)
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const returnUrl = `${baseUrl}/affiliate/dashboard`;

    // Generate Stripe Connect account link
    const { url, stripeAccountId } = await stripeAffiliateService.generateConnectLink(
      affiliate.id,
      returnUrl
    );

    res.json({ 
      success: true, 
      message: 'Stripe Connect authorization link generated',
      data: {
        url,
        stripeAccountId
      }
    });
  } catch (error: any) {
    console.error('Failed to generate Stripe Connect link:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to generate Stripe Connect link' 
    });
  }
});

// Check Stripe Connect account status
router.get('/stripe-connect/status', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const status = await stripeAffiliateService.getAccountStatus(affiliate.id);
    
    res.json({ 
      success: true, 
      data: status 
    });
  } catch (error: any) {
    console.error('Failed to get Stripe Connect status:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to check account status' 
    });
  }
});

// TRACKING ROUTES

// Track click (redirect endpoint)
router.get('/r/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { dest = '/', ...params } = req.query;

    // Find affiliate by code
    const affiliate = await db.select().from(affiliates)
      .where(and(
        eq(affiliates.code, code),
        eq(affiliates.status, 'approved')
      ))
      .limit(1);

    if (!affiliate.length) {
      return res.redirect('/'); // Redirect to home if invalid code
    }

    // Generate fingerprint for deduplication
    const fingerprint = generateFingerprint(req);

    // Log the click
    await db.insert(clicks).values({
      affiliateId: affiliate[0].id,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer'),
      fingerprint,
      utmSource: params.utm_source as string,
      utmMedium: params.utm_medium as string,
      utmCampaign: params.utm_campaign as string,
      utmContent: params.utm_content as string,
      utmTerm: params.utm_term as string,
      sub1: params.sub1 as string,
      sub2: params.sub2 as string,
      sub3: params.sub3 as string,
      sub4: params.sub4 as string,
      sub5: params.sub5 as string,
      landingPath: dest as string,
      geoCountry: req.get('CF-IPCountry') || 'Unknown' // Cloudflare header
    });

    // Set tracking cookie (30 days)
    const trackingData = {
      affiliateId: affiliate[0].id,
      clickTime: new Date().toISOString(),
      code: affiliate[0].code
    };
    
    res.cookie('affiliate_ref', JSON.stringify(trackingData), {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: false, // Allow JS access for conversion tracking
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    });

    // Redirect to destination
    const baseUrl = process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:5000';
    res.redirect(`${baseUrl}${dest}`);
  } catch (error) {
    console.error('Failed to track click:', error);
    res.redirect('/');
  }
});

// Track conversion (for webhook/API integration)
router.post('/track/conversion', async (req, res) => {
  try {
    const { orderId, amount, currency = 'USD', planId, customerId, affiliateCode, userId } = req.body;

    if (!orderId || !amount) {
      return res.status(400).json({ message: 'Order ID and amount are required' });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be positive' });
    }

    // Check if conversion already exists (idempotency)
    const existingConversion = await db.select().from(conversions)
      .where(eq(conversions.orderId, orderId))
      .limit(1);

    if (existingConversion.length > 0) {
      return res.json({ message: 'Conversion already tracked', conversion: existingConversion[0] });
    }

    let affiliateId: string | null = null;
    let affiliateUserId: string | null = null;
    let cookieDurationDays = 30; // Default

    // Try to find affiliate from provided code or tracking cookie
    if (affiliateCode) {
      const affiliate = await db.select().from(affiliates)
        .where(and(
          eq(affiliates.code, affiliateCode),
          eq(affiliates.status, 'approved')
        ))
        .limit(1);
      if (affiliate.length) {
        affiliateId = affiliate[0].id;
        affiliateUserId = affiliate[0].userId;
        cookieDurationDays = affiliate[0].cookieDurationDays || 30;
        
        // SECURITY: Prevent self-referral (user can't earn commission for their own purchase)
        if (userId && affiliateUserId === userId) {
          return res.status(400).json({ message: 'Self-referral not permitted' });
        }
        
        // SECURITY: Check affiliate KYC status - only approved affiliates can earn commissions
        if (affiliate[0].kycStatus !== 'approved') {
          return res.status(400).json({ message: 'Affiliate KYC not approved for commission' });
        }
        
        // SECURITY: Check affiliate is not suspended
        if (affiliate[0].suspendedAt) {
          return res.status(400).json({ message: 'Affiliate account suspended' });
        }
      }
    }

    if (!affiliateId) {
      return res.status(400).json({ message: 'No valid affiliate found for conversion' });
    }

    // SECURITY: Validate conversion is within affiliate's cookie attribution window
    if (customerId) {
      const attributionWindowStart = new Date(Date.now() - (cookieDurationDays * 24 * 60 * 60 * 1000));
      const recentClick = await db.select().from(clicks)
        .where(and(
          eq(clicks.affiliateId, affiliateId),
          gte(clicks.createdAt, attributionWindowStart)
        ))
        .limit(1);
      
      if (!recentClick.length) {
        return res.status(400).json({ message: `No recent click found within ${cookieDurationDays}-day attribution window` });
      }
    }

    // SECURITY: Prevent duplicate conversions from same user within 24 hours (fraud detection)
    if (customerId) {
      const recentConversion = await db.select().from(conversions)
        .where(and(
          eq(conversions.affiliateId, affiliateId),
          eq(conversions.customerId, customerId),
          gte(conversions.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000))
        ))
        .limit(1);
      
      if (recentConversion.length > 0) {
        // Flag as suspicious activity
        await db.insert(riskFlags).values({
          affiliateId,
          flagType: 'duplicate_customer',
          severity: 'medium',
          description: `Duplicate conversion from customer ${customerId} within 24 hours`,
          details: { orderId, customerId, previousOrderId: recentConversion[0].orderId }
        });
      }
    }

    // Get commission rules (simplified - use global default)
    const commissionRule = await db.select().from(commissionRules)
      .where(and(
        eq(commissionRules.scope, 'global'),
        eq(commissionRules.isActive, true)
      ))
      .orderBy(desc(commissionRules.priority))
      .limit(1);

    let commissionAmount = 0;
    let commissionRate = '0';
    let paymentType = affiliate.preferredPaymentType || 'onetime'; // Use affiliate's preference
    let recurringValue: string | null = null;
    let recurringDuration: number | null = null;
    
    if (commissionRule.length > 0) {
      const rule = commissionRule[0];
      commissionAmount = calculateCommission(amount, rule.value, rule.type);
      commissionRate = rule.value;
      
      // Use affiliate's preferred payment type, or fallback to rule's payment type
      paymentType = affiliate.preferredPaymentType || rule.paymentType || 'onetime';
      
      // If recurring payment, use affiliate's preferred recurring value if available
      if (paymentType === 'recurring') {
        recurringValue = affiliate.preferredRecurringValue || rule.recurringValue || rule.value;
        recurringDuration = affiliate.preferredRecurringDuration || rule.recurringDuration || 12;
        
        // For recurring commissions, apply the recurring value if it's different from base
        if (recurringValue && recurringValue !== rule.value) {
          commissionAmount = calculateCommission(amount, recurringValue, rule.type);
        }
      }
      
      // SECURITY: Validate commission rate is within reasonable bounds (0-50%)
      const ratePercentage = parseFloat(rule.value);
      if (ratePercentage < 0 || ratePercentage > 0.5) {
        console.error(`Invalid commission rate: ${rule.value}`);
        return res.status(500).json({ message: 'Invalid commission configuration' });
      }
    }

    // Convert currency if needed (simplified - assume USD)
    const homeAmount = amount; // In real implementation, use FX rates

    // SECURITY: Create conversion with lock period - commission not available until lock expires
    // This prevents fraud where affiliate creates fake conversion then immediately requests payout
    const lockUntilDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 day lock period
    
    const [newConversion] = await db.insert(conversions).values({
      affiliateId,
      orderId,
      customerId,
      customerHash: customerId ? crypto.createHash('sha256').update(customerId).digest('hex') : null,
      amount,
      currency,
      homeAmount,
      homeCurrency: 'USD',
      commissionAmount,
      commissionRate,
      paymentType,
      recurringValue,
      recurringDuration,
      planId: planId ? parseInt(planId) : null,
      status: 'pending', // SECURITY: All conversions start in 'pending' status
      lockUntil: lockUntilDate // SECURITY: Commission locked until this date
    }).returning();

    // SECURITY: Create balance entry ONLY after lock period expires (will be processed by background job)
    // Do NOT credit balance until lockUntil date - this prevents premature payouts
    const currentBalance = await db.select({ balance: balances.runningBalance })
      .from(balances)
      .where(eq(balances.affiliateId, affiliateId))
      .orderBy(desc(balances.createdAt))
      .limit(1);

    const newRunningBalance = (currentBalance[0]?.balance || 0); // Don't add to balance yet

    await db.insert(balances).values({
      affiliateId,
      delta: 0, // SECURITY: Delta is 0 until lock period expires
      currency: 'USD',
      kind: 'credit',
      refType: 'conversion_pending',
      refId: newConversion.id,
      description: `Commission pending for order ${orderId} (locked until ${lockUntilDate.toISOString()})`,
      runningBalance: newRunningBalance
    });

    // Queue conversion event
    await db.insert(eventsOutbox).values({
      eventType: 'conversion.created',
      payload: {
        conversionId: newConversion.id,
        affiliateId,
        orderId,
        amount,
        commissionAmount
      }
    });

    res.json({ 
      success: true,
      message: 'Conversion tracked successfully', 
      data: newConversion 
    });
  } catch (error) {
    console.error('Failed to track conversion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ANALYTICS & REPORTING ROUTES

// Get affiliate analytics
router.get('/analytics', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { period = '30d', startDate, endDate } = req.query;

    let dateFilter;
    if (startDate && endDate) {
      dateFilter = between(clicks.createdAt, new Date(startDate as string), new Date(endDate as string));
    } else {
      const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      dateFilter = gte(clicks.createdAt, since);
    }

    // Get click analytics
    const clickAnalytics = await db.select({
      date: sql<string>`DATE(${clicks.createdAt})`,
      clicks: count()
    })
      .from(clicks)
      .where(and(
        eq(clicks.affiliateId, affiliate.id),
        dateFilter
      ))
      .groupBy(sql`DATE(${clicks.createdAt})`)
      .orderBy(sql`DATE(${clicks.createdAt})`);

    // Get conversion analytics
    const conversionAnalytics = await db.select({
      date: sql<string>`DATE(${conversions.createdAt})`,
      conversions: count(),
      revenue: sum(conversions.amount),
      commission: sum(conversions.commissionAmount)
    })
      .from(conversions)
      .where(and(
        eq(conversions.affiliateId, affiliate.id),
        dateFilter
      ))
      .groupBy(sql`DATE(${conversions.createdAt})`)
      .orderBy(sql`DATE(${conversions.createdAt})`);

    // Get top performing sources
    const topSources = await db.select({
      source: clicks.utmSource,
      clicks: count(),
      conversions: sql<number>`COUNT(${conversions.id})`
    })
      .from(clicks)
      .leftJoin(conversions, eq(clicks.id, conversions.clickId))
      .where(and(
        eq(clicks.affiliateId, affiliate.id),
        dateFilter
      ))
      .groupBy(clicks.utmSource)
      .orderBy(desc(count()))
      .limit(10);

    res.json({
      success: true,
      data: {
        clickAnalytics,
        conversionAnalytics,
        topSources
      }
    });
  } catch (error) {
    console.error('Failed to get analytics:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get conversions
router.get('/conversions', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = eq(conversions.affiliateId, affiliate.id);
    if (status) {
      whereClause = and(whereClause, eq(conversions.status, status as any));
    }

    const userConversions = await db.select({
      id: conversions.id,
      orderId: conversions.orderId,
      amount: conversions.amount,
      currency: conversions.currency,
      commissionAmount: conversions.commissionAmount,
      commissionRate: conversions.commissionRate,
      paymentType: conversions.paymentType,
      recurringValue: conversions.recurringValue,
      recurringDuration: conversions.recurringDuration,
      status: conversions.status,
      createdAt: conversions.createdAt,
      approvedAt: conversions.approvedAt,
      lockUntil: conversions.lockUntil
    })
      .from(conversions)
      .where(whereClause)
      .orderBy(desc(conversions.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    const [totalCount] = await db.select({ count: count() })
      .from(conversions)
      .where(whereClause);

    res.json({
      success: true,
      data: {
        conversions: userConversions,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount.count,
          pages: Math.ceil(totalCount.count / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Failed to get conversions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get payouts
router.get('/payouts', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const affiliatePayouts = await db.select()
      .from(payouts)
      .where(eq(payouts.affiliateId, affiliate.id))
      .orderBy(desc(payouts.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    const [totalCount] = await db.select({ count: count() })
      .from(payouts)
      .where(eq(payouts.affiliateId, affiliate.id));

    res.json({
      success: true,
      data: {
        payouts: affiliatePayouts,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount.count,
          pages: Math.ceil(totalCount.count / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Failed to get payouts:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create dispute
router.post('/disputes', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { conversionId, reason, evidence } = req.body;

    if (!conversionId || !reason) {
      return res.status(400).json({ message: 'Conversion ID and reason are required' });
    }

    // Verify conversion belongs to affiliate
    const conversion = await db.select().from(conversions)
      .where(and(
        eq(conversions.id, conversionId),
        eq(conversions.affiliateId, affiliate.id)
      ))
      .limit(1);

    if (!conversion.length) {
      return res.status(404).json({ message: 'Conversion not found' });
    }

    // Check if dispute already exists
    const existingDispute = await db.select().from(disputes)
      .where(eq(disputes.conversionId, conversionId))
      .limit(1);

    if (existingDispute.length > 0) {
      return res.status(400).json({ message: 'Dispute already exists for this conversion' });
    }

    // Create dispute
    const [newDispute] = await db.insert(disputes).values({
      conversionId,
      affiliateId: affiliate.id,
      reason,
      evidence,
      status: 'open'
    }).returning();

    // Queue dispute notification
    await db.insert(eventsOutbox).values({
      eventType: 'dispute.created',
      payload: {
        disputeId: newDispute.id,
        conversionId,
        affiliateId: affiliate.id,
        reason
      }
    });

    res.json({ success: true, message: 'Dispute submitted successfully', data: newDispute });
  } catch (error) {
    console.error('Failed to create dispute:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get marketing assets
router.get('/assets', async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause = eq(marketingAssets.isActive, true);
    if (category) {
      whereClause = and(whereClause, eq(marketingAssets.category, category as string));
    }

    const assets = await db.select()
      .from(marketingAssets)
      .where(whereClause)
      .orderBy(desc(marketingAssets.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    const [totalCount] = await db.select({ count: count() })
      .from(marketingAssets)
      .where(whereClause);

    res.json({
      success: true,
      data: {
        assets,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total: totalCount.count,
          pages: Math.ceil(totalCount.count / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Failed to get marketing assets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// UPDATE PAYMENT PREFERENCES
router.patch('/payment-preferences', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { preferredPaymentType, preferredRecurringDuration, preferredRecurringValue } = req.body;

    // Validate input
    if (preferredPaymentType && !['onetime', 'recurring'].includes(preferredPaymentType)) {
      return res.status(400).json({ message: 'Invalid payment type' });
    }
    
    if (preferredRecurringDuration && (preferredRecurringDuration < 1 || preferredRecurringDuration > 60)) {
      return res.status(400).json({ message: 'Recurring duration must be between 1 and 60 months' });
    }

    // Update affiliate preferences
    const [updated] = await db.update(affiliates)
      .set({
        preferredPaymentType: preferredPaymentType || affiliate.preferredPaymentType,
        preferredRecurringDuration: preferredRecurringDuration || affiliate.preferredRecurringDuration,
        preferredRecurringValue: preferredRecurringValue || affiliate.preferredRecurringValue,
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, affiliate.id))
      .returning();

    res.json({
      success: true,
      message: 'Payment preferences updated',
      data: updated
    });
  } catch (error) {
    console.error('Failed to update payment preferences:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET PAYMENT PREFERENCES
router.get('/payment-preferences', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    res.json({
      preferredPaymentType: affiliate.preferredPaymentType,
      preferredRecurringDuration: affiliate.preferredRecurringDuration,
      preferredRecurringValue: affiliate.preferredRecurringValue
    });
  } catch (error) {
    console.error('Failed to get payment preferences:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// REQUEST PAYOUT
router.post('/payout-request', requireAffiliate, async (req, res) => {
  try {
    const affiliate = req.affiliate;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
    }

    // SECURITY: Check minimum payout threshold
    if (amount < affiliate.minPayoutThreshold) {
      return res.status(400).json({ 
        success: false, 
        message: `Minimum payout amount is $${(affiliate.minPayoutThreshold / 100).toFixed(2)}` 
      });
    }

    // SECURITY: Verify payout method is configured
    if (!affiliate.payoutMethod || !affiliate.payoutDetails) {
      return res.status(400).json({ 
        success: false, 
        message: 'Payout method not configured. Please update your profile.' 
      });
    }

    // SECURITY: Check affiliate KYC is approved
    if (affiliate.kycStatus !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        message: 'KYC must be approved before requesting payout' 
      });
    }

    // Get current available balance
    const [balanceResult] = await db.select({ balance: sum(balances.delta) })
      .from(balances)
      .where(eq(balances.affiliateId, affiliate.id));

    const availableBalance = balanceResult?.balance || 0;

    if (availableBalance < amount) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient balance. Available: $${(availableBalance / 100).toFixed(2)}` 
      });
    }

    // Create payout request (draft status - awaiting admin approval)
    const [payout] = await db.insert(payouts).values({
      affiliateId: affiliate.id,
      amount,
      currency: 'USD',
      method: affiliate.payoutMethod,
      status: 'draft',
      periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      periodEnd: new Date(),
      makerUserId: req.user.id
    }).returning();

    // Create balance entry for payout request (pending)
    await db.insert(balances).values({
      affiliateId: affiliate.id,
      delta: -amount, // Negative = debit
      currency: 'USD',
      kind: 'debit',
      refType: 'payout',
      refId: payout.id,
      description: `Payout request #${payout.id.substring(0, 8)} (pending approval)`,
      runningBalance: availableBalance - amount
    });

    // Queue payout notification
    await db.insert(eventsOutbox).values({
      eventType: 'payout.requested',
      payload: {
        payoutId: payout.id,
        affiliateId: affiliate.id,
        userId: req.user.id,
        amount
      }
    });

    res.json({ 
      success: true, 
      message: 'Payout request submitted successfully', 
      data: payout 
    });
  } catch (error) {
    console.error('Failed to create payout request:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;