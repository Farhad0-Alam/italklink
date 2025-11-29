/**
 * Cookie Management Utility
 * Handles setting, getting, and removing cookies with optional expiration
 */

export const CookieUtils = {
  /**
   * Set a cookie with optional expiration
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - Optional settings (days to expire, path, etc.)
   */
  set: (
    name: string,
    value: string,
    options?: {
      days?: number;
      path?: string;
      domain?: string;
      secure?: boolean;
      sameSite?: "Strict" | "Lax" | "None";
    }
  ) => {
    const {
      days = 365,
      path = "/",
      domain = undefined,
      secure = true,
      sameSite = "Lax",
    } = options || {};

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(
      value
    )}; path=${path}`;

    if (days > 0) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      cookieString += `; expires=${date.toUTCString()}`;
    }

    if (domain) cookieString += `; domain=${domain}`;
    if (secure) cookieString += "; secure";
    if (sameSite) cookieString += `; SameSite=${sameSite}`;

    document.cookie = cookieString;
  },

  /**
   * Get a cookie value by name
   * @param name - Cookie name
   * @returns Cookie value or null if not found
   */
  get: (name: string): string | null => {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(";");

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  },

  /**
   * Remove a cookie
   * @param name - Cookie name
   * @param path - Cookie path (default: "/")
   */
  remove: (name: string, path = "/") => {
    document.cookie = `${encodeURIComponent(name)}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 UTC`;
  },

  /**
   * Check if a cookie exists
   * @param name - Cookie name
   * @returns True if cookie exists
   */
  exists: (name: string): boolean => {
    return CookieUtils.get(name) !== null;
  },

  /**
   * Get all cookies as an object
   * @returns Object containing all cookies
   */
  getAll: (): Record<string, string> => {
    const cookies: Record<string, string> = {};
    document.cookie.split(";").forEach((cookie) => {
      const [name, value] = cookie.trim().split("=");
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    });
    return cookies;
  },
};

/**
 * Useful Cookie Names and Utilities
 */
export const COOKIES = {
  // Theme & Preferences
  THEME: "talklink_theme", // light or dark
  LANGUAGE: "talklink_language", // en, bn, etc.
  SIDEBAR_STATE: "sidebar_state", // open or closed
  
  // User Preferences
  SIDEBAR_COLLAPSED: "sidebar_collapsed",
  CARD_VIEW_MODE: "card_view_mode", // list or grid
  SORT_PREFERENCE: "sort_preference",
  FILTER_PREFERENCE: "filter_preference",
  
  // Analytics & Tracking
  SESSION_ID: "talklink_session_id", // Anonymous session tracking
  ANALYTICS_CONSENT: "talklink_analytics_consent", // true or false
  MARKETING_CONSENT: "talklink_marketing_consent", // true or false
  COOKIE_CONSENT_SHOWN: "talklink_consent_shown", // flag to track if user has made a choice
  
  // Session
  SESSION_TOKEN: "_session_token", // Session authentication
  
  // User Activity
  LAST_CARD_VIEWED: "last_card_viewed",
  RECENT_CARDS: "recent_cards_ids",
  LAST_VISITED: "last_visited_timestamp",
};

/**
 * Initialize useful cookies on app load
 */
export const initializeUsefulCookies = () => {
  // Set session ID if not exists
  if (!CookieUtils.exists(COOKIES.SESSION_ID)) {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    CookieUtils.set(COOKIES.SESSION_ID, sessionId, {
      days: 30,
      sameSite: "Lax",
    });
  }

  // Note: Don't auto-initialize ANALYTICS_CONSENT/MARKETING_CONSENT
  // Let CookieConsent banner show to user first for explicit consent

  // Initialize theme cookie from localStorage or system preference
  if (!CookieUtils.exists(COOKIES.THEME)) {
    const savedTheme = localStorage.getItem("theme") || "light";
    CookieUtils.set(COOKIES.THEME, savedTheme, { days: 365 });
  }

  // Initialize language cookie
  if (!CookieUtils.exists(COOKIES.LANGUAGE)) {
    const savedLang = localStorage.getItem("i18nextLng") || "en";
    CookieUtils.set(COOKIES.LANGUAGE, savedLang, { days: 365 });
  }

  // Set last visited timestamp
  CookieUtils.set(COOKIES.LAST_VISITED, new Date().toISOString(), {
    days: 365,
  });
};

/**
 * Track user action (for analytics)
 */
export const trackEvent = (
  eventName: string,
  eventData?: Record<string, any>
) => {
  const analyticsConsent = CookieUtils.get(COOKIES.ANALYTICS_CONSENT);
  
  if (analyticsConsent === "true") {
    // Log event (can be extended to send to analytics service)
    const sessionId = CookieUtils.get(COOKIES.SESSION_ID);
    console.log(`[Analytics] Event: ${eventName}`, {
      sessionId,
      timestamp: new Date().toISOString(),
      ...eventData,
    });
  }
};

/**
 * Track recently viewed card
 */
export const trackCardView = (cardId: string) => {
  CookieUtils.set(COOKIES.LAST_CARD_VIEWED, cardId, { days: 365 });
  
  // Update recent cards list
  const recentStr = CookieUtils.get(COOKIES.RECENT_CARDS) || "[]";
  try {
    let recent = JSON.parse(recentStr);
    recent = recent.filter((id: string) => id !== cardId);
    recent.unshift(cardId);
    recent = recent.slice(0, 10); // Keep only last 10
    CookieUtils.set(COOKIES.RECENT_CARDS, JSON.stringify(recent), {
      days: 30,
    });
  } catch (e) {
    // If parsing fails, reset
    CookieUtils.set(COOKIES.RECENT_CARDS, JSON.stringify([cardId]), {
      days: 30,
    });
  }
};

/**
 * Get recently viewed cards
 */
export const getRecentCards = (): string[] => {
  const recentStr = CookieUtils.get(COOKIES.RECENT_CARDS) || "[]";
  try {
    return JSON.parse(recentStr);
  } catch {
    return [];
  }
};
