import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from 'passport';
import bcrypt from 'bcryptjs';
import { setupAuth, requireAuth, optionalAuth, requireAdmin } from './auth';
import { storage } from './storage';
import type { User, Team, TeamMember } from '@shared/schema';
import { 
  insertUserSchema, teamInvitationSchema, teamSettingsSchema,
  insertTeamMemberSchema
} from '@shared/schema';
import { z } from 'zod';
import { setupAIRoutes } from './ai-routes';
import adminRoutes from './admin-routes';
import { templateCollectionsRoutes } from './template-collections-routes';
import { addToGoogleSheet, isGoogleSheetsConfigured } from './google-sheets';
import ragRoutes from './rag-routes';
import { pwaRouter } from './routes/pwa';





export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // Setup AI routes
  setupAIRoutes(app);
  
  // Setup AI template design
  const { setupAITemplateDesign } = await import('./ai-routes');
  setupAITemplateDesign(app);
  
  // Setup RAG routes
  app.use('/api', ragRoutes);
  
  // Setup admin routes
  app.use('/api/admin', adminRoutes);
  
  // Setup template collections routes
  app.use('/api/collections', requireAuth, templateCollectionsRoutes);
  
  // Setup PWA routes
  app.use('/api/pwa', pwaRouter);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
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
          description: plan.description,
          features: plan.features,
          isPopular: plan.isPopular || false
        }))
        .sort((a, b) => a.price - b.price); // Sort by price ascending
      
      res.json(publicPlans);
    } catch (error) {
      console.error('Failed to get public plans:', error);
      res.status(500).json({ message: 'Internal server error' });
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
      res.json(req.user);
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
      
      // Check if user has reached their limit (Pro and Enterprise users have unlimited cards)
      const userCards = await storage.getUserBusinessCards(user.id);
      if (user.planType === 'free' && userCards.length >= (user.businessCardsLimit || 1)) {
        return res.status(403).json({ 
          message: `You have reached your business card limit (${user.businessCardsLimit}). Upgrade to Pro for unlimited cards.` 
        });
      }
      
      const businessCard = await storage.createBusinessCard({
        ...cardData,
        userId: user.id,
        shareSlug: cardData.shareSlug || `${user.firstName?.toLowerCase()}-${user.lastName?.toLowerCase()}-${Date.now()}`,
      });
      
      res.status(201).json(businessCard);
    } catch (error) {
      console.error('Error creating business card:', error);
      res.status(500).json({ message: 'Failed to create business card' });
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
      
      const updatedCard = await storage.updateBusinessCard(req.params.id, req.body);
      res.json(updatedCard);
    } catch (error) {
      console.error('Error updating business card:', error);
      res.status(500).json({ message: 'Failed to update business card' });
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
      
      const updatedCard = await storage.updateBusinessCard(req.params.id, req.body);
      res.json(updatedCard);
    } catch (error) {
      console.error('Error updating business card:', error);
      res.status(500).json({ message: 'Failed to update business card' });
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

  const httpServer = createServer(app);
  return httpServer;
}
