import { BusinessCard } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface SeoPanelProps {
  cardData: BusinessCard;
  onDataChange: (data: BusinessCard) => void;
}

export const SeoPanel: React.FC<SeoPanelProps> = ({ cardData, onDataChange }) => {
  const [collapsed, setCollapsed] = useState(false);

  const handleChange = (field: keyof BusinessCard, value: string) => {
    onDataChange({ ...cardData, [field]: value });
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <CardTitle className="text-xl font-bold flex items-center text-white">
            <i className="fas fa-search text-orange-500 mr-3"></i>
            SEO
          </CardTitle>
          <i
            className={`fas ${collapsed ? "fa-chevron-down" : "fa-chevron-up"} text-slate-400`}
          />
        </div>
      </CardHeader>

      {!collapsed && (
        <CardContent className="space-y-4">
          <div>
            <Label className="text-white">Meta Title</Label>
            <Input
              value={cardData.metaTitle || ""}
              onChange={(e) => handleChange("metaTitle", e.target.value)}
              placeholder="Professional Digital Business Card - Your Name"
              className="bg-slate-700 border-slate-600 text-white"
              data-testid="input-meta-title-right"
            />
            <p className="text-xs text-gray-400 mt-1">
              Recommended: 50-60 characters
            </p>
          </div>

          <div>
            <Label className="text-white">Meta Description</Label>
            <Textarea
              value={cardData.metaDescription || ""}
              onChange={(e) => handleChange("metaDescription", e.target.value)}
              placeholder="Connect with me easily through my digital business card. Find my contact information, social media, and professional details in one place."
              className="bg-slate-700 border-slate-600 text-white"
              data-testid="input-meta-description-right"
              rows={3}
            />
            <p className="text-xs text-gray-400 mt-1">
              Recommended: 150-160 characters
            </p>
          </div>

          <div>
            <Label className="text-white">Keywords (Optional)</Label>
            <Input
              value={cardData.metaKeywords || ""}
              onChange={(e) => handleChange("metaKeywords", e.target.value)}
              placeholder="digital business card, networking, contact"
              className="bg-slate-700 border-slate-600 text-white"
              data-testid="input-meta-keywords-right"
            />
            <p className="text-xs text-gray-400 mt-1">
              Comma-separated keywords
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
};
