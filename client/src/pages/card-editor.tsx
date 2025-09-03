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
  });

  const [shareUrl, setShareUrl] = useState("");
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  
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
      const response = await apiRequest('GET', `/api/business-cards/${params.id}`);
      return await response.json();
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

  // Auto-save functionality - disabled to prevent page interruptions
  // useEffect(() => {
  //   // Don't auto-save if we don't have required fields or user is not authenticated
  //   if (!cardData.fullName || !cardData.title || !user) {
  //     return;
  //   }

  //   // Clear existing timeout
  //   if (autoSaveTimeout) {
  //     clearTimeout(autoSaveTimeout);
  //   }

  //   // Set new timeout for auto-save (2 seconds after last change)
  //   const timeout = setTimeout(() => {
  //     console.log('Auto-saving card data:', cardData);
  //     saveMutation.mutate(cardData);
  //   }, 2000);

  //   setAutoSaveTimeout(timeout);

  //   // Cleanup timeout on unmount
  //   return () => {
  //     if (timeout) {
  //       clearTimeout(timeout);
  //     }
  //   };
  // }, [cardData, params.id, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateShareUrl = (card: any) => {
    if (card.customUrl) {
      setShareUrl(`${window.location.origin}/${card.customUrl}`);
    } else if (card.shareSlug) {
      setShareUrl(`${window.location.origin}/${card.shareSlug}`);
    }
  };

  // Save card mutation
  const saveMutation = useMutation({
    mutationFn: async (data: BusinessCard) => {
      console.log('=== SAVE MUTATION STARTED ===');
      console.log('Saving business card:', data);
      console.log('User ID:', user?.id);
      console.log('Params ID:', params.id);
      
      try {
        let response;
        if (params.id) {
          console.log('Updating existing card...');
          response = await apiRequest('PUT', `/api/business-cards/${params.id}`, data);
        } else {
          console.log('Creating new card...');
          response = await apiRequest('POST', '/api/business-cards', data);
        }
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Save failed - Response text:', errorText);
          throw new Error(`Save failed: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Save result:', result);
        console.log('=== SAVE MUTATION SUCCESS ===');
        return result;
      } catch (error) {
        console.error('=== SAVE MUTATION ERROR ===');
        console.error('Error details:', error);
        throw error;
      }
    },
    onSuccess: (savedCard) => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      
      // Update share URL but DON'T redirect to avoid disrupting design work
      updateShareUrl(savedCard);
      
      // Update the URL without page reload if creating new card
      if (!params.id && savedCard.id) {
        window.history.replaceState(null, '', `/card-editor/${savedCard.id}`);
      }
      
      toast({
        title: "Card saved!",
        description: "Your business card has been saved successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Save error:', error);
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save card. Please check your login status and try again.",
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
              onDataChange={(data) => setCardData(data)}
              onGenerateQR={() => {}}
            />
            
            {/* Save Card Button */}
            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    console.log('Save button clicked, cardData:', cardData);
                    console.log('User:', user);
                    console.log('Is user authenticated:', !!user);
                    if (!user) {
                      toast({
                        title: "Please log in",
                        description: "You need to be logged in to save business cards.",
                        variant: "destructive",
                      });
                      return;
                    }
                    if (!cardData.fullName || !cardData.title) {
                      toast({
                        title: "Missing information",
                        description: "Please fill in your name and title before saving.",
                        variant: "destructive",
                      });
                      return;
                    }
                    saveMutation.mutate(cardData);
                  }}
                  disabled={saveMutation.isPending}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-2"
                  data-testid="button-save-card"
                >
                  {saveMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save mr-2"></i>
                      {params.id ? 'Update Card' : 'Save Card'}
                    </>
                  )}
                </Button>
              </div>
              
              {/* Auto-save indicator */}
              <div className="flex justify-center">
                <div className="flex items-center space-x-2 text-slate-600 bg-slate-100 px-4 py-2 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${saveMutation.isPending ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`}></div>
                  <span className="text-sm">
                    {saveMutation.isPending ? 'Saving...' : 'Auto-save enabled'}
                  </span>
                </div>
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
              {/* Professional Mobile Frame */}
              <div 
                className="relative w-[300px] h-[600px] bg-cover bg-center bg-no-repeat shadow-2xl"
                style={{
                  backgroundImage: `url(/mobile-frame.png)`,
                  backgroundSize: 'contain'
                }}
              >
                {/* Screen Content Area */}
                <div className="absolute top-[50px] left-[20px] right-[20px] bottom-[50px] bg-white overflow-hidden rounded-[20px]">
                  <div 
                    ref={cardRef}
                    className="h-full overflow-y-auto"
                  >
                    <BusinessCardComponent 
                      data={cardData} 
                      isMobilePreview={true}
                    />
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