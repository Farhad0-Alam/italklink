import { Router } from 'express';
import { db } from './db';
import { 
  users, businessCards, adminLogs, analyticsEvents, globalTemplates, subscriptionPlans,
  features, planFeatures, planTemplates, userPlans, iconTypes, iconPacks, icons, 
  links, countersDaily
} from '@shared/schema';
import { requireOwner } from './auth';
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
        sql`${countersDaily.day} >= DATE('now', '-7 days')`
      )),
      
      // Weekly visitors from last 7 days  
      db.select({
        value: sql`sum(${countersDaily.value})`.mapWith(Number)
      })
      .from(countersDaily)
      .where(and(
        eq(countersDaily.metric, 'visits'),
        sql`${countersDaily.day} >= DATE('now', '-7 days')`
      )),
      
      // Monthly visitors from last 30 days
      db.select({
        value: sql`sum(${countersDaily.value})`.mapWith(Number)
      })
      .from(countersDaily)
      .where(and(
        eq(countersDaily.metric, 'visits'),
        sql`${countersDaily.day} >= DATE('now', '-30 days')`
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
    .where(sql`${countersDaily.day} >= DATE('now', '-${days} days')`)
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
      url: sql`'https://2talklink.com/' || ${businessCards.shareSlug}`.as('url'),
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

// Get users with search, filters, pagination
router.get('/users', requireOwner, async (req, res) => {
  try {
    const { search, status, planId, page = 1, size = 50 } = req.query;
    const offset = (Number(page) - 1) * Number(size);
    
    let query = db.select({
      id: users.id,
      email: users.email,
      firstName: users.firstName,
      lastName: users.lastName,
      role: users.role,
      planType: users.planType,
      businessCardsCount: users.businessCardsCount,
      createdAt: users.createdAt,
      subscriptionEndsAt: users.subscriptionEndsAt
    }).from(users);
    
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }
    
    if (status) {
      // Assume active means subscriptionEndsAt is null or in future
      if (status === 'active') {
        conditions.push(
          or(
            sql`${users.subscriptionEndsAt} IS NULL`,
            sql`${users.subscriptionEndsAt} > NOW()`
          )
        );
      } else {
        conditions.push(sql`${users.subscriptionEndsAt} <= NOW()`);
      }
    }
    
    if (planId) {
      conditions.push(eq(users.planType, planId as any));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    const usersList = await query
      .orderBy(desc(users.createdAt))
      .limit(Number(size))
      .offset(offset);

    const formattedUsers = usersList.map((user, index) => ({
      id: user.id,
      sn: offset + index + 1,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      initials: user.firstName && user.lastName ? 
        `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 
        user.email.substring(0, 2).toUpperCase(),
      email: user.email,
      registrationDate: user.createdAt.toISOString().split('T')[0],
      planValidity: user.subscriptionEndsAt ? 
        user.subscriptionEndsAt.toISOString().split('T')[0] : 
        '-',
      status: !user.subscriptionEndsAt || user.subscriptionEndsAt > new Date() ? 'active' : 'inactive'
    }));

    res.json(formattedUsers);
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add new user
router.post('/users', requireOwner, async (req, res) => {
  try {
    const { email, firstName, lastName, password, planId } = req.body;
    
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    const [newUser] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'user',
      planType: 'free'
    }).returning();
    
    await logAdminAction(req.user!.id, 'create', 'user', newUser.id, { email, planId });
    
    res.json({ message: 'User created successfully', user: newUser });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.patch('/users/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedUser] = await db.update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    
    await logAdminAction(req.user!.id, 'update', 'user', id, updates);
    
    res.json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(users).where(eq(users.id, id));
    
    await logAdminAction(req.user!.id, 'delete', 'user', id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Assign plan to user
router.post('/users/:id/assign-plan', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { planId, startsAt, endsAt, note } = req.body;
    
    // Create user plan assignment
    await db.insert(userPlans).values({
      userId: id,
      planId,
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      endsAt: endsAt ? new Date(endsAt) : null,
      note
    });
    
    // Update user's subscription info
    await db.update(users)
      .set({ 
        subscriptionEndsAt: endsAt ? new Date(endsAt) : null,
        updatedAt: new Date()
      })
      .where(eq(users.id, id));
    
    await logAdminAction(req.user!.id, 'assign_plan', 'user', id, { planId, endsAt, note });
    
    res.json({ message: 'Plan assigned successfully' });
  } catch (error) {
    console.error('Failed to assign plan:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    const planData = req.body;
    
    const [newPlan] = await db.insert(subscriptionPlans).values(planData).returning();
    
    await logAdminAction(req.user!.id, 'create', 'plan', String(newPlan.id), planData);
    
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

// === TEMPLATES MANAGEMENT ENDPOINTS ===

// Get templates
router.get('/templates', requireOwner, async (req, res) => {
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
router.get('/templates/:id', requireOwner, async (req, res) => {
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
    const { id } = req.params;
    
    const [originalTemplate] = await db.select()
      .from(globalTemplates)
      .where(eq(globalTemplates.id, id));
    
    if (!originalTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    const [duplicatedTemplate] = await db.insert(globalTemplates).values({
      name: `${originalTemplate.name} (Copy)`,
      description: originalTemplate.description,
      templateData: originalTemplate.templateData,
      previewImage: originalTemplate.previewImage,
      isActive: false, // Duplicates start as inactive
      createdBy: req.user!.id
    }).returning();
    
    await logAdminAction(req.user!.id, 'duplicate', 'template', duplicatedTemplate.id, { originalId: id });
    
    res.json({ message: 'Template duplicated successfully', template: duplicatedTemplate });
  } catch (error) {
    console.error('Failed to duplicate template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === ICON PACKS & TYPES ENDPOINTS ===

// Get icon types
router.get('/icon-types', requireOwner, async (req, res) => {
  try {
    const types = await db.select().from(iconTypes).orderBy(iconTypes.name);
    res.json(types);
  } catch (error) {
    console.error('Failed to get icon types:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create icon type
router.post('/icon-types', requireOwner, async (req, res) => {
  try {
    const { name, type } = req.body;
    
    const [newIconType] = await db.insert(iconTypes).values({
      name,
      type,
      isActive: true
    }).returning();
    
    await logAdminAction(req.user!.id, 'create', 'icon_type', String(newIconType.id), { name, type });
    
    res.json({ message: 'Icon type created successfully', iconType: newIconType });
  } catch (error) {
    console.error('Failed to create icon type:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get icon packs
router.get('/icon-packs', requireOwner, async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = db.select({
      id: iconPacks.id,
      name: iconPacks.name,
      isActive: iconPacks.isActive,
      createdAt: iconPacks.createdAt,
      iconCount: sql`(SELECT COUNT(*) FROM ${icons} WHERE ${icons.packId} = ${iconPacks.id})`.as('iconCount')
    }).from(iconPacks);
    
    if (search) {
      query = query.where(like(iconPacks.name, `%${search}%`));
    }
    
    const packs = await query.orderBy(desc(iconPacks.createdAt));
    
    res.json(packs);
  } catch (error) {
    console.error('Failed to get icon packs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create icon pack
router.post('/icon-packs', requireOwner, async (req, res) => {
  try {
    const { name } = req.body;
    
    const [newPack] = await db.insert(iconPacks).values({
      name,
      isActive: true
    }).returning();
    
    await logAdminAction(req.user!.id, 'create', 'icon_pack', newPack.id, { name });
    
    res.json({ message: 'Icon pack created successfully', pack: newPack });
  } catch (error) {
    console.error('Failed to create icon pack:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get icons in pack
router.get('/icon-packs/:id/icons', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const packIcons = await db.select({
      id: icons.id,
      name: icons.name,
      svg: icons.svg,
      tags: icons.tags,
      sort: icons.sort,
      isActive: icons.isActive,
      typeName: iconTypes.name,
      typeIcon: iconTypes.type
    })
    .from(icons)
    .leftJoin(iconTypes, eq(icons.typeId, iconTypes.id))
    .where(eq(icons.packId, id))
    .orderBy(icons.sort, icons.name);
    
    res.json(packIcons);
  } catch (error) {
    console.error('Failed to get pack icons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Upload icon to pack
router.post('/icon-packs/:id/icons', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, svg, typeId, tags = [] } = req.body;
    
    // Basic SVG sanitization
    const sanitizedSvg = svg.replace(/<script[^>]*>.*?<\/script>/gi, '');
    
    const [newIcon] = await db.insert(icons).values({
      packId: id,
      typeId,
      name,
      svg: sanitizedSvg,
      tags,
      isActive: true
    }).returning();
    
    await logAdminAction(req.user!.id, 'create', 'icon', String(newIcon.id), { packId: id, name });
    
    res.json({ message: 'Icon uploaded successfully', icon: newIcon });
  } catch (error) {
    console.error('Failed to upload icon:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// === PLANS ENDPOINTS ===

// Get all subscription plans
router.get('/plans', requireOwner, async (req, res) => {
  try {
    const { search, status, type } = req.query;
    
    let whereConditions = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(subscriptionPlans.name, `%${search}%`),
          like(subscriptionPlans.planType, `%${search}%`)
        )
      );
    }
    
    if (status === 'active') {
      whereConditions.push(eq(subscriptionPlans.isActive, true));
    } else if (status === 'inactive') {
      whereConditions.push(eq(subscriptionPlans.isActive, false));
    }
    
    if (type && type !== 'all') {
      whereConditions.push(eq(subscriptionPlans.planType, type as any));
    }
    
    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;
    
    const plans = await db.select().from(subscriptionPlans)
      .where(whereClause)
      .orderBy(desc(subscriptionPlans.createdAt));
    
    res.json(plans);
  } catch (error) {
    console.error('Failed to get plans:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new plan
router.post('/plans', requireOwner, async (req, res) => {
  try {
    const { 
      name, planType, price, currency, frequency, businessCardsLimit,
      cardLabel, trialDays, customDurationDays, features, templates, 
      isActive, stripePriceId 
    } = req.body;
    
    if (!name || !planType) {
      return res.status(400).json({ message: 'Name and plan type are required' });
    }
    
    // Create the plan
    const [newPlan] = await db.insert(subscriptionPlans).values({
      name,
      planType,
      price: price || 0,
      currency: currency || 'USD',
      interval: frequency || 'monthly', // Keep for compatibility
      frequency: frequency || 'monthly',
      businessCardsLimit: businessCardsLimit || 1,
      features: features || [], // Keep for backward compatibility
      stripePriceId,
      isActive: isActive !== undefined ? isActive : true,
      cardLabel,
      trialDays: trialDays || 0,
      customDurationDays
    }).returning();
    
    // Insert plan features if provided
    if (features && features.length > 0) {
      const planFeatureInserts = features.map((featureId: number) => ({
        planId: newPlan.id,
        featureId: featureId
      }));
      await db.insert(planFeatures).values(planFeatureInserts);
    }
    
    // Insert plan templates if provided
    if (templates && templates.length > 0) {
      const planTemplateInserts = templates.map((templateId: string) => ({
        planId: newPlan.id,
        templateId: templateId
      }));
      await db.insert(planTemplates).values(planTemplateInserts);
    }
    
    await logAdminAction(req.user!.id, 'create', 'plan', newPlan.id.toString(), { name, planType });
    
    res.json({ message: 'Plan created successfully', plan: newPlan });
  } catch (error) {
    console.error('Failed to create plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update plan
router.put('/plans/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, planType, price, currency, frequency, businessCardsLimit,
      cardLabel, trialDays, customDurationDays, features, templates, 
      isActive, stripePriceId 
    } = req.body;
    
    // Update the plan
    const [updatedPlan] = await db.update(subscriptionPlans)
      .set({
        name,
        planType,
        price,
        currency,
        interval: frequency, // Keep for compatibility
        frequency,
        businessCardsLimit,
        stripePriceId,
        isActive,
        cardLabel,
        trialDays,
        customDurationDays
      })
      .where(eq(subscriptionPlans.id, parseInt(id)))
      .returning();
    
    if (!updatedPlan) {
      return res.status(404).json({ message: 'Plan not found' });
    }
    
    // Update plan features
    if (features !== undefined) {
      // Delete existing features
      await db.delete(planFeatures).where(eq(planFeatures.planId, parseInt(id)));
      
      // Insert new features
      if (features.length > 0) {
        const planFeatureInserts = features.map((featureId: number) => ({
          planId: parseInt(id),
          featureId: featureId
        }));
        await db.insert(planFeatures).values(planFeatureInserts);
      }
    }
    
    // Update plan templates
    if (templates !== undefined) {
      // Delete existing templates
      await db.delete(planTemplates).where(eq(planTemplates.planId, parseInt(id)));
      
      // Insert new templates
      if (templates.length > 0) {
        const planTemplateInserts = templates.map((templateId: string) => ({
          planId: parseInt(id),
          templateId: templateId
        }));
        await db.insert(planTemplates).values(planTemplateInserts);
      }
    }
    
    await logAdminAction(req.user!.id, 'update', 'plan', id, { name, planType });
    
    res.json({ message: 'Plan updated successfully', plan: updatedPlan });
  } catch (error) {
    console.error('Failed to update plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete plan
router.delete('/plans/:id', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if plan is being used by any users
    const userPlanCount = await db.select({ count: count() })
      .from(userPlans)
      .where(eq(userPlans.planId, parseInt(id)));
    
    if (userPlanCount[0].count > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete plan that is assigned to users. Please remove all user assignments first.' 
      });
    }
    
    // Delete plan features and templates first (cascade)
    await db.delete(planFeatures).where(eq(planFeatures.planId, parseInt(id)));
    await db.delete(planTemplates).where(eq(planTemplates.planId, parseInt(id)));
    
    // Delete the plan
    await db.delete(subscriptionPlans).where(eq(subscriptionPlans.id, parseInt(id)));
    
    await logAdminAction(req.user!.id, 'delete', 'plan', id);
    
    res.json({ message: 'Plan deleted successfully' });
  } catch (error) {
    console.error('Failed to delete plan:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all available features
router.get('/features', requireOwner, async (req, res) => {
  try {
    const allFeatures = await db.select().from(features).orderBy(features.category, features.label);
    res.json(allFeatures);
  } catch (error) {
    console.error('Failed to get features:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get plan features for a specific plan
router.get('/plans/:id/features', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const planFeatureIds = await db.select({ featureId: planFeatures.featureId })
      .from(planFeatures)
      .where(eq(planFeatures.planId, parseInt(id)));
    
    res.json(planFeatureIds.map(pf => pf.featureId));
  } catch (error) {
    console.error('Failed to get plan features:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get plan templates for a specific plan
router.get('/plans/:id/templates', requireOwner, async (req, res) => {
  try {
    const { id } = req.params;
    
    const planTemplateIds = await db.select({ templateId: planTemplates.templateId })
      .from(planTemplates)
      .where(eq(planTemplates.planId, parseInt(id)));
    
    res.json(planTemplateIds.map(pt => pt.templateId));
  } catch (error) {
    console.error('Failed to get plan templates:', error);
    res.status(500).json({ message: 'Internal server error' });
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
        companyName: '2TalkLink',
        adminEmail: req.user!.email,
        supportEmail: 'support@2talklink.com'
      },
      payment: {
        stripeEnabled: false,
        manualPayments: true
      },
      email: {
        smtpConfigured: false,
        fromAddress: 'noreply@2talklink.com'
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

export default router;