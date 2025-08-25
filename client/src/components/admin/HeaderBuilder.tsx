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
  Sparkles
} from 'lucide-react';

interface HeaderElement {
  id: string;
  type: 'text' | 'image' | 'logo' | 'tagline' | 'social' | 'contact' | 'button' | 'divider';
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
  };
  order: number;
  visible: boolean;
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
    category: 'professional',
    isActive: true
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(true);

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
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}