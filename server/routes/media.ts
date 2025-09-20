import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { requireAuth } from '../auth.js';
import { getSupabaseClient, STORAGE_CONFIG, WEBP_VARIANTS, saveFileLocally } from '../lib/supabase.js';
import { db } from '../db.js';
import { publicUploads, mediaVariants } from '../../shared/schema.js';
import { eq, desc, and } from 'drizzle-orm';

const router = Router();

// Multer setup for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: STORAGE_CONFIG.maxUploadBytes,
  },
  fileFilter: (req, file, cb) => {
    const isImage = STORAGE_CONFIG.allowedImageTypes.includes(file.mimetype);
    const isPdf = STORAGE_CONFIG.allowedPdfTypes.includes(file.mimetype);
    
    if (isImage || isPdf) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
    }
  },
});

// Helper function to determine MIME type from buffer using file-type library
async function getFileTypeFromBuffer(buffer: Buffer): Promise<{ mime: string; ext: string }> {
  try {
    // Try to use file-type library for accurate detection
    const { fileTypeFromBuffer } = await import('file-type');
    const fileType = await fileTypeFromBuffer(buffer);
    
    if (fileType) {
      return { 
        mime: fileType.mime, 
        ext: `.${fileType.ext}` 
      };
    }
  } catch (error) {
    console.warn('file-type library not available, using fallback detection');
  }

  // Fallback: Simple MIME type detection based on file signatures
  const signatures = {
    'image/jpeg': [0xFF, 0xD8, 0xFF],
    'image/png': [0x89, 0x50, 0x4E, 0x47],
    'image/gif': [0x47, 0x49, 0x46],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // Note: WEBP starts with RIFF
    'application/pdf': [0x25, 0x50, 0x44, 0x46], // %PDF
  };

  for (const [mime, sig] of Object.entries(signatures)) {
    if (sig.every((byte, i) => buffer[i] === byte)) {
      const ext = mime === 'image/jpeg' ? '.jpg' : 
                  mime === 'image/png' ? '.png' :
                  mime === 'image/gif' ? '.gif' :
                  mime === 'image/webp' ? '.webp' :
                  mime === 'application/pdf' ? '.pdf' : '.bin';
      return { mime, ext };
    }
  }

  // Default fallback
  return { 
    mime: 'application/octet-stream', 
    ext: '.bin' 
  };
}

// Helper function to create path pattern: user_{userId}/{YYYY}/{MM}/{DD}/{basename}/
function createStoragePath(userId: string, basename: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  
  return `user_${userId}/${year}/${month}/${day}/${basename}`;
}

// Helper function to get image dimensions and metadata using Sharp
async function getImageMetadata(buffer: Buffer): Promise<{ 
  width: number; 
  height: number; 
  format: string;
} | null> {
  try {
    // Try to use Sharp library for accurate image metadata
    const sharp = await import('sharp');
    const image = sharp.default(buffer);
    const metadata = await image.metadata();
    
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown'
    };
  } catch (error) {
    console.warn('Sharp library not available, skipping metadata extraction');
    return null;
  }
}

// Helper function to process image into WebP variants using Sharp
async function processImageVariants(
  buffer: Buffer,
  storagePath: string,
  publicUpload: any
): Promise<{ variants: Record<string, string>; metadata: any }> {
  const variants: Record<string, string> = {};
  const variantRecords = [];
  
  try {
    // Try to use Sharp for image processing
    const sharp = await import('sharp');
    const image = sharp.default(buffer);
    
    // Get original image metadata
    const metadata = await image.metadata();
    const originalWidth = metadata.width || 0;
    const originalHeight = metadata.height || 0;
    
    // Process each WebP variant
    for (const [variantKey, config] of Object.entries(WEBP_VARIANTS)) {
      try {
        // Create WebP variant with Sharp
        const resized = await image
          .resize(config.width, config.height, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .webp({ quality: config.quality })
          .toBuffer();
        
        const resizedMetadata = await sharp.default(resized).metadata();
        const variantWidth = resizedMetadata.width || config.width;
        const variantHeight = resizedMetadata.height || config.height;
        
        // For now, store placeholder URL since Supabase upload will be handled later
        const placeholderUrl = `placeholder://${config.suffix}.webp`;
        variants[`${config.suffix}_webp`] = placeholderUrl;
        
        // Create variant record for database
        variantRecords.push({
          publicUploadId: publicUpload.id,
          variantType: config.suffix,
          storagePath: `${storagePath}/${config.suffix}.webp`,
          publicUrl: placeholderUrl,
          width: variantWidth,
          height: variantHeight,
          fileSize: resized.length,
          format: 'webp',
          quality: config.quality,
          buffer: resized // Store buffer for later upload
        });
      } catch (variantError) {
        console.error(`Error processing ${config.suffix} variant:`, variantError);
        // Continue with other variants even if one fails
      }
    }
    
    return {
      variants,
      metadata: { width: originalWidth, height: originalHeight, variantRecords }
    };
    
  } catch (error) {
    console.warn('Sharp not available, skipping WebP generation');
    
    // Fallback: create placeholder variants pointing to original
    for (const [variantKey, config] of Object.entries(WEBP_VARIANTS)) {
      variants[`${config.suffix}_webp`] = 'placeholder://original';
    }
    
    return {
      variants,
      metadata: { width: null, height: null, variantRecords: [] }
    };
  }
}

// Main upload endpoint
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        ok: false, 
        error: 'No file uploaded' 
      });
    }

    // Initialize Supabase client dynamically
    const supabase = await getSupabaseClient();
    
    if (!supabase && !STORAGE_CONFIG.useLocalStorage) {
      return res.status(500).json({
        ok: false,
        error: 'Supabase not configured'
      });
    }

    const userId = req.user.id;
    const file = req.file;
    
    // Detect file type from buffer
    const { mime, ext } = await getFileTypeFromBuffer(file.buffer);
    
    // Validate file type
    const isImage = STORAGE_CONFIG.allowedImageTypes.includes(mime);
    const isPdf = STORAGE_CONFIG.allowedPdfTypes.includes(mime);
    
    if (!isImage && !isPdf) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid file type detected'
      });
    }

    // Generate unique basename
    const basename = `${nanoid(10)}_${Date.now()}`;
    const storagePath = createStoragePath(userId, basename);
    
    // Get image metadata if it's an image
    const imageMetadata = isImage ? await getImageMetadata(file.buffer) : null;

    // Create database entry for the upload
    const [publicUpload] = await db.insert(publicUploads).values({
      userId,
      slug: basename, // Using basename as slug for now
      originalFileName: file.originalname,
      storagePath,
      mimeType: mime,
      fileExtension: ext,
      fileSize: file.buffer.length,
    }).returning();

    const variants: Record<string, string> = {};

    if (isPdf) {
      // For PDFs, just upload as-is
      const pdfPath = `${storagePath}/original${ext}`;
      let publicUrl: string;
      
      if (STORAGE_CONFIG.useLocalStorage) {
        const localResult = await saveFileLocally(pdfPath, file.buffer);
        if (!localResult.success) {
          throw new Error(localResult.error || 'Failed to save PDF locally');
        }
        publicUrl = localResult.publicUrl!;
      } else {
        const { error: uploadError } = await supabase!.storage
          .from(STORAGE_CONFIG.bucket)
          .upload(pdfPath, file.buffer, {
            contentType: mime,
            cacheControl: '3600',
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          throw new Error('Failed to upload to storage');
        }
        publicUrl = `${STORAGE_CONFIG.assetBaseUrl}/${pdfPath}`;
      }
      
      variants.original = publicUrl;

      // Store variant record
      await db.insert(mediaVariants).values({
        publicUploadId: publicUpload.id,
        variantType: 'original',
        storagePath: pdfPath,
        publicUrl,
        fileSize: file.buffer.length,
        format: 'pdf',
      });

      return res.status(200).json({
        ok: true,
        type: 'pdf' as const,
        storagePath,
        variants,
      });
    }

    // For images, create WebP variants using Sharp processing
    const { variants: processedVariants, metadata: variantMetadata } = await processImageVariants(
      file.buffer,
      storagePath,
      publicUpload
    );
    
    // Upload original image
    const originalPath = `${storagePath}/original${ext}`;
    let originalUrl: string;
    
    if (STORAGE_CONFIG.useLocalStorage) {
      const localResult = await saveFileLocally(originalPath, file.buffer);
      if (!localResult.success) {
        throw new Error(localResult.error || 'Failed to save original image locally');
      }
      originalUrl = localResult.publicUrl!;
    } else {
      const { error: originalUploadError } = await supabase!.storage
        .from(STORAGE_CONFIG.bucket)
        .upload(originalPath, file.buffer, {
          contentType: mime,
          cacheControl: '3600',
        });

      if (originalUploadError) {
        console.error('Supabase upload error:', originalUploadError);
        throw new Error('Failed to upload original to storage');
      }
      originalUrl = `${STORAGE_CONFIG.assetBaseUrl}/${originalPath}`;
    }
    
    variants.original = originalUrl;

    // Store original variant record
    await db.insert(mediaVariants).values({
      publicUploadId: publicUpload.id,
      variantType: 'original',
      storagePath: originalPath,
      publicUrl: originalUrl,
      width: imageMetadata?.width || variantMetadata.width,
      height: imageMetadata?.height || variantMetadata.height,
      fileSize: file.buffer.length,
      format: ext.replace('.', ''),
    });

    // Upload WebP variants and create database records
    if (variantMetadata.variantRecords && variantMetadata.variantRecords.length > 0) {
      for (const variantRecord of variantMetadata.variantRecords) {
        try {
          // Upload WebP variant (to local storage or Supabase)
          let realPublicUrl: string;
          
          if (STORAGE_CONFIG.useLocalStorage) {
            const localResult = await saveFileLocally(variantRecord.storagePath, variantRecord.buffer);
            if (!localResult.success) {
              console.error(`Error saving ${variantRecord.variantType} variant locally:`, localResult.error);
              continue;
            }
            realPublicUrl = localResult.publicUrl!;
          } else {
            const { error: variantUploadError } = await supabase!.storage
              .from(STORAGE_CONFIG.bucket)
              .upload(variantRecord.storagePath, variantRecord.buffer, {
                contentType: 'image/webp',
                cacheControl: '3600',
              });

            if (variantUploadError) {
              console.error(`Error uploading ${variantRecord.variantType} variant:`, variantUploadError);
              continue; // Skip this variant but continue with others
            }
            realPublicUrl = `${STORAGE_CONFIG.assetBaseUrl}/${variantRecord.storagePath}`;
          }
          variants[`${variantRecord.variantType}_webp`] = realPublicUrl;

          // Create database record with real URL
          const { buffer, ...dbRecord } = variantRecord; // Remove buffer before storing
          await db.insert(mediaVariants).values({
            ...dbRecord,
            publicUrl: realPublicUrl,
          });

        } catch (variantError) {
          console.error(`Error processing ${variantRecord.variantType} variant:`, variantError);
        }
      }
    }

    // Merge processed variants with original
    Object.assign(variants, processedVariants);

    // Set security headers
    res.set('X-Content-Type-Options', 'nosniff');

    return res.status(200).json({
      ok: true,
      type: 'image' as const,
      storagePath,
      variants,
      width: imageMetadata?.width || variantMetadata.width,
      height: imageMetadata?.height || variantMetadata.height,
    });

  } catch (error) {
    console.error('Media upload error:', error);
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    });
  }
});

// Get user's uploaded media
router.get('/uploads', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const uploads = await db
      .select()
      .from(publicUploads)
      .where(eq(publicUploads.userId, userId))
      .orderBy(desc(publicUploads.createdAt));

    return res.json({
      ok: true,
      uploads,
    });
  } catch (error) {
    console.error('Error fetching uploads:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch uploads'
    });
  }
});

// Get variants for a specific upload
router.get('/uploads/:uploadId/variants', requireAuth, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const userId = req.user.id;
    
    // First verify the upload belongs to the user
    const upload = await db
      .select()
      .from(publicUploads)
      .where(and(
        eq(publicUploads.id, uploadId),
        eq(publicUploads.userId, userId)
      ))
      .limit(1);

    if (!upload.length) {
      return res.status(404).json({
        ok: false,
        error: 'Upload not found'
      });
    }

    // Get all variants for this upload
    const variants = await db
      .select()
      .from(mediaVariants)
      .where(eq(mediaVariants.publicUploadId, uploadId))
      .orderBy(mediaVariants.variantType);

    return res.json({
      ok: true,
      upload: upload[0],
      variants,
    });
  } catch (error) {
    console.error('Error fetching variants:', error);
    return res.status(500).json({
      ok: false,
      error: 'Failed to fetch variants'
    });
  }
});

export default router;