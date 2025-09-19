import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { z } from 'zod';
import { requireAuth } from './auth';
import { storage } from './storage';
import {
  asyncHandler,
  successResponse,
  paginatedResponse,
  notFoundError,
  validationError,
  businessLogicError,
} from './middleware/error-handling';
import {
  publicUploadFormSchema,
  insertPublicUploadSchema,
  type PublicUpload,
  type InsertPublicUpload
} from '@shared/schema';

const router = Router();

// Reserved slugs that cannot be used for custom URLs
const RESERVED_SLUGS = [
  "", "api", "auth", "admin", "builder", "dashboard", "login", "register",
  "logout", "static", "assets", "public", "favicon.ico", "robots.txt", "sitemap.xml",
  "_next", "card", "cards", "user", "users", "settings", "docs", "pricing",
  "health", "status", "webhook", "hooks", "oauth", "pay", "stripe", "paypal"
];

// File upload configuration
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'text/html',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not supported'), false);
    }
  }
});

// Helper function to get file extension from mime type
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'text/html': '.html',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/avif': '.avif',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
  };
  return mimeToExt[mimeType] || '';
}

// Helper function to slugify a string
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 80);
}

// Upload new file
router.post('/upload', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw validationError('No file uploaded');
  }

  const userId = (req.user as any).id;
  const { slug: providedSlug, title } = req.body;

  // Generate or validate slug
  let slug = providedSlug || slugify(path.parse(req.file.originalname).name);
  
  // Validate slug format
  if (!/^[a-z0-9-]{3,80}$/.test(slug)) {
    throw validationError('Slug must be 3-80 characters long and contain only lowercase letters, numbers, and hyphens');
  }

  // Check if slug is reserved
  if (RESERVED_SLUGS.includes(slug)) {
    throw validationError('This slug is reserved and cannot be used');
  }

  // Check if slug already exists
  const existingUpload = await storage.getPublicUploadBySlug(slug);
  if (existingUpload) {
    throw businessLogicError('This slug is already taken. Please choose a different one.');
  }

  // Get file extension
  const fileExtension = getFileExtension(req.file.mimetype);
  if (!fileExtension) {
    throw validationError('Unsupported file type');
  }

  // Create storage path
  const storagePath = `user_${userId}/${slug}${fileExtension}`;

  // Create upload record
  const uploadData: InsertPublicUpload = {
    userId,
    slug,
    originalFileName: req.file.originalname,
    storagePath,
    title: title || req.file.originalname,
    mimeType: req.file.mimetype,
    fileExtension,
    fileSize: req.file.size,
    isPublic: true,
  };

  // Validate upload data
  const validation = insertPublicUploadSchema.safeParse(uploadData);
  if (!validation.success) {
    throw validationError('Invalid upload data', validation.error.errors);
  }

  // Store file (for now, we'll store in memory/filesystem, later can integrate with cloud storage)
  // In a real implementation, this would upload to S3, Google Cloud Storage, etc.
  const upload = await storage.createPublicUpload({
    ...uploadData,
    fileContent: req.file.buffer, // Store file content temporarily
  });

  successResponse(res, {
    id: upload.id,
    slug: upload.slug,
    title: upload.title,
    url: `${req.protocol}://${req.get('host')}/${upload.slug}`,
    mimeType: upload.mimeType,
    fileSize: upload.fileSize,
    createdAt: upload.createdAt,
  }, 'File uploaded successfully');
}));

// Get user's uploads
router.get('/uploads', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req.user as any).id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  const uploads = await storage.getUserPublicUploads(userId, limit, offset);
  const total = await storage.countUserPublicUploads(userId);

  const uploadsWithUrls = uploads.map(upload => ({
    ...upload,
    url: `${req.protocol}://${req.get('host')}/${upload.slug}`,
  }));

  paginatedResponse(res, uploadsWithUrls, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  }, 'Uploads retrieved successfully');
}));

// Update upload
router.patch('/uploads/:id', requireAuth, asyncHandler(async (req, res) => {
  const uploadId = req.params.id;
  const userId = (req.user as any).id;
  const { title, isPublic } = req.body;

  // Get existing upload
  const existingUpload = await storage.getPublicUploadById(uploadId);
  if (!existingUpload) {
    throw notFoundError('Upload', uploadId);
  }

  // Check ownership
  if (existingUpload.userId !== userId) {
    throw businessLogicError('You can only update your own uploads');
  }

  // Update upload
  const updatedUpload = await storage.updatePublicUpload(uploadId, {
    title,
    isPublic,
  });

  successResponse(res, {
    ...updatedUpload,
    url: `${req.protocol}://${req.get('host')}/${updatedUpload.slug}`,
  }, 'Upload updated successfully');
}));

// Delete upload
router.delete('/uploads/:id', requireAuth, asyncHandler(async (req, res) => {
  const uploadId = req.params.id;
  const userId = (req.user as any).id;

  // Get existing upload
  const existingUpload = await storage.getPublicUploadById(uploadId);
  if (!existingUpload) {
    throw notFoundError('Upload', uploadId);
  }

  // Check ownership
  if (existingUpload.userId !== userId) {
    throw businessLogicError('You can only delete your own uploads');
  }

  // Delete upload
  await storage.deletePublicUpload(uploadId);

  successResponse(res, null, 'Upload deleted successfully');
}));

// Replace file for existing upload
router.post('/uploads/:id/replace', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw validationError('No file uploaded');
  }

  const uploadId = req.params.id;
  const userId = (req.user as any).id;

  // Get existing upload
  const existingUpload = await storage.getPublicUploadById(uploadId);
  if (!existingUpload) {
    throw notFoundError('Upload', uploadId);
  }

  // Check ownership
  if (existingUpload.userId !== userId) {
    throw businessLogicError('You can only replace your own uploads');
  }

  // Validate file type matches existing or is compatible
  const newFileExtension = getFileExtension(req.file.mimetype);
  if (!newFileExtension) {
    throw validationError('Unsupported file type');
  }

  // Update storage path if extension changed
  const newStoragePath = existingUpload.storagePath.replace(
    existingUpload.fileExtension,
    newFileExtension
  );

  // Update upload record
  const updatedUpload = await storage.updatePublicUpload(uploadId, {
    originalFileName: req.file.originalname,
    storagePath: newStoragePath,
    mimeType: req.file.mimetype,
    fileExtension: newFileExtension,
    fileSize: req.file.size,
    fileContent: req.file.buffer, // Store new file content
  });

  successResponse(res, {
    ...updatedUpload,
    url: `${req.protocol}://${req.get('host')}/${updatedUpload.slug}`,
  }, 'File replaced successfully');
}));

export default router;