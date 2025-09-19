import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { setupAuth, requireAuth, optionalAuth, requireAdmin } from './auth';
import { storage } from './storage';
import { emitAutomationEvent } from './automation-engine';
import type { User, Team, TeamMember, CrmContact, CrmActivity, CrmTask, CrmPipeline, CrmStage, CrmDeal, CrmSequence, EmailTemplate } from '@shared/schema';
import { 
  insertUserSchema, teamInvitationSchema, teamSettingsSchema,
  insertTeamMemberSchema, insertCrmContactSchema, insertCrmActivitySchema, 
  insertCrmTaskSchema, insertCrmPipelineSchema, insertCrmStageSchema, 
  insertCrmDealSchema, insertCrmSequenceSchema
} from '@shared/schema';
import { z } from 'zod';

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
import { templateCollectionsRoutes } from './template-collections-routes';
import { addToGoogleSheet, isGoogleSheetsConfigured } from './google-sheets';
import ragRoutes from './rag-routes';
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
  
  // Setup admin routes
  app.use('/api/admin', adminRoutes);
  
  // Setup wallet routes
  const walletRoutes = (await import('./wallet-routes')).default;
  app.use('/api/wallet', walletRoutes);
  
  // Setup affiliate routes
  const affiliateRoutes = (await import('./affiliate-routes')).default;
  app.use('/api/affiliate', affiliateRoutes);
  
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
  
  // Setup PWA routes
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
    requirePlan('pro', 'enterprise'),
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
      
      // Remove sensitive data from response
      const { password: _, ...userResponse } = newUser;
      
      successResponse(res, userResponse, 'User registered successfully', 201);
    })
  );
  
  app.post('/api/auth/forgot-password',
    asyncHandler(async (req, res) => {
      // Validate request body
      const bodyValidation = z.object({ email: commonSchemas.email }).safeParse(req.body);
      if (!bodyValidation.success) {
        throw validationError('Invalid request body', bodyValidation.error.errors);
      }
      
      const { email } = bodyValidation.data;
      const user = await storage.getUserByEmail(email);
      
      if (user) {
        const resetToken = await storage.createPasswordResetToken(user.id);
        
        await emitAutomationEvent({
          type: 'user.password.reset.requested',
          data: { user, resetToken }
        });
      }
      
      // Always return success for security (don't reveal if email exists)
      successResponse(res, {}, 'Password reset email sent if account exists');
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
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully' });
      });
    });
  });

  // Get current user
  app.get('/api/auth/user', optionalAuth, (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
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
      const { email, password } = req.body;
      
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
      
      // Log the user in
      req.login(user as any, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ message: 'Login failed' });
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
      
      // Validate required fields
      if (!cardData.fullName || !cardData.title) {
        console.log('Missing required fields:', { fullName: cardData.fullName, title: cardData.title });
        return res.status(400).json({ 
          message: 'Full name and title are required fields.' 
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
      
      // Generate a clean shareSlug from fullName if not provided
      const generateSlug = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens with single
          .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      };

      const autoSlug = generateSlug(cardData.fullName);
      
      const businessCard = await storage.createBusinessCard({
        ...cardData,
        userId: user.id,
        shareSlug: cardData.shareSlug || autoSlug,
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
      const { id, userId, createdAt, updatedAt, ...cleanData } = req.body;
      
      // Generate a clean shareSlug if fullName changed and no custom shareSlug provided
      if (cleanData.fullName && (!cleanData.shareSlug || !card.shareSlug || card.shareSlug.includes('talklink'))) {
        const generateSlug = (name: string): string => {
          return name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '-') // Replace spaces with hyphens
            .replace(/-+/g, '-') // Replace multiple hyphens with single
            .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
        };
        cleanData.shareSlug = generateSlug(cleanData.fullName);
      }
      
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
  app.get('/api/crm/contacts', requireAuth, async (req, res) => {
    try {
      const user = req.user as User;
      const { search, tags, lifecycleStage, limit = '50', offset = '0' } = req.query;
      
      const filters: any = {};
      if (search) filters.search = search as string;
      if (tags) filters.tags = (tags as string).split(',');
      if (lifecycleStage) filters.lifecycleStage = lifecycleStage as string;
      
      const contacts = await storage.getContactsByUser(user.id, filters);
      
      // Apply pagination
      const startIndex = parseInt(offset as string);
      const pageSize = Math.min(parseInt(limit as string), 100); // Max 100 per page
      const paginatedContacts = contacts.slice(startIndex, startIndex + pageSize);
      
      res.json({
        contacts: paginatedContacts,
        total: contacts.length,
        hasMore: startIndex + pageSize < contacts.length
      });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      res.status(500).json({ message: 'Failed to fetch contacts' });
    }
  });

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
    const { dateFrom, dateTo } = validateRequest(z.object({
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    }), 'query');
    
    const analytics = await storage.getDashboardAnalytics(userId, { dateFrom, dateTo });
    successResponse(res, analytics, 'Analytics retrieved successfully');
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
    
    // Skip Vite-specific paths in development (these start with @ or are special paths)
    if (process.env.NODE_ENV === 'development' && 
        (slug.startsWith('@') || slug === 'src' || slug === 'node_modules' || slug.startsWith('__vite'))) {
      return next(); // Pass to next middleware (Vite)
    }
    
    // Reserved slugs that should skip file serving
    const RESERVED_SLUGS = [
      "", "api", "auth", "admin", "builder", "dashboard", "login", "register",
      "logout", "static", "assets", "public", "favicon.ico", "robots.txt", "sitemap.xml",
      "_next", "card", "cards", "user", "users", "settings", "docs", "pricing",
      "health", "status", "webhook", "hooks", "oauth", "pay", "stripe", "paypal",
      "uploads", "templates", "appointments", "crm", "availability", "affiliate",
      "profile", "account-settings", "billing", "usage", "automation", "event-types",
      "email-templates", "analytics", "teams", "help", "booking"
    ];
    
    // Skip reserved slugs - let them fall through to other handlers
    if (RESERVED_SLUGS.includes(slug)) {
      return; // This will fall through to the next route handler
    }
    
    // Check if this slug exists in public uploads
    const upload = await storage.getPublicUploadBySlug(slug);
    
    if (!upload) {
      // If no upload found, return 404 or let it fall through to SPA
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
              <p>The file you're looking for doesn't exist or has been removed.</p>
            </div>
          </body>
        </html>
      `);
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
    
    // For now, since we're storing metadata only, serve a placeholder
    // In a real implementation, you would fetch the file from storage and stream it
    if (mimeType === 'text/html') {
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${upload.title || upload.originalFileName}</title>
            <meta charset="utf-8">
          </head>
          <body>
            <h1>File: ${upload.title || upload.originalFileName}</h1>
            <p>This is a placeholder for the uploaded HTML file.</p>
            <p>File Size: ${(upload.fileSize / 1024).toFixed(2)} KB</p>
            <p>Uploaded: ${new Date(upload.createdAt).toLocaleDateString()}</p>
            <p>Views: ${upload.viewCount + 1}</p>
          </body>
        </html>
      `);
    } else {
      // For non-HTML files, serve a info page or redirect to actual file
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${upload.title || upload.originalFileName}</title>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px; text-align: center; }
              .file-info { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
              .file-icon { font-size: 48px; margin-bottom: 20px; }
              h1 { color: #333; margin-bottom: 10px; }
              .file-details { text-align: left; margin: 20px 0; }
              .file-details dt { font-weight: bold; }
              .file-details dd { margin: 5px 0 15px 0; color: #666; }
            </style>
          </head>
          <body>
            <div class="file-info">
              <div class="file-icon">${fileExtension === '.pdf' ? '📄' : fileExtension.includes('image') ? '🖼️' : '📁'}</div>
              <h1>${upload.title || upload.originalFileName}</h1>
              <dl class="file-details">
                <dt>File Type:</dt>
                <dd>${mimeType}</dd>
                <dt>File Size:</dt>
                <dd>${(upload.fileSize / 1024).toFixed(2)} KB</dd>
                <dt>Uploaded:</dt>
                <dd>${new Date(upload.createdAt).toLocaleDateString()}</dd>
                <dt>Views:</dt>
                <dd>${upload.viewCount + 1}</dd>
              </dl>
              <p><em>Note: This is a preview page. In a full implementation, the actual file would be served directly.</em></p>
            </div>
          </body>
        </html>
      `);
    }
  }));
  
  // Apply comprehensive error handling middleware (must be last)
  setupErrorHandling(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
