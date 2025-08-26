import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Save,
  Palette,
  Type,
  Layout,
  Image,
  ArrowUp,
  ArrowDown,
  Settings,
  Sparkles,
  Shapes,
  Grid,
  Layers
} from 'lucide-react';
import SVGShapeRenderer from './SVGShapeRenderer';
import { SVGShapeDefinition, applySVGShapeColors } from '@/lib/svg-shapes-library';

interface HeaderElement {
  id: string;
  type: 'text' | 'image' | 'logo' | 'tagline' | 'social' | 'contact' | 'button' | 'divider' | 'svg_shape' | 'layout_container';
  content: any;
  styles: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    textAlign?: string;
    width?: string;
    height?: string;
    position?: string;
    top?: string;
    left?: string;
    right?: string;
    bottom?: string;
    zIndex?: string;
    transform?: string;
    opacity?: string;
  };
  order: number;
  visible: boolean;
  layoutConfig?: {
    container: 'standard' | 'split' | 'overlay' | 'geometric' | 'custom';
    alignment: 'left' | 'center' | 'right' | 'justified';
    responsiveBreakpoints?: Record<string, any>;
  };
}

interface HeaderTemplate {
  id: string;
  name: string;
  description?: string;
  elements: HeaderElement[];
  globalStyles: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    containerWidth: string;
    padding: string;
    borderRadius: string;
    shadow: string;
  };
  layoutType: 'standard' | 'split' | 'overlay' | 'geometric' | 'custom';
  advancedLayout: {
    columns: number;
    rows: number;
    gridGap: string;
    flexDirection: 'row' | 'column';
    justifyContent: string;
    alignItems: string;
    backgroundEffects: {
      gradients: any[];
      svgOverlays: any[];
      patterns: any[];
    };
  };
  category: string;
  isActive: boolean;
}

export default function HeaderBuilder({ onSave }: { onSave?: (template: HeaderTemplate) => void }) {
  const [headerTemplate, setHeaderTemplate] = useState<HeaderTemplate>({
    id: '',
    name: 'New Header Template',
    description: '',
    elements: [],
    globalStyles: {
      backgroundColor: '#ffffff',
      textColor: '#1a1a1a',
      accentColor: '#3b82f6',
      fontFamily: 'Inter, sans-serif',
      containerWidth: '100%',
      padding: '2rem',
      borderRadius: '0.5rem',
      shadow: 'sm'
    },
    layoutType: 'standard',
    advancedLayout: {
      columns: 1,
      rows: 1,
      gridGap: '1rem',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundEffects: {
        gradients: [],
        svgOverlays: [],
        patterns: []
      }
    },
    category: 'professional',
    isActive: true
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [showSVGShapeSelector, setShowSVGShapeSelector] = useState(false);
  const [selectedElementForSVG, setSelectedElementForSVG] = useState<string | null>(null);
  const [showLayoutControls, setShowLayoutControls] = useState(false);

  // Pre-defined element templates
  const elementTemplates = {
    text: {
      type: 'text' as const,
      content: { text: 'Sample Text' },
      styles: { fontSize: '1rem', color: '#1a1a1a' }
    },
    image: {
      type: 'image' as const,
      content: { src: '', alt: 'Profile Image' },
      styles: { width: '100px', height: '100px', borderRadius: '50%' }
    },
    logo: {
      type: 'logo' as const,
      content: { text: 'LOGO', imageUrl: '' },
      styles: { fontSize: '1.5rem', fontWeight: 'bold' }
    },
    tagline: {
      type: 'tagline' as const,
      content: { text: 'Your Professional Tagline' },
      styles: { fontSize: '0.875rem', color: '#666666' }
    },
    social: {
      type: 'social' as const,
      content: { 
        icons: [
          { name: 'linkedin', url: '', svgCode: '', color: '#0077b5' },
          { name: 'twitter', url: '', svgCode: '', color: '#1da1f2' }
        ]
      },
      styles: { fontSize: '1.5rem' }
    },
    contact: {
      type: 'contact' as const,
      content: { 
        email: 'email@example.com',
        phone: '+1 234 567 8900',
        website: 'www.example.com'
      },
      styles: { fontSize: '0.875rem' }
    },
    button: {
      type: 'button' as const,
      content: { text: 'Contact Me', action: 'contact' },
      styles: { 
        backgroundColor: '#3b82f6', 
        color: '#ffffff',
        padding: '0.5rem 1rem',
        borderRadius: '0.375rem'
      }
    },
    divider: {
      type: 'divider' as const,
      content: {},
      styles: { 
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '1rem 0'
      }
    },
    svg_shape: {
      type: 'svg_shape' as const,
      content: { 
        shapeId: '',
        shapeName: 'Select SVG Shape',
        svgCode: '',
        customColors: { color1: '#22c55e', color2: '#16a34a' },
        viewBox: '0 0 100 100'
      },
      styles: { 
        width: '100px',
        height: '100px',
        opacity: '1',
        transform: 'scale(1) rotate(0deg)'
      }
    },
    layout_container: {
      type: 'layout_container' as const,
      content: {
        containerType: 'flex',
        childElements: []
      },
      styles: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        width: '100%'
      },
      layoutConfig: {
        container: 'standard',
        alignment: 'center'
      }
    }
  };

  const addElement = (type: HeaderElement['type']) => {
    const newElement: HeaderElement = {
      id: `element_${Date.now()}`,
      ...(elementTemplates[type] as any),
      order: headerTemplate.elements.length,
      visible: true
    };
    
    setHeaderTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
    
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<HeaderElement>) => {
    setHeaderTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));
  };

  const removeElement = (id: string) => {
    setHeaderTemplate(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id)
    }));
    setSelectedElement(null);
  };

  const moveElement = (id: string, direction: 'up' | 'down') => {
    setHeaderTemplate(prev => {
      const elements = [...prev.elements];
      const index = elements.findIndex(el => el.id === id);
      
      if (direction === 'up' && index > 0) {
        [elements[index], elements[index - 1]] = [elements[index - 1], elements[index]];
      } else if (direction === 'down' && index < elements.length - 1) {
        [elements[index], elements[index + 1]] = [elements[index + 1], elements[index]];
      }
      
      return { ...prev, elements };
    });
  };

  // SVG Shape handlers
  const handleSVGShapeSelect = (shape: SVGShapeDefinition, customization: any) => {
    if (!selectedElementForSVG) return;
    
    const processedSvgCode = applySVGShapeColors(shape.svgCode, customization.colors);
    
    updateElement(selectedElementForSVG, {
      content: {
        shapeId: shape.id,
        shapeName: shape.name,
        svgCode: processedSvgCode,
        customColors: customization.colors,
        viewBox: shape.viewBox
      },
      styles: {
        ...headerTemplate.elements.find(el => el.id === selectedElementForSVG)?.styles,
        opacity: customization.opacity.toString(),
        transform: `scale(${customization.scale}) rotate(${customization.rotation}deg)`
      }
    });
    
    setShowSVGShapeSelector(false);
    setSelectedElementForSVG(null);
  };

  const openSVGShapeSelector = (elementId: string) => {
    setSelectedElementForSVG(elementId);
    setShowSVGShapeSelector(true);
  };

  const updateLayoutType = (layoutType: HeaderTemplate['layoutType']) => {
    setHeaderTemplate(prev => ({
      ...prev,
      layoutType,
      advancedLayout: {
        ...prev.advancedLayout,
        columns: layoutType === 'split' ? 2 : layoutType === 'geometric' ? 3 : 1,
        flexDirection: layoutType === 'split' ? 'row' : 'column'
      }
    }));
  };

  const duplicateElement = (id: string) => {
    const element = headerTemplate.elements.find(el => el.id === id);
    if (!element) return;
    
    const newElement: HeaderElement = {
      ...element,
      id: `element_${Date.now()}`,
      order: headerTemplate.elements.length
    };
    
    setHeaderTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(headerTemplate);
    }
  };

  const selectedElementData = headerTemplate.elements.find(el => el.id === selectedElement);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h2 className="text-2xl font-bold">Header Builder</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create custom header templates with drag & drop elements
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {showPreview ? 'Hide' : 'Show'} Preview
          </Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="w-4 h-4 mr-2" />
            Save Template
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Element Library & Settings */}
        <div className="w-80 border-r flex flex-col">
          <Tabs defaultValue="elements" className="flex-1">
            <TabsList className="w-full">
              <TabsTrigger value="elements" className="flex-1">Elements</TabsTrigger>
              <TabsTrigger value="layouts" className="flex-1">Layouts</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="elements" className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-2">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('text')}
                  >
                    <Type className="w-4 h-4 mr-1" />
                    Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('image')}
                  >
                    <Image className="w-4 h-4 mr-1" />
                    Image
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('logo')}
                  >
                    <Sparkles className="w-4 h-4 mr-1" />
                    Logo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('tagline')}
                  >
                    <Type className="w-4 h-4 mr-1" />
                    Tagline
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('social')}
                  >
                    <Layout className="w-4 h-4 mr-1" />
                    Social
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('contact')}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('button')}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Button
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('divider')}
                  >
                    <Separator className="w-4 h-4 mr-1" />
                    Divider
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('svg_shape')}
                    className="bg-green-50 hover:bg-green-100 border-green-200"
                  >
                    <Shapes className="w-4 h-4 mr-1" />
                    SVG Shape
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addElement('layout_container')}
                    className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                  >
                    <Grid className="w-4 h-4 mr-1" />
                    Container
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-2">Current Elements</h3>
                <ScrollArea className="h-96">
                  <div className="space-y-2">
                    {headerTemplate.elements.map((element) => (
                      <Card
                        key={element.id}
                        className={`cursor-pointer ${
                          selectedElement === element.id ? 'ring-2 ring-blue-500' : ''
                        }`}
                        onClick={() => setSelectedElement(element.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium capitalize">
                                {element.type}
                              </span>
                              {!element.visible && (
                                <EyeOff className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElement(element.id, 'up');
                                }}
                              >
                                <ArrowUp className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  moveElement(element.id, 'down');
                                }}
                              >
                                <ArrowDown className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateElement(element.id);
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeElement(element.id);
                                }}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </TabsContent>

            <TabsContent value="layouts" className="p-4 space-y-4">
              <div>
                <h3 className="text-sm font-semibold mb-3">Header Layout Type</h3>
                <div className="grid grid-cols-1 gap-2">
                  {(['standard', 'split', 'overlay', 'geometric', 'custom'] as const).map(layout => (
                    <Button
                      key={layout}
                      variant={headerTemplate.layoutType === layout ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateLayoutType(layout)}
                      className="justify-start"
                    >
                      <Layout className="w-4 h-4 mr-2" />
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-sm font-semibold mb-3">Advanced Layout Settings</h3>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs">Columns: {headerTemplate.advancedLayout.columns}</Label>
                    <Input
                      type="range"
                      min="1"
                      max="4"
                      value={headerTemplate.advancedLayout.columns}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: {
                          ...prev.advancedLayout,
                          columns: parseInt(e.target.value)
                        }
                      }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Grid Gap</Label>
                    <Select
                      value={headerTemplate.advancedLayout.gridGap}
                      onValueChange={(value) => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: {
                          ...prev.advancedLayout,
                          gridGap: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5rem">Small (0.5rem)</SelectItem>
                        <SelectItem value="1rem">Medium (1rem)</SelectItem>
                        <SelectItem value="1.5rem">Large (1.5rem)</SelectItem>
                        <SelectItem value="2rem">XLarge (2rem)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Flex Direction</Label>
                    <Select
                      value={headerTemplate.advancedLayout.flexDirection}
                      onValueChange={(value: 'row' | 'column') => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: {
                          ...prev.advancedLayout,
                          flexDirection: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Horizontal</SelectItem>
                        <SelectItem value="column">Vertical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Justify Content</Label>
                    <Select
                      value={headerTemplate.advancedLayout.justifyContent}
                      onValueChange={(value) => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: {
                          ...prev.advancedLayout,
                          justifyContent: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Align Items</Label>
                    <Select
                      value={headerTemplate.advancedLayout.alignItems}
                      onValueChange={(value) => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: {
                          ...prev.advancedLayout,
                          alignItems: value
                        }
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="stretch">Stretch</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="p-4 space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={headerTemplate.name}
                  onChange={(e) => setHeaderTemplate(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="template-description">Description</Label>
                <Textarea
                  id="template-description"
                  value={headerTemplate.description}
                  onChange={(e) => setHeaderTemplate(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={headerTemplate.category}
                  onValueChange={(value) => setHeaderTemplate(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="bold">Bold</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <h3 className="text-sm font-semibold">Global Styles</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="bg-color">Background</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={headerTemplate.globalStyles.backgroundColor}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, backgroundColor: e.target.value }
                      }))}
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      value={headerTemplate.globalStyles.backgroundColor}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, backgroundColor: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text-color"
                      type="color"
                      value={headerTemplate.globalStyles.textColor}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, textColor: e.target.value }
                      }))}
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      value={headerTemplate.globalStyles.textColor}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, textColor: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="accent-color"
                      type="color"
                      value={headerTemplate.globalStyles.accentColor}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, accentColor: e.target.value }
                      }))}
                      className="w-12 h-9 p-1"
                    />
                    <Input
                      value={headerTemplate.globalStyles.accentColor}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        globalStyles: { ...prev.globalStyles, accentColor: e.target.value }
                      }))}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="font">Font Family</Label>
                  <Select
                    value={headerTemplate.globalStyles.fontFamily}
                    onValueChange={(value) => setHeaderTemplate(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, fontFamily: value }
                    }))}
                  >
                    <SelectTrigger id="font">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Playfair Display, serif">Playfair</SelectItem>
                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                      <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="active">Active</Label>
                <Switch
                  id="active"
                  checked={headerTemplate.isActive}
                  onCheckedChange={(checked) => setHeaderTemplate(prev => ({ ...prev, isActive: checked }))}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Element Properties */}
        {selectedElementData && (
          <div className="w-80 border-r p-4 overflow-y-auto">
            <h3 className="text-sm font-semibold mb-4">Element Properties</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="visible">Visible</Label>
                <Switch
                  id="visible"
                  checked={selectedElementData.visible}
                  onCheckedChange={(checked) => updateElement(selectedElement!, { visible: checked })}
                />
              </div>

              {selectedElementData.type === 'text' && (
                <div>
                  <Label htmlFor="text-content">Text Content</Label>
                  <Textarea
                    id="text-content"
                    value={selectedElementData.content.text}
                    onChange={(e) => updateElement(selectedElement!, { 
                      content: { ...selectedElementData.content, text: e.target.value }
                    })}
                    rows={3}
                  />
                </div>
              )}

              {selectedElementData.type === 'button' && (
                <>
                  <div>
                    <Label htmlFor="button-text">Button Text</Label>
                    <Input
                      id="button-text"
                      value={selectedElementData.content.text}
                      onChange={(e) => updateElement(selectedElement!, { 
                        content: { ...selectedElementData.content, text: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="button-action">Action</Label>
                    <Select
                      value={selectedElementData.content.action}
                      onValueChange={(value) => updateElement(selectedElement!, { 
                        content: { ...selectedElementData.content, action: value }
                      })}
                    >
                      <SelectTrigger id="button-action">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contact">Open Contact</SelectItem>
                        <SelectItem value="download">Download vCard</SelectItem>
                        <SelectItem value="share">Share Card</SelectItem>
                        <SelectItem value="link">External Link</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {/* SVG Shape Specific Controls */}
              {selectedElementData.type === 'svg_shape' && (
                <div className="space-y-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 dark:text-green-200">SVG Shape Settings</h4>
                  
                  <div>
                    <Label>Current Shape: {selectedElementData.content.shapeName || 'None Selected'}</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openSVGShapeSelector(selectedElement!)}
                      className="w-full mt-2"
                    >
                      <Shapes className="w-4 h-4 mr-2" />
                      Change SVG Shape
                    </Button>
                  </div>

                  {selectedElementData.content.svgCode && (
                    <>
                      <div>
                        <Label>Shape Preview</Label>
                        <div className="mt-2 p-4 bg-white dark:bg-gray-800 rounded border flex items-center justify-center h-20">
                          <svg 
                            viewBox={selectedElementData.content.viewBox || '0 0 100 100'} 
                            className="h-full max-w-full"
                            dangerouslySetInnerHTML={{ __html: selectedElementData.content.svgCode }}
                          />
                        </div>
                      </div>

                      <div>
                        <Label>Transform Controls</Label>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <Label className="text-xs">Scale</Label>
                            <Input
                              type="range"
                              min="0.5"
                              max="3"
                              step="0.1"
                              value={(selectedElementData.styles.transform?.match(/scale\(([\d.]+)\)/) || [,'1'])[1]}
                              onChange={(e) => {
                                const currentTransform = selectedElementData.styles.transform || '';
                                const newTransform = currentTransform.replace(/scale\([\d.]+\)/, `scale(${e.target.value})`);
                                const finalTransform = newTransform.includes('scale') ? newTransform : `${newTransform} scale(${e.target.value})`;
                                updateElement(selectedElement!, { 
                                  styles: { ...selectedElementData.styles, transform: finalTransform.trim() }
                                });
                              }}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Rotation</Label>
                            <Input
                              type="range"
                              min="0"
                              max="360"
                              step="15"
                              value={(selectedElementData.styles.transform?.match(/rotate\(([\d.]+)deg\)/) || [,'0'])[1]}
                              onChange={(e) => {
                                const currentTransform = selectedElementData.styles.transform || '';
                                const newTransform = currentTransform.replace(/rotate\([\d.]+deg\)/, `rotate(${e.target.value}deg)`);
                                const finalTransform = newTransform.includes('rotate') ? newTransform : `${newTransform} rotate(${e.target.value}deg)`;
                                updateElement(selectedElement!, { 
                                  styles: { ...selectedElementData.styles, transform: finalTransform.trim() }
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {selectedElementData.type === 'image' && (
                <>
                  <div>
                    <Label htmlFor="image-src">Image URL</Label>
                    <Input
                      id="image-src"
                      value={selectedElementData.content.src}
                      onChange={(e) => updateElement(selectedElement!, { 
                        content: { ...selectedElementData.content, src: e.target.value }
                      })}
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="image-alt">Alt Text</Label>
                    <Input
                      id="image-alt"
                      value={selectedElementData.content.alt}
                      onChange={(e) => updateElement(selectedElement!, { 
                        content: { ...selectedElementData.content, alt: e.target.value }
                      })}
                    />
                  </div>
                </>
              )}

              <Separator />

              <h4 className="text-sm font-semibold">Styling</h4>

              {selectedElementData.type !== 'divider' && (
                <>
                  <div>
                    <Label htmlFor="font-size">Font Size</Label>
                    <Input
                      id="font-size"
                      value={selectedElementData.styles.fontSize || ''}
                      onChange={(e) => updateElement(selectedElement!, { 
                        styles: { ...selectedElementData.styles, fontSize: e.target.value }
                      })}
                      placeholder="1rem"
                    />
                  </div>

                  <div>
                    <Label htmlFor="element-color">Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedElementData.styles.color || '#000000'}
                        onChange={(e) => updateElement(selectedElement!, { 
                          styles: { ...selectedElementData.styles, color: e.target.value }
                        })}
                        className="w-12 h-9 p-1"
                      />
                      <Input
                        id="element-color"
                        value={selectedElementData.styles.color || ''}
                        onChange={(e) => updateElement(selectedElement!, { 
                          styles: { ...selectedElementData.styles, color: e.target.value }
                        })}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="element-bg">Background</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={selectedElementData.styles.backgroundColor || '#ffffff'}
                    onChange={(e) => updateElement(selectedElement!, { 
                      styles: { ...selectedElementData.styles, backgroundColor: e.target.value }
                    })}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    id="element-bg"
                    value={selectedElementData.styles.backgroundColor || ''}
                    onChange={(e) => updateElement(selectedElement!, { 
                      styles: { ...selectedElementData.styles, backgroundColor: e.target.value }
                    })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="padding">Padding</Label>
                <Input
                  id="padding"
                  value={selectedElementData.styles.padding || ''}
                  onChange={(e) => updateElement(selectedElement!, { 
                    styles: { ...selectedElementData.styles, padding: e.target.value }
                  })}
                  placeholder="1rem"
                />
              </div>

              <div>
                <Label htmlFor="margin">Margin</Label>
                <Input
                  id="margin"
                  value={selectedElementData.styles.margin || ''}
                  onChange={(e) => updateElement(selectedElement!, { 
                    styles: { ...selectedElementData.styles, margin: e.target.value }
                  })}
                  placeholder="0.5rem 0"
                />
              </div>

              <div>
                <Label htmlFor="border-radius">Border Radius</Label>
                <Input
                  id="border-radius"
                  value={selectedElementData.styles.borderRadius || ''}
                  onChange={(e) => updateElement(selectedElement!, { 
                    styles: { ...selectedElementData.styles, borderRadius: e.target.value }
                  })}
                  placeholder="0.375rem"
                />
              </div>
            </div>
          </div>
        )}

        {/* Right - Live Preview */}
        {showPreview && (
          <div className="flex-1 p-8 bg-gray-50 dark:bg-gray-900 overflow-auto">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-sm font-semibold mb-4 text-gray-600 dark:text-gray-400">Live Preview</h3>
              
              <div
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                style={{
                  backgroundColor: headerTemplate.globalStyles.backgroundColor,
                  color: headerTemplate.globalStyles.textColor,
                  fontFamily: headerTemplate.globalStyles.fontFamily,
                  padding: headerTemplate.globalStyles.padding,
                  borderRadius: headerTemplate.globalStyles.borderRadius
                }}
              >
                {headerTemplate.elements
                  .filter(el => el.visible)
                  .sort((a, b) => a.order - b.order)
                  .map((element) => (
                    <div
                      key={element.id}
                      style={element.styles}
                      className={selectedElement === element.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      {element.type === 'text' && (
                        <div>{element.content.text}</div>
                      )}
                      
                      {element.type === 'image' && element.content.src && (
                        <img
                          src={element.content.src}
                          alt={element.content.alt}
                          style={{
                            width: element.styles.width,
                            height: element.styles.height,
                            borderRadius: element.styles.borderRadius
                          }}
                        />
                      )}
                      
                      {element.type === 'logo' && (
                        <div style={{ fontWeight: element.styles.fontWeight }}>
                          {element.content.imageUrl ? (
                            <img src={element.content.imageUrl} alt="Logo" />
                          ) : (
                            element.content.text
                          )}
                        </div>
                      )}
                      
                      {element.type === 'tagline' && (
                        <div>{element.content.text}</div>
                      )}
                      
                      {element.type === 'button' && (
                        <button
                          style={{
                            backgroundColor: element.styles.backgroundColor,
                            color: element.styles.color,
                            padding: element.styles.padding,
                            borderRadius: element.styles.borderRadius,
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          {element.content.text}
                        </button>
                      )}
                      
                      {element.type === 'divider' && (
                        <hr
                          style={{
                            height: element.styles.height,
                            backgroundColor: element.styles.backgroundColor,
                            border: 'none',
                            margin: element.styles.margin
                          }}
                        />
                      )}
                      
                      {element.type === 'social' && (
                        <div className="flex gap-3">
                          {element.content.icons?.map((icon: any, index: number) => (
                            <a
                              key={index}
                              href={icon.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: icon.color }}
                            >
                              {icon.svgCode ? (
                                <div dangerouslySetInnerHTML={{ __html: icon.svgCode }} />
                              ) : (
                                <span>{icon.name}</span>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                      
                      {element.type === 'contact' && (
                        <div className="space-y-1">
                          {element.content.email && (
                            <div>Email: {element.content.email}</div>
                          )}
                          {element.content.phone && (
                            <div>Phone: {element.content.phone}</div>
                          )}
                          {element.content.website && (
                            <div>Web: {element.content.website}</div>
                          )}
                        </div>
                      )}

                      {element.type === 'svg_shape' && element.content.svgCode && (
                        <div 
                          className="svg-shape-container"
                          style={{
                            width: element.styles.width || '100px',
                            height: element.styles.height || '100px',
                            opacity: element.styles.opacity || 1,
                            transform: element.styles.transform || 'none'
                          }}
                        >
                          <svg 
                            viewBox={element.content.viewBox || '0 0 100 100'} 
                            className="w-full h-full"
                            dangerouslySetInnerHTML={{ __html: element.content.svgCode }}
                          />
                        </div>
                      )}

                      {element.type === 'layout_container' && (
                        <div 
                          className="layout-container border-2 border-dashed border-gray-300 p-2 min-h-[50px]"
                          style={{
                            display: element.styles.display || 'flex',
                            flexDirection: element.styles.flexDirection || 'row',
                            justifyContent: element.styles.justifyContent || 'center',
                            alignItems: element.styles.alignItems || 'center',
                            gap: element.styles.gap || '1rem'
                          }}
                        >
                          <span className="text-gray-500 text-sm">
                            Container ({element.content.containerType || 'flex'})
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG Shape Selector Modal */}
      {showSVGShapeSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select SVG Shape</CardTitle>
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowSVGShapeSelector(false);
                    setSelectedElementForSVG(null);
                  }}
                >
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="h-full overflow-auto">
              <SVGShapeRenderer 
                onShapeSelect={handleSVGShapeSelect}
                selectedShapes={[]}
                allowMultiple={false}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}