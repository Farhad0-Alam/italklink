import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { BusinessCard } from "@shared/schema";
import { BusinessCardComponent } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { decodeCardData, logEvent } from "@/lib/share";
import { defaultCardData } from "@/lib/card-data";

export const Share: React.FC = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [cardData, setCardData] = useState<BusinessCard>(defaultCardData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    
    if (hash) {
      try {
        const decodedData = decodeCardData(hash);
        if (decodedData) {
          setCardData(decodedData);
          logEvent("share_view");
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
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Shared Digital Business Card</h1>
          <p className="text-slate-300">View and connect with this professional</p>
        </div>
        
        {/* Shared Card Display */}
        <div className="mb-8 flex justify-center">
          <BusinessCardComponent
            data={cardData}
            showQR={true}
            isInteractive={true}
          />
        </div>
        
        {/* CTA Banner */}
        <Card className="bg-gradient-to-r from-talklink-500 to-talklink-600 border-0 text-white">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-bold mb-2">Want your own smart business card?</h3>
            <p className="mb-4 opacity-90">Create unlimited cards, track analytics, and more with 2TalkLink</p>
            <Button
              asChild
              className="bg-white text-talklink-600 hover:bg-slate-100 font-semibold"
              data-testid="button-get-started"
              onClick={() => logEvent("cta_click_share_page")}
            >
              <a 
                href="https://2talklink.com/?utm_source=preview-app&utm_medium=cta&utm_campaign=free-tool" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                Get Started Free
              </a>
            </Button>
          </CardContent>
        </Card>

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
      </div>
    </div>
  );
};
