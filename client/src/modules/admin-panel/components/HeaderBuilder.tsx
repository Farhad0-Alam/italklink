import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeaderPreview } from '@/components/header-builder/HeaderPreview';
import { defaultHeaderPreset, SHAPE_PRESETS, type HeaderPreset, type HeaderElement, type ShapeDivider as ShapeDividerType } from '@/lib/header-schema';
import { BusinessCard } from '@shared/schema';
import { 
  Save, ArrowLeft, Upload, Eye, Palette, Shapes, Image, User, 
  Building2, FileText, Crown, ChevronDown, ChevronRight, Plus, Trash2, 
  RotateCw, FlipVertical, Minus, Grid, Move, Type, Settings
} from 'lucide-react';
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

const shapeNames: Record<string, string> = {
  'wave': 'Wave',
  'waves-brush': 'Waves Brush', 
  'clouds': 'Clouds',
  'zigzag': 'Zigzag',
  'triangle': 'Triangle',
  'triangle-asymmetrical': 'Triangle Asymmetrical',
  'tilt': 'Tilt',
  'tilt-opacity': 'Tilt Opacity',
  'fan-opacity': 'Fan Opacity', 
  'curve': 'Curve',
  'curve-asymmetrical': 'Curve Asymmetrical',
  'drop': 'Drop',
  'mountain': 'Mountains',
  'opacity-fan-alt': 'Opacity Fan Alt',
  'book': 'Book',
  'custom': 'Custom SVG'
};

export default function HeaderBuilder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>('layout');
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  const [currentTemplate, setCurrentTemplate] = useState<HeaderTemplate>({
    name: '',
    description: '',
    category: 'general',
    isActive: true,
    headerPreset: {
      ...defaultHeaderPreset,
      elements: [
        // Profile element
        {
          id: 'profile-1',
          type: 'profile',
          visible: true,
          order: 0,
          position: { x: 50, y: 30, width: 80, height: 80 },
          style: { fontSize: 16, fontWeight: 400, color: '#ffffff', fontFamily: 'Inter', textAlign: 'center', opacity: 1 },
          content: { size: 80, borderRadius: 50 }
        },
        // Logo element  
        {
          id: 'logo-1',
          type: 'logo', 
          visible: true,
          order: 1,
          position: { x: 300, y: 30, width: 60, height: 60 },
          style: { fontSize: 16, fontWeight: 400, color: '#ffffff', fontFamily: 'Inter', textAlign: 'center', opacity: 1 },
          content: { size: 60, borderRadius: 10 }
        },
        // Name element
        {
          id: 'name-1',
          type: 'name',
          visible: true,
          order: 2,
          position: { x: 50, y: 120, width: 200, height: 30 },
          style: { fontSize: 24, fontWeight: 600, color: '#ffffff', fontFamily: 'Inter', textAlign: 'center', opacity: 1 },
          content: { text: 'Full Name' }
        },
        // Title element
        {
          id: 'title-1', 
          type: 'title',
          visible: true,
          order: 3,
          position: { x: 50, y: 150, width: 200, height: 20 },
          style: { fontSize: 16, fontWeight: 400, color: '#ffffff', fontFamily: 'Inter', textAlign: 'center', opacity: 1 },
          content: { text: 'Job Title' }
        },
        // Company element
        {
          id: 'company-1',
          type: 'company',
          visible: true, 
          order: 4,
          position: { x: 270, y: 120, width: 150, height: 50 },
          style: { fontSize: 14, fontWeight: 400, color: '#ffffff', fontFamily: 'Inter', textAlign: 'center', opacity: 1 },
          content: { text: 'Company Name' }
        }
      ]
    }
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

  const updateElement = (elementId: string, updates: Partial<HeaderElement>) => {
    const newPreset = {
      ...currentTemplate.headerPreset,
      elements: currentTemplate.headerPreset.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      )
    };
    handlePresetChange(newPreset);
  };

  const updateBackground = (backgroundUpdates: Partial<typeof currentTemplate.headerPreset.background>) => {
    const newPreset = {
      ...currentTemplate.headerPreset,
      background: { ...currentTemplate.headerPreset.background, ...backgroundUpdates }
    };
    handlePresetChange(newPreset);
  };

  const updateDivider = (position: 'top' | 'bottom', dividerUpdates: Partial<ShapeDividerType>) => {
    const newPreset = {
      ...currentTemplate.headerPreset,
      [`${position}Divider`]: { 
        ...currentTemplate.headerPreset[`${position}Divider`], 
        ...dividerUpdates 
      }
    };
    handlePresetChange(newPreset);
  };

  const toggleElementVisibility = (elementId: string) => {
    const element = currentTemplate.headerPreset.elements.find(el => el.id === elementId);
    if (element) {
      updateElement(elementId, { visible: !element.visible });
    }
  };

  const removeElement = (elementId: string) => {
    const newPreset = {
      ...currentTemplate.headerPreset,
      elements: currentTemplate.headerPreset.elements.filter(el => el.id !== elementId)
    };
    handlePresetChange(newPreset);
    if (selectedElement === elementId) {
      setSelectedElement(null);
    }
  };

  const selectedElementData = selectedElement 
    ? currentTemplate.headerPreset.elements.find(el => el.id === selectedElement)
    : null;

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const addNewElement = (type: HeaderElement['type']) => {
    const newElement: HeaderElement = {
      id: `${type}-${Date.now()}`,
      type,
      visible: true,
      order: currentTemplate.headerPreset.elements.length,
      position: { x: 50, y: 50, width: 100, height: 50 },
      style: { fontSize: 16, fontWeight: 400, color: '#ffffff', fontFamily: 'Inter', textAlign: 'center', opacity: 1 },
      content: type === 'profile' || type === 'logo' ? { size: 60, borderRadius: type === 'profile' ? 50 : 10 } : { text: `${type} text` }
    };

    const newPreset = {
      ...currentTemplate.headerPreset,
      elements: [...currentTemplate.headerPreset.elements, newElement]
    };
    handlePresetChange(newPreset);
    setSelectedElement(newElement.id);
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
                Advanced Header Builder
              </h1>
              <p className="text-slate-300 text-sm">
                Create professional header templates with drag & drop positioning, custom elements, and advanced styling
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
              <Select
                value={currentTemplate.category}
                onValueChange={(value) => setCurrentTemplate(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1" data-testid="select-template-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Left Panel - Controls */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-purple-400" />
                  Professional Tools
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4 bg-slate-700">
                    <TabsTrigger value="layout" className="text-white" data-testid="tab-layout">
                      <Grid className="w-4 h-4 mr-1" />
                      Layout
                    </TabsTrigger>
                    <TabsTrigger value="background" className="text-white" data-testid="tab-background">
                      <Palette className="w-4 h-4 mr-1" />
                      Background
                    </TabsTrigger>
                    <TabsTrigger value="shapes" className="text-white" data-testid="tab-shapes">
                      <Shapes className="w-4 h-4 mr-1" />
                      Shapes
                    </TabsTrigger>
                    <TabsTrigger value="elements" className="text-white" data-testid="tab-elements">
                      <User className="w-4 h-4 mr-1" />
                      Elements
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="layout" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Canvas Height</Label>
                        <Slider
                          value={[currentTemplate.headerPreset.canvasHeight]}
                          onValueChange={([value]) => handlePresetChange({
                            ...currentTemplate.headerPreset,
                            canvasHeight: value
                          })}
                          min={150}
                          max={400}
                          step={10}
                          className="mt-2"
                          data-testid="slider-canvas-height"
                        />
                        <span className="text-sm text-slate-400">{currentTemplate.headerPreset.canvasHeight}px</span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="background" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Background Type</Label>
                        <Select
                          value={currentTemplate.headerPreset.background.type}
                          onValueChange={(value: 'solid' | 'gradient' | 'image') => 
                            updateBackground({ type: value })
                          }
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1" data-testid="select-background-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="solid">Solid Color</SelectItem>
                            <SelectItem value="gradient">Gradient</SelectItem>
                            <SelectItem value="image">Background Image</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {currentTemplate.headerPreset.background.type === 'solid' && (
                        <div>
                          <Label className="text-white">Background Color</Label>
                          <Input
                            type="color"
                            value={currentTemplate.headerPreset.background.solid?.color || '#22c55e'}
                            onChange={(e) => updateBackground({
                              solid: { color: e.target.value }
                            })}
                            className="mt-1 h-10"
                            data-testid="input-background-color"
                          />
                        </div>
                      )}

                      {currentTemplate.headerPreset.background.type === 'image' && (
                        <div>
                          <Label className="text-white">Background Image URL</Label>
                          <Input
                            value={currentTemplate.headerPreset.background.image?.url || ''}
                            onChange={(e) => updateBackground({
                              image: { 
                                url: e.target.value,
                                overlay: currentTemplate.headerPreset.background.image?.overlay
                              }
                            })}
                            placeholder="Enter image URL..."
                            className="bg-slate-700 border-slate-600 text-white mt-1"
                            data-testid="input-background-image-url"
                          />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="shapes" className="space-y-4 mt-4">
                    <div className="space-y-6">
                      {/* Top Divider */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => toggleSection('topDivider')}
                            className="flex items-center text-white hover:text-green-400"
                            data-testid="button-toggle-top-divider"
                          >
                            {collapsedSections.topDivider ? <ChevronRight className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                            Top Shape Divider
                          </button>
                          <Switch
                            checked={currentTemplate.headerPreset.topDivider?.enabled || false}
                            onCheckedChange={(checked) => updateDivider('top', { enabled: checked })}
                            data-testid="switch-top-divider-enabled"
                          />
                        </div>
                        
                        {!collapsedSections.topDivider && currentTemplate.headerPreset.topDivider?.enabled && (
                          <div className="space-y-3 pl-4 border-l-2 border-slate-600">
                            <div>
                              <Label className="text-white text-sm">Shape Type</Label>
                              <Select
                                value={currentTemplate.headerPreset.topDivider.preset}
                                onValueChange={(value) => updateDivider('top', { 
                                  preset: value as any,
                                  customPath: value === 'custom' ? currentTemplate.headerPreset.topDivider?.customPath : undefined
                                })}
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1" data-testid="select-top-divider-shape">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(shapeNames).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-white text-sm">Color</Label>
                              <Input
                                type="color"
                                value={currentTemplate.headerPreset.topDivider.color}
                                onChange={(e) => updateDivider('top', { color: e.target.value })}
                                className="mt-1 h-8"
                                data-testid="input-top-divider-color"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-sm">Height: {currentTemplate.headerPreset.topDivider.height}px</Label>
                              <Slider
                                value={[currentTemplate.headerPreset.topDivider.height]}
                                onValueChange={([value]) => updateDivider('top', { height: value })}
                                min={20}
                                max={200}
                                step={5}
                                className="mt-2"
                                data-testid="slider-top-divider-height"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={currentTemplate.headerPreset.topDivider.flip}
                                onCheckedChange={(checked) => updateDivider('top', { flip: checked })}
                                data-testid="switch-top-divider-flip"
                              />
                              <Label className="text-white text-sm">Flip Shape</Label>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Divider */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <button 
                            onClick={() => toggleSection('bottomDivider')}
                            className="flex items-center text-white hover:text-green-400"
                            data-testid="button-toggle-bottom-divider"
                          >
                            {collapsedSections.bottomDivider ? <ChevronRight className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
                            Bottom Shape Divider
                          </button>
                          <Switch
                            checked={currentTemplate.headerPreset.bottomDivider?.enabled || false}
                            onCheckedChange={(checked) => updateDivider('bottom', { enabled: checked })}
                            data-testid="switch-bottom-divider-enabled"
                          />
                        </div>
                        
                        {!collapsedSections.bottomDivider && currentTemplate.headerPreset.bottomDivider?.enabled && (
                          <div className="space-y-3 pl-4 border-l-2 border-slate-600">
                            <div>
                              <Label className="text-white text-sm">Shape Type</Label>
                              <Select
                                value={currentTemplate.headerPreset.bottomDivider.preset}
                                onValueChange={(value) => updateDivider('bottom', { 
                                  preset: value as any,
                                  customPath: value === 'custom' ? currentTemplate.headerPreset.bottomDivider?.customPath : undefined
                                })}
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white mt-1" data-testid="select-bottom-divider-shape">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(shapeNames).map(([value, label]) => (
                                    <SelectItem key={value} value={value}>{label}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label className="text-white text-sm">Color</Label>
                              <Input
                                type="color"
                                value={currentTemplate.headerPreset.bottomDivider.color}
                                onChange={(e) => updateDivider('bottom', { color: e.target.value })}
                                className="mt-1 h-8"
                                data-testid="input-bottom-divider-color"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-sm">Height: {currentTemplate.headerPreset.bottomDivider.height}px</Label>
                              <Slider
                                value={[currentTemplate.headerPreset.bottomDivider.height]}
                                onValueChange={([value]) => updateDivider('bottom', { height: value })}
                                min={20}
                                max={200}
                                step={5}
                                className="mt-2"
                                data-testid="slider-bottom-divider-height"
                              />
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                checked={currentTemplate.headerPreset.bottomDivider.flip}
                                onCheckedChange={(checked) => updateDivider('bottom', { flip: checked })}
                                data-testid="switch-bottom-divider-flip"
                              />
                              <Label className="text-white text-sm">Flip Shape</Label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="elements" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      {/* Add New Elements */}
                      <div className="space-y-3">
                        <Label className="text-white">Add Elements</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            onClick={() => addNewElement('profile')} 
                            variant="outline" 
                            size="sm"
                            className="text-white border-slate-600 hover:bg-slate-700"
                            data-testid="button-add-profile"
                          >
                            <User className="w-4 h-4 mr-1" />
                            Profile Pic
                          </Button>
                          <Button 
                            onClick={() => addNewElement('logo')} 
                            variant="outline" 
                            size="sm"
                            className="text-white border-slate-600 hover:bg-slate-700"
                            data-testid="button-add-logo"
                          >
                            <Image className="w-4 h-4 mr-1" />
                            Logo
                          </Button>
                          <Button 
                            onClick={() => addNewElement('name')} 
                            variant="outline" 
                            size="sm"
                            className="text-white border-slate-600 hover:bg-slate-700"
                            data-testid="button-add-name"
                          >
                            <Type className="w-4 h-4 mr-1" />
                            Name
                          </Button>
                          <Button 
                            onClick={() => addNewElement('title')} 
                            variant="outline" 
                            size="sm"
                            className="text-white border-slate-600 hover:bg-slate-700"
                            data-testid="button-add-title"
                          >
                            <FileText className="w-4 h-4 mr-1" />
                            Title
                          </Button>
                          <Button 
                            onClick={() => addNewElement('company')} 
                            variant="outline" 
                            size="sm"
                            className="text-white border-slate-600 hover:bg-slate-700 col-span-2"
                            data-testid="button-add-company"
                          >
                            <Building2 className="w-4 h-4 mr-1" />
                            Company
                          </Button>
                        </div>
                      </div>

                      {/* Elements List */}
                      <div className="space-y-3">
                        <Label className="text-white">Current Elements</Label>
                        <div className="space-y-2" data-testid="elements-list">
                          {currentTemplate.headerPreset.elements.map((element) => (
                            <div
                              key={element.id}
                              className={`flex items-center justify-between p-3 rounded border ${
                                selectedElement === element.id 
                                  ? 'border-green-500 bg-green-500/10' 
                                  : 'border-slate-600 bg-slate-700'
                              }`}
                              data-testid={`element-item-${element.type}`}
                            >
                              <div className="flex items-center gap-3">
                                <Move className="w-4 h-4 text-slate-400" />
                                <div>
                                  <div className="text-white capitalize font-medium">{element.type}</div>
                                  <div className="text-slate-400 text-sm">
                                    {element.position.x}, {element.position.y} • {element.position.width}×{element.position.height}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setSelectedElement(element.id)}
                                  className={selectedElement === element.id ? 'text-green-400' : 'text-slate-400'}
                                  data-testid={`button-select-element-${element.type}`}
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                                <Switch
                                  checked={element.visible}
                                  onCheckedChange={() => toggleElementVisibility(element.id)}
                                  data-testid={`switch-element-visibility-${element.type}`}
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => removeElement(element.id)}
                                  className="text-red-400 hover:text-red-300"
                                  data-testid={`button-remove-element-${element.type}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selected Element Properties */}
                      {selectedElementData && (
                        <div className="space-y-3 p-4 border border-green-500/30 rounded-lg bg-green-500/5">
                          <Label className="text-green-400 font-medium">
                            Edit {selectedElementData.type.charAt(0).toUpperCase() + selectedElementData.type.slice(1)} Properties
                          </Label>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-white text-sm">X Position</Label>
                              <Input
                                type="number"
                                value={selectedElementData.position.x}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  position: { ...selectedElementData.position, x: Number(e.target.value) }
                                })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                                data-testid="input-element-x"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">Y Position</Label>
                              <Input
                                type="number"
                                value={selectedElementData.position.y}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  position: { ...selectedElementData.position, y: Number(e.target.value) }
                                })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                                data-testid="input-element-y"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-white text-sm">Width</Label>
                              <Input
                                type="number"
                                value={selectedElementData.position.width}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  position: { ...selectedElementData.position, width: Number(e.target.value) }
                                })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                                data-testid="input-element-width"
                              />
                            </div>
                            <div>
                              <Label className="text-white text-sm">Height</Label>
                              <Input
                                type="number"
                                value={selectedElementData.position.height}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  position: { ...selectedElementData.position, height: Number(e.target.value) }
                                })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                                data-testid="input-element-height"
                              />
                            </div>
                          </div>

                          {(selectedElementData.type === 'name' || selectedElementData.type === 'title' || selectedElementData.type === 'company') && (
                            <div>
                              <Label className="text-white text-sm">Display Text</Label>
                              <Input
                                value={selectedElementData.content.text || ''}
                                onChange={(e) => updateElement(selectedElementData.id, {
                                  content: { ...selectedElementData.content, text: e.target.value }
                                })}
                                className="bg-slate-700 border-slate-600 text-white mt-1"
                                data-testid="input-element-text"
                              />
                            </div>
                          )}

                          <div>
                            <Label className="text-white text-sm">Text Color</Label>
                            <Input
                              type="color"
                              value={selectedElementData.style.color}
                              onChange={(e) => updateElement(selectedElementData.id, {
                                style: { ...selectedElementData.style, color: e.target.value }
                              })}
                              className="mt-1 h-10"
                              data-testid="input-element-color"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Live Preview */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="w-5 h-5 mr-2 text-green-400" />
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-slate-300 mb-4">
                  Drag Elements to Position
                </div>
                
                {/* Fixed 430px Preview Canvas */}
                <div className="mx-auto bg-white rounded-lg overflow-hidden shadow-lg" style={{ width: '430px' }}>
                  <HeaderPreview
                    headerPreset={currentTemplate.headerPreset}
                    cardData={sampleCardData}
                    profileImageSrc={sampleCardData.profilePhoto}
                    logoImageSrc={sampleCardData.logo}
                    onElementSelect={setSelectedElement}
                    selectedElement={selectedElement}
                    onElementUpdate={updateElement}
                    enableInteraction={true}
                    canvasWidth={430}
                  />
                </div>
                
                <div className="text-center text-slate-400 text-sm mt-4">
                  💡 Use the tabs above to customize background, shapes, and elements
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}