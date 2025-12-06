import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { storage } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";

// 5 Creative iTalkLink Icon Variations
const IconVariant1Person = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="8" r="4" fill="url(#gradient1)" />
    <rect x="12" y="14" width="8" height="14" rx="2" fill="url(#gradient1)" />
    <defs>
      <linearGradient id="gradient1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant2Card = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="6" width="28" height="20" rx="3" stroke="url(#gradient2)" strokeWidth="2.5" fill="none" />
    <circle cx="10" cy="16" r="3" fill="url(#gradient2)" />
    <rect x="16" y="12" width="2.5" height="8" rx="1.25" fill="url(#gradient2)" />
    <circle cx="17.25" cy="10" r="1.5" fill="url(#gradient2)" />
    <defs>
      <linearGradient id="gradient2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant3Signal = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="14" y="12" width="4" height="16" rx="2" fill="url(#gradient3)" />
    <circle cx="16" cy="6" r="3" fill="url(#gradient3)" />
    <circle cx="8" cy="16" r="2" fill="url(#gradient3)" opacity="0.6" />
    <circle cx="24" cy="16" r="2" fill="url(#gradient3)" opacity="0.6" />
    <circle cx="5" cy="24" r="1.5" fill="url(#gradient3)" opacity="0.4" />
    <circle cx="27" cy="24" r="1.5" fill="url(#gradient3)" opacity="0.4" />
    <line x1="16" y1="16" x2="8" y2="16" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4" />
    <line x1="16" y1="16" x2="24" y2="16" stroke="url(#gradient3)" strokeWidth="1.5" opacity="0.4" />
    <defs>
      <linearGradient id="gradient3" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant4Layered = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="6" r="3.5" fill="#16a34a" />
    <rect x="12" y="12" width="8" height="16" rx="2" fill="#16a34a" opacity="0.7" />
    <rect x="10" y="14" width="12" height="14" rx="2" fill="#15803d" opacity="0.5" />
    <rect x="13" y="13" width="6" height="15" rx="1.5" fill="url(#gradient4)" />
    <circle cx="16" cy="7" r="2.5" fill="#22c55e" />
    <defs>
      <linearGradient id="gradient4" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const IconVariant5Geometric = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="11" y="11" width="10" height="18" rx="4" fill="url(#gradient5)" />
    <circle cx="16" cy="5" r="4" fill="url(#gradient5)" />
    <defs>
      <linearGradient id="gradient5" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#16a34a" />
        <stop offset="1" stopColor="#15803d" />
      </linearGradient>
    </defs>
  </svg>
);

const iconVariants = [
  { name: "Person", component: IconVariant1Person },
  { name: "Card", component: IconVariant2Card },
  { name: "Signal", component: IconVariant3Signal },
  { name: "Layered", component: IconVariant4Layered },
  { name: "Geometric", component: IconVariant5Geometric },
];

export const Navigation = () => {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const { data: cartItems = [] } = useQuery({
    queryKey: ['/api/cart'],
    queryFn: async () => {
      const res = await fetch('/api/cart');
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
    staleTime: 1000 * 60,
  });

  const cartCount = cartItems.length;

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
    storage.saveLanguage(newLang);
  };

  return (
    <>
      {/* Icon Preview Section */}
      <div className="bg-gradient-to-r from-green-700 to-green-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-6">
            Choose Your Favorite iTalkLink Icon
          </h2>
          <div className="grid grid-cols-5 gap-6">
            {iconVariants.map((variant, index) => {
              const IconComponent = variant.component;
              return (
                <div key={index} className="flex flex-col items-center space-y-3">
                  <div className="w-20 h-20 bg-white rounded-xl flex items-center justify-center shadow-xl hover:scale-110 transition-transform">
                    <IconComponent />
                  </div>
                  <span className="text-sm font-semibold text-white bg-green-900 px-4 py-1.5 rounded-full">
                    {variant.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="bg-gradient-to-r from-green-600 to-green-700 backdrop-blur-lg border-b border-green-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2" data-testid="nav-logo">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
                <i className="fas fa-address-card text-green-600 text-sm"></i>
              </div>
              <span className="text-xl font-bold text-white">iTalkLink</span>
            </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/affiliate" data-testid="nav-affiliate">
              <span className="text-white hover:text-green-100 transition-colors font-medium">
                Affiliate
              </span>
            </Link>
            <Link href="/pricing" data-testid="nav-pricing">
              <span className="text-white hover:text-green-100 transition-colors font-medium">
                Pricing
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {location.includes('/shop') || location.includes('/product') || location.includes('/search') ? (
              <Link href="/cart" data-testid="button-cart">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-500 hover:bg-green-400 border-green-400 text-white relative"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Button>
              </Link>
            ) : null}

            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              data-testid="button-language-toggle"
              className="bg-green-500 hover:bg-green-400 border-green-400 text-white"
            >
              {i18n.language === "en" ? "EN" : "বাং"}
            </Button>
            
            {location !== "/pricing" && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
                className="bg-green-500 hover:bg-green-400 border-green-400 text-white"
              >
                <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
              </Button>
            )}
            
            <Button
              asChild
              className="bg-white hover:bg-gray-100 text-green-700 font-bold"
              data-testid="button-get-italklink"
            >
              <a 
                href="https://italklink.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                {t('nav.getTalkLink')}
              </a>
            </Button>
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};
