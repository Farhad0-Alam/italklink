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
    console.log('PWA Hook: Initializing...');
    
    // Register service worker for business cards
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/card-sw.js')
        .then((registration) => {
          console.log('Business Card SW registered:', registration);
        })
        .catch((error) => {
          console.error('Business Card SW registration failed:', error);
        });
    } else {
      console.warn('Service Worker not supported');
    }

    // Check if running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('PWA: Running as installed app');
      setIsInstalled(true);
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired!', e);
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstructions(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Force check for PWA installability after a delay
    setTimeout(() => {
      console.log('PWA Status Check:', {
        isInstallable,
        isInstalled,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        isHTTPS: location.protocol === 'https:',
        userAgent: navigator.userAgent
      });
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Generate dynamic manifest for this card
  useEffect(() => {
    if (cardData) {
      console.log('PWA: Updating manifest for card:', cardData.fullName);
      updateDynamicManifest(cardData);
    }
  }, [cardData]);

  const installBusinessCard = async () => {
    // Only trigger native install prompt (like TalkLink)
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
    short_name: cardData.fullName?.split(' ')[0] || 'Card',
    description: `Connect with ${cardData.fullName || 'this professional'} - Digital Business Card`,
    start_url: window.location.pathname + window.location.search + window.location.hash,
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
        src: '/icon-256x256.png',
        sizes: '256x256',
        type: 'image/png'
      },
      {
        src: '/icon-384x384.png',
        sizes: '384x384',
        type: 'image/png'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  };

  console.log('PWA: Generating manifest:', manifestData);

  // Create and inject dynamic manifest
  const manifestBlob = new Blob([JSON.stringify(manifestData, null, 2)], { type: 'application/json' });
  const manifestURL = URL.createObjectURL(manifestBlob);
  
  // Remove existing manifest
  const existingManifest = document.querySelector('link[rel="manifest"]');
  if (existingManifest) {
    existingManifest.remove();
    console.log('PWA: Removed existing manifest');
  }
  
  // Add new manifest
  const manifestLink = document.createElement('link');
  manifestLink.rel = 'manifest';
  manifestLink.href = manifestURL;
  manifestLink.crossOrigin = 'anonymous';
  document.head.appendChild(manifestLink);
  console.log('PWA: Added manifest link:', manifestURL);
  
  // Update theme color
  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!themeColorMeta) {
    themeColorMeta = document.createElement('meta');
    themeColorMeta.setAttribute('name', 'theme-color');
    document.head.appendChild(themeColorMeta);
  }
  themeColorMeta.setAttribute('content', cardData.accentColor || '#22c55e');
  
  // Add viewport meta if not exists
  if (!document.querySelector('meta[name="viewport"]')) {
    const viewportMeta = document.createElement('meta');
    viewportMeta.setAttribute('name', 'viewport');
    viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    document.head.appendChild(viewportMeta);
    console.log('PWA: Added viewport meta');
  }
  
  // Trigger a small delay to let browser process manifest
  setTimeout(() => {
    console.log('PWA: Manifest should be ready for beforeinstallprompt');
    // Check if manifest is accessible
    fetch(manifestURL)
      .then(res => res.json())
      .then(data => console.log('PWA: Manifest verification:', data))
      .catch(err => console.error('PWA: Manifest fetch error:', err));
  }, 500);
}