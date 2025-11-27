import { Router } from 'express';
import { db } from '../db';
import { businessCards } from '@shared/schema';
import { eq } from 'drizzle-orm';
import sharp from 'sharp';
import fetch from 'node-fetch';

const router = Router();

// Generate dynamic manifest for each business card
router.get('/manifest', async (req, res) => {
  try {
    // Extract pathname from referer header (primary method - like old 2talklink)
    let pathname = '/';
    let slugFromPath = '';
    
    if (req.headers.referer) {
      const refererUrl = new URL(req.headers.referer);
      pathname = refererUrl.pathname;
      // Extract slug from pathname (e.g., "/my-card" -> "my-card")
      const pathParts = pathname.split('/').filter(Boolean);
      slugFromPath = pathParts[pathParts.length - 1] || '';
    }
    
    // Fallback to query param if referer not available
    const querySlug = req.query.slug as string;
    const cardSlug = slugFromPath || querySlug;
    
    // Update pathname if using query param fallback
    if (!slugFromPath && querySlug) {
      pathname = `/${querySlug}`;
    }
    
    let cardData = null;
    
    // Fetch card data using slug from referer or query
    if (cardSlug) {
      const result = await db
        .select()
        .from(businessCards)
        .where(eq(businessCards.shareSlug, cardSlug))
        .limit(1);
      
      cardData = result[0];
    }

    // Extract app name from installButton element or use card PWA settings
    let appName = 'TalkLink';
    if (cardData) {
      // Try to get from installButton element first
      try {
        const pageElements = (cardData.pageElements as any[]) || [];
        const installButton = pageElements.find(el => el.type === 'installButton');
        if (installButton?.data?.appName) {
          appName = installButton.data.appName;
        } else if (cardData.pwaAppName) {
          appName = cardData.pwaAppName;
        } else {
          appName = cardData.fullName || 'TalkLink';
        }
      } catch (error) {
        appName = cardData.pwaAppName || cardData.fullName || 'TalkLink';
      }
    }

    const brandColor = (cardData?.brandColor as string) || '#22c55e';
    const profileImage = cardData?.profileImage as string;
    
    // Use the exact pathname from referer as start_url (critical for PWA launch)
    const manifest = {
      name: appName,
      short_name: appName.split(' ')[0] || 'TalkLink',
      description: `Digital Business Card - ${appName}`,
      start_url: pathname, // Use referer pathname directly
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: brandColor,
      orientation: 'portrait-primary' as const,
      scope: '/',
      categories: ['business', 'networking', 'social'],
      icons: [] as any[]
    };

    if (profileImage && profileImage.startsWith('http')) {
      try {
        const imageResponse = await fetch(profileImage);
        const arrayBuffer = await imageResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const sizes = [192, 256, 384, 512];
        for (const size of sizes) {
          const resizedBuffer = await sharp(buffer)
            .resize(size, size)
            .toFormat('png')
            .toBuffer();

          const base64Image = `data:image/png;base64,${resizedBuffer.toString('base64')}`;

          manifest.icons.push({
            src: base64Image,
            sizes: `${size}x${size}`,
            type: 'image/png',
            purpose: 'any maskable'
          });
        }
      } catch (imageError) {
        console.error('Image processing error:', imageError);
        manifest.icons = getDefaultIcons();
      }
    } else {
      manifest.icons = getDefaultIcons();
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json(manifest);
  } catch (error) {
    console.error('Error generating manifest:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

function getDefaultIcons() {
  return [
    {
      src: '/icon-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any maskable'
    },
    {
      src: '/icon-256x256.png',
      sizes: '256x256',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icon-384x384.png',
      sizes: '384x384',
      type: 'image/png',
      purpose: 'any'
    },
    {
      src: '/icon-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any maskable'
    }
  ];
}

export { router as pwaRouter };