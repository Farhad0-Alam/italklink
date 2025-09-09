import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

// Shape library with SVG paths
const SHAPE_LIBRARY = {
  // Wave shapes
  wave1: {
    name: "Wave 1",
    top: '<path d="M0,32L48,37.3C96,43,192,53,288,48C384,43,480,21,576,32C672,43,768,85,864,90.7C960,96,1056,64,1152,48C1248,32,1344,32,1392,32L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"/>',
    bottom: '<path d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,192C672,203,768,245,864,250.7C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>'
  },
  wave2: {
    name: "Wave 2",
    top: '<path d="M0,64L60,85.3C120,107,240,149,360,144C480,139,600,85,720,90.7C840,96,960,160,1080,165.3C1200,171,1320,117,1380,90.7L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"/>',
    bottom: '<path d="M0,256L60,277.3C120,299,240,341,360,336C480,331,600,277,720,282.7C840,288,960,352,1080,357.3C1200,363,1320,309,1380,282.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"/>'
  },
  // Drip shapes
  drip1: {
    name: "Drip 1",
    top: '<path d="M0,0L120,21.3C240,43,480,85,720,90.7C960,96,1200,64,1320,48L1440,32L1440,0Z M240,64C240,78.9,251.1,90,266,90C280.9,90,292,78.9,292,64C292,49.1,280.9,38,266,38C251.1,38,240,49.1,240,64Z M720,96C720,110.9,731.1,122,746,122C760.9,122,772,110.9,772,96C772,81.1,760.9,70,746,70C731.1,70,720,81.1,720,96Z"/>',
    bottom: '<path d="M1440,320L1320,298.7C1200,277,960,235,720,229.3C480,224,240,256,120,272L0,288L0,320Z M1200,256C1200,270.9,1211.1,282,1226,282C1240.9,282,1252,270.9,1252,256C1252,241.1,1240.9,230,1226,230C1211.1,230,1200,241.1,1200,256Z M720,224C720,238.9,731.1,250,746,250C760.9,250,772,238.9,772,224C772,209.1,760.9,198,746,198C731.1,198,720,209.1,720,224Z"/>'
  },
  // Mountain shapes
  mountain1: {
    name: "Mountain 1",
    top: '<path d="M0,0L240,64L480,32L720,96L960,48L1200,80L1440,32L1440,0Z"/>',
    bottom: '<path d="M0,320L240,256L480,288L720,224L960,272L1200,240L1440,288L1440,320Z"/>'
  },
  mountain2: {
    name: "Mountain 2",
    top: '<path d="M0,0L144,32L288,64L432,32L576,96L720,48L864,80L1008,32L1152,64L1296,32L1440,48L1440,0Z"/>',
    bottom: '<path d="M0,320L144,288L288,256L432,288L576,224L720,272L864,240L1008,288L1152,256L1296,288L1440,272L1440,320Z"/>'
  },
  // Curve shapes
  curve1: {
    name: "Curve 1",
    top: '<path d="M0,0C480,64,960,64,1440,0L1440,0L0,0Z"/>',
    bottom: '<path d="M0,320C480,256,960,256,1440,320L1440,320L0,320Z"/>'
  },
  curve2: {
    name: "Curve 2", 
    top: '<path d="M0,32C240,96,480,96,720,32C960,96,1200,96,1440,32L1440,0L0,0Z"/>',
    bottom: '<path d="M0,288C240,224,480,224,720,288C960,224,1200,224,1440,288L1440,320L0,320Z"/>'
  },
  // Triangle shapes
  triangle1: {
    name: "Triangle 1",
    top: '<path d="M0,0L720,64L1440,0L1440,0L0,0Z"/>',
    bottom: '<path d="M0,320L720,256L1440,320L1440,320L0,320Z"/>'
  },
  triangle2: {
    name: "Triangle 2",
    top: '<path d="M0,32L1440,96L1440,0L0,0Z"/>',
    bottom: '<path d="M0,288L1440,224L1440,320L0,320Z"/>'
  },
  // Zigzag shapes
  zigzag1: {
    name: "Zigzag 1",
    top: '<path d="M0,0L72,32L144,0L216,32L288,0L360,32L432,0L504,32L576,0L648,32L720,0L792,32L864,0L936,32L1008,0L1080,32L1152,0L1224,32L1296,0L1368,32L1440,0L1440,0L0,0Z"/>',
    bottom: '<path d="M0,320L72,288L144,320L216,288L288,320L360,288L432,320L504,288L576,320L648,288L720,320L792,288L864,320L936,288L1008,320L1080,288L1152,320L1224,288L1296,320L1368,288L1440,320L1440,320L0,320Z"/>'
  }
};

export interface ShapeDividerStyle {
  enabled: boolean;
  position: 'top' | 'bottom';
  shape: string;
  color: string;
  width: number; // percentage
  height: number; // pixels
  flip: boolean;
  bringToFront: boolean;
}

export interface HeaderElementStyle {
  visible: boolean;
  fontSize: number;
  fontWeight: number;
  color: string;
  textAlign: 'left' | 'center' | 'right';
  marginTop: number;
  marginBottom: number;
}

export interface HeaderElements {
  profilePic: HeaderElementStyle & { 
    size: number; 
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
  };
  logo: HeaderElementStyle & { 
    size: number; 
    position: 'top-left' | 'top-right' | 'center';
  };
  name: HeaderElementStyle;
  title: HeaderElementStyle;
  company: HeaderElementStyle;
}

export interface ShapeDividerHeaderConfig {
  backgroundImage?: string;
  backgroundColor: string;
  height: number;
  topShape?: ShapeDividerStyle;
  bottomShape?: ShapeDividerStyle;
  elements: HeaderElements;
}

interface ShapeDividerBuilderProps {
  config: ShapeDividerHeaderConfig;
  onChange: (config: ShapeDividerHeaderConfig) => void;
}

export function ShapeDividerBuilder({ config, onChange }: ShapeDividerBuilderProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'top' | 'bottom'>('top');
  const [selectedShape, setSelectedShape] = useState<string | null>(null);

  const updateConfig = (updates: Partial<ShapeDividerHeaderConfig>) => {
    onChange({ ...config, ...updates });
  };

  const updateShapeStyle = (position: 'top' | 'bottom', updates: Partial<ShapeDividerStyle>) => {
    const shapeKey = position === 'top' ? 'topShape' : 'bottomShape';
    const currentShape = config[shapeKey] || {
      enabled: false,
      position,
      shape: 'wave1',
      color: '#ffffff',
      width: 100,
      height: 100,
      flip: false,
      bringToFront: false
    };
    
    updateConfig({
      [shapeKey]: { ...currentShape, ...updates }
    });
  };

  const updateElementStyle = (element: keyof HeaderElements, updates: Partial<HeaderElements[keyof HeaderElements]>) => {
    updateConfig({
      elements: {
        ...config.elements,
        [element]: { ...config.elements[element], ...updates }
      }
    });
  };

  const currentShape = activeTab === 'top' ? config.topShape : config.bottomShape;

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <i className="fas fa-mountain text-talklink-500" />
            Shape Divider Header
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Background Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Background</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-white">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={config.backgroundColor}
                    onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                    className="flex-1 bg-slate-700 border-slate-600 text-white"
                    placeholder="#22c55e"
                  />
                </div>
              </div>
              <div>
                <Label className="text-white">Header Height (px)</Label>
                <Input
                  type="number"
                  min="100"
                  max="400"
                  value={config.height}
                  onChange={(e) => updateConfig({ height: parseInt(e.target.value) || 200 })}
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Shape Divider */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Shape Divider</h3>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'top' | 'bottom')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="top">Top</TabsTrigger>
                <TabsTrigger value="bottom">Bottom</TabsTrigger>
              </TabsList>
              
              <TabsContent value={activeTab} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentShape?.enabled || false}
                    onCheckedChange={(enabled) => updateShapeStyle(activeTab, { enabled })}
                  />
                  <Label className="text-white">Enable {activeTab} shape</Label>
                </div>

                {currentShape?.enabled && (
                  <div className="space-y-4">
                    {/* Shape Selection */}
                    <div>
                      <Label className="text-white">Type</Label>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mt-2">
                        {Object.entries(SHAPE_LIBRARY).map(([shapeKey, shape]) => (
                          <button
                            key={shapeKey}
                            onClick={() => updateShapeStyle(activeTab, { shape: shapeKey })}
                            className={`p-2 rounded-lg border h-16 flex items-center justify-center transition-colors ${
                              currentShape.shape === shapeKey
                                ? 'border-talklink-500 bg-talklink-500/10'
                                : 'border-slate-600 bg-slate-700 hover:bg-slate-600'
                            }`}
                          >
                            <svg viewBox="0 0 1440 320" className="w-full h-8">
                              <g fill="currentColor" className="text-white">
                                {activeTab === 'top' 
                                  ? <g dangerouslySetInnerHTML={{ __html: shape.top }} />
                                  : <g dangerouslySetInnerHTML={{ __html: shape.bottom }} />
                                }
                              </g>
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Shape Controls */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={currentShape.color}
                            onChange={(e) => updateShapeStyle(activeTab, { color: e.target.value })}
                            className="w-12 h-9 p-1"
                          />
                          <Input
                            value={currentShape.color}
                            onChange={(e) => updateShapeStyle(activeTab, { color: e.target.value })}
                            className="flex-1 bg-slate-700 border-slate-600 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-white">Width: {currentShape.width}%</Label>
                        <Slider
                          value={[currentShape.width]}
                          onValueChange={([value]) => updateShapeStyle(activeTab, { width: value })}
                          min={50}
                          max={200}
                          step={5}
                          className="mt-2"
                        />
                      </div>
                      
                      <div>
                        <Label className="text-white">Height: {currentShape.height}px</Label>
                        <Slider
                          value={[currentShape.height]}
                          onValueChange={([value]) => updateShapeStyle(activeTab, { height: value })}
                          min={20}
                          max={300}
                          step={10}
                          className="mt-2"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={currentShape.flip}
                          onCheckedChange={(flip) => updateShapeStyle(activeTab, { flip })}
                        />
                        <Label className="text-white">Flip</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={currentShape.bringToFront}
                          onCheckedChange={(bringToFront) => updateShapeStyle(activeTab, { bringToFront })}
                        />
                        <Label className="text-white">Bring to Front</Label>
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Element Styles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Element Styles</h3>
            
            {Object.entries(config.elements).map(([elementKey, elementStyle]) => (
              <Card key={elementKey} className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-white capitalize">
                      {elementKey.replace(/([A-Z])/g, ' $1')}
                    </CardTitle>
                    <Switch
                      checked={elementStyle.visible}
                      onCheckedChange={(visible) => updateElementStyle(elementKey as keyof HeaderElements, { visible })}
                    />
                  </div>
                </CardHeader>
                
                {elementStyle.visible && (
                  <CardContent className="pt-0 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-xs">Font Size</Label>
                        <Input
                          type="number"
                          min="10"
                          max="48"
                          value={elementStyle.fontSize}
                          onChange={(e) => updateElementStyle(elementKey as keyof HeaderElements, { fontSize: parseInt(e.target.value) || 16 })}
                          className="bg-slate-600 border-slate-500 text-white text-xs h-8"
                        />
                      </div>
                      <div>
                        <Label className="text-white text-xs">Color</Label>
                        <Input
                          type="color"
                          value={elementStyle.color}
                          onChange={(e) => updateElementStyle(elementKey as keyof HeaderElements, { color: e.target.value })}
                          className="bg-slate-600 border-slate-500 h-8 p-1"
                        />
                      </div>
                    </div>
                    
                    {/* Special controls for profile pic and logo */}
                    {'size' in elementStyle && (
                      <div>
                        <Label className="text-white text-xs">Size</Label>
                        <Input
                          type="number"
                          min="20"
                          max="200"
                          value={elementStyle.size}
                          onChange={(e) => updateElementStyle(elementKey as keyof HeaderElements, { size: parseInt(e.target.value) || 80 })}
                          className="bg-slate-600 border-slate-500 text-white text-xs h-8"
                        />
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}