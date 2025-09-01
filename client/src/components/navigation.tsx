import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { storage } from "@/lib/storage";

export const Navigation = () => {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "bn" : "en";
    i18n.changeLanguage(newLang);
    storage.saveLanguage(newLang);
  };

  return (
    <nav className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2" data-testid="nav-logo">
            <div className="w-8 h-8 bg-talklink-500 rounded-lg flex items-center justify-center">
              <i className="fas fa-id-card text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-white">CardPreview</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/affiliate" data-testid="nav-affiliate">
              <span className="text-white hover:text-talklink-300 transition-colors font-medium">
                Affiliate
              </span>
            </Link>
            <Link href="/pricing" data-testid="nav-pricing">
              <span className="text-white hover:text-talklink-300 transition-colors font-medium">
                Pricing
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              data-testid="button-language-toggle"
              className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
            >
              {i18n.language === "en" ? "EN" : "বাং"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className="bg-slate-700 hover:bg-slate-600 border-slate-600 text-white"
            >
              <i className={`fas ${theme === "dark" ? "fa-sun" : "fa-moon"}`}></i>
            </Button>
            
            <Button
              asChild
              className="bg-talklink-500 hover:bg-talklink-600 text-white"
              data-testid="button-get-talklink"
            >
              <a 
                href="https://2talklink.com" 
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
