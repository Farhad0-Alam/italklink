import { useEffect, useState } from 'react';
import { BusinessCard } from '@shared/schema';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const useBusinessCardPWA = (cardData: BusinessCard) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    // Register service worker for business cards
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/card-sw.js')
        .then((registration) => {
          console.log('Business Card SW registered:', registration);
        })
        .catch((error) => {
          console.log('Business Card SW registration failed:', error);
        });
    }

    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Generate dynamic manifest for this card
  useEffect(() => {
    if (cardData) {
      updateDynamicManifest(cardData);
    }
  }, [cardData]);

  const installBusinessCard = async () => {
    // Only trigger native install prompt (like 2TalkLink)
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        setDeferredPrompt(null);
        setIsInstallable(false);
        
        if (outcome === 'accepted') {
          console.log('User installed business card app');
          return true;
        } else {
          console.log('User dismissed install prompt');
          return false;
        }
      } catch (error) {
        console.error('Error installing business card app:', error);
        setDeferredPrompt(null);
        setIsInstallable(false);
        return false;
      }
    }
    return false;
  };

  return {
    isInstallable,
    isInstalled,
    installBusinessCard
  };
};

// Update manifest for current business card
function updateDynamicManifest(cardData: BusinessCard) {
  const manifestData = {
    name: `${cardData.fullName || 'Digital Business Card'}`,
    short_name: cardData.fullName || 'Card',
    description: `${cardData.fullName}'s Digital Business Card - ${cardData.title || 'Professional'}`,
    start_url: window.location.href,
    display: 'standalone',
    background_color: cardData.backgroundColor || '#ffffff',
    theme_color: cardData.accentColor || '#22c55e',
    orientation: 'portrait-primary',
    scope: '/',
    categories: ['business', 'networking', 'social'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };

  // Create and inject dynamic manifest
  const manifestBlob = new Blob([JSON.stringify(manifestData)], { type: 'application/json' });
  const manifestURL = URL.createObjectURL(manifestBlob);
  
  // Remove existing manifest
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    existingManifest.remove();
  }
  
  // Add new manifest
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = manifestURL;
  document.head.appendChild(manifestLink);
  
  // Update theme color
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute('content', cardData.accentColor || '#22c55e');
}