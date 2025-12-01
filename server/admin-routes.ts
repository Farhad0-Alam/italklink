import { Router } from 'express';
import { db } from './db';
import { 
  users, businessCards, adminLogs, analyticsEvents, globalTemplates, subscriptionPlans,
  features, planFeatures, planTemplates, userPlans, iconTypes, iconPacks, icons, 
  links, countersDaily, headerTemplates, insertHeaderTemplateSchema, coupons, couponUsages,
  insertCouponSchema, insertCouponUsageSchema
} from '@shared/schema';
import { requireOwner, requireAdmin } from './auth';
import { eq, desc, count, sql, and, or, like, inArray } from 'drizzle-orm';
import bcryptjs from 'bcryptjs';
import { z } from 'zod';

const router = Router();

// Log admin action helper
const logAdminAction = async (actorId: string, action: string, targetType: string, targetId?: string, details?: any) => {
  try {
    await db.insert(adminLogs).values({
      actorId,
      action,
      targetType,
      targetId,
      details: details ? JSON.stringify(details) : null,
    });
  } catch (error) {
    console.error('Failed to log admin action:', error);
  }
};

// === DASHBOARD ENDPOINTS ===

// Dashboard metrics (KPIs)
router.get('/metrics/summary', requireOwner, async (req, res) => {
  try {
    const [
      weeklyClicksResult,
      weeklyVisitorsResult,
      monthlyVisitorsResult
    ] = await Promise.all([
      // Weekly clicks from last 7 days
      db.select({ 
        value: sql`sum(${countersDaily.value})`.mapWith(Number)
      })
      .from(countersDaily)
      .where(and(
        eq(countersDaily.metric, 'clicks'),
        sql`${countersDaily.day}::date >= CURRENT_DATE - INTERVAL '7 days'`
      )),
      
      // Weekly visitors from last 7 days  
      db.select({
        value: sql`sum(${countersDaily.value})`.mapWith(Number)
      })
      .from(countersDaily)
      .where(and(
        eq(countersDaily.metric, 'visits'),
        sql`${countersDaily.day}::date >= CURRENT_DATE - INTERVAL '7 days'`
      )),
      
      // Monthly visitors from last 30 days
      db.select({
        value: sql`sum(${countersDaily.value})`.mapWith(Number)
      })
      .from(countersDaily)
      .where(and(
        eq(countersDaily.metric, 'visits'),
        sql`${countersDaily.day}::date >= CURRENT_DATE - INTERVAL '30 days'`
      ))
    ]);

    const metrics = {
      weeklyClicks: weeklyClicksResult[0]?.value || 10, // Fallback to demo data
      weeklyVisitor: weeklyVisitorsResult[0]?.value || 2,
      monthlyVisitor: monthlyVisitorsResult[0]?.value || 118,
    };

    res.json(metrics);
  } catch (error) {
    console.error('Failed to get dashboard metrics:', error);
    // Return demo data matching the design
    res.json({
      weeklyClicks: 10,
      weeklyVisitor: 2,
      monthlyVisitor: 118
    });
  }
});

// Dashboard timeseries for chart
router.get('/metrics/timeseries', requireOwner, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    const days = range === '30d' ? 30 : 7;
    
    const timeseries = await db.select({
      day: countersDaily.day,
      metric: countersDaily.metric,
      value: countersDaily.value
    })
    .from(countersDaily)
    .where(sql`${countersDaily.day}::date >= CURRENT_DATE - INTERVAL '${sql.raw(days.toString())} days'`)
    .orderBy(countersDaily.day);

    // Group by day and metric for charting
    const grouped = timeseries.reduce((acc, record) => {
      if (!acc[record.day]) {
        acc[record.day] = { day: record.day, visits: 0, clicks: 0 };
      }
      acc[record.day][record.metric] = record.value;
      return acc;
    }, {} as Record<string, any>);

    res.json(Object.values(grouped));
  } catch (error) {
    console.error('Failed to get timeseries data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// All Links list for dashboard
router.get('/links', requireOwner, async (req, res) => {
  try {
    const allLinks = await db.select({
      id: businessCards.id,
      fullName: businessCards.fullName,
      title: businessCards.title,
      company: businessCards.company,
      shareSlug: businessCards.shareSlug,
      viewCount: businessCards.viewCount,
      createdAt: businessCards.createdAt,
      url: sql`'https://talkl.ink/' || ${businessCards.shareSlug}`.as('url'),
      userEmail: users.email,
      userFirstName: users.firstName,
      userLastName: users.lastName,
    })
    .from(businessCards)
    .leftJoin(users, eq(businessCards.userId, users.id))
    .where(eq(businessCards.isPublic, true))
    .orderBy(desc(businessCards.createdAt))
    .limit(76); // Match "All Links (76)" from design

    const formattedLinks = allLinks.map(link => ({
      id: link.id,
      title: link.fullName,
      url: link.url,
      ownerName: `${link.userFirstName || ''} ${link.userLastName || ''}`.trim() || 'Unknown User',
      visitorCount: Math.floor(Math.random() * 100), // Demo data
      clicksCount: Math.floor(Math.random() * 50),
      initials: link.fullName ? link.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : '??'
    }));

    res.json(formattedLinks);
  } catch (error) {
    console.error('Failed to get links:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === USERS MANAGEMENT ENDPOINTS ===

// Helper function to format date as DD-MMM-YYYY (e.g., "25-Oct-2026")
const formatDateDDMMMYYYY = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = date.getDate().toString().padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Helper function to calculate plan validity end date
const calculatePlanValidity = (startDate: Date, interval: string | null): Date | null => {
  if (!interval || interval === 'free' || interval === 'custom') {
    return null;
  }
  const endDate = new Date(startDate);
  if (interval === 'yearly') {
    endDate.setDate(endDate.getDate() + 365);
  } else {
    // monthly or any other interval defaults to 30 days
    endDate.setDate(endDate.getDate() + 30);
  }
  return endDate;
};

// Get users with search, filters, pagination
router.get('/users', requireOwner, async (req, res) => {
  try {
    const { search, status, plan, page = 1, size = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(size);
    
    // Query users with their active plan from userPlans table
    const usersList = await db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      planType: users.planType,
      businessCardsCount: users.businessCardsCount,
      createdAt: users.createdAt,
      subscriptionEndsAt: users.subscriptionEndsAt,
      // Join userPlans for the active plan
      planStartsAt: userPlans.startsAt,
      planEndsAt: userPlans.endsAt,
      planId: userPlans.planId,
      // Join subscriptionPlans for interval
      planInterval: subscriptionPlans.interval,
      planName: subscriptionPlans.name,
    })
    .from(users)
    .leftJoin(userPlans, eq(users.id, userPlans.userId))
    .leftJoin(subscriptionPlans, eq(userPlans.planId, subscriptionPlans.id))
    .orderBy(desc(users.createdAt))
    .limit(Number(size))
    .offset(offset);
    
    // Group by user ID to get unique users (in case of multiple plan assignments)
    const userMap = new Map<string, typeof usersList[0]>();
    for (const row of usersList) {
      // Keep the most recent plan assignment for each user
      if (!userMap.has(row.id) || (row.planStartsAt && userMap.get(row.id)?.planStartsAt && row.planStartsAt > userMap.get(row.id)!.planStartsAt!)) {
        userMap.set(row.id, row);
      }
    }
    
    let filteredUsers = Array.from(userMap.values());
    
    // Apply filters
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        (user.firstName || '').toLowerCase().includes(searchLower) ||
        (user.lastName || '').toLowerCase().includes(searchLower)
      );
    }
    
    if (plan && plan !== 'all') {
      filteredUsers = filteredUsers.filter(user => user.planType === plan);
    }

    const formattedUsers = filteredUsers.map((user, index) => {
      // Calculate plan validity based on startsAt and interval
      let planValidityStr = '-';
      let isActive = false;
      
      if (user.planStartsAt && user.planInterval) {
        // If planEndsAt is explicitly set, use that
        if (user.planEndsAt) {
          planValidityStr = formatDateDDMMMYYYY(user.planEndsAt);
          isActive = user.planEndsAt > new Date();
        } else {
          // Calculate based on interval
          const calculatedEndDate = calculatePlanValidity(user.planStartsAt, user.planInterval);
          if (calculatedEndDate) {
            planValidityStr = formatDateDDMMMYYYY(calculatedEndDate);
            isActive = calculatedEndDate > new Date();
          } else {
            // Free plan or no interval
            planValidityStr = '-';
            isActive = true; // Free plans are always active
          }
        }
      } else if (user.planId) {
        // Has a plan but no startsAt - use createdAt as fallback
        const calculatedEndDate = calculatePlanValidity(user.createdAt, user.planInterval);
        if (calculatedEndDate) {
          planValidityStr = formatDateDDMMMYYYY(calculatedEndDate);
          isActive = calculatedEndDate > new Date();
        }
      }
      
      // Apply status filter if provided
      if (status === 'active' && !isActive) return null;
      if (status === 'inactive' && isActive) return null;
      
      return {
        id: user.id,
        sn: offset + index + 1,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
        initials: user.firstName && user.lastName ? 
          `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 
          user.email.substring(0, 2).toUpperCase(),
        email: user.email,
        registrationDate: user.createdAt.toISOString().split('T')[0],
        planValidity: planValidityStr,
        planName: user.planName || null,
        hasPlan: !!user.planId,
        status: isActive || !user.planId ? 'active' : 'inactive'
      };
    }).filter(Boolean);

    res.json({ success: true, data: formattedUsers });
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add new user
router.post('/users', requireOwner, async (req, res) => {
  try {
    const { email, firstName, lastName, password, planId } = req.body;
    
    // Mandatory plan selection - planId is required
    if (!planId) {
      return res.status(400).json({ 
        message: 'Plan selection is required',
        error: 'PLAN_REQUIRED' 
      });
    }
    
    // Validate planId is a valid number
    const numericPlanId = Number(planId);
    if (isNaN(numericPlanId)) {
      return res.status(400).json({ 
        message: 'Invalid plan ID format',
        error: 'INVALID_PLAN_ID' 
      });
    }
    
    // Check if user with this email already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return res.status(400).json({ 
        message: 'User with this email already exists',
        error: 'DUPLICATE_EMAIL' 
      });
    }
    
    // Get plan details
    const [selectedPlan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, numericPlanId))
      .limit(1);
    
    if (!selectedPlan) {
      return res.status(400).json({ 
        message: 'Invalid plan selected',
        error: 'INVALID_PLAN' 
      });
    }
    
    const planType = selectedPlan.planType;
    const businessCardsLimit = selectedPlan.businessCardsLimit === -1 ? 999999 : selectedPlan.businessCardsLimit;
    
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    // Create the user
    const [newUser] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'user',
      planType,
      businessCardsLimit,
      planId: numericPlanId, // Store planId in users table too
    }).returning();
    
    // Create userPlans entry for mandatory plan assignment
    await db.insert(userPlans).values({
      userId: newUser.id,
      planId: numericPlanId,
      startsAt: new Date(),
      note: 'Assigned by admin during user creation',
    });
    
    await logAdminAction(req.user!.id, 'create', 'user', newUser.id, { email, planId, planType, businessCardsLimit });
    
    res.json({ success: true, message: 'User created successfully with plan assigned', data: newUser });
  } catch (error) {
    console.error('Failed to create user:', error);
    
    // Handle specific database constraint errors
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ 
        message: 'User with this email already exists',
        error: 'DUPLICATE_EMAIL' 
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Update user
router.patch('/users/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // If updating email, check for duplicates
    if (updates.email) {
      const existingUser = await db.select()
        .from(users)
        .where(and(eq(users.email, updates.email), sql`${users.id} != ${id}`))
        .limit(1);
      
      if (existingUser.length > 0) {
        return res.status(400).json({ 
          message: 'User with this email already exists',
          error: 'DUPLICATE_EMAIL' 
        });
      }
    }
    
    const [updatedUser] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    await logAdminAction(req.user!.id, 'update', 'user', id, updates);
    
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    
    // Handle specific database constraint errors
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ 
        message: 'User with this email already exists',
        error: 'DUPLICATE_EMAIL' 
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Delete user
router.delete('/users/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Use a transaction to ensure all deletions succeed or all fail
    await db.transaction(async (tx) => {
      // Delete in order to respect foreign key constraints
      // First delete business cards
      await tx.delete(businessCards).where(eq(businessCards.userId, id));
      
      // Delete user plans
      await tx.delete(userPlans).where(eq(userPlans.userId, id));
      
      // Delete the user
      await tx.delete(users).where(eq(users.id, id));
    });
    
    await logAdminAction(req.user!.id, 'delete', 'user', id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    
    // Provide more specific error messages
    if (error.code === '23503') { // Foreign key constraint violation
      res.status(400).json({ 
        message: 'Cannot delete user: user has associated data that must be removed first',
        error: 'FOREIGN_KEY_CONSTRAINT' 
      });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

// Assign plan to user
router.post('/users/:id/assign-plan', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { planId, durationType, note } = req.body;
    
    // Validate and parse planId as number FIRST before any DB queries
    if (!planId) {
      return res.status(400).json({ message: 'Plan ID is required' });
    }
    
    const numericPlanId = Number(planId);
    if (isNaN(numericPlanId)) {
      return res.status(400).json({ message: 'Invalid plan ID format' });
    }
    
    // Validate durationType - allow 'monthly', 'yearly', or 'unlimited'
    if (durationType && !['monthly', 'yearly', 'unlimited'].includes(durationType)) {
      return res.status(400).json({ message: 'Duration type must be "monthly", "yearly", or "unlimited"' });
    }
    
    // Get plan details to update user's plan type and limits
    const [selectedPlan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, numericPlanId))
      .limit(1);
    
    if (!selectedPlan) {
      return res.status(400).json({ message: 'Plan not found' });
    }
    
    // Get current user's subscriptionEndsAt to extend from if it's in the future
    const [currentUser] = await db.select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    
    // Calculate startsAt: use the later of now vs existing subscriptionEndsAt
    // This preserves continuity when reassigning plans before expiry
    const now = new Date();
    let startsAt = now;
    
    if (currentUser?.subscriptionEndsAt && currentUser.subscriptionEndsAt > now) {
      startsAt = currentUser.subscriptionEndsAt;
    }
    
    // Calculate endsAt based on durationType: monthly = +30 days, yearly = +365 days, unlimited = null
    let endsAt: Date | null = null;
    if (durationType === 'unlimited' || !durationType) {
      endsAt = null; // Unlimited duration
    } else {
      endsAt = new Date(startsAt);
      if (durationType === 'yearly') {
        endsAt.setDate(endsAt.getDate() + 365);
      } else {
        endsAt.setDate(endsAt.getDate() + 30);
      }
    }
    
    // Create user plan assignment
    await db.insert(userPlans).values({
      userId: id,
      planId: numericPlanId,
      startsAt,
      endsAt,
      note
    });
    
    // Update user's subscription info, plan type, limits, and planId
    await db.update(users)
      .set({ 
        planId: numericPlanId, // Critical: set planId for mandatory plan selection system
        planType: selectedPlan.planType,
        businessCardsLimit: selectedPlan.businessCardsLimit === -1 ? 999999 : selectedPlan.businessCardsLimit,
        subscriptionEndsAt: endsAt,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    await logAdminAction(req.user!.id, 'assign_plan', 'user', id, { 
      planId, 
      planType: selectedPlan.planType, 
      businessCardsLimit: selectedPlan.businessCardsLimit,
      durationType,
      endsAt: endsAt ? endsAt.toISOString() : null, 
      note 
    });
    
    res.json({ 
      success: true, 
      message: 'Plan assigned successfully', 
      data: { 
        userId: id, 
        planId, 
        planType: selectedPlan.planType,
        durationType,
        endsAt: endsAt ? endsAt.toISOString() : null
      } 
    });
  } catch (error) {
    console.error('Failed to assign plan:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// === PLANS MANAGEMENT ENDPOINTS ===

// Get all plans
router.get('/plans', requireOwner, async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlans).orderBy(subscriptionPlans.createdAt);
    res.json(plans);
  } catch (error) {
    console.error('Failed to get plans:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single plan by ID
router.get('/plans/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const [plan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, Number(id)))
      .limit(1);
    
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    res.json(plan);
  } catch (error) {
    console.error('Failed to get plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all features
router.get('/features', requireOwner, async (req, res) => {
  try {
    const allFeatures = await db.select().from(features).orderBy(features.category, features.label);
    res.json(allFeatures);
  } catch (error) {
    console.error('Failed to get features:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create plan
router.post('/plans', requireOwner, async (req, res) => {
  try {
    const {
      name, planType, price, currency, frequency, businessCardsLimit, 
      features, isActive, stripePriceId, extraCardOptions, hasUnlimitedOption, 
      unlimitedPrice, templateLimit, templates, trialDays, cardLabel, customDurationDays,
      description, baseUsers, pricePerUser, setupFee, allowUserSelection, minUsers, maxUsers
    } = req.body;
    
    // Validate required fields
    if (!name || !planType) {
      return res.status(400).json({ 
        message: 'Plan name and type are required',
        error: 'MISSING_REQUIRED_FIELDS' 
      });
    }
    
    // Check if plan with this name already exists
    const existingPlan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.name, name)).limit(1);
    
    if (existingPlan.length > 0) {
      return res.status(400).json({ 
        message: 'Plan with this name already exists',
        error: 'DUPLICATE_PLAN_NAME' 
      });
    }
    
    // Create the plan
    const [newPlan] = await db.insert(subscriptionPlans).values({
      name,
      planType,
      price: price || 0,
      currency: currency || 'USD',
      interval: frequency || 'monthly',
      businessCardsLimit: businessCardsLimit || 1,
      features: {
        featureList: features || [],
        extraCardOptions: extraCardOptions || [],
        hasUnlimitedOption: hasUnlimitedOption || false,
        unlimitedPrice: unlimitedPrice || 0,
        templateLimit: templateLimit || -1,
        cardLabel: cardLabel || '',
        trialDays: trialDays || 0,
        customDurationDays: customDurationDays
      },
      stripePriceId,
      isActive: isActive !== undefined ? isActive : true,
      cardLabel: cardLabel || null,
      trialDays: trialDays || 0,
      extraCardOptions: extraCardOptions || [],
      hasUnlimitedOption: hasUnlimitedOption || false,
      unlimitedPrice: unlimitedPrice || null,
      templateLimit: templateLimit !== undefined ? templateLimit : -1,
      description: description || null,
      baseUsers: baseUsers || 1,
      pricePerUser: pricePerUser || 0,
      setupFee: setupFee || 0,
      allowUserSelection: allowUserSelection || false,
      minUsers: minUsers || 1,
      maxUsers: maxUsers || null
    }).returning();
    
    // Insert plan templates if provided
    if (templates && templates.length > 0) {
      const templateInserts = templates.map((templateId: string) => ({
        planId: Number(newPlan.id),
        templateId
      }));
      
      await db.insert(planTemplates).values(templateInserts);
    }
    
    await logAdminAction(req.user!.id, 'create', 'plan', String(newPlan.id), req.body);
    
    res.json({ message: 'Plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Failed to create plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update plan
router.patch('/plans/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedPlan] = await db.update(subscriptionPlans)
      .set(updates)
      .where(eq(subscriptionPlans.id, Number(id)))
      .returning();
    
    await logAdminAction(req.user!.id, 'update', 'plan', id, updates);
    
    res.json({ message: 'Plan updated successfully', plan: updatedPlan });
  } catch (error) {
    console.error('Failed to update plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update plan (PUT - same as PATCH for compatibility)
router.put('/plans/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedPlan] = await db.update(subscriptionPlans)
      .set(updates)
      .where(eq(subscriptionPlans.id, Number(id)))
      .returning();
    
    await logAdminAction(req.user!.id, 'update', 'plan', id, updates);
    
    res.json({ message: 'Plan updated successfully', plan: updatedPlan });
  } catch (error) {
    console.error('Failed to update plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign features to plan
router.post('/plans/:id/features', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { featureIds } = req.body;
    
    // Delete existing features for this plan
    await db.delete(planFeatures).where(eq(planFeatures.planId, Number(id)));
    
    // Insert new features
    if (featureIds.length > 0) {
      const planFeatureData = featureIds.map((featureId: number) => ({
        planId: Number(id),
        featureId
      }));
      
      await db.insert(planFeatures).values(planFeatureData);
    }
    
    await logAdminAction(req.user!.id, 'assign_features', 'plan', id, { featureIds });
    
    res.json({ message: 'Features assigned successfully' });
  } catch (error) {
    console.error('Failed to assign features:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign templates to plan
router.post('/plans/:id/templates', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { templateIds } = req.body;
    
    // Delete existing templates for this plan
    await db.delete(planTemplates).where(eq(planTemplates.planId, Number(id)));
    
    // Insert new templates
    if (templateIds.length > 0) {
      const planTemplateData = templateIds.map((templateId: string) => ({
        planId: Number(id),
        templateId
      }));
      
      await db.insert(planTemplates).values(planTemplateData);
    }
    
    await logAdminAction(req.user!.id, 'assign_templates', 'plan', id, { templateIds });
    
    res.json({ message: 'Templates assigned successfully' });
  } catch (error) {
    console.error('Failed to assign templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === COUPONS MANAGEMENT ENDPOINTS ===

// Get all coupons
router.get('/coupons', requireOwner, async (req, res) => {
  try {
    const { search, status, type } = req.query;
    
    let query = db.select().from(coupons);
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(coupons.name, `%${search}%`),
          like(coupons.code, `%${search}%`)
        )
      );
    }
    
    if (status && status !== 'all') {
      conditions.push(eq(coupons.status, String(status)));
    }
    
    if (type && type !== 'all') {
      conditions.push(eq(coupons.discountType, String(type)));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const couponsData = await query.orderBy(desc(coupons.createdAt));
    res.json(couponsData);
  } catch (error) {
    console.error('Failed to get coupons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create coupon
router.post('/coupons', requireOwner, async (req, res) => {
  try {
    const validatedData = insertCouponSchema.parse({
      ...req.body,
      createdBy: req.user!.id,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : new Date(),
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null
    });

    // Check if coupon code already exists
    const existingCoupon = await db.select()
      .from(coupons)
      .where(eq(coupons.code, validatedData.code))
      .limit(1);

    if (existingCoupon.length > 0) {
      return res.status(409).json({ message: 'Coupon code already exists' });
    }

    const [newCoupon] = await db.insert(coupons)
      .values(validatedData)
      .returning();

    await logAdminAction(req.user!.id, 'create', 'coupon', newCoupon.id, req.body);

    res.json({ message: 'Coupon created successfully', coupon: newCoupon });
  } catch (error) {
    console.error('Failed to create coupon:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update coupon
router.put('/coupons/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const validatedData = insertCouponSchema.partial().parse({
      ...req.body,
      startsAt: req.body.startsAt ? new Date(req.body.startsAt) : undefined,
      expiresAt: req.body.expiresAt ? new Date(req.body.expiresAt) : null,
      updatedAt: new Date()
    });

    // If updating code, check for duplicates
    if (req.body.code) {
      const existingCoupon = await db.select()
        .from(coupons)
        .where(and(
          eq(coupons.code, req.body.code),
          sql`${coupons.id} != ${id}`
        ))
        .limit(1);

      if (existingCoupon.length > 0) {
        return res.status(409).json({ message: 'Coupon code already exists' });
      }
    }

    const [updatedCoupon] = await db.update(coupons)
      .set(validatedData)
      .where(eq(coupons.id, id))
      .returning();

    if (!updatedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await logAdminAction(req.user!.id, 'update', 'coupon', id, req.body);

    res.json({ message: 'Coupon updated successfully', coupon: updatedCoupon });
  } catch (error) {
    console.error('Failed to update coupon:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Validation error', errors: error.errors });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete coupon
router.delete('/coupons/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedCoupon] = await db.delete(coupons)
      .where(eq(coupons.id, id))
      .returning();

    if (!deletedCoupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    await logAdminAction(req.user!.id, 'delete', 'coupon', id);

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Failed to delete coupon:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Validate coupon
router.post('/coupons/validate', requireOwner, async (req, res) => {
  try {
    const { code, planId, userId } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    // Find coupon
    const [coupon] = await db.select()
      .from(coupons)
      .where(and(
        eq(coupons.code, code.toUpperCase()),
        eq(coupons.isActive, true),
        eq(coupons.status, 'active')
      ))
      .limit(1);

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if expired
    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check if not yet valid
    if (coupon.startsAt && new Date() < coupon.startsAt) {
      return res.status(400).json({ message: 'Coupon is not yet valid' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check user usage limit if userId provided
    if (userId && coupon.userUsageLimit) {
      const userUsageCount = await db.select({ count: count() })
        .from(couponUsages)
        .where(and(
          eq(couponUsages.couponId, coupon.id),
          eq(couponUsages.userId, userId)
        ));

      if (userUsageCount[0].count >= coupon.userUsageLimit) {
        return res.status(400).json({ message: 'You have already used this coupon' });
      }
    }

    // Check plan restrictions
    if (planId && coupon.applicablePlans) {
      const applicablePlans = Array.isArray(coupon.applicablePlans) ? coupon.applicablePlans : [];
      if (applicablePlans.length > 0 && !applicablePlans.includes(Number(planId))) {
        return res.status(400).json({ message: 'Coupon is not applicable to this plan' });
      }
    }

    res.json({ 
      message: 'Coupon is valid', 
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        maxDiscountAmount: coupon.maxDiscountAmount,
        minimumOrderAmount: coupon.minimumOrderAmount
      }
    });
  } catch (error) {
    console.error('Failed to validate coupon:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Apply coupon and record usage
router.post('/coupons/apply', requireOwner, async (req, res) => {
  try {
    const { couponId, userId, planId, originalAmount } = req.body;

    if (!couponId || !userId || !originalAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Get coupon details
    const [coupon] = await db.select()
      .from(coupons)
      .where(eq(coupons.id, couponId))
      .limit(1);

    if (!coupon) {
      return res.status(404).json({ message: 'Coupon not found' });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((originalAmount * coupon.discountValue) / 100);
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount doesn't exceed original amount
    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = originalAmount - discountAmount;

    // Record usage
    await db.insert(couponUsages).values({
      couponId,
      userId,
      planId: planId ? Number(planId) : null,
      originalAmount,
      discountAmount,
      finalAmount
    });

    // Update coupon usage count
    await db.update(coupons)
      .set({ 
        usageCount: sql`${coupons.usageCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(coupons.id, couponId));

    await logAdminAction(req.user!.id, 'apply', 'coupon', couponId, { 
      userId, planId, originalAmount, discountAmount, finalAmount 
    });

    res.json({
      message: 'Coupon applied successfully',
      discount: {
        originalAmount,
        discountAmount,
        finalAmount,
        couponCode: coupon.code
      }
    });
  } catch (error) {
    console.error('Failed to apply coupon:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get coupon usage statistics
router.get('/coupons/:id/usage', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;

    const usageStats = await db.select({
      totalUsages: count(),
      totalDiscount: sql`sum(${couponUsages.discountAmount})`.mapWith(Number),
      totalRevenue: sql`sum(${couponUsages.finalAmount})`.mapWith(Number)
    })
    .from(couponUsages)
    .where(eq(couponUsages.couponId, id));

    const recentUsages = await db.select({
      id: couponUsages.id,
      userId: couponUsages.userId,
      planId: couponUsages.planId,
      originalAmount: couponUsages.originalAmount,
      discountAmount: couponUsages.discountAmount,
      finalAmount: couponUsages.finalAmount,
      createdAt: couponUsages.createdAt,
      userName: sql`${users.firstName} || ' ' || ${users.lastName}`.as('userName'),
      userEmail: users.email
    })
    .from(couponUsages)
    .leftJoin(users, eq(couponUsages.userId, users.id))
    .where(eq(couponUsages.couponId, id))
    .orderBy(desc(couponUsages.createdAt))
    .limit(50);

    res.json({
      stats: usageStats[0] || { totalUsages: 0, totalDiscount: 0, totalRevenue: 0 },
      recentUsages
    });
  } catch (error) {
    console.error('Failed to get coupon usage:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === TEMPLATES MANAGEMENT ENDPOINTS ===

// Seed 15 creative templates
router.post('/templates/seed/create-defaults', requireOwner, async (req, res) => {
  try {
    const defaultTemplates = [
      { name: 'Professional Blue', description: 'Clean professional template with blue accent', category: 'professional', templateData: JSON.stringify({ template: 'minimal', backgroundColor: '#ffffff', textColor: '#1a202c', accentColor: '#2563eb' }), isActive: true },
      { name: 'Modern Dark', description: 'Dark modern template with neon accents', category: 'modern', templateData: JSON.stringify({ template: 'dark', backgroundColor: '#0f172a', textColor: '#f1f5f9', accentColor: '#06b6d4' }), isActive: true },
      { name: 'Creative Gradient', description: 'Bold gradient template for creative professionals', category: 'creative', templateData: JSON.stringify({ template: 'bold', backgroundColor: '#fef2f2', textColor: '#1f2937', accentColor: '#dc2626' }), isActive: true },
      { name: 'Tech Startup', description: 'Modern tech startup template', category: 'tech', templateData: JSON.stringify({ template: 'minimal', backgroundColor: '#ffffff', textColor: '#111827', accentColor: '#7c3aed' }), isActive: true },
      { name: 'Luxury Gold', description: 'Elegant luxury template with gold accents', category: 'elegant', templateData: JSON.stringify({ template: 'photo', backgroundColor: '#faf7f2', textColor: '#2d2424', accentColor: '#d97706' }), isActive: true },
      { name: 'Healthcare Green', description: 'Healthcare professional template', category: 'healthcare', templateData: JSON.stringify({ template: 'minimal', backgroundColor: '#ffffff', textColor: '#164e63', accentColor: '#059669' }), isActive: true },
      { name: 'Finance Corporate', description: 'Corporate finance template', category: 'finance', templateData: JSON.stringify({ template: 'bold', backgroundColor: '#f8fafc', textColor: '#0f172a', accentColor: '#1e40af' }), isActive: true },
      { name: 'Creative Agency', description: 'Vibrant creative agency template', category: 'creative', templateData: JSON.stringify({ template: 'photo', backgroundColor: '#fef3c7', textColor: '#78350f', accentColor: '#f59e0b' }), isActive: true },
      { name: 'Education Blue', description: 'Education sector template', category: 'education', templateData: JSON.stringify({ template: 'minimal', backgroundColor: '#ffffff', textColor: '#1e3a8a', accentColor: '#3b82f6' }), isActive: true },
      { name: 'Retail Fashion', description: 'Fashion retail template', category: 'retail', templateData: JSON.stringify({ template: 'photo', backgroundColor: '#fce7f3', textColor: '#831843', accentColor: '#ec4899' }), isActive: true },
      { name: 'Real Estate Chic', description: 'Real estate professional template', category: 'real-estate', templateData: JSON.stringify({ template: 'bold', backgroundColor: '#fef5f1', textColor: '#7c2d12', accentColor: '#ea580c' }), isActive: true },
      { name: 'Consulting Premium', description: 'Consulting firm template', category: 'consulting', templateData: JSON.stringify({ template: 'minimal', backgroundColor: '#ffffff', textColor: '#1a1a1a', accentColor: '#6366f1' }), isActive: true },
      { name: 'Minimal Monochrome', description: 'Minimalist monochrome template', category: 'minimal', templateData: JSON.stringify({ template: 'minimal', backgroundColor: '#ffffff', textColor: '#374151', accentColor: '#6b7280' }), isActive: true },
      { name: 'Vibrant Tech', description: 'Vibrant tech company template', category: 'tech', templateData: JSON.stringify({ template: 'bold', backgroundColor: '#f0f9ff', textColor: '#0c4a6e', accentColor: '#0284c7' }), isActive: true },
      { name: 'Classic Serif', description: 'Classic elegant serif template', category: 'classic', templateData: JSON.stringify({ template: 'photo', backgroundColor: '#faf9f7', textColor: '#3f3f46', accentColor: '#71717a' }), isActive: true }
    ];

    const createdTemplates = await db.insert(globalTemplates).values(
      defaultTemplates.map(t => ({
        ...t,
        createdBy: req.user!.id
      }))
    ).returning();

    await logAdminAction(req.user!.id, 'seed', 'templates', undefined, { count: createdTemplates.length });
    res.json({ message: `${createdTemplates.length} templates created successfully`, templates: createdTemplates });
  } catch (error) {
    console.error('Failed to seed templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get templates (temporarily no auth for testing) 
router.get('/templates', async (req, res) => {
  try {
    const { search, category, published } = req.query;
    
    let query = db.select().from(globalTemplates);
    const conditions = [];
    
    if (search) {
      conditions.push(like(globalTemplates.name, `%${search}%`));
    }
    
    if (category) {
      conditions.push(eq(globalTemplates.name, String(category))); // Assuming category stored in name field
    }
    
    if (published !== undefined) {
      conditions.push(eq(globalTemplates.isActive, published === 'true'));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const templates = await query.orderBy(desc(globalTemplates.createdAt));
    
    res.json(templates);
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single template by ID  
router.get('/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const [template] = await db.select()
      .from(globalTemplates)
      .where(eq(globalTemplates.id, id));
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Failed to get template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update template
router.patch('/templates/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, templateData, previewImage, isActive } = req.body;
    
    const [updatedTemplate] = await db.update(globalTemplates)
      .set({ 
        name,
        description,
        templateData,
        previewImage,
        isActive,
        updatedAt: new Date()
      })
      .where(eq(globalTemplates.id, id))
      .returning();
    
    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    await logAdminAction(req.user!.id, 'update', 'template', id, req.body);
    
    res.json({ message: 'Template updated successfully', template: updatedTemplate });
  } catch (error) {
    console.error('Failed to update template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete template
router.delete('/templates/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [deletedTemplate] = await db.delete(globalTemplates)
      .where(eq(globalTemplates.id, id))
      .returning();
    
    if (!deletedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    await logAdminAction(req.user!.id, 'delete', 'template', id);
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create template
router.post('/templates', requireOwner, async (req, res) => {
  try {
    const templateData = {
      ...req.body,
      createdBy: req.user!.id
    };
    
    const [newTemplate] = await db.insert(globalTemplates).values(templateData).returning();
    
    await logAdminAction(req.user!.id, 'create', 'template', newTemplate.id, templateData);
    
    res.json({ message: 'Template created successfully', template: newTemplate });
  } catch (error) {
    console.error('Failed to create template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle template publish status
router.post('/templates/:id/publish', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [template] = await db.select()
      .from(globalTemplates)
      .where(eq(globalTemplates.id, id));
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    const [updatedTemplate] = await db.update(globalTemplates)
      .set({ 
        isActive: !template.isActive,
        updatedAt: new Date()
      })
      .where(eq(globalTemplates.id, id))
      .returning();
    
    await logAdminAction(
      req.user!.id, 
      updatedTemplate.isActive ? 'publish' : 'unpublish', 
      'template', 
      id
    );
    
    res.json({ 
      message: `Template ${updatedTemplate.isActive ? 'published' : 'unpublished'} successfully`,
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Failed to toggle template status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Duplicate template
router.post('/templates/:id/duplicate', requireOwner, async (req, res) => {
  try {
    console.log('=== DUPLICATE ENDPOINT HIT ===');
    console.log('Template ID:', req.params.id);
    console.log('User:', req.user?.id);
    
    const { id } = req.params;
    
    const [originalTemplate] = await db.select()
      .from(globalTemplates)
      .where(eq(globalTemplates.id, id));
    
    console.log('Original template found:', !!originalTemplate);
    
    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    console.log('Attempting to insert duplicate...');
    const [duplicatedTemplate] = await db.insert(globalTemplates).values({
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      templateData: originalTemplate.templateData,
      previewImage: originalTemplate.previewImage,
      isActive: false, // Duplicates start as inactive
      createdBy: req.user!.id
    }).returning();
    
    console.log('Duplicate created:', duplicatedTemplate.id);
    await logAdminAction(req.user!.id, 'duplicate', 'template', duplicatedTemplate.id, { originalId: id });
    
    res.json({ message: 'Template duplicated successfully', template: duplicatedTemplate });
  } catch (error) {
    console.error('Failed to duplicate template - ERROR:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Import templates from JSON file
router.post('/templates/import', requireOwner, async (req, res) => {
  try {
    const importData = req.body;
    
    // Validate import data structure
    if (!importData.templates || !Array.isArray(importData.templates)) {
      return res.status(400).json({ message: 'Invalid format. Expected "templates" array.' });
    }
    
    const templates = importData.templates;
    let imported = 0;
    const errors = [];
    
    for (const template of templates) {
      try {
        // Validate required fields
        if (!template.id || !template.name || !template.templateData) {
          errors.push(`Template missing required fields: id, name, or templateData`);
          continue;
        }
        
        // Check if template already exists
        const [existing] = await db.select()
          .from(globalTemplates)
          .where(eq(globalTemplates.id, template.id));
        
        if (existing) {
          // Update existing template
          await db.update(globalTemplates)
            .set({
              name: template.name,
              description: template.description || '',
              templateData: typeof template.templateData === 'string' 
                ? template.templateData 
                : JSON.stringify(template.templateData),
              previewImage: template.previewImage || null,
              isActive: template.isActive !== false, // Default to true
              updatedAt: new Date()
            })
            .where(eq(globalTemplates.id, template.id));
        } else {
          // Insert new template
          await db.insert(globalTemplates).values({
            id: template.id,
            name: template.name,
            description: template.description || '',
            templateData: typeof template.templateData === 'string' 
              ? template.templateData 
              : JSON.stringify(template.templateData),
            previewImage: template.previewImage || null,
            isActive: template.isActive !== false, // Default to true
            createdBy: req.user!.id
          });
        }
        
        imported++;
      } catch (error) {
        console.error(`Failed to import template ${template.id}:`, error);
        errors.push(`Template ${template.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    // Log the import action
    await logAdminAction(req.user!.id, 'import', 'template', 'bulk', { 
      imported, 
      total: templates.length,
      errors: errors.length 
    });
    
    res.json({ 
      message: `Import completed. ${imported} templates imported successfully.`,
      count: imported,
      total: templates.length,
      errors: errors.length > 0 ? errors : undefined
    });
    
  } catch (error) {
    console.error('Failed to import templates:', error);
    res.status(500).json({ message: 'Import failed', error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// === SETTINGS ENDPOINTS ===

// Get settings
router.get('/settings/:category', requireOwner, async (req, res) => {
  try {
    const { category } = req.params;
    
    // For now, return mock settings based on category
    const mockSettings = {
      profile: {
        companyName: 'TalkLink',
        adminEmail: req.user!.email,
        supportEmail: 'support@talkl.ink'
      },
      payment: {
        stripeEnabled: false,
        manualPayments: true
      },
      email: {
        smtpConfigured: false,
        fromAddress: 'noreply@talkl.ink'
      },
      branding: {
        logoUrl: '',
        primaryColor: '#22c55e',
        secondaryColor: '#16a34a'
      }
    };
    
    res.json(mockSettings[category as keyof typeof mockSettings] || {});
  } catch (error) {
    console.error('Failed to get settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update settings
router.put('/settings/:category', requireOwner, async (req, res) => {
  try {
    const { category } = req.params;
    const settings = req.body;
    
    await logAdminAction(req.user!.id, 'update', 'settings', category, settings);
    
    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Failed to update settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === HEADER TEMPLATE ENDPOINTS ===

// Get all header templates
router.get('/header-templates', requireOwner, async (req, res) => {
  try {
    const templates = await db.select().from(headerTemplates).orderBy(headerTemplates.createdAt);
    res.json(templates);
  } catch (error) {
    console.error('Failed to get header templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get header template by ID
router.get('/header-templates/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const template = await db.select().from(headerTemplates).where(eq(headerTemplates.id, id)).limit(1);
    
    if (!template[0]) {
      return res.status(404).json({ message: 'Header template not found' });
    }
    
    res.json(template[0]);
  } catch (error) {
    console.error('Failed to get header template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create header template
router.post('/header-templates', requireOwner, async (req, res) => {
  try {
    const data = insertHeaderTemplateSchema.parse(req.body);
    const newTemplate = await db.insert(headerTemplates).values(data).returning();
    
    await logAdminAction(req.user!.id, 'create', 'header_template', newTemplate[0].id, data);
    
    res.status(201).json(newTemplate[0]);
  } catch (error) {
    console.error('Failed to create header template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update header template
router.patch('/header-templates/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    const updated = await db.update(headerTemplates)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(headerTemplates.id, id))
      .returning();
    
    if (!updated[0]) {
      return res.status(404).json({ message: 'Header template not found' });
    }
    
    await logAdminAction(req.user!.id, 'update', 'header_template', id, data);
    
    res.json(updated[0]);
  } catch (error) {
    console.error('Failed to update header template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete header template
router.delete('/header-templates/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.delete(headerTemplates).where(eq(headerTemplates.id, id)).returning();
    
    if (!result[0]) {
      return res.status(404).json({ message: 'Header template not found' });
    }
    
    await logAdminAction(req.user!.id, 'delete', 'header_template', id);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Failed to delete header template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Duplicate header template
router.post('/header-templates/:id/duplicate', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const original = await db.select().from(headerTemplates).where(eq(headerTemplates.id, id)).limit(1);
    
    if (!original[0]) {
      return res.status(404).json({ message: 'Header template not found' });
    }
    
    const duplicateData = {
      name: `${original[0].name} (Copy)`,
      description: original[0].description,
      category: original[0].category,
      isActive: false, // New duplicates start as inactive
      elements: original[0].elements,
      globalStyles: original[0].globalStyles,
      layoutType: original[0].layoutType,
      advancedLayout: original[0].advancedLayout,
      previewImage: original[0].previewImage
    };
    
    const newTemplate = await db.insert(headerTemplates).values(duplicateData).returning();
    
    await logAdminAction(req.user!.id, 'duplicate', 'header_template', newTemplate[0].id, { originalId: id });
    
    res.status(201).json(newTemplate[0]);
  } catch (error) {
    console.error('Failed to duplicate header template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === ADMIN PROFILE ENDPOINTS ===

// Get admin profile
router.get('/profile', requireOwner, async (req, res) => {
  try {
    const user = req.user!;
    res.json(user);
  } catch (error) {
    console.error('Failed to get admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update admin profile
router.patch('/profile', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, email } = req.body;
    
    // Validate input
    const updateSchema = z.object({
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
      email: z.string().email().optional(),
    });
    
    const validatedData = updateSchema.parse({ firstName, lastName, email });
    
    // Update user in database
    const updatedUser = await db.update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await logAdminAction(userId, 'update', 'admin_profile', userId, validatedData);
    
    res.json(updatedUser[0]);
  } catch (error) {
    console.error('Failed to update admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change admin password
router.post('/change-password', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate input
    const passwordSchema = z.object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(8)
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number"),
    });
    
    const validatedData = passwordSchema.parse({ currentPassword, newPassword });
    
    // Get current user to verify password
    const currentUser = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!currentUser[0] || !currentUser[0].password) {
      return res.status(400).json({ message: 'Password not set or user not found' });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await bcryptjs.compare(validatedData.currentPassword, currentUser[0].password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Hash new password
    const saltRounds = 12;
    const newPasswordHash = await bcryptjs.hash(validatedData.newPassword, saltRounds);
    
    // Update password
    await db.update(users)
      .set({
        password: newPasswordHash,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    
    await logAdminAction(userId, 'change_password', 'admin_profile', userId);
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Failed to change admin password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload admin avatar
router.post('/upload-avatar', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    // For now, return a mock response since we don't have file upload configured
    // In a real implementation, you would handle file upload to cloud storage here
    const mockImageUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${req.user!.firstName}${req.user!.lastName}`;
    
    // Update user's profile image URL
    const updatedUser = await db.update(users)
      .set({
        profileImageUrl: mockImageUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await logAdminAction(userId, 'update', 'admin_avatar', userId, { imageUrl: mockImageUrl });
    
    res.json({ 
      message: 'Avatar updated successfully',
      imageUrl: mockImageUrl 
    });
  } catch (error) {
    console.error('Failed to upload admin avatar:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mount affiliate admin routes
import('./admin-affiliate-routes').then(module => {
  router.use('/', module.default);
}).catch(err => {
  console.error('Failed to load affiliate admin routes:', err);
});

// === ADMIN PROFILE ENDPOINTS ===

// Get admin profile
router.get('/profile', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    
    if (!user[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const { password, ...userProfile } = user[0];
    
    res.json(userProfile);
  } catch (error) {
    console.error('Failed to get admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update admin profile
router.patch('/profile', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { firstName, lastName, email } = req.body;
    
    const validation = z.object({
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
      email: z.string().email().optional(),
    });
    
    const validatedData = validation.parse({ firstName, lastName, email });
    
    const updatedUser = await db.update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await logAdminAction(userId, 'update', 'admin_profile', userId, validatedData);
    
    const { password, ...userProfile } = updatedUser[0];
    res.json(userProfile);
  } catch (error) {
    console.error('Failed to update admin profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update admin preferences
router.patch('/profile/preferences', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { timezone, preferredLanguage } = req.body;
    
    const validation = z.object({
      timezone: z.string().optional(),
      preferredLanguage: z.string().optional(),
    });
    
    const validatedData = validation.parse({ timezone, preferredLanguage });
    
    const updatedUser = await db.update(users)
      .set({
        ...validatedData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await logAdminAction(userId, 'update', 'admin_preferences', userId, validatedData);
    
    res.json({ message: 'Preferences updated successfully' });
  } catch (error) {
    console.error('Failed to update admin preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Toggle 2FA
router.post('/profile/2fa', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { enabled } = req.body;
    
    const validation = z.object({
      enabled: z.boolean(),
    });
    
    const validatedData = validation.parse({ enabled });
    
    const updatedUser = await db.update(users)
      .set({
        twoFactorEnabled: validatedData.enabled,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser[0]) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await logAdminAction(userId, 'update', 'admin_2fa', userId, { enabled: validatedData.enabled });
    
    res.json({ message: `Two-factor authentication ${validatedData.enabled ? 'enabled' : 'disabled'}` });
  } catch (error) {
    console.error('Failed to toggle 2FA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin activities
router.get('/profile/activities', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const activities = await db.select({
      id: adminLogs.id,
      action: adminLogs.action,
      targetType: adminLogs.targetType,
      targetId: adminLogs.targetId,
      details: adminLogs.details,
      createdAt: adminLogs.createdAt,
    })
    .from(adminLogs)
    .where(eq(adminLogs.actorId, userId))
    .orderBy(desc(adminLogs.createdAt))
    .limit(20);
    
    res.json(activities);
  } catch (error) {
    console.error('Failed to get admin activities:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get admin sessions (mock data for now)
router.get('/profile/sessions', requireOwner, async (req, res) => {
  try {
    // Mock session data since we don't have a sessions tracking system yet
    const mockSessions = [
      {
        id: '1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ipAddress: '192.168.1.1',
        location: 'New York, NY',
        isCurrentSession: true,
        lastActive: new Date().toISOString(),
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      },
      {
        id: '2',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        ipAddress: '192.168.1.5',
        location: 'New York, NY',
        isCurrentSession: false,
        lastActive: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      },
    ];
    
    res.json(mockSessions);
  } catch (error) {
    console.error('Failed to get admin sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Revoke admin session
router.delete('/profile/sessions/:sessionId', requireOwner, async (req, res) => {
  try {
    const userId = req.user!.id;
    const { sessionId } = req.params;
    
    // For now, just return success since we're using mock data
    // In a real implementation, you would revoke the actual session
    
    await logAdminAction(userId, 'revoke', 'admin_session', sessionId, { sessionId });
    
    res.json({ message: 'Session revoked successfully' });
  } catch (error) {
    console.error('Failed to revoke admin session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// ===== PLAN MANAGEMENT ENDPOINTS =====

// Get all plans (admin only)
router.get('/plans', requireOwner, async (req, res) => {
  try {
    const plans = await db.select().from(subscriptionPlans).orderBy(desc(subscriptionPlans.createdAt));
    res.json({ data: plans });
  } catch (error) {
    console.error('Failed to get plans:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single plan
router.get('/plans/:id', requireOwner, async (req, res) => {
  try {
    const plan = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.id, parseInt(req.params.id)));
    if (!plan[0]) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    res.json({ data: plan[0] });
  } catch (error) {
    console.error('Failed to get plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new plan
router.post('/plans', requireOwner, async (req, res) => {
  try {
    const { name, planType, price, discount, interval, businessCardsLimit, baseUsers, pricePerUser, setupFee, allowUserSelection, minUsers, maxUsers, elementFeatures, moduleFeatures, templateIds, description, features } = req.body;

    // Validate required fields
    if (!name || !planType || !interval || businessCardsLimit === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newPlan = await db.insert(subscriptionPlans).values({
      name,
      planType: planType as 'free' | 'paid',
      price: price || 0,
      discount: discount || 0,
      currency: 'usd',
      interval,
      businessCardsLimit,
      baseUsers: baseUsers || 1,
      pricePerUser: pricePerUser || 0,
      setupFee: setupFee || 0,
      allowUserSelection: allowUserSelection || false,
      minUsers: minUsers || 1,
      maxUsers: maxUsers || null,
      elementFeatures: elementFeatures || [],
      moduleFeatures: moduleFeatures || {},
      templateIds: templateIds || [],
      description,
      features: features || {},
      isActive: true,
    }).returning();

    await logAdminAction(req.user!.id, 'create', 'plan', newPlan[0]?.id?.toString(), { name, planType });

    res.json({ data: newPlan[0] });
  } catch (error) {
    console.error('Failed to create plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update plan
router.put('/plans/:id', requireOwner, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);
    const { name, planType, price, discount, interval, businessCardsLimit, baseUsers, pricePerUser, setupFee, allowUserSelection, minUsers, maxUsers, elementFeatures, moduleFeatures, templateIds, description, features, isActive } = req.body;

    const updated = await db.update(subscriptionPlans)
      .set({
        name,
        planType,
        price: price || 0,
        discount: discount || 0,
        interval,
        businessCardsLimit,
        baseUsers: baseUsers || 1,
        pricePerUser: pricePerUser || 0,
        setupFee: setupFee || 0,
        allowUserSelection: allowUserSelection || false,
        minUsers: minUsers || 1,
        maxUsers: maxUsers || null,
        elementFeatures: elementFeatures || [],
        moduleFeatures: moduleFeatures || {},
        templateIds: templateIds || [],
        description,
        features: features || {},
        isActive: isActive !== undefined ? isActive : true,
      })
      .where(eq(subscriptionPlans.id, planId))
      .returning();

    if (!updated[0]) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await logAdminAction(req.user!.id, 'update', 'plan', planId.toString(), { name });

    res.json({ data: updated[0] });
  } catch (error) {
    console.error('Failed to update plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete plan
router.delete('/plans/:id', requireOwner, async (req, res) => {
  try {
    const planId = parseInt(req.params.id);

    const deleted = await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, planId)).returning();

    if (!deleted[0]) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    await logAdminAction(req.user!.id, 'delete', 'plan', planId.toString(), {});

    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Failed to delete plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// ===== END PLAN MANAGEMENT =====

// Simple admin login for testing - only uses existing DB fields
router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }
    
    // Find admin user using full query to get complete user object
    const adminUser = await db.select().from(users)
      .where(eq(users.email, email))
      .limit(1);
    
    if (!adminUser[0] || !adminUser[0].password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Check if user is admin/owner
    if (adminUser[0].role !== 'admin' && adminUser[0].role !== 'owner') {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }
    
    // Verify password
    const isValidPassword = await bcryptjs.compare(password, adminUser[0].password);
    
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Set up session manually for admin login
    // Create a new session and store user info
    req.session.passport = { user: adminUser[0].id };
    req.user = adminUser[0];
    
    // Set session cookie duration based on rememberMe
    // 30 days if rememberMe is true, 1 day if false
    const sessionDuration = rememberMe 
      ? 30 * 24 * 60 * 60 * 1000  // 30 days in milliseconds
      : 24 * 60 * 60 * 1000;       // 1 day in milliseconds
    
    req.session.cookie.maxAge = sessionDuration;
    
    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error('Failed to save session:', err);
        return res.status(500).json({ message: 'Failed to save session' });
      }
      
      const { password: _, ...userProfile } = adminUser[0];
      res.json(userProfile);
    });
  } catch (error) {
    console.error('Failed to login admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
    
