import React from "react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BusinessCardComponent } from "@/components/business-card";
import { PagePreview } from "@/components/page-preview";
import { FormBuilder } from "@/components/form-builder";
import { Copy, Share2, Settings, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { BusinessCard } from "@shared/schema";

interface CardEditorParams {
  id?: string;
}

export default function CardEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const params = useParams() as CardEditorParams;
  const [, setLocation] = useLocation();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Check authentication first
  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (userError && !userLoading) {
      toast({
        title: "Authentication Required",
        description: "Please log in to create or edit business cards.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [userError, userLoading, setLocation, toast]);
  
  // Get template and custom URL from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const selectedTemplateId = urlParams.get('template');
  const customUrlFromTemplate = urlParams.get('url');
  
  const [cardData, setCardData] = useState<BusinessCard>({
    fullName: "",
    title: "",
    template: "minimal" as const,
    customContacts: [],
    pageElements: [],
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
  });

  // Debounced cardData for preview to prevent flickering
  const [debouncedCardData, setDebouncedCardData] = useState<BusinessCard>(cardData);
  const previewDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Use ref to track latest cardData to avoid stale closures in auto-save
  const latestCardDataRef = useRef<BusinessCard>(cardData);

  const [shareUrl, setShareUrl] = useState("");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('home');
  const [cardId, setCardId] = useState<string | null>(params.id || null);
  const [customUrlSlug, setCustomUrlSlug] = useState<string>(customUrlFromTemplate || "");

  // Helper function to update share URL
  const updateShareUrl = (card: any) => {
    if (card.customUrl) {
      setShareUrl(`${window.location.origin}/${card.customUrl}`);
    } else if (card.shareSlug) {
      setShareUrl(`${window.location.origin}/${card.shareSlug}`);
    } else if (card.id) {
      // Fallback: use cardId to generate a default shareUrl
      setShareUrl(`${window.location.origin}/${card.id}`);
    }
  };

  // Save card mutation - declared before useEffects that depend on it
  const saveMutation = useMutation({
    mutationFn: async (data: BusinessCard) => {
      // Include custom URL slug if provided
      const dataToSave = {
        ...data,
        ...(customUrlSlug && { customUrl: customUrlSlug })
      };
      
      // Convert pages structure to pageElements for database storage
      // In card mode: FormBuilder stores elements directly in pageElements
      // In page mode: FormBuilder stores elements in pages[].elements
      // Database always expects flat pageElements array
      
      let pageElementsToSave = (dataToSave.pageElements || []) as any[];
      
      // If pageElements is empty, try to extract from pages (page mode)
      if (pageElementsToSave.length === 0) {
        const allElements: any[] = [];
        const pages = (dataToSave as any).pages || [];
        if (Array.isArray(pages)) {
          pages.forEach((page: any) => {
            if (Array.isArray(page.elements)) {
              allElements.push(...page.elements);
            }
          });
        }
        pageElementsToSave = allElements;
      }
      
      // Build final data without pages field (server only needs pageElements)
      const finalData = {
        ...dataToSave,
        pageElements: pageElementsToSave,
        pages: null, // Remove pages field - it's FormBuilder internal only
        menu: null,   // Also clean up other FormBuilder-only fields
        currentPreviewMode: undefined,
        currentSelectedPage: undefined
      };
      
      console.log('[CardEditor] Saving card with', finalData.pageElements?.length || 0, 'page elements:', finalData.pageElements);
      
      // apiRequest already handles errors and returns parsed JSON
      if (cardId) {
        return await apiRequest('PUT', `/api/business-cards/${cardId}`, finalData);
      } else {
        return await apiRequest('POST', '/api/business-cards', finalData);
      }
    },
    onSuccess: (savedCard) => {
      if (!savedCard) return; // Prevent duplicate saves
      
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      
      // Update share URL but DON'T redirect to avoid disrupting design work
      updateShareUrl(savedCard);
      
      // Update the card ID if creating new card
      if (!cardId && savedCard.id) {
        setCardId(savedCard.id);
        window.history.replaceState(null, '', `/card-editor/${savedCard.id}`);
      }
      
      // Silent auto-save - no toast notification to avoid interruptions
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      // Don't show error toast for auto-save - just log it
    },
  });
  
  // Helper function to get current page data based on currentPageId
  const getCurrentPageData = () => {
    const pages = (cardData as any).pages || [];
    const page = pages.find((p: any) => p.id === currentPageId);
    if (page) {
      return {
        id: page.id,
        label: page.label,
        elements: page.elements || []
      };
    }
    // Return the currentSelectedPage from FormBuilder as fallback
    return (cardData as any).currentSelectedPage;
  };
  
  // Enhanced navigation function that switches to page mode and sets the page
  const handleNavigatePage = (pageId: string) => {
    setCurrentPageId(pageId);
    // Update the card data to switch to page preview mode with the specific page
    const pages = (cardData as any).pages || [];
    const targetPage = pages.find((p: any) => p.id === pageId);
    if (targetPage) {
      setCardData(prev => ({
        ...prev,
        currentPreviewMode: 'page',
        currentSelectedPage: {
          id: targetPage.id,
          label: targetPage.label,
          elements: targetPage.elements || []
        }
      }));
    }
  };

  // Function to go back from page preview to main card view
  const handleBackToCard = () => {
    setCurrentPageId('home');
    setCardData(prev => ({
      ...prev,
      currentPreviewMode: 'card',
      currentSelectedPage: undefined
    }));
  };
  
  // Fetch template data if template parameter is provided
  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
    enabled: !!selectedTemplateId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
  
  // Load existing card if editing
  const { data: existingCard, isLoading } = useQuery({
    queryKey: ['/api/business-cards', params.id],
    queryFn: async () => {
      if (!params.id) return null;
      return await apiRequest('GET', `/api/business-cards/${params.id}`);
    },
    enabled: !!params.id,
  });

  // Apply template when templates load and we have a template parameter
  useEffect(() => {
    if (selectedTemplateId && templates && !existingCard) {
      const selectedTemplate = templates.find((t: any) => t.id === selectedTemplateId);
      console.log('Selected template ID:', selectedTemplateId);
      console.log('Found template:', selectedTemplate);
      if (selectedTemplate) {
        console.log('Applying template:', selectedTemplate.name);
        const newCardData = {
          ...cardData,
          template: selectedTemplate.id,
          fullName: selectedTemplate.defaultName || cardData.fullName,
          title: selectedTemplate.defaultTitle || cardData.title,
          brandColor: selectedTemplate.brandColor || cardData.brandColor,
          accentColor: selectedTemplate.accentColor || cardData.accentColor,
          backgroundColor: selectedTemplate.backgroundColor || cardData.backgroundColor,
          textColor: selectedTemplate.textColor || cardData.textColor,
          font: selectedTemplate.font || cardData.font,
        };
        console.log('New card data with template:', newCardData);
        setCardData(newCardData);
      }
    }
  }, [selectedTemplateId, templates, existingCard]);

  // Update form data when existing card loads
  useEffect(() => {
    if (existingCard) {
      // Convert database format (pageElements) to FormBuilder format (pages[].elements)
      const convertedCard = {
        ...existingCard,
        pages: existingCard.pages || [
          {
            id: "home",
            key: "home",
            path: "",
            label: "Home",
            visible: true,
            elements: existingCard.pageElements || []
          }
        ]
      };
      
      console.log('[CardEditor] Loaded card - converting pageElements to pages:', {
        pageElementsCount: existingCard.pageElements?.length || 0,
        pagesElements: convertedCard.pages[0].elements.length
      });
      
      setCardData(convertedCard);
      updateShareUrl(existingCard);
    }
  }, [existingCard]);

  // Update ref whenever cardData changes
  useEffect(() => {
    latestCardDataRef.current = cardData;
  }, [cardData]);

  // Ensure shareUrl is set whenever cardId is available
  useEffect(() => {
    if (cardId && !shareUrl) {
      setShareUrl(`${window.location.origin}/${cardId}`);
    }
  }, [cardId, shareUrl]);

  // Immediate auto-save on any interaction - saves when user clicks/changes anything
  useEffect(() => {
    // Don't auto-save if:
    // 1. User is not authenticated
    // 2. Save is already in progress (mutation pending)
    // 3. We're creating a new card and have no content at all (customUrl OR name/title required)
    if (!user || saveMutation.isPending) return;
    if (!cardId && !customUrlSlug && !cardData.fullName && !cardData.title) return;
    
    // Clear previous timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save (100ms minimum to batch very quick changes)
    const timeout = setTimeout(() => {
      // Use ref to get the LATEST cardData including newly added elements
      // This prevents stale data from closures
      const dataToSave = latestCardDataRef.current;
      console.log('[CardEditor] Auto-save: Saving with', dataToSave.pageElements?.length || 0, 'elements:', dataToSave.pageElements);
      saveMutation.mutate(dataToSave);
    }, 100);
    
    setAutoSaveTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [cardData, user, cardId, saveMutation.isPending]);

  // Debounce cardData updates for preview to prevent flickering
  useEffect(() => {
    if (previewDebounceTimeout.current) {
      clearTimeout(previewDebounceTimeout.current);
    }
    
    previewDebounceTimeout.current = setTimeout(() => {
      setDebouncedCardData(cardData);
    }, 200); // 200ms debounce for smooth preview without flicker
    
    return () => {
      if (previewDebounceTimeout.current) {
        clearTimeout(previewDebounceTimeout.current);
      }
    };
  }, [cardData]);

  const copyShareUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        
        // Extract slug and open as relative URL in new tab (works in Replit preview)
        const slug = shareUrl.split('/').pop();
        if (slug) {
          window.open(`/${slug}`, '_blank');
        }
        
        toast({
          title: "Link copied!",
          description: "URL copied to clipboard and opened in a new tab.",
        });
      } catch (err) {
        toast({
          title: "Copy failed",
          description: "Please copy the URL manually.",
          variant: "destructive",
        });
      }
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

  const downloadVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${cardData.fullName}
ORG:${cardData.company || ''}
TITLE:${cardData.title}
TEL:${cardData.phone || ''}
EMAIL:${cardData.email || ''}
URL:${cardData.website || ''}
NOTE:${cardData.about || ''}
END:VCARD`;

    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${cardData.fullName || 'contact'}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: "Contact Downloaded",
      description: "VCard file downloaded successfully. You can now add it to your contacts.",
    });
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
              <div className="text-xl font-semibold text-gray-900">
                {params.id ? 'Edit Card' : 'Create Card'}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {shareUrl ? (
                <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-orange-50 rounded-full px-6 py-3 shadow-sm border border-gray-200">
                  <div className="text-sm text-gray-700 font-medium truncate max-w-xs">
                    {shareUrl}
                  </div>
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
                  <Button
                    size="sm"
                    disabled
                    className="bg-gray-200 text-gray-400 rounded-full px-6 cursor-not-allowed"
                    data-testid="button-copy-url"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    disabled
                    className="bg-gray-200 text-gray-400 rounded-full px-6 cursor-not-allowed"
                    data-testid="button-share"
                  >
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
                setCardData(data);
              }}
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
            
            {/* Mobile Phone Mockup */}
            <div className="relative mx-auto max-w-sm">
              {/* Professional Mobile Frame with CSS styling */}
              <div 
                className="relative w-[390px] mx-auto bg-gray-900 rounded-[50px] shadow-2xl overflow-hidden border-[12px] border-gray-800"
                style={{
                  aspectRatio: '9/19.5',
                }}
              >
                {/* Top Notch */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[150px] h-[28px] bg-gray-900 rounded-b-[20px] z-10"></div>
                
                {/* Screen Content Area */}
                <div className="absolute top-[10px] left-[8px] right-[8px] bottom-[10px] overflow-hidden rounded-[40px] bg-white">
                  <div 
                    ref={cardRef}
                    className="h-full overflow-y-auto"
                  >
                    {/* Check if we're in page mode by looking at current focus or form data */}
                    {(debouncedCardData as any).currentPreviewMode === 'page' && getCurrentPageData() ? (
                      <PagePreview 
                        pageData={getCurrentPageData()}
                        cardData={debouncedCardData}
                        elementSpacing={(debouncedCardData as any).elementSpacing || 16}
                        individualElementSpacing={(debouncedCardData as any).individualElementSpacing || {}}
                        onNavigatePage={handleNavigatePage}
                        onBackToCard={handleBackToCard}
                      />
                    ) : (
                      <BusinessCardComponent 
                        data={debouncedCardData} 
                        isMobilePreview={true}
                        showViewButton={true}
                        onNavigatePage={handleNavigatePage}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
            
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