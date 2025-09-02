import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { BusinessCardComponent } from "@/components/business-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import type { BusinessCard } from "@shared/schema";

interface TemplatePreviewParams {
  templateId: string;
}

export default function TemplatePreview() {
  const params = useParams() as TemplatePreviewParams;
  const [cardData, setCardData] = useState<BusinessCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch template data
  const { data: templates } = useQuery({
    queryKey: ['/api/templates'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (templates && params.templateId) {
      const template = templates.find((t: any) => t.id === params.templateId);
      
      if (template) {
        // Use templateData if available, otherwise create sample data for preview
        if (template.templateData) {
          setCardData(template.templateData);
        } else {
          // Create sample business card data for preview
          const sampleData: BusinessCard = {
            id: 'preview',
            fullName: 'John Doe',
            title: 'Software Engineer',
            company: 'Tech Company',
            email: 'john@example.com',
            phone: '+1 (555) 123-4567',
            website: 'https://johndoe.com',
            socialLinks: [
              { platform: 'LinkedIn', url: 'https://linkedin.com/in/johndoe', icon: 'fab fa-linkedin' },
              { platform: 'Twitter', url: 'https://twitter.com/johndoe', icon: 'fab fa-twitter' }
            ],
            backgroundColor: template.backgroundColor || '#ffffff',
            textColor: template.textColor || '#000000',
            brandColor: '#22c55e',
            template: template.id,
            profileImageUrl: '',
            contactButtons: [
              { type: 'phone', value: '+1 (555) 123-4567', icon: 'fas fa-phone', label: 'Call' },
              { type: 'email', value: 'john@example.com', icon: 'fas fa-envelope', label: 'Email' },
              { type: 'website', value: 'https://johndoe.com', icon: 'fas fa-globe', label: 'Website' },
              { type: 'whatsapp', value: '+1 (555) 123-4567', icon: 'fab fa-whatsapp', label: 'WhatsApp' }
            ],
            dynamicHeaders: []
          };
          setCardData(sampleData);
        }
        setError(null);
      } else {
        setError("Template not found");
      }
      setIsLoading(false);
    }
  }, [templates, params.templateId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading template preview...</p>
        </div>
      </div>
    );
  }

  if (error || !cardData) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 max-w-md mx-4">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-500 text-2xl"></i>
            </div>
            <h2 className="text-xl font-bold mb-2 text-white">Template Not Found</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <Button
              onClick={() => window.close()}
              className="bg-orange-500 hover:bg-orange-600"
              data-testid="button-close-preview"
            >
              Close Preview
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-white">Template Preview</h1>
            <p className="text-sm text-slate-400">Preview of business card template</p>
          </div>
          <Button
            onClick={() => window.close()}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            data-testid="button-close-preview"
          >
            Close Preview
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <BusinessCardComponent 
              data={cardData}
              isInteractive={true}
              showQR={false}
            />
          </div>
        </div>
        
        {/* Template Info */}
        <div className="mt-8 text-center">
          <p className="text-slate-400 text-sm">
            This is how your business card will look with this template.
          </p>
          <div className="mt-4">
            <Button
              onClick={() => {
                window.opener?.postMessage({ action: 'selectTemplate', templateId: params.templateId }, '*');
                window.close();
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white"
              data-testid="button-use-template"
            >
              Use This Template
              <i className="fas fa-arrow-right ml-2"></i>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}