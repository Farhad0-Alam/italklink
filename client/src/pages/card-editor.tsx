import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { BusinessCardComponent } from "@/components/business-card";
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

  // Update form data when existing card loads
  useEffect(() => {
    if (existingCard) {
      setCardData(existingCard);
      updateShareUrl(existingCard);
    }
  }, [existingCard]);

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
    onSuccess: (savedCard: BusinessCard) => {
      toast({
        title: "Card saved successfully!",
        description: "Your business card has been saved.",
      });
      updateShareUrl(savedCard);
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      
      // Redirect to edit mode if this was a new card
      if (!params.id && savedCard.id) {
        setLocation(`/cards/${savedCard.id}/edit`);
      }
    },
    onError: (error: any) => {
      toast({
        title: "Save failed",
        description: error.message || "Failed to save business card.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof BusinessCard, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    saveMutation.mutate(cardData);
  };

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
            
            {shareUrl && (
              <div className="flex items-center space-x-2">
                <div className="bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-600 max-w-xs truncate">
                  {shareUrl}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyShareUrl}
                  className="bg-gray-100 hover:bg-gray-200"
                  data-testid="button-copy-url"
                >
                  <Copy className="w-4 h-4" />
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
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Profile</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={cardData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      data-testid="input-full-name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={cardData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="Your job title"
                      data-testid="input-title"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={cardData.company || ''}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                    data-testid="input-company"
                  />
                </div>

                <div>
                  <Label htmlFor="about">About Me</Label>
                  <Textarea
                    id="about"
                    value={cardData.about || ''}
                    onChange={(e) => handleInputChange('about', e.target.value)}
                    placeholder="Tell people about yourself..."
                    className="min-h-[100px]"
                    data-testid="textarea-about"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Contact Information</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={cardData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+1 234 567 8900"
                      data-testid="input-phone"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={cardData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      data-testid="input-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={cardData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      data-testid="input-website"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={cardData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, Country"
                      data-testid="input-location"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Social Media</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={cardData.linkedin || ''}
                      onChange={(e) => handleInputChange('linkedin', e.target.value)}
                      placeholder="LinkedIn profile URL"
                      data-testid="input-linkedin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="twitter">Twitter</Label>
                    <Input
                      id="twitter"
                      value={cardData.twitter || ''}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@username"
                      data-testid="input-twitter"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={cardData.instagram || ''}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@username"
                      data-testid="input-instagram"
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={cardData.whatsapp || ''}
                      onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                      placeholder="+1234567890"
                      data-testid="input-whatsapp"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !cardData.fullName || !cardData.title}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                data-testid="button-save-card"
              >
                {saveMutation.isPending ? (
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                ) : null}
                {params.id ? 'Update Card' : 'Create Card'}
              </Button>
              <Button
                variant="outline"
                className="px-6"
                data-testid="button-settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right Panel - Mobile Preview */}
          <div className="flex justify-center">
            <div className="relative">
              {/* Mobile Phone Frame */}
              <div className="relative bg-black rounded-[3rem] p-2 shadow-2xl">
                <div className="bg-white rounded-[2.5rem] overflow-hidden" style={{ width: '320px', height: '640px' }}>
                  {/* Phone Status Bar */}
                  <div className="bg-black text-white text-xs px-4 py-2 flex justify-between items-center">
                    <span>9:41</span>
                    <div className="flex space-x-1">
                      <div className="w-4 h-2 bg-white rounded-sm opacity-60"></div>
                      <div className="w-1 h-2 bg-white rounded-sm"></div>
                    </div>
                  </div>
                  
                  {/* Card Preview Container */}
                  <div className="h-full overflow-y-auto bg-gray-50 p-4">
                    <div ref={cardRef} className="transform scale-[0.85] origin-top">
                      <BusinessCardComponent
                        data={{
                          ...cardData,
                          pageElements: [],
                          galleryImages: [],
                          customContacts: [],
                          customSocials: [],
                          availableIcons: [],
                        }}
                        showQR={false}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preview Label */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <Badge variant="outline" className="bg-white">
                  Live Preview
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}