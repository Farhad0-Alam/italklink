import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Support Tickets
router.post('/support/tickets', requireAuth, asyncHandler(async (req, res) => {
  const { subject, description, priority } = req.body;
  const ticket = await storage.createTicket({ userId: req.user!.id, subject, description, priority });
  res.json({ success: true, data: ticket });
}));

router.get('/support/tickets', requireAuth, asyncHandler(async (req, res) => {
  const tickets = await storage.getTicketsByUser(req.user!.id);
  res.json({ success: true, data: tickets });
}));

// Product Recommendations
router.get('/recommendations/:productId', asyncHandler(async (req, res) => {
  const recommendations = await storage.getProductRecommendations(req.params.productId);
  res.json({ success: true, data: recommendations });
}));

// Tax Rates
router.get('/tax/:countryCode', asyncHandler(async (req, res) => {
  const { state } = req.query;
  const taxRate = await storage.getTaxRate(req.params.countryCode, state as string);
  res.json({ success: true, data: taxRate });
}));

// Analytics
router.post('/analytics/event', asyncHandler(async (req, res) => {
  const { userId, eventType, productId, metadata } = req.body;
  const event = await storage.logEvent({ userId, eventType, productId, metadata });
  res.json({ success: true, data: event });
}));

// Translations
router.get('/translations/:language', asyncHandler(async (req, res) => {
  const translations = await storage.getAllTranslations(req.params.language);
  res.json({ success: true, data: translations });
}));

// API Keys
router.post('/api-keys/create', requireAuth, asyncHandler(async (req, res) => {
  const { name, permissions } = req.body;
  const key = `sk_${Math.random().toString(36).substring(2, 15)}`;
  const apiKey = await storage.createApiKey({ userId: req.user!.id, key, name, permissions });
  res.json({ success: true, data: apiKey });
}));

router.get('/api-keys', requireAuth, asyncHandler(async (req, res) => {
  const apiKeys = await storage.getUserApiKeys(req.user!.id);
  res.json({ success: true, data: apiKeys });
}));

export default router;
