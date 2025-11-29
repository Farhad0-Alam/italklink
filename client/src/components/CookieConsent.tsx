import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CookieUtils, COOKIES } from "@/utils/cookies";

export const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show banner if user hasn't made a consent choice yet
    const consentShown = CookieUtils.get(COOKIES.COOKIE_CONSENT_SHOWN);
    if (!consentShown) {
      setIsVisible(true);
    }
  }, []);

  const handleAcceptAll = () => {
    CookieUtils.set(COOKIES.ANALYTICS_CONSENT, "true", { days: 365 });
    CookieUtils.set(COOKIES.MARKETING_CONSENT, "true", { days: 365 });
    CookieUtils.set(COOKIES.COOKIE_CONSENT_SHOWN, "true", { days: 365 });
    setIsVisible(false);
  };

  const handleAcceptEssential = () => {
    CookieUtils.set(COOKIES.ANALYTICS_CONSENT, "false", { days: 365 });
    CookieUtils.set(COOKIES.MARKETING_CONSENT, "false", { days: 365 });
    CookieUtils.set(COOKIES.COOKIE_CONSENT_SHOWN, "true", { days: 365 });
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white shadow-xl border-t border-gray-700 z-40">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">We Use Cookies</h3>
            <p className="text-sm text-gray-400">
              We use cookies to enhance your experience, analyze traffic, and enable marketing. 
              <a 
                href="/cookie-policy" 
                className="text-orange-400 hover:text-orange-300 ml-1"
              >
                Learn more
              </a>
            </p>
            <div className="mt-3 space-y-2 text-xs text-gray-500">
              <p>🔒 <strong>Essential Cookies:</strong> Required for site functionality</p>
              <p>📊 <strong>Analytics:</strong> Help us improve your experience</p>
              <p>📢 <strong>Marketing:</strong> Personalized content & ads</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 min-w-max">
            <Button
              variant="outline"
              onClick={handleAcceptEssential}
              className="text-sm bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              Essential Only
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="text-sm bg-orange-500 hover:bg-orange-600 text-white"
            >
              Accept All
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-gray-800 rounded transition"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
