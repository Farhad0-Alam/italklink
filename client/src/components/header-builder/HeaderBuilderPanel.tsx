import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { DragStack } from "./DragStack";
import type { 
  HeaderPreset, 
  HeaderElement, 
  HeaderElementType,
  ShapeDividerPreset,
  BackgroundType 
} from "@/lib/header-schema";
import { defaultHeaderPreset, SHAPE_PRESETS } from "@/lib/header-schema";

interface HeaderBuilderPanelProps {
  headerPreset: HeaderPreset;
  onPresetChange: (preset: HeaderPreset) => void;
  onSavePreset?: (preset: HeaderPreset) => void;
  onLoadPreset?: (presetId: string) => void;
  onDeletePreset?: (presetId: string) => void;
  availablePresets?: HeaderPreset[];
}

export const HeaderBuilderPanel = ({ 
  headerPreset, 
  onPresetChange,
  onSavePreset,
  onLoadPreset,
  onDeletePreset,
  availablePresets = []
}: HeaderBuilderPanelProps) => {
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("layout");

  const selectedElement = selectedElementId 
    ? headerPreset.elements.find(el => el.id === selectedElementId)
    : null;

  const updatePreset = (updates: Partial<HeaderPreset>) => {
    onPresetChange({ ...headerPreset, ...updates });
  };

  const updateElement = (elementId: string, updates: Partial<HeaderElement>) => {
    const newElements = headerPreset.elements.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    );
    updatePreset({ elements: newElements });
  };

  const addElement = (type: HeaderElementType) => {
    const newElement: HeaderElement = {
      id: `${type}-${Date.now()}`,
      type,
      visible: true,
      order: headerPreset.elements.length,
      position: { x: 50, y: 50, width: 100, height: 50 },
      style: { fontSize: 16, fontWeight: 400, color: "#ffffff", fontFamily: "Inter", textAlign: "center", opacity: 1 },
      content: type === "profile" ? { size: 80, borderRadius: 50 } : {}
    };
    
    updatePreset({ elements: [...headerPreset.elements, newElement] });
    setSelectedElementId(newElement.id);
  };

  const updateBackground = (type: BackgroundType, data: any) => {
    updatePreset({
      background: {
        type,
        [type]: data
      }
    });
  };

  const updateShapeDivider = (position: "top" | "bottom", updates: any) => {
    const key = position === "top" ? "topDivider" : "bottomDivider";
    updatePreset({
      [key]: {
        ...headerPreset[key],
        ...updates
      }
    });
  };

  return (
    <div className="w-full max-w-md bg-slate-800 text-white rounded-lg">
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Header Builder</h3>
          <div className="flex gap-2">
            {onSavePreset && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSavePreset(headerPreset)}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <i className="fas fa-save mr-1" /> Save
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-700">
          <TabsTrigger value="layout" className="text-xs">Layout</TabsTrigger>
          <TabsTrigger value="background" className="text-xs">BG</TabsTrigger>
          <TabsTrigger value="shapes" className="text-xs">Shapes</TabsTrigger>
          <TabsTrigger value="presets" className="text-xs">Presets</TabsTrigger>
        </TabsList>

        {/* Layout Tab */}
        <TabsContent value="layout" className="p-4 space-y-4">
          {/* Canvas Settings */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Canvas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Height: {headerPreset.canvasHeight}px</Label>
                <Slider
                  value={[headerPreset.canvasHeight]}
                  onValueChange={([value]) => updatePreset({ canvasHeight: value })}
                  min={100}
                  max={400}
                  step={10}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Elements */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Add Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-2">
                {(["profile", "logo", "name", "title", "company", "header"] as HeaderElementType[]).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    size="sm"
                    onClick={() => addElement(type)}
                    className="bg-slate-600 border-slate-500 text-white hover:bg-slate-500 text-xs p-2 h-auto flex flex-col"
                  >
                    <i className={`fas fa-${type === "profile" ? "user-circle" : type === "logo" ? "crown" : type === "name" ? "signature" : type === "title" ? "briefcase" : type === "company" ? "building" : "heading"} mb-1`} />
                    {type}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Elements Stack */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Elements</CardTitle>
            </CardHeader>
            <CardContent>
              <DragStack
                elements={headerPreset.elements}
                onElementsChange={(elements) => updatePreset({ elements })}
                onElementSelect={setSelectedElementId}
                selectedElementId={selectedElementId}
              />
            </CardContent>
          </Card>

          {/* Selected Element Properties */}
          {selectedElement && (
            <Card className="bg-slate-700 border-slate-600">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Element Properties</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Position */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">X: {selectedElement.position.x}%</Label>
                    <Slider
                      value={[selectedElement.position.x]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        position: { ...selectedElement.position, x: value }
                      })}
                      min={0}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Y: {selectedElement.position.y}px</Label>
                    <Slider
                      value={[selectedElement.position.y]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        position: { ...selectedElement.position, y: value }
                      })}
                      min={0}
                      max={headerPreset.canvasHeight - 20}
                      step={1}
                    />
                  </div>
                </div>

                {/* Style */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Font Size</Label>
                    <Input
                      type="number"
                      value={selectedElement.style.fontSize}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, fontSize: parseInt(e.target.value) || 16 }
                      })}
                      className="bg-slate-600 border-slate-500 text-white text-xs h-7"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={selectedElement.style.color}
                      onChange={(e) => updateElement(selectedElement.id, {
                        style: { ...selectedElement.style, color: e.target.value }
                      })}
                      className="bg-slate-600 border-slate-500 h-7 p-1"
                    />
                  </div>
                </div>

                {/* Special properties for profile/logo */}
                {(selectedElement.type === "profile" || selectedElement.type === "logo") && (
                  <div>
                    <Label className="text-xs">Size: {selectedElement.content.size || 80}px</Label>
                    <Slider
                      value={[selectedElement.content.size || 80]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        content: { ...selectedElement.content, size: value }
                      })}
                      min={20}
                      max={200}
                      step={5}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Background Tab */}
        <TabsContent value="background" className="p-4 space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Background Type</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select 
                value={headerPreset.background.type} 
                onValueChange={(value: BackgroundType) => updateBackground(value, {})}
              >
                <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid Color</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>

              {headerPreset.background.type === "solid" && (
                <div>
                  <Label className="text-xs">Color</Label>
                  <Input
                    type="color"
                    value={headerPreset.background.solid?.color || "#22c55e"}
                    onChange={(e) => updateBackground("solid", { color: e.target.value })}
                    className="bg-slate-600 border-slate-500 h-8 p-1"
                  />
                </div>
              )}

              {headerPreset.background.type === "gradient" && (
                <div className="space-y-2">
                  <Label className="text-xs">Gradient Angle</Label>
                  <Slider
                    value={[headerPreset.background.gradient?.angle || 45]}
                    onValueChange={([value]) => updateBackground("gradient", {
                      ...headerPreset.background.gradient,
                      angle: value
                    })}
                    min={0}
                    max={360}
                    step={15}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shapes Tab */}
        <TabsContent value="shapes" className="p-4 space-y-4">
          {/* Top Divider */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Top Divider</CardTitle>
                <Switch
                  checked={headerPreset.topDivider?.enabled || false}
                  onCheckedChange={(enabled) => updateShapeDivider("top", { enabled })}
                />
              </div>
            </CardHeader>
            {headerPreset.topDivider?.enabled && (
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Shape</Label>
                  <Select
                    value={headerPreset.topDivider.preset}
                    onValueChange={(preset: ShapeDividerPreset) => updateShapeDivider("top", { preset })}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="waves-brush">Waves Brush</SelectItem>
                      <SelectItem value="clouds">Clouds</SelectItem>
                      <SelectItem value="zigzag">Zigzag</SelectItem>
                      <SelectItem value="triangle">Triangle</SelectItem>
                      <SelectItem value="triangle-asymmetrical">Triangle Asymmetrical</SelectItem>
                      <SelectItem value="tilt">Tilt</SelectItem>
                      <SelectItem value="tilt-opacity">Tilt Opacity</SelectItem>
                      <SelectItem value="fan-opacity">Fan Opacity</SelectItem>
                      <SelectItem value="curve">Curve</SelectItem>
                      <SelectItem value="curve-asymmetrical">Curve Asymmetrical</SelectItem>
                      <SelectItem value="drop">Drop</SelectItem>
                      <SelectItem value="mountain">Mountains</SelectItem>
                      <SelectItem value="opacity-fan-alt">Opacity Fan Alt</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="custom">Custom SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {headerPreset.topDivider.preset === "custom" && (
                  <div>
                    <Label className="text-xs">Custom SVG Path</Label>
                    <Textarea
                      value={headerPreset.topDivider.customPath || ""}
                      onChange={(e) => updateShapeDivider("top", { customPath: e.target.value })}
                      className="bg-slate-600 border-slate-500 text-white text-xs"
                      rows={3}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={headerPreset.topDivider.color}
                      onChange={(e) => updateShapeDivider("top", { color: e.target.value })}
                      className="bg-slate-600 border-slate-500 h-8 p-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height: {headerPreset.topDivider.height}px</Label>
                    <Slider
                      value={[headerPreset.topDivider.height]}
                      onValueChange={([value]) => updateShapeDivider("top", { height: value })}
                      min={20}
                      max={200}
                      step={10}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={headerPreset.topDivider.flip}
                      onCheckedChange={(flip) => updateShapeDivider("top", { flip })}
                    />
                    <Label className="text-xs">Flip</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Bottom Divider */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Bottom Divider</CardTitle>
                <Switch
                  checked={headerPreset.bottomDivider?.enabled || false}
                  onCheckedChange={(enabled) => updateShapeDivider("bottom", { enabled })}
                />
              </div>
            </CardHeader>
            {headerPreset.bottomDivider?.enabled && (
              <CardContent className="space-y-3">
                <div>
                  <Label className="text-xs">Shape</Label>
                  <Select
                    value={headerPreset.bottomDivider.preset}
                    onValueChange={(preset: ShapeDividerPreset) => updateShapeDivider("bottom", { preset })}
                  >
                    <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="waves-brush">Waves Brush</SelectItem>
                      <SelectItem value="clouds">Clouds</SelectItem>
                      <SelectItem value="zigzag">Zigzag</SelectItem>
                      <SelectItem value="triangle">Triangle</SelectItem>
                      <SelectItem value="triangle-asymmetrical">Triangle Asymmetrical</SelectItem>
                      <SelectItem value="tilt">Tilt</SelectItem>
                      <SelectItem value="tilt-opacity">Tilt Opacity</SelectItem>
                      <SelectItem value="fan-opacity">Fan Opacity</SelectItem>
                      <SelectItem value="curve">Curve</SelectItem>
                      <SelectItem value="curve-asymmetrical">Curve Asymmetrical</SelectItem>
                      <SelectItem value="drop">Drop</SelectItem>
                      <SelectItem value="mountain">Mountains</SelectItem>
                      <SelectItem value="opacity-fan-alt">Opacity Fan Alt</SelectItem>
                      <SelectItem value="book">Book</SelectItem>
                      <SelectItem value="custom">Custom SVG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {headerPreset.bottomDivider.preset === "custom" && (
                  <div>
                    <Label className="text-xs">Custom SVG Path</Label>
                    <Textarea
                      value={headerPreset.bottomDivider.customPath || ""}
                      onChange={(e) => updateShapeDivider("bottom", { customPath: e.target.value })}
                      className="bg-slate-600 border-slate-500 text-white text-xs"
                      rows={3}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Color</Label>
                    <Input
                      type="color"
                      value={headerPreset.bottomDivider.color}
                      onChange={(e) => updateShapeDivider("bottom", { color: e.target.value })}
                      className="bg-slate-600 border-slate-500 h-8 p-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Height: {headerPreset.bottomDivider.height}px</Label>
                    <Slider
                      value={[headerPreset.bottomDivider.height]}
                      onValueChange={([value]) => updateShapeDivider("bottom", { height: value })}
                      min={20}
                      max={200}
                      step={10}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={headerPreset.bottomDivider.flip}
                      onCheckedChange={(flip) => updateShapeDivider("bottom", { flip })}
                    />
                    <Label className="text-xs">Flip</Label>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </TabsContent>

        {/* Presets Tab */}
        <TabsContent value="presets" className="p-4 space-y-4">
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Header Presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Preset Name</Label>
                <Input
                  value={headerPreset.name}
                  onChange={(e) => updatePreset({ name: e.target.value })}
                  className="bg-slate-600 border-slate-500 text-white text-xs"
                  placeholder="Enter preset name..."
                />
              </div>

              <div>
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={headerPreset.description || ""}
                  onChange={(e) => updatePreset({ description: e.target.value })}
                  className="bg-slate-600 border-slate-500 text-white text-xs"
                  rows={2}
                  placeholder="Optional description..."
                />
              </div>

              {availablePresets.length > 0 && (
                <div>
                  <Label className="text-xs">Load Preset</Label>
                  <div className="space-y-2">
                    {availablePresets.map((preset) => (
                      <div key={preset.id} className="flex items-center justify-between p-2 bg-slate-600 rounded">
                        <div>
                          <div className="text-xs font-medium">{preset.name}</div>
                          {preset.description && (
                            <div className="text-xs text-gray-400">{preset.description}</div>
                          )}
                        </div>
                        <div className="flex gap-1">
                          {onLoadPreset && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onLoadPreset(preset.id)}
                              className="text-white hover:bg-slate-500 p-1 h-6 w-6"
                            >
                              <i className="fas fa-download text-xs" />
                            </Button>
                          )}
                          {onDeletePreset && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDeletePreset(preset.id)}
                              className="text-red-400 hover:bg-red-900 p-1 h-6 w-6"
                            >
                              <i className="fas fa-trash text-xs" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};