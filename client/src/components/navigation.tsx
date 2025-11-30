import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { storage } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";

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
    <nav className="bg-gradient-to-r from-orange-500 to-orange-600 backdrop-blur-lg border-b border-orange-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="nav-logo">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <i className="fas fa-address-card text-orange-500 text-sm"></i>
            </div>
            <span className="text-xl font-bold text-white">TalkLink</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/affiliate" data-testid="nav-affiliate">
              <span className="text-white hover:text-orange-100 transition-colors font-medium">
                Affiliate
              </span>
            </Link>
            <Link href="/pricing" data-testid="nav-pricing">
              <span className="text-white hover:text-orange-100 transition-colors font-medium">
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
                  className="bg-orange-400 hover:bg-orange-300 border-orange-300 text-white relative"
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
              className="bg-orange-400 hover:bg-orange-300 border-orange-300 text-white"
            >
              {i18n.language === "en" ? "EN" : "বাং"}
            </Button>
            
            {location !== "/pricing" && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                data-testid="button-theme-toggle"
                className="bg-orange-400 hover:bg-orange-300 border-orange-300 text-white"
              >
                <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
              </Button>
            )}
            
            <Button
              asChild
              className="bg-green-500 hover:bg-green-600 text-white"
              data-testid="button-get-talklink"
            >
              <a 
                href="https://talkl.ink" 
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
  );
};
