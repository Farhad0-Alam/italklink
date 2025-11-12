import { BusinessCard } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

interface ThemePanelProps {
  cardData: BusinessCard;
  onDataChange: (data: BusinessCard) => void;
}

export const ThemePanel: React.FC<ThemePanelProps> = ({ cardData, onDataChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleColorChange = (field: keyof BusinessCard, value: string) => {
    onDataChange({ ...cardData, [field]: value });
  };

  const handleBackgroundTypeChange = (value: string) => {
    onDataChange({ ...cardData, backgroundType: value });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <CardTitle className="text-xl font-bold flex items-center text-white">
            <i className="fas fa-palette text-purple-500 mr-3"></i>
            Theme
          </CardTitle>
          <i
            className={`fas ${collapsed ? "fa-chevron-down" : "fa-chevron-up"} text-slate-400`}
          />
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-6">
          {/* Default Colors */}
          <div>
            <h4 className="text-md font-medium text-purple-200 mb-3">
              Default Colors
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-white text-sm">Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={cardData.brandColor || "#54C5BC"}
                    onChange={(e) => handleColorChange("brandColor", e.target.value)}
                    className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                    data-testid="input-primary-color-right"
                  />
                  <span className="text-xs text-gray-400">
                    {cardData.brandColor || "#54C5BC"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-white text-sm">Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={cardData.secondaryColor || "#999999"}
                    onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                    className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                    data-testid="input-secondary-color-right"
                  />
                  <span className="text-xs text-gray-400">
                    {cardData.secondaryColor || "#999999"}
                  </span>
                </div>
              </div>

              <div>
                <Label className="text-white text-sm">Tertiary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    type="color"
                    value={cardData.tertiaryColor || "#FFFFFF"}
                    onChange={(e) => handleColorChange("tertiaryColor", e.target.value)}
                    className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                    data-testid="input-tertiary-color-right"
                  />
                  <span className="text-xs text-gray-400">
                    {cardData.tertiaryColor || "#FFFFFF"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Background Type */}
          <div>
            <h4 className="text-md font-medium text-purple-200 mb-3">
              Background
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-white text-sm">Type</Label>
                <Select
                  value={cardData.backgroundType || "color"}
                  onValueChange={handleBackgroundTypeChange}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
