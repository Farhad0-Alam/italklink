import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Download, 
  Upload,
  Palette,
  Layout,
  Type,
  Image as ImageIcon,
  Share2,
  X
} from 'lucide-react';
import { useLocation } from 'wouter';
import { BusinessCard } from '@shared/schema';
import HeaderBuilder from './HeaderBuilder';
import { templateExtractor } from '@/utils/template-extractor';
import { FormBuilder } from '@/components/form-builder';
import { BusinessCardComponent } from '@/components/business-card';
import { generateShareUrl } from '@/lib/share';
import * as htmlToImage from 'html-to-image';

interface TemplateData {
  id?: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  templateData?: any;
  thumbnailUrl?: string;
}

export default function TemplateBuilder() {
  const [location, navigate] = useLocation();
  const [template, setTemplate] = useState<TemplateData>({
    name: '',
    description: '',
    category: 'business',
    isActive: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [isGeneratingThumb, setIsGeneratingThumb] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showHeaderBuilder, setShowHeaderBuilder] = useState(false);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [businessCardData, setBusinessCardData] = useState<BusinessCard>({
    id: 'template-preview',
    fullName: 'John Doe',
    title: 'Software Engineer',
    company: 'Tech Company',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    website: 'johndoe.com',
    linkedin: 'linkedin.com/in/johndoe',
    bio: 'Passionate software engineer with 5+ years of experience building web applications.',
    profileImageUrl: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#3b82f6',
    template: 'minimal' as const,
    shareSlug: 'john-doe-template',
    isPublic: true,
    qrCodeUrl: '',
    viewCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    pageElements: [],
    customContacts: [],
    socialLinks: { twitter: '', facebook: '', instagram: '', youtube: '', tiktok: '', pinterest: '', snapchat: '', whatsapp: '', telegram: '' },
    skills: [],
    categories: [],
    isOwner: false,
    frameworkId: '',
    themeId: '',
    iconColor: '#3b82f6',
    qrCodeStyle: 'square',
    metaTitle: '',
    metaDescription: '',
    language: 'en',
    timezone: 'UTC',
    passwordProtected: false
  });

  const templateCategories = [
    'business', 'creative', 'minimal', 'corporate', 'modern', 
    'elegant', 'professional', 'classic', 'tech', 'healthcare',
    'education', 'retail', 'finance', 'real-estate', 'consulting'
  ];

  // Convert 2TalkLink template structure to BusinessCard format
  const convert2TalkLinkToBusinessCard = (talkLinkData: any) => {
    const profile = talkLinkData.profile || {};
    const templateStyle = talkLinkData.templateStyle || {};
    const socialIcons = talkLinkData.socialIcons || [];
    
    return {
      fullName: profile.name || 'Sample Name',
      title: profile.tagline || 'Professional Title',
      company: 'Sample Company',
      email: 'sample@email.com',
      phone: '+1 (555) 123-4567',
      website: 'www.example.com',
      linkedin: 'linkedin.com/in/sample',
      bio: 'Professional bio description',
      profileImageUrl: profile.image || '',
      backgroundColor: templateStyle.bgcolor || templateStyle.secondary_color || '#ffffff',
      textColor: templateStyle.textcolor || templateStyle.headingcolor || '#000000',
      accentColor: templateStyle.primary_color || '#3b82f6',
      template: 'minimal' as const,
      // Convert social icons to our format
      socialLinks: {
        twitter: socialIcons.find((icon: any) => icon.name === 'Twitter')?.value || '',
        facebook: socialIcons.find((icon: any) => icon.name === 'Facebook')?.value || '',
        instagram: socialIcons.find((icon: any) => icon.name === 'Instagram')?.value || '',
        linkedin: socialIcons.find((icon: any) => icon.name === 'Linkedin')?.value || '',
        youtube: '',
        tiktok: '',
        pinterest: socialIcons.find((icon: any) => icon.name === 'Pinterest')?.value || '',
        snapchat: '',
        whatsapp: socialIcons.find((icon: any) => icon.name === 'WhatsApp')?.value || '',
        telegram: ''
      }
    };
  };

  // Extract template ID from URL params for editing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get('edit');
    
    if (editId) {
      setIsEditing(true);
      setTemplateId(editId);
      // Load existing template for editing
      loadTemplate(editId);
    }
  }, []);

  const loadTemplate = async (templateId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Template data loaded:', data);
        
        setTemplate({
          id: data.id,
          name: data.name,
          description: data.description || '',
          category: data.templateData?.category || 'business',
          isActive: data.isActive,
          templateData: data.templateData
        });
        
        // Convert template data to our BusinessCard format
        if (data.templateData) {
          // Check if it's our new format or legacy 2TalkLink format
          if (data.templateData.defaultData) {
            // New format - use the defaultData directly
            const defaultData = data.templateData.defaultData;
            setBusinessCardData(prev => ({
              ...prev,
              fullName: defaultData.fullName || 'Your Name',
              title: defaultData.title || 'Your Title', 
              company: defaultData.company || 'Your Company',
              backgroundColor: defaultData.backgroundColor || '#ffffff',
              accentColor: defaultData.brandColor || '#22c55e',
              template: defaultData.template || 'minimal',
              // Add other default fields as needed
              email: 'sample@email.com',
              phone: '+1 (555) 123-4567',
              website: 'www.example.com',
              linkedin: 'linkedin.com/in/sample'
            }));
          } else {
            // Legacy 2TalkLink format
            const convertedData = convert2TalkLinkToBusinessCard(data.templateData);
            setBusinessCardData(prev => ({
              ...prev,
              ...convertedData
            }));
          }
        }
      } else {
        console.error('Failed to load template:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!template.name.trim()) {
      alert('Please enter a template name');
      return;
    }

    setIsSaving(true);
    try {
      const templateData = {
        name: template.name,
        description: template.description,
        templateData: JSON.stringify(businessCardData),
        previewImage: await generatePreviewImage(),
        isActive: template.isActive
      };

      const url = template.id 
        ? `/api/admin/templates/${template.id}`
        : '/api/admin/templates';
      
      const method = template.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(templateData)
      });

      if (response.ok) {
        navigate('/admin/templates');
      } else {
        alert('Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('Failed to save template');
    } finally {
      setIsSaving(false);
    }
  };

  const generatePreviewImage = async () => {
    // This would generate a preview image of the business card
    // For now, return a placeholder
    return '/api/placeholder/300/400';
  };

  const handlePublishTemplate = async () => {
    await handleSaveTemplate();
    
    if (template.id) {
      try {
        await fetch(`/api/admin/templates/${template.id}/publish`, {
          method: 'POST',
          credentials: 'include'
        });
      } catch (error) {
        console.error('Failed to publish template:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/admin/templates')}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {template.id ? 'Edit Template' : 'Create New Template'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Design a business card template for your users
                </p>
              </div>
              
              {/* Template Settings in Header */}
              <div className="flex items-center gap-4 text-sm">
                <div>
                  <Label className="font-medium text-gray-700 dark:text-gray-300">Template Name:</Label>
                  <Input
                    value={template.name}
                    onChange={(e) => setTemplate(prev => ({...prev, name: e.target.value}))}
                    className="w-48 mt-1"
                    placeholder="Template name"
                  />
                </div>
                
                <div>
                  <Label className="font-medium text-gray-700 dark:text-gray-300">Status:</Label>
                  <div className="mt-1">
                    <Badge variant={template.isActive ? "default" : "secondary"}>
                      {template.isActive ? "Published" : "Draft"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setPreviewCollapsed(!previewCollapsed)}
                size="sm"
              >
                <Layout className="h-4 w-4 mr-2" />
                {previewCollapsed ? 'Show Preview' : 'Hide Preview'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleSaveTemplate}
                disabled={isSaving}
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button 
                onClick={handlePublishTemplate}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                <Upload className="h-4 w-4 mr-2" />
                {template.id ? 'Update & Publish' : 'Save & Publish'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`${!previewCollapsed ? 'grid lg:grid-cols-2 gap-8' : 'grid grid-cols-1'}`}>
          
          {/* Template Builder - Left Column */}
          <div className="space-y-6">
            <FormBuilder 
              cardData={businessCardData}
              onDataChange={setBusinessCardData}
              onGenerateQR={() => {}}
            />
          </div>

          {/* Live Preview Panel - Right Column */}
          {!previewCollapsed && (
            <div className="space-y-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 sticky top-24">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <Eye className="text-blue-500 mr-3 h-6 w-6" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  Real-time preview of your template
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Card Preview Container - iPhone-like dimensions */}
                <div className="flex justify-center">
                  <div className="w-[390px] max-w-full mx-auto bg-gray-100 dark:bg-gray-900 rounded-3xl p-4 shadow-lg border-4 border-gray-300 dark:border-gray-600">
                    <div ref={cardRef} className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm">
                      <BusinessCardComponent 
                        data={businessCardData}
                        showQR={false}
                        isInteractive={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Template Actions */}
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    onClick={async () => {
                      if (!cardRef.current || !templateId) return;
                      
                      setIsGeneratingThumb(true);
                      try {
                        // Generate thumbnail image
                        const dataUrl = await htmlToImage.toPng(cardRef.current, {
                          quality: 0.95,
                          width: 400,
                          height: 600,
                          backgroundColor: '#ffffff'
                        });
                        
                        // Save thumbnail to database
                        const response = await fetch(`/api/admin/templates/${templateId}`, {
                          method: 'PATCH',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            ...template,
                            previewImage: dataUrl
                          }),
                        });
                        
                        if (response.ok) {
                          const { template: updatedTemplate } = await response.json();
                          setTemplate({
                            ...template,
                            thumbnailUrl: dataUrl,
                            previewImage: dataUrl
                          });
                          console.log('Thumbnail generated and saved successfully');
                        } else {
                          throw new Error('Failed to save thumbnail');
                        }
                      } catch (error) {
                        console.error('Failed to generate thumbnail:', error);
                      } finally {
                        setIsGeneratingThumb(false);
                      }
                    }}
                    className="w-full"
                    disabled={isGeneratingThumb}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    {isGeneratingThumb ? 'Generating...' : 'Design Set Thumb'}
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => {
                      const shareUrl = generateShareUrl(businessCardData);
                      window.open(shareUrl, '_blank');
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Template
                  </Button>
                </div>
              </CardContent>
            </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}