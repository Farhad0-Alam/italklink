import { Router } from 'express';
import { BusinessCard } from '@shared/schema';

const router = Router();

// Generate dynamic manifest for each business card
router.get('/manifest/:cardId.json', async (req, res) => {
  try {
    const { cardId } = req.params;
    
    // In a real app, you'd fetch the card data from database
    // For now, we'll generate a basic manifest
    const manifest = {
      "name": `Digital Business Card - ${cardId}`,
      "short_name": "BusinessCard",
      "description": "Professional Digital Business Card - Tap to connect",
      "start_url": `/share#${cardId}`,
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#22c55e",
      "orientation": "portrait-primary",
      "scope": "/",
      "categories": ["business", "networking", "social"],
      "icons": [
        {
          "src": "/icon-192x192.png",
          "sizes": "192x192",
          "type": "image/png",
          "purpose": "any maskable"
        },
        {
          "src": "/icon-256x256.png",
          "sizes": "256x256", 
          "type": "image/png"
        },
        {
          "src": "/icon-384x384.png",
          "sizes": "384x384",
          "type": "image/png"
        },
        {
          "src": "/icon-512x512.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "screenshots": [
        {
          "src": "/card-screenshot.png",
          "sizes": "390x844",
          "type": "image/png",
          "form_factor": "narrow"
        }
      ]
    };

    res.setHeader('Content-Type', 'application/json');
    res.json(manifest);
  } catch (error) {
    console.error('Error generating manifest:', error);
    res.status(500).json({ error: 'Failed to generate manifest' });
  }
});

export { router as pwaRouter };