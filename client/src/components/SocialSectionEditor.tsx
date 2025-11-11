import { useState } from "react";
import { SelectItem } from "@/components/ui/select";
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
import {
  PanelWrapper,
  PanelHeader,
  SidebarSection,
  PanelLabel,
  PanelInput,
  PanelSelect,
  PanelCheckbox,
  PanelSlider,
  PanelColorPicker,
  PanelButton,
  panelTheme
} from "./sidebar-panel-theme";
import {
  SiFacebook, SiTwitter, SiInstagram, SiLinkedin, SiYoutube,
  SiTiktok, SiPinterest, SiSnapchat, SiReddit, SiTumblr,
  SiWhatsapp, SiTelegram, SiDiscord, SiSlack, SiMedium,
  SiGithub, SiDribbble, SiBehance, SiSpotify, SiTwitch,
  SiVimeo, SiFlickr, SiThreads, SiX
} from "react-icons/si";

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
          className="w-4 h-4"
          fill="none"
          stroke={panelTheme.colors.textSecondary}
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
  // Icon Styling
  iconColor?: string;
  iconSize?: string;
  iconBgColor?: string;
  iconBorderColor?: string;
  iconBorderSize?: string;
  iconBgSize?: string;
  view?: 'icon-text' | 'text-only' | 'icon-only';
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square' | 'rounded' | 'auto';
  alignment?: 'left' | 'center' | 'right' | 'justified';
  showLabel?: boolean;
  iconWidth?: string;
  iconHeight?: string;
  // Advanced Layout Options
  skin?: 'gradient' | 'minimal' | 'framed' | 'boxed' | 'flat';
  columns?: string;
  textPosition?: 'left' | 'right' | 'top' | 'bottom';
  // Hover Color
  hoverColor?: string;
  enableHoverColor?: boolean;
  iconHoverColor?: string;
  bgHoverColor?: string;
  // Font Styling
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textColor?: string;
  // Drop Shadow
  shadowColor?: string;
  shadowBlur?: string;
  shadowOffsetX?: string;
  shadowOffsetY?: string;
  shadowOpacity?: string;
  // Layout
  gap?: string;
  // Container Styling
  outerContainer?: {
    enabled?: boolean;
    background?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    width?: string;
    height?: string;
    shadowEnabled?: boolean;
    shadowColor?: string;
    shadowOpacity?: number;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
  iconContainer?: {
    enabled?: boolean;
    background?: string;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    padding?: number;
    shadowEnabled?: boolean;
    shadowColor?: string;
    shadowOpacity?: number;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
  };
}

interface SocialSectionEditorProps {
  data: SocialSectionData;
  onChange: (data: SocialSectionData) => void;
}

const socialPlatforms = [
  { value: "facebook", label: "Facebook", icon: SiFacebook },
  { value: "x", label: "X (Twitter)", icon: SiX },
  { value: "instagram", label: "Instagram", icon: SiInstagram },
  { value: "linkedin", label: "LinkedIn", icon: SiLinkedin },
  { value: "youtube", label: "YouTube", icon: SiYoutube },
  { value: "tiktok", label: "TikTok", icon: SiTiktok },
  { value: "pinterest", label: "Pinterest", icon: SiPinterest },
  { value: "snapchat", label: "Snapchat", icon: SiSnapchat },
  { value: "reddit", label: "Reddit", icon: SiReddit },
  { value: "tumblr", label: "Tumblr", icon: SiTumblr },
  { value: "whatsapp", label: "WhatsApp", icon: SiWhatsapp },
  { value: "telegram", label: "Telegram", icon: SiTelegram },
  { value: "discord", label: "Discord", icon: SiDiscord },
  { value: "slack", label: "Slack", icon: SiSlack },
  { value: "medium", label: "Medium", icon: SiMedium },
  { value: "github", label: "GitHub", icon: SiGithub },
  { value: "dribbble", label: "Dribbble", icon: SiDribbble },
  { value: "behance", label: "Behance", icon: SiBehance },
  { value: "spotify", label: "Spotify", icon: SiSpotify },
  { value: "twitch", label: "Twitch", icon: SiTwitch },
  { value: "vimeo", label: "Vimeo", icon: SiVimeo },
  { value: "flickr", label: "Flickr", icon: SiFlickr },
  { value: "threads", label: "Threads", icon: SiThreads }
];

export function SocialSectionEditor({ data, onChange }: SocialSectionEditorProps) {
  const [collapsedSections, setCollapsedSections] = useState({
    iconStyling: false,
    hoverColor: true,
    fontStyling: true,
    dropShadow: true,
    layout: true,
    outerContainer: true,
    iconContainer: true,
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
      const socials = data.socials || [];
      const oldIndex = socials.findIndex((s) => s.id === active.id);
      const newIndex = socials.findIndex((s) => s.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSocials = arrayMove(socials, oldIndex, newIndex);
        onChange({ ...data, socials: reorderedSocials });
      }
    }
  };

  const addSocial = () => {
    const newSocial: Social = {
      id: `social_${Date.now()}`,
      label: "Facebook",
      url: "",
      icon: "fab fa-facebook",
      platform: "facebook"
    };
    onChange({
      ...data,
      socials: [...(data.socials || []), newSocial],
    });
  };

  const updateSocial = (index: number, updates: Partial<Social>) => {
    const socials = [...(data.socials || [])];
    socials[index] = { ...socials[index], ...updates };
    onChange({ ...data, socials });
  };

  const removeSocial = (index: number) => {
    const socials = (data.socials || []).filter((_, i) => i !== index);
    onChange({ ...data, socials });
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const getPlatformIcon = (platform: string) => {
    const plat = socialPlatforms.find(p => p.value === platform);
    return plat?.icon || SiFacebook;
  };

  return (
    <PanelWrapper>
      <PanelHeader title="Social Media" />
      
      <div className="space-y-1">
        {/* Additional Social Platforms */}
        <div className="px-3 py-2" style={{ backgroundColor: panelTheme.colors.sectionBg }}>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium" style={{ color: panelTheme.colors.textSecondary }}>
              Additional Social Platforms
            </h4>
            <PanelButton onClick={addSocial} variant="success">
              <i className="fas fa-plus mr-1 text-xs" />
              Add Social Platform
            </PanelButton>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleSocialDragEnd}
          >
            <SortableContext
              items={data.socials?.map(s => s.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {data.socials?.map((social, index) => (
                  <SortableItem key={social.id} id={social.id}>
                    <div 
                      className="flex gap-2 items-end p-2 rounded ml-8"
                      style={{ 
                        backgroundColor: panelTheme.colors.inputBg,
                        border: `1px solid ${panelTheme.colors.borderColorLight}`
                      }}
                    >
                      <div className="flex-1">
                        <PanelLabel>Platform</PanelLabel>
                        <PanelSelect
                          value={social.platform}
                          onValueChange={(value) => {
                            const platform = socialPlatforms.find(p => p.value === value);
                            updateSocial(index, { 
                              platform: value,
                              label: platform?.label || value,
                              icon: `si-${value}`
                            });
                          }}
                        >
                          {socialPlatforms.map(p => {
                            const Icon = p.icon;
                            return (
                              <SelectItem key={p.value} value={p.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className="w-4 h-4" />
                                  <span>{p.label}</span>
                                </div>
                              </SelectItem>
                            );
                          })}
                        </PanelSelect>
                      </div>
                      <div className="flex-1">
                        <PanelLabel>URL</PanelLabel>
                        <PanelInput
                          value={social.url}
                          onChange={(e) => updateSocial(index, { url: e.target.value })}
                          placeholder="https://..."
                        />
                      </div>
                      <PanelButton onClick={() => removeSocial(index)} variant="danger">
                        <i className="fas fa-trash text-xs" />
                      </PanelButton>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Icon Styling */}
        <SidebarSection
          title="Icon Styling"
          isOpen={!collapsedSections.iconStyling}
          onToggle={() => toggleSection("iconStyling")}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <PanelLabel>Icon Color</PanelLabel>
                <PanelColorPicker
                  value={data.iconColor || "#9333ea"}
                  onChange={(e) => onChange({ ...data, iconColor: e.target.value })}
                />
              </div>
              <div>
                <PanelLabel>Background Color</PanelLabel>
                <PanelColorPicker
                  value={data.iconBgColor || "transparent"}
                  onChange={(e) => onChange({ ...data, iconBgColor: e.target.value })}
                />
              </div>
            </div>

            <div>
              <PanelLabel>Border Color</PanelLabel>
              <PanelColorPicker
                value={data.iconBorderColor || "transparent"}
                onChange={(e) => onChange({ ...data, iconBorderColor: e.target.value })}
              />
            </div>

            <PanelSlider
              value={parseInt(data.iconBorderSize || "0")}
              onChange={(value) => onChange({ ...data, iconBorderSize: value.toString() })}
              min={0}
              max={20}
              label="Border Size"
            />

            <PanelSlider
              value={parseInt(data.iconSize || "20")}
              onChange={(value) => onChange({ ...data, iconSize: value.toString() })}
              min={10}
              max={100}
              label="Icon Size"
            />

            <PanelSlider
              value={parseInt(data.iconBgSize || "40")}
              onChange={(value) => onChange({ ...data, iconBgSize: value.toString() })}
              min={20}
              max={200}
              label="Icon Background Size"
            />

            <div>
              <PanelLabel>View</PanelLabel>
              <PanelSelect
                value={data.view || "icon-text"}
                onValueChange={(value: 'icon-text' | 'text-only' | 'icon-only') => onChange({ ...data, view: value })}
              >
                <SelectItem value="icon-text">Icon & Text</SelectItem>
                <SelectItem value="text-only">Text Only</SelectItem>
                <SelectItem value="icon-only">Icon Only</SelectItem>
              </PanelSelect>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PanelLabel>Size</PanelLabel>
                <PanelSelect
                  value={data.size || "medium"}
                  onValueChange={(value: 'small' | 'medium' | 'large') => onChange({ ...data, size: value })}
                >
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </PanelSelect>
              </div>
              <div>
                <PanelLabel>Shape</PanelLabel>
                <PanelSelect
                  value={data.shape || "circle"}
                  onValueChange={(value: 'circle' | 'square' | 'rounded' | 'auto') => onChange({ ...data, shape: value })}
                >
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                  <SelectItem value="rounded">Rounded</SelectItem>
                  <SelectItem value="auto">Auto</SelectItem>
                </PanelSelect>
              </div>
            </div>

            <div>
              <PanelLabel>Alignment</PanelLabel>
              <PanelSelect
                value={data.alignment || "center"}
                onValueChange={(value: 'left' | 'center' | 'right' | 'justified') => onChange({ ...data, alignment: value })}
              >
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="justified">Justified</SelectItem>
              </PanelSelect>
            </div>

            <PanelCheckbox
              id="showLabel"
              checked={data.showLabel !== false}
              onCheckedChange={(checked) => onChange({ ...data, showLabel: checked })}
              label="Show Label"
            />

            <div>
              <PanelLabel>Skin</PanelLabel>
              <PanelSelect
                value={data.skin || "minimal"}
                onValueChange={(value: 'gradient' | 'minimal' | 'framed' | 'boxed' | 'flat') => onChange({ ...data, skin: value })}
              >
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="framed">Framed</SelectItem>
                <SelectItem value="boxed">Boxed</SelectItem>
                <SelectItem value="flat">Flat</SelectItem>
              </PanelSelect>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <PanelLabel>Columns</PanelLabel>
                <PanelSelect
                  value={data.columns || "auto"}
                  onValueChange={(value) => onChange({ ...data, columns: value })}
                >
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="1">1</SelectItem>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="3">3</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="6">6</SelectItem>
                </PanelSelect>
              </div>
              <div>
                <PanelLabel>Text Position</PanelLabel>
                <PanelSelect
                  value={data.textPosition || "right"}
                  onValueChange={(value: 'left' | 'right' | 'top' | 'bottom') => onChange({ ...data, textPosition: value })}
                >
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="top">Top</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </PanelSelect>
              </div>
            </div>

            <PanelSlider
              value={parseInt(data.iconWidth || "40")}
              onChange={(value) => onChange({ ...data, iconWidth: value.toString() })}
              min={0}
              max={100}
              label="Icon Width"
            />

            <PanelSlider
              value={parseInt(data.iconHeight || "40")}
              onChange={(value) => onChange({ ...data, iconHeight: value.toString() })}
              min={0}
              max={100}
              label="Icon Height"
            />
          </div>
        </SidebarSection>

        {/* Hover Color */}
        <SidebarSection
          title="Hover Color"
          isOpen={!collapsedSections.hoverColor}
          onToggle={() => toggleSection("hoverColor")}
        >
          <PanelCheckbox
            id="enableHoverColor"
            checked={data.enableHoverColor || false}
            onCheckedChange={(checked) => onChange({ ...data, enableHoverColor: checked })}
            label="Enable Hover Color"
          />
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <PanelLabel>Icon Hover Color</PanelLabel>
              <PanelColorPicker
                value={data.iconHoverColor || "#a855f7"}
                onChange={(e) => onChange({ ...data, iconHoverColor: e.target.value })}
              />
            </div>
            <div>
              <PanelLabel>Background Hover Color</PanelLabel>
              <PanelColorPicker
                value={data.bgHoverColor || "#4c1d95"}
                onChange={(e) => onChange({ ...data, bgHoverColor: e.target.value })}
              />
            </div>
          </div>
        </SidebarSection>

        {/* Font Styling */}
        <SidebarSection
          title="Font Styling"
          isOpen={!collapsedSections.fontStyling}
          onToggle={() => toggleSection("fontStyling")}
        >
          <div>
            <PanelLabel>Font Family</PanelLabel>
            <PanelSelect
              value={data.fontFamily || "inherit"}
              onValueChange={(value) => onChange({ ...data, fontFamily: value })}
            >
              <SelectItem value="inherit">Default</SelectItem>
              <SelectItem value="Arial, sans-serif">Arial</SelectItem>
              <SelectItem value="'Times New Roman', serif">Times New Roman</SelectItem>
              <SelectItem value="'Courier New', monospace">Courier New</SelectItem>
              <SelectItem value="Georgia, serif">Georgia</SelectItem>
              <SelectItem value="Verdana, sans-serif">Verdana</SelectItem>
            </PanelSelect>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <PanelLabel>Font Size (px)</PanelLabel>
              <PanelInput
                type="number"
                value={data.fontSize || "16"}
                onChange={(e) => onChange({ ...data, fontSize: e.target.value })}
              />
            </div>
            <div>
              <PanelLabel>Font Weight</PanelLabel>
              <PanelSelect
                value={data.fontWeight || "400"}
                onValueChange={(value) => onChange({ ...data, fontWeight: value })}
              >
                <SelectItem value="300">Light</SelectItem>
                <SelectItem value="400">Normal</SelectItem>
                <SelectItem value="500">Medium</SelectItem>
                <SelectItem value="600">Semi-Bold</SelectItem>
                <SelectItem value="700">Bold</SelectItem>
              </PanelSelect>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <PanelLabel>Font Style</PanelLabel>
              <PanelSelect
                value={data.fontStyle || "normal"}
                onValueChange={(value: 'normal' | 'italic' | 'oblique') => onChange({ ...data, fontStyle: value })}
              >
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="italic">Italic</SelectItem>
                <SelectItem value="oblique">Oblique</SelectItem>
              </PanelSelect>
            </div>
            <div>
              <PanelLabel>Text Color</PanelLabel>
              <PanelColorPicker
                value={data.textColor || "#000000"}
                onChange={(e) => onChange({ ...data, textColor: e.target.value })}
              />
            </div>
          </div>
        </SidebarSection>

        {/* Drop Shadow */}
        <SidebarSection
          title="Drop Shadow"
          isOpen={!collapsedSections.dropShadow}
          onToggle={() => toggleSection("dropShadow")}
        >
          <div>
            <PanelLabel>Shadow Color</PanelLabel>
            <PanelColorPicker
              value={data.shadowColor || "#000000"}
              onChange={(e) => onChange({ ...data, shadowColor: e.target.value })}
            />
          </div>

          <PanelSlider
            value={parseInt(data.shadowOpacity || "25")}
            onChange={(value) => onChange({ ...data, shadowOpacity: value.toString() })}
            min={0}
            max={100}
            label="Shadow Opacity"
          />

          <div className="grid grid-cols-3 gap-2">
            <div>
              <PanelLabel>Blur (px)</PanelLabel>
              <PanelInput
                type="number"
                value={data.shadowBlur || "10"}
                onChange={(e) => onChange({ ...data, shadowBlur: e.target.value })}
              />
            </div>
            <div>
              <PanelLabel>Offset X</PanelLabel>
              <PanelInput
                type="number"
                value={data.shadowOffsetX || "0"}
                onChange={(e) => onChange({ ...data, shadowOffsetX: e.target.value })}
              />
            </div>
            <div>
              <PanelLabel>Offset Y</PanelLabel>
              <PanelInput
                type="number"
                value={data.shadowOffsetY || "2"}
                onChange={(e) => onChange({ ...data, shadowOffsetY: e.target.value })}
              />
            </div>
          </div>
        </SidebarSection>

        {/* Layout Options */}
        <SidebarSection
          title="Layout Options"
          isOpen={!collapsedSections.layout}
          onToggle={() => toggleSection("layout")}
        >
          <div>
            <PanelLabel>Gap Between Icons (px)</PanelLabel>
            <PanelInput
              type="number"
              value={data.gap || "12"}
              onChange={(e) => onChange({ ...data, gap: e.target.value })}
            />
          </div>
        </SidebarSection>

        {/* Outer Container Styling */}
        <SidebarSection
          title="Outer Container Styling"
          isOpen={!collapsedSections.outerContainer}
          onToggle={() => toggleSection("outerContainer")}
        >
          <PanelCheckbox
            id="enableOuterContainer"
            checked={data.outerContainer?.enabled || false}
            onCheckedChange={(checked) => onChange({ 
              ...data, 
              outerContainer: { ...(data.outerContainer || {}), enabled: checked }
            })}
            label="Enable Outer Container"
          />

          {data.outerContainer?.enabled && (
            <>
              <div>
                <PanelLabel>Background</PanelLabel>
                <PanelColorPicker
                  value={data.outerContainer.background || "#ffffff"}
                  onChange={(e) => onChange({ 
                    ...data, 
                    outerContainer: { ...(data.outerContainer || {}), background: e.target.value }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PanelLabel>Border Color</PanelLabel>
                  <PanelColorPicker
                    value={data.outerContainer.borderColor || "#e5e7eb"}
                    onChange={(e) => onChange({ 
                      ...data, 
                      outerContainer: { ...(data.outerContainer || {}), borderColor: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <PanelLabel>Border Width (px)</PanelLabel>
                  <PanelSlider
                    value={data.outerContainer.borderWidth || 1}
                    onChange={(value) => onChange({ 
                      ...data, 
                      outerContainer: { ...(data.outerContainer || {}), borderWidth: value }
                    })}
                    min={0}
                    max={20}
                    label=""
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PanelLabel>Border Radius (px)</PanelLabel>
                  <PanelSlider
                    value={data.outerContainer.borderRadius || 8}
                    onChange={(value) => onChange({ 
                      ...data, 
                      outerContainer: { ...(data.outerContainer || {}), borderRadius: value }
                    })}
                    min={0}
                    max={50}
                    label=""
                  />
                </div>
                <div>
                  <PanelLabel>Padding (px)</PanelLabel>
                  <PanelSlider
                    value={data.outerContainer.padding || 16}
                    onChange={(value) => onChange({ 
                      ...data, 
                      outerContainer: { ...(data.outerContainer || {}), padding: value }
                    })}
                    min={0}
                    max={100}
                    label=""
                  />
                </div>
              </div>

              <PanelCheckbox
                id="enableOuterContainerShadow"
                checked={data.outerContainer.shadowEnabled || false}
                onCheckedChange={(checked) => onChange({ 
                  ...data, 
                  outerContainer: { ...(data.outerContainer || {}), shadowEnabled: checked }
                })}
                label="Enable Shadow"
              />

              {data.outerContainer.shadowEnabled && (
                <>
                  <div>
                    <PanelLabel>Shadow Color</PanelLabel>
                    <PanelColorPicker
                      value={data.outerContainer.shadowColor || "#000000"}
                      onChange={(e) => onChange({ 
                        ...data, 
                        outerContainer: { ...(data.outerContainer || {}), shadowColor: e.target.value }
                      })}
                    />
                  </div>

                  <PanelSlider
                    value={data.outerContainer.shadowOpacity || 10}
                    onChange={(value) => onChange({ 
                      ...data, 
                      outerContainer: { ...(data.outerContainer || {}), shadowOpacity: value }
                    })}
                    min={0}
                    max={100}
                    label="Shadow Opacity"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <PanelLabel>Blur (px)</PanelLabel>
                      <PanelSlider
                        value={data.outerContainer.shadowBlur || 10}
                        onChange={(value) => onChange({ 
                          ...data, 
                          outerContainer: { ...(data.outerContainer || {}), shadowBlur: value }
                        })}
                        min={0}
                        max={50}
                        label=""
                      />
                    </div>
                    <div>
                      <PanelLabel>Offset X</PanelLabel>
                      <PanelSlider
                        value={data.outerContainer.shadowOffsetX || 0}
                        onChange={(value) => onChange({ 
                          ...data, 
                          outerContainer: { ...(data.outerContainer || {}), shadowOffsetX: value }
                        })}
                        min={-50}
                        max={50}
                        label=""
                      />
                    </div>
                    <div>
                      <PanelLabel>Offset Y</PanelLabel>
                      <PanelSlider
                        value={data.outerContainer.shadowOffsetY || 4}
                        onChange={(value) => onChange({ 
                          ...data, 
                          outerContainer: { ...(data.outerContainer || {}), shadowOffsetY: value }
                        })}
                        min={-50}
                        max={50}
                        label=""
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </SidebarSection>

        {/* Individual Icon Container Styling */}
        <SidebarSection
          title="Individual Icon Containers"
          isOpen={!collapsedSections.iconContainer}
          onToggle={() => toggleSection("iconContainer")}
        >
          <PanelCheckbox
            id="enableIconContainer"
            checked={data.iconContainer?.enabled || false}
            onCheckedChange={(checked) => onChange({ 
              ...data, 
              iconContainer: { ...(data.iconContainer || {}), enabled: checked }
            })}
            label="Enable Icon Containers"
          />

          {data.iconContainer?.enabled && (
            <>
              <div>
                <PanelLabel>Background</PanelLabel>
                <PanelColorPicker
                  value={data.iconContainer.background || "#ffffff"}
                  onChange={(e) => onChange({ 
                    ...data, 
                    iconContainer: { ...(data.iconContainer || {}), background: e.target.value }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PanelLabel>Border Color</PanelLabel>
                  <PanelColorPicker
                    value={data.iconContainer.borderColor || "#e5e7eb"}
                    onChange={(e) => onChange({ 
                      ...data, 
                      iconContainer: { ...(data.iconContainer || {}), borderColor: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <PanelLabel>Border Width (px)</PanelLabel>
                  <PanelSlider
                    value={data.iconContainer.borderWidth || 1}
                    onChange={(value) => onChange({ 
                      ...data, 
                      iconContainer: { ...(data.iconContainer || {}), borderWidth: value }
                    })}
                    min={0}
                    max={20}
                    label=""
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PanelLabel>Border Radius (px)</PanelLabel>
                  <PanelSlider
                    value={data.iconContainer.borderRadius || 8}
                    onChange={(value) => onChange({ 
                      ...data, 
                      iconContainer: { ...(data.iconContainer || {}), borderRadius: value }
                    })}
                    min={0}
                    max={50}
                    label=""
                  />
                </div>
                <div>
                  <PanelLabel>Padding (px)</PanelLabel>
                  <PanelSlider
                    value={data.iconContainer.padding || 16}
                    onChange={(value) => onChange({ 
                      ...data, 
                      iconContainer: { ...(data.iconContainer || {}), padding: value }
                    })}
                    min={0}
                    max={100}
                    label=""
                  />
                </div>
              </div>

              <PanelCheckbox
                id="enableIconContainerShadow"
                checked={data.iconContainer.shadowEnabled || false}
                onCheckedChange={(checked) => onChange({ 
                  ...data, 
                  iconContainer: { ...(data.iconContainer || {}), shadowEnabled: checked }
                })}
                label="Enable Shadow"
              />

              {data.iconContainer.shadowEnabled && (
                <>
                  <div>
                    <PanelLabel>Shadow Color</PanelLabel>
                    <PanelColorPicker
                      value={data.iconContainer.shadowColor || "#000000"}
                      onChange={(e) => onChange({ 
                        ...data, 
                        iconContainer: { ...(data.iconContainer || {}), shadowColor: e.target.value }
                      })}
                    />
                  </div>

                  <PanelSlider
                    value={data.iconContainer.shadowOpacity || 10}
                    onChange={(value) => onChange({ 
                      ...data, 
                      iconContainer: { ...(data.iconContainer || {}), shadowOpacity: value }
                    })}
                    min={0}
                    max={100}
                    label="Shadow Opacity"
                  />

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <PanelLabel>Blur (px)</PanelLabel>
                      <PanelSlider
                        value={data.iconContainer.shadowBlur || 10}
                        onChange={(value) => onChange({ 
                          ...data, 
                          iconContainer: { ...(data.iconContainer || {}), shadowBlur: value }
                        })}
                        min={0}
                        max={50}
                        label=""
                      />
                    </div>
                    <div>
                      <PanelLabel>Offset X</PanelLabel>
                      <PanelSlider
                        value={data.iconContainer.shadowOffsetX || 0}
                        onChange={(value) => onChange({ 
                          ...data, 
                          iconContainer: { ...(data.iconContainer || {}), shadowOffsetX: value }
                        })}
                        min={-50}
                        max={50}
                        label=""
                      />
                    </div>
                    <div>
                      <PanelLabel>Offset Y</PanelLabel>
                      <PanelSlider
                        value={data.iconContainer.shadowOffsetY || 4}
                        onChange={(value) => onChange({ 
                          ...data, 
                          iconContainer: { ...(data.iconContainer || {}), shadowOffsetY: value }
                        })}
                        min={-50}
                        max={50}
                        label=""
                      />
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </SidebarSection>

        {/* Label Border Styling */}
        <SidebarSection
          title="Label Border"
          isOpen={!collapsedSections.labelBorder}
          onToggle={() => toggleSection("labelBorder")}
        >
          <PanelCheckbox
            id="enableLabelBorder"
            checked={data.labelBorder?.enabled || false}
            onCheckedChange={(checked) => onChange({ 
              ...data, 
              labelBorder: { ...(data.labelBorder || {}), enabled: checked }
            })}
            label="Enable Label Border"
          />

          {data.labelBorder?.enabled && (
            <>
              <div>
                <PanelLabel>Border Color</PanelLabel>
                <PanelColorPicker
                  value={data.labelBorder.color || "#000000"}
                  onChange={(e) => onChange({ 
                    ...data, 
                    labelBorder: { ...(data.labelBorder || {}), color: e.target.value }
                  })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <PanelLabel>Border Width (px)</PanelLabel>
                  <PanelSlider
                    value={data.labelBorder.width || 1}
                    onChange={(value) => onChange({ 
                      ...data, 
                      labelBorder: { ...(data.labelBorder || {}), width: value }
                    })}
                    min={0}
                    max={10}
                    label=""
                  />
                </div>
                <div>
                  <PanelLabel>Border Radius (px)</PanelLabel>
                  <PanelSlider
                    value={data.labelBorder.radius || 4}
                    onChange={(value) => onChange({ 
                      ...data, 
                      labelBorder: { ...(data.labelBorder || {}), radius: value }
                    })}
                    min={0}
                    max={20}
                    label=""
                  />
                </div>
              </div>
            </>
          )}
        </SidebarSection>
      </div>
    </PanelWrapper>
  );
}