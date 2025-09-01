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
  if (!req.user || req.user.role !== 'admin') {
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

    res.json(filteredAffiliates);
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
      totalAffiliates: totalAffiliates.count,
      pendingAffiliates: pendingAffiliates.count,
      activeAffiliates: activeAffiliates.count,
      totalCommissions: totalCommissions.total || 0,
      monthlyGrowth
    });
  } catch (error) {
    console.error('Failed to get affiliate stats:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    res.json({ message: 'Affiliate approved successfully', affiliate: updatedAffiliate });
  } catch (error) {
    console.error('Failed to approve affiliate:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    res.json({ message: 'Affiliate suspended successfully', affiliate: updatedAffiliate });
  } catch (error) {
    console.error('Failed to suspend affiliate:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    // Get conversions with affiliate and plan info
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
      affiliate: {
        code: affiliates.code,
        user: {
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email
        }
      },
      plan: subscriptionPlans.planId ? {
        name: subscriptionPlans.name,
        planType: subscriptionPlans.planType
      } : null
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
        conversion.affiliate.code.toLowerCase().includes(searchTerm) ||
        conversion.affiliate.user.email.toLowerCase().includes(searchTerm)
      );
    }

    res.json(filteredConversions);
  } catch (error) {
    console.error('Failed to get conversions:', error);
    res.status(500).json({ message: 'Internal server error' });
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
      totalConversions: totalConversions.count,
      pendingConversions: pendingConversions.count,
      approvedConversions: approvedConversions.count,
      totalCommissions: totalCommissions.total || 0,
      pendingCommissions: pendingCommissions.total || 0,
      monthlyGrowth
    });
  } catch (error) {
    console.error('Failed to get conversion stats:', error);
    res.status(500).json({ message: 'Internal server error' });
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
      return res.status(404).json({ message: 'Conversion not found' });
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

    res.json({ message: 'Conversion approved successfully', conversion: updatedConversion });
  } catch (error) {
    console.error('Failed to approve conversion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Reverse conversion
router.post('/conversions/:id/reverse', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason is required for reversal' });
    }

    const [existingConversion] = await db.select().from(conversions).where(eq(conversions.id, id)).limit(1);
    if (!existingConversion) {
      return res.status(404).json({ message: 'Conversion not found' });
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

    res.json({ message: 'Conversion reversed successfully', conversion: updatedConversion });
  } catch (error) {
    console.error('Failed to reverse conversion:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get commission rules
router.get('/commission-rules', requireAdmin, async (req, res) => {
  try {
    const rules = await db.select().from(commissionRules).orderBy(desc(commissionRules.priority), desc(commissionRules.createdAt));
    res.json(rules);
  } catch (error) {
    console.error('Failed to get commission rules:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    res.json({ message: 'Commission rule created successfully', rule: newRule });
  } catch (error) {
    console.error('Failed to create commission rule:', error);
    res.status(500).json({ message: 'Internal server error' });
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

    res.json({ message: 'Commission rule updated successfully', rule: updatedRule });
  } catch (error) {
    console.error('Failed to update commission rule:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;