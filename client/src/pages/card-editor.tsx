import React from "react";
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BusinessCardComponent } from "@/components/business-card";
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
  });

  const [shareUrl, setShareUrl] = useState("");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Fetch template data if template parameter is provided
  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
    enabled: !!selectedTemplateId,
  });
  
  // Load existing card if editing
  const { data: existingCard, isLoading } = useQuery({
    queryKey: ['/api/business-cards', params.id],
    queryFn: async () => {
      if (!params.id) return null;
      const response = await apiRequest('GET', `/api/business-cards/${params.id}`);
      return await response.json();
    },
    enabled: !!params.id,
  });

  // Apply template when templates load and we have a template parameter
  useEffect(() => {
    if (selectedTemplateId && templates && !existingCard) {
      const selectedTemplate = templates.find((t: any) => t.id === selectedTemplateId);
      if (selectedTemplate) {
        setCardData(prev => ({
          ...prev,
          template: selectedTemplate.id,
          brandColor: selectedTemplate.brandColor || prev.brandColor,
          accentColor: selectedTemplate.accentColor || prev.accentColor,
          backgroundColor: selectedTemplate.backgroundColor || prev.backgroundColor,
          textColor: selectedTemplate.textColor || prev.textColor,
          font: selectedTemplate.font || prev.font,
        }));
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

  // Auto-save functionality
  useEffect(() => {
    // Don't auto-save if this is the initial load or if we don't have required fields
    if (!cardData.fullName || !cardData.title || !params.id) {
      return;
    }

    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new timeout for auto-save (2 seconds after last change)
    const timeout = setTimeout(() => {
      saveMutation.mutate(cardData);
    }, 2000);

    setAutoSaveTimeout(timeout);

    // Cleanup timeout on unmount
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [cardData, params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateShareUrl = (card: any) => {
    if (card.shareSlug) {
      setShareUrl(`${window.location.origin}/cards/${card.shareSlug}`);
    }
  };

  // Save card mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BusinessCard) => {
      let response;
      if (params.id) {
        response = await apiRequest('PUT', `/api/business-cards/${params.id}`, data);
      } else {
        response = await apiRequest('POST', '/api/business-cards', data);
      }
      return await response.json();
    },
    onSuccess: (savedCard) => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      
      // Update share URL and redirect to edit mode if creating
      updateShareUrl(savedCard);
      if (!params.id && savedCard.id) {
        setLocation(`/cards/${savedCard.id}/edit`);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to auto-save card. Please try again.",
        variant: "destructive",
      });
    },
  });


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
              onDataChange={(data) => setCardData(data)}
              onGenerateQR={() => {}}
            />
            
            {/* Auto-save indicator */}
            <div className="mt-6 flex justify-center">
              <div className="flex items-center space-x-2 text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${saveMutation.isPending ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                <span className="text-sm">
                  {saveMutation.isPending ? 'Saving...' : 'All changes saved'}
                </span>
              </div>
            </div>
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
              {/* Phone Frame */}
              <div className="relative bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-black rounded-[2.5rem] p-1">
                  <div className="bg-white rounded-[2rem] overflow-hidden">
                    {/* Phone Screen */}
                    <div className="relative h-[640px] overflow-y-auto scrollbar-hide">
                      {/* Status Bar */}
                      <div className="absolute top-0 left-0 right-0 h-8 bg-black rounded-t-[2rem] z-10">
                        <div className="flex items-center justify-between px-6 h-full text-white text-xs">
                          <span className="font-semibold">9:41</span>
                          <div className="flex items-center space-x-1">
                            <div className="w-4 h-2 border border-white rounded-sm">
                              <div className="w-3 h-1 bg-white rounded-sm m-0.5"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Card Content */}
                      <div 
                        ref={cardRef}
                        className="pt-8 pb-4 px-4 h-full"
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                        }}
                      >
                        <BusinessCardComponent data={cardData} />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-600 rounded-full"></div>
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