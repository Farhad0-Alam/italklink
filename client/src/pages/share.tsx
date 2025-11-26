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
import { Share2, Copy, MessageCircle, Facebook, Twitter, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const Share: React.FC = () => {
  const { t } = useTranslation();
  const [location] = useLocation();
  const [cardData, setCardData] = useState<BusinessCard>(defaultCardData);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('home');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const { trackPageView } = useButtonTracking();
  const { toast } = useToast();

  const handlePageNavigation = (pageId: string) => {
    setCurrentPageId(pageId);
  };

  const handleBackFromPage = () => {
    setCurrentPageId('home');
  };

  const handleShare = async (platform?: string) => {
    const url = window.location.href;
    const text = `Check out ${cardData.fullName || 'this'}'s business card`;

    if (platform === "copy") {
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link copied!",
          description: "Business card link copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Please copy the link manually",
          variant: "destructive",
        });
      }
      setShowShareMenu(false);
      return;
    }

    let shareUrl_platform = "";
    switch (platform) {
      case "facebook":
        shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl_platform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      case "whatsapp":
        shareUrl_platform = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
        break;
      default:
        if (navigator.share) {
          try {
            await navigator.share({
              title: text,
              url: url,
            });
          } catch (err) {
            console.log("Share cancelled");
          }
        } else {
          await handleShare("copy");
        }
        setShowShareMenu(false);
        return;
    }

    if (shareUrl_platform) {
      window.open(shareUrl_platform, "_blank", "width=600,height=400");
      setShowShareMenu(false);
    }
  };

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
            console.log('[Share] Loaded card with', cardData.pageElements?.length || 0, 'page elements');
            setCardData(cardData);
            setCurrentPageId('home'); // Reset to home page when loading
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
            setCurrentPageId('home'); // Reset to home page when loading
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
      
      <div className="w-full max-w-[400px] mx-auto px-4 py-0">
        {/* Premium Mobile Card Layout - 400px max-width centered container */}
        <div className="flex justify-center">
          <div className="w-full">
            <BusinessCardComponent
              data={cardData}
              showQR={true}
              isInteractive={true}
              onNavigatePage={handlePageNavigation}
            />
          </div>
        </div>
        
        
        {/* PWA Install Button */}
        <BusinessCardPWAInstaller cardData={cardData} />
      </div>

      {/* Floating Share Button - Bottom Right */}
      <div className="fixed bottom-6 right-6 z-50">
        <div className="relative">
          <Button
            onClick={() => setShowShareMenu(!showShareMenu)}
            size="lg"
            className="w-14 h-14 rounded-full p-0 bg-talklink-500 hover:bg-talklink-600 text-white shadow-lg"
            data-testid="button-floating-share"
          >
            <Share2 className="h-6 w-6" />
          </Button>

          {/* Share Menu Popup */}
          {showShareMenu && (
            <div className="absolute bottom-full right-0 mb-3 bg-white rounded-lg shadow-xl border border-slate-200 p-2 min-w-48">
              <div className="space-y-1">
                <Button
                  onClick={() => handleShare("copy")}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  data-testid="button-share-copy"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  onClick={() => handleShare("whatsapp")}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  data-testid="button-share-whatsapp"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp
                </Button>
                <Button
                  onClick={() => handleShare("facebook")}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  data-testid="button-share-facebook"
                >
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button
                  onClick={() => handleShare("twitter")}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  data-testid="button-share-twitter"
                >
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button
                  onClick={() => handleShare("linkedin")}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  data-testid="button-share-linkedin"
                >
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
                <hr className="my-1" />
                <Button
                  onClick={() => handleShare()}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-gray-700 hover:bg-gray-50"
                  data-testid="button-share-more"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  More Options
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
