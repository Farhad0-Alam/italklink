import { Router } from 'express';
import { requireAuth, optionalAuth } from './auth';
import { storage } from './storage';
import { z } from 'zod';
import { insertNfcTagSchema, insertNfcTapEventSchema } from '@shared/schema';
import { asyncHandler } from './middleware/error-handling';

const router = Router();

// Generate NDEF encoded NFC payload
function generateNdefPayload(url: string): string {
  try {
    // Create a simplified NDEF message for URI records
    // NDEF format: Message = [Records]
    // URI Record: TNF(1 byte) + Type Length + Type + Length + Data
    
    // TNF = 0xD0 (MB=1, ME=1, SR=1, TNF=0) for first/only record
    // Type = "U" (0x55) for URI
    // Status byte for URI = 0x00 (no prefix)
    
    const uriPrefix = 0x00; // No URI prefix (full URL)
    const uriData = Buffer.from(url, 'utf-8');
    const payload = Buffer.concat([Buffer.from([uriPrefix]), uriData]);
    
    // Create NDEF record header
    const typeBytes = Buffer.from('U', 'utf-8');
    const payloadLength = payload.length;
    
    // Record header: TNF(3 bits) | Flags(5 bits)
    const tnf = 0x01; // Well-known type
    const flags = 0xD0; // MB, ME, SR flags set
    const recordHeader = Buffer.from([flags, typeBytes.length, payloadLength]);
    
    // Full NDEF message
    const ndefMessage = Buffer.concat([recordHeader, typeBytes, payload]);
    return ndefMessage.toString('base64');
  } catch (error) {
    console.error('Error generating NDEF:', error);
    throw error;
  }
}

// Create NFC Tag
router.post('/create', requireAuth, asyncHandler(async (req, res) => {
  const data = insertNfcTagSchema.parse(req.body);
  
  // Generate NDEF payload
  const ndefPayload = generateNdefPayload(data.targetUrl);
  
  const tag = await storage.createNfcTag({
    ...data,
    userId: req.user.id,
    ndefPayload,
    isProgrammed: true,
  });
  
  res.json({ success: true, data: tag });
}));

// Get NFC Tags for a card
router.get('/card/:cardId', optionalAuth, asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  
  const tags = await storage.getNfcTagsByCard(cardId);
  res.json({ success: true, data: tags });
}));

// Get single NFC Tag
router.get('/:tagId', optionalAuth, asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  
  const tag = await storage.getNfcTag(tagId);
  if (!tag) {
    return res.status(404).json({ message: 'NFC tag not found' });
  }
  
  res.json({ success: true, data: tag });
}));

// Update NFC Tag
router.patch('/:tagId', requireAuth, asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  const data = insertNfcTagSchema.partial().parse(req.body);
  
  // Regenerate NDEF if URL changed
  const updateData = { ...data };
  if (data.targetUrl) {
    updateData.ndefPayload = generateNdefPayload(data.targetUrl);
  }
  
  const tag = await storage.updateNfcTag(tagId, updateData);
  res.json({ success: true, data: tag });
}));

// Delete NFC Tag
router.delete('/:tagId', requireAuth, asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  await storage.deleteNfcTag(tagId);
  res.json({ success: true, message: 'NFC tag deleted' });
}));

// Record NFC Tap (called when someone taps the tag)
router.post('/tap/:tagId', optionalAuth, asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  const { deviceType, visitorEmail, visitorName, actionTaken } = req.body;
  
  // Get tag info
  const tag = await storage.getNfcTag(tagId);
  if (!tag) {
    return res.status(404).json({ message: 'NFC tag not found' });
  }
  
  // Increment tap count
  await storage.updateNfcTag(tagId, { 
    totalTaps: (tag.totalTaps || 0) + 1,
    lastTappedAt: new Date(),
  });
  
  // Record tap event
  const tapEvent = await storage.recordNfcTapEvent({
    nfcTagId: tagId,
    cardId: tag.cardId,
    userId: req.user?.id || null,
    deviceType: deviceType || 'mobile',
    visitorEmail: visitorEmail || null,
    visitorName: visitorName || null,
    actionTaken: actionTaken || 'view',
    ipAddress: req.ip,
    userAgent: req.get('User-Agent'),
  } as any);
  
  // Update analytics
  await storage.updateNfcAnalytics(tag.cardId, tagId);
  
  res.json({ 
    success: true, 
    message: 'Tap recorded',
    redirectUrl: tag.targetUrl,
    tapEvent 
  });
}));

// Get NFC Analytics for a card
router.get('/analytics/:cardId', requireAuth, asyncHandler(async (req, res) => {
  const { cardId } = req.params;
  
  const analytics = await storage.getNfcAnalyticsForCard(cardId);
  res.json({ success: true, data: analytics });
}));

// Get NDEF payload for programming
router.get('/ndef/:tagId', asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  
  const tag = await storage.getNfcTag(tagId);
  if (!tag) {
    return res.status(404).json({ message: 'NFC tag not found' });
  }
  
  if (!tag.ndefPayload) {
    return res.status(400).json({ message: 'NDEF payload not generated' });
  }
  
  // Return as buffer for NFC writing
  res.set('Content-Type', 'application/octet-stream');
  res.set('Content-Disposition', 'attachment; filename="nfc-payload.bin"');
  res.send(Buffer.from(tag.ndefPayload, 'base64'));
}));

// Bulk NFC tap analytics (for dashboard)
router.get('/analytics/bulk/:userId', requireAuth, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  if (req.user.id !== userId) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  const stats = await storage.getNfcAnalyticsForUser(userId);
  res.json({ success: true, data: stats });
}));

// Export NFC settings as JSON for chip programming tools
router.get('/export/:tagId', requireAuth, asyncHandler(async (req, res) => {
  const { tagId } = req.params;
  
  const tag = await storage.getNfcTag(tagId);
  if (!tag) {
    return res.status(404).json({ message: 'NFC tag not found' });
  }
  
  const exportData = {
    tagName: tag.tagName,
    tagId: tag.tagId,
    tagType: tag.tagType,
    targetUrl: tag.targetUrl,
    ndefPayload: tag.ndefPayload,
    accessLevel: tag.accessLevel,
    isEncrypted: tag.isEncrypted,
    generatedAt: new Date().toISOString(),
  };
  
  res.set('Content-Type', 'application/json');
  res.set('Content-Disposition', `attachment; filename="${tag.tagName}-nfc-config.json"`);
  res.json(exportData);
}));

export default router;
