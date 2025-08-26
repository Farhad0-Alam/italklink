import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { svgShapeLibrary } from "@/lib/svg-shapes-library";

interface HeaderElement {
  id: string;
  type: 'text' | 'image' | 'logo' | 'tagline' | 'social' | 'contact' | 'button' | 'divider' | 'svg_shape' | 'layout_container';
  content: any;
  styles: Record<string, any>;
  order: number;
  visible: boolean;
}

interface HeaderTemplate {
  id?: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
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
}

interface HeaderFormBuilderProps {
  onTemplateCreated?: (template: HeaderTemplate) => void;
  editingTemplate?: HeaderTemplate | null;
}

export const HeaderFormBuilder: React.FC<HeaderFormBuilderProps> = ({
  onTemplateCreated,
  editingTemplate
}) => {
  const { toast } = useToast();
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    basicInfo: false,
    globalStyles: false,
    layoutSettings: false,
    elements: false,
    preview: false,
  });

  const [headerTemplate, setHeaderTemplate] = useState<HeaderTemplate>({
    name: editingTemplate?.name || '',
    description: editingTemplate?.description || '',
    category: editingTemplate?.category || 'general',
    isActive: editingTemplate?.isActive ?? true,
    elements: editingTemplate?.elements || [],
    globalStyles: editingTemplate?.globalStyles || {
      backgroundColor: '#22c55e',
      textColor: '#ffffff',
      accentColor: '#16a34a',
      fontFamily: 'Inter, sans-serif',
      containerWidth: '100%',
      padding: '2rem',
      borderRadius: '0.5rem',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    },
    layoutType: editingTemplate?.layoutType || 'standard',
    advancedLayout: editingTemplate?.advancedLayout || {
      columns: 3,
      rows: 2,
      gridGap: '1rem',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundEffects: {
        gradients: [],
        svgOverlays: [],
        patterns: []
      }
    }
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);

  const form = useForm({
    defaultValues: headerTemplate,
  });

  const toggleSection = (k: string) =>
    setCollapsedSections((p) => ({ ...p, [k]: !p[k] }));

  // Save template mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (template: HeaderTemplate) => {
      const response = await fetch('/api/admin/header-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });
      if (!response.ok) throw new Error('Failed to save template');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/header-templates'] });
      toast({ title: 'Template saved successfully!' });
      onTemplateCreated?.(data);
    },
    onError: () => {
      toast({ title: 'Failed to save template', variant: 'destructive' });
    }
  });

  const handleSaveTemplate = () => {
    if (!headerTemplate.name.trim()) {
      toast({ title: 'Please enter a template name', variant: 'destructive' });
      return;
    }
    saveTemplateMutation.mutate(headerTemplate);
  };

  const addElement = (type: HeaderElement['type']) => {
    const newElement: HeaderElement = {
      id: `element-${Date.now()}`,
      type,
      content: getDefaultContent(type),
      styles: getDefaultStyles(type),
      order: headerTemplate.elements.length,
      visible: true
    };

    setHeaderTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const getDefaultContent = (type: HeaderElement['type']) => {
    switch (type) {
      case 'text': return { text: 'Sample Text' };
      case 'image': return { src: '', alt: 'Image' };
      case 'logo': return { text: 'LOGO' };
      case 'tagline': return { text: 'Your Professional Tagline' };
      case 'svg_shape': return { svgCode: '', shapeName: '', viewBox: '0 0 100 100' };
      case 'button': return { text: 'Button', action: 'contact' };
      case 'divider': return {};
      case 'social': return { icons: [] };
      case 'contact': return { email: '', phone: '', website: '' };
      case 'layout_container': return { containerType: 'flex' };
      default: return {};
    }
  };

  const getDefaultStyles = (type: HeaderElement['type']) => {
    const baseStyles = {
      color: headerTemplate.globalStyles.textColor,
      fontFamily: headerTemplate.globalStyles.fontFamily,
      padding: '0.5rem',
      margin: '0'
    };

    switch (type) {
      case 'text':
        return { ...baseStyles, fontSize: '1rem', fontWeight: '400' };
      case 'logo':
        return { ...baseStyles, fontSize: '1.5rem', fontWeight: '700' };
      case 'tagline':
        return { ...baseStyles, fontSize: '0.875rem', fontStyle: 'italic' };
      case 'image':
        return { width: '100px', height: '100px', borderRadius: '0.375rem' };
      case 'button':
        return { 
          ...baseStyles, 
          backgroundColor: headerTemplate.globalStyles.accentColor,
          borderRadius: '0.375rem',
          padding: '0.5rem 1rem'
        };
      case 'svg_shape':
        return { width: '50px', height: '50px', opacity: '1', transform: 'scale(1) rotate(0deg)' };
      case 'divider':
        return { height: '1px', backgroundColor: headerTemplate.globalStyles.textColor, margin: '1rem 0' };
      default:
        return baseStyles;
    }
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
  };

  const selectedElementData = selectedElement 
    ? headerTemplate.elements.find(el => el.id === selectedElement)
    : null;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center text-white">
            <i className="fas fa-layer-group text-talklink-500 mr-3" />
            Header Template Builder
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("basicInfo")}>
              <h3 className="text-lg font-semibold text-blue-300">Template Information</h3>
              <i className={`fas ${collapsedSections.basicInfo ? "fa-chevron-down" : "fa-chevron-up"} text-blue-300`} />
            </div>

            {!collapsedSections.basicInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Template Name</Label>
                  <Input
                    value={headerTemplate.name}
                    onChange={(e) => setHeaderTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter template name..."
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-white">Category</Label>
                  <Select
                    value={headerTemplate.category}
                    onValueChange={(value) => setHeaderTemplate(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
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

                <div className="md:col-span-2">
                  <Label className="text-white">Description</Label>
                  <Textarea
                    value={headerTemplate.description}
                    onChange={(e) => setHeaderTemplate(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this template..."
                    className="bg-slate-700 border-slate-600 text-white"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Global Styles */}
          <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("globalStyles")}>
              <h3 className="text-lg font-semibold text-green-300">Global Styles</h3>
              <i className={`fas ${collapsedSections.globalStyles ? "fa-chevron-down" : "fa-chevron-up"} text-green-300`} />
            </div>

            {!collapsedSections.globalStyles && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Background Color</Label>
                  <div className="flex gap-2">
                    <Input
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
                      className="flex-1 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Text Color</Label>
                  <div className="flex gap-2">
                    <Input
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
                      className="flex-1 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
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
                      className="flex-1 bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white">Font Family</Label>
                  <Select
                    value={headerTemplate.globalStyles.fontFamily}
                    onValueChange={(value) => setHeaderTemplate(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, fontFamily: value }
                    }))}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                      <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                      <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white">Padding</Label>
                  <Input
                    value={headerTemplate.globalStyles.padding}
                    onChange={(e) => setHeaderTemplate(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, padding: e.target.value }
                    }))}
                    placeholder="2rem"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Border Radius</Label>
                  <Input
                    value={headerTemplate.globalStyles.borderRadius}
                    onChange={(e) => setHeaderTemplate(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, borderRadius: e.target.value }
                    }))}
                    placeholder="0.5rem"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Layout Settings */}
          <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("layoutSettings")}>
              <h3 className="text-lg font-semibold text-purple-300">Layout Settings</h3>
              <i className={`fas ${collapsedSections.layoutSettings ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
            </div>

            {!collapsedSections.layoutSettings && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Layout Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-2">
                    {[
                      { v: "standard", label: "Standard" },
                      { v: "split", label: "Split" },
                      { v: "overlay", label: "Overlay" },
                      { v: "geometric", label: "Geometric" },
                      { v: "custom", label: "Custom" },
                    ].map(({ v, label }) => (
                      <div
                        key={v}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors text-center ${
                          headerTemplate.layoutType === v 
                            ? "border-purple-500 bg-purple-500/10" 
                            : "border-slate-600 bg-slate-700"
                        }`}
                        onClick={() => setHeaderTemplate(prev => ({ ...prev, layoutType: v as any }))}
                      >
                        <p className="text-xs text-white">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label className="text-white">Columns</Label>
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={headerTemplate.advancedLayout.columns}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: { ...prev.advancedLayout, columns: parseInt(e.target.value) || 1 }
                      }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Rows</Label>
                    <Input
                      type="number"
                      min="1"
                      max="4"
                      value={headerTemplate.advancedLayout.rows}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: { ...prev.advancedLayout, rows: parseInt(e.target.value) || 1 }
                      }))}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Gap</Label>
                    <Input
                      value={headerTemplate.advancedLayout.gridGap}
                      onChange={(e) => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: { ...prev.advancedLayout, gridGap: e.target.value }
                      }))}
                      placeholder="1rem"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white">Direction</Label>
                    <Select
                      value={headerTemplate.advancedLayout.flexDirection}
                      onValueChange={(value: 'row' | 'column') => setHeaderTemplate(prev => ({
                        ...prev,
                        advancedLayout: { ...prev.advancedLayout, flexDirection: value }
                      }))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Row</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Elements */}
          <div className="bg-orange-900/30 border border-orange-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("elements")}>
              <h3 className="text-lg font-semibold text-orange-300">Header Elements</h3>
              <i className={`fas ${collapsedSections.elements ? "fa-chevron-down" : "fa-chevron-up"} text-orange-300`} />
            </div>

            {!collapsedSections.elements && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Add Element</Label>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
                    {[
                      { type: 'text', label: 'Text', icon: 'fa-font' },
                      { type: 'logo', label: 'Logo', icon: 'fa-crown' },
                      { type: 'image', label: 'Image', icon: 'fa-image' },
                      { type: 'button', label: 'Button', icon: 'fa-hand-pointer' },
                      { type: 'svg_shape', label: 'Shape', icon: 'fa-shapes' },
                    ].map(({ type, label, icon }) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => addElement(type as HeaderElement['type'])}
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 flex flex-col items-center p-2 h-16"
                      >
                        <i className={`fas ${icon} mb-1`} />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {headerTemplate.elements.length > 0 && (
                  <div>
                    <Label className="text-white">Current Elements</Label>
                    <div className="space-y-2 mt-2">
                      {headerTemplate.elements.map((element, index) => (
                        <div
                          key={element.id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            selectedElement === element.id
                              ? "border-orange-500 bg-orange-500/10"
                              : "border-slate-600 bg-slate-700"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-white text-sm font-medium">
                              {index + 1}. {element.type.replace('_', ' ').toUpperCase()}
                            </span>
                            {element.type === 'text' && (
                              <span className="text-slate-400 text-sm">
                                "{element.content.text}"
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedElement(
                                selectedElement === element.id ? null : element.id
                              )}
                              className="text-white hover:bg-slate-600"
                            >
                              <i className="fas fa-edit" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeElement(element.id)}
                              className="text-red-400 hover:bg-red-900/20"
                            >
                              <i className="fas fa-trash" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Element Editor */}
                {selectedElementData && (
                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 space-y-3">
                    <h4 className="text-white font-medium">
                      Edit {selectedElementData.type.replace('_', ' ').toUpperCase()}
                    </h4>
                    
                    {selectedElementData.type === 'text' && (
                      <div>
                        <Label className="text-white">Text Content</Label>
                        <Input
                          value={selectedElementData.content.text || ''}
                          onChange={(e) => updateElement(selectedElement!, {
                            content: { ...selectedElementData.content, text: e.target.value }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    )}

                    {selectedElementData.type === 'svg_shape' && (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-white">Select Shape</Label>
                          <Select
                            value={selectedElementData.content.shapeName || ''}
                            onValueChange={(shapeName) => {
                              const shape = svgShapeLibrary.getAllShapes().find(s => s.name === shapeName);
                              if (shape) {
                                updateElement(selectedElement!, {
                                  content: {
                                    ...selectedElementData.content,
                                    shapeName,
                                    svgCode: shape.svgCode,
                                    viewBox: shape.viewBox
                                  }
                                });
                              }
                            }}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue placeholder="Choose a shape..." />
                            </SelectTrigger>
                            <SelectContent>
                              {svgShapeLibrary.getAllShapes().map(shape => (
                                <SelectItem key={shape.name} value={shape.name}>
                                  {shape.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-white">Width</Label>
                            <Input
                              value={selectedElementData.styles.width || '50px'}
                              onChange={(e) => updateElement(selectedElement!, {
                                styles: { ...selectedElementData.styles, width: e.target.value }
                              })}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Height</Label>
                            <Input
                              value={selectedElementData.styles.height || '50px'}
                              onChange={(e) => updateElement(selectedElement!, {
                                styles: { ...selectedElementData.styles, height: e.target.value }
                              })}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white">Padding</Label>
                        <Input
                          value={selectedElementData.styles.padding || '0.5rem'}
                          onChange={(e) => updateElement(selectedElement!, {
                            styles: { ...selectedElementData.styles, padding: e.target.value }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-white">Margin</Label>
                        <Input
                          value={selectedElementData.styles.margin || '0'}
                          onChange={(e) => updateElement(selectedElement!, {
                            styles: { ...selectedElementData.styles, margin: e.target.value }
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Preview */}
          <div className="bg-gray-900/30 border border-gray-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("preview")}>
              <h3 className="text-lg font-semibold text-gray-300">Live Preview</h3>
              <i className={`fas ${collapsedSections.preview ? "fa-chevron-down" : "fa-chevron-up"} text-gray-300`} />
            </div>

            {!collapsedSections.preview && (
              <div className="bg-white rounded-lg p-4 min-h-32">
                <div
                  style={{
                    backgroundColor: headerTemplate.globalStyles.backgroundColor,
                    color: headerTemplate.globalStyles.textColor,
                    fontFamily: headerTemplate.globalStyles.fontFamily,
                    padding: headerTemplate.globalStyles.padding,
                    borderRadius: headerTemplate.globalStyles.borderRadius,
                    display: 'flex',
                    flexDirection: headerTemplate.advancedLayout.flexDirection,
                    gap: headerTemplate.advancedLayout.gridGap,
                    minHeight: '120px',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {headerTemplate.elements.length === 0 ? (
                    <div className="text-center opacity-60">
                      <p>Add elements to see preview</p>
                    </div>
                  ) : (
                    headerTemplate.elements
                      .filter(el => el.visible)
                      .sort((a, b) => a.order - b.order)
                      .map(element => (
                        <div key={element.id} style={element.styles}>
                          {element.type === 'text' && element.content.text}
                          {element.type === 'logo' && (element.content.text || 'LOGO')}
                          {element.type === 'svg_shape' && element.content.svgCode && (
                            <div
                              dangerouslySetInnerHTML={{ __html: element.content.svgCode }}
                              style={{
                                width: element.styles.width,
                                height: element.styles.height
                              }}
                            />
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveTemplate}
              disabled={saveTemplateMutation.isPending}
              className="bg-talklink-500 hover:bg-talklink-600 text-white px-8"
            >
              {saveTemplateMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <i className="fas fa-save mr-2" />
                  Save Template
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};