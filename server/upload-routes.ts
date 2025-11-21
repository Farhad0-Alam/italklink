import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
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

// Upload limits by plan type
const UPLOAD_LIMITS: Record<string, { maxUploads: number; maxFileSize: number; maxStorageBytes: number }> = {
  free: { 
    maxUploads: 5, 
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxStorageBytes: 10 * 1024 * 1024 // 10MB total
  },
  pro: { 
    maxUploads: 50, 
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxStorageBytes: 500 * 1024 * 1024 // 500MB total
  },
  enterprise: { 
    maxUploads: Infinity, 
    maxFileSize: 100 * 1024 * 1024, // 100MB
    maxStorageBytes: Infinity
  }
};

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

// Helper function to ensure directory exists
function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Helper function to save file to disk
async function saveFileToDisk(buffer: Buffer, storagePath: string): Promise<void> {
  const fullPath = path.join(process.cwd(), 'uploads', storagePath);
  const directory = path.dirname(fullPath);
  
  // Ensure the directory exists
  ensureDirectoryExists(directory);
  
  // Write the file to disk
  return new Promise((resolve, reject) => {
    fs.writeFile(fullPath, buffer, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

// Upload new file
router.post('/', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    throw validationError('No file uploaded');
  }

  const userId = (req.user as any).id;
  const { slug: providedSlug, title } = req.body;

  // Get user info and plan type
  const user = await storage.getUserById(userId);
  if (!user) {
    throw validationError('User not found');
  }

  const planType = (user.planType || 'free') as keyof typeof UPLOAD_LIMITS;
  const limits = UPLOAD_LIMITS[planType] || UPLOAD_LIMITS['free'];

  // Check file size limit
  if (req.file.size > limits.maxFileSize) {
    const maxSizeMB = Math.ceil(limits.maxFileSize / (1024 * 1024));
    throw businessLogicError(`File size exceeds limit of ${maxSizeMB}MB for ${planType} plan. Please upgrade your plan for larger files.`);
  }

  // Check upload count limit
  if (limits.maxUploads !== Infinity) {
    const uploadCount = await storage.countUserPublicUploads(userId);
    if (uploadCount >= limits.maxUploads) {
      throw businessLogicError(`You have reached the upload limit of ${limits.maxUploads} files for your ${planType} plan. Please upgrade to upload more files.`);
    }
  }

  // Check total storage limit
  if (limits.maxStorageBytes !== Infinity) {
    const userUploads = await storage.getUserPublicUploads(userId, 1000, 0);
    const totalStorageUsed = userUploads.reduce((sum, upload) => sum + (upload.fileSize || 0), 0);
    if (totalStorageUsed + req.file.size > limits.maxStorageBytes) {
      const maxStorageMB = Math.ceil(limits.maxStorageBytes / (1024 * 1024));
      throw businessLogicError(`Total storage limit of ${maxStorageMB}MB exceeded for ${planType} plan. Please delete some files or upgrade your plan.`);
    }
  }

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

  // Save file to disk
  await saveFileToDisk(req.file.buffer, storagePath);

  // Store metadata in database
  const upload = await storage.createPublicUpload(uploadData);

  // Calculate remaining uploads for user
  const currentUploadCount = await storage.countUserPublicUploads(userId);
  const remaining = limits.maxUploads === Infinity ? null : Math.max(0, limits.maxUploads - currentUploadCount);

  successResponse(res, {
    id: upload.id,
    slug: upload.slug,
    title: upload.title,
    url: `${req.protocol}://${req.get('host')}/${upload.slug}`,
    mimeType: upload.mimeType,
    fileSize: upload.fileSize,
    createdAt: upload.createdAt,
    planType: planType,
    uploadsRemaining: remaining,
  }, 'File uploaded successfully');
}));

// Get user's uploads
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const userId = (req.user as any).id;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const offset = (page - 1) * limit;

  // Get user plan type
  const user = await storage.getUserById(userId);
  const planType = (user?.planType || 'free') as keyof typeof UPLOAD_LIMITS;
  const planLimits = UPLOAD_LIMITS[planType] || UPLOAD_LIMITS['free'];

  const uploads = await storage.getUserPublicUploads(userId, limit, offset);
  const total = await storage.countUserPublicUploads(userId);

  // Calculate storage usage
  const allUploads = await storage.getUserPublicUploads(userId, 10000, 0);
  const totalStorageUsed = allUploads.reduce((sum, upload) => sum + (upload.fileSize || 0), 0);

  const uploadsWithUrls = uploads.map(upload => ({
    ...upload,
    url: `${req.protocol}://${req.get('host')}/${upload.slug}`,
  }));

  paginatedResponse(res, uploadsWithUrls, {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    planInfo: {
      plan: planType,
      maxUploads: planLimits.maxUploads === Infinity ? null : planLimits.maxUploads,
      uploadsUsed: total,
      uploadsRemaining: planLimits.maxUploads === Infinity ? null : Math.max(0, planLimits.maxUploads - total),
      maxStorageBytes: planLimits.maxStorageBytes === Infinity ? null : planLimits.maxStorageBytes,
      storageUsedBytes: totalStorageUsed,
      storageRemainingBytes: planLimits.maxStorageBytes === Infinity ? null : Math.max(0, planLimits.maxStorageBytes - totalStorageUsed),
    }
  }, 'Uploads retrieved successfully');
}));

// Update upload
router.patch('/:id', requireAuth, asyncHandler(async (req, res) => {
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
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
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
router.post('/:id/replace', requireAuth, upload.single('file'), asyncHandler(async (req, res) => {
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