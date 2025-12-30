import React from "react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BusinessCardComponent } from "@/components/business-card";
import { PagePreview } from "@/components/page-preview";
import { FormBuilder } from "@/components/form-builder";
import { AutoSaveIndicator } from "@/components/AutoSaveIndicator";
import { useAutoSave } from "@/contexts/AutoSaveContext";
import { Copy, Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { BusinessCard } from "@shared/schema";

interface CardEditorParams {
  id?: string;
}

export default function CardEditor() {
  const { toast } = useToast();
  const params = useParams() as CardEditorParams;
  const [, setLocation] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);

  const hasHydratedRef = useRef(false);

  const {
    queueSave,
    saveNow,
    setCardId: setAutoSaveCardId,
    status: autoSaveStatus,
    lastSavedCard,
  } = useAutoSave();

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useEffect(() => {
    if (userError && !userLoading) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create or edit business cards.",
        variant: "destructive",
      });
      setLocation("/login");
    }
  }, [userError, userLoading, setLocation, toast]);

  const urlParams = new URLSearchParams(window.location.search);
  const selectedTemplateId = urlParams.get("template");
  const customUrlFromTemplate = urlParams.get("url");

  // Counter for generating unique IDs within the same render cycle
  let profileElementIdCounter = 0;

  // Function to create a profile element with guaranteed unique ID and complete default data
  const createProfileElement = () => {
    profileElementIdCounter++;
    const uniqueId =
      typeof crypto !== "undefined" && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `profile-${Date.now()}-${profileElementIdCounter}-${Math.random()
            .toString(36)
            .substring(2, 11)}`;

    return {
      id: uniqueId,
      type: "profile" as const,
      order: 0,
      visible: true,
      data: {
        enabled: true,
        showCoverImage: true,
        showProfilePhoto: true,
        showLogo: true,
        showName: true,
        showTitle: true,
        showCompany: true,
        fullName: "",
        title: "",
        company: "",
        profilePhoto: null,
        coverImage: null,
        brandColor: "#22c55e",
        accentColor: "#16a34a",
        profileImageStyles: {
          visible: true,
          size: 120,
          shape: "circle",
          borderWidth: 3,
          borderColor: "#22c55e",
          animation: "none",
          useBrandColor: true,
          animationColors: { start: "#22c55e", end: "#16a34a" },
          shadow: 0,
          opacity: 100,
        },
        coverImageStyles: {
          height: 200,
          borderWidth: 0,
          borderColor: "#22c55e",
          animation: "none",
          profilePositionX: 50,
          profilePositionY: 100,
          shapeDividerTop: {
            enabled: false,
            preset: "wave",
            color: "#ffffff",
            width: 100,
            height: 60,
            invert: false,
          },
          shapeDividerBottom: {
            enabled: false,
            preset: "wave",
            color: "#ffffff",
            width: 100,
            height: 60,
            invert: false,
          },
        },
        sectionStyles: {
          basicInfo: {
            nameColor: "#ffffff",
            nameFont: "Inter",
            nameFontSize: 24,
            nameFontWeight: "700",
            nameTextStyle: "normal",
            nameSpacing: 8,
            namePositionX: 0,
            namePositionY: 0,
            titleColor: "#4b5563",
            titleFont: "Inter",
            titleFontSize: 14,
            titleFontWeight: "400",
            titleTextStyle: "normal",
            titleSpacing: 8,
            titlePositionX: 0,
            titlePositionY: 0,
            companyColor: "#6b7280",
            companyFont: "Inter",
            companyFontSize: 14,
            companyFontWeight: "400",
            companyTextStyle: "normal",
            companySpacing: 8,
            companyPositionX: 0,
            companyPositionY: 0,
            textGroupHorizontal: 0,
            textGroupVertical: 0,
          },
        },
      },
    };
  };

  // Create separate profile elements for pageElements and pages to avoid shared references
  const initialProfileElement = createProfileElement();
  const homePageProfileElement = createProfileElement();

  const [cardData, setCardData] = useState<BusinessCard>({
    fullName: "",
    title: "",
    template: "minimal" as const,
    customContacts: [],
    pageElements: [initialProfileElement],
    customSocials: [],
    galleryImages: [],
    availableIcons: [],
    company: "",
    about: "",
    phone: "",
    email: "",
    website: "",
    location: "",
    brandColor: "#22c55e",
    accentColor: "#16a34a",
    font: "inter",
    elementSpacing: 16,
    individualElementSpacing: {},
    pages: [
      {
        id: "home",
        key: "home",
        path: "",
        label: "Home",
        visible: true,
        elements: [homePageProfileElement],
      },
    ] as any,
  });

  const [shareUrl, setShareUrl] = useState("");
  const [currentPageId, setCurrentPageId] = useState<string>("home");
  const [customUrlSlug, setCustomUrlSlug] = useState<string>(customUrlFromTemplate || "");

  useEffect(() => {
    if (params.id) {
      setAutoSaveCardId(params.id);
    }
  }, [params.id, setAutoSaveCardId]);

  // Helper function to update share URL
  const updateShareUrl = (card: any) => {
    if (card.customUrl) {
      setShareUrl(`${window.location.origin}/${card.customUrl}`);
    } else if (card.shareSlug) {
      setShareUrl(`${window.location.origin}/${card.shareSlug}`);
    } else if (card.id) {
      setShareUrl(`${window.location.origin}/card/${card.id}`);
    }
  };

  const getCurrentPageData = () => {
    const pages = (cardData as any).pages || [];
    const page = pages.find((p: any) => p.id === currentPageId);
    if (page) {
      return {
        id: page.id,
        label: page.label,
        elements: page.elements || [],
      };
    }
    return (cardData as any).currentSelectedPage;
  };

  const handleNavigatePage = (pageId: string) => {
    setCurrentPageId(pageId);
    const pages = (cardData as any).pages || [];
    const targetPage = pages.find((p: any) => p.id === pageId);
    if (targetPage) {
      const isHome = pageId === "home" || targetPage.key === "home";
      setCardData((prev) => ({
        ...prev,
        currentPreviewMode: isHome ? "card" : "page",
        currentSelectedPage: isHome
          ? undefined
          : {
              id: targetPage.id,
              label: targetPage.label,
              elements: targetPage.elements || [],
            },
      }));
    }
  };

  const handleBackToCard = () => {
    setCurrentPageId("home");
    setCardData((prev) => ({
      ...prev,
      currentPreviewMode: "card",
      currentSelectedPage: undefined,
    }));
  };

  // Fetch template data if template parameter is provided
  const { data: templates } = useQuery({
    queryKey: ["/api/templates"],
    enabled: !!selectedTemplateId,
    staleTime: 1000 * 60 * 10,
  });

  // Load existing card if editing
  const { data: existingCard, isLoading } = useQuery({
    queryKey: ["/api/business-cards", params.id],
    queryFn: async () => {
      if (!params.id) return null;
      return await apiRequest("GET", `/api/business-cards/${params.id}`);
    },
    enabled: !!params.id,
  });

  // Apply template when templates load and we have a template parameter
  useEffect(() => {
    if (selectedTemplateId && templates && !existingCard) {
      const selectedTemplate = (templates as any[]).find((t: any) => t.id === selectedTemplateId);
      if (selectedTemplate) {
        const newCardData = {
          ...cardData,
          template: selectedTemplate.id,
          fullName: selectedTemplate.defaultName || cardData.fullName,
          title: selectedTemplate.defaultTitle || cardData.title,
          brandColor: selectedTemplate.brandColor || cardData.brandColor,
          accentColor: selectedTemplate.accentColor || cardData.accentColor,
          backgroundColor: selectedTemplate.backgroundColor || (cardData as any).backgroundColor,
          textColor: selectedTemplate.textColor || (cardData as any).textColor,
          font: selectedTemplate.font || cardData.font,
        };
        setCardData(newCardData);
        // allow autosave after this point (user starts editing)
        hasHydratedRef.current = true;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplateId, templates, existingCard]);

  // Update form data when existing card loads
  useEffect(() => {
    if (existingCard) {
      console.log('[CardEditor] Hydrating from existing card:', existingCard.id);

      let homePageElements = existingCard.pageElements || [];
      const additionalPages = existingCard.pages || [];

      const hasProfileElement = homePageElements.some((el: any) => el.type === "profile");
      if (!hasProfileElement && existingCard.profileSectionEnabled !== false) {
        const profileElement = { ...createProfileElement(), order: -1 };
        homePageElements = [profileElement, ...homePageElements];
        homePageElements = homePageElements.map((el: any, idx: number) => ({ ...el, order: idx }));
      }

      const allPages = [
        {
          id: "home",
          key: "home",
          path: "",
          label: "Home",
          visible: true,
          elements: homePageElements.map((el: any) => ({ ...el })),
        },
        ...additionalPages.map((page: any) => ({
          id: page.id,
          key: page.key || page.id,
          path: page.path,
          label: page.label,
          visible: page.visible !== false,
          elements: (page.elements || []).map((el: any) => ({ ...el })),
        })),
      ];

      const convertedCard = {
        ...existingCard,
        pageElements: homePageElements.map((el: any) => ({ ...el })),
        pages: allPages,
      };

      setCardData((prev) => ({
        ...(convertedCard as any),
        currentPreviewMode: prev.currentPreviewMode || "card",
        currentSelectedPage: prev.currentSelectedPage,
      }));

      updateShareUrl(existingCard);

      // allow autosave after hydration
      hasHydratedRef.current = true;
      console.log('[CardEditor] Hydration complete, autosave enabled');
    }
  }, [existingCard]);

  useEffect(() => {
    if (lastSavedCard) {
      updateShareUrl(lastSavedCard);
      // Update cardId if this was a create operation
      if (!params.id && lastSavedCard.id) {
        setAutoSaveCardId(lastSavedCard.id);
      }
    }
  }, [lastSavedCard, params.id, setAutoSaveCardId]);

  // Manual save (button / explicit)
  const triggerSave = useCallback(
    async (dataOverride?: any) => {
      if (!user) {
        toast({
          title: "Not logged in",
          description: "Please log in to save your card.",
          variant: "destructive",
        });
        return;
      }

      const dataToSave = dataOverride || cardData;

      // Validate for new cards
      if (!params.id && !customUrlSlug && !dataToSave.fullName && !dataToSave.title) {
        toast({
          title: "Cannot save",
          description: "Please provide either a custom URL or name and title.",
          variant: "destructive",
        });
        return;
      }

      try {
        await saveNow(dataToSave, customUrlSlug);
        toast({
          title: "Saved successfully",
          description: "Your card has been saved.",
        });
      } catch (error) {
        console.error('Save error:', error);
        toast({
          title: "Save failed",
          description: "Could not save your card. Please try again.",
          variant: "destructive",
        });
      }
    },
    [user, params.id, customUrlSlug, cardData, saveNow, toast]
  );

  const copyShareUrl = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copied!",
        description: "URL copied to clipboard. Use the View TalkLink button to preview.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    if (shareUrl && navigator.share) {
      navigator.share({
        title: `${cardData.fullName} - Business Card`,
        url: shareUrl,
      });
    } else {
      copyShareUrl();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with URL bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </Link>
              <div className="text-xl font-semibold text-gray-900">{params.id ? "Edit Card" : "Create Card"}</div>
              <AutoSaveIndicator />
            </div>

            <div className="flex items-center space-x-3">
              {shareUrl ? (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-full px-6 py-3 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-700 font-medium truncate max-w-xs">{shareUrl}</div>
                  <Button
                    size="sm"
                    onClick={copyShareUrl}
                    className="bg-blue-500 hover:bg-blue-600 text-white rounded-full px-6 whitespace-nowrap"
                    data-testid="button-copy-url"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleShare}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-6 whitespace-nowrap"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button size="sm" disabled className="bg-gray-200 text-gray-400 rounded-full px-6 cursor-not-allowed">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button size="sm" disabled className="bg-gray-200 text-gray-400 rounded-full px-6 cursor-not-allowed">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form Builder */}
          <div>
            <FormBuilder
              cardData={cardData}
              onDataChange={(data) => {
                const updated = {
                  ...(data as any),
                  currentPreviewMode: (cardData as any).currentPreviewMode,
                  currentSelectedPage: (cardData as any).currentSelectedPage,
                };

                setCardData(updated as any);

                // ✅ AUTOSAVE HERE
                if (!user) return;
                if (!hasHydratedRef.current) {
                  console.log('[CardEditor] Skipping autosave - not hydrated yet');
                  return;
                }
                if (!params.id && !customUrlSlug && !updated.fullName && !updated.title) {
                  console.log('[CardEditor] Skipping autosave - missing required fields for new card');
                  return;
                }

                console.log('[CardEditor] Queueing autosave');
                queueSave(updated as any, customUrlSlug);
              }}
              onSave={triggerSave}
              onGenerateQR={() => {}}
              onNavigationChange={handleNavigatePage}
            />
          </div>

          {/* Right Panel - Mobile Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Preview</h3>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Updates in real-time</span>
              </div>
            </div>

            <div className="relative mx-auto max-w-sm">
              <div
                className="relative w-[390px] mx-auto bg-gray-900 rounded-[50px] shadow-2xl overflow-hidden border-[12px] border-gray-800"
                style={{ aspectRatio: "9/19.5" }}
              >
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[28px] bg-gray-900 rounded-b-[20px] z-10"></div>

                <div className="absolute top-[10px] left-[8px] right-[8px] bottom-[10px] overflow-hidden rounded-[40px] bg-white">
                  <div ref={cardRef} className="h-full overflow-y-auto">
                    {(cardData as any).currentPreviewMode === "page" && getCurrentPageData() ? (
                      <PagePreview
                        pageData={getCurrentPageData()}
                        cardData={cardData}
                        elementSpacing={(cardData as any).elementSpacing || 16}
                        individualElementSpacing={(cardData as any).individualElementSpacing || {}}
                        onNavigatePage={handleNavigatePage}
                        onBackToCard={handleBackToCard}
                        hideBackButton={true}
                      />
                    ) : (
                      <BusinessCardComponent
                        data={cardData}
                        isMobilePreview={true}
                        showViewButton={false}
                        onNavigatePage={handleNavigatePage}
                        showInternalShareButton={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {shareUrl && (
              <div className="mt-4 flex justify-center">
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-medium transition-colors"
                  data-testid="button-view-talklink"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  View TalkLink
                </a>
              </div>
            )}

            <div className="mt-6 text-center">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></span>
                Mobile Optimized
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}