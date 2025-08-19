import React from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { logEvent } from "@/lib/share";

export const Home: React.FC = () => {
  const { t } = useTranslation();

  const handleCreateCard = () => {
    logEvent("cta_click_create");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Hero Section */}
      <section className="pt-20 pb-32 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-talklink-400 to-talklink-600 bg-clip-text text-transparent">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            {t('home.hero.subtitle')}
          </p>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-full">
              <i className="fas fa-check text-talklink-500"></i>
              <span className="text-sm">{t('home.trustBadge.noSignup')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-full">
              <i className="fas fa-check text-talklink-500"></i>
              <span className="text-sm">{t('home.trustBadge.noCreditCard')}</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-full">
              <i className="fas fa-check text-talklink-500"></i>
              <span className="text-sm">{t('home.trustBadge.free')}</span>
            </div>
          </div>
          
          {/* CTAs */}
          <div className="space-y-4">
            <Button 
              asChild
              size="lg"
              className="bg-talklink-500 hover:bg-talklink-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto"
              onClick={handleCreateCard}
              data-testid="button-create-card"
            >
              <Link href="/builder">
                {t('home.cta.create')}
              </Link>
            </Button>
            <div>
              <a 
                href="https://2talklink.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-talklink-400 hover:text-talklink-300 underline"
                data-testid="link-what-is-talklink"
              >
                {t('home.cta.whatIs')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-slate-800/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('features.title')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-talklink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-lightning-bolt text-talklink-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('features.fast.title')}</h3>
              <p className="text-slate-300">{t('features.fast.desc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-talklink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-talklink-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('features.privacy.title')}</h3>
              <p className="text-slate-300">{t('features.privacy.desc')}</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-talklink-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-share-alt text-talklink-500 text-2xl"></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('features.sharing.title')}</h3>
              <p className="text-slate-300">{t('features.sharing.desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Install App Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="https://2talklink.com/?utm_source=preview-app&utm_medium=fab&utm_campaign=free-tool" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-talklink-500 hover:bg-talklink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center space-x-2"
          data-testid="button-install-app"
        >
          <i className="fas fa-mobile-alt"></i>
          <span className="hidden sm:inline font-medium">Install App</span>
        </a>
      </div>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700 py-8 px-4 mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400 text-sm mb-4">
            {t('footer.privacy')}
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-talklink-400">Privacy Policy</a>
            <a href="#" className="text-slate-400 hover:text-talklink-400">Terms</a>
            <a 
              href="https://2talklink.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-talklink-400"
            >
              {t('footer.poweredBy')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
