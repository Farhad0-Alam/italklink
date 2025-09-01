import { useState, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { HeaderTemplate, HeaderElement } from "@shared/schema";
import { SVG_SHAPES_LIBRARY, applySVGShapeColors } from "@/lib/svg-shapes-library";

interface AdvancedHeaderBuilderProps {
  editingTemplate?: HeaderTemplate;
}

export const AdvancedHeaderBuilder: React.FC<AdvancedHeaderBuilderProps> = ({ 
  editingTemplate 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Element interaction states
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const previewRef = useRef<HTMLDivElement>(null);

  // Tool States
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'move'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [pathPoints, setPathPoints] = useState<{
    x: number;
    y: number;
    handleIn?: { x: number; y: number };
    handleOut?: { x: number; y: number };
    type: 'point' | 'curve';
  }[]>([]);
  const [currentHandleIndex, setCurrentHandleIndex] = useState<number | null>(null);
  const [isDraggingHandle, setIsDraggingHandle] = useState(false);

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
    onSuccess: () => {
      toast({
        title: "Template saved successfully!",
        description: "Your header template has been saved",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/header-templates'] });
    },
    onError: () => {
      toast({
        title: "Failed to save template",
        description: "Please try again",
        variant: "destructive",
      });
    }
  });

  const handleSaveTemplate = () => {
    if (!headerTemplate.name.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your template",
        variant: "destructive",
      });
      return;
    }
    saveTemplateMutation.mutate(headerTemplate);
  };

  const addElement = (type: HeaderElement['type']) => {
    const newElement: HeaderElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position: { x: 50, y: 50, width: 200, height: 100 },
      content: type === 'text' 
        ? { text: 'Sample Text' }
        : type === 'image'
        ? { src: '', alt: 'Image' }
        : type === 'svg_shape'
        ? { 
            shapeName: 'Rectangle',
            svgCode: '<rect width="100%" height="100%" fill="{color1}" stroke="{color2}" stroke-width="2"/>',
            viewBox: '0 0 100 100',
            colors: { color1: '#22c55e', color2: '#16a34a' }
          }
        : {},
      styles: {},
      visible: true,
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

  const handleMouseDown = (e: React.MouseEvent, elementId?: string) => {
    e.preventDefault();
    
    if (!previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (activeTool === 'pen') {
      // Pen tool drawing mode
      if (!isDrawing) {
        // Start new path
        setIsDrawing(true);
        setPathPoints([{ x, y, type: 'point' }]);
      } else {
        // Add point to current path
        setPathPoints(prev => [...prev, { x, y, type: 'point' }]);
      }
      return;
    }

    if (activeTool === 'select' && elementId) {
      setSelectedElement(elementId);
      
      {
        setIsDragging(true);
        const element = headerTemplate.elements.find(el => el.id === elementId);
        if (element) {
          setDragOffset({
            x: x - element.position.x,
            y: y - element.position.y
          });
        }
      }
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent, elementId: string, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeHandle(handle);
    setSelectedElement(elementId);
    
    const element = headerTemplate.elements.find(el => el.id === elementId);
    if (element && previewRef.current) {
      const rect = previewRef.current.getBoundingClientRect();
      setResizeStart({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        width: element.position.width,
        height: element.position.height
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    if (isDragging && selectedElement && !isResizing) {
      const newX = Math.max(0, Math.min(headerTemplate.globalStyles.headerWidth - 50, currentX - dragOffset.x));
      const newY = Math.max(0, Math.min(headerTemplate.globalStyles.headerHeight - 30, currentY - dragOffset.y));

      updateElement(selectedElement, {
        position: {
          ...headerTemplate.elements.find(el => el.id === selectedElement)!.position,
          x: newX,
          y: newY
        }
      });
    }

    if (isResizing && selectedElement && resizeHandle) {
      const element = headerTemplate.elements.find(el => el.id === selectedElement)!;
      const deltaX = currentX - resizeStart.x;
      const deltaY = currentY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;
      let newX = element.position.x;
      let newY = element.position.y;

      // Handle different resize directions
      if (resizeHandle.includes('e')) {
        newWidth = Math.max(20, resizeStart.width + deltaX);
      }
      if (resizeHandle.includes('w')) {
        newWidth = Math.max(20, resizeStart.width - deltaX);
        newX = Math.min(element.position.x + element.position.width - 20, element.position.x + deltaX);
      }
      if (resizeHandle.includes('s')) {
        newHeight = Math.max(20, resizeStart.height + deltaY);
      }
      if (resizeHandle.includes('n')) {
        newHeight = Math.max(20, resizeStart.height - deltaY);
        newY = Math.min(element.position.y + element.position.height - 20, element.position.y + deltaY);
      }

      // Constrain to canvas bounds
      newWidth = Math.min(newWidth, headerTemplate.globalStyles.headerWidth - newX);
      newHeight = Math.min(newHeight, headerTemplate.globalStyles.headerHeight - newY);

      updateElement(selectedElement, {
        position: {
          x: Math.max(0, newX),
          y: Math.max(0, newY),
          width: Math.min(newWidth, headerTemplate.globalStyles.headerWidth - newX),
          height: Math.min(newHeight, headerTemplate.globalStyles.headerHeight - newY)
        }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const finishPath = () => {
    if (pathPoints.length < 2) {
      setPathPoints([]);
      setIsDrawing(false);
      return;
    }

    // Convert path to SVG with Bezier curves
    const pathData = pathPointsToSVG(pathPoints);
    const bounds = getPathPointsBounds(pathPoints);
    
    // Create new SVG element
    const newElement: HeaderElement = {
      id: `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'svg_shape',
      position: {
        x: bounds.minX,
        y: bounds.minY,
        width: bounds.width,
        height: bounds.height
      },
      content: {
        shapeName: 'Custom Drawn Path',
        svgCode: `<path d="${pathData}" fill="{color1}" stroke="{color2}" stroke-width="2"/>`,
        viewBox: `0 0 ${bounds.width} ${bounds.height}`,
        colors: { color1: '#22c55e', color2: '#16a34a' },
        isCustom: true,
        isDrawn: true
      },
      styles: {
        zIndex: 10
      },
      visible: true,
    };

    setHeaderTemplate(prev => ({
      ...prev,
      elements: [...prev.elements, newElement]
    }));

    // Reset drawing state
    setPathPoints([]);
    setIsDrawing(false);
    setActiveTool('select');
    setSelectedElement(newElement.id);
  };

  const cancelPath = () => {
    setPathPoints([]);
    setIsDrawing(false);
    setActiveTool('select');
  };

  const pathPointsToSVG = (points: typeof pathPoints): string => {
    if (points.length < 2) return '';
    
    const bounds = getPathPointsBounds(points);
    const normalizedPoints = points.map(p => ({
      ...p,
      x: p.x - bounds.minX,
      y: p.y - bounds.minY,
      handleIn: p.handleIn ? { x: p.handleIn.x - bounds.minX, y: p.handleIn.y - bounds.minY } : undefined,
      handleOut: p.handleOut ? { x: p.handleOut.x - bounds.minX, y: p.handleOut.y - bounds.minY } : undefined
    }));

    let path = `M ${normalizedPoints[0].x} ${normalizedPoints[0].y}`;
    
    for (let i = 1; i < normalizedPoints.length; i++) {
      const current = normalizedPoints[i];
      const previous = normalizedPoints[i - 1];
      
      if (current.type === 'curve' && previous.handleOut && current.handleIn) {
        // Cubic Bezier curve
        path += ` C ${previous.handleOut.x} ${previous.handleOut.y} ${current.handleIn.x} ${current.handleIn.y} ${current.x} ${current.y}`;
      } else {
        // Straight line
        path += ` L ${current.x} ${current.y}`;
      }
    }
    
    return path;
  };

  const getPathPointsBounds = (points: typeof pathPoints) => {
    if (points.length === 0) return { minX: 0, minY: 0, width: 100, height: 100 };
    
    const allPoints = points.flatMap(p => [
      { x: p.x, y: p.y },
      ...(p.handleIn ? [p.handleIn] : []),
      ...(p.handleOut ? [p.handleOut] : [])
    ]);
    
    const xs = allPoints.map(p => p.x);
    const ys = allPoints.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    return {
      minX,
      minY,
      width: Math.max(50, maxX - minX + 20),
      height: Math.max(50, maxY - minY + 20)
    };
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    elementId: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      updateElement(elementId, {
        content: { src, alt: file.name }
      });
    };
    reader.readAsDataURL(file);
  };

  const selectedElementData = selectedElement 
    ? headerTemplate.elements.find(el => el.id === selectedElement)
    : null;

  const renderSelectionHandles = (element: HeaderElement) => {
    if (selectedElement !== element.id || activeTool !== 'select') return null;

    const handleStyle = {
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      backgroundColor: '#22c55e',
      border: '1px solid #ffffff',
      borderRadius: '1px',
      cursor: 'pointer',
      zIndex: 1000
    };

    const resizeHandles = [
      { id: 'nw', style: { ...handleStyle, top: '-4px', left: '-4px', cursor: 'nw-resize' } },
      { id: 'n', style: { ...handleStyle, top: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 'n-resize' } },
      { id: 'ne', style: { ...handleStyle, top: '-4px', right: '-4px', cursor: 'ne-resize' } },
      { id: 'e', style: { ...handleStyle, top: '50%', right: '-4px', transform: 'translateY(-50%)', cursor: 'e-resize' } },
      { id: 'se', style: { ...handleStyle, bottom: '-4px', right: '-4px', cursor: 'se-resize' } },
      { id: 's', style: { ...handleStyle, bottom: '-4px', left: '50%', transform: 'translateX(-50%)', cursor: 's-resize' } },
      { id: 'sw', style: { ...handleStyle, bottom: '-4px', left: '-4px', cursor: 'sw-resize' } },
      { id: 'w', style: { ...handleStyle, top: '50%', left: '-4px', transform: 'translateY(-50%)', cursor: 'w-resize' } }
    ];

    // Rotation handle
    const rotateHandle = {
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      backgroundColor: '#3b82f6',
      border: '1px solid #ffffff',
      borderRadius: '50%',
      cursor: 'grab',
      top: '-20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 1000
    };

    return (
      <>
        {/* Resize handles */}
        {resizeHandles.map(handle => (
          <div
            key={handle.id}
            style={handle.style}
            onMouseDown={(e) => handleResizeMouseDown(e, element.id, handle.id)}
          />
        ))}
        
        {/* Rotation handle */}
        <div
          style={rotateHandle}
          onMouseDown={(e) => handleRotateMouseDown(e, element.id)}
          title="Drag to rotate"
        />
        
        {/* Rotation line */}
        <div
          style={{
            position: 'absolute',
            width: '1px',
            height: '16px',
            backgroundColor: '#3b82f6',
            top: '-16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 999
          }}
        />
      </>
    );
  };

  const handleRotateMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // TODO: Implement rotation logic
    console.log('Rotation not yet implemented');
  };

  const renderElement = (element: HeaderElement) => {
    const isSelected = selectedElement === element.id;
    const style = {
      position: 'absolute' as const,
      left: `${element.position.x}px`,
      top: `${element.position.y}px`,
      width: `${element.position.width}px`,
      height: `${element.position.height}px`,
      zIndex: element.styles.zIndex || 1,
      border: isSelected ? '2px solid #22c55e' : 'none',
      cursor: activeTool === 'select' ? (isDragging ? 'grabbing' : 'grab') : 'default',
      ...element.styles,
    };

    switch (element.type) {
      case 'text':
        return (
          <div key={element.id} style={{ position: 'relative' }}>
            <div
              style={style}
              onMouseDown={(e) => activeTool === 'pen' ? handleMouseDown(e) : handleMouseDown(e, element.id)}
              className="flex items-center justify-center text-center"
            >
              {element.content.text}
            </div>
            {renderSelectionHandles(element)}
          </div>
        );

      case 'image':
        return (
          <div key={element.id} style={{ position: 'relative' }}>
            <div
              style={style}
              onMouseDown={(e) => activeTool === 'pen' ? handleMouseDown(e) : handleMouseDown(e, element.id)}
              className="flex items-center justify-center bg-slate-200 rounded overflow-hidden"
            >
              {element.content.src ? (
                <img src={element.content.src} alt={element.content.alt} className="w-full h-full object-cover" />
              ) : (
                <div className="text-slate-600 text-center">
                  <i className="fas fa-image text-2xl mb-2" />
                  <p>{element.type.replace('_', ' ')}</p>
                </div>
              )}
            </div>
            {renderSelectionHandles(element)}
          </div>
        );

      case 'svg_shape':
        if (!element.content.svgCode) return null;
        const coloredSvg = applySVGShapeColors(element.content.svgCode, element.content.colors || {});
        return (
          <div key={element.id} style={{ position: 'relative' }}>
            <div
              style={style}
              onMouseDown={(e) => activeTool === 'pen' ? handleMouseDown(e) : handleMouseDown(e, element.id)}
              dangerouslySetInnerHTML={{ __html: `<svg viewBox="${element.content.viewBox}" style="width: 100%; height: 100%;">${coloredSvg}</svg>` }}
            />
            {renderSelectionHandles(element)}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center text-white mb-2">
            <i className="fas fa-magic text-talklink-500 mr-3" />
            Advanced Header Builder
          </h1>
          <p className="text-slate-300">
            Create professional header templates with drag & drop positioning, custom elements, and advanced styling
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column: Element Controls */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-6 space-y-6">
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
                    </div>
                  )}
                </div>

                {/* Professional Tools */}
                <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("svgShapes")}>
                    <h3 className="text-lg font-semibold text-purple-300">Professional Tools</h3>
                    <i className={`fas ${collapsedSections.svgShapes ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
                  </div>

                  {!collapsedSections.svgShapes && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTool('select')}
                          className={`${
                            activeTool === 'select' 
                              ? "bg-blue-500 border-blue-400 hover:bg-blue-600" 
                              : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                          } text-white`}
                        >
                          <i className="fas fa-mouse-pointer mr-2" />
                          Select
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveTool('pen');
                            setSelectedElement(null);
                          }}
                          className={`${
                            activeTool === 'pen' 
                              ? "bg-purple-500 border-purple-400 hover:bg-purple-600" 
                              : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                          } text-white`}
                        >
                          <i className="fas fa-pen mr-2" />
                          Pen
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => addElement('svg_shape')}
                          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                        >
                          <i className="fas fa-shapes mr-2" />
                          Shape
                        </Button>
                      </div>

                      {/* Add Element Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => addElement('text')}
                          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                        >
                          <i className="fas fa-font mr-2" />
                          Add Text
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => addElement('image')}
                          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                        >
                          <i className="fas fa-image mr-2" />
                          Add Image
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Element Editor */}
                {selectedElementData && (
                  <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4 space-y-4">
                    <h3 className="text-lg font-semibold text-green-300">
                      <i className="fas fa-edit mr-2" />
                      Edit {selectedElementData.type.replace('_', ' ')}
                    </h3>
                    
                    {selectedElementData.type === 'text' && (
                      <div className="space-y-3">
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
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label className="text-white">Font Size</Label>
                            <Input
                              type="number"
                              value={selectedElementData.styles.fontSize?.replace('px', '') || '16'}
                              onChange={(e) => updateElement(selectedElement!, {
                                styles: { ...selectedElementData.styles, fontSize: `${e.target.value}px` }
                              })}
                              className="bg-slate-700 border-slate-600 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Color</Label>
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
                      </div>
                    )}

                    {selectedElementData.type === 'image' && (
                      <div>
                        <Label className="text-white">Upload Image</Label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, selectedElement!)}
                          className="w-full bg-slate-700 border border-slate-600 text-white p-2 rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Preview */}
          <div className="space-y-6">
            <Card className="bg-slate-800 border-slate-700 sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold flex items-center text-white">
                  <i className="fas fa-eye text-talklink-500 mr-3"></i>
                  Live Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-900/30 border border-gray-600/30 rounded-lg p-4 space-y-4">
                  <h3 className="text-lg font-semibold text-gray-300">Drag Elements to Position</h3>
                  
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
                        cursor: isDragging || isResizing ? 'grabbing' : 'default',
                        userSelect: 'none'
                      }}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                      onClick={(e) => activeTool === 'pen' ? handleMouseDown(e) : undefined}
                      onDoubleClick={() => isDrawing && finishPath()}
                    >
                      {headerTemplate.elements.map(renderElement)}
                      
                      {/* Pen Tool Drawing Overlay */}
                      {activeTool === 'pen' && (
                        <>
                          {pathPoints.length > 0 && (
                            <svg
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                pointerEvents: 'none',
                                zIndex: 999
                              }}
                            >
                              {pathPoints.map((point, index) => (
                                <circle
                                  key={index}
                                  cx={point.x}
                                  cy={point.y}
                                  r="4"
                                  fill="#22c55e"
                                  stroke="#ffffff"
                                  strokeWidth="2"
                                />
                              ))}
                            </svg>
                          )}
                          
                          {/* Pen tool instructions */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '10px',
                              left: '10px',
                              background: 'rgba(0, 0, 0, 0.9)',
                              color: 'white',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              zIndex: 1000,
                              maxWidth: '250px'
                            }}
                          >
                            {!isDrawing ? (
                              <div>
                                <div><strong>Pen Tool Active</strong></div>
                                <div>• Click to add points</div>
                                <div>• Drag for curves</div>
                              </div>
                            ) : (
                              <div>
                                <div><strong>Drawing Path</strong></div>
                                <div>• Click to add points</div>
                                <div>• Double-click to finish</div>
                              </div>
                            )}
                          </div>
                          
                          {/* Drawing controls */}
                          {isDrawing && (
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                gap: '8px',
                                zIndex: 1000
                              }}
                            >
                              <Button
                                size="sm"
                                onClick={finishPath}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <i className="fas fa-check mr-1" />
                                Finish Path
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={cancelPath}
                                className="bg-red-600 hover:bg-red-700 text-white border-red-500"
                              >
                                <i className="fas fa-times mr-1" />
                                Cancel
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                      
                      {headerTemplate.elements.length === 0 && activeTool === 'select' && (
                        <div className="absolute inset-0 flex items-center justify-center text-white opacity-60">
                          <div className="text-center">
                            <i className="fas fa-plus-circle text-4xl mb-2" />
                            <p>Add elements to start building your header</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400 text-center mt-4">
                      💡 Use <strong>Select Tool</strong> to move/resize elements • <strong>Pen Tool</strong> to draw custom shapes
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
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};