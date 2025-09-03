import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { toPng } from "html-to-image";
import { BusinessCard } from "@shared/schema";
import { FormBuilder } from "@/components/form-builder";
import { BusinessCardComponent } from "@/components/business-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage } from "@/lib/storage";
import { generateShareUrl, copyToClipboard, logEvent } from "@/lib/share";
import { useToast } from "@/hooks/use-toast";
import { defaultCardData } from "@/lib/card-data";
import { WalletButtons } from "@/components/WalletButtons";

export const Builder = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardData, setCardData] = useState<BusinessCard>(() => storage.loadCardData());
  const [showQR, setShowQR] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      storage.saveCardData(cardData);
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [cardData]);

  const handleDataChange = useCallback((newData: BusinessCard) => {
    setCardData(newData);
  }, []);

  const handleGenerateQR = () => {
    setShowQR(true);
    logEvent("generate_qr");
  };

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
                      className="relative w-[400px] h-[800px] bg-cover bg-center bg-no-repeat shadow-2xl"
                      style={{
                        backgroundImage: `url(/mobile-frame.png)`,
                        backgroundSize: 'contain'
                      }}
                    >
                      {/* Screen Content Area */}
                      <div className="absolute top-[100px] left-[35px] right-[35px] bottom-[100px] overflow-hidden rounded-[30px]">
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
                      href="https://2talklink.com/?utm_source=preview-app&utm_medium=cta&utm_campaign=free-tool" 
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
  );
};
