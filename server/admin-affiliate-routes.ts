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
  users,
  subscriptionPlans,
  type Affiliate,
  type InsertAffiliate,
  type Conversion,
  type InsertConversion
} from '../shared/schema';
import { eq, desc, asc, and, or, sql, count, sum, gte, lte, between, inArray } from 'drizzle-orm';

const router = express.Router();

// Admin middleware (reuse from admin-routes.ts)
const requireAdmin = (req: any, res: any, next: any) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'owner')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// ADMIN AFFILIATE MANAGEMENT ENDPOINTS

// Get all affiliates with stats
router.get('/affiliates', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause
    let whereClause: any = undefined;
    if (status && status !== 'all') {
      whereClause = eq(affiliates.status, status as any);
    }

    // Get affiliates with user info and stats
    const allAffiliates = await db.select({
      id: affiliates.id,
      userId: affiliates.userId,
      code: affiliates.code,
      country: affiliates.country,
      website: affiliates.website,
      status: affiliates.status,
      kycStatus: affiliates.kycStatus,
      createdAt: affiliates.createdAt,
      approvedAt: affiliates.approvedAt,
      user: {
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email
      }
    })
      .from(affiliates)
      .innerJoin(users, eq(affiliates.userId, users.id))
      .where(whereClause)
      .orderBy(desc(affiliates.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Get stats for each affiliate
    const affiliateIds = allAffiliates.map(a => a.id);
    
    let clickStats: any[] = [];
    let conversionStats: any[] = [];
    
    if (affiliateIds.length > 0) {
      // Get click counts
      clickStats = await db.select({
        affiliateId: clicks.affiliateId,
        totalClicks: count()
      })
        .from(clicks)
        .where(inArray(clicks.affiliateId, affiliateIds))
        .groupBy(clicks.affiliateId);

      // Get conversion stats
      conversionStats = await db.select({
        affiliateId: conversions.affiliateId,
        totalConversions: count(),
        totalEarnings: sum(conversions.commissionAmount)
      })
        .from(conversions)
        .where(and(
          inArray(conversions.affiliateId, affiliateIds),
          eq(conversions.status, 'approved')
        ))
        .groupBy(conversions.affiliateId);
    }

    // Combine data
    const affiliatesWithStats = allAffiliates.map(affiliate => {
      const clickStat = clickStats.find(c => c.affiliateId === affiliate.id);
      const conversionStat = conversionStats.find(c => c.affiliateId === affiliate.id);
      
      return {
        ...affiliate,
        totalClicks: clickStat?.totalClicks || 0,
        totalConversions: conversionStat?.totalConversions || 0,
        totalEarnings: conversionStat?.totalEarnings || 0
      };
    });

    // Apply search filter if provided
    let filteredAffiliates = affiliatesWithStats;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredAffiliates = affiliatesWithStats.filter(affiliate => 
        affiliate.code.toLowerCase().includes(searchTerm) ||
        affiliate.user.email.toLowerCase().includes(searchTerm) ||
        `${affiliate.user.firstName} ${affiliate.user.lastName}`.toLowerCase().includes(searchTerm)
      );
    }

    res.json({ success: true, data: filteredAffiliates });
  } catch (error) {
    console.error('Failed to get affiliates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get affiliate stats summary
router.get('/affiliates/stats', requireAdmin, async (req, res) => {
  try {
    // Total affiliates
    const [totalAffiliates] = await db.select({ count: count() }).from(affiliates);
    
    // Pending affiliates
    const [pendingAffiliates] = await db.select({ count: count() })
      .from(affiliates)
      .where(eq(affiliates.status, 'pending'));
    
    // Active affiliates
    const [activeAffiliates] = await db.select({ count: count() })
      .from(affiliates)
      .where(eq(affiliates.status, 'approved'));

    // Total commissions
    const [totalCommissions] = await db.select({ 
      total: sum(conversions.commissionAmount) 
    })
      .from(conversions)
      .where(eq(conversions.status, 'approved'));

    // Monthly growth (simplified calculation)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const [thisMonthAffiliates] = await db.select({ count: count() })
      .from(affiliates)
      .where(gte(affiliates.createdAt, lastMonth));

    const [lastMonthAffiliates] = await db.select({ count: count() })
      .from(affiliates)
      .where(and(
        gte(affiliates.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1)),
        lte(affiliates.createdAt, lastMonth)
      ));

    const monthlyGrowth = lastMonthAffiliates.count > 0 
      ? Math.round(((thisMonthAffiliates.count - lastMonthAffiliates.count) / lastMonthAffiliates.count) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalAffiliates: totalAffiliates.count,
        pendingAffiliates: pendingAffiliates.count,
        activeAffiliates: activeAffiliates.count,
        totalCommissions: totalCommissions.total || 0,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('Failed to get affiliate stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Approve affiliate
router.post('/affiliates/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const [updatedAffiliate] = await db.update(affiliates)
      .set({
        status: 'approved',
        approvedBy: req.user.id,
        approvedAt: new Date(),
        notes,
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, id))
      .returning();

    if (!updatedAffiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    // Queue approval notification
    await db.insert(eventsOutbox).values({
      eventType: 'affiliate.approved',
      payload: {
        affiliateId: id,
        userId: updatedAffiliate.userId,
        approvedBy: req.user.id
      }
    });

    res.json({ success: true, message: 'Affiliate approved successfully', data: updatedAffiliate });
  } catch (error) {
    console.error('Failed to approve affiliate:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Suspend affiliate
router.post('/affiliates/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [updatedAffiliate] = await db.update(affiliates)
      .set({
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason: reason,
        updatedAt: new Date()
      })
      .where(eq(affiliates.id, id))
      .returning();

    if (!updatedAffiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    // Queue suspension notification
    await db.insert(eventsOutbox).values({
      eventType: 'affiliate.suspended',
      payload: {
        affiliateId: id,
        userId: updatedAffiliate.userId,
        reason
      }
    });

    res.json({ success: true, message: 'Affiliate suspended successfully', data: updatedAffiliate });
  } catch (error) {
    console.error('Failed to suspend affiliate:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all conversions with affiliate info
router.get('/conversions', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build where clause
    let whereClause: any = undefined;
    if (status && status !== 'all') {
      whereClause = eq(conversions.status, status as any);
    }

    // Get conversions with affiliate and plan info - flatten to avoid Drizzle nested object issues
    const allConversions = await db.select({
      id: conversions.id,
      orderId: conversions.orderId,
      affiliateId: conversions.affiliateId,
      amount: conversions.amount,
      currency: conversions.currency,
      commissionAmount: conversions.commissionAmount,
      commissionRate: conversions.commissionRate,
      status: conversions.status,
      planId: conversions.planId,
      createdAt: conversions.createdAt,
      approvedAt: conversions.approvedAt,
      reversedAt: conversions.reversedAt,
      lockUntil: conversions.lockUntil,
      affiliateCode: affiliates.code,
      affiliateFirstName: users.firstName,
      affiliateLastName: users.lastName,
      affiliateEmail: users.email,
      planName: subscriptionPlans.name,
      planType: subscriptionPlans.planType
    })
      .from(conversions)
      .innerJoin(affiliates, eq(conversions.affiliateId, affiliates.id))
      .innerJoin(users, eq(affiliates.userId, users.id))
      .leftJoin(subscriptionPlans, eq(conversions.planId, subscriptionPlans.id))
      .where(whereClause)
      .orderBy(desc(conversions.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    // Apply search filter if provided
    let filteredConversions = allConversions;
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredConversions = allConversions.filter(conversion => 
        conversion.orderId.toLowerCase().includes(searchTerm) ||
        conversion.affiliateCode.toLowerCase().includes(searchTerm) ||
        conversion.affiliateEmail.toLowerCase().includes(searchTerm)
      );
    }

    // Transform to nested structure for backwards compatibility
    const formattedConversions = filteredConversions.map(conv => ({
      id: conv.id,
      orderId: conv.orderId,
      affiliateId: conv.affiliateId,
      amount: conv.amount,
      currency: conv.currency,
      commissionAmount: conv.commissionAmount,
      commissionRate: conv.commissionRate,
      status: conv.status,
      planId: conv.planId,
      createdAt: conv.createdAt,
      approvedAt: conv.approvedAt,
      reversedAt: conv.reversedAt,
      lockUntil: conv.lockUntil,
      affiliate: {
        code: conv.affiliateCode,
        user: {
          firstName: conv.affiliateFirstName,
          lastName: conv.affiliateLastName,
          email: conv.affiliateEmail
        }
      },
      plan: conv.planName ? {
        name: conv.planName,
        planType: conv.planType
      } : null
    }));

    res.json({ success: true, data: formattedConversions });
  } catch (error) {
    console.error('Failed to get conversions:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get conversion stats summary
router.get('/conversions/stats', requireAdmin, async (req, res) => {
  try {
    // Total conversions
    const [totalConversions] = await db.select({ count: count() }).from(conversions);
    
    // Pending conversions
    const [pendingConversions] = await db.select({ count: count() })
      .from(conversions)
      .where(eq(conversions.status, 'pending'));
    
    // Approved conversions
    const [approvedConversions] = await db.select({ count: count() })
      .from(conversions)
      .where(eq(conversions.status, 'approved'));

    // Total commissions
    const [totalCommissions] = await db.select({ 
      total: sum(conversions.commissionAmount) 
    })
      .from(conversions)
      .where(eq(conversions.status, 'approved'));

    // Pending commissions
    const [pendingCommissions] = await db.select({ 
      total: sum(conversions.commissionAmount) 
    })
      .from(conversions)
      .where(eq(conversions.status, 'pending'));

    // Monthly growth (simplified calculation)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const [thisMonthConversions] = await db.select({ count: count() })
      .from(conversions)
      .where(gte(conversions.createdAt, lastMonth));

    const [lastMonthConversions] = await db.select({ count: count() })
      .from(conversions)
      .where(and(
        gte(conversions.createdAt, new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, 1)),
        lte(conversions.createdAt, lastMonth)
      ));

    const monthlyGrowth = lastMonthConversions.count > 0 
      ? Math.round(((thisMonthConversions.count - lastMonthConversions.count) / lastMonthConversions.count) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalConversions: totalConversions.count,
        pendingConversions: pendingConversions.count,
        approvedConversions: approvedConversions.count,
        totalCommissions: totalCommissions.total || 0,
        pendingCommissions: pendingCommissions.total || 0,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('Failed to get conversion stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Approve conversion
router.post('/conversions/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const [updatedConversion] = await db.update(conversions)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(conversions.id, id))
      .returning();

    if (!updatedConversion) {
      return res.status(404).json({ success: false, message: 'Conversion not found' });
    }

    // Update affiliate balance
    const currentBalance = await db.select({ balance: balances.runningBalance })
      .from(balances)
      .where(eq(balances.affiliateId, updatedConversion.affiliateId))
      .orderBy(desc(balances.createdAt))
      .limit(1);

    const newRunningBalance = (currentBalance[0]?.balance || 0) + updatedConversion.commissionAmount;

    await db.insert(balances).values({
      affiliateId: updatedConversion.affiliateId,
      delta: updatedConversion.commissionAmount,
      currency: 'USD',
      kind: 'credit',
      refType: 'conversion_approval',
      refId: updatedConversion.id,
      description: `Approved commission for order ${updatedConversion.orderId}`,
      runningBalance: newRunningBalance
    });

    // Queue approval notification
    await db.insert(eventsOutbox).values({
      eventType: 'conversion.approved',
      payload: {
        conversionId: id,
        affiliateId: updatedConversion.affiliateId,
        orderId: updatedConversion.orderId,
        commissionAmount: updatedConversion.commissionAmount
      }
    });

    res.json({ success: true, message: 'Conversion approved successfully', data: updatedConversion });
  } catch (error) {
    console.error('Failed to approve conversion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Reverse conversion
router.post('/conversions/:id/reverse', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Reason is required for reversal' });
    }

    const [existingConversion] = await db.select().from(conversions).where(eq(conversions.id, id)).limit(1);
    if (!existingConversion) {
      return res.status(404).json({ success: false, message: 'Conversion not found' });
    }

    const [updatedConversion] = await db.update(conversions)
      .set({
        status: 'reversed',
        reversedAt: new Date(),
        reversalReason: reason,
        updatedAt: new Date()
      })
      .where(eq(conversions.id, id))
      .returning();

    // If the conversion was previously approved, reverse the balance
    if (existingConversion.status === 'approved') {
      const currentBalance = await db.select({ balance: balances.runningBalance })
        .from(balances)
        .where(eq(balances.affiliateId, updatedConversion.affiliateId))
        .orderBy(desc(balances.createdAt))
        .limit(1);

      const newRunningBalance = (currentBalance[0]?.balance || 0) - updatedConversion.commissionAmount;

      await db.insert(balances).values({
        affiliateId: updatedConversion.affiliateId,
        delta: -updatedConversion.commissionAmount,
        currency: 'USD',
        kind: 'debit',
        refType: 'conversion_reversal',
        refId: updatedConversion.id,
        description: `Reversed commission for order ${updatedConversion.orderId}: ${reason}`,
        runningBalance: newRunningBalance
      });
    }

    // Queue reversal notification
    await db.insert(eventsOutbox).values({
      eventType: 'conversion.reversed',
      payload: {
        conversionId: id,
        affiliateId: updatedConversion.affiliateId,
        orderId: updatedConversion.orderId,
        reason
      }
    });

    res.json({ success: true, message: 'Conversion reversed successfully', data: updatedConversion });
  } catch (error) {
    console.error('Failed to reverse conversion:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get commission rules
router.get('/commission-rules', requireAdmin, async (req, res) => {
  try {
    const rules = await db.select().from(commissionRules).orderBy(desc(commissionRules.priority), desc(commissionRules.createdAt));
    res.json({ success: true, data: rules });
  } catch (error) {
    console.error('Failed to get commission rules:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create commission rule
router.post('/commission-rules', requireAdmin, async (req, res) => {
  try {
    const { name, scope, scopeValue, type, value, recurringEnabled, recurringValue, priority, effectiveFrom, effectiveTo } = req.body;

    const [newRule] = await db.insert(commissionRules).values({
      name,
      scope,
      scopeValue,
      type,
      value,
      recurringEnabled,
      recurringValue,
      priority: priority || 0,
      effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
      effectiveTo: effectiveTo ? new Date(effectiveTo) : null,
      isActive: true
    }).returning();

    res.json({ success: true, message: 'Commission rule created successfully', data: newRule });
  } catch (error) {
    console.error('Failed to create commission rule:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update commission rule
router.patch('/commission-rules/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const [updatedRule] = await db.update(commissionRules)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(commissionRules.id, id))
      .returning();

    if (!updatedRule) {
      return res.status(404).json({ message: 'Commission rule not found' });
    }

    res.json({ success: true, message: 'Commission rule updated successfully', data: updatedRule });
  } catch (error) {
    console.error('Failed to update commission rule:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// GET ALL PAYOUTS (Admin can view and process all payouts)
router.get('/payouts', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    let whereClause: any = undefined;
    if (status && status !== 'all') {
      whereClause = eq(payouts.status, status as any);
    }

    const allPayouts = await db.select({
      id: payouts.id,
      affiliateId: payouts.affiliateId,
      amount: payouts.amount,
      currency: payouts.currency,
      method: payouts.method,
      status: payouts.status,
      periodStart: payouts.periodStart,
      periodEnd: payouts.periodEnd,
      processedAt: payouts.processedAt,
      failureReason: payouts.failureReason,
      transactionRef: payouts.transactionRef,
      createdAt: payouts.createdAt,
      affiliateCode: affiliates.code,
      affiliateFirstName: users.firstName,
      affiliateLastName: users.lastName,
      affiliateEmail: users.email
    })
      .from(payouts)
      .innerJoin(affiliates, eq(payouts.affiliateId, affiliates.id))
      .innerJoin(users, eq(affiliates.userId, users.id))
      .where(whereClause)
      .orderBy(desc(payouts.createdAt))
      .limit(parseInt(limit as string))
      .offset(offset);

    const [totalCount] = await db.select({ count: count() })
      .from(payouts)
      .where(whereClause);

    res.json({
      success: true,
      data: {
        payouts: allPayouts,
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

// APPROVE PAYOUT (Maker approval - first level)
router.post('/payouts/:id/approve', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    // Get current payout
    const [currentPayout] = await db.select().from(payouts).where(eq(payouts.id, id));
    
    if (!currentPayout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }

    if (currentPayout.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Can only approve draft payouts' });
    }

    // Update to maker_approved
    const [updatedPayout] = await db.update(payouts)
      .set({
        status: 'maker_approved',
        makerUserId: req.user.id,
        notes: notes || currentPayout.notes,
        updatedAt: new Date()
      })
      .where(eq(payouts.id, id))
      .returning();

    // Queue approval notification
    await db.insert(eventsOutbox).values({
      eventType: 'payout.maker_approved',
      payload: {
        payoutId: id,
        affiliateId: currentPayout.affiliateId,
        amount: currentPayout.amount,
        approvedBy: req.user.id
      }
    });

    res.json({ success: true, message: 'Payout approved by maker', data: updatedPayout });
  } catch (error) {
    console.error('Failed to approve payout:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// VERIFY PAYOUT (Checker approval - second level)
router.post('/payouts/:id/verify', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const [currentPayout] = await db.select().from(payouts).where(eq(payouts.id, id));
    
    if (!currentPayout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }

    if (currentPayout.status !== 'maker_approved') {
      return res.status(400).json({ success: false, message: 'Payout must be maker-approved first' });
    }

    // Update to checker_approved
    const [updatedPayout] = await db.update(payouts)
      .set({
        status: 'checker_approved',
        checkerUserId: req.user.id,
        notes: notes || currentPayout.notes,
        updatedAt: new Date()
      })
      .where(eq(payouts.id, id))
      .returning();

    // Queue verification notification
    await db.insert(eventsOutbox).values({
      eventType: 'payout.checker_approved',
      payload: {
        payoutId: id,
        affiliateId: currentPayout.affiliateId,
        amount: currentPayout.amount,
        verifiedBy: req.user.id
      }
    });

    res.json({ success: true, message: 'Payout verified by checker', data: updatedPayout });
  } catch (error) {
    console.error('Failed to verify payout:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// PROCESS PAYOUT (Final processing - execute payment)
router.post('/payouts/:id/process', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { transactionRef, notes } = req.body;

    const [currentPayout] = await db.select().from(payouts).where(eq(payouts.id, id));
    
    if (!currentPayout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }

    if (currentPayout.status !== 'checker_approved') {
      return res.status(400).json({ success: false, message: 'Payout must be checker-approved first' });
    }

    // Get affiliate to verify payout method
    const [affiliate] = await db.select().from(affiliates).where(eq(affiliates.id, currentPayout.affiliateId));
    
    if (!affiliate || !affiliate.payoutDetails) {
      return res.status(400).json({ success: false, message: 'Affiliate payout details not configured' });
    }

    // SECURITY: Update payout to paid status
    const [updatedPayout] = await db.update(payouts)
      .set({
        status: 'paid',
        transactionRef: transactionRef || null,
        processedAt: new Date(),
        notes: notes || currentPayout.notes,
        updatedAt: new Date()
      })
      .where(eq(payouts.id, id))
      .returning();

    // Add final balance entry (payout processed)
    await db.insert(balances).values({
      affiliateId: currentPayout.affiliateId,
      delta: 0, // Already debited when payout was requested
      currency: 'USD',
      kind: 'debit',
      refType: 'payout',
      refId: id,
      description: `Payout processed #${id.substring(0, 8)} - ${currentPayout.method} - Transaction: ${transactionRef || 'N/A'}`,
      runningBalance: 0 // Will be calculated
    });

    // Queue payout processed notification
    await db.insert(eventsOutbox).values({
      eventType: 'payout.processed',
      payload: {
        payoutId: id,
        affiliateId: currentPayout.affiliateId,
        amount: currentPayout.amount,
        method: currentPayout.method,
        transactionRef
      }
    });

    res.json({ success: true, message: 'Payout processed successfully', data: updatedPayout });
  } catch (error) {
    console.error('Failed to process payout:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// REJECT/CANCEL PAYOUT
router.post('/payouts/:id/cancel', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ success: false, message: 'Cancellation reason is required' });
    }

    const [currentPayout] = await db.select().from(payouts).where(eq(payouts.id, id));
    
    if (!currentPayout) {
      return res.status(404).json({ success: false, message: 'Payout not found' });
    }

    if (currentPayout.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Cannot cancel paid payouts' });
    }

    // Cancel payout
    const [cancelledPayout] = await db.update(payouts)
      .set({
        status: 'cancelled',
        failureReason: reason,
        updatedAt: new Date()
      })
      .where(eq(payouts.id, id))
      .returning();

    // Reverse the balance entry (credit back the amount)
    await db.insert(balances).values({
      affiliateId: currentPayout.affiliateId,
      delta: currentPayout.amount, // Positive = credit back
      currency: 'USD',
      kind: 'credit',
      refType: 'payout',
      refId: id,
      description: `Payout cancelled #${id.substring(0, 8)} - Reason: ${reason}`,
      runningBalance: 0 // Will be calculated
    });

    // Queue cancellation notification
    await db.insert(eventsOutbox).values({
      eventType: 'payout.cancelled',
      payload: {
        payoutId: id,
        affiliateId: currentPayout.affiliateId,
        amount: currentPayout.amount,
        reason,
        cancelledBy: req.user.id
      }
    });

    res.json({ success: true, message: 'Payout cancelled successfully', data: cancelledPayout });
  } catch (error) {
    console.error('Failed to cancel payout:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;