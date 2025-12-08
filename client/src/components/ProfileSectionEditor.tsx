import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { fileToBase64, validateImageFile } from "@/lib/storage";
import { SHAPE_PRESETS } from "@/lib/header-schema";

interface ProfileSectionEditorProps {
  data: any;
  onChange: (data: any) => void;
  onSave?: () => Promise<void>;
  cardData?: any;
}

const FONT_OPTIONS = [
  "Inter", "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins",
  "Source Sans Pro", "Nunito", "Raleway", "Ubuntu", "PT Sans",
  "Merriweather", "Playfair Display", "Oswald", "Libre Baskerville",
  "Crimson Text", "Work Sans", "Fira Sans", "DM Sans", "Space Grotesk"
];

const FONT_WEIGHTS = [
  ["300", "Light"],
  ["400", "Regular"],
  ["500", "Medium"],
  ["600", "Semi Bold"],
  ["700", "Bold"],
  ["800", "Extra Bold"],
];

const SHAPE_DIVIDERS = [
  "wave", "waves-brush", "clouds", "zigzag", "triangle", 
  "triangle-asymmetrical", "tilt", "tilt-opacity", "fan-opacity", 
  "curve", "curve-asymmetrical", "drop", "mountain", "opacity-fan-alt", "book"
];

export function ProfileSectionEditor({ data, onChange, onSave, cardData }: ProfileSectionEditorProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [activeDividerPosition, setActiveDividerPosition] = useState<"top" | "bottom">("top");
  
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    profileImageStyling: true,
    coverImageStyling: true,
    nameStyling: true,
    titleStyling: true,
    companyStyling: true,
    textGroupPosition: true,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleDataUpdate = (updates: any) => {
    onChange({ ...data, ...updates });
  };

  const handleNestedUpdate = (path: string, value: any) => {
    const keys = path.split('.');
    const newData = { ...data };
    let current: any = newData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      } else {
        current[keys[i]] = { ...current[keys[i]] };
      }
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    onChange(newData);
  };

  const getNestedValue = (path: string, defaultValue: any = undefined) => {
    const keys = path.split('.');
    let current = data;
    for (const key of keys) {
      if (current === undefined || current === null) return defaultValue;
      current = current[key];
    }
    return current ?? defaultValue;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "profilePhoto" | "coverImage"
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
      handleDataUpdate({ [field]: base64 });
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
      if (onSave) {
        setTimeout(() => {
          onSave();
        }, 100);
      }
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

  const handleBlurSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const profileImageStyles = data.profileImageStyles || {};
  const coverImageStyles = data.coverImageStyles || {};
  const sectionStyles = data.sectionStyles || { basicInfo: {} };
  const brandColor = cardData?.brandColor || data.brandColor || "#22c55e";
  const accentColor = cardData?.accentColor || data.accentColor || "#f093fb";

  return (
    <div className="space-y-4">
      {/* Image Uploads */}
      <div className="space-y-4">
        {[
          { id: "profile-photo-upload", label: "Logo or Profile Image", field: "profilePhoto" as const },
          { id: "cover-image-upload", label: "Cover Image", field: "coverImage" as const },
        ].map(({ id, label, field }) => (
          <div key={id} className="space-y-1.5">
            <Label className="text-sm text-slate-700 font-normal">{label}</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-slate-300 flex items-center justify-center flex-shrink-0">
                {data[field] ? (
                  <img src={data[field]} alt={label} className="w-full h-full object-cover" />
                ) : (
                  <i className="fas fa-image text-slate-400 text-sm" />
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-transparent border-slate-300 text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                onClick={() => document.getElementById(id)?.click()}
                disabled={isUploading}
              >
                <i className="fas fa-cloud-upload-alt mr-2 text-slate-400" />
                Upload
              </Button>
              <input
                id={id}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, field)}
                className="hidden"
              />
              {data[field] && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDataUpdate({ [field]: null })}
                  className="text-red-500 hover:text-red-600"
                >
                  <i className="fas fa-trash" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Profile Info Fields */}
      <div className="border border-green-200 rounded-lg p-3 space-y-3 bg-green-50/50">
        <h4 className="text-sm font-medium text-green-700 flex items-center gap-2">
          <i className="fas fa-user text-green-500"></i>
          Profile Information
        </h4>
        
        <div className="space-y-3">
          <div>
            <Label className="text-sm text-slate-700 font-normal">Full Name</Label>
            <Input
              key={`fullName-${data.id || 'default'}`}
              defaultValue={data.fullName || ""}
              onBlur={(e) => {
                const newData = { ...data, fullName: e.target.value };
                onChange(newData);
                if (onSave) {
                  setTimeout(() => onSave(), 50);
                }
              }}
              placeholder="Enter full name"
              className="bg-white border-slate-300 text-slate-800"
              data-testid="input-profile-fullname"
            />
          </div>
          
          <div>
            <Label className="text-sm text-slate-700 font-normal">Title</Label>
            <Input
              key={`title-${data.id || 'default'}`}
              defaultValue={data.title || ""}
              onBlur={(e) => {
                const newData = { ...data, title: e.target.value };
                onChange(newData);
                if (onSave) {
                  setTimeout(() => onSave(), 50);
                }
              }}
              placeholder="Enter title"
              className="bg-white border-slate-300 text-slate-800"
              data-testid="input-profile-title"
            />
          </div>
          
          <div>
            <Label className="text-sm text-slate-700 font-normal">Company</Label>
            <Input
              key={`company-${data.id || 'default'}`}
              defaultValue={data.company || ""}
              onBlur={(e) => {
                const newData = { ...data, company: e.target.value };
                onChange(newData);
                if (onSave) {
                  setTimeout(() => onSave(), 50);
                }
              }}
              placeholder="Enter company name"
              className="bg-white border-slate-300 text-slate-800"
              data-testid="input-profile-company"
            />
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-normal">Brand Color</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.brandColor || brandColor}
                onChange={(e) => handleDataUpdate({ brandColor: e.target.value })}
                className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
              />
              <Input
                key={`brandColor-${data.id || 'default'}`}
                defaultValue={data.brandColor || ""}
                onBlur={(e) => {
                  const newData = { ...data, brandColor: e.target.value };
                  onChange(newData);
                  if (onSave) {
                    setTimeout(() => onSave(), 50);
                  }
                }}
                placeholder={brandColor}
                className="bg-white border-slate-300 text-slate-800 text-sm"
                data-testid="input-profile-brandcolor"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Image Styling */}
      <div className="border border-blue-200 rounded-lg p-3 space-y-3 bg-blue-50/50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("profileImageStyling")}
        >
          <h4 className="text-sm font-medium text-blue-700 flex items-center gap-2">
            <i className="fas fa-palette text-blue-500"></i>
            Profile Image Styling
          </h4>
          <i className={`fas ${collapsedSections.profileImageStyling ? "fa-chevron-down" : "fa-chevron-up"} text-blue-500 text-xs`} />
        </div>

        <Collapsible open={!collapsedSections.profileImageStyling}>
          <CollapsibleContent className="space-y-3 pt-2">
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <Label className="text-sm text-slate-600">Show Profile Image</Label>
              <input
                type="checkbox"
                checked={data.showProfilePhoto !== false}
                onChange={(e) => handleDataUpdate({ showProfilePhoto: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
            </div>

            {/* Size Slider */}
            <div>
              <Label className="text-xs text-slate-500">Size: {profileImageStyles.size || 120}px</Label>
              <input
                type="range"
                min={60}
                max={200}
                value={profileImageStyles.size || 120}
                onChange={(e) => handleNestedUpdate("profileImageStyles.size", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
              />
            </div>

            {/* Shape Selection */}
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">Shape</Label>
              <div className="grid grid-cols-3 gap-2">
                {["circle", "square", "rounded"].map((shape) => (
                  <button
                    key={shape}
                    type="button"
                    onClick={() => handleNestedUpdate("profileImageStyles.shape", shape)}
                    className={`px-3 py-2 rounded text-xs capitalize transition-colors ${
                      (profileImageStyles.shape || "circle") === shape
                        ? "bg-blue-600 text-white"
                        : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {shape}
                  </button>
                ))}
              </div>
            </div>

            {/* Border Width */}
            <div>
              <Label className="text-xs text-slate-500">
                Border Width: {profileImageStyles.borderWidth ?? 3}px
              </Label>
              <input
                type="range"
                min={0}
                max={10}
                value={profileImageStyles.borderWidth ?? 3}
                onChange={(e) => handleNestedUpdate("profileImageStyles.borderWidth", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
              />
            </div>

            {/* Border Color */}
            {(profileImageStyles.borderWidth ?? 3) > 0 && 
             (!profileImageStyles.animation || profileImageStyles.animation === "none") && (
              <div>
                <Label className="text-xs text-slate-500 mb-2 block">Border Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="color"
                    value={profileImageStyles.borderColor || brandColor}
                    onChange={(e) => handleNestedUpdate("profileImageStyles.borderColor", e.target.value)}
                    className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-slate-500">{profileImageStyles.borderColor || brandColor}</span>
                </div>
              </div>
            )}

            {/* Border Animation */}
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">Border Animation</Label>
              <select
                value={profileImageStyles.animation || "none"}
                onChange={(e) => handleNestedUpdate("profileImageStyles.animation", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-slate-700 text-sm"
              >
                <option value="none">None</option>
                <option value="instagram">Instagram Gradient Spin</option>
                <option value="neon">Neon Glow Pulse</option>
                <option value="wave">Color Wave</option>
                <option value="shimmer">Shimmer Effect</option>
                <option value="gradient-slide">Gradient Slide</option>
              </select>
            </div>

            {/* Animation Color Controls */}
            {profileImageStyles.animation && profileImageStyles.animation !== "none" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
                  <Label className="text-xs text-slate-600">Use Brand Color</Label>
                  <input
                    type="checkbox"
                    checked={profileImageStyles.useBrandColor !== false}
                    onChange={(e) => handleNestedUpdate("profileImageStyles.useBrandColor", e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300"
                  />
                </div>

                {["instagram", "wave", "gradient-slide", "shimmer"].includes(profileImageStyles.animation) && 
                 profileImageStyles.useBrandColor === false && (
                  <div className="space-y-2 p-3 bg-white rounded border border-slate-200">
                    <Label className="text-xs text-slate-500">Start Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={profileImageStyles.animationColors?.start || brandColor}
                        onChange={(e) => {
                          const currentColors = profileImageStyles.animationColors || {};
                          handleNestedUpdate("profileImageStyles.animationColors", { 
                            ...currentColors, 
                            start: e.target.value 
                          });
                        }}
                        className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                      />
                      <span className="text-xs text-slate-500">{profileImageStyles.animationColors?.start || brandColor}</span>
                    </div>
                    <Label className="text-xs text-slate-500">End Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={profileImageStyles.animationColors?.end || accentColor}
                        onChange={(e) => {
                          const currentColors = profileImageStyles.animationColors || {};
                          handleNestedUpdate("profileImageStyles.animationColors", { 
                            ...currentColors, 
                            end: e.target.value 
                          });
                        }}
                        className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                      />
                      <span className="text-xs text-slate-500">{profileImageStyles.animationColors?.end || accentColor}</span>
                    </div>
                  </div>
                )}

                {profileImageStyles.animation === "neon" && profileImageStyles.useBrandColor === false && (
                  <div className="space-y-2 p-3 bg-white rounded border border-slate-200">
                    <Label className="text-xs text-slate-500">Glow Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="color"
                        value={profileImageStyles.animationColors?.primary || brandColor}
                        onChange={(e) => {
                          const currentColors = profileImageStyles.animationColors || {};
                          handleNestedUpdate("profileImageStyles.animationColors", { 
                            ...currentColors, 
                            primary: e.target.value 
                          });
                        }}
                        className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shadow */}
            <div>
              <Label className="text-xs text-slate-500">Shadow: {profileImageStyles.shadow || 0}</Label>
              <input
                type="range"
                min={0}
                max={50}
                value={profileImageStyles.shadow || 0}
                onChange={(e) => handleNestedUpdate("profileImageStyles.shadow", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
              />
            </div>

            {/* Opacity */}
            <div>
              <Label className="text-xs text-slate-500">Opacity: {profileImageStyles.opacity || 100}%</Label>
              <input
                type="range"
                min={0}
                max={100}
                value={profileImageStyles.opacity || 100}
                onChange={(e) => handleNestedUpdate("profileImageStyles.opacity", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
              />
            </div>

            {/* Position Controls */}
            <div className="space-y-3 p-3 bg-white rounded border border-slate-200">
              <Label className="text-xs text-slate-600 font-medium">Image Position</Label>
              
              <div>
                <Label className="text-xs text-slate-500">
                  Horizontal: {coverImageStyles.profilePositionX ?? 50}%
                </Label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={coverImageStyles.profilePositionX ?? 50}
                  onChange={(e) => handleNestedUpdate("coverImageStyles.profilePositionX", parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500">
                  Vertical: {coverImageStyles.profilePositionY ?? 100}%
                </Label>
                <input
                  type="range"
                  min={0}
                  max={120}
                  value={coverImageStyles.profilePositionY ?? 100}
                  onChange={(e) => handleNestedUpdate("coverImageStyles.profilePositionY", parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Cover Image Styling */}
      <div className="border border-purple-200 rounded-lg p-3 space-y-3 bg-purple-50/50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("coverImageStyling")}
        >
          <h4 className="text-sm font-medium text-purple-700 flex items-center gap-2">
            <i className="fas fa-image text-purple-500"></i>
            Cover Image Styling
          </h4>
          <i className={`fas ${collapsedSections.coverImageStyling ? "fa-chevron-down" : "fa-chevron-up"} text-purple-500 text-xs`} />
        </div>

        <Collapsible open={!collapsedSections.coverImageStyling}>
          <CollapsibleContent className="space-y-3 pt-2">
            {/* Visibility Toggle */}
            <div className="flex items-center justify-between p-2 bg-white rounded border border-slate-200">
              <Label className="text-sm text-slate-600">Show Cover Image</Label>
              <input
                type="checkbox"
                checked={data.showCoverImage !== false}
                onChange={(e) => handleDataUpdate({ showCoverImage: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300"
              />
            </div>

            {/* Cover Height */}
            <div>
              <Label className="text-xs text-slate-500">Height: {coverImageStyles.height || 200}px</Label>
              <input
                type="range"
                min={100}
                max={400}
                value={coverImageStyles.height || 200}
                onChange={(e) => handleNestedUpdate("coverImageStyles.height", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
              />
            </div>

            {/* Border Width */}
            <div>
              <Label className="text-xs text-slate-500">Border Width: {coverImageStyles.borderWidth || 0}px</Label>
              <input
                type="range"
                min={0}
                max={20}
                value={coverImageStyles.borderWidth || 0}
                onChange={(e) => handleNestedUpdate("coverImageStyles.borderWidth", parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none slider"
              />
            </div>

            {/* Border Color */}
            {(coverImageStyles.borderWidth || 0) > 0 && (
              <div className="space-y-2 p-3 bg-white rounded border border-slate-200">
                <Label className="text-xs text-slate-500">Border Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={coverImageStyles.borderColor || brandColor}
                    onChange={(e) => handleNestedUpdate("coverImageStyles.borderColor", e.target.value)}
                    className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                  />
                  <span className="text-xs text-slate-500 font-mono">
                    {coverImageStyles.borderColor || brandColor}
                  </span>
                </div>
              </div>
            )}

            {/* Border Animation */}
            <div>
              <Label className="text-xs text-slate-500 mb-2 block">Border Animation</Label>
              <select
                value={coverImageStyles.animation || "none"}
                onChange={(e) => handleNestedUpdate("coverImageStyles.animation", e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-slate-700 text-sm"
              >
                <option value="none">None</option>
                <option value="instagram">Instagram Gradient Spin</option>
                <option value="neon">Neon Glow Pulse</option>
                <option value="wave">Color Wave</option>
                <option value="shimmer">Shimmer Effect</option>
                <option value="gradient-slide">Gradient Slide</option>
              </select>
            </div>

            {/* Shape Divider */}
            <div className="space-y-3 p-3 bg-slate-800 rounded-lg border border-slate-700">
              <Label className="text-sm text-slate-200 font-medium">Shape Divider</Label>
              
              {/* Top/Bottom Toggle */}
              <div className="flex p-1 bg-slate-700 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveDividerPosition("top")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeDividerPosition === "top"
                      ? "bg-slate-600 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  data-testid="btn-shape-divider-top"
                >
                  Top
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDividerPosition("bottom")}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all ${
                    activeDividerPosition === "bottom"
                      ? "bg-orange-500 text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  data-testid="btn-shape-divider-bottom"
                >
                  Bottom
                </button>
              </div>

              {/* Shape Divider Controls - shared UI for both Top and Bottom */}
              {(() => {
                const position = activeDividerPosition;
                const dividerKey = position === "top" ? "shapeDividerTop" : "shapeDividerBottom";
                const dividerStyles = coverImageStyles[dividerKey] || {};
                const isEnabled = dividerStyles.enabled || false;
                const selectedPreset = dividerStyles.preset || "wave";

                return (
                  <div className="space-y-4">
                    {/* Enable Toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-slate-300">Enable</Label>
                      <Checkbox
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleNestedUpdate(`coverImageStyles.${dividerKey}.enabled`, checked)}
                        className="border-slate-500 data-[state=checked]:bg-blue-500"
                        data-testid={`checkbox-shape-divider-${position}-enable`}
                      />
                    </div>

                    {/* Shape Type - Visual Grid */}
                    <div>
                      <Label className="text-sm text-slate-300 mb-2 block">Shape Type</Label>
                      <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                        {SHAPE_DIVIDERS.map((shape) => {
                          const svgPath = SHAPE_PRESETS[shape];
                          const isSelected = selectedPreset === shape;
                          return (
                            <button
                              key={shape}
                              type="button"
                              onClick={() => handleNestedUpdate(`coverImageStyles.${dividerKey}.preset`, shape)}
                              className={`relative h-12 rounded-lg overflow-hidden transition-all border-2 ${
                                isSelected
                                  ? "border-purple-500 ring-2 ring-purple-500/50"
                                  : "border-slate-600 hover:border-slate-500"
                              }`}
                              data-testid={`btn-shape-${position}-${shape}`}
                            >
                              <div className="absolute inset-0 bg-slate-700">
                                <svg
                                  viewBox="0 0 1440 320"
                                  preserveAspectRatio="none"
                                  className="w-full h-full"
                                  style={{ transform: position === "top" ? "scaleY(-1)" : "none" }}
                                >
                                  <path
                                    d={svgPath}
                                    fill={isSelected ? "#a855f7" : "#94a3b8"}
                                    opacity={0.8}
                                  />
                                </svg>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isEnabled && (
                      <>
                        {/* Color */}
                        <div>
                          <Label className="text-sm text-slate-300">Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="color"
                              value={dividerStyles.color || "#ffffff"}
                              onChange={(e) => handleNestedUpdate(`coverImageStyles.${dividerKey}.color`, e.target.value)}
                              className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                              data-testid={`input-shape-${position}-color`}
                            />
                            <span className="text-xs text-slate-400 font-mono">
                              {dividerStyles.color || "#ffffff"}
                            </span>
                          </div>
                        </div>

                        {/* Width */}
                        <div>
                          <Label className="text-sm text-slate-300">
                            Width: {dividerStyles.width || 100}%
                          </Label>
                          <input
                            type="range"
                            min={50}
                            max={200}
                            value={dividerStyles.width || 100}
                            onChange={(e) => handleNestedUpdate(`coverImageStyles.${dividerKey}.width`, parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer mt-1"
                            data-testid={`slider-shape-${position}-width`}
                          />
                        </div>

                        {/* Height */}
                        <div>
                          <Label className="text-sm text-slate-300">
                            Height: {dividerStyles.height || 60}px
                          </Label>
                          <input
                            type="range"
                            min={20}
                            max={150}
                            value={dividerStyles.height || 60}
                            onChange={(e) => handleNestedUpdate(`coverImageStyles.${dividerKey}.height`, parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer mt-1"
                            data-testid={`slider-shape-${position}-height`}
                          />
                        </div>

                        {/* Invert */}
                        <div className="flex items-center justify-between">
                          <Label className="text-sm text-slate-300">Flip</Label>
                          <Checkbox
                            checked={dividerStyles.invert || false}
                            onCheckedChange={(checked) => handleNestedUpdate(`coverImageStyles.${dividerKey}.invert`, checked)}
                            className="border-slate-500 data-[state=checked]:bg-blue-500"
                            data-testid={`checkbox-shape-${position}-invert`}
                          />
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Basic Information Fields */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div>
          <Label htmlFor="fullName" className="text-slate-700 font-medium">Full Name *</Label>
          <Input
            id="fullName"
            value={data.fullName || ""}
            onChange={(e) => handleDataUpdate({ fullName: e.target.value })}
            onBlur={handleBlurSave}
            placeholder="John Doe"
            className="bg-white border-slate-300 text-slate-800"
            data-testid="input-profile-fullname"
          />
        </div>

        <div>
          <Label htmlFor="title" className="text-slate-700 font-medium">Title/Role *</Label>
          <Input
            id="title"
            value={data.title || ""}
            onChange={(e) => handleDataUpdate({ title: e.target.value })}
            onBlur={handleBlurSave}
            placeholder="Senior Developer"
            className="bg-white border-slate-300 text-slate-800"
            data-testid="input-profile-title"
          />
        </div>

        <div>
          <Label htmlFor="company" className="text-slate-700 font-medium">Company</Label>
          <Input
            id="company"
            value={data.company || ""}
            onChange={(e) => handleDataUpdate({ company: e.target.value })}
            onBlur={handleBlurSave}
            placeholder="Tech Corp"
            className="bg-white border-slate-300 text-slate-800"
            data-testid="input-profile-company"
          />
        </div>
      </div>

      {/* Name Styling */}
      <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("nameStyling")}
        >
          <h5 className="text-xs font-normal text-slate-600">Name Styling</h5>
          <i className={`fas fa-chevron-${collapsedSections.nameStyling ? "down" : "up"} text-slate-400 text-xs`} />
        </div>

        <Collapsible open={!collapsedSections.nameStyling}>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-700 text-xs">Color</Label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={sectionStyles.basicInfo?.nameColor || "#ffffff"}
                    onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.nameColor", e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <Input
                    value={sectionStyles.basicInfo?.nameColor || "#ffffff"}
                    onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.nameColor", e.target.value)}
                    className="bg-white border-slate-300 text-slate-800 text-xs"
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 text-xs">Font</Label>
                <Select
                  value={sectionStyles.basicInfo?.nameFont || ""}
                  onValueChange={(v) => handleNestedUpdate("sectionStyles.basicInfo.nameFont", v)}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800 text-xs">
                    <SelectValue placeholder="Choose font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 text-xs">
                  Size: {sectionStyles.basicInfo?.nameFontSize || 24}px
                </Label>
                <input
                  type="range"
                  value={sectionStyles.basicInfo?.nameFontSize || 24}
                  onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.nameFontSize", parseInt(e.target.value))}
                  className="custom-range w-full"
                  min={12}
                  max={48}
                />
              </div>

              <div>
                <Label className="text-slate-700 text-xs">Weight</Label>
                <Select
                  value={sectionStyles.basicInfo?.nameFontWeight || ""}
                  onValueChange={(v) => handleNestedUpdate("sectionStyles.basicInfo.nameFontWeight", v)}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800 text-xs">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="nameItalic"
                checked={sectionStyles.basicInfo?.nameTextStyle === "italic"}
                onCheckedChange={(c) => handleNestedUpdate("sectionStyles.basicInfo.nameTextStyle", c ? "italic" : "normal")}
              />
              <Label htmlFor="nameItalic" className="text-slate-700 text-xs">Italic</Label>
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Spacing (Bottom): {sectionStyles.basicInfo?.nameSpacing ?? 8}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.nameSpacing ?? 8}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.nameSpacing", parseInt(e.target.value))}
                className="custom-range w-full"
                min={0}
                max={50}
              />
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Horizontal Position: {sectionStyles.basicInfo?.namePositionX ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.namePositionX ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.namePositionX", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Vertical Position: {sectionStyles.basicInfo?.namePositionY ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.namePositionY ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.namePositionY", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Title Styling */}
      <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("titleStyling")}
        >
          <h5 className="text-xs font-normal text-slate-600">Title Styling</h5>
          <i className={`fas fa-chevron-${collapsedSections.titleStyling ? "down" : "up"} text-slate-400 text-xs`} />
        </div>

        <Collapsible open={!collapsedSections.titleStyling}>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-700 text-xs">Color</Label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={sectionStyles.basicInfo?.titleColor || "#4b5563"}
                    onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.titleColor", e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <Input
                    value={sectionStyles.basicInfo?.titleColor || ""}
                    onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.titleColor", e.target.value)}
                    className="bg-white border-slate-300 text-slate-800 text-xs"
                    placeholder="#4b5563"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 text-xs">Font</Label>
                <Select
                  value={sectionStyles.basicInfo?.titleFont || ""}
                  onValueChange={(v) => handleNestedUpdate("sectionStyles.basicInfo.titleFont", v)}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800 text-xs">
                    <SelectValue placeholder="Choose font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 text-xs">
                  Size: {sectionStyles.basicInfo?.titleFontSize || 14}px
                </Label>
                <input
                  type="range"
                  value={sectionStyles.basicInfo?.titleFontSize || 14}
                  onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.titleFontSize", parseInt(e.target.value))}
                  className="custom-range w-full"
                  min={10}
                  max={32}
                />
              </div>

              <div>
                <Label className="text-slate-700 text-xs">Weight</Label>
                <Select
                  value={sectionStyles.basicInfo?.titleFontWeight || ""}
                  onValueChange={(v) => handleNestedUpdate("sectionStyles.basicInfo.titleFontWeight", v)}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800 text-xs">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="titleItalic"
                checked={sectionStyles.basicInfo?.titleTextStyle === "italic"}
                onCheckedChange={(c) => handleNestedUpdate("sectionStyles.basicInfo.titleTextStyle", c ? "italic" : "normal")}
              />
              <Label htmlFor="titleItalic" className="text-slate-700 text-xs">Italic</Label>
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Spacing (Bottom): {sectionStyles.basicInfo?.titleSpacing ?? 8}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.titleSpacing ?? 8}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.titleSpacing", parseInt(e.target.value))}
                className="custom-range w-full"
                min={0}
                max={50}
              />
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Horizontal Position: {sectionStyles.basicInfo?.titlePositionX ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.titlePositionX ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.titlePositionX", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Vertical Position: {sectionStyles.basicInfo?.titlePositionY ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.titlePositionY ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.titlePositionY", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Company Styling */}
      <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("companyStyling")}
        >
          <h5 className="text-xs font-normal text-slate-600">Company Styling</h5>
          <i className={`fas fa-chevron-${collapsedSections.companyStyling ? "down" : "up"} text-slate-400 text-xs`} />
        </div>

        <Collapsible open={!collapsedSections.companyStyling}>
          <CollapsibleContent className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-slate-700 text-xs">Color</Label>
                <div className="flex items-center gap-1">
                  <input
                    type="color"
                    value={sectionStyles.basicInfo?.companyColor || "#6b7280"}
                    onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.companyColor", e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                  <Input
                    value={sectionStyles.basicInfo?.companyColor || ""}
                    onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.companyColor", e.target.value)}
                    className="bg-white border-slate-300 text-slate-800 text-xs"
                    placeholder="#6b7280"
                  />
                </div>
              </div>

              <div>
                <Label className="text-slate-700 text-xs">Font</Label>
                <Select
                  value={sectionStyles.basicInfo?.companyFont || ""}
                  onValueChange={(v) => handleNestedUpdate("sectionStyles.basicInfo.companyFont", v)}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800 text-xs">
                    <SelectValue placeholder="Choose font" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-slate-700 text-xs">
                  Size: {sectionStyles.basicInfo?.companyFontSize || 14}px
                </Label>
                <input
                  type="range"
                  value={sectionStyles.basicInfo?.companyFontSize || 14}
                  onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.companyFontSize", parseInt(e.target.value))}
                  className="custom-range w-full"
                  min={10}
                  max={32}
                />
              </div>

              <div>
                <Label className="text-slate-700 text-xs">Weight</Label>
                <Select
                  value={sectionStyles.basicInfo?.companyFontWeight || ""}
                  onValueChange={(v) => handleNestedUpdate("sectionStyles.basicInfo.companyFontWeight", v)}
                >
                  <SelectTrigger className="bg-white border-slate-300 text-slate-800 text-xs">
                    <SelectValue placeholder="Weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="companyItalic"
                checked={sectionStyles.basicInfo?.companyTextStyle === "italic"}
                onCheckedChange={(c) => handleNestedUpdate("sectionStyles.basicInfo.companyTextStyle", c ? "italic" : "normal")}
              />
              <Label htmlFor="companyItalic" className="text-slate-700 text-xs">Italic</Label>
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Spacing (Bottom): {sectionStyles.basicInfo?.companySpacing ?? 8}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.companySpacing ?? 8}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.companySpacing", parseInt(e.target.value))}
                className="custom-range w-full"
                min={0}
                max={50}
              />
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Horizontal Position: {sectionStyles.basicInfo?.companyPositionX ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.companyPositionX ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.companyPositionX", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Vertical Position: {sectionStyles.basicInfo?.companyPositionY ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.companyPositionY ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.companyPositionY", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Text Group Position */}
      <div className="border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection("textGroupPosition")}
        >
          <h5 className="text-xs font-normal text-slate-600">Text Group Position</h5>
          <i className={`fas fa-chevron-${collapsedSections.textGroupPosition ? "down" : "up"} text-slate-400 text-xs`} />
        </div>

        <Collapsible open={!collapsedSections.textGroupPosition}>
          <CollapsibleContent className="space-y-3 pt-2">
            <div>
              <Label className="text-slate-700 text-xs">
                Horizontal Position: {sectionStyles.basicInfo?.textGroupHorizontal ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.textGroupHorizontal ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.textGroupHorizontal", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>

            <div>
              <Label className="text-slate-700 text-xs">
                Vertical Position: {sectionStyles.basicInfo?.textGroupVertical ?? 0}px
              </Label>
              <input
                type="range"
                value={sectionStyles.basicInfo?.textGroupVertical ?? 0}
                onChange={(e) => handleNestedUpdate("sectionStyles.basicInfo.textGroupVertical", parseInt(e.target.value))}
                className="custom-range w-full"
                min={-150}
                max={150}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
