import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  SVGShapeDefinition, 
  SVG_SHAPES_LIBRARY, 
  getSVGShapesByCategory, 
  applySVGShapeColors,
  SVG_SHAPE_CATEGORIES
} from '@/lib/svg-shapes-library';
import { Palette, RotateCcw, Search, Copy, Eye } from 'lucide-react';

interface SVGShapeRendererProps {
  onShapeSelect?: (shape: SVGShapeDefinition, customization: ShapeCustomization) => void;
  selectedShapes?: string[];
  allowMultiple?: boolean;
}

interface ShapeCustomization {
  colors: Record<string, string>;
  scale: number;
  rotation: number;
  opacity: number;
}

export default function SVGShapeRenderer({ onShapeSelect, selectedShapes = [], allowMultiple = true }: SVGShapeRendererProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewShape, setPreviewShape] = useState<string | null>(null);
  const [customization, setCustomization] = useState<ShapeCustomization>({
    colors: { color1: '#22c55e', color2: '#16a34a' },
    scale: 1,
    rotation: 0,
    opacity: 1
  });

  // Filter shapes based on search and category
  const filteredShapes = SVG_SHAPES_LIBRARY.filter(shape => {
    const matchesSearch = !searchQuery || 
      shape.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shape.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shape.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || shape.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleShapeSelect = (shape: SVGShapeDefinition) => {
    onShapeSelect?.(shape, customization);
  };

  const renderSVGPreview = (shape: SVGShapeDefinition, customColors?: Record<string, string>) => {
    const colors = customColors || customization.colors;
    const processedSvgCode = applySVGShapeColors(shape.svgCode, colors);
    
    return (
      <div 
        className="w-full h-24 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border overflow-hidden"
        style={{ 
          transform: `scale(${customization.scale}) rotate(${customization.rotation}deg)`,
          opacity: customization.opacity 
        }}
      >
        <svg 
          viewBox={shape.viewBox} 
          className="w-full h-full"
          style={{ maxWidth: '100px', maxHeight: '60px' }}
          dangerouslySetInnerHTML={{ __html: processedSvgCode }}
        />
      </div>
    );
  };

  const ShapeCard = ({ shape }: { shape: SVGShapeDefinition }) => {
    const isSelected = selectedShapes.includes(shape.id);
    
    return (
      <Card className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Preview */}
            {renderSVGPreview(shape)}
            
            {/* Info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">{shape.name}</h4>
                <Badge variant={shape.difficulty === 'easy' ? 'default' : shape.difficulty === 'medium' ? 'secondary' : 'destructive'}>
                  {shape.difficulty}
                </Badge>
              </div>
              
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                {shape.description}
              </p>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-1">
                {shape.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                    {tag}
                  </Badge>
                ))}
                {shape.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-1 py-0">
                    +{shape.tags.length - 3}
                  </Badge>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setPreviewShape(shape.id)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </Button>
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleShapeSelect(shape)}
                >
                  Select
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search shapes by name, description, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Filter */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
            <TabsTrigger value="all">All</TabsTrigger>
            {SVG_SHAPE_CATEGORIES.map(category => (
              <TabsTrigger key={category.id} value={category.id} className="text-xs">
                <span className="mr-1">{category.icon}</span>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Shape Customization Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Shape Customization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Color Controls */}
            <div className="space-y-2">
              <Label htmlFor="color1" className="text-xs">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color1"
                  type="color"
                  value={customization.colors.color1}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    colors: { ...prev.colors, color1: e.target.value }
                  }))}
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  value={customization.colors.color1}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    colors: { ...prev.colors, color1: e.target.value }
                  }))}
                  className="flex-1 text-xs"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="color2" className="text-xs">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="color2"
                  type="color"
                  value={customization.colors.color2}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    colors: { ...prev.colors, color2: e.target.value }
                  }))}
                  className="w-12 h-8 p-1 border rounded"
                />
                <Input
                  value={customization.colors.color2}
                  onChange={(e) => setCustomization(prev => ({
                    ...prev,
                    colors: { ...prev.colors, color2: e.target.value }
                  }))}
                  className="flex-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Transform Controls */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Scale: {customization.scale}x</Label>
              <Input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={customization.scale}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  scale: parseFloat(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Rotation: {customization.rotation}°</Label>
              <Input
                type="range"
                min="0"
                max="360"
                step="15"
                value={customization.rotation}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  rotation: parseInt(e.target.value)
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs">Opacity: {Math.round(customization.opacity * 100)}%</Label>
              <Input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={customization.opacity}
                onChange={(e) => setCustomization(prev => ({
                  ...prev,
                  opacity: parseFloat(e.target.value)
                }))}
              />
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCustomization({
              colors: { color1: '#22c55e', color2: '#16a34a' },
              scale: 1,
              rotation: 0,
              opacity: 1
            })}
            className="w-full"
          >
            <RotateCcw className="h-3 w-3 mr-2" />
            Reset to Defaults
          </Button>
        </CardContent>
      </Card>

      {/* Shapes Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredShapes.map(shape => (
          <ShapeCard key={shape.id} shape={shape} />
        ))}
      </div>

      {filteredShapes.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No shapes found matching your criteria.</p>
          <p className="text-sm">Try adjusting your search or category filter.</p>
        </div>
      )}

      {/* Preview Modal */}
      {previewShape && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Shape Preview</CardTitle>
                <Button variant="ghost" onClick={() => setPreviewShape(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const shape = SVG_SHAPES_LIBRARY.find(s => s.id === previewShape);
                if (!shape) return null;
                
                return (
                  <div className="space-y-6">
                    {/* Large Preview */}
                    <div className="w-full h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div
                        style={{ 
                          transform: `scale(${customization.scale}) rotate(${customization.rotation}deg)`,
                          opacity: customization.opacity 
                        }}
                      >
                        <svg 
                          viewBox={shape.viewBox} 
                          className="w-full h-full max-w-sm max-h-48"
                          dangerouslySetInnerHTML={{ 
                            __html: applySVGShapeColors(shape.svgCode, customization.colors) 
                          }}
                        />
                      </div>
                    </div>
                    
                    {/* Shape Info */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{shape.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{shape.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge>{shape.category}</Badge>
                        <Badge variant="outline">{shape.difficulty}</Badge>
                        {shape.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button 
                        className="w-full"
                        onClick={() => {
                          handleShapeSelect(shape);
                          setPreviewShape(null);
                        }}
                      >
                        Use This Shape
                      </Button>
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}