// Check if Supabase credentials are available
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️  Supabase not configured - media upload disabled');
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
  assetBaseUrl: process.env.ASSET_BASE_URL || `${supabaseUrl}/storage/v1/object/public/public-uploads`,
  maxUploadBytes: parseInt(process.env.MAX_UPLOAD_BYTES || '2097152', 10), // 2MB
  allowedImageTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/avif'],
  allowedPdfTypes: ['application/pdf']
};

export const WEBP_VARIANTS = {
  thumb: { width: 200, height: 200, quality: 80, suffix: 'thumb_200' },
  card: { width: 430, height: 430, quality: 80, suffix: 'card_430' },
  large: { width: 1200, height: 1200, quality: 78, suffix: 'large_1200' }
} as const;