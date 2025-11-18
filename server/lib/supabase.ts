// Storage configuration for media uploads
// Migrated from Supabase to Replit App Storage

// Configuration constants
export const STORAGE_CONFIG = {
  assetBaseUrl: '/objects',  // All uploaded files served via /objects/ route
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES || '10485760', 10), // 10MB default (increased from 2MB)
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  allowedPdfTypes: ['application/pdf'],
};

export const WEBP_VARIANTS = {
  thumb: { width: 200, height: 200, quality: 80, suffix: 'thumb_200' },
  card: { width: 430, height: 430, quality: 80, suffix: 'card_430' },
  large: { width: 1200, height: 1200, quality: 78, suffix: 'large_1200' }
} as const;
