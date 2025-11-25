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
  
  // Get template from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const selectedTemplateId = urlParams.get('template');
  
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

  const [shareUrl, setShareUrl] = useState("");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [currentPageId, setCurrentPageId] = useState<string>('home');
  const [cardId, setCardId] = useState<string | null>(params.id || null);

  // Helper function to update share URL
  const updateShareUrl = (card: any) => {
    if (card.customUrl) {
      setShareUrl(`${window.location.origin}/${card.customUrl}`);
    } else if (card.shareSlug) {
      setShareUrl(`${window.location.origin}/${card.shareSlug}`);
    }
  };

  // Save card mutation - declared before useEffects that depend on it
  const saveMutation = useMutation({
    mutationFn: async (data: BusinessCard) => {
      // apiRequest already handles errors and returns parsed JSON
      if (cardId) {
        return await apiRequest('PUT', `/api/business-cards/${cardId}`, data);
      } else {
        return await apiRequest('POST', '/api/business-cards', data);
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
      setCardData(existingCard);
      updateShareUrl(existingCard);
    }
  }, [existingCard]);

  // Smooth auto-save with debouncing - saves changes automatically after 2 seconds of inactivity
  useEffect(() => {
    // Don't auto-save if:
    // 1. User is not authenticated
    // 2. Save is already in progress (mutation pending)
    // 3. We're creating a new card but haven't entered basic info
    if (!user || saveMutation.isPending) return;
    if (!cardId && !cardData.fullName) return;
    if (!cardData.fullName && !cardData.title) return;
    
    // Clear previous timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    // Set new timeout for auto-save (2 seconds)
    const timeout = setTimeout(() => {
      saveMutation.mutate(cardData);
    }, 2000);
    
    setAutoSaveTimeout(timeout);
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [cardData, user, cardId, saveMutation.isPending]);

  const copyShareUrl = async () => {
    if (shareUrl) {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Share URL has been copied to clipboard.",
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
              {shareUrl && (
                <>
                  <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                    {shareUrl}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyShareUrl}
                    className="bg-blue-100 hover:bg-blue-200 text-blue-700"
                    data-testid="button-copy-url"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleShare}
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={downloadVCard}
                    className="bg-green-100 hover:bg-green-200 text-green-700"
                    data-testid="button-download-vcard"
                  >
                    <i className="fas fa-download w-4 h-4 mr-1"></i>
                    Save Contact
                  </Button>
                </>
              )}
              
              <Button
                variant="outline" 
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                data-testid="button-card-url"
              >
                <i className="fas fa-link w-4 h-4 mr-1"></i>
                Card URL
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
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
                    {(cardData as any).currentPreviewMode === 'page' && getCurrentPageData() ? (
                      <PagePreview 
                        pageData={getCurrentPageData()}
                        cardData={cardData}
                        elementSpacing={(cardData as any).elementSpacing || 16}
                        individualElementSpacing={(cardData as any).individualElementSpacing || {}}
                        onNavigatePage={handleNavigatePage}
                      />
                    ) : (
                      <BusinessCardComponent 
                        data={cardData} 
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