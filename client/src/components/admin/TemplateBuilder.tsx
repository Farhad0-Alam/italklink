import { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import { useLocation } from 'wouter';
import { BusinessCard } from '@shared/schema';
import HeaderBuilder from './HeaderBuilder';
import { templateExtractor } from '@/utils/template-extractor';

interface TemplateData {
  id?: string;
  name: string;
  description: string;
  category: string;
  isActive: boolean;
  templateData?: any;
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
  const [showHeaderBuilder, setShowHeaderBuilder] = useState(false);
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
        setTemplate({
          id: data.id,
          name: data.name,
          description: data.description || '',
          category: 'business',
          isActive: data.isActive,
          templateData: data.templateData
        });
        
        // Convert 2TalkLink template data to our BusinessCard format
        if (data.templateData) {
          const convertedData = convert2TalkLinkToBusinessCard(data.templateData);
          setBusinessCardData(prev => ({
            ...prev,
            ...convertedData
          }));
        }
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
            <div className="flex items-center space-x-4">
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
            </div>
            
            <div className="flex items-center space-x-2">
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

      <div className="flex">
        {/* Template Settings Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-800 border-r h-screen overflow-y-auto">
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-4">Template Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={template.name}
                    onChange={(e) => setTemplate({...template, name: e.target.value})}
                    placeholder="Professional Business Card"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={template.description}
                    onChange={(e) => setTemplate({...template, description: e.target.value})}
                    placeholder="A clean and professional business card template..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={template.category} onValueChange={(value) => setTemplate({...template, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templateCategories.map(category => (
                        <SelectItem key={category} value={category} className="capitalize">
                          {category.replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-3">Template Status</h3>
              <Badge variant={template.isActive ? "default" : "secondary"}>
                {template.isActive ? "Published" : "Draft"}
              </Badge>
            </div>

            <div>
              <h3 className="font-medium mb-3">Design Tools</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="justify-start">
                  <Layout className="h-4 w-4 mr-2" />
                  Layout
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Palette className="h-4 w-4 mr-2" />
                  Colors
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <Type className="h-4 w-4 mr-2" />
                  Typography
                </Button>
                <Button variant="outline" size="sm" className="justify-start">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Images
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Template Builder/Preview */}
        <div className="flex-1">
          {previewMode ? (
            <div className="p-8">
              <div className="max-w-md mx-auto">
                <FormBuilder 
                  cardData={businessCardData}
                  onDataChange={setBusinessCardData}
                  onGenerateQR={() => {}}
                />
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle>Template Design</CardTitle>
                    <CardDescription>
                      Customize the business card template. Use sample data to see how it will look for users.
                    </CardDescription>
                  </CardHeader>
                </Card>
                
                <FormBuilder 
                  cardData={businessCardData}
                  onDataChange={setBusinessCardData}
                  onGenerateQR={() => {}}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}