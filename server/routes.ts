import type { Express } from "express";
import { createServer, type Server } from "http";
import passport from 'passport';
import { setupAuth, requireAuth, optionalAuth, requireAdmin } from './auth';
import { storage } from './storage';
import type { User } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString() });
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
      
      // Check if user has reached their limit
      const userCards = await storage.getUserBusinessCards(user.id);
      if (userCards.length >= (user.businessCardsLimit || 1)) {
        return res.status(403).json({ 
          message: `You have reached your business card limit (${user.businessCardsLimit}). Upgrade your plan to create more cards.` 
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
