import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { HeaderBuilder as NewHeaderBuilder } from '@/components/header-builder';
import { defaultHeaderPreset, type HeaderPreset } from '@/lib/header-schema';
import { BusinessCard } from '@shared/schema';
import { Save, ArrowLeft, Crown } from 'lucide-react';
import { useLocation } from 'wouter';

interface HeaderTemplate {
  id?: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  headerPreset: HeaderPreset;
  createdAt?: string;
  updatedAt?: string;
}

export default function HeaderBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [currentTemplate, setCurrentTemplate] = useState<HeaderTemplate>({
    name: '',
    description: '',
    category: 'general',
    isActive: true,
    headerPreset: defaultHeaderPreset
  });

  // Sample card data for preview
  const sampleCardData: BusinessCard = {
    fullName: 'John Doe',
    title: 'Software Engineer', 
    company: 'Tech Company',
    about: 'Passionate about creating amazing user experiences',
    phone: '+1 (555) 123-4567',
    email: 'john@example.com',
    website: 'johndoe.com',
    location: 'San Francisco, CA',
    brandColor: '#22c55e',
    accentColor: '#16a34a',
    font: 'inter',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    template: 'minimal',
    headerDesign: 'shape-divider',
    customContacts: [],
    pageElements: [],
    customSocials: [],
    galleryImages: [],
    availableIcons: [],
    profilePhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=100&h=100&fit=crop'
  };

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: HeaderTemplate) => {
      const method = template.id ? 'PATCH' : 'POST';
      const url = template.id 
        ? `/api/admin/header-templates/${template.id}` 
        : '/api/admin/header-templates';
        
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          category: template.category,
          isActive: template.isActive,
          elements: [], // Legacy field
          globalStyles: {}, // Legacy field
          layoutType: 'header-builder',
          advancedLayout: template.headerPreset
        })
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Header template saved!",
        description: "Your header template has been saved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/header-templates'] });
      setLocation('/admin/header-templates');
    },
    onError: (error) => {
      toast({
        title: "Failed to save template",
        description: "Please try again",
        variant: "destructive",
      });
      console.error('Save error:', error);
    }
  });

  const handleSaveTemplate = () => {
    if (!currentTemplate.name.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }
    saveTemplateMutation.mutate(currentTemplate);
  };

  const handlePresetChange = (preset: HeaderPreset) => {
    setCurrentTemplate(prev => ({
      ...prev,
      headerPreset: preset
    }));
  };

  const handleGoBack = () => {
    setLocation('/admin/header-templates');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={handleGoBack}
              className="text-white hover:bg-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Templates
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <Crown className="text-green-400 mr-3 w-6 h-6" />
                Header Builder
              </h1>
              <p className="text-slate-300 text-sm">
                Create professional header templates with Profile Pic, Logo, Cover Photo/Background, Name, Title, Company
              </p>
            </div>
          </div>
          
          <Button 
            onClick={handleSaveTemplate}
            disabled={saveTemplateMutation.isPending || !currentTemplate.name.trim()}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>

      {/* Template Information */}
      <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-white text-sm font-medium">Template Name</Label>
              <Input
                value={currentTemplate.name}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name..."
                className="bg-slate-700 border-slate-600 text-white mt-1"
                data-testid="input-template-name"
              />
            </div>
            
            <div>
              <Label className="text-white text-sm font-medium">Description</Label>
              <Input
                value={currentTemplate.description || ''}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                className="bg-slate-700 border-slate-600 text-white mt-1"
                data-testid="input-template-description"
              />
            </div>

            <div>
              <Label className="text-white text-sm font-medium">Category</Label>
              <select
                value={currentTemplate.category}
                onChange={(e) => setCurrentTemplate(prev => ({ ...prev, category: e.target.value }))}
                className="w-full mt-1 bg-slate-700 border border-slate-600 text-white rounded-md px-3 py-2 text-sm"
                data-testid="select-template-category"
              >
                <option value="general">General</option>
                <option value="business">Business</option>
                <option value="creative">Creative</option>
                <option value="professional">Professional</option>
                <option value="modern">Modern</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg p-6">
            <NewHeaderBuilder
              headerPreset={currentTemplate.headerPreset}
              onPresetChange={handlePresetChange}
              cardData={sampleCardData}
              profileImageSrc={sampleCardData.profilePhoto}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}