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
    <nav className="bg-gradient-to-r from-green-600 to-green-700 backdrop-blur-lg border-b border-green-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="nav-logo">
            <div className="w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 1000 1000" className="w-10 h-10">
                <path fill="#FFFFFF" d="M817.9,999.9H182.1C81.8,999.9-0.2,917.8-0.2,817.5v-635C-0.2,82.2,81.8,0.1,182.1,0.1h635.7c100.3,0,182.4,82.1,182.4,182.4v635C1000.2,917.8,918.2,999.9,817.9,999.9z"/>
                <path fill="none" stroke="#16A34A" strokeWidth="70" strokeMiterlimit="10" d="M315,857c-116.4-65.3-195-189.8-195-332.7C120,313.7,290.7,143,501.3,143c210.6,0,381.2,170.7,381.2,381.2c0,82.3-26.7,166.9-77.1,232.3c-47.2,61.2-124.5,112.4-204.8,97.6c-27.8-5.1-55-17.9-74.7-38.6c-17.8-18.8-26.3-42.5-27.2-68V437"/>
                <path fill="#16A34A" d="M498.5,402L498.5,402c-24.6,0-44.5-19.9-44.5-44.5v0c0-24.6,19.9-44.5,44.5-44.5h0c24.6,0,44.5,19.9,44.5,44.5v0C543,382.1,523.1,402,498.5,402z"/>
              </svg>
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
  );
};
