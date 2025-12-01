import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toPng } from "html-to-image";
import { BusinessCard } from "@shared/schema";
import { FormBuilder } from "@/components/form-builder";
import { BusinessCardComponent } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateShareUrl, copyToClipboard, logEvent } from "@/lib/share";
import { useToast } from "@/hooks/use-toast";
import { defaultCardData } from "@/lib/card-data";
import { WalletButtons } from "@/components/WalletButtons";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useUserPlan } from "@/hooks/useUserPlan";
import { PlanRequiredOverlay } from "@/components/PlanRequiredOverlay";

interface BuilderProps {
  cardId?: string;
}

export const Builder = ({ cardId }: BuilderProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [cardData, setCardData] = useState<BusinessCard>(defaultCardData);
  const [showQR, setShowQR] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Plan access check - mandatory plan selection
  const { isPlanAssigned, isAdmin, isLoading: planLoading } = useUserPlan();

  // Load card data from database if cardId is provided
  const { data: loadedCard, isLoading } = useQuery<BusinessCard>({
    queryKey: ['/api/business-cards', cardId],
    enabled: !!cardId,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  // Initialize card data when loaded from database
  useEffect(() => {
    if (loadedCard) {
      setCardData(loadedCard);
    }
  }, [loadedCard]);

  // Auto-save mutation
  const saveCardMutation = useMutation({
    mutationFn: async (data: BusinessCard) => {
      if (!cardId) return null;
      
      return apiRequest('PATCH', `/api/business-cards/${cardId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards', cardId] });
      setIsSaving(false);
    },
    onError: (error: any) => {
      console.error('Auto-save failed:', error);
      setIsSaving(false);
    },
  });

  // Auto-save to database (debounced)
  useEffect(() => {
    if (!cardId || !cardData.fullName) return;
    
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      saveCardMutation.mutate(cardData);
    }, 2000); // 2 second debounce

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [cardData, cardId]);

  const handleDataChange = useCallback((newData: BusinessCard) => {
    setCardData(newData);
  }, []);

  const handleGenerateQR = () => {
    setShowQR(true);
    logEvent("generate_qr");
  };

  if (isLoading || planLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-talklink-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading card...</p>
        </div>
      </div>
    );
  }

  // Show plan selection overlay if user has no plan assigned (admins bypass this)
  if (!isAdmin && !isPlanAssigned) {
    return <PlanRequiredOverlay />;
  }

  const handleExportPNG = async () => {
    if (!cardRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `business-card-${cardData.fullName?.replace(/\s+/g, '-').toLowerCase() || 'preview'}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logEvent("export_png");
      toast({
        title: "Card exported successfully!",
        description: "Your business card has been saved as PNG",
      });
    } catch (error) {
      console.error("Export failed:", error);
      toast({
        title: "Export failed",
        description: "Failed to export your business card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareCard = async () => {
    const shareUrl = generateShareUrl(cardData);
    const success = await copyToClipboard(shareUrl);

    if (success) {
      logEvent("share_link");
      toast({
        title: t("message.linkCopied"),
        description: "You can now share this link with others",
      });
    } else {
      toast({
        title: "Failed to copy link",
        description: "Please copy the URL manually from your browser",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Form Builder */}
          <div className="space-y-6">
            {isSaving && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-talklink-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-talklink-500"></div>
                  <span>Auto-saving changes...</span>
                </div>
              </div>
            )}
            <FormBuilder
              cardData={cardData}
              onDataChange={handleDataChange}
              onGenerateQR={handleGenerateQR}
            />
          </div>

          {/* Right Column: Live Preview */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center text-white">
                  <i className="fas fa-eye text-talklink-500 mr-3"></i>
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Card Preview Container - Professional Mobile Frame */}
                <div className="flex justify-center">
                  <div className="relative">
                    {/* Mobile Frame with Custom Image as Background */}
                    <div 
                      className="relative w-[430px] h-[800px] bg-cover bg-center bg-no-repeat shadow-2xl z-99999999"
                      style={{
                        backgroundImage: `url(/mobile-frame.png)`,
                        backgroundSize: 'contain'
                      }}
                    >
                      {/* Screen Content Area */}
                      <div className="absolute top-[160px] left-[50px] right-[52px] bottom-[165px] overflow-hidden rounded-[50px]">
                        <div className="h-full overflow-y-auto">
                          <BusinessCardComponent
                            ref={cardRef}
                            data={cardData}
                            showQR={showQR}
                            isInteractive={true}
                            isMobilePreview={true}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Actions */}
                <div className="space-y-3">
                  <Button
                    onClick={handleExportPNG}
                    disabled={isExporting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                    data-testid="button-export-png"
                  >
                    <i className="fas fa-download mr-2"></i>
                    {isExporting ? "Exporting..." : t('action.downloadPNG')}
                  </Button>
                  
                  <Button
                    onClick={handleShareCard}
                    className="w-full bg-talklink-500 hover:bg-talklink-600 text-white py-3"
                    data-testid="button-share-card"
                  >
                    <i className="fas fa-share-alt mr-2"></i>
                    {t('action.shareLink')}
                  </Button>
                  
                  {/* Digital Wallet Buttons */}
                  <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                    <div className="text-center mb-2">
                      <h4 className="text-xs font-medium text-slate-300 mb-1">Save to Wallet</h4>
                      <p className="text-xs text-slate-500">Add to your phone's digital wallet</p>
                    </div>
                    <WalletButtons
                      ecardId={cardData.id || ''}
                      cardData={{
                        fullName: cardData.fullName,
                        brandColor: cardData.brandColor
                      }}
                      showLabels={false}
                      size="sm"
                    />
                  </div>
                  
                  <Button
                    asChild
                    className="w-full bg-gradient-to-r from-talklink-500 to-talklink-600 hover:from-talklink-600 hover:to-talklink-700 text-white py-4 font-bold transform hover:scale-105 shadow-lg"
                    data-testid="button-get-full-card"
                  >
                    <a 
                      href="https://talkl.ink/?utm_source=preview-app&utm_medium=cta&utm_campaign=free-tool" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={() => logEvent("cta_click_upgrade")}
                    >
                      <i className="fas fa-rocket mr-2"></i>
                      {t('action.getFullCard')}
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
};
