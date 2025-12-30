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
  const [canUseWebShare, setCanUseWebShare] = useState(false);

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

    // Check if Web Share API is available (fallback)
    const hasWebShare = !!(navigator as any).share;
    setCanUseWebShare(hasWebShare);
    console.log('PWA: Web Share API available:', hasWebShare);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA: beforeinstallprompt event fired!', e);
      e.preventDefault();
      const prompt = e as BeforeInstallPromptEvent;
      setDeferredPrompt(prompt);
      setIsInstallable(true);
      // Store globally for access from ContactLinksRenderer
      (window as any).__pwaInstallPrompt = prompt;
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA: App installed successfully');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowInstructions(false);
    };

    // Listen for custom trigger from ContactLinksRenderer
    const handleTriggerInstall = async () => {
      console.log('PWA: triggerPWAInstall event received');
      const prompt = (window as any).__pwaInstallPrompt as BeforeInstallPromptEvent | null;
      if (prompt) {
        try {
          await prompt.prompt();
          const { outcome } = await prompt.userChoice;
          console.log('PWA: Install trigger outcome:', outcome);
          (window as any).__pwaInstallPrompt = null;
          if (outcome === 'accepted') {
            setIsInstalled(true);
            setIsInstallable(false);
          }
        } catch (error) {
          console.log('PWA: Install trigger error:', error);
        }
      } else {
        // Show manual instructions
        setShowInstructions(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('triggerPWAInstall', handleTriggerInstall);

    // Force check for PWA installability after a delay
    // Since beforeinstallprompt may not fire, we default to installable if Web Share is available
    setTimeout(() => {
      console.log('PWA Status Check:', {
        beforeInstallPromptFired: !!deferredPrompt,
        isInstallable,
        isInstalled,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        isHTTPS: location.protocol === 'https:',
        userAgent: navigator.userAgent,
        canUseWebShare: hasWebShare
      });
      
      // If no native install prompt but Web Share available, make button installable
      if (!deferredPrompt && hasWebShare) {
        console.log('PWA: No beforeinstallprompt, but Web Share available - enabling button');
        setIsInstallable(true);
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('triggerPWAInstall', handleTriggerInstall);
    };
  }, []);

  const installBusinessCard = async () => {
    console.log('PWA: Install button clicked');
    console.log('PWA: deferredPrompt available:', !!deferredPrompt);
    
    // Trigger native install prompt
    if (deferredPrompt) {
      try {
        console.log('PWA: Showing install prompt...');
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('PWA: User choice:', outcome);
        
        setDeferredPrompt(null);
        setIsInstallable(false);
        
        if (outcome === 'accepted') {
          console.log('User accepted: Business card app will be installed');
          return true;
        } else {
          console.log('User dismissed: Install prompt cancelled');
          return false;
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
        setDeferredPrompt(null);
        setIsInstallable(false);
        return false;
      }
    } else {
      console.warn('PWA: No deferredPrompt available - beforeinstallprompt may not have fired');
      console.log('PWA Debug Info:', {
        hasManifest: !!document.querySelector('link[rel="manifest"]'),
        manifestHref: document.querySelector('link[rel="manifest"]')?.getAttribute('href'),
        isHTTPS: location.protocol === 'https:',
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        userAgent: navigator.userAgent
      });
      return false;
    }
  };

  return {
    isInstallable,
    isInstalled,
    installBusinessCard,
    showInstructions,
    setShowInstructions
  };
};