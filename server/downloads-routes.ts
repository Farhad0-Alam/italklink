import { Router } from 'express';
import { requireAuth } from './auth';
import { asyncHandler } from './middleware/error-handling';
import { storage } from './storage';
import { sendFile } from './utils/file-service';

const router = Router();

// Get user's download history
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const downloads = await storage.getUserDownloads(req.user.id);
  
  res.json({
    success: true,
    data: downloads,
  });
}));

// Download file using token
router.get('/:token', asyncHandler(async (req, res) => {
  const { token } = req.params;
  
  const download = await storage.getDownloadByToken(token);
  
  if (!download || download.status !== 'active') {
    return res.status(404).json({ error: 'Download not found or expired' });
  }
  
  if (download.expiresAt && new Date() > download.expiresAt) {
    return res.status(410).json({ error: 'Download has expired' });
  }
  
  if (download.downloadCount >= download.maxDownloads) {
    return res.status(429).json({ error: 'Download limit exceeded' });
  }
  
  // Increment download count
  await storage.incrementDownloadCount(download.id);
  
  // Stream file
  try {
    const file = await sendFile(download.filePath);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Type', file.mimeType);
    res.send(file.buffer);
  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({ error: 'Failed to download file' });
  }
}));

export default router;
