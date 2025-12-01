import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from 'passport';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { setupAuth, requireAuth, optionalAuth, requireAdmin } from './auth';
import { storage } from './storage';
import { setupVoiceWebSocketServer } from './voice-realtime-server';
import { emitAutomationEvent } from './automation-engine';
import { emailService } from './email-service';
import type { User, Team, TeamMember, CrmContact, CrmActivity, CrmTask, CrmPipeline, CrmStage, CrmDeal, CrmSequence, EmailTemplate } from '@shared/schema';
import { 
  insertUserSchema, teamInvitationSchema, teamSettingsSchema,
  insertTeamMemberSchema, insertCrmContactSchema, insertCrmActivitySchema, 
  insertCrmTaskSchema, insertCrmPipelineSchema, insertCrmStageSchema, 
  insertCrmDealSchema, insertCrmSequenceSchema,
  insertQrLinkSchema, staticQrSchema
} from '@shared/schema';
import { z, ZodError } from 'zod';
import { nanoid } from 'nanoid';

// Import comprehensive middleware infrastructure
import {
  setupApiMiddleware,
  setupAuthenticatedRoutes,
  setupPublicRoutes,
  setupErrorHandling,
} from './middleware/api-middleware';
import {
  generateCSRFToken,
  verifyCSRFToken,
  enhancedCORS,
} from './middleware/csrf-protection';
import {
  asyncHandler,
  successResponse,
  paginatedResponse,
  notFoundError,
  validationError,
  businessLogicError,
} from './middleware/error-handling';
import {
  enhancedAuth,
  requireRole,
  requirePlan,
  requireOwnership,
  requireTeamAccess,
} from './middleware/enhanced-auth';
import {
  validateRequest,
  userValidationSchemas,
  teamValidationSchemas,
  commonSchemas,
} from './middleware/validation';

// Create update schemas for CRM entities (omit immutable fields)
const updateCrmContactSchema = insertCrmContactSchema.omit({ 
  id: true, ownerUserId: true, createdAt: true, updatedAt: true 
}).partial();

const updateCrmActivitySchema = insertCrmActivitySchema.omit({ 
  id: true, contactId: true, createdBy: true, createdAt: true 
}).partial();

const updateCrmTaskSchema = insertCrmTaskSchema.omit({ 
  id: true, contactId: true, createdBy: true, createdAt: true 
}).partial();

const updateCrmPipelineSchema = insertCrmPipelineSchema.omit({ 
  id: true, ownerUserId: true, createdAt: true, updatedAt: true 
}).partial();

const updateCrmDealSchema = insertCrmDealSchema.omit({ 
  id: true, ownerUserId: true, createdAt: true, updatedAt: true 
}).partial();

const moveDealSchema = z.object({
  stageId: z.string().min(1, 'Stage ID is required')
});
import { setupAIRoutes } from './ai-routes';
import adminRoutes from './admin-routes';
import billingRoutes from './billing-routes';
import { templateCollectionsRoutes } from './template-collections-routes';
import shopRoutes from './shop-routes';
import cartRoutes from './cart-routes';
import checkoutRoutes from './checkout-routes';
import downloadsRoutes from './downloads-routes';
import reviewsRoutes from './reviews-routes';
import ordersRoutes from './orders-routes';
import searchRoutes from './search-routes';
import wishlistRoutes from './wishlist-routes';
import sellerAnalyticsRoutes from './seller-analytics-routes';
import shopAffiliateRoutes from './shop-affiliate-routes';
import couponRoutes from './coupon-routes';
import shopEmailRoutes from './shop-email-routes';
import sellerStoreRoutes from './seller-store-routes';
import shopModerationRoutes from './shop-moderation-routes';
import refundRoutes from './refund-routes';
import bundleRoutes from './bundle-routes';
import categoryRoutes from './category-routes';
import tagRoutes from './tag-routes';
import payoutRoutes from './payout-routes';
import variationRoutes from './variation-routes';
import commissionRoutes from './commission-routes';
import shareRoutes from './share-routes';
import abandonedCartRoutes from './abandoned-cart-routes';
import sellerSubscriptionRoutes from './seller-subscription-routes';
import reviewModerationRoutes from './review-moderation-routes';
import giftcardInventoryRoutes from './giftcard-inventory-routes';
import advancedFeaturesRoutes from './advanced-features-routes';
import finalFeaturesRoutes from './final-features-routes';
import { addToGoogleSheet, isGoogleSheetsConfigured } from './google-sheets';
import ragRoutes from './rag-routes';
import voiceRoutes from './voice-routes';
import { pwaRouter } from './routes/pwa';
import emailNotificationRoutes from './email-notification-routes';
import { notificationScheduler } from './notification-scheduler';
import { setupAnalyticsRoutes } from './analytics-routes';
import { setupCalendarRoutes } from './calendar-routes';
import { setupVideoMeetingRoutes } from './video-meeting-routes';
import { setupWebhookRoutes, calendarSyncWorker } from './webhook-routes';
import { conflictDetectionService } from './conflict-detection';
import { calendarHealthChecker } from './calendar-health-check';





export async function registerRoutes(app: Express): Promise<Server> {
  // Apply enhanced CORS with CSRF protection
  app.use(enhancedCORS);
  
  // Apply comprehensive security middleware infrastructure
  setupApiMiddleware(app);
  
  // Setup authentication with enhanced security
  setupAuth(app);
  
  // Apply public route rate limiting
  setupPublicRoutes(app);
  
  // Apply authenticated route security
  setupAuthenticatedRoutes(app);
  
  // Setup AI routes
  setupAIRoutes(app);
  
  // Setup AI template design
  const { setupAITemplateDesign } = await import('./ai-routes');
  setupAITemplateDesign(app);
  
  // Setup RAG routes
  app.use('/api', ragRoutes);
  
  // Setup AI Voice Agent routes
  app.use('/api/voice', voiceRoutes);
  
  // Setup admin routes
  app.use('/api/admin', adminRoutes);

  // Setup shop routes
  app.use('/api/shop', shopRoutes);

  // Setup shopping cart routes
  app.use('/api/cart', cartRoutes);

  // Setup checkout routes
  app.use('/api/shop', checkoutRoutes);
  
  // Setup downloads routes
  app.use('/api/downloads', downloadsRoutes);
  
  // Setup reviews routes
  app.use('/api/reviews', reviewsRoutes);
  
  // Setup orders routes
  app.use('/api/orders', ordersRoutes);

  // Setup search routes
  app.use('/api/search', searchRoutes);

  // Setup wishlist routes
  app.use('/api/wishlist', wishlistRoutes);

  // Setup seller analytics routes
  app.use('/api/seller-analytics', sellerAnalyticsRoutes);

  // Setup shop affiliate routes
  app.use('/api/shop/affiliate', shopAffiliateRoutes);

  // Setup coupon routes
  app.use('/api/coupons', couponRoutes);

  // Setup shop email routes
  app.use('/api/shop/emails', shopEmailRoutes);

  // Setup seller store routes
  app.use('/api/shop/seller', sellerStoreRoutes);

  // Setup shop moderation routes
  app.use('/api/shop/moderation', shopModerationRoutes);

  // Setup refund routes
  app.use('/api/refunds', refundRoutes);

  // Setup bundle routes
  app.use('/api/bundles', bundleRoutes);

  // Setup category and tag routes
  app.use('/api/categories', categoryRoutes);
  app.use('/api/tags', tagRoutes);

  // Setup payout routes
  app.use('/api/payouts', payoutRoutes);

  // Setup variation routes
  app.use('/api/variations', variationRoutes);

  // Setup commission routes
  app.use('/api/commissions', commissionRoutes);

  // Setup share tracking routes
  app.use('/api/shares', shareRoutes);

  // Setup abandoned cart routes
  app.use('/api/abandoned-carts', abandonedCartRoutes);

  // Setup seller subscription routes
  app.use('/api/seller-subscriptions', sellerSubscriptionRoutes);

  // Setup review moderation routes
  app.use('/api/review-moderation', reviewModerationRoutes);

  // Setup gift card & inventory routes
  app.use('/api/giftcards', giftcardInventoryRoutes);

  // Setup advanced features (bulk upload, approvals, webhooks, settings)
  app.use('/api/features', advancedFeaturesRoutes);

  // Setup final features (support, recommendations, tax, analytics, translations, api-keys)
  app.use('/api', finalFeaturesRoutes);
  
  // Setup billing routes
  app.use('/api/billing', billingRoutes);
  
  // Public endpoint: Get active subscription plans (for pricing page)
  app.get('/api/plans', async (req, res) => {
    try {
      const { db } = await import('./db');
      const { subscriptionPlans } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      const plans = await db.select()
        .from(subscriptionPlans)
        .where(eq(subscriptionPlans.isActive, true))
        .orderBy(subscriptionPlans.price);
      res.json(plans);
    } catch (error) {
      console.error('Failed to get active plans:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // Setup wallet routes
  const walletRoutes = (await import('./wallet-routes')).default;
  app.use('/api/wallet', walletRoutes);
  
  // Setup affiliate routes
  const affiliateRoutes = (await import('./affiliate-routes')).default;
  app.use('/api/affiliate', affiliateRoutes);

  // Setup NFC routes
  const nfcRoutes = (await import('./nfc-routes')).default;
  app.use('/api/nfc', nfcRoutes);
  
  // Setup email notification routes
  app.use('/api/notifications', emailNotificationRoutes);
  
  // Setup appointment routes
  const { setupAppointmentRoutes } = await import('./appointment-routes');
  setupAppointmentRoutes(app);
  
  // Setup analytics routes
  setupAnalyticsRoutes(app);

  // Setup calendar integration routes
  setupCalendarRoutes(app);
  
  // Setup video meeting routes
  setupVideoMeetingRoutes(app);

  // Setup webhook routes for calendar/video integrations
  setupWebhookRoutes(app);
  
  // Start calendar sync worker
  calendarSyncWorker.start();

  // Setup payment routes (conditional based on Stripe configuration)
  try {
    const { setupPaymentRoutes } = await import('./payment-routes');
    setupPaymentRoutes(app);
  } catch (error) {
    console.warn('⚠️  Payment routes not loaded:', error instanceof Error ? error.message : 'Unknown error');
  }
  
  // Setup availability routes
  const { setupAvailabilityRoutes } = await import('./availability-routes');
  setupAvailabilityRoutes(app);
  
  // Setup comprehensive team scheduling routes
  const { setupTeamSchedulingRoutes } = await import('./team-scheduling-routes');
  setupTeamSchedulingRoutes(app);
  
  // Setup template collections routes
  app.use('/api/collections', requireAuth, templateCollectionsRoutes);
  
  // Setup PWA routes (public - no auth required for manifest)
  app.use('/api/pwa', pwaRouter);
  
  // Setup notification routes
  const notificationRoutes = (await import('./modules/notifications')).default;
  app.use('/api/notify', notificationRoutes);
  
  // Setup AR routes
  const arRoutes = (await import('./modules/ar')).default;
  app.use('/api/ar', arRoutes);
  
  // Setup automation routes
  const { automationRoutes } = await import('./modules/automation/routes');
  app.use('/api/automation', automationRoutes);

  // Setup upload routes
  const uploadRoutes = (await import('./upload-routes')).default;
  app.use('/api/uploads', uploadRoutes);

  // Setup media routes with image optimization
  const mediaRoutes = (await import('./routes/media')).default;
  app.use('/api/media', mediaRoutes);

  // Setup object storage routes for serving uploaded files
  // Referenced from blueprint:javascript_object_storage
  const { ObjectStorageService, ObjectNotFoundError } = await import('./objectStorage.js');
  const { ObjectPermission } = await import('./objectAcl.js');

  // Serve protected uploaded files (requires authentication and ACL check)
  app.get('/objects/:objectPath(*)', requireAuth, async (req, res) => {
    const userId = req.user?.id;
    const objectStorageService = new ObjectStorageService();
    try {
      // Use the full path including /objects/ prefix
      const fullPath = `/objects/${req.params.objectPath}`;
      const objectFile = await objectStorageService.getObjectEntityFile(fullPath);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error('Error checking object access:', error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Get upload URL for object storage (used by frontend upload components)
  app.post('/api/objects/upload', requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error('Error getting upload URL:', error);
      res.status(500).json({ error: 'Failed to get upload URL' });
    }
  });

  // === ENHANCED API ENDPOINTS ===
  
  // Advanced User Management APIs
  app.get('/api/user/profile', enhancedAuth, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const userProfile = await storage.getUserProfile(userId);
    
    if (!userProfile) {
      throw notFoundError('User profile', userId);
    }
    
    successResponse(res, userProfile, 'Profile retrieved successfully');
  }));
  
  app.put('/api/user/profile', 
    enhancedAuth, 
    asyncHandler(async (req, res) => {
      // Validate request body
      const bodyValidation = userValidationSchemas.updateProfile.safeParse(req.body);
      if (!bodyValidation.success) {
        throw validationError('Invalid request body', bodyValidation.error.errors);
      }
      
      const userId = (req.user as any).id;
      const updatedProfile = await storage.updateUser(userId, bodyValidation.data);
      
      successResponse(res, updatedProfile, 'Profile updated successfully');
    })
  );
  
  app.get('/api/user/settings', enhancedAuth, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const settings = await storage.getUserSettings(userId);
    
    successResponse(res, settings, 'Settings retrieved successfully');
  }));
  
  // Enhanced Team Management APIs
  app.post('/api/teams', 
    enhancedAuth,
    requirePlan('paid'),
    asyncHandler(async (req, res) => {
      // Validate request body
      const bodyValidation = teamValidationSchemas.create.safeParse(req.body);
      if (!bodyValidation.success) {
        throw validationError('Invalid request body', bodyValidation.error.errors);
      }
      
      const userId = (req.user as any).id;
      const teamData = { ...bodyValidation.data, ownerId: userId };
      
      const team = await storage.createTeam(teamData);
      successResponse(res, team, 'Team created successfully', 201);
    })
  );
  
  app.get('/api/teams', enhancedAuth, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    
    // Validate query parameters
    const queryValidation = commonSchemas.pagination.safeParse(req.query);
    if (!queryValidation.success) {
      throw validationError('Invalid query parameters', queryValidation.error.errors);
    }
    const { page, limit } = queryValidation.data;
    
    const { teams, total } = await storage.getUserTeams(userId, { page, limit });
    paginatedResponse(res, teams, total, page, limit, 'Teams retrieved successfully');
  }));
  
  app.post('/api/teams/:id/invite',
    enhancedAuth,
    requireTeamAccess(['owner', 'admin']),
    asyncHandler(async (req, res) => {
      // Validate request body
      const bodyValidation = teamValidationSchemas.invite.safeParse(req.body);
      if (!bodyValidation.success) {
        throw validationError('Invalid request body', bodyValidation.error.errors);
      }
      
      const teamId = req.params.id;
      const invitation = await storage.inviteTeamMember(teamId, bodyValidation.data);
      
      // Send invitation email
      await emitAutomationEvent({
        type: 'team.member.invited',
        data: { teamId, invitation }
      });
      
      successResponse(res, invitation, 'Team member invited successfully', 201);
    })
  );
  
  // Advanced Appointment Management APIs
  app.get('/api/appointments/conflicts',
    enhancedAuth,
    validateRequest(z.object({
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      excludeId: z.string().uuid().optional(),
    }), 'query'),
    asyncHandler(async (req, res) => {
      const userId = (req.user as any).id;
      const conflicts = await conflictDetectionService.detectConflicts(
        userId,
        req.query.startTime,
        req.query.endTime,
        req.query.excludeId
      );
      
      successResponse(res, conflicts, 'Conflict check completed');
    })
  );
  
  app.post('/api/appointments/:id/reschedule',
    enhancedAuth,
    requireOwnership('appointment'),
    validateRequest(z.object({
      startTime: z.string().datetime(),
      timezone: z.string(),
      reason: z.string().max(500).optional(),
    })),
    asyncHandler(async (req, res) => {
      const appointmentId = req.params.id;
      const rescheduledAppointment = await storage.rescheduleAppointment(
        appointmentId,
        req.body
      );
      
      // Emit automation event for notifications
      await emitAutomationEvent({
        type: 'appointment.rescheduled',
        data: { appointment: rescheduledAppointment }
      });
      
      successResponse(res, rescheduledAppointment, 'Appointment rescheduled successfully');
    })
  );
  
  app.post('/api/appointments/:id/confirm',
    enhancedAuth,
    requireOwnership('appointment'),
    asyncHandler(async (req, res) => {
      const appointmentId = req.params.id;
      const confirmedAppointment = await storage.confirmAppointment(appointmentId);
      
      await emitAutomationEvent({
        type: 'appointment.confirmed',
        data: { appointment: confirmedAppointment }
      });
      
      successResponse(res, confirmedAppointment, 'Appointment confirmed successfully');
    })
  );

  // ===== APPOINTMENT MANAGEMENT API ENDPOINTS =====
  app.get('/api/appointments',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const { search, status, eventType, page = '1', limit = '10' } = req.query;
      
      const appointments = await storage.getUserAppointments(userId, {
        search: search as string,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      });

      res.json({ 
        success: true, 
        data: { 
          appointments,
          pagination: {
            page: parseInt(page as string),
            limit: parseInt(limit as string),
            total: appointments.length,
            pages: Math.ceil(appointments.length / parseInt(limit as string))
          }
        } 
      });
    })
  );

  app.get('/api/appointments/stats',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const appointments = await storage.getUserAppointments(userId, {});

      const stats = {
        totalAppointments: appointments.length,
        upcomingAppointments: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
        completedAppointments: appointments.filter(a => a.status === 'completed').length,
        cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
        totalRevenue: 0,
        averageBookingValue: 0,
        mostPopularEventType: 'consultation',
        busyDay: 'Monday'
      };

      res.json({ success: true, data: stats });
    })
  );

  app.post('/api/appointments',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const appointmentData = {
        ...req.body,
        hostId: userId,
      };

      const newAppointment = await storage.createAppointment(appointmentData);
      
      await emitAutomationEvent({
        type: 'appointment.created',
        data: { appointment: newAppointment }
      });

      res.json({ success: true, data: newAppointment, message: 'Appointment created successfully' });
    })
  );

  app.patch('/api/appointments/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const updatedAppointment = await storage.updateAppointment(id, req.body);
      
      await emitAutomationEvent({
        type: 'appointment.updated',
        data: { appointment: updatedAppointment }
      });

      res.json({ success: true, data: updatedAppointment, message: 'Appointment updated successfully' });
    })
  );

  app.delete('/api/appointments/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.cancelAppointment(id, 'Cancelled by user');
      
      await emitAutomationEvent({
        type: 'appointment.cancelled',
        data: { appointmentId: id }
      });

      res.json({ success: true, message: 'Appointment cancelled successfully' });
    })
  );

  // ===== EVENT TYPES API ENDPOINTS =====
  app.get('/api/event-types',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const { search, isActive } = req.query;
      
      const eventTypes = await storage.getUserAppointmentEventTypes(userId, {
        search: search as string,
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
      });

      res.json({ success: true, data: eventTypes });
    })
  );

  app.get('/api/event-types/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const eventType = await storage.getAppointmentEventType(id);
      
      if (!eventType) {
        return res.status(404).json({ success: false, message: 'Event type not found' });
      }

      res.json({ success: true, data: eventType });
    })
  );

  app.post('/api/event-types',
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const eventTypeData = {
        ...req.body,
        userId,
      };

      const newEventType = await storage.createAppointmentEventType(eventTypeData);
      res.json({ success: true, data: newEventType, message: 'Event type created successfully' });
    })
  );

  app.patch('/api/event-types/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const updatedEventType = await storage.updateAppointmentEventType(id, req.body);
      res.json({ success: true, data: updatedEventType, message: 'Event type updated successfully' });
    })
  );

  app.delete('/api/event-types/:id',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.deleteAppointmentEventType(id);
      res.json({ success: true, message: 'Event type deleted successfully' });
    })
  );

  app.post('/api/event-types/:id/duplicate',
    requireAuth,
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const { name } = req.body;
      const duplicatedEventType = await storage.duplicateAppointmentEventType(id, name);
      res.json({ success: true, data: duplicatedEventType, message: 'Event type duplicated successfully' });
    })
  );
  
  // Availability & Scheduling Enhancement APIs
  app.get('/api/availability/check',
    asyncHandler(async (req, res) => {
      // Validate query parameters
      const queryValidation = z.object({
        eventTypeId: z.string().uuid(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        timezone: z.string(),
      }).safeParse(req.query);
      
      if (!queryValidation.success) {
        throw validationError('Invalid query parameters', queryValidation.error.errors);
      }
      
      const availability = await storage.checkAvailability(queryValidation.data);
      successResponse(res, availability, 'Availability checked successfully');
    })
  );
  
  app.post('/api/availability/bulk-check',
    asyncHandler(async (req, res) => {
      // Validate request body
      const bodyValidation = z.object({
        eventTypeId: z.string().uuid(),
        timeSlots: z.array(z.object({
          startTime: z.string().datetime(),
          endTime: z.string().datetime(),
        })),
        timezone: z.string(),
      }).safeParse(req.body);
      
      if (!bodyValidation.success) {
        throw validationError('Invalid request body', bodyValidation.error.errors);
      }
      
      const bulkAvailability = await storage.bulkCheckAvailability(bodyValidation.data);
      successResponse(res, bulkAvailability, 'Bulk availability check completed');
    })
  );
  
  app.get('/api/availability/suggestions',
    asyncHandler(async (req, res) => {
      // Validate query parameters
      const queryValidation = z.object({
        eventTypeId: z.string().uuid(),
        preferredDate: z.string().datetime(),
        timezone: z.string(),
        count: z.string().regex(/^\d+$/).transform(val => Math.min(parseInt(val), 20)).default('10'),
      }).safeParse(req.query);
      
      if (!queryValidation.success) {
        throw validationError('Invalid query parameters', queryValidation.error.errors);
      }
      
      const validatedQuery = queryValidation.data;
      const suggestions = await storage.getAvailabilitySuggestions(validatedQuery);
      successResponse(res, suggestions, 'Availability suggestions retrieved');
    })
  );
  
  // Enhanced Authentication APIs with comprehensive validation
  app.post('/api/auth/register',
    asyncHandler(async (req, res) => {
      // Validate request body
      const bodyValidation = userValidationSchemas.register.safeParse(req.body);
      if (!bodyValidation.success) {
        throw validationError('Invalid request body', bodyValidation.error.errors);
      }
      
      const { email, password, firstName, lastName, timezone, acceptTerms } = bodyValidation.data;
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        throw validationError('Email already registered', 'EMAIL_ALREADY_EXISTS');
      }
      
      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = await storage.createUser({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        timezone,
        acceptTerms,
      });
      
      // Auto-login the user after successful registration
      req.login(newUser as any, (err) => {
        if (err) {
          console.error('Auto-login after registration failed:', err);
          // Remove sensitive data from response
          const { password: _, ...userResponse } = newUser;
          return res.status(201).json({
            success: true,
            data: userResponse,
            message: 'Account created successfully. Please log in.',
          });
        }
        
        // Remove sensitive data from response
        const { password: _, ...userResponse } = newUser;
        successResponse(res, userResponse, 'User registered and logged in successfully', 201);
      });
    })
  );
  
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      ok: true, 
      timestamp: new Date().toISOString(),
      scheduler: {
        active: notificationScheduler.isActive(),
        uptime: process.uptime()
      }
    });
  });
  
  // Scheduler-specific status endpoint
  app.get('/api/notifications/scheduler/status', (req, res) => {
    res.json({
      active: notificationScheduler.isActive(),
      uptime: process.uptime(),
      lastCheck: new Date().toISOString(),
      status: notificationScheduler.isActive() ? 'healthy' : 'stopped'
    });
  });

  // Calendar integration health check endpoint
  app.get('/api/calendar/health', async (req, res) => {
    try {
      const healthStatus = await calendarHealthChecker.performHealthCheck();
      res.json({
        status: healthStatus.overall ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        components: healthStatus
      });
    } catch (error) {
      console.error('Calendar health check error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Public plans endpoint for landing page
  app.get("/api/plans", async (req, res) => {
    try {
      const plans = await storage.getPlans();
      // Include only public information (all plans from getPlans are already active)
      const publicPlans = plans
        .map(plan => ({
          id: plan.id,
          name: plan.name,
          planType: plan.planType,
          price: plan.price,
          interval: plan.interval,
          description: plan.cardLabel || '', // Use cardLabel as description fallback
          features: plan.features,
          isPopular: false // Default value since isPopular doesn't exist in schema
        }))
        .sort((a, b) => a.price - b.price); // Sort by price ascending
      
      res.json(publicPlans);
    } catch (error) {
      console.error('Failed to get public plans:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  // Public templates endpoint for templates page
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getGlobalTemplates({ isActive: true });
      
      // Map to frontend format
      const publicTemplates = templates.map(template => {
        const templateData = template.templateData as any || {};
        return {
          id: template.id,
          name: template.name,
          description: template.description,
          category: templateData.category || 'General',
          previewImage: template.previewImage || '',
          backgroundColor: templateData.backgroundColor || '#10B981',
          textColor: templateData.textColor || '#FFFFFF',
          templateData: template.templateData
        };
      });
      
      res.json(publicTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      res.status(500).json({ message: 'Failed to fetch templates' });
    }
  });

  // Public icons endpoint for card builder
  app.get("/api/icons", async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const icons = await storage.getIcons({ isActive: true, category });
      
      // Map to frontend format
      const publicIcons = icons.map(icon => ({
        name: icon.name,
        icon: icon.fontAwesomeIcon || icon.svg,
        category: icon.category,
        id: icon.id
      }));
      
      res.json(publicIcons);
    } catch (error) {
      console.error('Error fetching icons:', error);
      res.status(500).json({ message: 'Failed to fetch icons' });
    }
  });

  // Public element types endpoint for card builder
  app.get("/api/element-types", async (req, res) => {
    try {
      const elementTypes = await storage.getPageElementTypes({ isActive: true });
      
      // Map to frontend format
      const publicElementTypes = elementTypes.map(et => ({
        type: et.type,
        title: et.title,
        icon: et.icon,
        color: et.color,
        description: et.description,
        isPremium: et.isPremium,
        defaultConfig: et.defaultConfig
      }));
      
      // Essential element types that must always be available (if missing from database)
      const essentialElements = [
        {
          type: "bookAppointment",
          title: "Book Appointment",
          icon: "fas fa-calendar-alt",
          color: "bg-gradient-to-r from-blue-500 to-teal-600",
          description: "Appointment booking button",
          isPremium: false,
          defaultConfig: {}
        },
        {
          type: "scheduleCall",
          title: "Schedule Call",
          icon: "fas fa-phone",
          color: "bg-gradient-to-r from-green-500 to-blue-600",
          description: "Schedule a phone/video call",
          isPremium: false,
          defaultConfig: {}
        },
        {
          type: "meetingRequest",
          title: "Meeting Request",
          icon: "fas fa-handshake",
          color: "bg-gradient-to-r from-purple-500 to-indigo-600",
          description: "Request a meeting button",
          isPremium: false,
          defaultConfig: {}
        },
        {
          type: "availabilityDisplay",
          title: "Availability Display",
          icon: "fas fa-clock",
          color: "bg-gradient-to-r from-amber-500 to-orange-600",
          description: "Show your availability schedule",
          isPremium: false,
          defaultConfig: {}
        },
        {
          type: "subscribeForm",
          title: "Subscribe to Updates",
          icon: "fas fa-bell",
          color: "bg-gradient-to-r from-orange-500 to-red-600",
          description: "Let visitors subscribe to notifications",
          isPremium: false,
          defaultConfig: {}
        },
        {
          type: "profile",
          title: "Profile Section",
          icon: "fas fa-user-circle",
          color: "bg-gradient-to-r from-amber-500 to-orange-600",
          description: "Add profile with cover image, photo, name, title, company",
          isPremium: false,
          defaultConfig: {}
        },
        {
          type: "shop",
          title: "Digital Shop",
          icon: "fas fa-shopping-bag",
          color: "bg-gradient-to-r from-green-500 to-emerald-600",
          description: "Showcase your digital products",
          isPremium: false,
          defaultConfig: {}
        }
      ];
      
      // Merge essential elements that are missing from database
      const existingTypes = new Set(publicElementTypes.map(et => et.type));
      for (const essential of essentialElements) {
        if (!existingTypes.has(essential.type)) {
          publicElementTypes.push(essential);
        }
      }
      
      res.json(publicElementTypes);
    } catch (error) {
      console.error('Error fetching element types:', error);
      res.status(500).json({ message: 'Failed to fetch element types' });
    }
  });

  // Authentication routes
  app.get('/api/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/api/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect to dashboard
      res.redirect('/dashboard');
    }
  );

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ message: 'Session destroy failed' });
        }
        res.clearCookie('sessionId');
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  });

  // Delete account
  app.delete('/api/auth/account', requireAuth, asyncHandler(async (req, res) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    
    await storage.deleteUser(req.user.id);
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Account deleted successfully' });
  }));

  // Get current user
  app.get('/api/auth/user', optionalAuth, async (req, res) => {
    // Prevent caching to ensure fresh user data during impersonation
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    if (req.isAuthenticated()) {
      // The optionalAuth middleware already handles impersonation
      const user = req.user as any;
      const { password, ...userProfile } = user;
      
      // Fetch active subscription if user exists
      try {
        const subscription = await storage.getUserSubscription(user.id);
        res.json({ ...userProfile, subscription });
      } catch (error) {
        console.error('Error fetching subscription:', error);
        res.json(userProfile);
      }
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });

  // Update user profile
  app.patch('/api/auth/profile', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { firstName, lastName, email } = req.body;

      // Validate required fields
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: 'All fields are required' });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }

      // Check if email is already in use by another user
      if (email !== user.email) {
        const existingUser = await storage.getUserByEmail(email);
        if (existingUser && existingUser.id !== user.id) {
          return res.status(400).json({ message: 'Email is already in use' });
        }
      }

      // Update user profile
      const updatedUser = await storage.updateUser(user.id, {
        firstName,
        lastName,
        email,
      });

      const { password, ...userProfile } = updatedUser as any;
      res.json(userProfile);
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Configure multer for profile image uploads
  const profileUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'), false);
      }
    }
  });

  // Upload profile avatar
  app.post('/api/auth/upload-avatar', requireAuth, profileUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No image file provided' });
      }

      const user = req.user as User;
      const file = req.file;

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `avatar-${user.id}-${Date.now()}${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file to disk
      fs.writeFileSync(filepath, file.buffer);

      // Update user profile with new image URL
      const imageUrl = `/uploads/avatars/${filename}`;
      const updatedUser = await storage.updateUser(user.id, {
        profileImageUrl: imageUrl,
      });

      const { password, ...userProfile } = updatedUser as any;
      res.json({ 
        message: 'Profile image updated successfully',
        user: userProfile,
        imageUrl 
      });
    } catch (error) {
      console.error('Avatar upload error:', error);
      res.status(500).json({ message: 'Failed to upload profile image' });
    }
  });

  // General file upload endpoint (for icons, images, etc.)
  app.post('/api/upload', requireAuth, profileUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file provided' });
      }

      const user = req.user as User;
      const file = req.file;

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'files');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const filename = `file-${user.id}-${Date.now()}${fileExtension}`;
      const filepath = path.join(uploadsDir, filename);

      // Save file to disk
      fs.writeFileSync(filepath, file.buffer);

      // Return public URL
      const url = `/uploads/files/${filename}`;
      res.json({ url });
    } catch (error) {
      console.error('File upload error:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  });

  // Email/password registration
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { firstName, lastName, email, password } = req.body;
      
      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          message: 'All fields are required: firstName, lastName, email, password' 
        });
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      
      // Validate password strength
      if (password.length < 8) {
        return res.status(400).json({ 
          message: 'Password must be at least 8 characters long' 
        });
      }
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          message: 'An account with this email already exists' 
        });
      }
      
      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      // Create user
      const newUser = await storage.createUser({
        email,
        firstName,
        lastName,
        password: hashedPassword,
        planType: 'free',
        businessCardsLimit: 1,
        businessCardsCount: 0,
      });
      
      // Log the user in
      req.login(newUser as any, (err) => {
        if (err) {
          console.error('Auto-login after registration failed:', err);
          return res.status(201).json({ 
            message: 'Account created successfully. Please log in.',
            userId: newUser.id 
          });
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = newUser as any;
        res.status(201).json({ 
          message: 'Account created and logged in successfully',
          user: userWithoutPassword 
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Failed to create account' });
    }
  });

  // Email/password login
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password, rememberMe = false } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required' 
        });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
      
      // Check if user has a password (Google OAuth users might not)
      if (!user.password) {
        return res.status(401).json({ 
          message: 'This account was created with Google. Please use Google Sign-In.' 
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
      
      // Set session cookie duration based on rememberMe
      // 30 days if rememberMe is true, 1 day if false
      const sessionDuration = rememberMe 
        ? 30 * 24 * 60 * 60 * 1000  // 30 days in milliseconds
        : 24 * 60 * 60 * 1000;       // 1 day in milliseconds
      
      // Log the user in
      req.login(user as any, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: 'Login failed' });
        }
        
        // Set session cookie maxAge
        if (req.session.cookie) {
          req.session.cookie.maxAge = sessionDuration;
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user as any;
        res.json({ 
          message: 'Login successful',
          user: userWithoutPassword 
        });
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Admin login route
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email, password, rememberMe = false } = req.body;
      
      // Validate required fields
      if (!email || !password) {
        return res.status(400).json({ 
          message: 'Email and password are required' 
        });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
      
      // Check if user is an admin
      if (user.role !== 'admin' && user.role !== 'super_admin' && user.role !== 'owner') {
        return res.status(403).json({ 
          message: 'Access denied. Admin privileges required.' 
        });
      }
      
      // Check if user has a password (Google OAuth users might not)
      if (!user.password) {
        return res.status(401).json({ 
          message: 'This account was created with Google. Please use Google Sign-In.' 
        });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }
      
      // Set session cookie duration based on rememberMe
      // 30 days if rememberMe is true, 1 day if false
      const sessionDuration = rememberMe 
        ? 30 * 24 * 60 * 60 * 1000  // 30 days in milliseconds
        : 24 * 60 * 60 * 1000;       // 1 day in milliseconds
      
      // Log the user in
      req.login(user as any, (err) => {
        if (err) {
          console.error('Admin login error:', err);
          return res.status(500).json({ message: 'Login failed' });
        }
        
        // Set session cookie maxAge
        if (req.session.cookie) {
          req.session.cookie.maxAge = sessionDuration;
        }
        
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user as any;
        res.json({ 
          message: 'Admin login successful',
          user: userWithoutPassword 
        });
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: 'Login failed' });
    }
  });

  // Password reset - Request reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          message: 'Email is required' 
        });
      }
      
      // Find user by email
      const user = await storage.getUserByEmail(email);
      
      // Always return success to prevent email enumeration
      // But only send email if user exists with password
      if (user && user.password) {
        // Generate reset token (random 32-byte hex string)
        const crypto = await import('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now
        
        // Import database dependencies
        const { db } = await import('./db');
        const { users } = await import('@shared/schema');
        const { eq } = await import('drizzle-orm');
        
        // Save token to database
        await db.update(users)
          .set({ 
            resetToken,
            resetTokenExpiry 
          })
          .where(eq(users.id, user.id));
        
        // Send password reset email
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
        
        // Send email
        await emailService.sendEmail({
          to: email,
          subject: 'Reset Your Password - TalkLink',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f3f4f6; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                .header { background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); padding: 40px 30px; text-align: center; }
                .logo { width: 60px; height: 60px; background: white; border-radius: 12px; display: inline-flex; align-items: center; justify-center; font-size: 28px; font-weight: bold; color: #ea580c; margin-bottom: 20px; }
                .header h1 { color: white; margin: 0; font-size: 24px; }
                .content { padding: 40px 30px; }
                .content h2 { color: #1f2937; margin-top: 0; }
                .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
                .button:hover { background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%); }
                .footer { background-color: #f9fafb; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
                .warning { background-color: #fef3c7; border-left: 4px solid: #f59e0b; padding: 12px 16px; margin: 20px 0; border-radius: 4px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <div class="logo">2T</div>
                  <h1>Password Reset Request</h1>
                </div>
                <div class="content">
                  <h2>Hello ${user.firstName || 'there'},</h2>
                  <p>We received a request to reset your password for your TalkLink account. If you didn't make this request, you can safely ignore this email.</p>
                  <p>To reset your password, click the button below:</p>
                  <center>
                    <a href="${resetUrl}" class="button">Reset Password</a>
                  </center>
                  <div class="warning">
                    <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour and can only be used once.
                  </div>
                  <p>If the button doesn't work, copy and paste this link into your browser:</p>
                  <p style="word-break: break-all; color: #6b7280; font-size: 14px;">${resetUrl}</p>
                </div>
                <div class="footer">
                  <p><strong>TalkLink</strong> - Digital Business Cards & Networking</p>
                  <p>This is an automated email. Please do not reply.</p>
                </div>
              </div>
            </body>
            </html>
          `,
        });
        
        console.log('Password reset email sent to:', email);
      }
      
      res.json({ 
        message: 'If an account exists with this email, you will receive a password reset link.' 
      });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ message: 'Failed to process password reset request' });
    }
  });

  // Password reset - Confirm reset with token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = req.body;
      
      if (!token || !password) {
        return res.status(400).json({ 
          message: 'Token and password are required' 
        });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ 
          message: 'Password must be at least 6 characters long' 
        });
      }
      
      // Import database dependencies
      const { db } = await import('./db');
      const { users } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Find user with this reset token that hasn't expired
      const [user] = await db.select()
        .from(users)
        .where(eq(users.resetToken, token))
        .limit(1);
      
      if (!user) {
        return res.status(400).json({ 
          message: 'Invalid or expired reset token' 
        });
      }
      
      // Check if token has expired
      if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return res.status(400).json({ 
          message: 'Reset token has expired. Please request a new one.' 
        });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);
      
      // Update password and clear reset token
      await db.update(users)
        .set({ 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null 
        })
        .where(eq(users.id, user.id));
      
      res.json({ 
        message: 'Password has been reset successfully' 
      });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password' });
    }
  });

  // Teams API  
  app.get('/api/teams', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const teams = await storage.getUserTeams(user.id);
      res.json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ message: 'Failed to fetch teams' });
    }
  });

  app.post('/api/teams', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const teamData = teamSettingsSchema.parse(req.body);
      const team = await storage.createTeam({
        ...teamData,
        ownerId: user.id,
      });
      
      res.status(201).json(team);
    } catch (error) {
      console.error('Error creating team:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid team data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create team' });
    }
  });

  app.get('/api/teams/:teamId/members', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { teamId } = req.params;
      
      // Check if user has access to this team
      const userTeams = await storage.getUserTeams(user.id);
      const hasAccess = userTeams.some(t => t.id === teamId);
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const members = await storage.getTeamMembers(teamId);
      res.json(members);
    } catch (error) {
      console.error('Error fetching team members:', error);
      res.status(500).json({ message: 'Failed to fetch team members' });
    }
  });

  app.post('/api/teams/:teamId/members', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { teamId } = req.params;
      
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Check if user is team owner or admin
      const isOwner = team.ownerId === user.id;
      
      if (!isOwner) {
        return res.status(403).json({ message: 'Only team owner can invite members' });
      }

      const invitationData = teamInvitationSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(invitationData.email);
      
      const member = await storage.createTeamMember({
        teamId,
        userId: existingUser?.id,
        email: invitationData.email,
        firstName: invitationData.firstName,
        lastName: invitationData.lastName,
        title: invitationData.title,
        department: invitationData.department,
        phone: invitationData.phone,
        role: invitationData.role,
        status: existingUser ? 'active' : 'invited',
        invitedBy: user.id,
      });
      
      res.status(201).json(member);
    } catch (error) {
      console.error('Error inviting team member:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid invitation data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to invite team member' });
    }
  });

  app.post('/api/teams/:teamId/bulk-generate', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { teamId } = req.params;
      
      const team = await storage.getTeam(teamId);
      if (!team) {
        return res.status(404).json({ message: 'Team not found' });
      }

      // Check if user is team owner
      const isOwner = team.ownerId === user.id;
      
      if (!isOwner) {
        return res.status(403).json({ message: 'Only team owner can perform bulk generation' });
      }

      const { jobName, members, templateCard } = req.body;
      
      if (!Array.isArray(members) || members.length === 0) {
        return res.status(400).json({ message: 'Members array is required' });
      }
      
      // Create bulk generation job
      const job = await storage.createBulkGenerationJob({
        teamId,
        createdBy: user.id,
        jobName,
        memberCount: members.length,
        templateData: templateCard || {},
        status: 'processing',
        startedAt: new Date(),
      });
      
      // Process bulk generation
      let completedCount = 0;
      let failedCount = 0;
      
      for (const member of members) {
        try {
          // Check if user already exists
          const existingUser = await storage.getUserByEmail(member.email);
          
          const teamMember = await storage.createTeamMember({
            teamId,
            userId: existingUser?.id,
            email: member.email,
            firstName: member.firstName,
            lastName: member.lastName,
            title: member.title,
            department: member.department,
            phone: member.phone,
            role: member.role || 'member',
            status: existingUser ? 'active' : 'invited',
            invitedBy: user.id,
          });
          
          // Create business card for member
          const cardData = {
            fullName: `${member.firstName} ${member.lastName}`,
            title: member.title,
            email: member.email,
            phone: member.phone || '',
            company: team.companyName || templateCard?.company || '',
            website: team.companyWebsite || templateCard?.website || '',
            location: team.companyAddress || templateCard?.location || '',
            brandColor: team.defaultBrandColor,
            accentColor: team.defaultAccentColor,
            font: team.defaultFont,
            template: team.defaultTemplate,
            logo: team.teamLogo || templateCard?.logo || '',
            shareSlug: `${member.firstName.toLowerCase()}-${member.lastName.toLowerCase()}-${teamId.slice(0, 8)}-${Date.now()}`,
            ...(templateCard || {}),
          };
          
          const businessCard = await storage.createBusinessCard({
            ...cardData,
            userId: existingUser?.id || null,
          });
          
          // Update team member with business card reference
          await storage.updateTeamMember(teamMember.id, {
            businessCardId: businessCard.id,
          });
          
          completedCount++;
        } catch (memberError) {
          console.error(`Error creating card for ${member.email}:`, memberError);
          failedCount++;
        }
      }
      
      // Update job status
      await storage.updateBulkGenerationJob(job.id, {
        status: 'completed',
        completedCount,
        failedCount,
        completedAt: new Date(),
      });
      
      res.json({ 
        message: 'Bulk generation completed',
        jobId: job.id,
        completed: completedCount,
        failed: failedCount,
        total: members.length
      });
    } catch (error) {
      console.error('Error in bulk generation:', error);
      res.status(500).json({ message: 'Failed to perform bulk generation' });
    }
  });

  // User management routes
  app.get('/api/users/profile', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const userWithStats = await storage.getUserStats(user.id);
      res.json({ ...user, stats: userWithStats });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Failed to fetch user profile' });
    }
  });

  app.put('/api/users/profile', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { firstName, lastName, profileImageUrl } = req.body;
      
      const updatedUser = await storage.updateUser(user.id, {
        firstName,
        lastName,
        profileImageUrl,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ message: 'Failed to update user profile' });
    }
  });

  // Business cards routes
  app.get('/api/business-cards', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const businessCards = await storage.getUserBusinessCards(user.id);
      res.json(businessCards);
    } catch (error) {
      console.error('Error fetching business cards:', error);
      res.status(500).json({ message: 'Failed to fetch business cards' });
    }
  });

  app.post('/api/business-cards', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const cardData = req.body;
      
      console.log('POST /api/business-cards - User ID:', user.id);
      console.log('POST /api/business-cards - Card data:', JSON.stringify(cardData, null, 2));
      
      // Validate required fields - allow creation with just customUrl
      if (!cardData.customUrl && !cardData.fullName && !cardData.title) {
        console.log('Missing required fields - need either customUrl or fullName/title');
        return res.status(400).json({ 
          message: 'Please provide either a custom URL or name and title.' 
        });
      }
      
      // Check if user has reached their limit (Pro and Enterprise users have unlimited cards)
      const userCards = await storage.getUserBusinessCards(user.id);
      console.log('Current user cards count:', userCards.length);
      console.log('User plan type:', user.planType);
      console.log('User business cards limit:', user.businessCardsLimit);
      
      if (user.planType === 'free' && userCards.length >= (user.businessCardsLimit || 1)) {
        return res.status(403).json({ 
          message: `You have reached your business card limit (${user.businessCardsLimit}). Upgrade to Pro for unlimited cards.` 
        });
      }
      
      // Use customUrl as the primary identifier (from popup modal)
      // Only generate shareSlug if no customUrl and fullName is provided
      const generateSlug = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      };

      const autoSlug = cardData.fullName ? generateSlug(cardData.fullName) : undefined;
      
      const businessCard = await storage.createBusinessCard({
        ...cardData,
        userId: user.id,
        customUrl: cardData.customUrl, // Lock in custom URL from popup
        shareSlug: cardData.customUrl || cardData.shareSlug || autoSlug, // Use customUrl as priority
        isPublic: true, // Explicitly set cards as public by default
      });
      
      console.log('Created business card:', businessCard);
      res.status(201).json(businessCard);
    } catch (error) {
      console.error('Error creating business card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'Failed to create business card', error: errorMessage });
    }
  });

  // Public route to get business card by shareSlug or customUrl (for clean URLs)
  app.get('/api/business-cards/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const card = await storage.getBusinessCardBySlug(slug);
      
      if (!card || !card.isPublic) {
        return res.status(404).json({ message: 'Business card not found or not public' });
      }
      
      // Increment view count
      await storage.incrementBusinessCardViews(card.id);
      
      res.json(card);
    } catch (error) {
      console.error('Error fetching business card by slug:', error);
      res.status(500).json({ message: 'Failed to fetch business card' });
    }
  });

  app.get('/api/business-cards/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const card = await storage.getBusinessCard(req.params.id);
      
      if (!card || card.userId !== user.id) {
        return res.status(404).json({ message: 'Business card not found' });
      }
      
      res.json(card);
    } catch (error) {
      console.error('Error fetching business card:', error);
      res.status(500).json({ message: 'Failed to fetch business card' });
    }
  });

  app.put('/api/business-cards/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const card = await storage.getBusinessCard(req.params.id);
      
      if (!card || card.userId !== user.id) {
        return res.status(404).json({ message: 'Business card not found' });
      }
      
      // Clean the data - remove fields that shouldn't be updated
      const { id, userId, createdAt, updatedAt, customUrl, shareSlug, ...cleanData } = req.body;
      
      // IMPORTANT: Never change customUrl or shareSlug after creation
      // These are locked once set to maintain consistent QR codes and eCard URLs
      // (users share these URLs with QR codes, so they must never change)
      // Don't regenerate based on fullName changes
      
      console.log('PUT /api/business-cards/:id - Preserving existing URL:', { 
        customUrl: card.customUrl, 
        shareSlug: card.shareSlug 
      });
      console.log('PUT /api/business-cards - Clean data:', JSON.stringify(cleanData, null, 2));
      
      const updatedCard = await storage.updateBusinessCard(req.params.id, cleanData);
      res.json(updatedCard);
    } catch (error) {
      console.error('Error updating business card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'Failed to update business card', error: errorMessage });
    }
  });

  // PATCH endpoint for partial updates
  app.patch('/api/business-cards/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const card = await storage.getBusinessCard(req.params.id);
      
      if (!card || card.userId !== user.id) {
        return res.status(404).json({ message: 'Business card not found' });
      }
      
      // Clean the data - remove fields that shouldn't be updated
      const { id, userId, createdAt, updatedAt, ...cleanData } = req.body;
      
      const updatedCard = await storage.updateBusinessCard(req.params.id, cleanData);
      res.json(updatedCard);
    } catch (error) {
      console.error('Error updating business card:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ message: 'Failed to update business card', error: errorMessage });
    }
  });

  app.delete('/api/business-cards/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const card = await storage.getBusinessCard(req.params.id);
      
      if (!card || card.userId !== user.id) {
        return res.status(404).json({ message: 'Business card not found' });
      }
      
      await storage.deleteBusinessCard(req.params.id);
      res.json({ message: 'Business card deleted successfully' });
    } catch (error) {
      console.error('Error deleting business card:', error);
      res.status(500).json({ message: 'Failed to delete business card' });
    }
  });

  // Public routes for viewing shared business cards
  app.get('/api/cards/:slug', async (req, res) => {
    try {
      const card = await storage.getBusinessCardBySlug(req.params.slug);
      
      if (!card || !card.isPublic) {
        return res.status(404).json({ message: 'Business card not found' });
      }
      
      // Increment view count
      await storage.incrementBusinessCardViews(card.id);
      
      res.json(card);
    } catch (error) {
      console.error('Error fetching shared business card:', error);
      res.status(500).json({ message: 'Failed to fetch business card' });
    }
  });

  // Contact form submission endpoint
  app.post('/api/contact-form/submit', async (req, res) => {
    try {
      const { formData, formConfig } = req.body;
      
      if (!formData || !formConfig) {
        return res.status(400).json({ message: 'Form data and config are required' });
      }

      // Spam protection check
      if (formConfig.spamProtection) {
        // Basic spam protection checks
        const suspiciousPatterns = [
          /viagra|cialis|pharmacy/i,
          /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/, // Credit card patterns
          /bitcoin|crypto|investment/i
        ];
        
        const allText = Object.values(formData).join(' ').toLowerCase();
        const isSpam = suspiciousPatterns.some(pattern => pattern.test(allText));
        
        if (isSpam) {
          console.log('Spam detected in form submission');
          return res.status(400).json({ 
            success: false, 
            message: 'Message flagged by spam protection' 
          });
        }
      }

      const results: {
        email: boolean;
        googleSheets: boolean;
        errors: string[];
      } = {
        email: false,
        googleSheets: false,
        errors: []
      };

      // Send email if receiver email is configured and email notifications enabled
      if (formConfig.receiverEmail && formConfig.emailNotifications !== false) {
        try {
          // Email sending logic
          console.log('📧 Email notification sent to:', formConfig.receiverEmail);
          console.log('📝 Form submission data:', formData);
          console.log('🛡️ Spam protection:', formConfig.spamProtection ? 'ENABLED' : 'DISABLED');
          console.log('📎 File attachments:', formConfig.fileAttachments ? 'ENABLED' : 'DISABLED');
          console.log('🔄 Auto-reply:', formConfig.autoReply ? 'ENABLED' : 'DISABLED');
          
          // Here you would integrate with an email service like SendGrid, Mailgun, etc.
          // For now, we'll simulate successful email sending
          results.email = true;
          
          // Auto-reply logic
          if (formConfig.autoReply && formData.email) {
            console.log('📧 Auto-reply sent to:', formData.email);
            console.log('💬 Auto-reply message: "Thank you for your message! We will get back to you soon."');
          }
          
        } catch (error) {
          console.error('Email sending failed:', error);
          results.errors.push('Failed to send email notification');
        }
      }

      // Send to Google Sheets if configured
      if (formConfig.googleSheets?.enabled && formConfig.googleSheets.spreadsheetId) {
        try {
          if (!isGoogleSheetsConfigured()) {
            throw new Error('Google Sheets not configured on server');
          }

          await addToGoogleSheet(
            {
              spreadsheetId: formConfig.googleSheets.spreadsheetId,
              sheetName: formConfig.googleSheets.sheetName || 'Sheet1'
            },
            formData
          );
          results.googleSheets = true;
          console.log('📊 Google Sheets: Data saved successfully');
        } catch (error) {
          console.error('Google Sheets submission failed:', error);
          results.errors.push('Failed to save to Google Sheets');
        }
      }

      // Return success if at least one method worked or if no receivers are configured
      if (results.email || results.googleSheets || (!formConfig.receiverEmail && !formConfig.googleSheets?.enabled)) {
        res.json({ 
          success: true, 
          message: formConfig.successMessage || 'Form submitted successfully!',
          results 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Form submission failed - email delivery failed',
          results 
        });
      }
    } catch (error) {
      console.error('Contact form submission error:', error);
      res.status(500).json({ message: 'Failed to process form submission' });
    }
  });

  // Optional webhook logging endpoint
  app.post("/api/event", (req, res) => {
    const webhookUrl = process.env.WEBHOOK_URL;
    
    if (webhookUrl) {
      // Forward minimal event logs to webhook
      const { action, timestamp } = req.body;
      
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: action || "unknown",
          timestamp: timestamp || new Date().toISOString(),
          source: "card-preview-app"
        })
      }).catch(err => {
        console.warn("Webhook failed:", err.message);
      });
    }
    
    res.json({ success: true });
  });

  // =============================================================================
  // CRM API ENDPOINTS
  // =============================================================================

  // Contact Management Endpoints
  
  // Get all contacts for the authenticated user with search and filtering
  // CRM Stats endpoint
  app.get('/api/crm/stats', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const stats = await storage.getCRMStats(userId);
    successResponse(res, stats, 'CRM stats retrieved successfully');
  }));

  app.get('/api/crm/contacts', requireAuth, asyncHandler(async (req, res) => {
    const user = req.user as User;
    const { search, tags, lifecycleStage, limit = '50', offset = '0' } = req.query;
    
    const filters: any = {};
    if (search) filters.search = search as string;
    if (tags) filters.tags = (tags as string).split(',');
    if (lifecycleStage) filters.lifecycleStage = lifecycleStage as string;
    
    const contacts = await storage.getContactsByUser(user.id, filters);
    
    // Apply pagination
    const startIndex = parseInt(offset as string);
    const pageSize = Math.min(parseInt(limit as string), 100);
    const paginatedContacts = contacts.slice(startIndex, startIndex + pageSize);
    
    successResponse(res, { contacts: paginatedContacts, total: contacts.length }, 'Contacts retrieved successfully');
  }));

  // Get single contact with activity timeline
  app.get('/api/crm/contacts/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const contact = await storage.getContact(req.params.id);
      
      if (!contact || contact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      // Get contact's recent activities and tasks
      const [activities, tasks] = await Promise.all([
        storage.getContactActivities(contact.id, { limit: 20 }),
        storage.getContactTasks(contact.id)
      ]);
      
      res.json({
        ...contact,
        recentActivities: activities,
        openTasks: tasks.filter(t => t.status !== 'done')
      });
    } catch (error) {
      console.error('Error fetching contact:', error);
      res.status(500).json({ message: 'Failed to fetch contact' });
    }
  });

  // Create new contact
  app.post('/api/crm/contacts', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const contactData = insertCrmContactSchema.parse({
        ...req.body,
        ownerUserId: user.id
      });
      
      // Check for existing contact with same email
      if (contactData.email) {
        const existingContact = await storage.getContactByEmail(contactData.email, user.id);
        if (existingContact) {
          return res.status(400).json({ 
            message: 'A contact with this email already exists',
            existingContactId: existingContact.id
          });
        }
      }
      
      const contact = await storage.createContact(contactData);

      // Trigger automation for new contact creation
      emitAutomationEvent('contact.created', {
        userId: user.id,
        entityId: contact.id,
        entityType: 'contact',
        data: contact,
        timestamp: new Date()
      });
      
      res.status(201).json(contact);
    } catch (error) {
      console.error('Error creating contact:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid contact data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create contact' });
    }
  });

  // Update contact
  app.put('/api/crm/contacts/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const contact = await storage.getContact(req.params.id);
      
      if (!contact || contact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      const updateData = updateCrmContactSchema.parse(req.body);
      
      const updatedContact = await storage.updateContact(req.params.id, updateData);
      
      res.json(updatedContact);
    } catch (error) {
      console.error('Error updating contact:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid contact data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update contact' });
    }
  });

  // Delete contact
  app.delete('/api/crm/contacts/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const contact = await storage.getContact(req.params.id);
      
      if (!contact || contact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      await storage.deleteContact(req.params.id);
      
      res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
      console.error('Error deleting contact:', error);
      res.status(500).json({ message: 'Failed to delete contact' });
    }
  });

  // Merge duplicate contacts
  app.post('/api/crm/contacts/:id/merge', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const primaryContact = await storage.getContact(req.params.id);
      
      if (!primaryContact || primaryContact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Primary contact not found' });
      }
      
      const { duplicateIds } = req.body;
      if (!Array.isArray(duplicateIds) || duplicateIds.length === 0) {
        return res.status(400).json({ message: 'duplicateIds array is required' });
      }
      
      // Verify all duplicate contacts belong to user
      for (const duplicateId of duplicateIds) {
        const duplicate = await storage.getContact(duplicateId);
        if (!duplicate || duplicate.ownerUserId !== user.id) {
          return res.status(403).json({ message: 'Access denied to one or more duplicate contacts' });
        }
      }
      
      const mergedContact = await storage.mergeContacts(req.params.id, duplicateIds);
      
      res.json(mergedContact);
    } catch (error) {
      console.error('Error merging contacts:', error);
      res.status(500).json({ message: 'Failed to merge contacts' });
    }
  });

  // Activity Management Endpoints
  
  // Get user's recent activities
  app.get('/api/crm/activities', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { contactId, type, limit = '20' } = req.query;
      
      const filters: any = { limit: parseInt(limit as string) };
      if (contactId) filters.contactId = contactId as string;
      if (type) filters.type = type as string;
      
      const activities = await storage.getUserActivities(user.id, filters);
      
      res.json(activities);
    } catch (error) {
      console.error('Error fetching activities:', error);
      res.status(500).json({ message: 'Failed to fetch activities' });
    }
  });

  // Get contact's activity timeline
  app.get('/api/crm/contacts/:id/activities', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const contact = await storage.getContact(req.params.id);
      
      if (!contact || contact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      const { type, limit = '50' } = req.query;
      const filters: any = { limit: parseInt(limit as string) };
      if (type) filters.type = type as string;
      
      const activities = await storage.getContactActivities(req.params.id, filters);
      
      res.json(activities);
    } catch (error) {
      console.error('Error fetching contact activities:', error);
      res.status(500).json({ message: 'Failed to fetch contact activities' });
    }
  });

  // Create activity/note
  app.post('/api/crm/activities', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Verify contact belongs to user
      const contact = await storage.getContact(req.body.contactId);
      if (!contact || contact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      const activityData = insertCrmActivitySchema.parse({
        ...req.body,
        createdBy: user.id
      });
      
      const activity = await storage.createActivity(activityData);
      
      res.status(201).json(activity);
    } catch (error) {
      console.error('Error creating activity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid activity data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create activity' });
    }
  });

  // Update activity
  app.put('/api/crm/activities/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const activity = await storage.getActivity(req.params.id);
      
      if (!activity || activity.createdBy !== user.id) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      
      const updateData = updateCrmActivitySchema.parse(req.body);
      
      const updatedActivity = await storage.updateActivity(req.params.id, updateData);
      
      res.json(updatedActivity);
    } catch (error) {
      console.error('Error updating activity:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid activity data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update activity' });
    }
  });

  // Delete activity
  app.delete('/api/crm/activities/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const activity = await storage.getActivity(req.params.id);
      
      if (!activity || activity.createdBy !== user.id) {
        return res.status(404).json({ message: 'Activity not found' });
      }
      
      await storage.deleteActivity(req.params.id);
      
      res.json({ message: 'Activity deleted successfully' });
    } catch (error) {
      console.error('Error deleting activity:', error);
      res.status(500).json({ message: 'Failed to delete activity' });
    }
  });

  // Task Management Endpoints
  
  // Get user's tasks with filtering
  app.get('/api/crm/tasks', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { status, type, assignedTo = user.id } = req.query;
      
      const filters: any = { assignedTo: assignedTo as string };
      if (status) filters.status = status as string;
      if (type) filters.type = type as string;
      
      const tasks = await storage.getUserTasks(user.id, filters);
      
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  });

  // Get contact's tasks
  app.get('/api/crm/contacts/:id/tasks', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const contact = await storage.getContact(req.params.id);
      
      if (!contact || contact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      const { status, assignedTo } = req.query;
      const filters: any = {};
      if (status) filters.status = status as string;
      if (assignedTo) filters.assignedTo = assignedTo as string;
      
      const tasks = await storage.getContactTasks(req.params.id, filters);
      
      res.json(tasks);
    } catch (error) {
      console.error('Error fetching contact tasks:', error);
      res.status(500).json({ message: 'Failed to fetch contact tasks' });
    }
  });

  // Create task
  app.post('/api/crm/tasks', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Verify contact belongs to user
      const contact = await storage.getContact(req.body.contactId);
      if (!contact || contact.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Contact not found' });
      }
      
      const taskData = insertCrmTaskSchema.parse({
        ...req.body,
        createdBy: user.id,
        assignedTo: req.body.assignedTo || user.id
      });
      
      const task = await storage.createTask(taskData);
      
      res.status(201).json(task);
    } catch (error) {
      console.error('Error creating task:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create task' });
    }
  });

  // Update task
  app.put('/api/crm/tasks/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const task = await storage.getTask(req.params.id);
      
      if (!task || (task.createdBy !== user.id && task.assignedTo !== user.id)) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      const updateData = updateCrmTaskSchema.parse(req.body);
      
      const updatedTask = await storage.updateTask(req.params.id, updateData);
      
      res.json(updatedTask);
    } catch (error) {
      console.error('Error updating task:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid task data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update task' });
    }
  });

  // Mark task complete
  app.put('/api/crm/tasks/:id/complete', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const task = await storage.getTask(req.params.id);
      
      if (!task || (task.createdBy !== user.id && task.assignedTo !== user.id)) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      const completedTask = await storage.markTaskComplete(req.params.id);
      
      res.json(completedTask);
    } catch (error) {
      console.error('Error completing task:', error);
      res.status(500).json({ message: 'Failed to complete task' });
    }
  });

  // Delete task
  app.delete('/api/crm/tasks/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const task = await storage.getTask(req.params.id);
      
      if (!task || (task.createdBy !== user.id && task.assignedTo !== user.id)) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      await storage.deleteTask(req.params.id);
      
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: 'Failed to delete task' });
    }
  });

  // Pipeline & Deal Management Endpoints
  
  // Get user's pipelines with stages
  app.get('/api/crm/pipelines', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const pipelines = await storage.getUserPipelines(user.id);
      
      // Get stages for each pipeline
      const pipelinesWithStages = await Promise.all(
        pipelines.map(async (pipeline) => {
          const stages = await storage.getPipelineStages(pipeline.id);
          return { ...pipeline, stages };
        })
      );
      
      res.json(pipelinesWithStages);
    } catch (error) {
      console.error('Error fetching pipelines:', error);
      res.status(500).json({ message: 'Failed to fetch pipelines' });
    }
  });

  // Create pipeline
  app.post('/api/crm/pipelines', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const pipelineData = insertCrmPipelineSchema.parse({
        ...req.body,
        ownerUserId: user.id
      });
      
      const pipeline = await storage.createPipeline(pipelineData);
      
      // Create default stages if none provided
      if (req.body.stages && Array.isArray(req.body.stages)) {
        console.log('Creating stages for pipeline:', pipeline.id, req.body.stages);
        for (let i = 0; i < req.body.stages.length; i++) {
          const stageData = req.body.stages[i];
          try {
            const createdStage = await storage.createStage({
              pipelineId: pipeline.id,
              name: stageData.name,
              description: stageData.description || '',
              order: i,
              probability: stageData.probability || 50,
              isClosedWon: stageData.isClosedWon || false,
              isClosedLost: stageData.isClosedLost || false
            });
            console.log('Stage created successfully:', createdStage.name);
          } catch (stageError) {
            console.error('Failed to create stage:', stageData.name, stageError);
          }
        }
      } else {
        console.log('No stages provided in request body, stages:', req.body.stages);
      }
      
      res.status(201).json(pipeline);
    } catch (error) {
      console.error('Error creating pipeline:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid pipeline data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create pipeline' });
    }
  });

  // Update pipeline
  app.put('/api/crm/pipelines/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const pipeline = await storage.getPipeline(req.params.id);
      
      if (!pipeline || pipeline.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Pipeline not found' });
      }
      
      const updateData = updateCrmPipelineSchema.parse(req.body);
      
      const updatedPipeline = await storage.updatePipeline(req.params.id, updateData);
      
      res.json(updatedPipeline);
    } catch (error) {
      console.error('Error updating pipeline:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid pipeline data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update pipeline' });
    }
  });

  // Delete pipeline
  app.delete('/api/crm/pipelines/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const pipeline = await storage.getPipeline(req.params.id);
      
      if (!pipeline || pipeline.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Pipeline not found' });
      }
      
      await storage.deletePipeline(req.params.id);
      
      res.json({ message: 'Pipeline deleted successfully' });
    } catch (error) {
      console.error('Error deleting pipeline:', error);
      res.status(500).json({ message: 'Failed to delete pipeline' });
    }
  });

  // Get user's deals
  app.get('/api/crm/deals', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { status, pipelineId } = req.query;
      
      const filters: any = {};
      if (status) filters.status = status as string;
      if (pipelineId) filters.pipelineId = pipelineId as string;
      
      const deals = await storage.getUserDeals(user.id, filters);
      
      res.json(deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
      res.status(500).json({ message: 'Failed to fetch deals' });
    }
  });

  // Get deals in specific pipeline
  app.get('/api/crm/pipelines/:id/deals', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const pipeline = await storage.getPipeline(req.params.id);
      
      if (!pipeline || pipeline.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Pipeline not found' });
      }
      
      const { stageId, status } = req.query;
      const filters: any = {};
      if (stageId) filters.stageId = stageId as string;
      if (status) filters.status = status as string;
      
      const deals = await storage.getDealsByPipeline(req.params.id, filters);
      
      res.json(deals);
    } catch (error) {
      console.error('Error fetching pipeline deals:', error);
      res.status(500).json({ message: 'Failed to fetch pipeline deals' });
    }
  });

  // Create deal
  app.post('/api/crm/deals', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Verify pipeline belongs to user
      const pipeline = await storage.getPipeline(req.body.pipelineId);
      if (!pipeline || pipeline.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Pipeline not found' });
      }
      
      // Verify stage belongs to pipeline
      const stage = await storage.getStage(req.body.stageId);
      if (!stage || stage.pipelineId !== req.body.pipelineId) {
        return res.status(400).json({ message: 'Invalid stage for this pipeline' });
      }
      
      // Verify contact if provided
      if (req.body.primaryContactId) {
        const contact = await storage.getContact(req.body.primaryContactId);
        if (!contact || contact.ownerUserId !== user.id) {
          return res.status(404).json({ message: 'Contact not found' });
        }
      }
      
      const dealData = insertCrmDealSchema.parse({
        ...req.body,
        ownerUserId: user.id
      });
      
      const deal = await storage.createDeal(dealData);

      // Trigger automation for new deal creation
      emitAutomationEvent('deal.created', {
        userId: user.id,
        entityId: deal.id,
        entityType: 'deal',
        data: deal,
        timestamp: new Date()
      });
      
      res.status(201).json(deal);
    } catch (error) {
      console.error('Error creating deal:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid deal data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create deal' });
    }
  });

  // Update deal
  app.put('/api/crm/deals/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const deal = await storage.getDeal(req.params.id);
      
      if (!deal || deal.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      
      const updateData = updateCrmDealSchema.parse(req.body);
      
      const updatedDeal = await storage.updateDeal(req.params.id, updateData);
      
      res.json(updatedDeal);
    } catch (error) {
      console.error('Error updating deal:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid deal data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update deal' });
    }
  });

  // Move deal to different stage
  app.put('/api/crm/deals/:id/move', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const deal = await storage.getDeal(req.params.id);
      
      if (!deal || deal.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      
      const moveDealSchema = z.object({
        stageId: z.string().min(1),
        probability: z.number().min(0).max(100).optional()
      });
      
      const { stageId, probability } = moveDealSchema.parse(req.body);
      
      // Verify stage belongs to same pipeline
      const stage = await storage.getStage(stageId);
      if (!stage || stage.pipelineId !== deal.pipelineId) {
        return res.status(400).json({ message: 'Invalid stage for this deal\'s pipeline' });
      }
      
      const movedDeal = await storage.moveDealToStage(req.params.id, stageId);

      // Trigger automation for stage change
      emitAutomationEvent('stage.changed', {
        userId: user.id,
        entityId: deal.id,
        entityType: 'deal',
        data: {
          dealId: deal.id,
          dealTitle: deal.title,
          fromStageId: deal.stageId,
          toStageId: stageId,
          stageName: stage.name,
          probability: movedDeal.probability,
          dealValue: movedDeal.value,
          contactId: movedDeal.primaryContactId,
          pipelineId: movedDeal.pipelineId
        },
        timestamp: new Date()
      });
      
      res.json(movedDeal);
    } catch (error) {
      console.error('Error moving deal:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to move deal' });
    }
  });

  // Delete deal
  app.delete('/api/crm/deals/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const deal = await storage.getDeal(req.params.id);
      
      if (!deal || deal.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Deal not found' });
      }
      
      await storage.deleteDeal(req.params.id);
      
      res.json({ message: 'Deal deleted successfully' });
    } catch (error) {
      console.error('Error deleting deal:', error);
      res.status(500).json({ message: 'Failed to delete deal' });
    }
  });

  // Analytics & Statistics Endpoints
  
  // Get comprehensive CRM stats for dashboard
  app.get('/api/crm/stats', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      
      const [contactStats, dealStats, activityStats] = await Promise.all([
        storage.getContactStats(user.id),
        storage.getDealStats(user.id),
        storage.getActivityStats(user.id)
      ]);
      
      res.json({
        contacts: contactStats,
        deals: dealStats,
        activities: activityStats,
        summary: {
          totalContacts: contactStats.totalContacts,
          totalDeals: dealStats.totalDeals,
          totalValue: dealStats.totalValue,
          conversionRate: dealStats.conversionRate,
          activitiesThisWeek: activityStats.activitiesThisWeek
        }
      });
    } catch (error) {
      console.error('Error fetching CRM stats:', error);
      res.status(500).json({ message: 'Failed to fetch CRM statistics' });
    }
  });

  // Get detailed contact analytics
  app.get('/api/crm/analytics/contacts', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const contactStats = await storage.getContactStats(user.id);
      
      res.json(contactStats);
    } catch (error) {
      console.error('Error fetching contact analytics:', error);
      res.status(500).json({ message: 'Failed to fetch contact analytics' });
    }
  });

  // Get deal analytics and pipeline health
  app.get('/api/crm/analytics/deals', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const dealStats = await storage.getDealStats(user.id);
      
      res.json(dealStats);
    } catch (error) {
      console.error('Error fetching deal analytics:', error);
      res.status(500).json({ message: 'Failed to fetch deal analytics' });
    }
  });

  // ===== AUTOMATION WORKFLOW ENDPOINTS =====
  
  // Get user's automations
  app.get('/api/automations', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automations = await storage.getUserAutomations(user.id);
      res.json(automations);
    } catch (error) {
      console.error('Error fetching automations:', error);
      res.status(500).json({ message: 'Failed to fetch automations' });
    }
  });

  // Create new automation
  app.post('/api/automations', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automationData = {
        ...req.body,
        ownerUserId: user.id
      };

      const automation = await storage.createAutomation(automationData);
      res.status(201).json(automation);
    } catch (error) {
      console.error('Error creating automation:', error);
      res.status(500).json({ message: 'Failed to create automation' });
    }
  });

  // Get specific automation
  app.get('/api/automations/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automation = await storage.getAutomation(req.params.id);
      
      if (!automation || automation.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Automation not found' });
      }
      
      res.json(automation);
    } catch (error) {
      console.error('Error fetching automation:', error);
      res.status(500).json({ message: 'Failed to fetch automation' });
    }
  });

  // Update automation
  app.put('/api/automations/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automation = await storage.getAutomation(req.params.id);
      
      if (!automation || automation.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Automation not found' });
      }

      const updatedAutomation = await storage.updateAutomation(req.params.id, req.body);
      res.json(updatedAutomation);
    } catch (error) {
      console.error('Error updating automation:', error);
      res.status(500).json({ message: 'Failed to update automation' });
    }
  });

  // Delete automation
  app.delete('/api/automations/:id', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automation = await storage.getAutomation(req.params.id);
      
      if (!automation || automation.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Automation not found' });
      }

      await storage.deleteAutomation(req.params.id);
      res.json({ message: 'Automation deleted successfully' });
    } catch (error) {
      console.error('Error deleting automation:', error);
      res.status(500).json({ message: 'Failed to delete automation' });
    }
  });

  // Toggle automation enabled/disabled
  app.patch('/api/automations/:id/toggle', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automation = await storage.getAutomation(req.params.id);
      
      if (!automation || automation.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Automation not found' });
      }

      const updatedAutomation = await storage.updateAutomation(req.params.id, {
        enabled: !automation.enabled
      });
      
      res.json(updatedAutomation);
    } catch (error) {
      console.error('Error toggling automation:', error);
      res.status(500).json({ message: 'Failed to toggle automation' });
    }
  });

  // Get automation execution history
  app.get('/api/automations/:id/runs', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automation = await storage.getAutomation(req.params.id);
      
      if (!automation || automation.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Automation not found' });
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const runs = await storage.getAutomationRuns(req.params.id, limit);
      
      res.json(runs);
    } catch (error) {
      console.error('Error fetching automation runs:', error);
      res.status(500).json({ message: 'Failed to fetch automation runs' });
    }
  });

  // Get all automation runs for user (for global logs view)
  app.get('/api/automation-runs', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const limit = parseInt(req.query.limit as string) || 100;
      const runs = await storage.getUserAutomationRuns(user.id, limit);
      
      res.json(runs);
    } catch (error) {
      console.error('Error fetching automation runs:', error);
      res.status(500).json({ message: 'Failed to fetch automation runs' });
    }
  });

  // Test automation trigger (for testing purposes)
  app.post('/api/automations/:id/test', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const automation = await storage.getAutomation(req.params.id);
      
      if (!automation || automation.ownerUserId !== user.id) {
        return res.status(404).json({ message: 'Automation not found' });
      }

      // Import automation engine for testing
      const { automationEngine } = await import('./automation-engine');
      
      // Create test payload
      const testPayload = {
        userId: user.id,
        entityId: 'test-entity',
        entityType: 'test',
        data: req.body.testData || {},
        timestamp: new Date()
      };

      // Trigger automation with test event
      await automationEngine.triggerAutomations('test.trigger', testPayload);
      
      res.json({ message: 'Test automation triggered successfully' });
    } catch (error) {
      console.error('Error testing automation:', error);
      res.status(500).json({ message: 'Failed to test automation' });
    }
  });

  // === COMPREHENSIVE API ENDPOINTS COMPLETION ===
  
  // Advanced Notification Management APIs
  app.get('/api/notifications', enhancedAuth, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const { page = 1, limit = 20, status } = validateRequest(z.object({
      page: z.string().optional().transform(val => val ? parseInt(val) : 1),
      limit: z.string().optional().transform(val => val ? Math.min(parseInt(val), 100) : 20),
      status: z.enum(['unread', 'read', 'archived']).optional(),
    }), 'query');
    
    const { notifications, total } = await storage.getUserNotifications(userId, { page, limit, status });
    paginatedResponse(res, notifications, total, page, limit, 'Notifications retrieved successfully');
  }));
  
  app.put('/api/notifications/:id/read', enhancedAuth, requireOwnership('notification'), asyncHandler(async (req, res) => {
    const notificationId = req.params.id;
    const notification = await storage.markNotificationAsRead(notificationId);
    successResponse(res, notification, 'Notification marked as read');
  }));
  
  // Advanced Analytics & Reporting APIs
  app.get('/api/analytics/dashboard', enhancedAuth, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const { period = '30d' } = req.query;
    
    const [appointments, revenue] = await Promise.all([
      storage.getAppointmentAnalytics(userId, { period: period as string }),
      storage.getRevenueAnalytics(userId, { period: period as string })
    ]);

    const dashboard = {
      overview: {
        totalBookings: appointments?.totalAppointments || 0,
        confirmedBookings: appointments?.confirmedAppointments || 0,
        noShowBookings: appointments?.noShowAppointments || 0,
      },
      rates: {
        conversionRate: appointments?.conversionRate || 0,
        noShowRate: appointments?.noShowRate || 0,
        confirmationRate: appointments?.confirmationRate || 0,
      },
      revenue: {
        totalRevenue: revenue?.totalRevenue || 0,
        paidBookings: revenue?.paidBookings || 0,
        averageBookingValue: revenue?.averageValue || 0,
      },
      recentActivity: appointments?.recentActivity || [],
      popularTimes: appointments?.popularTimes || [],
    };

    successResponse(res, dashboard, 'Dashboard analytics retrieved successfully');
  }));
  
  app.get('/api/analytics/appointments', enhancedAuth, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const { period = '30d', eventTypeId } = validateRequest(z.object({
      period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
      eventTypeId: z.string().uuid().optional(),
    }), 'query');
    
    const appointmentAnalytics = await storage.getAppointmentAnalytics(userId, { period, eventTypeId });
    successResponse(res, appointmentAnalytics, 'Appointment analytics retrieved successfully');
  }));
  
  app.get('/api/analytics/revenue', enhancedAuth, asyncHandler(async (req, res) => {
    const userId = (req.user as any).id;
    const { period = '30d', currency = 'USD' } = validateRequest(z.object({
      period: z.enum(['7d', '30d', '90d', '1y']).default('30d'),
      currency: z.string().length(3).default('USD'),
    }), 'query');
    
    const revenueAnalytics = await storage.getRevenueAnalytics(userId, { period, currency });
    successResponse(res, revenueAnalytics, 'Revenue analytics retrieved successfully');
  }));

  app.get('/api/analytics/booking-trends', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { period = '30d', granularity = 'day' } = req.query;
    const trends = await storage.getBookingTrends(userId, period as string, granularity as string);
    successResponse(res, trends, 'Booking trends retrieved successfully');
  }));

  app.get('/api/analytics/popular-times', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;
    const popularTimes = await storage.getPopularTimes(userId, period as string);
    successResponse(res, popularTimes, 'Popular times retrieved successfully');
  }));

  app.get('/api/analytics/conversion-rates', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;
    const conversionData = await storage.getConversionRates(userId, period as string);
    successResponse(res, conversionData, 'Conversion rates retrieved successfully');
  }));

  app.get('/api/analytics/no-shows', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;
    const noShowData = await storage.getNoShowAnalytics(userId, period as string);
    successResponse(res, noShowData, 'No-show analytics retrieved successfully');
  }));

  app.get('/api/analytics/customers', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { period = '30d' } = req.query;
    const customerData = await storage.getCustomerAnalytics(userId, period as string);
    successResponse(res, customerData, 'Customer analytics retrieved successfully');
  }));

  app.get('/api/analytics/export', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { type = 'bookings', format = 'json', period = '30d' } = req.query;
    
    let data: any = {};
    
    if (type === 'bookings') {
      data = await storage.getBookingTrends(userId, period as string);
    } else if (type === 'revenue') {
      data = await storage.getRevenueAnalytics(userId, { period: period as string });
    } else if (type === 'customers') {
      data = await storage.getCustomerAnalytics(userId, period as string);
    }

    if (format === 'csv') {
      // Simple CSV conversion for array data
      const lines: string[] = [];
      if (Array.isArray(data)) {
        if (data.length > 0) {
          lines.push(Object.keys(data[0]).join(','));
          data.forEach((row: any) => {
            lines.push(Object.values(row).join(','));
          });
        }
      }
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="analytics-${type}-${Date.now()}.csv"`);
      res.send(lines.join('\n'));
    } else {
      successResponse(res, data, 'Analytics exported successfully');
    }
  }));

  // ===== AFFILIATE API ENDPOINTS =====
  app.get('/api/affiliate/me', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const affiliate = await storage.getAffiliateByUserId(userId);
    
    if (!affiliate) {
      return res.json({ success: true, data: null });
    }

    const stats = await storage.getAffiliateStats(affiliate.id);
    res.json({ success: true, data: { ...affiliate, stats } });
  }));

  app.post('/api/affiliate/apply', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { country, website, sourceInfo } = req.body;
    
    if (!country) {
      throw validationError('Country is required');
    }

    const affiliate = await storage.createAffiliate({
      userId,
      country,
      website,
      sourceInfo,
      status: 'pending' as const,
    });

    successResponse(res, affiliate, 'Affiliate application submitted successfully');
  }));

  app.get('/api/affiliate/analytics', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const affiliate = await storage.getAffiliateByUserId(userId);
    
    if (!affiliate) {
      throw notFoundError('Affiliate profile', userId);
    }

    const analytics = await storage.getAffiliateAnalytics(affiliate.id);
    successResponse(res, analytics, 'Analytics retrieved successfully');
  }));

  app.get('/api/affiliate/conversions', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const affiliate = await storage.getAffiliateByUserId(userId);
    
    if (!affiliate) {
      throw notFoundError('Affiliate profile', userId);
    }

    const conversions = await storage.getAffiliateConversions(affiliate.id);
    successResponse(res, conversions, 'Conversions retrieved successfully');
  }));

  app.get('/api/affiliate/marketing-assets', requireAuth, asyncHandler(async (req, res) => {
    const assets = await storage.getMarketingAssets();
    successResponse(res, assets, 'Marketing assets retrieved successfully');
  }));

  // Get affiliate payouts
  app.get('/api/affiliate/payouts', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const affiliate = await storage.getAffiliateByUserId(userId);
    
    if (!affiliate) {
      throw notFoundError('Affiliate profile', userId);
    }

    const payouts = await storage.getAffiliatePayouts(affiliate.id);
    successResponse(res, payouts, 'Payouts retrieved successfully');
  }));

  // Request payout
  app.post('/api/affiliate/payout-request', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const { amount, method } = req.body;

    if (!amount || !method) {
      throw validationError('Amount and payment method are required');
    }

    const affiliate = await storage.getAffiliateByUserId(userId);
    if (!affiliate) {
      throw notFoundError('Affiliate profile', userId);
    }

    const stats = await storage.getAffiliateStats(affiliate.id);
    if (amount > stats.pendingEarnings) {
      throw businessLogicError('Requested amount exceeds pending earnings');
    }

    const payout = await storage.createAffiliatePayout({
      affiliateId: affiliate.id,
      amount,
      method,
      status: 'draft' as const,
    });

    successResponse(res, payout, 'Payout request created successfully');
  }));

  // ===== BILLING API ENDPOINTS =====
  app.get('/api/billing/subscription', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    
    // First check user's plan type
    const user = await storage.getUserById(userId);
    
    if (!user) {
      throw notFoundError('User', userId);
    }

    // Fetch the actual plan from database for all plan types
    const { db } = await import('./db');
    const { subscriptionPlans } = await import('@shared/schema');
    const { eq } = await import('drizzle-orm');
    
    // Find the plan matching the user's plan type
    const [plan] = await db.select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.planType, user.planType))
      .limit(1);
    
    // If admin-assigned plan, return from database
    if (user.planType === 'paid' || user.planType === 'free') {
      const planName = plan?.name || user.planType.charAt(0).toUpperCase() + user.planType.slice(1);
      const planId = plan?.id;
      const pricePaid = plan?.price || 0; // in cents
      const amount = pricePaid / 100; // Convert to dollars for display
      
      const subscription = {
        id: `admin-plan-${userId}`,
        planId,
        planName,
        planType: user.planType,
        userCount: 1,
        pricePaid,
        amount,
        interval: 'monthly',
        features: plan?.features || { featureList: [] },
        startDate: user.createdAt || new Date().toISOString(),
        currentPeriodStart: user.createdAt || new Date().toISOString(),
        currentPeriodEnd: user.subscriptionEndsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: user.subscriptionEndsAt || null,
        isActive: true,
        status: 'active',
        cancelAtPeriodEnd: false
      };
      return res.json({ success: true, data: subscription });
    }
    
    // Otherwise fetch from Stripe subscriptions table (for Stripe-managed plans)
    const subscription = await storage.getUserSubscription(userId);
    res.json({ success: true, data: subscription });
  }));

  app.get('/api/billing/invoices', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const invoices = await storage.getUserInvoices(userId);
    res.json({ success: true, data: invoices });
  }));

  app.get('/api/billing/payment-methods', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const user = await storage.getUserById(userId);
    
    res.json({ success: true, data: [] }); // Will be populated with Stripe data
  }));

  app.post('/api/billing/payment-methods', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    
    res.json({ success: true, message: 'Payment method added successfully' });
  }));

  // ===== UPLOADS API ENDPOINTS =====
  app.get('/api/uploads', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const uploads = await storage.getUserPublicUploads(userId, limit, offset);
    res.json({ success: true, data: uploads });
  }));

  app.delete('/api/uploads/:id', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await storage.deletePublicUpload(id);
    res.json({ success: true, message: 'Upload deleted successfully' });
  }));

  // ===== AVAILABILITY API ENDPOINTS =====
  app.get('/api/availability/settings', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const availability = await storage.getUserAvailability(userId);
    res.json({ success: true, data: availability });
  }));

  app.put('/api/availability/settings', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const availabilityData = { ...req.body, userId };
    const availability = await storage.updateUserAvailability(userId, availabilityData);
    res.json({ success: true, data: availability, message: 'Availability settings saved successfully' });
  }));

  // ===== EMAIL SIGNATURE API ENDPOINTS =====
  app.get('/api/email-signatures', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const signatures = await storage.getUserEmailSignatures(userId);
    res.json({ success: true, data: signatures });
  }));

  app.post('/api/email-signatures', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const signatureData = { ...req.body, userId };
    const signature = await storage.createEmailSignature(signatureData);
    res.json({ success: true, data: signature, message: 'Email signature saved successfully' });
  }));

  app.delete('/api/email-signatures/:id', requireAuth, asyncHandler(async (req, res) => {
    const { id } = req.params;
    await storage.deleteEmailSignature(id);
    res.json({ success: true, message: 'Email signature deleted successfully' });
  }));

  // ===== USAGE STATS API ENDPOINTS =====
  app.get('/api/usage/stats', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const stats = await storage.getUserUsageStats(userId);
    res.json({ success: true, data: stats });
  }));

  // ===== ACCOUNT SETTINGS API ENDPOINTS =====
  app.get('/api/account/settings', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const settings = await storage.getUserSettings(userId);
    res.json({ success: true, data: settings });
  }));

  app.patch('/api/account/settings', requireAuth, asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const settings = await storage.updateUserSettings(userId, req.body);
    res.json({ success: true, data: settings, message: 'Settings updated successfully' });
  }));

  // ===== HELP/KB API ENDPOINTS =====
  app.get('/api/help/articles', asyncHandler(async (req, res) => {
    const { search, category } = req.query;
    const articles = await storage.getHelpArticles({ search: search as string, category: category as string });
    res.json({ success: true, data: articles });
  }));

  app.get('/api/help/articles/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const article = await storage.getHelpArticle(id);
    
    if (!article) {
      return res.status(404).json({ success: false, message: 'Article not found' });
    }

    res.json({ success: true, data: article });
  }));

  // ===== ADMIN IMPERSONATION ENDPOINTS =====
  app.post('/api/admin/impersonate/:userId', 
    requireAuth,
    asyncHandler(async (req, res) => {
      const { userId } = req.params;
      const adminUser = req.user as any;

      // Only allow admin or owner roles to impersonate
      if (adminUser.role !== 'admin' && adminUser.role !== 'owner') {
        return res.status(403).json({ success: false, message: 'Access denied. Only admins and owners can impersonate users.' });
      }

      // Don't allow impersonating another admin
      const targetUser = await storage.getUserById(userId);
      if (!targetUser) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (targetUser.role === 'admin' || targetUser.role === 'owner') {
        return res.status(403).json({ success: false, message: 'Cannot impersonate admin or owner users' });
      }

      // Store impersonation data in session
      req.session.impersonation = {
        originalUserId: adminUser.id,
        originalUserEmail: adminUser.email,
        impersonatedUserId: targetUser.id,
        impersonatedUserEmail: targetUser.email,
        startedAt: new Date()
      };

      await new Promise((resolve) => req.session.save(resolve));

      res.json({ 
        success: true, 
        message: `Now impersonating ${targetUser.email}`,
        data: {
          impersonatedUser: {
            id: targetUser.id,
            email: targetUser.email,
            firstName: targetUser.firstName,
            lastName: targetUser.lastName
          }
        }
      });
    })
  );

  app.post('/api/admin/stop-impersonation',
    requireAuth,
    asyncHandler(async (req, res) => {
      if (!req.session.impersonation) {
        return res.status(400).json({ success: false, message: 'Not currently impersonating' });
      }

      const originalUserId = req.session.impersonation.originalUserId;
      delete req.session.impersonation;
      await new Promise((resolve) => req.session.save(resolve));

      res.json({ 
        success: true, 
        message: 'Stopped impersonation',
        data: { originalUserId }
      });
    })
  );

  app.get('/api/admin/impersonation-status',
    requireAuth,
    asyncHandler(async (req, res) => {
      if (!req.session.impersonation) {
        return res.json({ success: true, data: { isImpersonating: false } });
      }

      const impersonation = req.session.impersonation;
      res.json({ 
        success: true, 
        data: {
          isImpersonating: true,
          originalUserEmail: impersonation.originalUserEmail,
          impersonatedUserEmail: impersonation.impersonatedUserEmail,
          startedAt: impersonation.startedAt
        }
      });
    })
  );
  
  // System Administration APIs
  app.get('/api/admin/system/status', 
    enhancedAuth, 
    requireRole('admin'), 
    asyncHandler(async (req, res) => {
      const systemStatus = {
        database: 'healthy',
        scheduler: notificationScheduler.isActive() ? 'healthy' : 'degraded',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString(),
      };
      
      successResponse(res, systemStatus, 'System status retrieved successfully');
    })
  );
  
  app.get('/api/admin/users/stats', 
    enhancedAuth, 
    requireRole('admin'), 
    asyncHandler(async (req, res) => {
      const userStats = await storage.getUserStatistics();
      successResponse(res, userStats, 'User statistics retrieved successfully');
    })
  );

  // User management endpoints
  
  // Get available plans for admin assignment
  app.get('/api/admin/plans',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const plans = await storage.getAllPlans();
      res.json(plans);
    })
  );

  app.get('/api/admin/users',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { search, status, plan } = req.query;
      
      // Fetch all users from database
      const allUsers = await storage.getAllUsers();
      
      // Transform to match frontend format
      let users = allUsers.map((user, index) => {
        const firstName = user.firstName || '';
        const lastName = user.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim() || user.email;
        const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email.charAt(0).toUpperCase();
        
        // Determine status based on subscription end date
        const isActive = !user.subscriptionEndsAt || new Date(user.subscriptionEndsAt) > new Date();
        
        return {
          id: user.id,
          sn: index + 1,
          name: fullName,
          initials: initials,
          email: user.email || '',
          registrationDate: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          }) : 'N/A',
          planValidity: user.subscriptionEndsAt 
            ? new Date(user.subscriptionEndsAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : 'Unlimited',
          status: isActive ? 'active' : 'inactive',
          planType: user.planType || 'free',
          role: user.role || 'user'
        };
      });
      
      // Apply filters
      if (search) {
        const searchLower = String(search).toLowerCase();
        users = users.filter(user => 
          user.name.toLowerCase().includes(searchLower) || 
          user.email.toLowerCase().includes(searchLower)
        );
      }
      
      if (status && status !== 'all') {
        users = users.filter(user => user.status === status);
      }
      
      if (plan && plan !== 'all') {
        users = users.filter(user => user.planType === plan);
      }
      
      res.json(users);
    })
  );

  app.post('/api/admin/users',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { firstName, lastName, email, password, planId } = validateRequest(z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        planId: z.string().optional(),
      }));
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        throw businessLogicError('User with this email already exists', 'USER_EXISTS');
      }
      
      // Create user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: 'user',
        planType: 'free',
        subscriptionStatus: 'active',
      });
      
      successResponse(res, { id: newUser.id, email: newUser.email }, 'User created successfully', 201);
    })
  );

  app.patch('/api/admin/users/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const userId = req.params.id;
      const updates = validateRequest(z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        email: z.string().email().optional(),
        subscriptionEndsAt: z.string().nullable().optional(),
      }));
      
      // Update user
      await storage.updateUser(userId, updates);
      
      successResponse(res, { id: userId }, 'User updated successfully');
    })
  );

  app.delete('/api/admin/users/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const userId = req.params.id;
      
      // Prevent admin from deleting themselves
      if ((req.user as any).id === userId) {
        throw businessLogicError('Cannot delete your own account', 'CANNOT_DELETE_SELF');
      }
      
      // Delete user
      await storage.deleteUser(userId);
      
      successResponse(res, { id: userId }, 'User deleted successfully');
    })
  );

  app.post('/api/admin/users/:id/assign-plan',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const userId = req.params.id;
      const { planId, endsAt, note } = validateRequest(z.object({
        planId: z.number().int(),
        endsAt: z.string().nullable().optional(),
        note: z.string().nullable().optional(),
      }));
      
      // Get plan details
      const plans = await storage.getPlans();
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) {
        throw notFoundError('Plan not found');
      }
      
      // Update user with plan
      await storage.updateUser(userId, {
        planType: plan.planType,
        subscriptionStatus: 'active',
        subscriptionEndsAt: endsAt ? new Date(endsAt) : null,
        businessCardsLimit: plan.businessCardsLimit,
      });
      
      successResponse(res, { userId, planId }, 'Plan assigned successfully');
    })
  );
  
  // ===== ADMIN COUPONS API ENDPOINTS =====
  app.get('/api/admin/coupons',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { search, status, type } = req.query;
      
      let coupons = await storage.getCoupons();
      
      // Apply filters
      if (search) {
        const searchLower = String(search).toLowerCase();
        coupons = coupons.filter(coupon => 
          coupon.code.toLowerCase().includes(searchLower) || 
          coupon.name?.toLowerCase().includes(searchLower) ||
          coupon.description?.toLowerCase().includes(searchLower)
        );
      }
      
      if (status && status !== 'all') {
        coupons = coupons.filter(coupon => coupon.status === status);
      }
      
      if (type && type !== 'all') {
        coupons = coupons.filter(coupon => coupon.discountType === type);
      }
      
      res.json({ success: true, data: coupons });
    })
  );

  app.post('/api/admin/coupons',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const couponData = req.body;
      const newCoupon = await storage.createCoupon(couponData);
      res.json({ success: true, data: newCoupon });
    })
  );

  app.put('/api/admin/coupons/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const couponData = req.body;
      const updatedCoupon = await storage.updateCoupon(id, couponData);
      res.json({ success: true, data: updatedCoupon });
    })
  );

  app.delete('/api/admin/coupons/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.deleteCoupon(id);
      res.json({ success: true, message: 'Coupon deleted successfully' });
    })
  );

  // ===== ADMIN AFFILIATES API ENDPOINTS =====
  app.get('/api/admin/affiliates',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { search, status } = req.query;
      
      let affiliates = await storage.getAffiliates(status ? { status: String(status) } : undefined);
      
      // Apply search filter
      if (search) {
        const searchLower = String(search).toLowerCase();
        affiliates = affiliates.filter(affiliate => 
          affiliate.name?.toLowerCase().includes(searchLower) || 
          affiliate.email?.toLowerCase().includes(searchLower) ||
          affiliate.code?.toLowerCase().includes(searchLower)
        );
      }
      
      res.json({ success: true, data: affiliates });
    })
  );

  app.post('/api/admin/affiliates',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const affiliateData = req.body;
      const newAffiliate = await storage.createAffiliate(affiliateData);
      res.json({ success: true, data: newAffiliate });
    })
  );

  app.patch('/api/admin/affiliates/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const affiliateData = req.body;
      const updatedAffiliate = await storage.updateAffiliate(id, affiliateData);
      res.json({ success: true, data: updatedAffiliate });
    })
  );

  app.delete('/api/admin/affiliates/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.deleteAffiliate(id);
      res.json({ success: true, message: 'Affiliate deleted successfully' });
    })
  );

  // ===== ADMIN CONVERSIONS API ENDPOINTS =====
  app.get('/api/admin/conversions',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { affiliateId, search, dateFrom, dateTo, status } = req.query;
      
      let conversions = await storage.getConversions({
        affiliateId: affiliateId ? String(affiliateId) : undefined,
        dateFrom: dateFrom ? new Date(String(dateFrom)) : undefined,
        dateTo: dateTo ? new Date(String(dateTo)) : undefined
      });
      
      // Apply additional filters
      if (search) {
        const searchLower = String(search).toLowerCase();
        conversions = conversions.filter(conversion => 
          conversion.referrerUrl?.toLowerCase().includes(searchLower) || 
          conversion.ipAddress?.toLowerCase().includes(searchLower)
        );
      }
      
      if (status && status !== 'all') {
        conversions = conversions.filter(conversion => conversion.status === status);
      }
      
      res.json({ success: true, data: conversions });
    })
  );

  app.post('/api/admin/conversions',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const conversionData = req.body;
      const newConversion = await storage.createConversion(conversionData);
      res.json({ success: true, data: newConversion });
    })
  );

  app.patch('/api/admin/conversions/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const conversionData = req.body;
      const updatedConversion = await storage.updateConversion(id, conversionData);
      res.json({ success: true, data: updatedConversion });
    })
  );

  // ===== ADMIN TEMPLATES API ENDPOINTS =====
  app.get('/api/admin/templates',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { search, category, isActive } = req.query;
      
      let templates = await storage.getGlobalTemplates(
        isActive !== undefined ? { isActive: isActive === 'true' } : undefined
      );
      
      // Apply filters
      if (search) {
        const searchLower = String(search).toLowerCase();
        templates = templates.filter(template => 
          template.name?.toLowerCase().includes(searchLower) || 
          template.description?.toLowerCase().includes(searchLower)
        );
      }
      
      if (category && category !== 'all') {
        templates = templates.filter(template => template.category === category);
      }
      
      res.json({ success: true, data: templates });
    })
  );

  app.post('/api/admin/templates',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const templateData = req.body;
      const newTemplate = await storage.createGlobalTemplate(templateData);
      res.json({ success: true, data: newTemplate });
    })
  );

  app.put('/api/admin/templates/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const templateData = req.body;
      const updatedTemplate = await storage.updateGlobalTemplate(id, templateData);
      res.json({ success: true, data: updatedTemplate });
    })
  );

  app.delete('/api/admin/templates/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.deleteGlobalTemplate(id);
      res.json({ success: true, message: 'Template deleted successfully' });
    })
  );

  // ===== ADMIN HEADER TEMPLATES API ENDPOINTS =====
  app.get('/api/admin/header-templates',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { search, category, isActive } = req.query;
      
      let headerTemplates = await storage.getHeaderTemplates(
        isActive !== undefined ? { isActive: isActive === 'true' } : undefined
      );
      
      // Apply filters
      if (search) {
        const searchLower = String(search).toLowerCase();
        headerTemplates = headerTemplates.filter(template => 
          template.name?.toLowerCase().includes(searchLower) || 
          template.description?.toLowerCase().includes(searchLower)
        );
      }
      
      if (category && category !== 'all') {
        headerTemplates = headerTemplates.filter(template => template.category === category);
      }
      
      res.json({ success: true, data: headerTemplates });
    })
  );

  app.post('/api/admin/header-templates',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const templateData = req.body;
      const newTemplate = await storage.createHeaderTemplate(templateData);
      res.json({ success: true, data: newTemplate });
    })
  );

  app.put('/api/admin/header-templates/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const templateData = req.body;
      const updatedTemplate = await storage.updateHeaderTemplate(id, templateData);
      res.json({ success: true, data: updatedTemplate });
    })
  );

  app.delete('/api/admin/header-templates/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.deleteHeaderTemplate(id);
      res.json({ success: true, message: 'Header template deleted successfully' });
    })
  );

  // ===== ADMIN ICONS API ENDPOINTS =====
  app.get('/api/admin/icons',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const icons = await storage.getIcons();
      res.json(icons);
    })
  );

  app.post('/api/admin/icons',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const iconData = req.body;
      const newIcon = await storage.createIcon(iconData);
      res.json({ success: true, data: newIcon });
    })
  );

  app.put('/api/admin/icons/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const iconData = req.body;
      const updatedIcon = await storage.updateIcon(parseInt(id), iconData);
      res.json({ success: true, data: updatedIcon });
    })
  );

  app.delete('/api/admin/icons/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.deleteIcon(parseInt(id));
      res.json({ success: true, message: 'Icon deleted successfully' });
    })
  );

  // ===== ADMIN PAGE ELEMENT TYPES API ENDPOINTS =====
  app.get('/api/admin/element-types',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const elementTypes = await storage.getPageElementTypes();
      res.json(elementTypes);
    })
  );

  app.post('/api/admin/element-types',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const elementTypeData = req.body;
      const newElementType = await storage.createPageElementType(elementTypeData);
      res.json({ success: true, data: newElementType });
    })
  );

  app.put('/api/admin/element-types/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      const elementTypeData = req.body;
      const updatedElementType = await storage.updatePageElementType(parseInt(id), elementTypeData);
      res.json({ success: true, data: updatedElementType });
    })
  );

  app.delete('/api/admin/element-types/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      await storage.deletePageElementType(parseInt(id));
      res.json({ success: true, message: 'Element type deleted successfully' });
    })
  );

  // ===== ADMIN DASHBOARD API ENDPOINTS =====
  app.get('/api/admin/metrics/summary',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const metrics = await storage.getDashboardMetrics();
      res.json(metrics);
    })
  );

  app.get('/api/admin/links',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const links = await storage.getAdminLinks();
      res.json(links);
    })
  );

  // ===== ADMIN PROFILE API ENDPOINTS =====
  app.patch('/api/admin/profile',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const { firstName, lastName, email } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
        email,
      });
      
      res.json({ success: true, data: updatedUser });
    })
  );

  app.patch('/api/admin/profile/preferences',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const { timezone, preferredLanguage } = req.body;
      
      const updatedUser = await storage.updateUser(userId, {
        timezone,
        preferredLanguage,
      });
      
      res.json({ success: true, data: updatedUser });
    })
  );

  app.post('/api/admin/change-password',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const { currentPassword, newPassword } = req.body;
      
      // Get user with password to verify current password
      const user = await storage.getUser(userId);
      
      if (!user || !user.password) {
        throw businessLogicError('User not found', 'USER_NOT_FOUND');
      }
      
      // Verify current password
      const bcrypt = require('bcryptjs');
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      
      if (!isValidPassword) {
        throw businessLogicError('Current password is incorrect', 'INVALID_PASSWORD');
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await storage.updateUser(userId, {
        password: hashedPassword,
      });
      
      res.json({ success: true, message: 'Password updated successfully' });
    })
  );

  app.post('/api/admin/profile/2fa',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const { enabled } = req.body;
      
      await storage.updateUser(userId, {
        twoFactorEnabled: enabled,
      });
      
      res.json({ success: true, message: `Two-factor authentication ${enabled ? 'enabled' : 'disabled'}` });
    })
  );

  app.get('/api/admin/profile/sessions',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      // For now, return mock session data
      // In production, you'd query actual session storage
      const sessions = [
        {
          id: '1',
          userAgent: req.headers['user-agent'] || 'Unknown',
          ipAddress: req.ip || 'Unknown',
          location: 'Unknown',
          isCurrentSession: true,
          lastActive: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
      ];
      
      res.json(sessions);
    })
  );

  app.delete('/api/admin/profile/sessions/:id',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      const { id } = req.params;
      
      // In production, revoke the session from session storage
      // For now, just return success
      res.json({ success: true, message: 'Session revoked successfully' });
    })
  );

  app.post('/api/admin/upload-avatar',
    enhancedAuth,
    requireRole('admin'),
    asyncHandler(async (req, res) => {
      // This would handle avatar upload
      // For now, return success
      res.json({ success: true, message: 'Avatar uploaded successfully' });
    })
  );

  // Enhanced Public Booking API
  app.post('/api/public/book/:eventTypeSlug',
    validateRequest(z.object({
      attendeeName: z.string().min(1).max(100),
      attendeeEmail: commonSchemas.email,
      attendeePhone: commonSchemas.phone,
      startTime: z.string().datetime(),
      timezone: z.string(),
      customFields: z.record(z.string(), z.any()).optional(),
      notes: z.string().max(1000).optional(),
    })),
    asyncHandler(async (req, res) => {
      const eventTypeSlug = req.params.eventTypeSlug;
      const eventType = await storage.getEventTypeBySlug(eventTypeSlug);
      
      if (!eventType || !eventType.isPublic || !eventType.isActive) {
        throw notFoundError('Event type not found or not available');
      }
      
      // Check availability
      const availability = await storage.checkAvailability({
        eventTypeId: eventType.id,
        startTime: req.body.startTime,
        timezone: req.body.timezone,
      });
      
      if (!availability.available) {
        throw businessLogicError('Time slot not available', 'TIME_SLOT_UNAVAILABLE');
      }
      
      // Create appointment
      const appointment = await storage.createAppointment({
        ...req.body,
        eventTypeId: eventType.id,
        hostUserId: eventType.userId,
        status: eventType.requiresConfirmation ? 'pending' : 'scheduled',
      });
      
      // Emit automation events
      await emitAutomationEvent({
        type: 'appointment.booked',
        data: { appointment, eventType }
      });
      
      successResponse(res, appointment, 'Appointment booked successfully', 201);
    })
  );
  
  // API Documentation endpoint
  app.get('/api/docs', (req, res) => {
    res.json({
      version: '1.0.0',
      title: 'Appointment Booking System API',
      description: 'Comprehensive appointment booking and scheduling platform',
      endpoints: {
        authentication: '/api/auth/*',
        appointments: '/api/appointments/*',
        availability: '/api/availability/*',
        users: '/api/user/*',
        teams: '/api/teams/*',
        payments: '/api/payments/*',
        notifications: '/api/notifications/*',
        analytics: '/api/analytics/*',
        calendar: '/api/calendar/*',
        video: '/api/video/*',
        crm: '/api/crm/*',
        automation: '/api/automation/*',
        admin: '/api/admin/*',
        health: '/api/health',
        public: '/api/public/*',
      },
      security: {
        rateLimiting: true,
        authentication: 'Session-based with Google OAuth',
        authorization: 'Role-based access control',
        validation: 'Zod schema validation',
        cors: 'Configured for allowed origins',
      },
      features: {
        appointments: true,
        payments: !!process.env.STRIPE_SECRET_KEY,
        calendar: !!process.env.GOOGLE_CLIENT_ID,
        video: !!process.env.ZOOM_CLIENT_ID,
        analytics: true,
        notifications: true,
        automation: true,
        crm: true,
        teams: true,
      },
      documentation: 'https://docs.appointment-system.com',
      support: 'support@appointment-system.com',
    });
  });
  
  // API version and feature endpoint
  app.get('/api/version', (req, res) => {
    res.json({
      version: '1.0.0',
      buildDate: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      apiVersion: 'v1',
      features: {
        authentication: true,
        payments: !!process.env.STRIPE_SECRET_KEY,
        calendar: !!process.env.GOOGLE_CLIENT_ID,
        video: !!process.env.ZOOM_CLIENT_ID,
        analytics: true,
        notifications: true,
        automation: true,
        crm: true,
        teams: true,
        rateLimiting: true,
        monitoring: true,
      },
      security: {
        cors: true,
        helmet: true,
        rateLimiting: true,
        inputValidation: true,
        authentication: true,
        authorization: true,
      }
    });
  });

  // Public file serving route - serves uploaded files at /:slug
  // This must be BEFORE any catch-all routes but AFTER API routes
  app.get('/:slug', asyncHandler(async (req, res, next) => {
    const slug = req.params.slug;
    
    // Reserved slugs that should skip file serving and pass to SPA
    const RESERVED_SLUGS = [
      "", "api", "auth", "admin", "builder", "dashboard", "login", "register",
      "logout", "static", "assets", "public", "favicon.ico", "robots.txt", "sitemap.xml",
      "_next", "card", "cards", "user", "users", "settings", "docs", "pricing",
      "health", "status", "webhook", "hooks", "oauth", "pay", "stripe", "paypal",
      "uploads", "templates", "appointments", "crm", "availability", "affiliate",
      "profile", "account-settings", "billing", "usage", "automation", "event-types",
      "email-templates", "analytics", "card-analytics", "teams", "help", "booking",
      "qr-codes", "email-signature", "my-links"
    ];
    
    // Skip reserved slugs - let them fall through to other handlers
    if (RESERVED_SLUGS.includes(slug)) {
      return next(); // Pass control to next middleware (Vite/SPA)
    }
    
    // Skip Vite-specific paths in development (these start with @ or are special paths)
    if (process.env.NODE_ENV === 'development' && 
        (slug.startsWith('@') || slug === 'src' || slug === 'node_modules' || slug.startsWith('__vite'))) {
      return next(); // Pass to next middleware (Vite)
    }
    
    // Check if this slug exists in public uploads
    const upload = await storage.getPublicUploadBySlug(slug);
    
    if (!upload) {
      // If no upload found, pass to next middleware (SPA/business card routes)
      // This allows business card routes like /ytube to be handled by Vite/SPA router
      return next();
    }
    
    // Increment view count
    await storage.incrementUploadViews(upload.id);
    
    // Set appropriate headers based on file type
    const mimeType = upload.mimeType;
    const fileExtension = upload.fileExtension;
    
    res.set({
      'Content-Type': mimeType,
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=300', // 5 minutes cache
      'Content-Disposition': `inline; filename="${upload.originalFileName}"`,
    });
    
    // Serve the actual file from disk
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.default.join(process.cwd(), 'uploads', upload.storagePath);
    
    // Check if file exists on disk
    if (!fs.default.existsSync(filePath)) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>File Not Found</title>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; }
              .error-container { max-width: 400px; margin: 0 auto; }
              h1 { color: #e74c3c; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h1>404 - File Not Found</h1>
              <p>The file has been removed from storage or is temporarily unavailable.</p>
            </div>
          </body>
        </html>
      `);
    }

    // Read and serve the actual file
    try {
      const fileBuffer = fs.default.readFileSync(filePath);
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error reading file:', error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Error Loading File</title>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; }
              .error-container { max-width: 400px; margin: 0 auto; }
              h1 { color: #e74c3c; margin-bottom: 20px; }
              p { color: #666; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="error-container">
              <h1>500 - Error Loading File</h1>
              <p>There was an error loading the requested file. Please try again later.</p>
            </div>
          </body>
        </html>
      `);
    }
  }));
  
  // ===== QR CODE API ROUTES =====
  
  // URL allowlist for production security
  const ALLOWED_URL_PATTERNS = [
    // HTTP/HTTPS with domains only - IP validation handled separately
    /^https?:\/\/([\w-]+\.)+[a-zA-Z0-9-]{2,}(:\d+)?([\/?#].*)?$/,  // Domains with TLD, supports query/fragment
    /^tel:[+]?[\d\s\-\(\)]+$/,  // Telephone links
    /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,  // Email links
    /^sms:[+]?[\d\s\-\(\)]+$/,  // SMS links
    /^geo:[\d\.-]+,[\d\.-]+/,  // Geo coordinates
    /^whatsapp:\/\/send\?/,  // WhatsApp links
    /^linkedin:\/\/in\//,  // LinkedIn profiles
    /^twitter:\/\/user\?/,  // Twitter profiles
  ];
  
  // Comprehensive private network CIDR blocks
  const PRIVATE_IPV4_RANGES = [
    { start: [127, 0, 0, 0], end: [127, 255, 255, 255] },      // 127.0.0.0/8 loopback
    { start: [10, 0, 0, 0], end: [10, 255, 255, 255] },       // 10.0.0.0/8 private
    { start: [192, 168, 0, 0], end: [192, 168, 255, 255] },   // 192.168.0.0/16 private
    { start: [172, 16, 0, 0], end: [172, 31, 255, 255] },     // 172.16.0.0/12 private
    { start: [169, 254, 0, 0], end: [169, 254, 255, 255] },   // 169.254.0.0/16 link-local
    { start: [100, 64, 0, 0], end: [100, 127, 255, 255] },    // 100.64.0.0/10 CGNAT
    { start: [198, 18, 0, 0], end: [198, 19, 255, 255] },     // 198.18.0.0/15 benchmarking
  ];
  
  function isPrivateIPv4(ip: string): boolean {
    // Only allow dotted decimal format
    if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ip)) {
      return false; // Reject numeric/octal/hex formats
    }
    
    const parts = ip.split('.').map(Number);
    if (parts.some(p => p < 0 || p > 255)) return false;
    
    return PRIVATE_IPV4_RANGES.some(range => {
      return parts.every((part, i) => part >= range.start[i] && part <= range.end[i]);
    });
  }
  
  function isPrivateIPv6(ip: string): boolean {
    const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '');
    
    return (
      normalized === '::1' ||                                    // ::1/128 loopback
      /^fc[0-9a-f]/i.test(normalized) ||                        // fc00::/7 ULA
      /^fd[0-9a-f]/i.test(normalized) ||                        // fd00::/8 ULA subset
      /^fe[89ab][0-9a-f]/i.test(normalized) ||                  // fe80::/10 link-local
      normalized.startsWith('::ffff:127.') ||                   // IPv4-mapped loopback
      normalized.startsWith('::ffff:10.') ||                    // IPv4-mapped private
      normalized.startsWith('::ffff:192.168.') ||               // IPv4-mapped private
      /^::ffff:172\.(1[6-9]|2[0-9]|3[0-1])\./.test(normalized) // IPv4-mapped private
    );
  }
  
  // Blocked domains and suffixes (known malicious or suspicious)
  const BLOCKED_DOMAINS = [
    'bit.ly', 'tinyurl.com', 'short.link', 'suspicious.com',
    '0.0.0.0', '127.0.0.1', 'localhost'
  ];
  
  const BLOCKED_SUFFIXES = [
    '.localhost', '.local', '.internal', '.home', '.corp', '.test', '.invalid', '.example'
  ];
  
  // Rate limiting for QR generation
  const qrRateLimit = new Map<string, { count: number; resetTime: number }>();
  const QR_RATE_LIMIT = { requests: 100, windowMs: 60 * 60 * 1000 }; // 100 requests per hour
  
  function validateUrl(url: string): { valid: boolean; reason?: string } {
    try {
      // First check if URL matches allowed patterns
      const isAllowed = ALLOWED_URL_PATTERNS.some(pattern => pattern.test(url));
      if (!isAllowed) {
        return { valid: false, reason: 'URL format not supported' };
      }
      
      // For non-HTTP schemes, just allow the pattern match
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return { valid: true };
      }
      
      // For HTTP/HTTPS, do additional security validation
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.toLowerCase();
      
      // Always block localhost
      if (hostname === 'localhost') {
        return { valid: false, reason: 'Local URLs not allowed' };
      }
      
      // Check for blocked domains (exact or subdomain match)
      if (BLOCKED_DOMAINS.some(domain => 
        hostname === domain || hostname.endsWith('.' + domain)
      )) {
        return { valid: false, reason: 'Domain not allowed' };
      }
      
      // Check for blocked suffixes
      if (BLOCKED_SUFFIXES.some(suffix => hostname.endsWith(suffix))) {
        return { valid: false, reason: 'Domain suffix not allowed' };
      }
      
      // Block all IP literals (IPv4 and IPv6) to prevent bypasses
      const isIPv4 = /^\d+\.\d+\.\d+\.\d+$/.test(hostname);
      const isIPv6 = hostname.startsWith('[') && hostname.endsWith(']') || 
                     /^[0-9a-f:]+$/i.test(hostname);
      
      if (isIPv4) {
        // Block all IP literals - both private and public for security
        return { valid: false, reason: 'IP addresses not allowed - use domain names only' };
      }
      
      if (isIPv6) {
        // Block all IPv6 literals  
        return { valid: false, reason: 'IP addresses not allowed - use domain names only' };
      }
      
      // Block numeric hostname formats that could be IP addresses
      if (/^\d+$/.test(hostname)) {
        return { valid: false, reason: 'Numeric hostnames not allowed' };
      }
      
      // Require at least one dot and valid TLD for domains
      const domainParts = hostname.split('.');
      if (domainParts.length < 2) {
        return { valid: false, reason: 'Invalid domain format - TLD required' };
      }
      
      // Block obvious non-public TLDs
      const tld = domainParts[domainParts.length - 1].toLowerCase();
      const privateTlds = ['local', 'lan', 'internal', 'corp', 'home'];
      if (privateTlds.includes(tld)) {
        return { valid: false, reason: 'Private TLD not allowed' };
      }
      
      return { valid: true };
    } catch (error) {
      return { valid: false, reason: 'Invalid URL format' };
    }
  }
  
  function checkRateLimit(userId: string, ipAddress?: string): { allowed: boolean; resetTime?: number } {
    const now = Date.now();
    
    // Use userId for authenticated users, IP address for public endpoints
    const rateLimitKey = userId || ipAddress || 'anonymous';
    const userLimit = qrRateLimit.get(rateLimitKey);
    
    // Clean expired entries periodically to prevent memory leaks
    const shouldCleanup = Math.random() < 0.1; // 10% chance per request
    if (shouldCleanup || qrRateLimit.size > 1000) {
      for (const [key, entry] of qrRateLimit.entries()) {
        if (now > entry.resetTime) {
          qrRateLimit.delete(key);
        }
      }
    }
    
    if (!userLimit || now > userLimit.resetTime) {
      qrRateLimit.set(rateLimitKey, { count: 1, resetTime: now + QR_RATE_LIMIT.windowMs });
      return { allowed: true };
    }
    
    if (userLimit.count >= QR_RATE_LIMIT.requests) {
      return { allowed: false, resetTime: userLimit.resetTime };
    }
    
    userLimit.count++;
    return { allowed: true };
  }
  
  // Get user's QR links
  app.get('/api/qr/links', requireAuth, asyncHandler(async (req, res) => {
    const user = req.user as User;
    const { limit = '20', offset = '0' } = req.query;
    
    const [links, total] = await Promise.all([
      storage.getUserQrLinks(user.id, parseInt(limit as string), parseInt(offset as string)),
      storage.countUserQrLinks(user.id)
    ]);
    
    successResponse(res, { links, total, total: total }, 'QR links retrieved successfully');
  }));
  
  // Create new QR link with URL validation
  app.post('/api/qr/links', requireAuth, asyncHandler(async (req, res) => {
    const user = req.user as User;
    
    // Rate limiting check
    const rateLimitCheck = checkRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      const resetDate = new Date(rateLimitCheck.resetTime!);
      throw businessLogicError(`Rate limit exceeded. Try again later. Reset at ${resetDate.toISOString()}`);
    }
    
    // Validate and sanitize target URL
    const { targetUrl, name, rules, utm, shortId, darkColor, lightColor, logoUrl, logoShape, logoSize } = req.body;
    
    if (!targetUrl) {
      throw validationError('Target URL is required');
    }
    
    const urlValidation = validateUrl(targetUrl);
    if (!urlValidation.valid) {
      throw validationError(`Invalid URL: ${urlValidation.reason}`);
    }
    
    // Sanitize name to prevent XSS
    const sanitizedName = name ? name.replace(/<[^>]*>/g, '').substring(0, 200) : undefined;
    
    // Use custom shortId or generate one (preprocess empty string to undefined)
    const processedShortId = shortId === '' ? undefined : shortId;
    let finalShortId = processedShortId || nanoid(8);
    
    // Check if custom shortId is already taken
    if (processedShortId) {
      const existing = await storage.getQrLinkByShortId(processedShortId);
      if (existing) {
        throw businessLogicError('This custom URL is already taken. Please choose another.');
      }
    }
    
    // Preprocess logoUrl: empty string to null
    const processedLogoUrl = logoUrl === '' ? null : logoUrl;
    
    const linkData = insertQrLinkSchema.parse({
      name: sanitizedName,
      targetUrl,
      rules: rules || {},
      utm: utm || {},
      userId: user.id,
      shortId: finalShortId,
      darkColor: darkColor || '#000000',
      lightColor: lightColor || '#FFFFFF',
      logoUrl: processedLogoUrl,
      logoShape: logoShape || 'circle',
      logoSize: logoSize || 20
    });
    
    const qrLink = await storage.createQrLink(linkData);
    successResponse(res, qrLink, 'QR link created successfully');
  }));
  
  // Get single QR link with analytics
  app.get('/api/qr/links/:id', requireAuth, asyncHandler(async (req, res) => {
    const user = req.user as User;
    const qrLink = await storage.getQrLink(req.params.id);
    
    if (!qrLink || qrLink.userId !== user.id) {
      throw notFoundError('QR link', req.params.id);
    }
    
    // Get analytics for the past 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    const analytics = await storage.getQrAnalytics(qrLink.id, startDate, endDate);
    
    successResponse(res, { ...qrLink, analytics }, 'QR link retrieved successfully');
  }));
  
  // Update QR link with validation
  app.put('/api/qr/links/:id', requireAuth, asyncHandler(async (req, res) => {
    const user = req.user as User;
    const qrLink = await storage.getQrLink(req.params.id);
    
    if (!qrLink || qrLink.userId !== user.id) {
      throw notFoundError('QR link', req.params.id);
    }
    
    const { targetUrl, name, ...otherData } = req.body;
    
    // Validate target URL if it's being updated
    if (targetUrl) {
      const urlValidation = validateUrl(targetUrl);
      if (!urlValidation.valid) {
        throw validationError(`Invalid URL: ${urlValidation.reason}`);
      }
    }
    
    // Sanitize name to prevent XSS
    const sanitizedName = name ? name.replace(/<[^>]*>/g, '').substring(0, 200) : undefined;
    
    // Preprocess optional fields: convert empty strings to undefined
    const preprocessedData = {
      ...otherData,
      targetUrl,
      name: sanitizedName,
      shortId: otherData.shortId === '' ? undefined : otherData.shortId,
      logoUrl: otherData.logoUrl === '' ? undefined : otherData.logoUrl,
    };
    
    const updateData = insertQrLinkSchema.partial().parse(preprocessedData);
    
    const updatedLink = await storage.updateQrLink(req.params.id, updateData);
    
    successResponse(res, updatedLink, 'QR link updated successfully');
  }));
  
  // Delete QR link
  app.delete('/api/qr/links/:id', requireAuth, asyncHandler(async (req, res) => {
    const user = req.user as User;
    const qrLink = await storage.getQrLink(req.params.id);
    
    if (!qrLink || qrLink.userId !== user.id) {
      throw notFoundError('QR link', req.params.id);
    }
    
    await storage.deleteQrLink(req.params.id);
    successResponse(res, null, 'QR link deleted successfully');
  }));
  
  // QR code cache for performance optimization
  const qrCache = new Map<string, { data: string | Buffer, contentType: string, timestamp: number }>();
  const QR_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  // Generate static QR code (PNG or SVG) with caching and rate limiting
  app.post('/api/qr/generate', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      
      // Rate limiting check
      const rateLimitCheck = checkRateLimit(user.id);
      if (!rateLimitCheck.allowed) {
        const resetDate = new Date(rateLimitCheck.resetTime!);
        return res.status(429).json({
          message: 'Rate limit exceeded. Try again later.',
          resetTime: resetDate.toISOString(),
          maxRequests: QR_RATE_LIMIT.requests
        });
      }
      
      const params = staticQrSchema.parse(req.body);
      
      // Validate URL if it's provided
      if (params.data && (params.data.startsWith('http') || params.data.includes('.'))) {
        const urlValidation = validateUrl(params.data);
        if (!urlValidation.valid) {
          return res.status(400).json({
            message: `Invalid URL: ${urlValidation.reason}`,
            code: 'INVALID_URL'
          });
        }
      }
      
      // Sanitize data to prevent injection
      const sanitizedData = params.data.replace(/<[^>]*>/g, '').substring(0, 2048);
      const sanitizedParams = { ...params, data: sanitizedData };
      
      // Create cache key from parameters
      const cacheKey = JSON.stringify(sanitizedParams);
      
      // Check cache first
      const cached = qrCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp) < QR_CACHE_TTL) {
        res.setHeader('Content-Type', cached.contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
        return res.send(cached.data);
      }
      
      const QRCode = await import('qrcode');
      let data: string | Buffer;
      let contentType: string;
      
      if (sanitizedParams.format === 'svg') {
        let svgData = await QRCode.toString(sanitizedParams.data, {
          type: 'svg',
          width: parseInt(sanitizedParams.size),
          margin: sanitizedParams.margin,
          color: {
            dark: sanitizedParams.dark,
            light: sanitizedParams.light
          }
        });
        
        // Add logo to SVG if provided
        if (sanitizedParams.logo) {
          // Parse viewBox to get coordinate system
          const viewBoxMatch = svgData.match(/viewBox="([^"]+)"/);
          if (viewBoxMatch) {
            const [vbX, vbY, vbWidth, vbHeight] = viewBoxMatch[1].split(' ').map(Number);
            
            // Calculate scale from pixels to viewBox units
            const size = parseInt(sanitizedParams.size);
            const scale = size / vbWidth;
            
            // Logo dimensions in viewBox units
            const logoSizePercent = sanitizedParams.logoSize || 20;
            const logoSizePixels = (size * logoSizePercent) / 100;
            const logoSize = logoSizePixels / scale; // Convert to viewBox units
            
            // Center position in viewBox units
            const centerX = vbWidth / 2;
            const centerY = vbHeight / 2;
            const logoX = centerX - (logoSize / 2);
            const logoY = centerY - (logoSize / 2);
            
            // Background padding in viewBox units
            const paddingPixels = 8;
            const padding = paddingPixels / scale;
            const bgX = logoX - padding;
            const bgY = logoY - padding;
            const bgSize = logoSize + (padding * 2);
            
            // Create logo element based on shape
            let logoElement = '';
            if (sanitizedParams.logoShape === 'circle') {
              const bgRadius = (logoSize / 2) + padding;
              logoElement = `
              <defs>
                <clipPath id="logo-clip">
                  <circle cx="${centerX}" cy="${centerY}" r="${logoSize / 2}" />
                </clipPath>
              </defs>
              <circle 
                cx="${centerX}" 
                cy="${centerY}" 
                r="${bgRadius}" 
                fill="white"
              />
              <image 
                href="${sanitizedParams.logo}" 
                x="${logoX}" 
                y="${logoY}" 
                width="${logoSize}" 
                height="${logoSize}" 
                clip-path="url(#logo-clip)"
              />`;
            } else {
              logoElement = `
              <rect 
                x="${bgX}" 
                y="${bgY}" 
                width="${bgSize}" 
                height="${bgSize}" 
                fill="white"
              />
              <image 
                href="${sanitizedParams.logo}" 
                x="${logoX}" 
                y="${logoY}" 
                width="${logoSize}" 
                height="${logoSize}"
              />`;
            }
            
            // Insert logo before closing svg tag
            svgData = svgData.replace('</svg>', `${logoElement}</svg>`);
          }
        }
        
        data = svgData;
        contentType = 'image/svg+xml';
      } else {
        // PNG format - logo embedding requires image processing library
        // For now, generate QR without logo for PNG format
        data = await QRCode.toBuffer(sanitizedParams.data, {
          type: 'png',
          width: parseInt(sanitizedParams.size),
          margin: sanitizedParams.margin,
          color: {
            dark: sanitizedParams.dark,
            light: sanitizedParams.light
          }
        });
        contentType = 'image/png';
      }
      
      // Cache the result
      qrCache.set(cacheKey, { data, contentType, timestamp: Date.now() });
      
      // Clean old cache entries periodically
      if (qrCache.size > 1000) {
        const now = Date.now();
        for (const [key, entry] of qrCache.entries()) {
          if (now - entry.timestamp > QR_CACHE_TTL) {
            qrCache.delete(key);
          }
        }
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
      res.send(data);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: 'Invalid parameters', errors: error.errors });
      }
      console.error('Error generating QR code:', error);
      res.status(500).json({ message: 'Failed to generate QR code' });
    }
  });
  
  // QR redirect handler (public endpoint)
  app.get('/q/:shortId', async (req, res) => {
    try {
      const { shortId } = req.params;
      const qrLink = await storage.getQrLinkByShortId(shortId);
      
      if (!qrLink) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Not Found</title>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; }
                .error-container { max-width: 400px; margin: 0 auto; }
                h1 { color: #e74c3c; margin-bottom: 20px; }
                p { color: #666; line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h1>404 - Link Not Found</h1>
                <p>This QR code link has expired or does not exist.</p>
              </div>
            </body>
          </html>
        `);
      }
      
      // Validate target URL for security (defense-in-depth for legacy links)
      if (!qrLink.enabled) {
        return res.status(403).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Link Disabled</title>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; }
                .error-container { max-width: 400px; margin: 0 auto; }
                h1 { color: #e74c3c; margin-bottom: 20px; }
                p { color: #666; line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h1>403 - Link Disabled</h1>
                <p>This QR code link has been disabled by the owner.</p>
              </div>
            </body>
          </html>
        `);
      }
      
      // Validate URL at redirect time for defense-in-depth
      const urlValidation = validateUrl(qrLink.targetUrl);
      if (!urlValidation.valid) {
        console.warn(`Blocked redirect to invalid URL: ${qrLink.targetUrl} - ${urlValidation.reason}`);
        return res.status(403).send(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Blocked</title>
              <meta charset="utf-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; }
                .error-container { max-width: 400px; margin: 0 auto; }
                h1 { color: #e74c3c; margin-bottom: 20px; }
                p { color: #666; line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h1>403 - Blocked</h1>
                <p>This link has been blocked for security reasons.</p>
              </div>
            </body>
          </html>
        `);
      }
      
      // Track the scan event
      const userAgent = req.headers['user-agent'] || '';
      const ipAddress = req.ip || req.connection.remoteAddress || '';
      const country = req.headers['cf-ipcountry'] || req.headers['x-country'] || null;
      const referrer = req.headers.referer || null;
      const landingHost = req.headers.host || '';
      
      // Simple device detection
      let device = 'desktop';
      if (/mobile|android|iphone|ipad/i.test(userAgent)) {
        device = /ipad/i.test(userAgent) ? 'tablet' : 'mobile';
      }
      
      // Hash IP for privacy (using crypto)
      const crypto = await import('crypto');
      const ipHash = crypto.createHash('sha256').update(ipAddress + 'QR_SALT').digest('hex');
      
      // Record the event
      await storage.createQrEvent({
        qrId: qrLink.id,
        ipHash,
        ua: userAgent.substring(0, 500), // Truncate long user agents
        device: device as any,
        country: country as string,
        referrer: referrer as string,
        landingHost
      });
      
      // Redirect to target URL
      res.redirect(302, qrLink.targetUrl);
    } catch (error) {
      console.error('Error processing QR redirect:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // ===== CARD SUBSCRIPTION ROUTES =====

  // Subscribe to card notifications (public endpoint)
  // ECARD LEAD CAPTURE ENDPOINT - Captures visitor info as CRM lead + subscription
  app.post('/api/cards/:cardId/capture-lead', asyncHandler(async (req, res) => {
    const { cardId } = req.params;
    const { firstName, lastName, email, phone, company, jobTitle, message } = req.body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ success: false, message: 'Valid email is required' });
    }

    const result = await storage.captureLeadFromCard(cardId, {
      firstName,
      lastName,
      email,
      phone,
      company,
      jobTitle,
      message
    });

    successResponse(res, result, 'Lead captured and added to CRM successfully');
  }));

  app.post('/api/cards/:cardId/subscribe', async (req, res) => {
    try {
      const { cardId } = req.params;
      const { email, name, pushSubscription } = req.body;

      // Validate email
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: 'Valid email is required' });
      }

      // Check if card exists
      const card = await storage.getBusinessCard(cardId);
      if (!card) {
        return res.status(404).json({ message: 'Card not found' });
      }

      // Check if already subscribed
      const existing = await storage.getCardSubscriptionByCardAndEmail(cardId, email);
      if (existing) {
        // Reactivate if unsubscribed, or update push subscription
        if (!existing.isActive) {
          await storage.updateCardSubscription(existing.id, {
            isActive: true,
            pushSubscription: pushSubscription || existing.pushSubscription,
            unsubscribedAt: undefined as any,
          });
          return res.json({ 
            message: 'Subscription reactivated successfully',
            subscription: { id: existing.id, email, name: name || existing.name }
          });
        } else if (pushSubscription && JSON.stringify(pushSubscription) !== JSON.stringify(existing.pushSubscription)) {
          // Update push subscription if it changed
          await storage.updateCardSubscription(existing.id, {
            pushSubscription,
            name: name || existing.name,
          });
          return res.json({ 
            message: 'Subscription updated successfully',
            subscription: { id: existing.id, email, name: name || existing.name }
          });
        }
        return res.json({ 
          message: 'Already subscribed',
          subscription: { id: existing.id, email, name: existing.name }
        });
      }

      // Generate unsubscribe token
      const crypto = await import('crypto');
      const unsubscribeToken = crypto.randomBytes(32).toString('hex');

      // Create subscription
      const subscription = await storage.createCardSubscription({
        cardId,
        email: email.toLowerCase().trim(),
        name: name?.trim(),
        pushSubscription,
        unsubscribeToken,
      });

      res.json({ 
        message: 'Subscribed successfully',
        subscription: { id: subscription.id, email: subscription.email, name: subscription.name }
      });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ message: 'Failed to subscribe' });
    }
  });

  // Unsubscribe from card notifications (public endpoint)
  app.post('/api/subscriptions/unsubscribe/:token', async (req, res) => {
    try {
      const { token } = req.params;

      const subscription = await storage.getCardSubscriptionByToken(token);
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }

      if (!subscription.isActive) {
        return res.json({ message: 'Already unsubscribed' });
      }

      await storage.updateCardSubscription(subscription.id, {
        isActive: false,
        unsubscribedAt: new Date(),
      });

      res.json({ message: 'Unsubscribed successfully' });
    } catch (error) {
      console.error('Unsubscribe error:', error);
      res.status(500).json({ message: 'Failed to unsubscribe' });
    }
  });

  // Get subscription count for a card (requires auth)
  app.get('/api/cards/:cardId/subscribers/count', requireAuth, async (req, res) => {
    try {
      const { cardId } = req.params;
      const user = req.user as User;

      // Verify card ownership
      const card = await storage.getBusinessCard(cardId);
      if (!card || card.userId !== user.id) {
        return res.status(404).json({ message: 'Card not found' });
      }

      const count = await storage.countCardSubscribers(cardId, true);
      res.json({ cardId, subscriberCount: count });
    } catch (error) {
      console.error('Get subscriber count error:', error);
      res.status(500).json({ message: 'Failed to get subscriber count' });
    }
  });

  // Get all subscribers for a card (requires auth)
  app.get('/api/cards/:cardId/subscribers', requireAuth, async (req, res) => {
    try {
      const { cardId } = req.params;
      const user = req.user as User;

      // Verify card ownership
      const card = await storage.getBusinessCard(cardId);
      if (!card || card.userId !== user.id) {
        return res.status(404).json({ message: 'Card not found' });
      }

      const subscribers = await storage.getCardSubscriptions(cardId, true);
      
      // Don't expose sensitive data like push subscriptions
      const sanitized = subscribers.map(sub => ({
        id: sub.id,
        email: sub.email,
        name: sub.name,
        subscribedAt: sub.subscribedAt,
      }));

      res.json({ cardId, subscribers: sanitized, total: sanitized.length });
    } catch (error) {
      console.error('Get subscribers error:', error);
      res.status(500).json({ message: 'Failed to get subscribers' });
    }
  });
  
  // Apply comprehensive error handling middleware (must be last)
  setupErrorHandling(app);
  
  const httpServer = createServer(app);
  
  // Setup WebSocket server for voice conversations
  setupVoiceWebSocketServer(httpServer);
  
  return httpServer;
}
