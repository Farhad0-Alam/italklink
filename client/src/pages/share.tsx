import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { BusinessCard } from "@shared/schema";
import { BusinessCardComponent } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { decodeCardData, logEvent } from "@/lib/share";
import { defaultCardData } from "@/lib/card-data";
import { BusinessCardPWAInstaller } from "@/components/BusinessCardPWAInstaller";
import { SEOHead } from "@/components/SEOHead";
import { useButtonTracking } from "@/modules/automation/useButtonTracking";

export const Share: React.FC = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [cardData, setCardData] = useState<BusinessCard>(defaultCardData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { trackPageView } = useButtonTracking();

  useEffect(() => {
    const loadCardData = async () => {
      const hash = window.location.hash.slice(1);
      const pathParts = location.split('/');
      const shareSlug = pathParts[1]; // Get the slug from URL like domain.com/customname
      
      // Try to load by shareSlug first (for clean URLs)
      if (shareSlug && shareSlug !== 'share' && !hash) {
        try {
          const response = await fetch(`/api/business-cards/slug/${shareSlug}`);
          if (response.ok) {
            const cardData = await response.json();
            setCardData(cardData);
            logEvent("share_view");
            // Track page view for automation
            if (cardData.id) {
              trackPageView(cardData.id, 'page_view', window.location.href);
            }
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error("Failed to load card by slug:", error);
        }
      }
      
      // Fallback to hash-based sharing
      if (hash) {
        try {
          const decodedData = decodeCardData(hash);
          if (decodedData) {
            setCardData(decodedData);
            logEvent("share_view");
            // Track page view for automation (hash-based sharing)
            if (decodedData.id) {
              trackPageView(decodedData.id, 'page_view', window.location.href);
            }
          } else {
            setError("Invalid share link");
          }
        } catch (error) {
          console.error("Failed to decode card data:", error);
          setError("Failed to load shared card");
        }
      } else {
        setError("No card data found in URL");
      }
      
      setIsLoading(false);
    };
    
    loadCardData();
  }, [location]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talklink-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading shared card...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Card Not Found</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <Button
              asChild
              className="bg-talklink-500 hover:bg-talklink-600"
              data-testid="button-create-own-card"
            >
              <a href="/builder">Create Your Own Card</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 md:bg-slate-900">
      {/* Dynamic SEO Head Component */}
      <SEOHead cardData={cardData} />
      
      <div className="w-full max-w-[470px] mx-auto px-0 py-0 md:px-4 md:py-8 sm:px-6 lg:px-8">
        {/* Shared Card Display - Mobile Responsive Layout */}
        <div className="flex justify-center">
          <div className="w-full">
            <BusinessCardComponent
              data={cardData}
              showQR={true}
              isInteractive={true}
            />
          </div>
        </div>
        
        
        {/* PWA Install Button */}
        <BusinessCardPWAInstaller cardData={cardData} />
      </div>
    </div>
  );
};
