import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";

// Sortable item component
function SortableItem({ id, children }: { id: string; children: React.ReactNode }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing p-2"
      >
        <svg
          className="w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </div>
      {children}
    </div>
  );
}

interface Social {
  id: string;
  label: string;
  url: string;
  icon: string;
  platform: string;
}

interface SocialSectionData {
  socials?: Social[];
  iconColor?: string;
  iconSize?: string;
  hoverColor?: string;
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  textColor?: string;
  shadowColor?: string;
  shadowBlur?: string;
  shadowOffsetX?: string;
  shadowOffsetY?: string;
  containerBackground?: string;
  containerBorderColor?: string;
  containerBorderWidth?: string;
  containerBorderRadius?: string;
  containerPadding?: string;
  gap?: string;
}

interface SocialSectionEditorProps {
  data: SocialSectionData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SocialSectionData) => void;
}

const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: "fab fa-facebook", placeholder: "facebook.com/username" },
  { value: "twitter", label: "Twitter", icon: "fab fa-twitter", placeholder: "@username" },
  { value: "instagram", label: "Instagram", icon: "fab fa-instagram", placeholder: "@username" },
  { value: "linkedin", label: "LinkedIn", icon: "fab fa-linkedin", placeholder: "linkedin.com/in/username" },
  { value: "youtube", label: "YouTube", icon: "fab fa-youtube", placeholder: "youtube.com/channel" },
  { value: "tiktok", label: "TikTok", icon: "fab fa-tiktok", placeholder: "@username" },
  { value: "github", label: "GitHub", icon: "fab fa-github", placeholder: "github.com/username" },
  { value: "whatsapp", label: "WhatsApp", icon: "fab fa-whatsapp", placeholder: "+1234567890" },
  { value: "telegram", label: "Telegram", icon: "fab fa-telegram", placeholder: "@username" },
  { value: "snapchat", label: "Snapchat", icon: "fab fa-snapchat", placeholder: "@username" },
  { value: "pinterest", label: "Pinterest", icon: "fab fa-pinterest", placeholder: "pinterest.com/username" },
  { value: "reddit", label: "Reddit", icon: "fab fa-reddit", placeholder: "u/username" },
  { value: "discord", label: "Discord", icon: "fab fa-discord", placeholder: "username#1234" },
  { value: "twitch", label: "Twitch", icon: "fab fa-twitch", placeholder: "twitch.tv/username" },
  { value: "spotify", label: "Spotify", icon: "fab fa-spotify", placeholder: "open.spotify.com/user" },
  { value: "dribbble", label: "Dribbble", icon: "fab fa-dribbble", placeholder: "dribbble.com/username" },
  { value: "behance", label: "Behance", icon: "fab fa-behance", placeholder: "behance.net/username" },
  { value: "medium", label: "Medium", icon: "fab fa-medium", placeholder: "@username" },
  { value: "custom", label: "Custom", icon: "fas fa-link", placeholder: "URL or username" },
];

export function SocialSectionEditor({ data, isOpen, onClose, onSave }: SocialSectionEditorProps) {
  const [editData, setEditData] = useState<SocialSectionData>({
    socials: data.socials || [],
    iconColor: data.iconColor || "#9333ea",
    iconSize: data.iconSize || "24",
    hoverColor: data.hoverColor || "#a855f7",
    fontFamily: data.fontFamily || "inherit",
    fontSize: data.fontSize || "16",
    fontWeight: data.fontWeight || "400",
    textColor: data.textColor || "#ffffff",
    shadowColor: data.shadowColor || "rgba(0,0,0,0.3)",
    shadowBlur: data.shadowBlur || "0",
    shadowOffsetX: data.shadowOffsetX || "0",
    shadowOffsetY: data.shadowOffsetY || "0",
    containerBackground: data.containerBackground || "transparent",
    containerBorderColor: data.containerBorderColor || "transparent",
    containerBorderWidth: data.containerBorderWidth || "0",
    containerBorderRadius: data.containerBorderRadius || "8",
    containerPadding: data.containerPadding || "16",
    gap: data.gap || "12",
  });

  const [collapsedSections, setCollapsedSections] = useState({
    iconStyling: true,
    hoverColor: true,
    fontStyling: true,
    dropShadow: true,
    containerStyling: true,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleSocialDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const socials = editData.socials || [];
      const oldIndex = socials.findIndex((s) => s.id === active.id);
      const newIndex = socials.findIndex((s) => s.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSocials = arrayMove(socials, oldIndex, newIndex);
        setEditData({ ...editData, socials: reorderedSocials });
      }
    }
  };

  const addSocial = () => {
    const newSocial: Social = {
      id: `social_${Date.now()}`,
      label: "Social",
      url: "",
      icon: "fab fa-facebook",
      platform: "facebook",
    };
    setEditData({
      ...editData,
      socials: [...(editData.socials || []), newSocial],
    });
  };

  const updateSocial = (index: number, updates: Partial<Social>) => {
    const socials = [...(editData.socials || [])];
    
    // If platform changes, update icon and label automatically
    if (updates.platform) {
      const platform = socialPlatforms.find(p => p.value === updates.platform);
      if (platform) {
        updates.icon = platform.icon;
        if (socials[index].label === "Social" || 
            socialPlatforms.find(p => p.label === socials[index].label)) {
          updates.label = platform.label;
        }
      }
    }
    
    socials[index] = { ...socials[index], ...updates };
    setEditData({ ...editData, socials });
  };

  const removeSocial = (index: number) => {
    const socials = (editData.socials || []).filter((_, i) => i !== index);
    setEditData({ ...editData, socials });
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSave = () => {
    onSave(editData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Social Media Section</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Additional Social Platforms */}
          <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
            <h4 className="text-md font-medium text-purple-300">Additional Social Platforms</h4>
            
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleSocialDragEnd}
            >
              <SortableContext
                items={editData.socials?.map(s => s.id) || []}
                strategy={verticalListSortingStrategy}
              >
                {editData.socials?.map((social, index) => {
                  const platform = socialPlatforms.find(p => p.value === social.platform) || socialPlatforms[0];
                  return (
                    <SortableItem key={social.id} id={social.id}>
                      <div className="flex gap-2 items-end bg-slate-800/50 p-3 rounded-lg border border-slate-700 ml-8">
                        <div className="flex-1">
                          <Label className="text-white">Button Label</Label>
                          <Input
                            value={social.label}
                            onChange={(e) => updateSocial(index, { label: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Social"
                          />
                        </div>
                        <div className="flex-1">
                          <Label className="text-white">Username/URL</Label>
                          <Input
                            value={social.url}
                            onChange={(e) => updateSocial(index, { url: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder={platform.placeholder || "@username or URL"}
                          />
                        </div>
                        <div className="w-40">
                          <Label className="text-white">Icon</Label>
                          <Select
                            value={social.platform}
                            onValueChange={(value) => updateSocial(index, { platform: value })}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                              <SelectValue>
                                <i className={`${social.icon} mr-2`} />
                                {socialPlatforms.find(p => p.value === social.platform)?.label || social.label}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                              {socialPlatforms.map(platform => (
                                <SelectItem key={platform.value} value={platform.value}>
                                  <i className={`${platform.icon} mr-2`} />
                                  {platform.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          onClick={() => removeSocial(index)}
                          className="bg-red-600 hover:bg-red-700"
                          size="icon"
                        >
                          <i className="fas fa-trash" />
                        </Button>
                      </div>
                    </SortableItem>
                  );
                })}
              </SortableContext>
            </DndContext>

            <Button
              onClick={addSocial}
              className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <i className="fas fa-plus mr-2" />
              Add Social Platform
            </Button>
          </div>

          {/* Icon Styling */}
          <Collapsible open={!collapsedSections.iconStyling}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("iconStyling")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Icon Styling</h4>
                <i className={`fas ${collapsedSections.iconStyling ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Icon Color</Label>
                  <Input
                    type="color"
                    value={editData.iconColor}
                    onChange={(e) => setEditData({ ...editData, iconColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
                <div>
                  <Label className="text-white">Icon Size (px)</Label>
                  <Input
                    type="number"
                    value={editData.iconSize}
                    onChange={(e) => setEditData({ ...editData, iconSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Hover Color */}
          <Collapsible open={!collapsedSections.hoverColor}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("hoverColor")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Hover Color</h4>
                <i className={`fas ${collapsedSections.hoverColor ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1">
                <Label className="text-white">Hover Color</Label>
                <Input
                  type="color"
                  value={editData.hoverColor}
                  onChange={(e) => setEditData({ ...editData, hoverColor: e.target.value })}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Font Styling */}
          <Collapsible open={!collapsedSections.fontStyling}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("fontStyling")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Font Styling</h4>
                <i className={`fas ${collapsedSections.fontStyling ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Font Family</Label>
                  <Select
                    value={editData.fontFamily}
                    onValueChange={(value) => setEditData({ ...editData, fontFamily: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="inherit">Default</SelectItem>
                      <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                      <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
                      <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
                      <SelectItem value="Georgia, serif">Georgia</SelectItem>
                      <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Font Size (px)</Label>
                  <Input
                    type="number"
                    value={editData.fontSize}
                    onChange={(e) => setEditData({ ...editData, fontSize: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white">Font Weight</Label>
                  <Select
                    value={editData.fontWeight}
                    onValueChange={(value) => setEditData({ ...editData, fontWeight: value })}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="300">Light</SelectItem>
                      <SelectItem value="400">Normal</SelectItem>
                      <SelectItem value="500">Medium</SelectItem>
                      <SelectItem value="600">Semi-Bold</SelectItem>
                      <SelectItem value="700">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white">Text Color</Label>
                  <Input
                    type="color"
                    value={editData.textColor}
                    onChange={(e) => setEditData({ ...editData, textColor: e.target.value })}
                    className="bg-slate-700 border-slate-600"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Drop Shadow */}
          <Collapsible open={!collapsedSections.dropShadow}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("dropShadow")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Drop Shadow</h4>
                <i className={`fas ${collapsedSections.dropShadow ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Shadow Color</Label>
                  <Input
                    type="text"
                    value={editData.shadowColor}
                    onChange={(e) => setEditData({ ...editData, shadowColor: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="rgba(0,0,0,0.3)"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white">Blur (px)</Label>
                    <Input
                      type="number"
                      value={editData.shadowBlur}
                      onChange={(e) => setEditData({ ...editData, shadowBlur: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Offset X (px)</Label>
                    <Input
                      type="number"
                      value={editData.shadowOffsetX}
                      onChange={(e) => setEditData({ ...editData, shadowOffsetX: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Offset Y (px)</Label>
                    <Input
                      type="number"
                      value={editData.shadowOffsetY}
                      onChange={(e) => setEditData({ ...editData, shadowOffsetY: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Social Container Styling */}
          <Collapsible open={!collapsedSections.containerStyling}>
            <div 
              className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 cursor-pointer"
              onClick={() => toggleSection("containerStyling")}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-purple-300">Social Container Styling</h4>
                <i className={`fas ${collapsedSections.containerStyling ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
              </div>
            </div>
            <CollapsibleContent>
              <div className="bg-purple-900/30 border-x border-b border-purple-600/30 rounded-b-lg p-4 -mt-1 space-y-3">
                <div>
                  <Label className="text-white">Background Color</Label>
                  <Input
                    type="text"
                    value={editData.containerBackground}
                    onChange={(e) => setEditData({ ...editData, containerBackground: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="transparent or #color"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">Border Color</Label>
                    <Input
                      type="text"
                      value={editData.containerBorderColor}
                      onChange={(e) => setEditData({ ...editData, containerBorderColor: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="transparent or #color"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Border Width (px)</Label>
                    <Input
                      type="number"
                      value={editData.containerBorderWidth}
                      onChange={(e) => setEditData({ ...editData, containerBorderWidth: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-white">Border Radius (px)</Label>
                    <Input
                      type="number"
                      value={editData.containerBorderRadius}
                      onChange={(e) => setEditData({ ...editData, containerBorderRadius: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-white">Padding (px)</Label>
                    <Input
                      type="number"
                      value={editData.containerPadding}
                      onChange={(e) => setEditData({ ...editData, containerPadding: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white">Gap Between Items (px)</Label>
                  <Input
                    type="number"
                    value={editData.gap}
                    onChange={(e) => setEditData({ ...editData, gap: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}