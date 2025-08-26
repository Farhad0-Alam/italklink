import { useState, useEffect, useRef } from "react";
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
import { SVG_SHAPES_LIBRARY, applySVGShapeColors } from "@/lib/svg-shapes-library";
import { fileToBase64, validateImageFile } from "@/lib/storage";

interface HeaderElement {
  id: string;
  type: 'profile_picture' | 'logo' | 'header_image' | 'name' | 'title' | 'company' | 'svg_shape';
  content: any;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styles: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    borderRadius?: string;
    zIndex?: number;
  };
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
    headerHeight: number;
    headerWidth: number;
  };
}

interface AdvancedHeaderBuilderProps {
  onTemplateCreated?: (template: HeaderTemplate) => void;
  editingTemplate?: HeaderTemplate | null;
}

export const AdvancedHeaderBuilder: React.FC<AdvancedHeaderBuilderProps> = ({
  onTemplateCreated,
  editingTemplate
}) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    basicInfo: false,
    globalStyles: false,
    elements: false,
    svgShapes: false,
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
      headerHeight: 300,
      headerWidth: 800,
    },
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
      position: {
        x: 50 + (headerTemplate.elements.length * 20),
        y: 50 + (headerTemplate.elements.length * 20),
        width: type === 'svg_shape' ? 60 : type.includes('image') || type === 'profile_picture' || type === 'logo' ? 100 : 200,
        height: type === 'svg_shape' ? 60 : type.includes('image') || type === 'profile_picture' || type === 'logo' ? 100 : 40
      },
      styles: getDefaultStyles(type),
      visible: true
    };

    setHeaderTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));
  };

  const getDefaultContent = (type: HeaderElement['type']) => {
    switch (type) {
      case 'profile_picture': return { src: '', alt: 'Profile Picture' };
      case 'logo': return { src: '', alt: 'Logo', text: 'LOGO' };
      case 'header_image': return { src: '', alt: 'Header Background' };
      case 'name': return { text: 'Your Name' };
      case 'title': return { text: 'Professional Title' };
      case 'company': return { text: 'Company Name' };
      case 'svg_shape': return { svgCode: '', shapeName: '', viewBox: '0 0 100 100', colors: { color1: '#ffffff', color2: '#22c55e' } };
      default: return {};
    }
  };

  const getDefaultStyles = (type: HeaderElement['type']) => {
    const baseStyles = {
      color: headerTemplate.globalStyles.textColor,
      zIndex: 1
    };

    switch (type) {
      case 'name': return { ...baseStyles, fontSize: '24px', fontWeight: '700' };
      case 'title': return { ...baseStyles, fontSize: '16px', fontWeight: '400' };
      case 'company': return { ...baseStyles, fontSize: '14px', fontWeight: '500' };
      case 'profile_picture': return { borderRadius: '50%', zIndex: 2 };
      case 'logo': return { borderRadius: '8px', zIndex: 2 };
      case 'header_image': return { borderRadius: '0px', zIndex: 0 };
      case 'svg_shape': return { zIndex: 1 };
      default: return baseStyles;
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
    setSelectedElement(null);
  };

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    setSelectedElement(elementId);
    setIsDragging(true);
    
    const element = headerTemplate.elements.find(el => el.id === elementId);
    if (element && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - element.position.x,
        y: e.clientY - rect.top - element.position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && selectedElement && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      const newX = Math.max(0, Math.min(headerTemplate.globalStyles.headerWidth - 50, e.clientX - rect.left - dragOffset.x));
      const newY = Math.max(0, Math.min(headerTemplate.globalStyles.headerHeight - 30, e.clientY - rect.top - dragOffset.y));
      
      updateElement(selectedElement, {
        position: {
          ...headerTemplate.elements.find(el => el.id === selectedElement)!.position,
          x: newX,
          y: newY
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    elementId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateImageFile(file)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      updateElement(elementId, {
        content: { ...headerTemplate.elements.find(el => el.id === elementId)?.content, src: base64 }
      });
      toast({ title: "Image uploaded", description: "Your image has been uploaded successfully" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSVGUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    elementId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid SVG file",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const svgContent = await file.text();
      
      // Extract viewBox if it exists
      const viewBoxMatch = svgContent.match(/viewBox="([^"]+)"/);
      const viewBox = viewBoxMatch ? viewBoxMatch[1] : "0 0 100 100";
      
      // Extract the inner SVG content (remove <svg> tags)
      const svgCodeMatch = svgContent.match(/<svg[^>]*>(.*?)<\/svg>/s);
      const svgCode = svgCodeMatch ? svgCodeMatch[1] : svgContent;

      updateElement(elementId, {
        content: {
          ...headerTemplate.elements.find(el => el.id === elementId)?.content,
          shapeName: `Custom: ${file.name}`,
          svgCode: svgCode,
          viewBox: viewBox,
          isCustom: true
        }
      });
      
      toast({ title: "SVG uploaded", description: "Your custom SVG has been uploaded successfully" });
    } catch (e) {
      toast({
        title: "Upload failed",
        description: e instanceof Error ? e.message : "Failed to upload SVG",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const selectedElementData = selectedElement 
    ? headerTemplate.elements.find(el => el.id === selectedElement)
    : null;

  const renderElement = (element: HeaderElement) => {
    const style = {
      position: 'absolute' as const,
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.position.width}px`,
      height: `${element.position.height}px`,
      zIndex: element.styles.zIndex || 1,
      cursor: 'move',
      border: selectedElement === element.id ? '2px solid #22c55e' : 'none',
      ...element.styles
    };

    switch (element.type) {
      case 'profile_picture':
      case 'logo':
      case 'header_image':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center bg-slate-200 rounded overflow-hidden"
          >
            {element.content.src ? (
              <img src={element.content.src} alt={element.content.alt} className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-slate-600 text-xs">
                <i className="fas fa-image mb-1" />
                <p>{element.type.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        );

      case 'name':
      case 'title':
      case 'company':
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            className="flex items-center justify-center"
          >
            <span style={{ fontSize: element.styles.fontSize, fontWeight: element.styles.fontWeight, color: element.styles.color }}>
              {element.content.text || element.type}
            </span>
          </div>
        );

      case 'svg_shape':
        if (!element.content.svgCode) return null;
        const coloredSvg = applySVGShapeColors(element.content.svgCode, element.content.colors || {});
        return (
          <div
            key={element.id}
            style={style}
            onMouseDown={(e) => handleMouseDown(e, element.id)}
            dangerouslySetInnerHTML={{ __html: `<svg viewBox="${element.content.viewBox}" style="width: 100%; height: 100%;">${coloredSvg}</svg>` }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center text-white">
            <i className="fas fa-magic text-talklink-500 mr-3" />
            Advanced Header Builder
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
              <h3 className="text-lg font-semibold text-green-300">Header Dimensions & Colors</h3>
              <i className={`fas ${collapsedSections.globalStyles ? "fa-chevron-down" : "fa-chevron-up"} text-green-300`} />
            </div>

            {!collapsedSections.globalStyles && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white">Header Width</Label>
                  <Input
                    type="number"
                    value={headerTemplate.globalStyles.headerWidth}
                    onChange={(e) => setHeaderTemplate(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, headerWidth: parseInt(e.target.value) || 800 }
                    }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>

                <div>
                  <Label className="text-white">Header Height</Label>
                  <Input
                    type="number"
                    value={headerTemplate.globalStyles.headerHeight}
                    onChange={(e) => setHeaderTemplate(prev => ({
                      ...prev,
                      globalStyles: { ...prev.globalStyles, headerHeight: parseInt(e.target.value) || 300 }
                    }))}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
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
                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                      <SelectItem value="Poppins, sans-serif">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

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
              </div>
            )}
          </div>

          {/* Core Elements */}
          <div className="bg-orange-900/30 border border-orange-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("elements")}>
              <h3 className="text-lg font-semibold text-orange-300">Core Elements</h3>
              <i className={`fas ${collapsedSections.elements ? "fa-chevron-down" : "fa-chevron-up"} text-orange-300`} />
            </div>

            {!collapsedSections.elements && (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Add Core Elements</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                    {[
                      { type: 'profile_picture', label: 'Profile', icon: 'fa-user-circle' },
                      { type: 'logo', label: 'Logo', icon: 'fa-crown' },
                      { type: 'header_image', label: 'Header Img', icon: 'fa-image' },
                      { type: 'name', label: 'Name', icon: 'fa-font' },
                      { type: 'title', label: 'Title', icon: 'fa-briefcase' },
                      { type: 'company', label: 'Company', icon: 'fa-building' },
                    ].map(({ type, label, icon }) => (
                      <Button
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => addElement(type as HeaderElement['type'])}
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 flex flex-col items-center p-3 h-16"
                      >
                        <i className={`fas ${icon} mb-1`} />
                        <span className="text-xs">{label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Current Elements List */}
                {headerTemplate.elements.filter(el => el.type !== 'svg_shape').length > 0 && (
                  <div>
                    <Label className="text-white">Current Elements</Label>
                    <div className="space-y-2 mt-2">
                      {headerTemplate.elements.filter(el => el.type !== 'svg_shape').map((element, index) => (
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
                              {element.type.replace('_', ' ').toUpperCase()}
                            </span>
                            <span className="text-slate-400 text-xs">
                              x:{element.position.x} y:{element.position.y}
                            </span>
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
              </div>
            )}
          </div>

          {/* SVG Shapes */}
          <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("svgShapes")}>
              <h3 className="text-lg font-semibold text-purple-300">SVG Shapes & Colors</h3>
              <i className={`fas ${collapsedSections.svgShapes ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
            </div>

            {!collapsedSections.svgShapes && (
              <div className="space-y-4">
                <Button
                  variant="outline"
                  onClick={() => addElement('svg_shape')}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  <i className="fas fa-shapes mr-2" />
                  Add SVG Shape
                </Button>

                {headerTemplate.elements.filter(el => el.type === 'svg_shape').map((element) => (
                  <div key={element.id} className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-white font-medium">SVG Shape</h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeElement(element.id)}
                        className="text-red-400 hover:bg-red-900/20"
                      >
                        <i className="fas fa-trash" />
                      </Button>
                    </div>
                    
                    <div>
                      <Label className="text-white">Select Shape</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2 max-h-64 overflow-y-auto">
                        {SVG_SHAPES_LIBRARY.map(shape => {
                          const isSelected = element.content.shapeName === shape.name;
                          const previewSvg = applySVGShapeColors(shape.svgCode, { color1: '#22c55e', color2: '#16a34a' });
                          
                          return (
                            <div
                              key={shape.name}
                              className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                                isSelected 
                                  ? "border-purple-500 bg-purple-500/10" 
                                  : "border-slate-600 bg-slate-700 hover:border-purple-400"
                              }`}
                              onClick={() => {
                                updateElement(element.id, {
                                  content: {
                                    ...element.content,
                                    shapeName: shape.name,
                                    svgCode: shape.svgCode,
                                    viewBox: shape.viewBox
                                  }
                                });
                              }}
                            >
                              <div className="aspect-square mb-2 bg-white rounded flex items-center justify-center p-2">
                                <div
                                  style={{ width: '100%', height: '100%' }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: `<svg viewBox="${shape.viewBox}" style="width: 100%; height: 100%;">${previewSvg}</svg>` 
                                  }}
                                />
                              </div>
                              <p className="text-xs text-white text-center font-medium">{shape.name}</p>
                              <p className="text-xs text-slate-400 text-center">{shape.category}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white">Upload Custom SVG</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById(`svg-upload-${element.id}`)?.click()}
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full mt-2"
                      >
                        <i className="fas fa-upload mr-2" />
                        Upload SVG File
                      </Button>
                      <input
                        id={`svg-upload-${element.id}`}
                        type="file"
                        accept=".svg"
                        onChange={(e) => handleSVGUpload(e, element.id)}
                        className="hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white">Primary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={element.content.colors?.color1 || '#ffffff'}
                            onChange={(e) => updateElement(element.id, {
                              content: {
                                ...element.content,
                                colors: { ...element.content.colors, color1: e.target.value }
                              }
                            })}
                            className="w-12 h-9 p-1"
                          />
                          <Input
                            value={element.content.colors?.color1 || '#ffffff'}
                            onChange={(e) => updateElement(element.id, {
                              content: {
                                ...element.content,
                                colors: { ...element.content.colors, color1: e.target.value }
                              }
                            })}
                            className="flex-1 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Secondary Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={element.content.colors?.color2 || '#22c55e'}
                            onChange={(e) => updateElement(element.id, {
                              content: {
                                ...element.content,
                                colors: { ...element.content.colors, color2: e.target.value }
                              }
                            })}
                            className="w-12 h-9 p-1"
                          />
                          <Input
                            value={element.content.colors?.color2 || '#22c55e'}
                            onChange={(e) => updateElement(element.id, {
                              content: {
                                ...element.content,
                                colors: { ...element.content.colors, color2: e.target.value }
                              }
                            })}
                            className="flex-1 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Element Editor */}
          {selectedElementData && (
            <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4 space-y-3">
              <h4 className="text-white font-medium">
                Edit {selectedElementData.type.replace('_', ' ').toUpperCase()}
              </h4>
              
              {(selectedElementData.type === 'name' || selectedElementData.type === 'title' || selectedElementData.type === 'company') && (
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

              {(selectedElementData.type === 'profile_picture' || selectedElementData.type === 'logo' || selectedElementData.type === 'header_image') && (
                <div>
                  <Label className="text-white">Upload Image</Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById(`upload-${selectedElement}`)?.click()}
                    disabled={isUploading}
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full"
                  >
                    <i className="fas fa-upload mr-2" />
                    {isUploading ? 'Uploading...' : 'Upload Image'}
                  </Button>
                  <input
                    id={`upload-${selectedElement}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, selectedElement!)}
                    className="hidden"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-white">X Position</Label>
                  <Input
                    type="number"
                    value={selectedElementData.position.x}
                    onChange={(e) => updateElement(selectedElement!, {
                      position: { ...selectedElementData.position, x: parseInt(e.target.value) || 0 }
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Y Position</Label>
                  <Input
                    type="number"
                    value={selectedElementData.position.y}
                    onChange={(e) => updateElement(selectedElement!, {
                      position: { ...selectedElementData.position, y: parseInt(e.target.value) || 0 }
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Width</Label>
                  <Input
                    type="number"
                    value={selectedElementData.position.width}
                    onChange={(e) => updateElement(selectedElement!, {
                      position: { ...selectedElementData.position, width: parseInt(e.target.value) || 50 }
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Height</Label>
                  <Input
                    type="number"
                    value={selectedElementData.position.height}
                    onChange={(e) => updateElement(selectedElement!, {
                      position: { ...selectedElementData.position, height: parseInt(e.target.value) || 30 }
                    })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>

              {(selectedElementData.type === 'name' || selectedElementData.type === 'title' || selectedElementData.type === 'company') && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white">Font Size</Label>
                    <Input
                      value={selectedElementData.styles.fontSize || '16px'}
                      onChange={(e) => updateElement(selectedElement!, {
                        styles: { ...selectedElementData.styles, fontSize: e.target.value }
                      })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Font Weight</Label>
                    <Select
                      value={selectedElementData.styles.fontWeight || '400'}
                      onValueChange={(value) => updateElement(selectedElement!, {
                        styles: { ...selectedElementData.styles, fontWeight: value }
                      })}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semi Bold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-white">Text Color</Label>
                    <Input
                      type="color"
                      value={selectedElementData.styles.color || '#ffffff'}
                      onChange={(e) => updateElement(selectedElement!, {
                        styles: { ...selectedElementData.styles, color: e.target.value }
                      })}
                      className="w-full h-9"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Preview */}
          <div className="bg-gray-900/30 border border-gray-600/30 rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-300">Live Preview - Drag Elements to Position</h3>
            
            <div className="bg-white rounded-lg p-4 overflow-hidden">
              <div
                ref={previewRef}
                style={{
                  backgroundColor: headerTemplate.globalStyles.backgroundColor,
                  width: `${headerTemplate.globalStyles.headerWidth}px`,
                  height: `${headerTemplate.globalStyles.headerHeight}px`,
                  position: 'relative',
                  fontFamily: headerTemplate.globalStyles.fontFamily,
                  margin: '0 auto',
                  cursor: isDragging ? 'grabbing' : 'grab'
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {headerTemplate.elements.map(renderElement)}
                
                {headerTemplate.elements.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-white opacity-60">
                    <div className="text-center">
                      <i className="fas fa-plus-circle text-4xl mb-2" />
                      <p>Add elements to start building your header</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-sm text-gray-400 text-center">
              💡 Click and drag elements to position them freely. Use the element editor for precise control.
            </div>
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