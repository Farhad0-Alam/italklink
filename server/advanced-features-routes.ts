import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';

const router = Router();

// Bulk Upload endpoints
router.post('/bulk-upload/create', requireAuth, asyncHandler(async (req, res) => {
  const { totalRows, fileUrl } = req.body;
  const job = await storage.createBulkUploadJob({ sellerId: req.user!.id, totalRows, fileUrl });
  res.json({ success: true, data: job });
}));

router.get('/bulk-upload/history', requireAuth, asyncHandler(async (req, res) => {
  const jobs = await storage.getSellerBulkUploads(req.user!.id);
  res.json({ success: true, data: jobs });
}));

// Product Approval endpoints
router.get('/approvals/pending', requireAuth, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Unauthorized' });
  const approvals = await storage.getPendingApprovals();
  res.json({ success: true, data: approvals });
}));

router.post('/approvals/:productId/approve', requireAuth, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { productId } = req.params;
  const approval = await storage.approveProduct(productId, req.user!.id);
  res.json({ success: true, data: approval });
}));

router.post('/approvals/:productId/reject', requireAuth, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { productId } = req.params;
  const { reason } = req.body;
  const approval = await storage.rejectProduct(productId, req.user!.id, reason);
  res.json({ success: true, data: approval });
}));

// Webhook endpoints
router.post('/webhooks/create', requireAuth, asyncHandler(async (req, res) => {
  const { url, events } = req.body;
  const secret = Math.random().toString(36).substring(7);
  const webhook = await storage.createWebhook({ userId: req.user!.id, url, events, secret });
  res.json({ success: true, data: webhook });
}));

router.get('/webhooks', requireAuth, asyncHandler(async (req, res) => {
  const webhooks = await storage.getWebhooks(req.user!.id);
  res.json({ success: true, data: webhooks });
}));

// Settings endpoints
router.get('/settings/:key', asyncHandler(async (req, res) => {
  const value = await storage.getSetting(req.params.key);
  res.json({ success: true, data: value });
}));

router.post('/settings', requireAuth, asyncHandler(async (req, res) => {
  if (req.user?.role !== 'super_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { key, value, type } = req.body;
  const setting = await storage.setSetting(key, value, type);
  res.json({ success: true, data: setting });
}));

// Email templates
router.get('/email-templates', asyncHandler(async (req, res) => {
  const templates = await storage.getAllEmailTemplates();
  res.json({ success: true, data: templates });
}));

export default router;
