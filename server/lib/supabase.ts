// Check if Supabase credentials are available
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isDevelopment = process.env.NODE_ENV === 'development';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(`⚠️  Supabase not configured - ${isDevelopment ? 'using local storage for development' : 'media upload disabled'}`);
}

// Initialize Supabase client - using dynamic import to handle missing packages
let supabaseClient = null;

async function initializeSupabase() {
  if (supabaseClient !== null) return supabaseClient;
  
  try {
    // Dynamically import createClient to handle missing package gracefully
    const { createClient } = await import('@supabase/supabase-js');
    
    supabaseClient = supabaseUrl && supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        })
      : null;
  } catch (error) {
    console.warn('⚠️  @supabase/supabase-js not installed - media upload disabled');
    supabaseClient = null;
  }
  
  return supabaseClient;
}

// Export a promise that resolves to the supabase client
export const getSupabaseClient = initializeSupabase;

// Legacy export for backward compatibility - will be null initially
export const supabase = null;

// Configuration constants
export const STORAGE_CONFIG = {
  bucket: process.env.SUPABASE_BUCKET || 'public-uploads',
  assetBaseUrl: process.env.ASSET_BASE_URL || 
    (isDevelopment ? 'http://localhost:5000/uploads' : `${supabaseUrl}/storage/v1/object/public/public-uploads`),
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES || '2097152', 10), // 2MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  allowedPdfTypes: ['application/pdf'],
  useLocalStorage: isDevelopment && (!supabaseUrl || !supabaseServiceKey)
};

export const WEBP_VARIANTS = {
  thumb: { width: 200, height: 200, quality: 80, suffix: 'thumb_200' },
  card: { width: 430, height: 430, quality: 80, suffix: 'card_430' },
  large: { width: 1200, height: 1200, quality: 78, suffix: 'large_1200' }
} as const;

// Local storage functions for development
export async function saveFileLocally(filePath: string, buffer: Buffer): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  if (!STORAGE_CONFIG.useLocalStorage) {
    return { success: false, error: 'Local storage not enabled' };
  }

  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    
    // Create uploads directory structure
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const fullFilePath = path.join(uploadsDir, filePath);
    const dirPath = path.dirname(fullFilePath);
    
    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });
    
    // Write file
    await fs.writeFile(fullFilePath, buffer);
    
    const publicUrl = `${STORAGE_CONFIG.assetBaseUrl}/${filePath}`;
    return { success: true, publicUrl };
  } catch (error) {
    console.error('Local storage error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}