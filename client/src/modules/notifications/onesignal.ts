// OneSignal Web SDK integration (native, no React wrapper needed)
declare global {
  interface Window {
    OneSignal: any;
    __AUTH?: { user?: any };
  }
}

/** Call once in app bootstrap (e.g., main.tsx or App.tsx) */
export async function initOneSignal() {
  if (!import.meta.env.VITE_ONESIGNAL_APP_ID) {
    console.warn('OneSignal: VITE_ONESIGNAL_APP_ID not configured');
    return;
  }

  // Load OneSignal Web SDK if not already loaded
  if (!window.OneSignal) {
    const script = document.createElement('script');
    script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
    script.async = true;
    document.head.appendChild(script);
    
    await new Promise((resolve) => {
      script.onload = resolve;
    });
  }

  // Initialize OneSignal
  await window.OneSignal.init({
    appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
    allowLocalhostAsSecureOrigin: true,
    notifyButton: { enable: true },
  });

  // Set common tags when available
  try {
    const user = window.__AUTH?.user;
    if (user) {
      await window.OneSignal.sendTag('role', 'user');
      await window.OneSignal.sendTag('owner_user_id', String(user.id));
      await window.OneSignal.sendTag('plan', user.plan ?? 'free');
    }
    
    const locale = navigator.language?.split('-')[0] || 'en';
    await window.OneSignal.sendTag('locale', locale);
    
    // Optional: Set country from geo if available
    try {
      const geoResponse = await fetch('https://ipapi.co/country_code/');
      if (geoResponse.ok) {
        const country = await geoResponse.text();
        if (country && country.length === 2) {
          await window.OneSignal.sendTag('country', country.toLowerCase());
        }
      }
    } catch {
      // Ignore geo failures
    }
  } catch (error) {
    console.warn('OneSignal tagging failed:', error);
  }
}

/** Tag a visitor on a public card page */
export async function tagCardVisitor(card: { id: string | number; slug?: string }) {
  if (!window.OneSignal) return;
  
  try {
    await window.OneSignal.sendTag('audience', 'visitor');
    await window.OneSignal.sendTag('card_id', String(card.id));
    if (card.slug) {
      await window.OneSignal.sendTag('card_slug', card.slug);
    }
  } catch (error) {
    console.warn('OneSignal card tagging failed:', error);
  }
}

/** Optional helper to prompt subscription */
export async function promptPush() {
  if (!window.OneSignal) return false;
  
  try {
    return await window.OneSignal.showSlidedownPrompt();
  } catch (error) {
    console.warn('OneSignal prompt failed:', error);
    return false;
  }
}

/** Check if user is subscribed */
export async function isSubscribed(): Promise<boolean> {
  if (!window.OneSignal) return false;
  
  try {
    return await window.OneSignal.isPushNotificationsEnabled();
  } catch {
    return false;
  }
}

/** Get OneSignal user ID */
export async function getUserId(): Promise<string | null> {
  if (!window.OneSignal) return null;
  
  try {
    return await window.OneSignal.getUserId();
  } catch {
    return null;
  }
}