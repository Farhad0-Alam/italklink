import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { storage } from "@/lib/storage";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart } from "lucide-react";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";

const AnimatedITalkLinkLogo = () => {
  const spiralControls = useAnimationControls();
  const dotControls = useAnimationControls();

  useEffect(() => {
    const runAnimation = async () => {
      while (true) {
        // Step 1: Rotate spiral for 4 seconds
        await spiralControls.start({
          rotate: 360,
          transition: { duration: 4, ease: "linear" }
        });
        
        // Reset rotation for next cycle
        spiralControls.set({ rotate: 0 });
        
        // Step 2: Cricket ball bounce - 3 bounces hitting top of circle
        // Bounce 1 - highest
        await dotControls.start({
          y: -170,
          transition: { duration: 0.25, ease: "easeOut" }
        });
        await dotControls.start({
          y: 0,
          transition: { duration: 0.25, ease: "easeIn" }
        });
        
        // Bounce 2 - medium (losing energy)
        await dotControls.start({
          y: -130,
          transition: { duration: 0.22, ease: "easeOut" }
        });
        await dotControls.start({
          y: 0,
          transition: { duration: 0.22, ease: "easeIn" }
        });
        
        // Bounce 3 - lowest
        await dotControls.start({
          y: -80,
          transition: { duration: 0.18, ease: "easeOut" }
        });
        await dotControls.start({
          y: 0,
          transition: { duration: 0.18, ease: "easeIn" }
        });
        
        // Step 3: Wait 5 seconds before repeating
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    };
    
    runAnimation();
  }, [spiralControls, dotControls]);

  return (
    <motion.div 
      className="w-10 h-10 rounded-xl overflow-hidden shadow-lg"
      whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <svg viewBox="0 0 1000 1000" className="w-full h-full">
        {/* Green background */}
        <path fill="#22c55e" d="M817.9,999.9H182.1C81.8,999.9-0.2,917.8-0.2,817.5v-635C-0.2,82.2,81.8,0.1,182.1,0.1h635.7c100.3,0,182.4,82.1,182.4,182.4v635C1000.2,917.8,918.2,999.9,817.9,999.9z"/>
        
        {/* White "i" spiral stroke - controlled rotation */}
        <motion.g
          style={{ transformOrigin: "500px 500px" }}
          animate={spiralControls}
        >
          <path 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="70" 
            strokeMiterlimit="10" 
            d="M315,857c-116.4-65.3-195-189.8-195-332.7C120,313.7,290.7,143,501.3,143c210.6,0,381.2,170.7,381.2,381.2c0,82.3-26.7,166.9-77.1,232.3c-47.2,61.2-124.5,112.4-204.8,97.6c-27.8-5.1-55-17.9-74.7-38.6c-17.8-18.8-26.3-42.5-27.2-68V437"
          />
        </motion.g>
        
        {/* White dot - controlled cricket ball bounce */}
        <motion.ellipse
          cx="498.5"
          cy="357.5"
          rx="44.5"
          ry="44.5"
          fill="#FFFFFF"
          animate={dotControls}
        />
      </svg>
    </motion.div>
  );
};

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
            <AnimatedITalkLinkLogo />
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
