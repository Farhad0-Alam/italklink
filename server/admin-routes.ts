import { Router } from 'express';
import { db } from './db';
import { users, businessCards, adminLogs, analyticsEvents, globalTemplates } from '@shared/schema';
import { requireAuth, requireAdmin } from './auth';
import { eq, desc, count, sql, and } from 'drizzle-orm';
import bcryptjs from 'bcryptjs';

const router = Router();

// Middleware for super admin only actions
const requireSuperAdmin = (req: any, res: any, next: any) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const user = req.user as any;
  if (user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Super admin access required' });
  }
  
  next();
};

// Log admin action
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

// Dashboard stats endpoint
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const [
      totalUsersResult,
      totalBusinessCardsResult,
      totalTemplatesResult,
      monthlyActiveUsersResult
    ] = await Promise.all([
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(businessCards),
      db.select({ count: count() }).from(globalTemplates),
      db.select({ count: count() }).from(users).where(
        sql`created_at >= NOW() - INTERVAL '30 days'`
      )
    ]);

    // Get analytics data (last 7 days)
    const analyticsResult = await db.select({ count: count() }).from(analyticsEvents).where(
      sql`created_at >= NOW() - INTERVAL '7 days'`
    );

    const stats = {
      totalUsers: totalUsersResult[0]?.count || 0,
      totalBusinessCards: totalBusinessCardsResult[0]?.count || 0,
      totalTemplates: totalTemplatesResult[0]?.count || 0,
      monthlyActiveUsers: monthlyActiveUsersResult[0]?.count || 0,
      weeklyClicks: Math.floor(Math.random() * 50) + 10, // Mock data
      weeklyVisitors: Math.floor(Math.random() * 100) + 50, // Mock data
      monthlyVisitors: Math.floor(Math.random() * 200) + 100, // Mock data
      totalLinks: totalBusinessCardsResult[0]?.count || 0,
    };

    res.json(stats);
  } catch (error) {
    console.error('Failed to get admin stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Recent cards endpoint
router.get('/recent-cards', requireAdmin, async (req, res) => {
  try {
    const recentCards = await db.select({
      id: businessCards.id,
      fullName: businessCards.fullName,
      title: businessCards.title,
      company: businessCards.company,
      shareSlug: businessCards.shareSlug,
      viewCount: businessCards.viewCount,
      isPublic: businessCards.isPublic,
      createdAt: businessCards.createdAt,
      updatedAt: businessCards.updatedAt,
      userEmail: users.email,
      userFirstName: users.firstName,
      userLastName: users.lastName,
    })
    .from(businessCards)
    .leftJoin(users, eq(businessCards.userId, users.id))
    .orderBy(desc(businessCards.updatedAt))
    .limit(10);

    const formattedCards = recentCards.map(card => ({
      ...card,
      user: {
        email: card.userEmail,
        firstName: card.userFirstName,
        lastName: card.userLastName,
      }
    }));

    res.json(formattedCards);
  } catch (error) {
    console.error('Failed to get recent cards:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Users management endpoints
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    
    let allUsers;
    
    if (search) {
      allUsers = await db.select().from(users)
        .where(
          sql`email ILIKE ${`%${search}%`} OR first_name ILIKE ${`%${search}%`} OR last_name ILIKE ${`%${search}%`}`
        )
        .orderBy(desc(users.createdAt));
    } else {
      allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
    }
    
    res.json(allUsers);
  } catch (error) {
    console.error('Failed to get users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new user
router.post('/users', requireAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, password, role = 'user' } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    const [newUser] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: role as 'user' | 'admin' | 'super_admin',
    }).returning();

    await logAdminAction((req.user as any).id, 'create', 'user', newUser.id, { email, role });
    
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update user
router.put('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedUser] = await db.update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    await logAdminAction((req.user as any).id, 'update', 'user', id, updates);
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Suspend user
router.post('/users/:id/suspend', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [updatedUser] = await db.update(users)
      .set({
        subscriptionStatus: 'canceled',
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    await logAdminAction((req.user as any).id, 'suspend', 'user', id);
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Failed to suspend user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete user
router.delete('/users/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    await db.delete(users).where(eq(users.id, id));
    await logAdminAction((req.user as any).id, 'delete', 'user', id);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Failed to delete user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Templates management endpoints
router.get('/templates', requireAdmin, async (req, res) => {
  try {
    const templates = await db.select().from(globalTemplates).orderBy(desc(globalTemplates.createdAt));
    res.json(templates);
  } catch (error) {
    console.error('Failed to get templates:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create new template
router.post('/templates', requireAdmin, async (req, res) => {
  try {
    const { name, description, templateData, previewImage } = req.body;
    
    const [newTemplate] = await db.insert(globalTemplates).values({
      name,
      description,
      templateData,
      previewImage,
      createdBy: (req.user as any).id,
    }).returning();

    await logAdminAction((req.user as any).id, 'create', 'template', newTemplate.id, { name });
    
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Failed to create template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update template
router.put('/templates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const [updatedTemplate] = await db.update(globalTemplates)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(globalTemplates.id, id))
      .returning();

    await logAdminAction((req.user as any).id, 'update', 'template', id, updates);
    
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Failed to update template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete template
router.delete('/templates/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.delete(globalTemplates).where(eq(globalTemplates.id, id));
    await logAdminAction((req.user as any).id, 'delete', 'template', id);
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Failed to delete template:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Analytics endpoints
router.get('/analytics/events', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    let events;
    
    if (startDate && endDate && type) {
      events = await db.select().from(analyticsEvents)
        .where(
          and(
            sql`created_at >= ${startDate}`,
            sql`created_at <= ${endDate}`,
            eq(analyticsEvents.type, type as string)
          )
        )
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(1000);
    } else if (startDate && endDate) {
      events = await db.select().from(analyticsEvents)
        .where(
          and(
            sql`created_at >= ${startDate}`,
            sql`created_at <= ${endDate}`
          )
        )
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(1000);
    } else if (type) {
      events = await db.select().from(analyticsEvents)
        .where(eq(analyticsEvents.type, type as string))
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(1000);
    } else {
      events = await db.select().from(analyticsEvents)
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(1000);
    }
    res.json(events);
  } catch (error) {
    console.error('Failed to get analytics events:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Admin logs endpoint
router.get('/logs', requireSuperAdmin, async (req, res) => {
  try {
    const logs = await db.select({
      id: adminLogs.id,
      action: adminLogs.action,
      targetType: adminLogs.targetType,
      targetId: adminLogs.targetId,
      details: adminLogs.details,
      createdAt: adminLogs.createdAt,
      actorEmail: users.email,
      actorName: sql`CONCAT(${users.firstName}, ' ', ${users.lastName})`,
    })
    .from(adminLogs)
    .leftJoin(users, eq(adminLogs.actorId, users.id))
    .orderBy(desc(adminLogs.createdAt))
    .limit(100);

    res.json(logs);
  } catch (error) {
    console.error('Failed to get admin logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create admin (super admin only)
router.post('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const { email, firstName, lastName, password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 12);
    
    const [newAdmin] = await db.insert(users).values({
      email,
      firstName,
      lastName,
      password: hashedPassword,
      role: 'admin',
    }).returning();

    await logAdminAction((req.user as any).id, 'create', 'admin', newAdmin.id, { email });
    
    res.status(201).json(newAdmin);
  } catch (error) {
    console.error('Failed to create admin:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all admins (super admin only)
router.get('/admins', requireSuperAdmin, async (req, res) => {
  try {
    const admins = await db.select()
      .from(users)
      .where(sql`role IN ('admin', 'super_admin')`)
      .orderBy(desc(users.createdAt));
    
    res.json(admins);
  } catch (error) {
    console.error('Failed to get admins:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;