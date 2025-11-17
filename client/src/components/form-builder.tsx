import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { BusinessCard, businessCardSchema, PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { fileToBase64, validateImageFile } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { getAvailableIcons, generateFieldId } from "@/lib/card-data";
import { GradientBuilder, type GradientConfig } from "@/components/GradientBuilder";
import { PageBuilder } from "@/modules/form-builder/components/PageBuilder";
import { useQuery } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface FormBuilderProps {
  cardData: BusinessCard;
  onDataChange: (data: BusinessCard) => void;
  onGenerateQR: () => void;
  onNavigationChange?: (pageId: string) => void;
}

// Sortable Item Component
interface SortableItemProps {
  id: string;
  children: React.ReactNode;
}

const SortableItem: React.FC<SortableItemProps> = ({ id, children }) => {
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
    <div ref={setNodeRef} style={style} {...attributes}>
      <div className="relative">
        <div
          {...listeners}
          className="absolute left-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab hover:bg-slate-600 rounded-l"
        >
          <i className="fas fa-grip-vertical text-gray-400 text-sm"></i>
        </div>
        <div className="ml-8">{children}</div>
      </div>
    </div>
  );
};

export const FormBuilder: React.FC<FormBuilderProps> = ({
  cardData,
  onDataChange,
  onGenerateQR,
  onNavigationChange,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch available header templates
  const { data: headerTemplates = [] } = useQuery({
    queryKey: ["/api/admin/header-templates"],
    select: (data: any[]) => data.filter((template) => template.isActive),
    refetchOnWindowFocus: false,
  });

  const [builderMode, setBuilderMode] = useState<"card" | "page" | "theme" | "seo">("card");
  const [selectedPageId, setSelectedPageId] = useState<string>("home");
  const [activeDividerPosition, setActiveDividerPosition] = useState<"top" | "bottom">("top");

  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({
    profile: true,
    contactInfo: true,
    customization: true,
    appearance: false,
    seo: false,
    pages: false, // Pages section expanded by default
    pageBuilder: true,
    // subsections inside Profile
    nameStyling: true,
    titleStyling: true,
    companyStyling: true,
    profileImageStyling: true,
    coverImageStyling: true, // Cover Image Styling collapsed by default
    textGroupPosition: true, // Text Group Position collapsed by default
    // subsections inside Contact Info
    contactIconStyling: true,
    contactHoverColor: true, // Hover Color section collapsed by default
    contactFontStyling: true,
    contactDropShadow: true,
    contactContainerStyling: true,
    // subsections inside Social Media
    socialIconStyling: true,
    socialHoverColor: true, // Hover Color section collapsed by default
    socialFontStyling: true,
    socialDropShadow: true,
    socialContainerStyling: true,
  });

  const form = useForm<BusinessCard>({
    resolver: zodResolver(businessCardSchema),
    defaultValues: cardData,
  });

  // Ensure form values stay in sync with cardData, especially template type
  useEffect(() => {
    form.reset(cardData);
  }, [cardData, form]);

  // Scoped watchers to prevent infinite re-render loops
  const sectionStyles = useWatch({ control: form.control, name: "sectionStyles" });
  const coverImageStyles = useWatch({ control: form.control, name: "coverImageStyles" });
  const profileImageStyles = useWatch({ control: form.control, name: "profileImageStyles" });
  const pages = useWatch({ control: form.control, name: "pages" });
  const brandColor = useWatch({ control: form.control, name: "brandColor" });
  const accentColor = useWatch({ control: form.control, name: "accentColor" });
  const headingColor = useWatch({ control: form.control, name: "headingColor" });
  const paragraphColor = useWatch({ control: form.control, name: "paragraphColor" });
  const backgroundColor = useWatch({ control: form.control, name: "backgroundColor" });
  const backgroundType = useWatch({ control: form.control, name: "backgroundType" });
  const backgroundImage = useWatch({ control: form.control, name: "backgroundImage" });
  const animationType = useWatch({ control: form.control, name: "animationType" });
  const headingFont = useWatch({ control: form.control, name: "headingFont" });
  const headingFontSize = useWatch({ control: form.control, name: "headingFontSize" });
  const headingFontWeight = useWatch({ control: form.control, name: "headingFontWeight" });
  const paragraphFont = useWatch({ control: form.control, name: "paragraphFont" });
  const paragraphFontSize = useWatch({ control: form.control, name: "paragraphFontSize" });
  const paragraphFontWeight = useWatch({ control: form.control, name: "paragraphFontWeight" });
  const noFollow = useWatch({ control: form.control, name: "noFollow" });
  const noIndex = useWatch({ control: form.control, name: "noIndex" });
  const ogImage = useWatch({ control: form.control, name: "ogImage" });
  const secondaryColor = useWatch({ control: form.control, name: "secondaryColor" });
  const tertiaryColor = useWatch({ control: form.control, name: "tertiaryColor" });
  const elementSpacing = useWatch({ control: form.control, name: "elementSpacing" });
  const individualElementSpacing = useWatch({ control: form.control, name: "individualElementSpacing" });

  const toggleSection = (k: string) =>
    setCollapsedSections((p) => ({ ...p, [k]: !p[k] }));

  // Drag end handlers for reordering
  const handleContactDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const contacts = form.getValues("customContacts") || [];
      const oldIndex = contacts.findIndex(
        (contact) => contact.id === active.id,
      );
      const newIndex = contacts.findIndex((contact) => contact.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedContacts = arrayMove(contacts, oldIndex, newIndex);
        form.setValue("customContacts", reorderedContacts);
      }
    }
  };

  const handleSocialDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const socials = form.getValues("customSocials") || [];
      const oldIndex = socials.findIndex((social) => social.id === active.id);
      const newIndex = socials.findIndex((social) => social.id === over?.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSocials = arrayMove(socials, oldIndex, newIndex);
        form.setValue("customSocials", reorderedSocials);
      }
    }
  };

  // sync to parent with memoized callback to prevent infinite loops
  const prevDataRef = useRef<{ snapshot: string; elementSpacing: number | undefined }>({ 
    snapshot: "", 
    elementSpacing: undefined 
  });

  const memoizedOnDataChange = useCallback(onDataChange, []);

  // Helper function to get elements for a specific page
  const getPageElements = useCallback((pageId: string) => {
    const currentPages = (pages as any[]) || [
      {
        id: "home",
        key: "home",
        path: "",
        label: "Home",
        visible: true,
        elements: [],
      },
    ];
    const page = currentPages.find((p: any) => p.id === pageId);
    return page?.elements || [];
  }, [pages]);

  // Watch all form data to ensure re-renders when values change
  const allFormData = useWatch({ control: form.control });

  // Add preview mode info to card data without triggering infinite loops
  const enhancedCardData = useMemo(() => {
    return {
      ...allFormData,
      elementSpacing: elementSpacing ?? 16,
      currentPreviewMode: builderMode,
      currentSelectedPage:
        builderMode === "page" && selectedPageId
          ? {
              id: selectedPageId,
              label:
                ((pages as any[]) || []).find(
                  (p: any) => p.id === selectedPageId,
                )?.label || "Page",
              elements: getPageElements(selectedPageId),
            }
          : null,
    };
  }, [allFormData, elementSpacing, builderMode, selectedPageId, pages, getPageElements]);

  // Helper function to update elements for a specific page
  const updatePageElements = (pageId: string, elements: PageElement[]) => {
    const currentPages = pages || [
      {
        id: "home",
        key: "home",
        path: "",
        label: "Home",
        visible: true,
        elements: [],
      },
    ];

    const updatedPages = currentPages.map((page: any) =>
      page.id === pageId ? { ...page, elements } : page,
    );

    form.setValue("pages" as any, updatedPages);
  };

  useEffect(() => {
    const currentSnapshot = JSON.stringify(enhancedCardData);
    const currentSpacing = elementSpacing ?? 16;
    
    // Always trigger update if elementSpacing changed, or if full snapshot changed
    const spacingChanged = prevDataRef.current.elementSpacing !== currentSpacing;
    const dataChanged = currentSnapshot !== prevDataRef.current.snapshot;
    
    if (spacingChanged || dataChanged) {
      prevDataRef.current = {
        snapshot: currentSnapshot,
        elementSpacing: currentSpacing
      };
      memoizedOnDataChange(enhancedCardData);
    }
  }, [enhancedCardData, elementSpacing, memoizedOnDataChange]);

  // Auto-select first page when switching to page mode or when pages change
  useEffect(() => {
    if (builderMode === "page") {
      const availablePages = (pages as any[]) || [];
      const nonHomePages = availablePages.filter(
        (page: any) => page.key !== "home",
      );

      if (
        nonHomePages.length > 0 &&
        (!selectedPageId || !nonHomePages.find((p) => p.id === selectedPageId))
      ) {
        setSelectedPageId(nonHomePages[0].id);
      }
    }
  }, [builderMode, pages, selectedPageId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "profilePhoto" | "logo" | "backgroundImage" | "ogImage",
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
      form.setValue(field, base64);
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
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

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center text-white">
              <i className="fas fa-edit text-talklink-500 mr-3" />
              {t("form.title")}
            </CardTitle>

            {/* Builder Mode Toggle */}
            <div className="flex items-center bg-slate-700 rounded-lg p-1">
              <Button
                type="button"
                variant={builderMode === "card" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBuilderMode("card")}
                className={`${
                  builderMode === "card"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-600"
                } transition-all duration-200`}
                data-testid="button-card-mode"
              >
                <i className="fas fa-id-card mr-2"></i>
                Card
              </Button>
              <Button
                type="button"
                variant={builderMode === "page" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBuilderMode("page")}
                className={`${
                  builderMode === "page"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-600"
                } transition-all duration-200`}
                data-testid="button-page-mode"
              >
                <i className="fas fa-sitemap mr-2"></i>
                Page
              </Button>
              <Button
                type="button"
                variant={builderMode === "theme" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBuilderMode("theme")}
                className={`${
                  builderMode === "theme"
                    ? "bg-purple-500 hover:bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-600"
                } transition-all duration-200`}
                data-testid="button-theme-mode"
              >
                <i className="fas fa-palette mr-2"></i>
                Theme
              </Button>
              <Button
                type="button"
                variant={builderMode === "seo" ? "default" : "ghost"}
                size="sm"
                onClick={() => setBuilderMode("seo")}
                className={`${
                  builderMode === "seo"
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "text-gray-300 hover:text-white hover:bg-slate-600"
                } transition-all duration-200`}
                data-testid="button-seo-mode"
              >
                <i className="fas fa-search mr-2"></i>
                SEO
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Show different content based on builder mode */}
          {builderMode === "card" && (
            <>
              {/* Profile */}
              <div className="border border-slate-700/50 rounded-lg p-5 space-y-5">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("profile")}
                >
                  <h3 className="text-base font-medium text-slate-200">
                    Profile
                  </h3>
                  <i
                    className={`fas ${collapsedSections.profile ? "fa-chevron-down" : "fa-chevron-up"} text-slate-400 text-sm`}
                  />
                </div>

                {!collapsedSections.profile && (
                  <>
                    <div className="space-y-4">
                      {[
                        {
                          id: "profile-photo-input",
                          label: "Logo or Profile Image",
                          field: "profilePhoto",
                        },
                        {
                          id: "background-input",
                          label: "Cover Image",
                          field: "backgroundImage",
                        },
                      ].map(({ id, label, field }) => (
                        <div key={id} className="space-y-1.5">
                          <Label htmlFor={id} className="text-sm text-slate-300 font-normal">
                            {label}
                          </Label>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0">
                              {form.watch(field as any) ? (
                                <img
                                  src={form.watch(field as any)}
                                  alt={label}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <i className="fas fa-image text-slate-500 text-sm" />
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
                              onClick={() =>
                                document.getElementById(id)?.click()
                              }
                              disabled={isUploading}
                            >
                              <i className="fas fa-cloud-upload-alt mr-2 text-slate-400" />
                              Upload
                            </Button>
                            <input
                              id={id}
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                handleFileUpload(e, field as any)
                              }
                              className="hidden"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Profile Image Styling */}
                    <div className="border border-blue-700/30 rounded-lg p-3 space-y-3 mt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("profileImageStyling")}
                      >
                        <h4 className="text-sm font-medium text-blue-200 flex items-center gap-2">
                          <i className="fas fa-palette text-blue-300"></i>
                          Profile Image Styling
                        </h4>
                        <i
                          className={`fas ${
                            collapsedSections.profileImageStyling
                              ? "fa-chevron-down"
                              : "fa-chevron-up"
                          } text-blue-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.profileImageStyling && (
                        <>
                          {/* Visibility Toggle */}
                          <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                            <Label className="text-sm text-slate-300">Show Profile Image</Label>
                            <input
                              type="checkbox"
                              checked={profileImageStyles?.visible !== false}
                              onChange={(e) =>
                                form.setValue("profileImageStyles.visible", e.target.checked)
                              }
                              className="w-4 h-4 rounded border-slate-600"
                            />
                          </div>

                          {/* Size Slider */}
                          <div>
                            <Label className="text-xs text-slate-400">
                              Size: {profileImageStyles?.size || 120}px
                            </Label>
                            <input
                              type="range"
                              min={60}
                              max={200}
                              value={profileImageStyles?.size || 120}
                              onChange={(e) =>
                                form.setValue(
                                  "profileImageStyles.size",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                            />
                          </div>

                          {/* Shape Selection */}
                          <div>
                            <Label className="text-xs text-slate-400 mb-2 block">Shape</Label>
                            <div className="grid grid-cols-3 gap-2">
                              {["circle", "square", "rounded"].map((shape) => (
                                <button
                                  key={shape}
                                  type="button"
                                  onClick={() =>
                                    form.setValue("profileImageStyles.shape", shape)
                                  }
                                  className={`px-3 py-2 rounded text-xs capitalize transition-colors ${
                                    (profileImageStyles?.shape || "circle") ===
                                    shape
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                  }`}
                                >
                                  {shape}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Border Width */}
                          <div>
                            <Label className="text-xs text-slate-400">
                              Border Width: {profileImageStyles?.borderWidth !== undefined ? profileImageStyles?.borderWidth : 3}px
                            </Label>
                            <input
                              type="range"
                              min={0}
                              max={10}
                              value={profileImageStyles?.borderWidth !== undefined ? profileImageStyles?.borderWidth : 3}
                              onChange={(e) =>
                                form.setValue(
                                  "profileImageStyles.borderWidth",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                            />
                          </div>

                          {/* Border Color - Show when border width > 0 and no animation */}
                          {(profileImageStyles?.borderWidth !== undefined ? profileImageStyles?.borderWidth : 3) > 0 && 
                           (!profileImageStyles?.animation || profileImageStyles?.animation === "none") && (
                            <div>
                              <Label className="text-xs text-slate-400 mb-2 block">
                                Border Color
                              </Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="color"
                                  value={profileImageStyles?.borderColor || form.watch("brandColor") || "#22c55e"}
                                  onChange={(e) =>
                                    form.setValue(
                                      "profileImageStyles.borderColor",
                                      e.target.value
                                    )
                                  }
                                  className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                />
                                <span className="text-xs text-slate-400">
                                  {profileImageStyles?.borderColor || form.watch("brandColor") || "#22c55e"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Default: Brand Color
                              </p>
                            </div>
                          )}

                          {/* Border Animation */}
                          <div>
                            <Label className="text-xs text-slate-400 mb-2 block">
                              Border Animation
                            </Label>
                            <select
                              value={profileImageStyles?.animation || "none"}
                              onChange={(e) =>
                                form.setValue("profileImageStyles.animation", e.target.value)
                              }
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
                            >
                              <option value="none">None</option>
                              <option value="instagram">Instagram Gradient Spin</option>
                              <option value="neon">Neon Glow Pulse</option>
                              <option value="wave">Color Wave</option>
                              <option value="shimmer">Shimmer Effect</option>
                              <option value="gradient-slide">Gradient Slide</option>
                            </select>
                          </div>

                          {/* Animation Color Controls - Only show when animation is selected */}
                          {(profileImageStyles?.animation && 
                            profileImageStyles?.animation !== "none") && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <Label className="text-xs text-slate-300">Use Brand Color</Label>
                                <input
                                  type="checkbox"
                                  checked={profileImageStyles?.useBrandColor !== false}
                                  onChange={(e) =>
                                    form.setValue("profileImageStyles.useBrandColor", e.target.checked)
                                  }
                                  className="w-4 h-4 rounded border-slate-600"
                                />
                              </div>

                              {/* Gradient Builder for gradient animations */}
                              {["instagram", "wave", "gradient-slide", "shimmer"].includes(profileImageStyles?.animation) && (
                                <GradientBuilder
                                  value={{
                                    type: profileImageStyles?.animationGradient?.type || 'linear',
                                    angle: profileImageStyles?.animationGradient?.angle || 90,
                                    stops: profileImageStyles?.animationGradient?.stops || [
                                      { color: form.watch("brandColor") || "#4ecdc4", stop: 0 },
                                      { color: form.watch("accentColor") || "#f093fb", stop: 100 }
                                    ]
                                  }}
                                  onChange={(gradient: GradientConfig) => {
                                    form.setValue("profileImageStyles.animationGradient", gradient);
                                  }}
                                  useBrandColors={profileImageStyles?.useBrandColor !== false}
                                  brandColor={form.watch("brandColor")}
                                  accentColor={form.watch("accentColor")}
                                />
                              )}

                              {/* Single color picker for non-gradient animations (neon) */}
                              {profileImageStyles?.animation === "neon" && 
                               profileImageStyles?.useBrandColor === false && (
                                <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <Label className="text-xs text-slate-400 mb-2 block">
                                    Glow Color
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="color"
                                      value={profileImageStyles?.animationColors?.primary || form.watch("brandColor") || "#4ecdc4"}
                                      onChange={(e) => {
                                        const currentColors = profileImageStyles?.animationColors || {};
                                        form.setValue("profileImageStyles.animationColors", {
                                          ...currentColors,
                                          primary: e.target.value
                                        });
                                      }}
                                      className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                    />
                                    <Input
                                      type="text"
                                      value={(profileImageStyles?.animationColors?.primary || form.watch("brandColor") || "#4ecdc4").replace('#', '')}
                                      onChange={(e) => {
                                        const hex = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                                        if (hex.length === 6) {
                                          const currentColors = profileImageStyles?.animationColors || {};
                                          form.setValue("profileImageStyles.animationColors", {
                                            ...currentColors,
                                            primary: `#${hex}`
                                          });
                                        }
                                      }}
                                      className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs font-mono uppercase"
                                      maxLength={6}
                                      placeholder="4ECDC4"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Shadow Effect */}
                          <div>
                            <Label className="text-xs text-slate-400">
                              Shadow: {profileImageStyles?.shadow || 0}px
                            </Label>
                            <input
                              type="range"
                              min={0}
                              max={30}
                              value={profileImageStyles?.shadow || 0}
                              onChange={(e) =>
                                form.setValue(
                                  "profileImageStyles.shadow",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                            />
                          </div>

                          {/* Opacity */}
                          <div>
                            <Label className="text-xs text-slate-400">
                              Opacity: {((profileImageStyles?.opacity || 100) / 100).toFixed(2)}
                            </Label>
                            <input
                              type="range"
                              min={0}
                              max={100}
                              value={profileImageStyles?.opacity || 100}
                              onChange={(e) =>
                                form.setValue(
                                  "profileImageStyles.opacity",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                            />
                          </div>

                          {/* Position Controls */}
                          <div className="space-y-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                            <Label className="text-xs text-slate-300 font-medium">Image Position</Label>
                            
                            {/* Horizontal Position */}
                            <div>
                              <Label className="text-xs text-slate-400">
                                Horizontal: {coverImageStyles?.profilePositionX ?? 50}%
                                <span className="text-slate-500 ml-1">
                                  ({(coverImageStyles?.profilePositionX ?? 50) < 40 ? 'Left' : (coverImageStyles?.profilePositionX ?? 50) > 60 ? 'Right' : 'Center'})
                                </span>
                              </Label>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                value={coverImageStyles?.profilePositionX ?? 50}
                                onChange={(e) =>
                                  form.setValue(
                                    "coverImageStyles.profilePositionX",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                              />
                            </div>

                            {/* Vertical Position */}
                            <div>
                              <Label className="text-xs text-slate-400">
                                Vertical: {coverImageStyles?.profilePositionY ?? 100}%
                                <span className="text-slate-500 ml-1">
                                  ({(coverImageStyles?.profilePositionY ?? 100) < 50 ? 'Top' : (coverImageStyles?.profilePositionY ?? 100) > 70 ? 'Bottom' : 'Middle'})
                                </span>
                              </Label>
                              <input
                                type="range"
                                min={0}
                                max={120}
                                value={coverImageStyles?.profilePositionY ?? 100}
                                onChange={(e) =>
                                  form.setValue(
                                    "coverImageStyles.profilePositionY",
                                    parseInt(e.target.value)
                                  )
                                }
                                className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Cover Image Styling */}
                    <div className="border border-purple-700/30 rounded-lg p-3 space-y-3 mt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("coverImageStyling")}
                      >
                        <h4 className="text-sm font-medium text-purple-200 flex items-center gap-2">
                          <i className="fas fa-image text-purple-300"></i>
                          Cover Image Styling
                        </h4>
                        <i
                          className={`fas ${
                            collapsedSections.coverImageStyling
                              ? "fa-chevron-down"
                              : "fa-chevron-up"
                          } text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.coverImageStyling && (
                        <>
                          {/* Cover Height Slider */}
                          <div>
                            <Label className="text-xs text-slate-400">
                              Height: {coverImageStyles?.height || 200}px
                            </Label>
                            <input
                              type="range"
                              min={100}
                              max={400}
                              value={coverImageStyles?.height || 200}
                              onChange={(e) =>
                                form.setValue(
                                  "coverImageStyles.height",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                            />
                          </div>

                          {/* Border Width */}
                          <div>
                            <Label className="text-xs text-slate-400">
                              Border Width: {coverImageStyles?.borderWidth || 0}px
                            </Label>
                            <input
                              type="range"
                              min={0}
                              max={20}
                              value={coverImageStyles?.borderWidth || 0}
                              onChange={(e) =>
                                form.setValue(
                                  "coverImageStyles.borderWidth",
                                  parseInt(e.target.value)
                                )
                              }
                              className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                            />
                          </div>

                          {/* Border Color - only shown when border width > 0 */}
                          {(coverImageStyles?.borderWidth || 0) > 0 && (
                            <div className="space-y-2 p-3 bg-slate-800/30 rounded-lg border border-slate-700">
                              <Label className="text-xs text-slate-300 font-medium">Border Color</Label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="color"
                                  value={coverImageStyles?.borderColor || form.watch("brandColor") || "#22c55e"}
                                  onChange={(e) =>
                                    form.setValue("coverImageStyles.borderColor", e.target.value)
                                  }
                                  className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                />
                                <span className="text-xs text-slate-400 font-mono">
                                  {coverImageStyles?.borderColor || form.watch("brandColor") || "#22c55e"}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-1">
                                Default: Brand Color
                              </p>
                            </div>
                          )}

                          {/* Border Animation */}
                          <div>
                            <Label className="text-xs text-slate-400 mb-2 block">
                              Border Animation
                            </Label>
                            <select
                              value={coverImageStyles?.animation || "none"}
                              onChange={(e) =>
                                form.setValue("coverImageStyles.animation", e.target.value)
                              }
                              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white text-sm"
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
                          {(coverImageStyles?.animation && 
                            coverImageStyles?.animation !== "none") && (
                            <div className="space-y-4">
                              <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                <Label className="text-xs text-slate-300">Use Brand Color</Label>
                                <input
                                  type="checkbox"
                                  checked={coverImageStyles?.useBrandColor !== false}
                                  onChange={(e) =>
                                    form.setValue("coverImageStyles.useBrandColor", e.target.checked)
                                  }
                                  className="w-4 h-4 rounded border-slate-600"
                                />
                              </div>

                              {/* Gradient Builder for gradient animations */}
                              {["instagram", "wave", "gradient-slide", "shimmer"].includes(coverImageStyles?.animation) && (
                                <GradientBuilder
                                  value={{
                                    type: coverImageStyles?.animationGradient?.type || 'linear',
                                    angle: coverImageStyles?.animationGradient?.angle || 90,
                                    stops: coverImageStyles?.animationGradient?.stops || [
                                      { color: form.watch("brandColor") || "#4ecdc4", stop: 0 },
                                      { color: form.watch("accentColor") || "#f093fb", stop: 100 }
                                    ]
                                  }}
                                  onChange={(gradient: GradientConfig) => {
                                    form.setValue("coverImageStyles.animationGradient", gradient);
                                  }}
                                  useBrandColors={coverImageStyles?.useBrandColor !== false}
                                  brandColor={form.watch("brandColor")}
                                  accentColor={form.watch("accentColor")}
                                />
                              )}

                              {/* Single color picker for neon */}
                              {coverImageStyles?.animation === "neon" && 
                               coverImageStyles?.useBrandColor === false && (
                                <div className="space-y-2 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <Label className="text-xs text-slate-400 mb-2 block">
                                    Glow Color
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="color"
                                      value={coverImageStyles?.animationColors?.primary || form.watch("brandColor") || "#4ecdc4"}
                                      onChange={(e) => {
                                        const currentColors = coverImageStyles?.animationColors || {};
                                        form.setValue("coverImageStyles.animationColors", {
                                          ...currentColors,
                                          primary: e.target.value
                                        });
                                      }}
                                      className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                    />
                                    <Input
                                      type="text"
                                      value={(coverImageStyles?.animationColors?.primary || form.watch("brandColor") || "#4ecdc4").replace('#', '')}
                                      onChange={(e) => {
                                        const hex = e.target.value.replace(/[^0-9A-Fa-f]/g, '').slice(0, 6);
                                        if (hex.length === 6) {
                                          const currentColors = coverImageStyles?.animationColors || {};
                                          form.setValue("coverImageStyles.animationColors", {
                                            ...currentColors,
                                            primary: `#${hex}`
                                          });
                                        }
                                      }}
                                      className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs font-mono uppercase"
                                      maxLength={6}
                                      placeholder="4ECDC4"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Shape Divider with Top/Bottom Toggle */}
                          <TooltipProvider>
                            <div className="space-y-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700 mt-4">
                              {/* Header with Title */}
                              <Label className="text-xs text-slate-300 font-medium">Shape Divider</Label>
                              
                              {/* Top/Bottom Toggle */}
                              <div className="flex gap-1 p-1 bg-slate-900/50 rounded-lg border border-orange-500/30">
                                <button
                                  type="button"
                                  onClick={() => setActiveDividerPosition("top")}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-all ${
                                    activeDividerPosition === "top"
                                      ? "bg-orange-500 text-white shadow-md"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  Top
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveDividerPosition("bottom")}
                                  className={`flex-1 px-3 py-2 text-xs font-medium rounded transition-all ${
                                    activeDividerPosition === "bottom"
                                      ? "bg-orange-500 text-white shadow-md"
                                      : "text-slate-400 hover:text-slate-200"
                                  }`}
                                >
                                  Bottom
                                </button>
                              </div>

                              {/* Top Shape Divider Controls */}
                              {activeDividerPosition === "top" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs text-slate-400">Enable</Label>
                                <input
                                  type="checkbox"
                                  checked={coverImageStyles?.shapeDividerTop?.enabled || false}
                                  onChange={(e) =>
                                    form.setValue("coverImageStyles.shapeDividerTop.enabled", e.target.checked)
                                  }
                                  className="w-4 h-4 rounded border-slate-600"
                                />
                              </div>

                              {coverImageStyles?.shapeDividerTop?.enabled && (
                                <>
                                  {/* Shape Selection Grid with SVG Previews */}
                                  <div>
                                    <Label className="text-xs text-slate-400 mb-2 block">Shape Type</Label>
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900/50 rounded">
                                      {["wave", "waves-brush", "clouds", "zigzag", "triangle", "triangle-asymmetrical", "tilt", "tilt-opacity", "fan-opacity", "curve", "curve-asymmetrical", "drop", "mountain", "opacity-fan-alt", "book"].map((shape) => {
                                        const isSelected = (coverImageStyles?.shapeDividerTop?.preset || "wave") === shape;
                                        const shapeName = shape.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        
                                        return (
                                          <Tooltip key={shape}>
                                            <TooltipTrigger asChild>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  form.setValue("coverImageStyles.shapeDividerTop.preset", shape)
                                                }
                                                className={`relative h-10 rounded overflow-hidden transition-all border-2 ${
                                                  isSelected
                                                    ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500"
                                                    : "bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                                                }`}
                                              >
                                                {/* Simple SVG preview */}
                                                <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
                                                  <svg
                                                    viewBox="0 0 100 20"
                                                    className="w-full h-8"
                                                    preserveAspectRatio="none"
                                                    style={{ transform: 'translateY(2px)' }}
                                                  >
                                                    {shape === "wave" && (
                                                      <path d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "waves-brush" && (
                                                      <path d="M0,8 Q15,2 30,8 T60,8 Q75,2 90,8 L100,8 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "clouds" && (
                                                      <path d="M0,12 Q10,8 20,12 Q30,8 40,12 Q50,8 60,12 Q70,8 80,12 Q90,8 100,12 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "zigzag" && (
                                                      <path d="M0,15 L10,5 L20,15 L30,5 L40,15 L50,5 L60,15 L70,5 L80,15 L90,5 L100,15 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "triangle" && (
                                                      <path d="M0,20 L50,0 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "triangle-negative" && (
                                                      <path d="M0,0 L50,20 L100,0 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "triangle-asymmetrical" && (
                                                      <path d="M0,20 L70,0 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "tilt" && (
                                                      <path d="M0,5 L100,15 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "curve" && (
                                                      <path d="M0,20 Q50,0 100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "curve-asymmetrical" && (
                                                      <path d="M0,20 Q30,0 100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "drop" && (
                                                      <path d="M0,10 C20,10 30,0 50,0 C70,0 80,10 100,10 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "mountain" && (
                                                      <path d="M0,20 L25,5 L50,12 L75,3 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "book" && (
                                                      <path d="M0,10 Q25,15 50,10 Q75,5 100,10 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "tilt-opacity" && (
                                                      <>
                                                        <path d="M0,3 L100,12 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.5" />
                                                        <path d="M0,8 L100,16 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.7" />
                                                      </>
                                                    )}
                                                    {shape === "fan-opacity" && (
                                                      <>
                                                        <path d="M0,20 L25,5 L50,10 L75,3 L100,8 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.3" />
                                                        <path d="M0,20 L30,10 L60,14 L90,7 L100,12 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.5" />
                                                        <path d="M0,20 L35,15 L70,17 L100,15 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.7" />
                                                      </>
                                                    )}
                                                    {shape === "opacity-fan-alt" && (
                                                      <>
                                                        <path d="M0,15 C20,15 20,5 50,5 C80,5 80,15 100,15 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.4" />
                                                        <path d="M0,17 C30,17 30,10 50,10 C70,10 70,17 100,17 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.6" />
                                                      </>
                                                    )}
                                                  </svg>
                                                </div>
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-xs">{shapeName}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Color Picker */}
                                  <div>
                                    <Label className="text-xs text-slate-400 mb-2 block">Color</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="color"
                                        value={coverImageStyles?.shapeDividerTop?.color || form.watch("brandColor") || "#ffffff"}
                                        onChange={(e) =>
                                          form.setValue("coverImageStyles.shapeDividerTop.color", e.target.value)
                                        }
                                        className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                      />
                                      <span className="text-xs text-slate-400">
                                        {coverImageStyles?.shapeDividerTop?.color || form.watch("brandColor") || "#ffffff"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Width Slider (%) */}
                                  <div>
                                    <Label className="text-xs text-slate-400">
                                      Width: {coverImageStyles?.shapeDividerTop?.width || 100}%
                                    </Label>
                                    <input
                                      type="range"
                                      min={100}
                                      max={300}
                                      value={coverImageStyles?.shapeDividerTop?.width || 100}
                                      onChange={(e) =>
                                        form.setValue(
                                          "coverImageStyles.shapeDividerTop.width",
                                          parseInt(e.target.value)
                                        )
                                      }
                                      className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                                    />
                                  </div>

                                  {/* Height Slider (px) */}
                                  <div>
                                    <Label className="text-xs text-slate-400">
                                      Height: {coverImageStyles?.shapeDividerTop?.height || 60}px
                                    </Label>
                                    <input
                                      type="range"
                                      min={20}
                                      max={200}
                                      value={coverImageStyles?.shapeDividerTop?.height || 60}
                                      onChange={(e) =>
                                        form.setValue(
                                          "coverImageStyles.shapeDividerTop.height",
                                          parseInt(e.target.value)
                                        )
                                      }
                                      className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                                    />
                                  </div>

                                  {/* Invert Toggle */}
                                  <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                                    <Label className="text-xs text-slate-300">Invert</Label>
                                    <input
                                      type="checkbox"
                                      checked={coverImageStyles?.shapeDividerTop?.invert || false}
                                      onChange={(e) =>
                                        form.setValue("coverImageStyles.shapeDividerTop.invert", e.target.checked)
                                      }
                                      className="w-4 h-4 rounded border-slate-600"
                                    />
                                  </div>

                                  {/* Bring to Front Toggle */}
                                  <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                                    <Label className="text-xs text-slate-300">Bring to Front</Label>
                                    <input
                                      type="checkbox"
                                      checked={coverImageStyles?.shapeDividerTop?.bringToFront || false}
                                      onChange={(e) =>
                                        form.setValue("coverImageStyles.shapeDividerTop.bringToFront", e.target.checked)
                                      }
                                      className="w-4 h-4 rounded border-slate-600"
                                    />
                                  </div>
                                </>
                              )}
                                </div>
                              )}

                              {/* Bottom Shape Divider Controls */}
                              {activeDividerPosition === "bottom" && (
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-xs text-slate-400">Enable</Label>
                                    <input
                                  type="checkbox"
                                  checked={coverImageStyles?.shapeDividerBottom?.enabled || false}
                                  onChange={(e) =>
                                    form.setValue("coverImageStyles.shapeDividerBottom.enabled", e.target.checked)
                                  }
                                  className="w-4 h-4 rounded border-slate-600"
                                />
                              </div>

                              {coverImageStyles?.shapeDividerBottom?.enabled && (
                                <>
                                  {/* Shape Selection Grid with SVG Previews */}
                                  <div>
                                    <Label className="text-xs text-slate-400 mb-2 block">Shape Type</Label>
                                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-900/50 rounded">
                                      {["wave", "waves-brush", "clouds", "zigzag", "triangle", "triangle-asymmetrical", "tilt", "tilt-opacity", "fan-opacity", "curve", "curve-asymmetrical", "drop", "mountain", "opacity-fan-alt", "book"].map((shape) => {
                                        const isSelected = (coverImageStyles?.shapeDividerBottom?.preset || "wave") === shape;
                                        const shapeName = shape.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                        
                                        return (
                                          <Tooltip key={shape}>
                                            <TooltipTrigger asChild>
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  form.setValue("coverImageStyles.shapeDividerBottom.preset", shape)
                                                }
                                                className={`relative h-10 rounded overflow-hidden transition-all border-2 ${
                                                  isSelected
                                                    ? "bg-purple-600/20 border-purple-500 ring-2 ring-purple-500"
                                                    : "bg-slate-700 border-slate-600 hover:bg-slate-600 hover:border-slate-500"
                                                }`}
                                              >
                                                {/* Simple SVG preview */}
                                                <div className="absolute inset-0 flex items-end justify-center overflow-hidden">
                                                  <svg
                                                    viewBox="0 0 100 20"
                                                    className="w-full h-8"
                                                    preserveAspectRatio="none"
                                                    style={{ transform: 'translateY(2px)' }}
                                                  >
                                                    {shape === "wave" && (
                                                      <path d="M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "waves-brush" && (
                                                      <path d="M0,8 Q15,2 30,8 T60,8 Q75,2 90,8 L100,8 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "clouds" && (
                                                      <path d="M0,12 Q10,8 20,12 Q30,8 40,12 Q50,8 60,12 Q70,8 80,12 Q90,8 100,12 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "zigzag" && (
                                                      <path d="M0,15 L10,5 L20,15 L30,5 L40,15 L50,5 L60,15 L70,5 L80,15 L90,5 L100,15 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "triangle" && (
                                                      <path d="M0,20 L50,0 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "triangle-negative" && (
                                                      <path d="M0,0 L50,20 L100,0 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "triangle-asymmetrical" && (
                                                      <path d="M0,20 L70,0 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "tilt" && (
                                                      <path d="M0,5 L100,15 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "curve" && (
                                                      <path d="M0,20 Q50,0 100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "curve-asymmetrical" && (
                                                      <path d="M0,20 Q30,0 100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "drop" && (
                                                      <path d="M0,10 C20,10 30,0 50,0 C70,0 80,10 100,10 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "mountain" && (
                                                      <path d="M0,20 L25,5 L50,12 L75,3 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "book" && (
                                                      <path d="M0,10 Q25,15 50,10 Q75,5 100,10 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} />
                                                    )}
                                                    {shape === "tilt-opacity" && (
                                                      <>
                                                        <path d="M0,3 L100,12 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.5" />
                                                        <path d="M0,8 L100,16 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.7" />
                                                      </>
                                                    )}
                                                    {shape === "fan-opacity" && (
                                                      <>
                                                        <path d="M0,20 L25,5 L50,10 L75,3 L100,8 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.3" />
                                                        <path d="M0,20 L30,10 L60,14 L90,7 L100,12 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.5" />
                                                        <path d="M0,20 L35,15 L70,17 L100,15 L100,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.7" />
                                                      </>
                                                    )}
                                                    {shape === "opacity-fan-alt" && (
                                                      <>
                                                        <path d="M0,15 C20,15 20,5 50,5 C80,5 80,15 100,15 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.4" />
                                                        <path d="M0,17 C30,17 30,10 50,10 C70,10 70,17 100,17 L100,20 L0,20 Z" fill={isSelected ? "#a855f7" : "#94a3b8"} opacity="0.6" />
                                                      </>
                                                    )}
                                                  </svg>
                                                </div>
                                              </button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="text-xs">{shapeName}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        );
                                      })}
                                    </div>
                                  </div>

                                  {/* Color Picker */}
                                  <div>
                                    <Label className="text-xs text-slate-400 mb-2 block">Color</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="color"
                                        value={coverImageStyles?.shapeDividerBottom?.color || form.watch("brandColor") || "#ffffff"}
                                        onChange={(e) =>
                                          form.setValue("coverImageStyles.shapeDividerBottom.color", e.target.value)
                                        }
                                        className="w-12 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                      />
                                      <span className="text-xs text-slate-400">
                                        {coverImageStyles?.shapeDividerBottom?.color || form.watch("brandColor") || "#ffffff"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Width Slider (%) */}
                                  <div>
                                    <Label className="text-xs text-slate-400">
                                      Width: {coverImageStyles?.shapeDividerBottom?.width || 100}%
                                    </Label>
                                    <input
                                      type="range"
                                      min={100}
                                      max={300}
                                      value={coverImageStyles?.shapeDividerBottom?.width || 100}
                                      onChange={(e) =>
                                        form.setValue(
                                          "coverImageStyles.shapeDividerBottom.width",
                                          parseInt(e.target.value)
                                        )
                                      }
                                      className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                                    />
                                  </div>

                                  {/* Height Slider (px) */}
                                  <div>
                                    <Label className="text-xs text-slate-400">
                                      Height: {coverImageStyles?.shapeDividerBottom?.height || 60}px
                                    </Label>
                                    <input
                                      type="range"
                                      min={20}
                                      max={200}
                                      value={coverImageStyles?.shapeDividerBottom?.height || 60}
                                      onChange={(e) =>
                                        form.setValue(
                                          "coverImageStyles.shapeDividerBottom.height",
                                          parseInt(e.target.value)
                                        )
                                      }
                                      className="w-full h-1 bg-slate-600 rounded-lg appearance-none slider"
                                    />
                                  </div>

                                  {/* Invert Toggle */}
                                  <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                                    <Label className="text-xs text-slate-300">Invert</Label>
                                    <input
                                      type="checkbox"
                                      checked={coverImageStyles?.shapeDividerBottom?.invert || false}
                                      onChange={(e) =>
                                        form.setValue("coverImageStyles.shapeDividerBottom.invert", e.target.checked)
                                      }
                                      className="w-4 h-4 rounded border-slate-600"
                                    />
                                  </div>

                                  {/* Bring to Front Toggle */}
                                  <div className="flex items-center justify-between p-2 bg-slate-800/30 rounded">
                                    <Label className="text-xs text-slate-300">Bring to Front</Label>
                                    <input
                                      type="checkbox"
                                      checked={coverImageStyles?.shapeDividerBottom?.bringToFront || false}
                                      onChange={(e) =>
                                        form.setValue("coverImageStyles.shapeDividerBottom.bringToFront", e.target.checked)
                                      }
                                      className="w-4 h-4 rounded border-slate-600"
                                    />
                                  </div>
                                </>
                              )}
                                </div>
                              )}
                            </div>
                          </TooltipProvider>
                        </>
                      )}
                    </div>

                    {/* Basic Information fields */}
                    <div className="space-y-4 pt-5 border-t border-slate-700/50">
                      <div>
                        <Label htmlFor="fullName" className="text-white">
                          {t("field.fullName")} *
                        </Label>
                        <Input
                          id="fullName"
                          {...form.register("fullName")}
                          placeholder="John Doe"
                          className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                          data-testid="input-full-name"
                        />
                        {form.formState.errors.fullName && (
                          <p className="text-red-400 text-sm mt-1">
                            {form.formState.errors.fullName.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="title" className="text-white">
                          {t("field.title")} *
                        </Label>
                        <Input
                          id="title"
                          {...form.register("title")}
                          placeholder="Senior Developer"
                          className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                          data-testid="input-title"
                        />
                        {form.formState.errors.title && (
                          <p className="text-red-400 text-sm mt-1">
                            {form.formState.errors.title.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="company" className="text-white">
                          {t("field.company")}
                        </Label>
                        <Input
                          id="company"
                          {...form.register("company")}
                          placeholder="Tech Corp"
                          className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                          data-testid="input-company"
                        />
                      </div>
                    </div>

                    {/* Name Styling (NEW, appears above Title Styling) */}
                    <div className="border border-slate-700/30 rounded-lg p-3 space-y-3 mt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("nameStyling")}
                      >
                        <h5 className="text-xs font-normal text-slate-300">
                          Name Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.nameStyling ? "down" : "up"} text-slate-400 text-xs`}
                        />
                      </div>

                      {!collapsedSections.nameStyling && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.basicInfo
                                      ?.nameColor || "#ffffff"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.basicInfo.nameColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                />
                                <Input
                                  value={
                                    sectionStyles?.basicInfo
                                      ?.nameColor || "#ffffff"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.basicInfo.nameColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#ffffff"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">Font</Label>
                              <Select
                                value={
                                  sectionStyles?.basicInfo
                                    ?.nameFont || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.nameFont",
                                    v,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Choose font" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Inter",
                                    "Roboto",
                                    "Open Sans",
                                    "Lato",
                                    "Montserrat",
                                    "Poppins",
                                    "Source Sans Pro",
                                    "Nunito",
                                    "Raleway",
                                    "Ubuntu",
                                    "PT Sans",
                                    "Merriweather",
                                    "Playfair Display",
                                    "Oswald",
                                    "Libre Baskerville",
                                    "Crimson Text",
                                    "Work Sans",
                                    "Fira Sans",
                                    "DM Sans",
                                    "Space Grotesk",
                                  ].map((f) => (
                                    <SelectItem key={f} value={f}>
                                      {f}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Size:{" "}
                                {sectionStyles?.basicInfo
                                  ?.nameFontSize || 24}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.basicInfo
                                    ?.nameFontSize || 24
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.nameFontSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={12}
                                max={48}
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Weight
                              </Label>
                              <Select
                                value={
                                  sectionStyles?.basicInfo
                                    ?.nameFontWeight || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.nameFontWeight",
                                    v as any,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Weight" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    ["300", "Light"],
                                    ["400", "Regular"],
                                    ["500", "Medium"],
                                    ["600", "Semi Bold"],
                                    ["700", "Bold"],
                                    ["800", "Extra Bold"],
                                  ].map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="nameItalic"
                              checked={
                                sectionStyles?.basicInfo
                                  ?.nameTextStyle === "italic"
                              }
                              onCheckedChange={(c) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.nameTextStyle",
                                  c ? "italic" : "normal",
                                )
                              }
                            />
                            <Label
                              htmlFor="nameItalic"
                              className="text-white text-xs"
                            >
                              Italic
                            </Label>
                          </div>

                          {/* Spacing Control */}
                          <div>
                            <Label className="text-white text-xs">
                              Spacing (Bottom): {sectionStyles?.basicInfo?.nameSpacing ?? 8}px
                            </Label>
                            <input
                              type="range"
                              value={sectionStyles?.basicInfo?.nameSpacing ?? 8}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.nameSpacing",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={0}
                              max={50}
                            />
                          </div>

                          {/* Horizontal Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Horizontal Position: {form.watch("sectionStyles.basicInfo.namePositionX") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.namePositionX") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.namePositionX",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>

                          {/* Vertical Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Vertical Position: {form.watch("sectionStyles.basicInfo.namePositionY") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.namePositionY") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.namePositionY",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Title Styling */}
                    <div className="border border-slate-700/30 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("titleStyling")}
                      >
                        <h5 className="text-xs font-normal text-slate-300">
                          Title Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.titleStyling ? "down" : "up"} text-slate-400 text-xs`}
                        />
                      </div>

                      {!collapsedSections.titleStyling && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.basicInfo
                                      ?.titleColor || "#4b5563"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.basicInfo.titleColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                />
                                <Input
                                  value={
                                    sectionStyles?.basicInfo
                                      ?.titleColor || ""
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.basicInfo.titleColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#4b5563"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">Font</Label>
                              <Select
                                value={
                                  sectionStyles?.basicInfo
                                    ?.titleFont || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.titleFont",
                                    v,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Choose font" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Inter",
                                    "Roboto",
                                    "Open Sans",
                                    "Lato",
                                    "Montserrat",
                                    "Poppins",
                                    "Source Sans Pro",
                                    "Nunito",
                                    "Raleway",
                                    "Ubuntu",
                                    "PT Sans",
                                    "Merriweather",
                                    "Playfair Display",
                                    "Oswald",
                                    "Libre Baskerville",
                                    "Crimson Text",
                                    "Work Sans",
                                    "Fira Sans",
                                    "DM Sans",
                                    "Space Grotesk",
                                  ].map((f) => (
                                    <SelectItem key={f} value={f}>
                                      {f}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Size:{" "}
                                {sectionStyles?.basicInfo
                                  ?.titleFontSize || 14}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.basicInfo
                                    ?.titleFontSize || 14
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.titleFontSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={10}
                                max={32}
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Weight
                              </Label>
                              <Select
                                value={
                                  sectionStyles?.basicInfo
                                    ?.titleFontWeight || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.titleFontWeight",
                                    v as any,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Weight" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    ["300", "Light"],
                                    ["400", "Regular"],
                                    ["500", "Medium"],
                                    ["600", "Semi Bold"],
                                    ["700", "Bold"],
                                    ["800", "Extra Bold"],
                                  ].map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="titleItalic"
                              checked={
                                sectionStyles?.basicInfo
                                  ?.titleTextStyle === "italic"
                              }
                              onCheckedChange={(c) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.titleTextStyle",
                                  c ? "italic" : "normal",
                                )
                              }
                            />
                            <Label
                              htmlFor="titleItalic"
                              className="text-white text-xs"
                            >
                              Italic
                            </Label>
                          </div>

                          {/* Spacing Control */}
                          <div>
                            <Label className="text-white text-xs">
                              Spacing (Bottom): {sectionStyles?.basicInfo?.titleSpacing ?? 8}px
                            </Label>
                            <input
                              type="range"
                              value={sectionStyles?.basicInfo?.titleSpacing ?? 8}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.titleSpacing",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={0}
                              max={50}
                            />
                          </div>

                          {/* Horizontal Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Horizontal Position: {form.watch("sectionStyles.basicInfo.titlePositionX") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.titlePositionX") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.titlePositionX",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>

                          {/* Vertical Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Vertical Position: {form.watch("sectionStyles.basicInfo.titlePositionY") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.titlePositionY") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.titlePositionY",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Company Styling */}
                    <div className="border border-slate-700/30 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("companyStyling")}
                      >
                        <h5 className="text-xs font-normal text-slate-300">
                          Company Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.companyStyling ? "down" : "up"} text-slate-400 text-xs`}
                        />
                      </div>

                      {!collapsedSections.companyStyling && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.basicInfo
                                      ?.companyColor || "#6b7280"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.basicInfo.companyColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                />
                                <Input
                                  value={
                                    sectionStyles?.basicInfo
                                      ?.companyColor || ""
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.basicInfo.companyColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#6b7280"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">Font</Label>
                              <Select
                                value={
                                  sectionStyles?.basicInfo
                                    ?.companyFont || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.companyFont",
                                    v,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Choose font" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Inter",
                                    "Roboto",
                                    "Open Sans",
                                    "Lato",
                                    "Montserrat",
                                    "Poppins",
                                    "Source Sans Pro",
                                    "Nunito",
                                    "Raleway",
                                    "Ubuntu",
                                    "PT Sans",
                                    "Merriweather",
                                    "Playfair Display",
                                    "Oswald",
                                    "Libre Baskerville",
                                    "Crimson Text",
                                    "Work Sans",
                                    "Fira Sans",
                                    "DM Sans",
                                    "Space Grotesk",
                                  ].map((f) => (
                                    <SelectItem key={f} value={f}>
                                      {f}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Size:{" "}
                                {sectionStyles?.basicInfo
                                  ?.companyFontSize || 14}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.basicInfo
                                    ?.companyFontSize || 14
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.companyFontSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={10}
                                max={32}
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Weight
                              </Label>
                              <Select
                                value={
                                  sectionStyles?.basicInfo
                                    ?.companyFontWeight || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.basicInfo.companyFontWeight",
                                    v as any,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Weight" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    ["300", "Light"],
                                    ["400", "Regular"],
                                    ["500", "Medium"],
                                    ["600", "Semi Bold"],
                                    ["700", "Bold"],
                                    ["800", "Extra Bold"],
                                  ].map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="companyItalic"
                              checked={
                                sectionStyles?.basicInfo
                                  ?.companyTextStyle === "italic"
                              }
                              onCheckedChange={(c) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.companyTextStyle",
                                  c ? "italic" : "normal",
                                )
                              }
                            />
                            <Label
                              htmlFor="companyItalic"
                              className="text-white text-xs"
                            >
                              Italic
                            </Label>
                          </div>

                          {/* Spacing Control */}
                          <div>
                            <Label className="text-white text-xs">
                              Spacing (Bottom): {sectionStyles?.basicInfo?.companySpacing ?? 8}px
                            </Label>
                            <input
                              type="range"
                              value={sectionStyles?.basicInfo?.companySpacing ?? 8}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.companySpacing",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={0}
                              max={50}
                            />
                          </div>

                          {/* Horizontal Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Horizontal Position: {form.watch("sectionStyles.basicInfo.companyPositionX") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.companyPositionX") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.companyPositionX",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>

                          {/* Vertical Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Vertical Position: {form.watch("sectionStyles.basicInfo.companyPositionY") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.companyPositionY") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.companyPositionY",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    {/* Text Group Position */}
                    <div className="border border-slate-700/30 rounded-lg p-3 space-y-3 mt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("textGroupPosition")}
                      >
                        <h5 className="text-xs font-normal text-slate-300">
                          Text Group Position
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.textGroupPosition ? "down" : "up"} text-slate-400 text-xs`}
                        />
                      </div>

                      {!collapsedSections.textGroupPosition && (
                        <>
                          {/* Horizontal Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Horizontal Position: {form.watch("sectionStyles.basicInfo.textGroupHorizontal") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.textGroupHorizontal") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.textGroupHorizontal",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>

                          {/* Vertical Position */}
                          <div>
                            <Label className="text-white text-xs">
                              Vertical Position: {form.watch("sectionStyles.basicInfo.textGroupVertical") ?? 0}px
                            </Label>
                            <input
                              type="range"
                              value={form.watch("sectionStyles.basicInfo.textGroupVertical") ?? 0}
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.basicInfo.textGroupVertical",
                                  parseInt(e.target.value),
                                )
                              }
                              className="custom-range w-full"
                              min={-150}
                              max={150}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className="hidden bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("contactInfo")}
                >
                  <h3 className="text-lg font-semibold text-purple-300">
                    {t("form.contactInfo")}
                  </h3>
                  <i
                    className={`fas ${collapsedSections.contactInfo ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`}
                  />
                </div>

                {!collapsedSections.contactInfo && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-purple-300">
                        Custom Contact Methods
                      </h4>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleContactDragEnd}
                      >
                        <SortableContext
                          items={
                            form.watch("customContacts")?.map((c) => c.id) || []
                          }
                          strategy={verticalListSortingStrategy}
                        >
                          {form
                            .watch("customContacts")
                            ?.map((contact, index) => (
                              <SortableItem key={contact.id} id={contact.id}>
                                <div className="flex gap-2 items-end bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                  <div className="flex-1">
                                    <Label className="text-white">Label</Label>
                                    <Input
                                      value={contact.label}
                                      onChange={(e) => {
                                        const arr = [
                                          ...(form.watch("customContacts") ||
                                            []),
                                        ];
                                        arr[index] = {
                                          ...contact,
                                          label: e.target.value,
                                        };
                                        form.setValue("customContacts", arr);
                                      }}
                                      className="bg-slate-700 border-slate-600 text-white"
                                      placeholder="Contact label"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-white">Value</Label>
                                    <Input
                                      value={contact.value}
                                      onChange={(e) => {
                                        const arr = [
                                          ...(form.watch("customContacts") ||
                                            []),
                                        ];
                                        arr[index] = {
                                          ...contact,
                                          value: e.target.value,
                                        };
                                        form.setValue("customContacts", arr);
                                      }}
                                      className="bg-slate-700 border-slate-600 text-white"
                                      placeholder="Contact value"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <Label className="text-white">Icon</Label>
                                    <Select
                                      value={contact.icon}
                                      onValueChange={(v) => {
                                        const arr = [
                                          ...(form.watch("customContacts") ||
                                            []),
                                        ];
                                        arr[index] = { ...contact, icon: v };
                                        form.setValue("customContacts", arr);
                                      }}
                                    >
                                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getAvailableIcons()
                                          .filter(
                                            (icon) =>
                                              icon.category === "contact",
                                          )
                                          .map((icon) => (
                                            <SelectItem
                                              key={icon.name}
                                              value={icon.icon}
                                            >
                                              <div className="flex items-center gap-2">
                                                <i className={icon.icon} />
                                                {icon.name}
                                              </div>
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      const arr =
                                        form
                                          .watch("customContacts")
                                          ?.filter((_, i) => i !== index) || [];
                                      form.setValue("customContacts", arr);
                                    }}
                                  >
                                    <i className="fas fa-trash" />
                                  </Button>
                                </div>
                              </SortableItem>
                            ))}
                        </SortableContext>
                      </DndContext>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const currentTemplate = form.getValues("template"); // Preserve current template
                          const newContact = {
                            id: generateFieldId(),
                            label: "",
                            value: "",
                            type: "other" as const,
                            icon: "fas fa-link",
                          };
                          form.setValue("customContacts", [
                            ...(form.watch("customContacts") || []),
                            newContact,
                          ]);
                          // Explicitly preserve template type to prevent reverting to schema default
                          form.setValue("template", currentTemplate);
                        }}
                        className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        <i className="fas fa-plus mr-2" />
                        Add Custom Contact
                      </Button>
                    </div>

                    {/* Icon Styling */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3 mt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("contactIconStyling")}
                        data-testid="toggle-contact-icon-styling"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Icon Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.contactIconStyling ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.contactIconStyling && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Icon Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconColor || "#8b5cf6"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-contact-icon"
                                />
                                <Input
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconColor || "#8b5cf6"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#8b5cf6"
                                  data-testid="input-contact-icon-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Background Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconBackgroundColor || "#1e293b"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconBackgroundColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-contact-icon-bg"
                                />
                                <Input
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconBackgroundColor || "#1e293b"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconBackgroundColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#1e293b"
                                  data-testid="input-contact-icon-bg-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Border Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconBorderColor ||       brandColor || "#475569"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconBorderColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-contact-icon-border"
                                />
                                <Input
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconBorderColor || "#475569"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconBorderColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#475569"
                                  data-testid="input-contact-icon-border-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Border Size:{" "}
                                {sectionStyles?.contactInfo
                                  ?.borderSize || 1}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.contactInfo
                                    ?.borderSize || 1
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.contactInfo.borderSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={0}
                                max={5}
                                data-testid="slider-contact-border-size"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Icon Size:{" "}
                                {sectionStyles?.contactInfo
                                  ?.iconSize || 18}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.contactInfo
                                    ?.iconSize || 18
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.contactInfo.iconSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={12}
                                max={32}
                                data-testid="slider-contact-icon-size"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Icon Background Size:{" "}
                                {sectionStyles?.contactInfo
                                  ?.iconBackgroundSize || 40}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.contactInfo
                                    ?.iconBackgroundSize || 40
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.contactInfo.iconBackgroundSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={24}
                                max={80}
                                data-testid="slider-contact-icon-background-size"
                              />
                            </div>
                          </div>

                          {/* Enhanced Icon Styling Options */}
                          <div className="border-t border-slate-600 pt-3 mt-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-white text-xs">
                                  View
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.view || "icon-text"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.view",
                                      value as "icon-text" | "icon" | "text",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-contact-view"
                                  >
                                    <SelectValue placeholder="Select view" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="icon-text">
                                      Icon & Text
                                    </SelectItem>
                                    <SelectItem value="icon">Icon</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Skin
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.skin || "flat"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.skin",
                                      value as
                                        | "gradient"
                                        | "minimal"
                                        | "framed"
                                        | "boxed"
                                        | "flat",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-contact-skin"
                                  >
                                    <SelectValue placeholder="Select skin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gradient">
                                      Gradient
                                    </SelectItem>
                                    <SelectItem value="minimal">
                                      Minimal
                                    </SelectItem>
                                    <SelectItem value="framed">
                                      Framed
                                    </SelectItem>
                                    <SelectItem value="boxed">
                                      Boxed Icon
                                    </SelectItem>
                                    <SelectItem value="flat">Flat</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Shape
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.shape || "rounded"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.shape",
                                      value as "square" | "rounded" | "circle",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-contact-shape"
                                  >
                                    <SelectValue placeholder="Select shape" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="square">
                                      Square
                                    </SelectItem>
                                    <SelectItem value="rounded">
                                      Rounded
                                    </SelectItem>
                                    <SelectItem value="circle">
                                      Circle
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Columns
                                </Label>
                                <Select
                                  value={String(
                                    sectionStyles?.contactInfo
                                      ?.columns || "auto",
                                  )}
                                  onValueChange={(value) => {
                                    const numValue =
                                      value === "auto"
                                        ? "auto"
                                        : parseInt(value);
                                    form.setValue(
                                      "sectionStyles.contactInfo.columns",
                                      numValue,
                                    );
                                  }}
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-contact-columns"
                                  >
                                    <SelectValue placeholder="Select columns" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Alignment
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.alignment || "left"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.alignment",
                                      value as
                                        | "left"
                                        | "center"
                                        | "right"
                                        | "justify",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-contact-alignment"
                                  >
                                    <SelectValue placeholder="Select alignment" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-left"></i>
                                        Left
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="center">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-center"></i>
                                        Center
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="right">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-right"></i>
                                        Right
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="justify">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-justify"></i>
                                        Justify
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Label Toggle - Only show when View is Icon & Text */}
                            {sectionStyles?.contactInfo?.view ===
                              "icon-text" && (
                              <div className="flex items-center justify-between mt-3 p-2 bg-slate-700/50 rounded">
                                <div>
                                  <Label className="text-white text-xs">
                                    Show Label
                                  </Label>
                                  <p className="text-xs text-slate-400">
                                    Display text labels next to icons
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="contactShowLabel"
                                    checked={
                                      sectionStyles?.contactInfo
                                        ?.showLabel !== false
                                    }
                                    onCheckedChange={(checked) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.showLabel",
                                        !!checked,
                                      )
                                    }
                                    data-testid="checkbox-contact-show-label"
                                  />
                                  <Label
                                    htmlFor="contactShowLabel"
                                    className="text-white text-xs"
                                  >
                                    Show
                                  </Label>
                                </div>
                              </div>
                            )}

                            {/* Icon Container Dimensions */}
                            <div className="mt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-white text-xs">
                                    Icon Width
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      value={[
                                        sectionStyles?.contactInfo
                                          ?.iconBackgroundWidth || 48,
                                      ]}
                                      onValueChange={(value) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.iconBackgroundWidth",
                                          value[0],
                                        )
                                      }
                                      min={24}
                                      max={120}
                                      step={2}
                                      className="flex-1"
                                      data-testid="slider-contact-icon-width"
                                    />
                                    <span className="text-white text-xs w-8">
                                      {sectionStyles?.contactInfo
                                        ?.iconBackgroundWidth || 48}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-white text-xs">
                                    Icon Height
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      value={[
                                        sectionStyles?.contactInfo
                                          ?.iconBackgroundHeight || 48,
                                      ]}
                                      onValueChange={(value) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.iconBackgroundHeight",
                                          value[0],
                                        )
                                      }
                                      min={24}
                                      max={120}
                                      step={2}
                                      className="flex-1"
                                      data-testid="slider-contact-icon-height"
                                    />
                                    <span className="text-white text-xs w-8">
                                      {sectionStyles?.contactInfo
                                        ?.iconBackgroundHeight || 48}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Text Position - Only show when View includes text */}
                              {/* {(sectionStyles?.contactInfo?.view === "icon-text" || sectionStyles?.contactInfo?.view === "text") && ( */}

                              <div>
                                <Label className="text-white text-xs">
                                  Text Position
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.textPosition || "right"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.textPosition",
                                      value as
                                        | "left"
                                        | "right"
                                        | "top"
                                        | "bottom",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-contact-text-position"
                                  >
                                    <SelectValue placeholder="Select position" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-slate-700 border-slate-600">
                                    <SelectItem value="left">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-arrow-left"></i>
                                        Text Left
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="right">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-arrow-right"></i>
                                        Text Right
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="top">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-arrow-up"></i>
                                        Text Top
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="bottom">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-arrow-down"></i>
                                        Text Bottom
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              {/* )} */}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hover Color */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("contactHoverColor")}
                        data-testid="toggle-contact-hover-color"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Hover Color
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.contactHoverColor ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.contactHoverColor && (
                        <>
                          {/* Enable Hover Color Toggle */}
                          <div className="flex items-center justify-between">
                            <Label className="text-white text-xs">
                              Enable Hover Color
                            </Label>
                            <input
                              type="checkbox"
                              checked={
                                sectionStyles?.contactInfo
                                  ?.enableHoverColor || false
                              }
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.contactInfo.enableHoverColor",
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                              data-testid="checkbox-contact-enable-hover"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Icon Hover Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconHoverColor || "#a855f7"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-contact-icon-hover"
                                />
                                <Input
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconHoverColor || "#a855f7"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#a855f7"
                                  data-testid="input-contact-icon-hover-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Background Hover Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconBackgroundHoverColor || "#374151"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconBackgroundHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-contact-icon-bg-hover"
                                />
                                <Input
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconBackgroundHoverColor || "#374151"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconBackgroundHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#374151"
                                  data-testid="input-contact-icon-bg-hover-color"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Font Styling */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("contactFontStyling")}
                        data-testid="toggle-contact-font-styling"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Font Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.contactFontStyling ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.contactFontStyling && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Text Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconTextColor || "#ffffff"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconTextColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-contact-font"
                                />
                                <Input
                                  value={
                                    sectionStyles?.contactInfo
                                      ?.iconTextColor || "#ffffff"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.contactInfo.iconTextColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#ffffff"
                                  data-testid="input-contact-font-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">Font</Label>
                              <Select
                                value={
                                  sectionStyles?.contactInfo
                                    ?.iconTextFont || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.contactInfo.iconTextFont",
                                    v,
                                  )
                                }
                                data-testid="select-contact-font-family"
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Choose font" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    "Inter",
                                    "Roboto",
                                    "Open Sans",
                                    "Lato",
                                    "Montserrat",
                                    "Poppins",
                                    "Source Sans Pro",
                                    "Nunito",
                                    "Raleway",
                                    "Ubuntu",
                                    "PT Sans",
                                    "Merriweather",
                                    "Playfair Display",
                                    "Oswald",
                                    "Libre Baskerville",
                                    "Crimson Text",
                                    "Work Sans",
                                    "Fira Sans",
                                    "DM Sans",
                                    "Space Grotesk",
                                  ].map((f) => (
                                    <SelectItem key={f} value={f}>
                                      {f}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Font Size:{" "}
                                {sectionStyles?.contactInfo
                                  ?.iconTextSize || 14}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.contactInfo
                                    ?.iconTextSize || 14
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.contactInfo.iconTextSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={10}
                                max={24}
                                data-testid="slider-contact-font-size"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Font Weight
                              </Label>
                              <Select
                                value={
                                  sectionStyles?.contactInfo
                                    ?.iconTextWeight || ""
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.contactInfo.iconTextWeight",
                                    v as any,
                                  )
                                }
                                data-testid="select-contact-font-weight"
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                                  <SelectValue placeholder="Weight" />
                                </SelectTrigger>
                                <SelectContent>
                                  {[
                                    ["300", "Light"],
                                    ["400", "Regular"],
                                    ["500", "Medium"],
                                    ["600", "Semi Bold"],
                                    ["700", "Bold"],
                                    ["800", "Extra Bold"],
                                  ].map(([v, l]) => (
                                    <SelectItem key={v} value={v}>
                                      {l}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Drop Shadow Options */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("contactDropShadow")}
                        data-testid="toggle-contact-drop-shadow"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Drop Shadow
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.contactDropShadow ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.contactDropShadow && (
                        <>
                          <div className="flex items-center space-x-2 mb-3">
                            <Checkbox
                              id="contactDropShadowEnable"
                              checked={
                                sectionStyles?.contactInfo
                                  ?.dropShadowEnabled || false
                              }
                              onCheckedChange={(c) =>
                                form.setValue(
                                  "sectionStyles.contactInfo.dropShadowEnabled",
                                  !!c,
                                )
                              }
                              data-testid="checkbox-contact-drop-shadow-enable"
                            />
                            <Label
                              htmlFor="contactDropShadowEnable"
                              className="text-white text-xs"
                            >
                              Enable Drop Shadow
                            </Label>
                          </div>

                          {sectionStyles?.contactInfo
                            ?.dropShadowEnabled && (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-white text-xs">
                                    Shadow Color
                                  </Label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="color"
                                      value={
                                        sectionStyles?.contactInfo
                                          ?.dropShadowColor || "#000000"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.dropShadowColor",
                                          e.target.value,
                                        )
                                      }
                                      className="w-6 h-6 rounded cursor-pointer"
                                      data-testid="color-picker-contact-shadow"
                                    />
                                    <Input
                                      value={
                                        sectionStyles?.contactInfo
                                          ?.dropShadowColor || "#000000"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.dropShadowColor",
                                          e.target.value,
                                        )
                                      }
                                      className="bg-slate-700 border-slate-600 text-white text-xs"
                                      placeholder="#000000"
                                      data-testid="input-contact-shadow-color"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Shadow Opacity:{" "}
                                    {Math.round(
                                      (sectionStyles?.contactInfo
                                        ?.dropShadowOpacity || 0.25) * 100,
                                    )}
                                    %
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      (sectionStyles?.contactInfo
                                        ?.dropShadowOpacity || 0.25) * 100
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.dropShadowOpacity",
                                        parseInt(e.target.value) / 100,
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={100}
                                    data-testid="slider-contact-shadow-opacity"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Blur Radius:{" "}
                                    {sectionStyles?.contactInfo
                                      ?.dropShadowBlur || 4}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.contactInfo
                                        ?.dropShadowBlur || 4
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.dropShadowBlur",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={20}
                                    data-testid="slider-contact-shadow-blur"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Shadow Offset:{" "}
                                    {sectionStyles?.contactInfo
                                      ?.dropShadowOffset || 2}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.contactInfo
                                        ?.dropShadowOffset || 2
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.dropShadowOffset",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={10}
                                    data-testid="slider-contact-shadow-offset"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Contact Container Styling Section */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("contactContainerStyling")}
                        data-testid="toggle-contact-container-styling"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Contact Container Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.contactContainerStyling ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.contactContainerStyling && (
                        <>
                          <div className="flex items-center space-x-2 mb-3">
                            <Checkbox
                              id="contactContainerStylingEnable"
                              checked={
                                sectionStyles?.contactInfo
                                  ?.containerStylingEnabled || false
                              }
                              onCheckedChange={(c) =>
                                form.setValue(
                                  "sectionStyles.contactInfo.containerStylingEnabled",
                                  !!c,
                                )
                              }
                              data-testid="checkbox-enable-container-styling"
                            />
                            <Label
                              htmlFor="contactContainerStylingEnable"
                              className="text-white text-xs"
                            >
                              Enable Contact Container Styling
                            </Label>
                          </div>

                          {sectionStyles?.contactInfo
                            ?.containerStylingEnabled && (
                            <>
                              {/* Container Background & Border */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                  <Label className="text-white text-xs">
                                    Container Background
                                  </Label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="color"
                                      value={
                                        sectionStyles?.contactInfo
                                          ?.containerBackgroundColor ||
                                        "#1e293b"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.containerBackgroundColor",
                                          e.target.value,
                                        )
                                      }
                                      className="w-6 h-6 rounded cursor-pointer"
                                      data-testid="color-picker-container-bg"
                                    />
                                    <Input
                                      value={
                                        sectionStyles?.contactInfo
                                          ?.containerBackgroundColor ||
                                        "#1e293b"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.containerBackgroundColor",
                                          e.target.value,
                                        )
                                      }
                                      className="bg-slate-700 border-slate-600 text-white text-xs"
                                      placeholder="#1e293b"
                                      data-testid="input-container-bg-color"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Container Border
                                  </Label>
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="color"
                                      value={
                                        sectionStyles?.contactInfo
                                          ?.containerBorderColor || "#475569"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.containerBorderColor",
                                          e.target.value,
                                        )
                                      }
                                      className="w-6 h-6 rounded cursor-pointer"
                                      data-testid="color-picker-container-border"
                                    />
                                    <Input
                                      value={
                                        sectionStyles?.contactInfo
                                          ?.containerBorderColor || "#475569"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.contactInfo.containerBorderColor",
                                          e.target.value,
                                        )
                                      }
                                      className="bg-slate-700 border-slate-600 text-white text-xs"
                                      placeholder="#475569"
                                      data-testid="input-container-border-color"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Container Dimensions & Styling */}
                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                  <Label className="text-white text-xs">
                                    Border Radius:{" "}
                                    {sectionStyles?.contactInfo
                                      ?.containerBorderRadius || 8}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.contactInfo
                                        ?.containerBorderRadius || 8
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.containerBorderRadius",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={50}
                                    data-testid="slider-container-border-radius"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Container Gap:{" "}
                                    {sectionStyles?.contactInfo
                                      ?.containerGap || 8}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.contactInfo
                                        ?.containerGap || 8
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.containerGap",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={20}
                                    data-testid="slider-container-gap"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 mb-3">
                                <div>
                                  <Label className="text-white text-xs">
                                    Container Width:{" "}
                                    {sectionStyles?.contactInfo
                                      ?.containerWidth || 80}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.contactInfo
                                        ?.containerWidth || 80
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.containerWidth",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={60}
                                    max={120}
                                    data-testid="slider-container-width"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Container Height:{" "}
                                    {sectionStyles?.contactInfo
                                      ?.containerHeight || 80}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.contactInfo
                                        ?.containerHeight || 80
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.containerHeight",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={60}
                                    max={120}
                                    data-testid="slider-container-height"
                                  />
                                </div>
                              </div>

                              {/* Container Drop Shadow */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="containerDropShadowEnable"
                                    checked={
                                      sectionStyles?.contactInfo
                                        ?.containerDropShadowEnabled || false
                                    }
                                    onCheckedChange={(c) =>
                                      form.setValue(
                                        "sectionStyles.contactInfo.containerDropShadowEnabled",
                                        !!c,
                                      )
                                    }
                                    data-testid="checkbox-container-drop-shadow-enable"
                                  />
                                  <Label
                                    htmlFor="containerDropShadowEnable"
                                    className="text-white text-xs"
                                  >
                                    Enable Container Drop Shadow
                                  </Label>
                                </div>

                                {sectionStyles?.contactInfo
                                  ?.containerDropShadowEnabled && (
                                  <>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-white text-xs">
                                          Shadow Color
                                        </Label>
                                        <div className="flex items-center gap-1">
                                          <input
                                            type="color"
                                            value={
                                              sectionStyles
                                                ?.contactInfo
                                                ?.containerDropShadowColor ||
                                              "#000000"
                                            }
                                            onChange={(e) =>
                                              form.setValue(
                                                "sectionStyles.contactInfo.containerDropShadowColor",
                                                e.target.value,
                                              )
                                            }
                                            className="w-6 h-6 rounded cursor-pointer"
                                            data-testid="color-picker-container-shadow"
                                          />
                                          <Input
                                            value={
                                              sectionStyles
                                                ?.contactInfo
                                                ?.containerDropShadowColor ||
                                              "#000000"
                                            }
                                            onChange={(e) =>
                                              form.setValue(
                                                "sectionStyles.contactInfo.containerDropShadowColor",
                                                e.target.value,
                                              )
                                            }
                                            className="bg-slate-700 border-slate-600 text-white text-xs"
                                            placeholder="#000000"
                                            data-testid="input-container-shadow-color"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-white text-xs">
                                          Shadow Opacity:{" "}
                                          {Math.round(
                                            (sectionStyles
                                              ?.contactInfo
                                              ?.containerDropShadowOpacity ||
                                              0.25) * 100,
                                          )}
                                          %
                                        </Label>
                                        <input
                                          type="range"
                                          value={
                                            (sectionStyles
                                              ?.contactInfo
                                              ?.containerDropShadowOpacity ||
                                              0.25) * 100
                                          }
                                          onChange={(e) =>
                                            form.setValue(
                                              "sectionStyles.contactInfo.containerDropShadowOpacity",
                                              parseInt(e.target.value) / 100,
                                            )
                                          }
                                          className="custom-range w-full"
                                          min={0}
                                          max={100}
                                          data-testid="slider-container-shadow-opacity"
                                        />
                                      </div>

                                      <div>
                                        <Label className="text-white text-xs">
                                          Blur Radius:{" "}
                                          {sectionStyles
                                            ?.contactInfo
                                            ?.containerDropShadowBlur || 4}
                                          px
                                        </Label>
                                        <input
                                          type="range"
                                          value={
                                            sectionStyles
                                              ?.contactInfo
                                              ?.containerDropShadowBlur || 4
                                          }
                                          onChange={(e) =>
                                            form.setValue(
                                              "sectionStyles.contactInfo.containerDropShadowBlur",
                                              parseInt(e.target.value),
                                            )
                                          }
                                          className="custom-range w-full"
                                          min={0}
                                          max={20}
                                          data-testid="slider-container-shadow-blur"
                                        />
                                      </div>

                                      <div>
                                        <Label className="text-white text-xs">
                                          Shadow Offset:{" "}
                                          {sectionStyles
                                            ?.contactInfo
                                            ?.containerDropShadowOffset || 2}
                                          px
                                        </Label>
                                        <input
                                          type="range"
                                          value={
                                            sectionStyles
                                              ?.contactInfo
                                              ?.containerDropShadowOffset || 2
                                          }
                                          onChange={(e) =>
                                            form.setValue(
                                              "sectionStyles.contactInfo.containerDropShadowOffset",
                                              parseInt(e.target.value),
                                            )
                                          }
                                          className="custom-range w-full"
                                          min={0}
                                          max={10}
                                          data-testid="slider-container-shadow-offset"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Social Media, Appearance, SEO, Page Builder & Auto-save (unchanged beyond earlier fixes) */}
              {/* Social, Appearance, SEO blocks identical to the previous message’s version */}
              {/* For brevity, they are left as-is in this full file you paste above. */}
              {/* --- SOCIAL MEDIA BLOCK START --- */}
              <div
                className="hidden rounded-lg p-4 space-y-4"
                style={{
                  backgroundColor:
                    sectionStyles?.socialMedia
                      ?.sectionBackgroundColor || "rgba(219, 39, 119, 0.3)",
                  borderColor:
                    sectionStyles?.socialMedia
                      ?.sectionBorderColor || "rgba(219, 39, 119, 0.6)",
                  borderWidth: "1px",
                  borderStyle: "solid",
                }}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("customization")}
                >
                  <h3 className="text-lg font-semibold text-pink-300">
                    {t("form.socialMedia")}
                  </h3>
                  <i
                    className={`fas ${collapsedSections.customization ? "fa-chevron-down" : "fa-chevron-up"} text-pink-300`}
                  />
                </div>
                {!collapsedSections.customization && (
                  <>
                    <div className="space-y-4">
                      <h4 className="text-md font-medium text-talklink-300">
                        Additional Social Platforms
                      </h4>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleSocialDragEnd}
                      >
                        <SortableContext
                          items={
                            form.watch("customSocials")?.map((s) => s.id) || []
                          }
                          strategy={verticalListSortingStrategy}
                        >
                          {form.watch("customSocials")?.map((social, index) => (
                            <SortableItem key={social.id} id={social.id}>
                              <div className="flex gap-2 items-end bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                                <div className="flex-1">
                                  <Label className="text-white">
                                    Button Label
                                  </Label>
                                  <Input
                                    value={social.label}
                                    onChange={(e) => {
                                      const arr = [
                                        ...(form.watch("customSocials") || []),
                                      ];
                                      arr[index] = {
                                        ...social,
                                        label: e.target.value,
                                      };
                                      form.setValue("customSocials", arr);
                                    }}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="Button text"
                                  />
                                </div>
                                <div className="flex-1">
                                  <Label className="text-white">
                                    Username/URL
                                  </Label>
                                  <Input
                                    value={social.value}
                                    onChange={(e) => {
                                      const arr = [
                                        ...(form.watch("customSocials") || []),
                                      ];
                                      arr[index] = {
                                        ...social,
                                        value: e.target.value,
                                      };
                                      form.setValue("customSocials", arr);
                                    }}
                                    className="bg-slate-700 border-slate-600 text-white"
                                    placeholder="@username or URL"
                                  />
                                </div>
                                <div className="w-32">
                                  <Label className="text-white">Icon</Label>
                                  <Select
                                    value={social.icon}
                                    onValueChange={(v) => {
                                      const arr = [
                                        ...(form.watch("customSocials") || []),
                                      ];
                                      arr[index] = { ...social, icon: v };
                                      form.setValue("customSocials", arr);
                                    }}
                                  >
                                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                      <SelectValue>
                                        {social.icon && (
                                          <i
                                            className={`${social.icon} mr-2`}
                                          />
                                        )}
                                      </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                      {getAvailableIcons()
                                        .filter((i) => i.category === "social")
                                        .map((i) => (
                                          <SelectItem
                                            key={i.icon}
                                            value={i.icon}
                                          >
                                            <div className="flex items-center">
                                              <i className={`${i.icon} mr-2`} />
                                              {i.name}
                                            </div>
                                          </SelectItem>
                                        ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const arr =
                                      form
                                        .watch("customSocials")
                                        ?.filter((_, i) => i !== index) || [];
                                    form.setValue("customSocials", arr);
                                  }}
                                  className="mb-0"
                                >
                                  <i className="fas fa-trash text-xs" />
                                </Button>
                              </div>
                            </SortableItem>
                          ))}
                        </SortableContext>
                      </DndContext>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentTemplate = form.getValues("template"); // Preserve current template
                          const newSocial = {
                            id: generateFieldId(),
                            label: "Social",
                            value: "",
                            icon: "fab fa-facebook",
                            platform: "",
                          };
                          form.setValue("customSocials", [
                            ...(form.watch("customSocials") || []),
                            newSocial,
                          ]);
                          // Explicitly preserve template type to prevent reverting to schema default
                          form.setValue("template", currentTemplate);
                        }}
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      >
                        <i className="fas fa-plus mr-2" /> Add Social Platform
                      </Button>
                    </div>

                    {/* Icon Styling */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3 mt-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("socialIconStyling")}
                        data-testid="toggle-social-icon-styling"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Icon Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.socialIconStyling ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.socialIconStyling && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Icon Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconColor || "#3b82f6"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-social-icon"
                                />
                                <Input
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconColor || "#3b82f6"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#3b82f6"
                                  data-testid="input-social-icon-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Background Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconBackgroundColor || "#16a34a"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconBackgroundColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-social-icon-bg"
                                />
                                <Input
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconBackgroundColor || "#16a34a"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconBackgroundColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#16a34a"
                                  data-testid="input-social-icon-bg-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Border Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconBorderColor || "#475569"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconBorderColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-social-icon-border"
                                />
                                <Input
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconBorderColor || "#475569"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconBorderColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#475569"
                                  data-testid="input-social-icon-border-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Border Size:{" "}
                                {sectionStyles?.socialMedia
                                  ?.borderSize || 1}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.socialMedia
                                    ?.borderSize || 1
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.socialMedia.borderSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={0}
                                max={5}
                                data-testid="slider-social-border-size"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Icon Size:{" "}
                                {sectionStyles?.socialMedia
                                  ?.iconSize || 18}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.socialMedia
                                    ?.iconSize || 18
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.socialMedia.iconSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={12}
                                max={32}
                                data-testid="slider-social-icon-size"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Icon Background Size:{" "}
                                {sectionStyles?.socialMedia
                                  ?.iconBackgroundSize || 40}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.socialMedia
                                    ?.iconBackgroundSize || 40
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.socialMedia.iconBackgroundSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={24}
                                max={80}
                                data-testid="slider-social-icon-background-size"
                              />
                            </div>
                          </div>

                          {/* Enhanced Icon Styling Options */}
                          <div className="border-t border-slate-600 pt-3 mt-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <Label className="text-white text-xs">
                                  View
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.view || "icon-text"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.view",
                                      value as "icon-text" | "icon" | "text",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-social-view"
                                  >
                                    <SelectValue placeholder="Select view" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="icon-text">
                                      Icon & Text
                                    </SelectItem>
                                    <SelectItem value="icon">Icon</SelectItem>
                                    <SelectItem value="text">Text</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Skin
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.skin || "flat"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.skin",
                                      value as
                                        | "gradient"
                                        | "minimal"
                                        | "framed"
                                        | "boxed"
                                        | "flat",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-social-skin"
                                  >
                                    <SelectValue placeholder="Select skin" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="gradient">
                                      Gradient
                                    </SelectItem>
                                    <SelectItem value="minimal">
                                      Minimal
                                    </SelectItem>
                                    <SelectItem value="framed">
                                      Framed
                                    </SelectItem>
                                    <SelectItem value="boxed">
                                      Boxed Icon
                                    </SelectItem>
                                    <SelectItem value="flat">Flat</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Shape
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.shape || "rounded"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.shape",
                                      value as "square" | "rounded" | "circle",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-social-shape"
                                  >
                                    <SelectValue placeholder="Select shape" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="square">
                                      Square
                                    </SelectItem>
                                    <SelectItem value="rounded">
                                      Rounded
                                    </SelectItem>
                                    <SelectItem value="circle">
                                      Circle
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Columns
                                </Label>
                                <Select
                                  value={String(
                                    sectionStyles?.socialMedia
                                      ?.columns || "auto",
                                  )}
                                  onValueChange={(value) => {
                                    const numValue =
                                      value === "auto"
                                        ? "auto"
                                        : parseInt(value);
                                    form.setValue(
                                      "sectionStyles.socialMedia.columns",
                                      numValue,
                                    );
                                  }}
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-social-columns"
                                  >
                                    <SelectValue placeholder="Select columns" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="auto">Auto</SelectItem>
                                    <SelectItem value="1">1</SelectItem>
                                    <SelectItem value="2">2</SelectItem>
                                    <SelectItem value="3">3</SelectItem>
                                    <SelectItem value="4">4</SelectItem>
                                    <SelectItem value="5">5</SelectItem>
                                    <SelectItem value="6">6</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Alignment
                                </Label>
                                <Select
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.alignment || "left"
                                  }
                                  onValueChange={(value) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.alignment",
                                      value as
                                        | "left"
                                        | "center"
                                        | "right"
                                        | "justify",
                                    )
                                  }
                                >
                                  <SelectTrigger
                                    className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                    data-testid="select-social-alignment"
                                  >
                                    <SelectValue placeholder="Select alignment" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="left">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-left"></i>
                                        Left
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="center">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-center"></i>
                                        Center
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="right">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-right"></i>
                                        Right
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="justify">
                                      <div className="flex items-center gap-2">
                                        <i className="fas fa-align-justify"></i>
                                        Justify
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {/* Label Toggle - Only show when View is Icon & Text */}
                            {sectionStyles?.socialMedia?.view ===
                              "icon-text" && (
                              <div className="flex items-center justify-between mt-3 p-2 bg-slate-700/50 rounded">
                                <div>
                                  <Label className="text-white text-xs">
                                    Show Label
                                  </Label>
                                  <p className="text-xs text-slate-400">
                                    Display text labels next to icons
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="socialShowLabel"
                                    checked={
                                      sectionStyles?.socialMedia
                                        ?.showLabel !== false
                                    }
                                    onCheckedChange={(checked) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.showLabel",
                                        !!checked,
                                      )
                                    }
                                    data-testid="checkbox-social-show-label"
                                  />
                                  <Label
                                    htmlFor="socialShowLabel"
                                    className="text-white text-xs"
                                  >
                                    Show
                                  </Label>
                                </div>
                              </div>
                            )}

                            {/* Icon Container Dimensions */}
                            <div className="mt-3 space-y-3">
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-white text-xs">
                                    Icon Width
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      value={[
                                        sectionStyles?.socialMedia
                                          ?.iconBackgroundWidth || 48,
                                      ]}
                                      onValueChange={(value) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.iconBackgroundWidth",
                                          value[0],
                                        )
                                      }
                                      min={24}
                                      max={120}
                                      step={2}
                                      className="flex-1"
                                      data-testid="slider-social-icon-width"
                                    />
                                    <span className="text-white text-xs w-8">
                                      {sectionStyles?.socialMedia
                                        ?.iconBackgroundWidth || 48}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-white text-xs">
                                    Icon Height
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <Slider
                                      value={[
                                        sectionStyles?.socialMedia
                                          ?.iconBackgroundHeight || 48,
                                      ]}
                                      onValueChange={(value) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.iconBackgroundHeight",
                                          value[0],
                                        )
                                      }
                                      min={24}
                                      max={120}
                                      step={2}
                                      className="flex-1"
                                      data-testid="slider-social-icon-height"
                                    />
                                    <span className="text-white text-xs w-8">
                                      {sectionStyles?.socialMedia
                                        ?.iconBackgroundHeight || 48}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Text Position - Only show when View includes text */}
                              {(sectionStyles?.socialMedia
                                ?.view === "icon-text" ||
                                sectionStyles?.socialMedia
                                  ?.view === "text") && (
                                <div>
                                  <Label className="text-white text-xs">
                                    Text Position
                                  </Label>
                                  <Select
                                    value={
                                      sectionStyles?.socialMedia
                                        ?.textPosition || "right"
                                    }
                                    onValueChange={(value) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.textPosition",
                                        value as
                                          | "left"
                                          | "right"
                                          | "top"
                                          | "bottom",
                                      )
                                    }
                                  >
                                    <SelectTrigger
                                      className="bg-slate-700 border-slate-600 text-white text-xs h-8"
                                      data-testid="select-social-text-position"
                                    >
                                      <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-700 border-slate-600">
                                      <SelectItem value="left">
                                        <div className="flex items-center gap-2">
                                          <i className="fas fa-arrow-left"></i>
                                          Text Left
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="right">
                                        <div className="flex items-center gap-2">
                                          <i className="fas fa-arrow-right"></i>
                                          Text Right
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="top">
                                        <div className="flex items-center gap-2">
                                          <i className="fas fa-arrow-up"></i>
                                          Text Top
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="bottom">
                                        <div className="flex items-center gap-2">
                                          <i className="fas fa-arrow-down"></i>
                                          Text Bottom
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Hover Color */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("socialHoverColor")}
                        data-testid="toggle-social-hover-color"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Hover Color
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.socialHoverColor ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.socialHoverColor && (
                        <>
                          {/* Enable Hover Color Toggle */}
                          <div className="flex items-center justify-between">
                            <Label className="text-white text-xs">
                              Enable Hover Color
                            </Label>
                            <input
                              type="checkbox"
                              checked={
                                sectionStyles?.socialMedia
                                  ?.enableHoverColor || false
                              }
                              onChange={(e) =>
                                form.setValue(
                                  "sectionStyles.socialMedia.enableHoverColor",
                                  e.target.checked,
                                )
                              }
                              className="w-4 h-4 rounded bg-slate-700 border-slate-600"
                              data-testid="checkbox-social-enable-hover"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Icon Hover Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconHoverColor || "#60a5fa"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-social-icon-hover"
                                />
                                <Input
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconHoverColor || "#60a5fa"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#60a5fa"
                                  data-testid="input-social-icon-hover-color"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Background Hover Color
                              </Label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconBackgroundHoverColor || "#22c55e"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconBackgroundHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-6 h-6 rounded cursor-pointer"
                                  data-testid="color-picker-social-icon-bg-hover"
                                />
                                <Input
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconBackgroundHoverColor || "#22c55e"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconBackgroundHoverColor",
                                      e.target.value,
                                    )
                                  }
                                  className="bg-slate-700 border-slate-600 text-white text-xs"
                                  placeholder="#22c55e"
                                  data-testid="input-social-icon-bg-hover-color"
                                />
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Font Styling */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("socialFontStyling")}
                        data-testid="toggle-social-font-styling"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Font Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.socialFontStyling ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.socialFontStyling && (
                        <>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Text Color
                              </Label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconTextColor || "#000000"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconTextColor",
                                      e.target.value,
                                    )
                                  }
                                  className="w-8 h-8 rounded border border-slate-600"
                                />
                                <input
                                  type="text"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.iconTextColor || "#000000"
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.iconTextColor",
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 bg-slate-700 border-slate-600 text-white text-xs h-8"
                                  placeholder="#000000"
                                />
                              </div>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Font Family
                              </Label>
                              <Select
                                value={
                                  sectionStyles?.socialMedia
                                    ?.iconTextFont || "inherit"
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.socialMedia.iconTextFont",
                                    v,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="inherit">
                                    Default
                                  </SelectItem>
                                  <SelectItem value="Arial, sans-serif">
                                    Arial
                                  </SelectItem>
                                  <SelectItem value="Helvetica, sans-serif">
                                    Helvetica
                                  </SelectItem>
                                  <SelectItem value="Georgia, serif">
                                    Georgia
                                  </SelectItem>
                                  <SelectItem value="Times New Roman, serif">
                                    Times
                                  </SelectItem>
                                  <SelectItem value="Verdana, sans-serif">
                                    Verdana
                                  </SelectItem>
                                  <SelectItem value="Courier New, monospace">
                                    Courier
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div>
                              <Label className="text-white text-xs">
                                Font Size:{" "}
                                {sectionStyles?.socialMedia
                                  ?.iconTextSize || 14}
                                px
                              </Label>
                              <input
                                type="range"
                                value={
                                  sectionStyles?.socialMedia
                                    ?.iconTextSize || 14
                                }
                                onChange={(e) =>
                                  form.setValue(
                                    "sectionStyles.socialMedia.iconTextSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="custom-range w-full"
                                min={10}
                                max={24}
                                data-testid="slider-social-font-size"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Font Weight
                              </Label>
                              <Select
                                value={
                                  sectionStyles?.socialMedia
                                    ?.iconTextWeight || "400"
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.socialMedia.iconTextWeight",
                                    v as any,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="300">Light</SelectItem>
                                  <SelectItem value="400">Normal</SelectItem>
                                  <SelectItem value="500">Medium</SelectItem>
                                  <SelectItem value="600">Semi-bold</SelectItem>
                                  <SelectItem value="700">Bold</SelectItem>
                                  <SelectItem value="800">
                                    Extra-bold
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-white text-xs">
                                Font Style
                              </Label>
                              <Select
                                value={
                                  sectionStyles?.socialMedia
                                    ?.iconTextStyle || "normal"
                                }
                                onValueChange={(v) =>
                                  form.setValue(
                                    "sectionStyles.socialMedia.iconTextStyle",
                                    v as any,
                                  )
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="normal">Normal</SelectItem>
                                  <SelectItem value="italic">Italic</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Drop Shadow Options */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("socialDropShadow")}
                        data-testid="toggle-social-drop-shadow"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Drop Shadow
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.socialDropShadow ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.socialDropShadow && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="socialDropShadowEnable"
                              checked={
                                sectionStyles?.socialMedia
                                  ?.dropShadowEnabled || false
                              }
                              onCheckedChange={(checked) =>
                                form.setValue(
                                  "sectionStyles.socialMedia.dropShadowEnabled",
                                  !!checked,
                                )
                              }
                              data-testid="checkbox-social-drop-shadow-enable"
                            />
                            <Label
                              htmlFor="socialDropShadowEnable"
                              className="text-white text-xs"
                            >
                              Enable Drop Shadow
                            </Label>
                          </div>

                          {sectionStyles?.socialMedia
                            ?.dropShadowEnabled && (
                            <>
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-white text-xs">
                                    Shadow Color
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="color"
                                      value={
                                        sectionStyles?.socialMedia
                                          ?.dropShadowColor || "#000000"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.dropShadowColor",
                                          e.target.value,
                                        )
                                      }
                                      className="w-8 h-8 rounded border border-slate-600"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        sectionStyles?.socialMedia
                                          ?.dropShadowColor || "#000000"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.dropShadowColor",
                                          e.target.value,
                                        )
                                      }
                                      className="flex-1 bg-slate-700 border-slate-600 text-white text-xs h-8"
                                      placeholder="#000000"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Opacity:{" "}
                                    {Math.round(
                                      (sectionStyles?.socialMedia
                                        ?.dropShadowOpacity || 0.25) * 100,
                                    )}
                                    %
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.socialMedia
                                        ?.dropShadowOpacity || 0.25
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.dropShadowOpacity",
                                        parseFloat(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    data-testid="slider-social-drop-shadow-opacity"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-white text-xs">
                                    Blur:{" "}
                                    {sectionStyles?.socialMedia
                                      ?.dropShadowBlur || 4}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.socialMedia
                                        ?.dropShadowBlur || 4
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.dropShadowBlur",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={20}
                                    data-testid="slider-social-drop-shadow-blur"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Offset:{" "}
                                    {sectionStyles?.socialMedia
                                      ?.dropShadowOffset || 2}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.socialMedia
                                        ?.dropShadowOffset || 2
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.dropShadowOffset",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={10}
                                    data-testid="slider-social-drop-shadow-offset"
                                  />
                                </div>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>

                    {/* Social Container Styling Section */}
                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => toggleSection("socialContainerStyling")}
                        data-testid="toggle-social-container-styling"
                      >
                        <h5 className="text-xs font-medium text-purple-300">
                          Social Container Styling
                        </h5>
                        <i
                          className={`fas fa-chevron-${collapsedSections.socialContainerStyling ? "down" : "up"} text-purple-300 text-xs`}
                        />
                      </div>

                      {!collapsedSections.socialContainerStyling && (
                        <>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="socialContainerStylingEnable"
                              checked={
                                sectionStyles?.socialMedia
                                  ?.containerStylingEnabled || false
                              }
                              onCheckedChange={(checked) =>
                                form.setValue(
                                  "sectionStyles.socialMedia.containerStylingEnabled",
                                  !!checked,
                                )
                              }
                              data-testid="checkbox-enable-social-container-styling"
                            />
                            <Label
                              htmlFor="socialContainerStylingEnable"
                              className="text-white text-xs"
                            >
                              Enable Social Container Styling
                            </Label>
                          </div>

                          {sectionStyles?.socialMedia
                            ?.containerStylingEnabled && (
                            <>
                              {/* Container Background & Border */}
                              <div className="grid grid-cols-2 gap-2">
                                <div>
                                  <Label className="text-white text-xs">
                                    Container Background
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="color"
                                      value={
                                        sectionStyles?.socialMedia
                                          ?.containerBackgroundColor ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.containerBackgroundColor",
                                          e.target.value,
                                        )
                                      }
                                      className="w-8 h-8 rounded border border-slate-600"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        sectionStyles?.socialMedia
                                          ?.containerBackgroundColor ||
                                        "#ffffff"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.containerBackgroundColor",
                                          e.target.value,
                                        )
                                      }
                                      className="flex-1 bg-slate-700 border-slate-600 text-white text-xs h-8"
                                      placeholder="#ffffff"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Container Border
                                  </Label>
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="color"
                                      value={
                                        sectionStyles?.socialMedia
                                          ?.containerBorderColor || "#e5e7eb"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.containerBorderColor",
                                          e.target.value,
                                        )
                                      }
                                      className="w-8 h-8 rounded border border-slate-600"
                                    />
                                    <input
                                      type="text"
                                      value={
                                        sectionStyles?.socialMedia
                                          ?.containerBorderColor || "#e5e7eb"
                                      }
                                      onChange={(e) =>
                                        form.setValue(
                                          "sectionStyles.socialMedia.containerBorderColor",
                                          e.target.value,
                                        )
                                      }
                                      className="flex-1 bg-slate-700 border-slate-600 text-white text-xs h-8"
                                      placeholder="#e5e7eb"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Container Dimensions */}
                              <div className="grid grid-cols-3 gap-2">
                                <div>
                                  <Label className="text-white text-xs">
                                    Border Radius:{" "}
                                    {sectionStyles?.socialMedia
                                      ?.containerBorderRadius || 8}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.socialMedia
                                        ?.containerBorderRadius || 8
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.containerBorderRadius",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={0}
                                    max={24}
                                    data-testid="slider-social-container-border-radius"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Container Width:{" "}
                                    {sectionStyles?.socialMedia
                                      ?.containerWidth || 100}
                                    %
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.socialMedia
                                        ?.containerWidth || 100
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.containerWidth",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={50}
                                    max={100}
                                    data-testid="slider-social-container-width"
                                  />
                                </div>

                                <div>
                                  <Label className="text-white text-xs">
                                    Container Height:{" "}
                                    {sectionStyles?.socialMedia
                                      ?.containerHeight || 60}
                                    px
                                  </Label>
                                  <input
                                    type="range"
                                    value={
                                      sectionStyles?.socialMedia
                                        ?.containerHeight || 60
                                    }
                                    onChange={(e) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.containerHeight",
                                        parseInt(e.target.value),
                                      )
                                    }
                                    className="custom-range w-full"
                                    min={40}
                                    max={120}
                                    data-testid="slider-social-container-height"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label className="text-white text-xs">
                                  Container Gap:{" "}
                                  {sectionStyles?.socialMedia
                                    ?.containerGap || 12}
                                  px
                                </Label>
                                <input
                                  type="range"
                                  value={
                                    sectionStyles?.socialMedia
                                      ?.containerGap || 12
                                  }
                                  onChange={(e) =>
                                    form.setValue(
                                      "sectionStyles.socialMedia.containerGap",
                                      parseInt(e.target.value),
                                    )
                                  }
                                  className="custom-range w-full"
                                  min={0}
                                  max={32}
                                  data-testid="slider-social-container-gap"
                                />
                              </div>

                              {/* Container Drop Shadow */}
                              <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                  <Checkbox
                                    id="socialContainerDropShadowEnable"
                                    checked={
                                      sectionStyles?.socialMedia
                                        ?.containerDropShadowEnabled || false
                                    }
                                    onCheckedChange={(checked) =>
                                      form.setValue(
                                        "sectionStyles.socialMedia.containerDropShadowEnabled",
                                        !!checked,
                                      )
                                    }
                                    data-testid="checkbox-social-container-drop-shadow-enable"
                                  />
                                  <Label
                                    htmlFor="socialContainerDropShadowEnable"
                                    className="text-white text-xs"
                                  >
                                    Enable Container Drop Shadow
                                  </Label>
                                </div>

                                {sectionStyles?.socialMedia
                                  ?.containerDropShadowEnabled && (
                                  <>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-white text-xs">
                                          Shadow Color
                                        </Label>
                                        <div className="flex items-center space-x-2">
                                          <input
                                            type="color"
                                            value={
                                              sectionStyles
                                                ?.socialMedia
                                                ?.containerDropShadowColor ||
                                              "#000000"
                                            }
                                            onChange={(e) =>
                                              form.setValue(
                                                "sectionStyles.socialMedia.containerDropShadowColor",
                                                e.target.value,
                                              )
                                            }
                                            className="w-8 h-8 rounded border border-slate-600"
                                          />
                                          <input
                                            type="text"
                                            value={
                                              sectionStyles
                                                ?.socialMedia
                                                ?.containerDropShadowColor ||
                                              "#000000"
                                            }
                                            onChange={(e) =>
                                              form.setValue(
                                                "sectionStyles.socialMedia.containerDropShadowColor",
                                                e.target.value,
                                              )
                                            }
                                            className="flex-1 bg-slate-700 border-slate-600 text-white text-xs h-8"
                                            placeholder="#000000"
                                          />
                                        </div>
                                      </div>

                                      <div>
                                        <Label className="text-white text-xs">
                                          Opacity:{" "}
                                          {Math.round(
                                            (sectionStyles
                                              ?.socialMedia
                                              ?.containerDropShadowOpacity ||
                                              0.1) * 100,
                                          )}
                                          %
                                        </Label>
                                        <input
                                          type="range"
                                          value={
                                            sectionStyles
                                              ?.socialMedia
                                              ?.containerDropShadowOpacity ||
                                            0.1
                                          }
                                          onChange={(e) =>
                                            form.setValue(
                                              "sectionStyles.socialMedia.containerDropShadowOpacity",
                                              parseFloat(e.target.value),
                                            )
                                          }
                                          className="custom-range w-full"
                                          min={0}
                                          max={1}
                                          step={0.05}
                                          data-testid="slider-social-container-drop-shadow-opacity"
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <Label className="text-white text-xs">
                                          Blur:{" "}
                                          {sectionStyles
                                            ?.socialMedia
                                            ?.containerDropShadowBlur || 8}
                                          px
                                        </Label>
                                        <input
                                          type="range"
                                          value={
                                            sectionStyles
                                              ?.socialMedia
                                              ?.containerDropShadowBlur || 8
                                          }
                                          onChange={(e) =>
                                            form.setValue(
                                              "sectionStyles.socialMedia.containerDropShadowBlur",
                                              parseInt(e.target.value),
                                            )
                                          }
                                          className="custom-range w-full"
                                          min={0}
                                          max={24}
                                          data-testid="slider-social-container-drop-shadow-blur"
                                        />
                                      </div>

                                      <div>
                                        <Label className="text-white text-xs">
                                          Offset:{" "}
                                          {sectionStyles
                                            ?.socialMedia
                                            ?.containerDropShadowOffset || 2}
                                          px
                                        </Label>
                                        <input
                                          type="range"
                                          value={
                                            sectionStyles
                                              ?.socialMedia
                                              ?.containerDropShadowOffset || 2
                                          }
                                          onChange={(e) =>
                                            form.setValue(
                                              "sectionStyles.socialMedia.containerDropShadowOffset",
                                              parseInt(e.target.value),
                                            )
                                          }
                                          className="custom-range w-full"
                                          min={0}
                                          max={12}
                                          data-testid="slider-social-container-drop-shadow-offset"
                                        />
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Theme Mode - Show only Theme settings */}
          {builderMode === "theme" && (
            <>
              {/* Appearance Section */}
              <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("appearance")}
                >
                  <h3 className="text-lg font-semibold text-purple-300">
                    Theme
                  </h3>
                  <i
                    className={`fas ${collapsedSections.appearance ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`}
                  />
                </div>

                {!collapsedSections.appearance && (
                  <>
                    <div className="space-y-6">
                      {/* Template Selection Removed - Using Single Dynamic Template */}
                      {/* Default Colors Section */}
                      <div>
                        <h4 className="text-md font-medium text-purple-200 mb-3">
                          Default Colors
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-white text-sm">
                              Primary Color
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                {...form.register("brandColor")}
                                className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                data-testid="input-primary-color"
                              />
                              <span className="text-xs text-gray-400">
                                {form.watch("brandColor") || "#54C5BC"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <Label className="text-white text-sm">
                              Secondary Color
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                {...form.register("secondaryColor")}
                                className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                data-testid="input-secondary-color"
                              />
                              <span className="text-xs text-gray-400">
                                {secondaryColor || "#999999"}
                              </span>
                            </div>
                          </div>

                          <div>
                            <Label className="text-white text-sm">
                              Tertiary Color
                            </Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                {...form.register("tertiaryColor")}
                                className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                data-testid="input-tertiary-color"
                              />
                              <span className="text-xs text-gray-400">
                                {tertiaryColor || "#FFFFFF"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Background Section */}
                      <div>
                        <h4 className="text-md font-medium text-purple-200 mb-3">
                          Background
                        </h4>
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-white text-sm">
                                Content
                              </Label>
                              <Select
                                value={backgroundType || "color"}
                                onValueChange={(v) =>
                                  form.setValue("backgroundType", v)
                                }
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="color">Color</SelectItem>
                                  <SelectItem value="gradient">
                                    Gradient
                                  </SelectItem>
                                  <SelectItem value="image">Image</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-white text-sm">
                                Background Color
                              </Label>
                              <div className="flex items-center gap-2 mt-1">
                                <Input
                                  type="color"
                                  {...form.register("backgroundColor")}
                                  className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                  data-testid="input-background-color"
                                />
                                <span className="text-xs text-gray-400">
                                  {form.watch("backgroundColor") || "#FFFFFF"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {backgroundType === "image" && (
                            <div>
                              <Label className="text-white text-sm">
                                Background Image
                              </Label>
                              <div className="flex gap-2">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    handleFileUpload(e, "backgroundImage")
                                  }
                                  disabled={isUploading}
                                  className="bg-slate-700 border-slate-600 text-white flex-1"
                                  data-testid="input-background-image"
                                />
                                {backgroundImage && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      form.setValue("backgroundImage", "")
                                    }
                                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                                  >
                                    <i className="fas fa-trash" />
                                  </Button>
                                )}
                              </div>
                              {backgroundImage && (
                                <div className="mt-2">
                                  <img
                                    src={backgroundImage}
                                    alt="Background Preview"
                                    className="w-full max-w-xs h-auto rounded border border-slate-600"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Animation Section */}
                      <div>
                        <h4 className="text-md font-medium text-purple-200 mb-3">
                          Animations
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="text-white text-sm">
                              Animation Type
                            </Label>
                            <Select
                              value={animationType || "none"}
                              onValueChange={(v) =>
                                form.setValue("animationType", v)
                              }
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None</SelectItem>
                                <SelectItem value="fade">Fade In</SelectItem>
                                <SelectItem value="slide">Slide Up</SelectItem>
                                <SelectItem value="bounce">Bounce</SelectItem>
                                <SelectItem value="zoom">Zoom In</SelectItem>
                                <SelectItem value="rotate">Rotate</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white text-sm">
                              Duration (ms)
                            </Label>
                            <Input
                              type="number"
                              min="100"
                              max="2000"
                              step="100"
                              {...form.register("animationDuration", {
                                valueAsNumber: true,
                              })}
                              className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                              placeholder="500"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Heading Style Section */}
                      <div>
                        <h4 className="text-md font-medium text-purple-200 mb-3">
                          Heading Style
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-white text-sm">Font</Label>
                            <Select
                              value={headingFont || "inter"}
                              onValueChange={(v) =>
                                form.setValue("headingFont", v)
                              }
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                <SelectItem value="inter">Inter</SelectItem>
                                <SelectItem value="roboto">Roboto</SelectItem>
                                <SelectItem value="poppins">Poppins</SelectItem>
                                <SelectItem value="montserrat">
                                  Montserrat
                                </SelectItem>
                                <SelectItem value="open-sans">
                                  Open Sans
                                </SelectItem>
                                <SelectItem value="lato">Lato</SelectItem>
                                <SelectItem value="nunito">Nunito</SelectItem>
                                <SelectItem value="source-sans-pro">
                                  Source Sans Pro
                                </SelectItem>
                                <SelectItem value="raleway">Raleway</SelectItem>
                                <SelectItem value="ubuntu">Ubuntu</SelectItem>
                                <SelectItem value="merriweather">
                                  Merriweather
                                </SelectItem>
                                <SelectItem value="oswald">Oswald</SelectItem>
                                <SelectItem value="pt-sans">PT Sans</SelectItem>
                                <SelectItem value="playfair-display">
                                  Playfair Display
                                </SelectItem>
                                <SelectItem value="libre-baskerville">
                                  Libre Baskerville
                                </SelectItem>
                                <SelectItem value="crimson-text">
                                  Crimson Text
                                </SelectItem>
                                <SelectItem value="fira-sans">
                                  Fira Sans
                                </SelectItem>
                                <SelectItem value="noto-sans">
                                  Noto Sans
                                </SelectItem>
                                <SelectItem value="karla">Karla</SelectItem>
                                <SelectItem value="dm-sans">DM Sans</SelectItem>
                                <SelectItem value="mulish">Mulish</SelectItem>
                                <SelectItem value="rubik">Rubik</SelectItem>
                                <SelectItem value="outfit">Outfit</SelectItem>
                                <SelectItem value="manrope">Manrope</SelectItem>
                                <SelectItem value="space-grotesk">
                                  Space Grotesk
                                </SelectItem>
                                <SelectItem value="plus-jakarta-sans">
                                  Plus Jakarta Sans
                                </SelectItem>
                                <SelectItem value="lexend">Lexend</SelectItem>
                                <SelectItem value="be-vietnam-pro">
                                  Be Vietnam Pro
                                </SelectItem>
                                <SelectItem value="public-sans">
                                  Public Sans
                                </SelectItem>
                                <SelectItem value="commissioner">
                                  Commissioner
                                </SelectItem>
                                <SelectItem value="epilogue">
                                  Epilogue
                                </SelectItem>
                                <SelectItem value="work-sans">
                                  Work Sans
                                </SelectItem>
                                <SelectItem value="quicksand">
                                  Quicksand
                                </SelectItem>
                                <SelectItem value="red-hat-display">
                                  Red Hat Display
                                </SelectItem>
                                <SelectItem value="ibm-plex-sans">
                                  IBM Plex Sans
                                </SelectItem>
                                <SelectItem value="figtree">Figtree</SelectItem>
                                <SelectItem value="nunito-sans">
                                  Nunito Sans
                                </SelectItem>
                                <SelectItem value="satoshi">Satoshi</SelectItem>
                                <SelectItem value="cabinet-grotesk">
                                  Cabinet Grotesk
                                </SelectItem>
                                <SelectItem value="general-sans">
                                  General Sans
                                </SelectItem>
                                <SelectItem value="supreme">Supreme</SelectItem>
                                <SelectItem value="gt-walsheim">
                                  GT Walsheim
                                </SelectItem>
                                <SelectItem value="circular">
                                  Circular
                                </SelectItem>
                                <SelectItem value="avenir-next">
                                  Avenir Next
                                </SelectItem>
                                <SelectItem value="helvetica-neue">
                                  Helvetica Neue
                                </SelectItem>
                                <SelectItem value="sf-pro">SF Pro</SelectItem>
                                <SelectItem value="system-ui">
                                  System UI
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white text-sm">Weight</Label>
                            <Select
                              value={`${headingFontWeight || 600}`}
                              onValueChange={(v) =>
                                form.setValue("headingFontWeight", parseInt(v))
                              }
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="300">Light</SelectItem>
                                <SelectItem value="400">Normal</SelectItem>
                                <SelectItem value="500">Medium</SelectItem>
                                <SelectItem value="600">Semi-Bold</SelectItem>
                                <SelectItem value="700">Bold</SelectItem>
                                <SelectItem value="800">Extra Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white text-sm">Size</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="12"
                                max="40"
                                value={headingFontSize || 24}
                                onChange={(e) =>
                                  form.setValue(
                                    "headingFontSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none slider"
                              />
                              <span className="text-xs text-gray-400 w-6">
                                {headingFontSize || 24}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <Label className="text-white text-sm">Color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                {...form.register("headingColor")}
                                className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                data-testid="input-heading-color"
                              />
                              <span className="text-xs text-gray-400">
                                {form.watch("headingColor") || "#000000"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Paragraph Style Section */}
                      <div>
                        <h4 className="text-md font-medium text-purple-200 mb-3">
                          Paragraph Style
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label className="text-white text-sm">Font</Label>
                            <Select
                              value={paragraphFont || "inter"}
                              onValueChange={(v) =>
                                form.setValue("paragraphFont", v)
                              }
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-60">
                                <SelectItem value="inter">Inter</SelectItem>
                                <SelectItem value="roboto">Roboto</SelectItem>
                                <SelectItem value="poppins">Poppins</SelectItem>
                                <SelectItem value="montserrat">
                                  Montserrat
                                </SelectItem>
                                <SelectItem value="open-sans">
                                  Open Sans
                                </SelectItem>
                                <SelectItem value="lato">Lato</SelectItem>
                                <SelectItem value="nunito">Nunito</SelectItem>
                                <SelectItem value="source-sans-pro">
                                  Source Sans Pro
                                </SelectItem>
                                <SelectItem value="raleway">Raleway</SelectItem>
                                <SelectItem value="ubuntu">Ubuntu</SelectItem>
                                <SelectItem value="merriweather">
                                  Merriweather
                                </SelectItem>
                                <SelectItem value="oswald">Oswald</SelectItem>
                                <SelectItem value="pt-sans">PT Sans</SelectItem>
                                <SelectItem value="playfair-display">
                                  Playfair Display
                                </SelectItem>
                                <SelectItem value="libre-baskerville">
                                  Libre Baskerville
                                </SelectItem>
                                <SelectItem value="crimson-text">
                                  Crimson Text
                                </SelectItem>
                                <SelectItem value="fira-sans">
                                  Fira Sans
                                </SelectItem>
                                <SelectItem value="noto-sans">
                                  Noto Sans
                                </SelectItem>
                                <SelectItem value="karla">Karla</SelectItem>
                                <SelectItem value="dm-sans">DM Sans</SelectItem>
                                <SelectItem value="mulish">Mulish</SelectItem>
                                <SelectItem value="rubik">Rubik</SelectItem>
                                <SelectItem value="outfit">Outfit</SelectItem>
                                <SelectItem value="manrope">Manrope</SelectItem>
                                <SelectItem value="space-grotesk">
                                  Space Grotesk
                                </SelectItem>
                                <SelectItem value="plus-jakarta-sans">
                                  Plus Jakarta Sans
                                </SelectItem>
                                <SelectItem value="lexend">Lexend</SelectItem>
                                <SelectItem value="be-vietnam-pro">
                                  Be Vietnam Pro
                                </SelectItem>
                                <SelectItem value="public-sans">
                                  Public Sans
                                </SelectItem>
                                <SelectItem value="commissioner">
                                  Commissioner
                                </SelectItem>
                                <SelectItem value="epilogue">
                                  Epilogue
                                </SelectItem>
                                <SelectItem value="work-sans">
                                  Work Sans
                                </SelectItem>
                                <SelectItem value="quicksand">
                                  Quicksand
                                </SelectItem>
                                <SelectItem value="red-hat-display">
                                  Red Hat Display
                                </SelectItem>
                                <SelectItem value="ibm-plex-sans">
                                  IBM Plex Sans
                                </SelectItem>
                                <SelectItem value="figtree">Figtree</SelectItem>
                                <SelectItem value="nunito-sans">
                                  Nunito Sans
                                </SelectItem>
                                <SelectItem value="satoshi">Satoshi</SelectItem>
                                <SelectItem value="cabinet-grotesk">
                                  Cabinet Grotesk
                                </SelectItem>
                                <SelectItem value="general-sans">
                                  General Sans
                                </SelectItem>
                                <SelectItem value="supreme">Supreme</SelectItem>
                                <SelectItem value="gt-walsheim">
                                  GT Walsheim
                                </SelectItem>
                                <SelectItem value="circular">
                                  Circular
                                </SelectItem>
                                <SelectItem value="avenir-next">
                                  Avenir Next
                                </SelectItem>
                                <SelectItem value="helvetica-neue">
                                  Helvetica Neue
                                </SelectItem>
                                <SelectItem value="sf-pro">SF Pro</SelectItem>
                                <SelectItem value="system-ui">
                                  System UI
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white text-sm">Weight</Label>
                            <Select
                              value={`${paragraphFontWeight || 400}`}
                              onValueChange={(v) =>
                                form.setValue(
                                  "paragraphFontWeight",
                                  parseInt(v),
                                )
                              }
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="300">Light</SelectItem>
                                <SelectItem value="400">Normal</SelectItem>
                                <SelectItem value="500">Medium</SelectItem>
                                <SelectItem value="600">Semi-Bold</SelectItem>
                                <SelectItem value="700">Bold</SelectItem>
                                <SelectItem value="800">Extra Bold</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label className="text-white text-sm">Size</Label>
                            <div className="flex items-center gap-2">
                              <input
                                type="range"
                                min="10"
                                max="24"
                                value={paragraphFontSize || 14}
                                onChange={(e) =>
                                  form.setValue(
                                    "paragraphFontSize",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none slider"
                              />
                              <span className="text-xs text-gray-400 w-6">
                                {paragraphFontSize || 14}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-3">
                          <div>
                            <Label className="text-white text-sm">Color</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Input
                                type="color"
                                {...form.register("paragraphColor")}
                                className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                                data-testid="input-paragraph-color"
                              />
                              <span className="text-xs text-gray-400">
                                {form.watch("paragraphColor") || "#000000"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* SEO Mode - Show only SEO settings */}
          {builderMode === "seo" && (
            <>
              {/* SEO Settings Section */}
              <div className="bg-orange-900/30 border border-orange-600/30 rounded-lg p-4 space-y-4">
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection("seo")}
                >
                  <h3 className="text-lg font-semibold text-orange-300">
                    SEO
                  </h3>
                  <i
                    className={`fas ${collapsedSections.seo ? "fa-chevron-down" : "fa-chevron-up"} text-orange-300`}
                  />
                </div>

                {!collapsedSections.seo && (
                  <>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-white">Meta Title</Label>
                        <Input
                          {...form.register("metaTitle")}
                          placeholder="Professional Digital Business Card - Your Name"
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-meta-title"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Recommended: 50-60 characters
                        </p>
                      </div>

                      <div>
                        <Label className="text-white">Meta Description</Label>
                        <Textarea
                          {...form.register("metaDescription")}
                          placeholder="Connect with me easily through my digital business card. Find my contact information, social media, and professional details in one place."
                          className="bg-slate-700 border-slate-600 text-white"
                          data-testid="input-meta-description"
                          rows={3}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                          Recommended: 150-160 characters
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">OG Title</Label>
                          <Input
                            {...form.register("ogTitle")}
                            placeholder="Custom title for social media sharing"
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-og-title"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Leave empty to use Meta Title
                          </p>
                        </div>

                        <div>
                          <Label className="text-white">OG Description</Label>
                          <Input
                            {...form.register("ogDescription")}
                            placeholder="Custom description for social media"
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-og-description"
                          />
                          <p className="text-xs text-gray-400 mt-1">
                            Leave empty to use Meta Description
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Keywords</Label>
                          <div className="space-y-2">
                            {/* Tags display */}
                            {form.watch("keywords") && (form.watch("keywords") as string[]).length > 0 && (
                              <div className="flex flex-wrap gap-2 p-2 bg-slate-800/50 rounded-md border border-slate-600">
                                {(form.watch("keywords") as string[]).map((keyword, index) => (
                                  <div
                                    key={index}
                                    className="inline-flex items-center gap-1 px-3 py-1 bg-slate-600 text-white text-sm rounded-full"
                                  >
                                    <span>{keyword}</span>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentKeywords = form.watch("keywords") as string[];
                                        const newKeywords = currentKeywords.filter((_, i) => i !== index);
                                        form.setValue("keywords", newKeywords);
                                      }}
                                      className="ml-1 hover:bg-slate-500 rounded-full w-4 h-4 flex items-center justify-center transition-colors"
                                      data-testid={`button-remove-keyword-${index}`}
                                    >
                                      <i className="fas fa-times text-xs"></i>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {/* Input to add new keywords */}
                            <Input
                              placeholder="Type a keyword and press Enter or comma"
                              className="bg-slate-700 border-slate-600 text-white"
                              data-testid="input-add-keyword"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === ",") {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  const value = input.value.trim();
                                  if (value) {
                                    const currentKeywords = form.watch("keywords") as string[] || [];
                                    if (!currentKeywords.includes(value)) {
                                      form.setValue("keywords", [...currentKeywords, value]);
                                    }
                                    input.value = "";
                                  }
                                }
                              }}
                              onBlur={(e) => {
                                const value = e.currentTarget.value.trim();
                                if (value) {
                                  const currentKeywords = form.watch("keywords") as string[] || [];
                                  if (!currentKeywords.includes(value)) {
                                    form.setValue("keywords", [...currentKeywords, value]);
                                  }
                                  e.currentTarget.value = "";
                                }
                              }}
                            />
                            <p className="text-xs text-gray-400">
                              Press Enter or comma to add keyword
                            </p>
                          </div>
                        </div>

                        <div>
                          <Label className="text-white">Author</Label>
                          <Input
                            {...form.register("author")}
                            placeholder="Your Full Name"
                            className="bg-slate-700 border-slate-600 text-white"
                            data-testid="input-author"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Open Graph Image</Label>
                        <div className="flex gap-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "ogImage")}
                            disabled={isUploading}
                            className="bg-slate-700 border-slate-600 text-white flex-1"
                            data-testid="input-og-image"
                          />
                          {ogImage && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => form.setValue("ogImage", "")}
                              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                            >
                              <i className="fas fa-trash" />
                            </Button>
                          )}
                        </div>
                        {ogImage && (
                          <div className="mt-2">
                            <img
                              src={ogImage}
                              alt="OG Preview"
                              className="w-full max-w-xs h-auto rounded border border-slate-600"
                            />
                          </div>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          Recommended: 1200x630px for social media sharing
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="noIndex"
                            checked={noIndex || false}
                            onCheckedChange={(checked) =>
                              form.setValue("noIndex", !!checked)
                            }
                            className="border-slate-600"
                          />
                          <Label
                            htmlFor="noIndex"
                            className="text-white text-sm"
                          >
                            No Index (Hide from search engines)
                          </Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="noFollow"
                            checked={noFollow || false}
                            onCheckedChange={(checked) =>
                              form.setValue("noFollow", !!checked)
                            }
                            className="border-slate-600"
                          />
                          <Label
                            htmlFor="noFollow"
                            className="text-white text-sm"
                          >
                            No Follow (Don't follow links)
                          </Label>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Auto Save */}
              <div className="flex items-center justify-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                <div className="flex items-center space-x-2 text-slate-300">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm">Auto-saving changes...</span>
                </div>
              </div>
            </>
          )}

          {/* Page Mode - Show Page Toggles */}
          {builderMode === "page" && (
            <>
              {/* Page Toggles Section */}
              <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-blue-300 flex items-center">
                    <i className="fas fa-sitemap mr-2"></i>
                    Page Editor
                  </h3>
                  <Button
                    type="button"
                    onClick={() => {
                      const newPageId = `page-${Date.now()}`;
                      const currentPages = pages || [];
                      const pageNumber =
                        currentPages.filter((p: any) => p.key !== "home")
                          .length + 1;
                      const newPage = {
                        id: newPageId,
                        key: newPageId,
                        path: `page-${pageNumber}`,
                        label: `Page ${pageNumber}`,
                        visible: true,
                        elements: [],
                      };
                      form.setValue("pages" as any, [...currentPages, newPage]);
                      setSelectedPageId(newPageId); // Auto-select the new page
                    }}
                    size="sm"
                    className="bg-blue-700 hover:bg-blue-600 text-white"
                    data-testid="button-add-new-page"
                  >
                    <i className="fas fa-plus mr-2"></i>
                    Add New Page
                  </Button>
                </div>

                {/* Page Toggles/Tabs */}
                <div className="flex flex-wrap gap-2">
                  {((pages as any[]) || [])
                    .filter((page: any) => page.key !== "home")
                    .map((page: any, index: number) => (
                      <div key={page.id} className="relative group">
                        <div
                          className={`${
                            selectedPageId === page.id
                              ? "bg-blue-600 border-blue-500"
                              : "bg-slate-700 border-slate-600 hover:bg-slate-600"
                          } border rounded-md px-3 py-2 pr-8 transition-all duration-200 cursor-pointer flex items-center`}
                          onClick={() => setSelectedPageId(page.id)}
                          data-testid={`button-page-toggle-${index}`}
                        >
                          <i className="fas fa-file-alt mr-2 text-white"></i>
                          <input
                            type="text"
                            value={page.label}
                            onChange={(e) => {
                              e.stopPropagation();
                              const currentPages =
                                (pages as any[]) || [];
                              const updatedPages = currentPages.map((p: any) =>
                                p.id === page.id
                                  ? { ...p, label: e.target.value }
                                  : p,
                              );
                              form.setValue("pages" as any, updatedPages);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent text-white text-sm font-medium border-none outline-none focus:bg-white/10 rounded px-1 min-w-0 flex-1"
                            placeholder="Page Name"
                          />
                          {selectedPageId === page.id && (
                            <div className="ml-2 text-xs bg-blue-400 px-1 rounded text-white">
                              {getPageElements(page.id).length}
                            </div>
                          )}
                        </div>

                        {/* Delete button */}
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            const currentPages =
                              (pages as any[]) || [];
                            const updatedPages = currentPages.filter(
                              (p) => p.id !== page.id,
                            );
                            form.setValue("pages" as any, updatedPages);
                            // Switch to first available page if deleting current page
                            if (selectedPageId === page.id) {
                              const remainingPages = updatedPages.filter(
                                (p: any) => p.key !== "home",
                              );
                              if (remainingPages.length > 0) {
                                setSelectedPageId(remainingPages[0].id);
                              }
                            }
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-delete-page-${index}`}
                        >
                          <i className="fas fa-times text-xs"></i>
                        </Button>
                      </div>
                    ))}
                </div>

                {/* Current Page Info */}
                {((pages as any[]) || []).filter(
                  (page: any) => page.key !== "home",
                ).length === 0 ? (
                  <div className="bg-blue-800/30 p-4 rounded border border-blue-600/50 text-center">
                    <div className="flex flex-col items-center space-y-2">
                      <i className="fas fa-plus-circle text-blue-300 text-2xl"></i>
                      <div className="text-sm text-blue-200">
                        <strong>No pages created yet</strong>
                      </div>
                      <div className="text-xs text-blue-300">
                        Click "Add New Page" to create your first custom page
                      </div>
                    </div>
                  </div>
                ) : selectedPageId &&
                  (pages || []).find(
                    (p: any) => p.id === selectedPageId,
                  ) ? (
                  <div className="bg-blue-800/30 p-3 rounded border border-blue-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-paint-brush text-blue-300"></i>
                        <div className="text-sm text-blue-200">
                          <strong>Editing:</strong>{" "}
                          {(pages || []).find(
                            (p: any) => p.id === selectedPageId,
                          )?.label || "Untitled Page"}
                        </div>
                      </div>
                      <div className="text-xs text-blue-300">
                        {getPageElements(selectedPageId).length} elements added
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </>
          )}

          {/* Page Builder - Show based on mode and page selection */}
          {builderMode === "card" && (
            <div className="bg-teal-900/30 border border-teal-600/30 rounded-lg p-4 space-y-4">
              <PageBuilder
                elements={form.watch("pageElements") || []}
                onElementsChange={(elements: PageElement[]) => {
                  form.setValue("pageElements", elements);
                }}
                elementSpacing={elementSpacing ?? 16}
                onElementSpacingChange={(spacing: number) => {
                  form.setValue("elementSpacing", spacing, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                }}
                individualElementSpacing={individualElementSpacing || {}}
                onIndividualSpacingChange={(elementType: string, spacing: number) => {
                  const currentSpacing = individualElementSpacing || {};
                  form.setValue("individualElementSpacing", {
                    ...currentSpacing,
                    [elementType]: spacing
                  }, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                }}
                cardData={enhancedCardData}
                onNavigatePage={setSelectedPageId}
              />
            </div>
          )}

          {builderMode === "page" && (
            <div className="bg-teal-900/30 border border-teal-600/30 rounded-lg p-4 space-y-4">
              {((pages as any[]) || []).filter(
                (page: any) => page.key !== "home",
              ).length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <i className="fas fa-plus-circle text-teal-300 text-4xl"></i>
                    <div className="text-teal-200">
                      <div className="text-lg font-semibold mb-2">
                        No Pages Created Yet
                      </div>
                      <div className="text-sm opacity-75">
                        Create your first page to start adding custom elements
                        and designing your multi-page experience.
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        const newPageId = `page-${Date.now()}`;
                        const currentPages = pages || [];
                        const pageNumber =
                          currentPages.filter((p: any) => p.key !== "home")
                            .length + 1;
                        const newPage = {
                          id: newPageId,
                          key: newPageId,
                          path: `page-${pageNumber}`,
                          label: `Page ${pageNumber}`,
                          visible: true,
                          elements: [],
                        };
                        form.setValue("pages" as any, [
                          ...currentPages,
                          newPage,
                        ]);
                        setSelectedPageId(newPageId);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create Your First Page
                    </Button>
                  </div>
                </div>
              ) : selectedPageId &&
                (pages || []).find(
                  (p: any) => p.id === selectedPageId,
                ) ? (
                <PageBuilder
                  elements={getPageElements(selectedPageId)}
                  onElementsChange={(elements: PageElement[]) => {
                    updatePageElements(selectedPageId, elements);
                  }}
                  elementSpacing={elementSpacing ?? 16}
                  onElementSpacingChange={(spacing: number) => {
                    form.setValue("elementSpacing", spacing, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                  }}
                  individualElementSpacing={individualElementSpacing || {}}
                  onIndividualSpacingChange={(elementType: string, spacing: number) => {
                    const currentSpacing = individualElementSpacing || {};
                    form.setValue("individualElementSpacing", {
                      ...currentSpacing,
                      [elementType]: spacing
                    }, { shouldDirty: true, shouldTouch: true, shouldValidate: false });
                  }}
                  cardData={enhancedCardData}
                  onNavigatePage={setSelectedPageId}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <i className="fas fa-hand-pointer text-teal-300 text-4xl"></i>
                    <div className="text-teal-200">
                      <div className="text-lg font-semibold mb-2">
                        Select a Page to Edit
                      </div>
                      <div className="text-sm opacity-75">
                        Click on any page toggle above to start adding elements
                        and designing that page.
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Auto Save */}
          <div className="flex items-center justify-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center space-x-2 text-slate-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Auto-saving changes...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
