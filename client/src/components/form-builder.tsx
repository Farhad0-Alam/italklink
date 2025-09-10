import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { BusinessCard, businessCardSchema, PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fileToBase64, validateImageFile } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { getAvailableIcons, generateFieldId } from "@/lib/card-data";
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
        <div className="ml-8">
          {children}
        </div>
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
    })
  );

  // Fetch available header templates
  const { data: headerTemplates = [] } = useQuery({
    queryKey: ['/api/admin/header-templates'],
    select: (data: any[]) => data.filter(template => template.isActive),
    refetchOnWindowFocus: false
  });

  const [builderMode, setBuilderMode] = useState<'card' | 'page'>('card');
  const [selectedPageId, setSelectedPageId] = useState<string>('home');
  
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    coverLogo: true,
    basicInfo: true,
    contactInfo: true,
    customization: true,
    appearance: true,
    seo: true,
    pages: false, // Pages section expanded by default
    pageBuilder: true,
    // subsections inside Basic Info
    nameStyling: true,
    titleStyling: true,
    companyStyling: true,
  });

  const form = useForm<BusinessCard>({
    resolver: zodResolver(businessCardSchema),
    defaultValues: cardData,
  });

  // Ensure form values stay in sync with cardData, especially template type
  useEffect(() => {
    form.reset(cardData);
  }, [cardData, form]);

  const toggleSection = (k: string) =>
    setCollapsedSections((p) => ({ ...p, [k]: !p[k] }));

  // Drag end handlers for reordering
  const handleContactDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (active.id !== over?.id) {
      const contacts = form.getValues("customContacts") || [];
      const oldIndex = contacts.findIndex((contact) => contact.id === active.id);
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
  const watchedValues = form.watch();
  const prevDataRef = useRef<string>("");
  
  const memoizedOnDataChange = useCallback(onDataChange, []);

  // Helper function to get elements for a specific page
  const getPageElements = (pageId: string) => {
    const pages = (watchedValues as any).pages || [
      { id: 'home', key: 'home', path: '', label: 'Home', visible: true, elements: [] }
    ];
    const page = pages.find((p: any) => p.id === pageId);
    return page?.elements || [];
  };

  // Add preview mode info to card data without triggering infinite loops
  const enhancedCardData = {
    ...watchedValues,
    currentPreviewMode: builderMode,
    currentSelectedPage: builderMode === 'page' && selectedPageId ? {
      id: selectedPageId,
      label: (((watchedValues as any).pages || []).find((p: any) => p.id === selectedPageId)?.label || 'Page'),
      elements: getPageElements(selectedPageId)
    } : null
  };

  // Helper function to update elements for a specific page
  const updatePageElements = (pageId: string, elements: PageElement[]) => {
    const currentPages = (watchedValues as any).pages || [
      { id: 'home', key: 'home', path: '', label: 'Home', visible: true, elements: [] }
    ];
    
    const updatedPages = currentPages.map((page: any) => 
      page.id === pageId 
        ? { ...page, elements } 
        : page
    );
    
    form.setValue('pages' as any, updatedPages);
  };
  
  useEffect(() => {
    const s = JSON.stringify(enhancedCardData);
    if (s !== prevDataRef.current) {
      prevDataRef.current = s;
      memoizedOnDataChange(enhancedCardData);
    }
  }, [enhancedCardData, memoizedOnDataChange]);

  // Auto-select first page when switching to page mode or when pages change
  useEffect(() => {
    if (builderMode === 'page') {
      const availablePages = ((watchedValues as any).pages as any[]) || [];
      const nonHomePages = availablePages.filter((page: any) => page.key !== 'home');
      
      if (nonHomePages.length > 0 && (!selectedPageId || !nonHomePages.find(p => p.id === selectedPageId))) {
        setSelectedPageId(nonHomePages[0].id);
      }
    }
  }, [builderMode, (watchedValues as any).pages, selectedPageId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    field: "profilePhoto" | "logo" | "backgroundImage" | "ogImage"
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
      toast({ title: "Image uploaded", description: "Your image has been uploaded successfully" });
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
                variant={builderMode === 'card' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBuilderMode('card')}
                className={`${builderMode === 'card' 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-slate-600'
                } transition-all duration-200`}
                data-testid="button-card-mode"
              >
                <i className="fas fa-id-card mr-2"></i>
                Card
              </Button>
              <Button
                type="button"
                variant={builderMode === 'page' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setBuilderMode('page')}
                className={`${builderMode === 'page' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-slate-600'
                } transition-all duration-200`}
                data-testid="button-page-mode"
              >
                <i className="fas fa-sitemap mr-2"></i>
                Page
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Show different content based on builder mode */}
          {builderMode === 'card' && (
            <>

          {/* Cover & Logo */}
          <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("coverLogo")}>
              <h3 className="text-lg font-semibold text-blue-300">Cover & Logo</h3>
              <i className={`fas ${collapsedSections.coverLogo ? "fa-chevron-down" : "fa-chevron-up"} text-blue-300`} />
            </div>

            {!collapsedSections.coverLogo && (
              <>
                <div className="space-y-3">
                  <Label className="text-white">Header Design</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { v: "cover-logo", label: "Cover + Logo", active: watchedValues.headerDesign === "cover-logo" || !watchedValues.headerDesign },
                      { v: "profile-center", label: "Profile Center", active: watchedValues.headerDesign === "profile-center" },
                      { v: "split-design", label: "Split Layout", active: watchedValues.headerDesign === "split-design" },
                      { v: "advanced", label: "Advanced Template", active: watchedValues.advancedHeaderEnabled },
                    ].map(({ v, label, active }) => (
                      <div
                        key={v}
                        className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                          active ? "border-talklink-500 bg-talklink-500/10" : "border-slate-600 bg-slate-700"
                        }`}
                        onClick={() => {
                          if (v === "advanced") {
                            form.setValue("advancedHeaderEnabled", true);
                            form.setValue("headerDesign", "cover-logo"); // Keep a fallback
                          } else {
                            form.setValue("advancedHeaderEnabled", false);
                            form.setValue("headerDesign", v as any);
                          }
                        }}
                      >
                        <div className="text-center">
                          <div className="h-8 bg-gradient-to-r from-slate-400 to-slate-600 rounded mb-1 relative">
                            <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded" />
                          </div>
                          <div className="w-4 h-4 bg-white rounded-full mx-auto -mt-2" />
                          <p className="text-xs text-white mt-1">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Header Template Selection */}
                {watchedValues.advancedHeaderEnabled && (
                  <div className="space-y-3 p-4 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                    <Label className="text-purple-300">Select Header Template</Label>
                    <Select
                      value={watchedValues.headerTemplate?.id || ""}
                      onValueChange={(templateId) => {
                        const selectedTemplate = headerTemplates.find(t => t.id === templateId);
                        if (selectedTemplate) {
                          form.setValue("headerTemplate", selectedTemplate);
                        }
                      }}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Choose a header template..." />
                      </SelectTrigger>
                      <SelectContent>
                        {headerTemplates.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No templates available
                          </SelectItem>
                        ) : (
                          headerTemplates.map((template: any) => (
                            <SelectItem key={template.id} value={template.id}>
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-pink-500"></div>
                                {template.name}
                                <span className="text-xs text-gray-500">({template.category})</span>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    
                    {watchedValues.headerTemplate && (
                      <div className="text-sm text-purple-300">
                        <p><strong>Template:</strong> {(watchedValues.headerTemplate as any).name}</p>
                        <p><strong>Description:</strong> {(watchedValues.headerTemplate as any).description || "Custom header with advanced layouts and SVG shapes"}</p>
                      </div>
                    )}
                    
                    {headerTemplates.length === 0 && (
                      <div className="text-sm text-yellow-300 bg-yellow-900/20 border border-yellow-600/30 rounded p-3">
                        <i className="fas fa-info-circle mr-2"></i>
                        No active header templates found. Contact your administrator to create advanced header templates.
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "profile-photo-input", label: "Profile Photo", field: "profilePhoto" },
                    { id: "background-input", label: "Cover Photo", field: "backgroundImage" },
                    { id: "logo-input", label: "Logo", field: "logo" },
                  ].map(({ id, label, field }) => (
                    <div key={id}>
                      <Label htmlFor={id} className="text-white text-sm">{label}</Label>
                      <div className="mt-1">
                        <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                          {(watchedValues as any)[field] ? (
                            <img src={(watchedValues as any)[field]} alt={label} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-center">
                              <i className="fas fa-image text-slate-400 text-sm" />
                              <p className="text-slate-400 text-xs mt-1">{label.split(" ")[0]}</p>
                            </div>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full text-xs py-1"
                          onClick={() => document.getElementById(id)?.click()}
                          disabled={isUploading}
                        >
                          <i className="fas fa-upload mr-1" /> Upload
                        </Button>
                        <input
                          id={id}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, field as any)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Basic Information (with Name/Title/Company styling subsections) */}
          <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("basicInfo")}>
              <h3 className="text-lg font-semibold text-green-300">{t("form.basicInfo")}</h3>
              <i className={`fas ${collapsedSections.basicInfo ? "fa-chevron-down" : "fa-chevron-up"} text-green-300`} />
            </div>

            {!collapsedSections.basicInfo && (
              <>
                {/* basic fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName" className="text-white">{t("field.fullName")} *</Label>
                    <Input
                      id="fullName"
                      {...form.register("fullName")}
                      placeholder="John Doe"
                      className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                      data-testid="input-full-name"
                    />
                    {form.formState.errors.fullName && <p className="text-red-400 text-sm mt-1">{form.formState.errors.fullName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="title" className="text-white">{t("field.title")} *</Label>
                    <Input
                      id="title"
                      {...form.register("title")}
                      placeholder="Senior Developer"
                      className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                      data-testid="input-title"
                    />
                    {form.formState.errors.title && <p className="text-red-400 text-sm mt-1">{form.formState.errors.title.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="company" className="text-white">{t("field.company")}</Label>
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
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-3 mt-4">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("nameStyling")}>
                    <h5 className="text-xs font-medium text-green-300">Name Styling</h5>
                    <i className={`fas fa-chevron-${collapsedSections.nameStyling ? "down" : "up"} text-green-300 text-xs`} />
                  </div>

                  {!collapsedSections.nameStyling && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-white text-xs">Color</Label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={watchedValues.sectionStyles?.basicInfo?.nameColor || "#ffffff"}
                              onChange={(e) => form.setValue("sectionStyles.basicInfo.nameColor", e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer"
                            />
                            <Input
                              value={watchedValues.sectionStyles?.basicInfo?.nameColor || "#ffffff"}
                              onChange={(e) => form.setValue("sectionStyles.basicInfo.nameColor", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white text-xs"
                              placeholder="#ffffff"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-white text-xs">Font</Label>
                          <Select
                            value={watchedValues.sectionStyles?.basicInfo?.nameFont || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.basicInfo.nameFont", v)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                              <SelectValue placeholder="Choose font" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Source Sans Pro","Nunito","Raleway","Ubuntu","PT Sans",
                                "Merriweather","Playfair Display","Oswald","Libre Baskerville","Crimson Text","Work Sans","Fira Sans","DM Sans","Space Grotesk"
                              ].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white text-xs">Size: {watchedValues.sectionStyles?.basicInfo?.nameFontSize || 24}px</Label>
                          <input
                            type="range"
                            value={watchedValues.sectionStyles?.basicInfo?.nameFontSize || 24}
                            onChange={(e) => form.setValue("sectionStyles.basicInfo.nameFontSize", parseInt(e.target.value))}
                            className="custom-range w-full"
                            min={12}
                            max={48}
                          />
                        </div>

                        <div>
                          <Label className="text-white text-xs">Weight</Label>
                          <Select
                            value={watchedValues.sectionStyles?.basicInfo?.nameFontWeight || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.basicInfo.nameFontWeight", v as any)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                              <SelectValue placeholder="Weight" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                ["300","Light"],["400","Regular"],["500","Medium"],
                                ["600","Semi Bold"],["700","Bold"],["800","Extra Bold"],
                              ].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="nameItalic"
                          checked={watchedValues.sectionStyles?.basicInfo?.nameTextStyle === "italic"}
                          onCheckedChange={(c) => form.setValue("sectionStyles.basicInfo.nameTextStyle", c ? "italic" : "normal")}
                        />
                        <Label htmlFor="nameItalic" className="text-white text-xs">Italic</Label>
                      </div>
                    </>
                  )}
                </div>

                {/* Title Styling */}
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("titleStyling")}>
                    <h5 className="text-xs font-medium text-green-300">Title Styling</h5>
                    <i className={`fas fa-chevron-${collapsedSections.titleStyling ? "down" : "up"} text-green-300 text-xs`} />
                  </div>

                  {!collapsedSections.titleStyling && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-white text-xs">Color</Label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={watchedValues.sectionStyles?.basicInfo?.titleColor || "#4b5563"}
                              onChange={(e) => form.setValue("sectionStyles.basicInfo.titleColor", e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer"
                            />
                            <Input
                              value={watchedValues.sectionStyles?.basicInfo?.titleColor || ""}
                              onChange={(e) => form.setValue("sectionStyles.basicInfo.titleColor", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white text-xs"
                              placeholder="#4b5563"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-white text-xs">Font</Label>
                          <Select
                            value={watchedValues.sectionStyles?.basicInfo?.titleFont || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.basicInfo.titleFont", v)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                              <SelectValue placeholder="Choose font" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Source Sans Pro","Nunito","Raleway","Ubuntu","PT Sans",
                                "Merriweather","Playfair Display","Oswald","Libre Baskerville","Crimson Text","Work Sans","Fira Sans","DM Sans","Space Grotesk"
                              ].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white text-xs">Size: {watchedValues.sectionStyles?.basicInfo?.titleFontSize || 14}px</Label>
                          <input
                            type="range"
                            value={watchedValues.sectionStyles?.basicInfo?.titleFontSize || 14}
                            onChange={(e) => form.setValue("sectionStyles.basicInfo.titleFontSize", parseInt(e.target.value))}
                            className="custom-range w-full"
                            min={10}
                            max={32}
                          />
                        </div>

                        <div>
                          <Label className="text-white text-xs">Weight</Label>
                          <Select
                            value={watchedValues.sectionStyles?.basicInfo?.titleFontWeight || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.basicInfo.titleFontWeight", v as any)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                              <SelectValue placeholder="Weight" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                ["300","Light"],["400","Regular"],["500","Medium"],
                                ["600","Semi Bold"],["700","Bold"],["800","Extra Bold"],
                              ].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="titleItalic"
                          checked={watchedValues.sectionStyles?.basicInfo?.titleTextStyle === "italic"}
                          onCheckedChange={(c) => form.setValue("sectionStyles.basicInfo.titleTextStyle", c ? "italic" : "normal")}
                        />
                        <Label htmlFor="titleItalic" className="text-white text-xs">Italic</Label>
                      </div>
                    </>
                  )}
                </div>

                {/* Company Styling */}
                <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("companyStyling")}>
                    <h5 className="text-xs font-medium text-green-300">Company Styling</h5>
                    <i className={`fas fa-chevron-${collapsedSections.companyStyling ? "down" : "up"} text-green-300 text-xs`} />
                  </div>

                  {!collapsedSections.companyStyling && (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-white text-xs">Color</Label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={watchedValues.sectionStyles?.basicInfo?.companyColor || "#6b7280"}
                              onChange={(e) => form.setValue("sectionStyles.basicInfo.companyColor", e.target.value)}
                              className="w-6 h-6 rounded cursor-pointer"
                            />
                            <Input
                              value={watchedValues.sectionStyles?.basicInfo?.companyColor || ""}
                              onChange={(e) => form.setValue("sectionStyles.basicInfo.companyColor", e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white text-xs"
                              placeholder="#6b7280"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-white text-xs">Font</Label>
                          <Select
                            value={watchedValues.sectionStyles?.basicInfo?.companyFont || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.basicInfo.companyFont", v)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                              <SelectValue placeholder="Choose font" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                "Inter","Roboto","Open Sans","Lato","Montserrat","Poppins","Source Sans Pro","Nunito","Raleway","Ubuntu","PT Sans",
                                "Merriweather","Playfair Display","Oswald","Libre Baskerville","Crimson Text","Work Sans","Fira Sans","DM Sans","Space Grotesk"
                              ].map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white text-xs">Size: {watchedValues.sectionStyles?.basicInfo?.companyFontSize || 14}px</Label>
                          <input
                            type="range"
                            value={watchedValues.sectionStyles?.basicInfo?.companyFontSize || 14}
                            onChange={(e) => form.setValue("sectionStyles.basicInfo.companyFontSize", parseInt(e.target.value))}
                            className="custom-range w-full"
                            min={10}
                            max={32}
                          />
                        </div>

                        <div>
                          <Label className="text-white text-xs">Weight</Label>
                          <Select
                            value={watchedValues.sectionStyles?.basicInfo?.companyFontWeight || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.basicInfo.companyFontWeight", v as any)}
                          >
                            <SelectTrigger className="bg-slate-700 border-slate-600 text-white text-xs">
                              <SelectValue placeholder="Weight" />
                            </SelectTrigger>
                            <SelectContent>
                              {[
                                ["300","Light"],["400","Regular"],["500","Medium"],
                                ["600","Semi Bold"],["700","Bold"],["800","Extra Bold"],
                              ].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="companyItalic"
                          checked={watchedValues.sectionStyles?.basicInfo?.companyTextStyle === "italic"}
                          onCheckedChange={(c) => form.setValue("sectionStyles.basicInfo.companyTextStyle", c ? "italic" : "normal")}
                        />
                        <Label htmlFor="companyItalic" className="text-white text-xs">Italic</Label>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Contact Information */}
          <div
            className="rounded-lg p-4 space-y-4"
            style={{
              backgroundColor: watchedValues.sectionStyles?.contactInfo?.sectionBackgroundColor || "rgba(147, 51, 234, 0.3)",
              borderColor: watchedValues.sectionStyles?.contactInfo?.sectionBorderColor || "rgba(147, 51, 234, 0.6)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("contactInfo")}>
              <h3 className="text-lg font-semibold text-purple-300">{t("form.contactInfo")}</h3>
              <i className={`fas ${collapsedSections.contactInfo ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
            </div>

            {!collapsedSections.contactInfo && (
              <>
                <div className="space-y-4">
                  <h4 className="text-md font-medium text-purple-300">Custom Contact Methods</h4>
                  <DndContext 
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleContactDragEnd}
                  >
                    <SortableContext 
                      items={form.watch("customContacts")?.map(c => c.id) || []}
                      strategy={verticalListSortingStrategy}
                    >
                      {form.watch("customContacts")?.map((contact, index) => (
                        <SortableItem key={contact.id} id={contact.id}>
                          <div className="flex gap-2 items-end bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <div className="flex-1">
                              <Label className="text-white">Label</Label>
                              <Input
                                value={contact.label}
                                onChange={(e) => {
                                  const arr = [...(form.watch("customContacts") || [])];
                                  arr[index] = { ...contact, label: e.target.value };
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
                                  const arr = [...(form.watch("customContacts") || [])];
                                  arr[index] = { ...contact, value: e.target.value };
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
                                  const arr = [...(form.watch("customContacts") || [])];
                                  arr[index] = { ...contact, icon: v };
                                  form.setValue("customContacts", arr);
                                }}
                              >
                                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableIcons()
                                    .filter((icon) => icon.category === "contact")
                                    .map((icon) => (
                                      <SelectItem key={icon.name} value={icon.icon}>
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
                                const arr = form.watch("customContacts")?.filter((_, i) => i !== index) || [];
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
                        const newContact = { id: generateFieldId(), label: "", value: "", type: "custom", icon: "fas fa-link" };
                        form.setValue("customContacts", [...(form.watch("customContacts") || []), newContact]);
                        // Explicitly preserve template type to prevent reverting to schema default
                        form.setValue("template", currentTemplate);
                      }}
                      className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <i className="fas fa-plus mr-2" />
                      Add Custom Contact
                    </Button>
                  </div>

              </>
            )}
          </div>

          {/* Social Media, Appearance, SEO, Page Builder & Auto-save (unchanged beyond earlier fixes) */}
          {/* Social, Appearance, SEO blocks identical to the previous message’s version */}
          {/* For brevity, they are left as-is in this full file you paste above. */}
          {/* --- SOCIAL MEDIA BLOCK START --- */}
          <div
            className="rounded-lg p-4 space-y-4"
            style={{
              backgroundColor: watchedValues.sectionStyles?.socialMedia?.sectionBackgroundColor || "rgba(219, 39, 119, 0.3)",
              borderColor: watchedValues.sectionStyles?.socialMedia?.sectionBorderColor || "rgba(219, 39, 119, 0.6)",
              borderWidth: "1px",
              borderStyle: "solid",
            }}
          >
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("customization")}>
              <h3 className="text-lg font-semibold text-pink-300">{t("form.socialMedia")}</h3>
              <i className={`fas ${collapsedSections.customization ? "fa-chevron-down" : "fa-chevron-up"} text-pink-300`} />
            </div>
            {!collapsedSections.customization && (
              <>
                <div className="space-y-4">
                    <h4 className="text-md font-medium text-talklink-300">Additional Social Platforms</h4>
                    <DndContext 
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleSocialDragEnd}
                    >
                      <SortableContext 
                        items={form.watch("customSocials")?.map(s => s.id) || []}
                        strategy={verticalListSortingStrategy}
                      >
                        {form.watch("customSocials")?.map((social, index) => (
                          <SortableItem key={social.id} id={social.id}>
                            <div className="flex gap-2 items-end bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                              <div className="flex-1">
                                <Label className="text-white">Button Label</Label>
                                <Input
                                  value={social.label}
                                  onChange={(e) => {
                                    const arr = [...(form.watch("customSocials") || [])];
                                    arr[index] = { ...social, label: e.target.value };
                                    form.setValue("customSocials", arr);
                                  }}
                                  className="bg-slate-700 border-slate-600 text-white"
                                  placeholder="Button text"
                                />
                              </div>
                              <div className="flex-1">
                                <Label className="text-white">Username/URL</Label>
                                <Input
                                  value={social.value}
                                  onChange={(e) => {
                                    const arr = [...(form.watch("customSocials") || [])];
                                    arr[index] = { ...social, value: e.target.value };
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
                                    const arr = [...(form.watch("customSocials") || [])];
                                    arr[index] = { ...social, icon: v };
                                    form.setValue("customSocials", arr);
                                  }}
                                >
                                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                                    <SelectValue>{social.icon && <i className={`${social.icon} mr-2`} />}</SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {getAvailableIcons().filter(i => i.category === "social").map(i => (
                                      <SelectItem key={i.icon} value={i.icon}>
                                        <div className="flex items-center"><i className={`${i.icon} mr-2`} />{i.name}</div>
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
                                  const arr = form.watch("customSocials")?.filter((_, i) => i !== index) || [];
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
                        const newSocial = { id: generateFieldId(), label: "Social", value: "", icon: "fab fa-facebook", platform: "" };
                        form.setValue("customSocials", [...(form.watch("customSocials") || []), newSocial]);
                        // Explicitly preserve template type to prevent reverting to schema default
                        form.setValue("template", currentTemplate);
                      }}
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <i className="fas fa-plus mr-2" /> Add Social Platform
                    </Button>
                  </div>

              </>
            )}
          </div>

          {/* Appearance Section */}
          <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("appearance")}>
              <h3 className="text-lg font-semibold text-purple-300">Customize Theme</h3>
              <i className={`fas ${collapsedSections.appearance ? "fa-chevron-down" : "fa-chevron-up"} text-purple-300`} />
            </div>

            {!collapsedSections.appearance && (
              <>
                <div className="space-y-6">
                  {/* Template Selection */}
                  <div>
                    <h4 className="text-md font-medium text-purple-200 mb-3">Template Style</h4>
                    <div>
                      <Label className="text-white text-sm">Template</Label>
                      <Select 
                        value={watchedValues.template || "minimal"} 
                        onValueChange={(v) => form.setValue("template", v as any)}
                      >
                        <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="minimal">Minimal</SelectItem>
                          <SelectItem value="bold">Bold</SelectItem>
                          <SelectItem value="photo">Photo</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Default Colors Section */}
                  <div>
                    <h4 className="text-md font-medium text-purple-200 mb-3">Default Colors</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white text-sm">Primary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            {...form.register("brandColor")}
                            className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                            data-testid="input-primary-color"
                          />
                          <span className="text-xs text-gray-400">{watchedValues.brandColor || "#54C5BC"}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white text-sm">Secondary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            {...form.register("secondaryColor")}
                            className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                            data-testid="input-secondary-color"
                          />
                          <span className="text-xs text-gray-400">{watchedValues.secondaryColor || "#999999"}</span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white text-sm">Tertiary Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            {...form.register("tertiaryColor")}
                            className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                            data-testid="input-tertiary-color"
                          />
                          <span className="text-xs text-gray-400">{watchedValues.tertiaryColor || "#FFFFFF"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Default Gradient Section */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-md font-medium text-purple-200">Default Gradient</h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 text-xs h-6 px-2"
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-sm">Content</Label>
                        <Select 
                          value={watchedValues.backgroundType || "color"} 
                          onValueChange={(v) => form.setValue("backgroundType", v)}
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

                      <div>
                        <Label className="text-white text-sm">Background Color</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <Input
                            type="color"
                            {...form.register("backgroundColor")}
                            className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                            data-testid="input-background-color"
                          />
                          <span className="text-xs text-gray-400">{watchedValues.backgroundColor || "#FFFFFF"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Gradient Colors */}
                    <div className="space-y-2 mt-3">
                      {[
                        { name: "BRAND", color: "#FF69B4", position: 0 },
                        { name: "ACCENT", color: "#FFA500", position: 0 },
                        { name: "#348E5E", color: "#348E5E", position: 100 }
                      ].map((grad, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <Input
                            type="color"
                            defaultValue={grad.color}
                            className="w-8 h-6 p-0 border-0 rounded bg-transparent cursor-pointer"
                          />
                          <span className="text-xs text-white min-w-0 flex-1">{grad.name}</span>
                          <div className="flex items-center gap-1">
                            <input
                              type="range"
                              min="0"
                              max="100"
                              defaultValue={grad.position}
                              className="w-16 h-1 bg-slate-600 rounded-lg appearance-none slider"
                            />
                            <span className="text-xs text-gray-400 w-6">{grad.position}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-6 h-6 p-0 text-orange-400 hover:bg-slate-700"
                          >
                            <i className="fas fa-times text-xs"></i>
                          </Button>
                        </div>
                      ))}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full mt-3 bg-slate-700 border-slate-600 text-white hover:bg-slate-600 h-8 text-xs"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Add New Color
                    </Button>
                  </div>

                  {/* Background Section */}
                  <div>
                    <h4 className="text-md font-medium text-purple-200 mb-3">Background</h4>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white text-sm">Content</Label>
                          <Select 
                            value={watchedValues.backgroundType || "color"} 
                            onValueChange={(v) => form.setValue("backgroundType", v)}
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

                        <div>
                          <Label className="text-white text-sm">Background Color</Label>
                          <div className="flex items-center gap-2 mt-1">
                            <Input
                              type="color"
                              {...form.register("backgroundColor")}
                              className="w-10 h-8 p-0 border-0 rounded bg-transparent cursor-pointer"
                              data-testid="input-background-color"
                            />
                            <span className="text-xs text-gray-400">{watchedValues.backgroundColor || "#FFFFFF"}</span>
                          </div>
                        </div>
                      </div>

                      {watchedValues.backgroundType === "image" && (
                        <div>
                          <Label className="text-white text-sm">Background Image</Label>
                          <div className="flex gap-2">
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "backgroundImage")}
                              disabled={isUploading}
                              className="bg-slate-700 border-slate-600 text-white flex-1"
                              data-testid="input-background-image"
                            />
                            {watchedValues.backgroundImage && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => form.setValue("backgroundImage", "")}
                                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                              >
                                <i className="fas fa-trash" />
                              </Button>
                            )}
                          </div>
                          {watchedValues.backgroundImage && (
                            <div className="mt-2">
                              <img
                                src={watchedValues.backgroundImage}
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
                    <h4 className="text-md font-medium text-purple-200 mb-3">Animations</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white text-sm">Animation Type</Label>
                        <Select 
                          value={watchedValues.animationType || "none"} 
                          onValueChange={(v) => form.setValue("animationType", v)}
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
                        <Label className="text-white text-sm">Duration (ms)</Label>
                        <Input
                          type="number"
                          min="100"
                          max="2000"
                          step="100"
                          {...form.register("animationDuration", { valueAsNumber: true })}
                          className="bg-slate-700 border-slate-600 text-white h-8 text-sm"
                          placeholder="500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Heading Style Section */}
                  <div>
                    <h4 className="text-md font-medium text-purple-200 mb-3">Heading Style</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white text-sm">Font</Label>
                        <Select 
                          value={watchedValues.headingFont || "inter"} 
                          onValueChange={(v) => form.setValue("headingFont", v)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="poppins">Poppins</SelectItem>
                            <SelectItem value="montserrat">Montserrat</SelectItem>
                            <SelectItem value="open-sans">Open Sans</SelectItem>
                            <SelectItem value="lato">Lato</SelectItem>
                            <SelectItem value="nunito">Nunito</SelectItem>
                            <SelectItem value="source-sans-pro">Source Sans Pro</SelectItem>
                            <SelectItem value="raleway">Raleway</SelectItem>
                            <SelectItem value="ubuntu">Ubuntu</SelectItem>
                            <SelectItem value="merriweather">Merriweather</SelectItem>
                            <SelectItem value="oswald">Oswald</SelectItem>
                            <SelectItem value="pt-sans">PT Sans</SelectItem>
                            <SelectItem value="playfair-display">Playfair Display</SelectItem>
                            <SelectItem value="libre-baskerville">Libre Baskerville</SelectItem>
                            <SelectItem value="crimson-text">Crimson Text</SelectItem>
                            <SelectItem value="fira-sans">Fira Sans</SelectItem>
                            <SelectItem value="noto-sans">Noto Sans</SelectItem>
                            <SelectItem value="karla">Karla</SelectItem>
                            <SelectItem value="dm-sans">DM Sans</SelectItem>
                            <SelectItem value="mulish">Mulish</SelectItem>
                            <SelectItem value="rubik">Rubik</SelectItem>
                            <SelectItem value="outfit">Outfit</SelectItem>
                            <SelectItem value="manrope">Manrope</SelectItem>
                            <SelectItem value="space-grotesk">Space Grotesk</SelectItem>
                            <SelectItem value="plus-jakarta-sans">Plus Jakarta Sans</SelectItem>
                            <SelectItem value="lexend">Lexend</SelectItem>
                            <SelectItem value="be-vietnam-pro">Be Vietnam Pro</SelectItem>
                            <SelectItem value="public-sans">Public Sans</SelectItem>
                            <SelectItem value="commissioner">Commissioner</SelectItem>
                            <SelectItem value="epilogue">Epilogue</SelectItem>
                            <SelectItem value="work-sans">Work Sans</SelectItem>
                            <SelectItem value="quicksand">Quicksand</SelectItem>
                            <SelectItem value="red-hat-display">Red Hat Display</SelectItem>
                            <SelectItem value="ibm-plex-sans">IBM Plex Sans</SelectItem>
                            <SelectItem value="figtree">Figtree</SelectItem>
                            <SelectItem value="nunito-sans">Nunito Sans</SelectItem>
                            <SelectItem value="satoshi">Satoshi</SelectItem>
                            <SelectItem value="cabinet-grotesk">Cabinet Grotesk</SelectItem>
                            <SelectItem value="general-sans">General Sans</SelectItem>
                            <SelectItem value="supreme">Supreme</SelectItem>
                            <SelectItem value="gt-walsheim">GT Walsheim</SelectItem>
                            <SelectItem value="circular">Circular</SelectItem>
                            <SelectItem value="avenir-next">Avenir Next</SelectItem>
                            <SelectItem value="helvetica-neue">Helvetica Neue</SelectItem>
                            <SelectItem value="sf-pro">SF Pro</SelectItem>
                            <SelectItem value="system-ui">System UI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white text-sm">Weight</Label>
                        <Select 
                          value={`${watchedValues.headingFontWeight || 600}`} 
                          onValueChange={(v) => form.setValue("headingFontWeight", parseInt(v))}
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
                            value={watchedValues.headingFontSize || 24}
                            onChange={(e) => form.setValue("headingFontSize", parseInt(e.target.value))}
                            className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none slider"
                          />
                          <span className="text-xs text-gray-400 w-6">{watchedValues.headingFontSize || 24}</span>
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
                          <span className="text-xs text-gray-400">{watchedValues.headingColor || "#000000"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Paragraph Style Section */}
                  <div>
                    <h4 className="text-md font-medium text-purple-200 mb-3">Paragraph Style</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-white text-sm">Font</Label>
                        <Select 
                          value={watchedValues.paragraphFont || "inter"} 
                          onValueChange={(v) => form.setValue("paragraphFont", v)}
                        >
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white h-8 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            <SelectItem value="inter">Inter</SelectItem>
                            <SelectItem value="roboto">Roboto</SelectItem>
                            <SelectItem value="poppins">Poppins</SelectItem>
                            <SelectItem value="montserrat">Montserrat</SelectItem>
                            <SelectItem value="open-sans">Open Sans</SelectItem>
                            <SelectItem value="lato">Lato</SelectItem>
                            <SelectItem value="nunito">Nunito</SelectItem>
                            <SelectItem value="source-sans-pro">Source Sans Pro</SelectItem>
                            <SelectItem value="raleway">Raleway</SelectItem>
                            <SelectItem value="ubuntu">Ubuntu</SelectItem>
                            <SelectItem value="merriweather">Merriweather</SelectItem>
                            <SelectItem value="oswald">Oswald</SelectItem>
                            <SelectItem value="pt-sans">PT Sans</SelectItem>
                            <SelectItem value="playfair-display">Playfair Display</SelectItem>
                            <SelectItem value="libre-baskerville">Libre Baskerville</SelectItem>
                            <SelectItem value="crimson-text">Crimson Text</SelectItem>
                            <SelectItem value="fira-sans">Fira Sans</SelectItem>
                            <SelectItem value="noto-sans">Noto Sans</SelectItem>
                            <SelectItem value="karla">Karla</SelectItem>
                            <SelectItem value="dm-sans">DM Sans</SelectItem>
                            <SelectItem value="mulish">Mulish</SelectItem>
                            <SelectItem value="rubik">Rubik</SelectItem>
                            <SelectItem value="outfit">Outfit</SelectItem>
                            <SelectItem value="manrope">Manrope</SelectItem>
                            <SelectItem value="space-grotesk">Space Grotesk</SelectItem>
                            <SelectItem value="plus-jakarta-sans">Plus Jakarta Sans</SelectItem>
                            <SelectItem value="lexend">Lexend</SelectItem>
                            <SelectItem value="be-vietnam-pro">Be Vietnam Pro</SelectItem>
                            <SelectItem value="public-sans">Public Sans</SelectItem>
                            <SelectItem value="commissioner">Commissioner</SelectItem>
                            <SelectItem value="epilogue">Epilogue</SelectItem>
                            <SelectItem value="work-sans">Work Sans</SelectItem>
                            <SelectItem value="quicksand">Quicksand</SelectItem>
                            <SelectItem value="red-hat-display">Red Hat Display</SelectItem>
                            <SelectItem value="ibm-plex-sans">IBM Plex Sans</SelectItem>
                            <SelectItem value="figtree">Figtree</SelectItem>
                            <SelectItem value="nunito-sans">Nunito Sans</SelectItem>
                            <SelectItem value="satoshi">Satoshi</SelectItem>
                            <SelectItem value="cabinet-grotesk">Cabinet Grotesk</SelectItem>
                            <SelectItem value="general-sans">General Sans</SelectItem>
                            <SelectItem value="supreme">Supreme</SelectItem>
                            <SelectItem value="gt-walsheim">GT Walsheim</SelectItem>
                            <SelectItem value="circular">Circular</SelectItem>
                            <SelectItem value="avenir-next">Avenir Next</SelectItem>
                            <SelectItem value="helvetica-neue">Helvetica Neue</SelectItem>
                            <SelectItem value="sf-pro">SF Pro</SelectItem>
                            <SelectItem value="system-ui">System UI</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white text-sm">Weight</Label>
                        <Select 
                          value={`${watchedValues.paragraphFontWeight || 400}`} 
                          onValueChange={(v) => form.setValue("paragraphFontWeight", parseInt(v))}
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
                            value={watchedValues.paragraphFontSize || 14}
                            onChange={(e) => form.setValue("paragraphFontSize", parseInt(e.target.value))}
                            className="flex-1 h-1 bg-slate-600 rounded-lg appearance-none slider"
                          />
                          <span className="text-xs text-gray-400 w-6">{watchedValues.paragraphFontSize || 14}</span>
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
                          <span className="text-xs text-gray-400">{watchedValues.paragraphColor || "#000000"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>

          {/* SEO Settings Section */}
          <div className="bg-orange-900/30 border border-orange-600/30 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleSection("seo")}>
              <h3 className="text-lg font-semibold text-orange-300">SEO & Meta Settings</h3>
              <i className={`fas ${collapsedSections.seo ? "fa-chevron-down" : "fa-chevron-up"} text-orange-300`} />
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
                    <p className="text-xs text-gray-400 mt-1">Recommended: 50-60 characters</p>
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
                    <p className="text-xs text-gray-400 mt-1">Recommended: 150-160 characters</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-white">Keywords</Label>
                      <Input
                        {...form.register("keywords")}
                        placeholder="digital business card, contact, professional"
                        className="bg-slate-700 border-slate-600 text-white"
                        data-testid="input-keywords"
                      />
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
                      {watchedValues.ogImage && (
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
                    {watchedValues.ogImage && (
                      <div className="mt-2">
                        <img
                          src={watchedValues.ogImage}
                          alt="OG Preview"
                          className="w-full max-w-xs h-auto rounded border border-slate-600"
                        />
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">Recommended: 1200x630px for social media sharing</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noIndex"
                        checked={watchedValues.noIndex || false}
                        onCheckedChange={(checked) => form.setValue("noIndex", !!checked)}
                        className="border-slate-600"
                      />
                      <Label htmlFor="noIndex" className="text-white text-sm">
                        No Index (Hide from search engines)
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="noFollow"
                        checked={watchedValues.noFollow || false}
                        onCheckedChange={(checked) => form.setValue("noFollow", !!checked)}
                        className="border-slate-600"
                      />
                      <Label htmlFor="noFollow" className="text-white text-sm">
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
          {builderMode === 'page' && (
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
                      const currentPages = (watchedValues as any).pages || [];
                      const pageNumber = currentPages.filter((p: any) => p.key !== 'home').length + 1;
                      const newPage = {
                        id: newPageId,
                        key: newPageId,
                        path: `page-${pageNumber}`,
                        label: `Page ${pageNumber}`,
                        visible: true,
                        elements: []
                      };
                      form.setValue('pages' as any, [...currentPages, newPage]);
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
                  {(((watchedValues as any).pages as any[]) || []).filter((page: any) => page.key !== 'home').map((page: any, index: number) => (
                    <div key={page.id} className="relative group">
                      <div 
                        className={`${
                          selectedPageId === page.id 
                            ? 'bg-blue-600 border-blue-500' 
                            : 'bg-slate-700 border-slate-600 hover:bg-slate-600'
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
                            const currentPages = (watchedValues as any).pages as any[] || [];
                            const updatedPages = currentPages.map((p: any) => 
                              p.id === page.id ? { ...p, label: e.target.value } : p
                            );
                            form.setValue('pages' as any, updatedPages);
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
                          const currentPages = (watchedValues as any).pages as any[] || [];
                          const updatedPages = currentPages.filter(p => p.id !== page.id);
                          form.setValue('pages' as any, updatedPages);
                          // Switch to first available page if deleting current page
                          if (selectedPageId === page.id) {
                            const remainingPages = updatedPages.filter((p: any) => p.key !== 'home');
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
                {(((watchedValues as any).pages as any[]) || []).filter((page: any) => page.key !== 'home').length === 0 ? (
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
                ) : selectedPageId && (((watchedValues as any).pages || []).find((p: any) => p.id === selectedPageId)) ? (
                  <div className="bg-blue-800/30 p-3 rounded border border-blue-600/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-paint-brush text-blue-300"></i>
                        <div className="text-sm text-blue-200">
                          <strong>Editing:</strong> {
                            (((watchedValues as any).pages || []).find((p: any) => p.id === selectedPageId)?.label || 'Untitled Page')
                          }
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
          {builderMode === 'card' && (
            <div className="bg-teal-900/30 border border-teal-600/30 rounded-lg p-4 space-y-4">
              <PageBuilder
                elements={form.watch("pageElements") || []}
                onElementsChange={(elements: PageElement[]) => {
                  form.setValue("pageElements", elements);
                }}
                cardData={watchedValues}
                onNavigatePage={setSelectedPageId}
              />
            </div>
          )}

          {builderMode === 'page' && (
            <div className="bg-teal-900/30 border border-teal-600/30 rounded-lg p-4 space-y-4">
              {(((watchedValues as any).pages as any[]) || []).filter((page: any) => page.key !== 'home').length === 0 ? (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <i className="fas fa-plus-circle text-teal-300 text-4xl"></i>
                    <div className="text-teal-200">
                      <div className="text-lg font-semibold mb-2">No Pages Created Yet</div>
                      <div className="text-sm opacity-75">
                        Create your first page to start adding custom elements and designing your multi-page experience.
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        const newPageId = `page-${Date.now()}`;
                        const currentPages = (watchedValues as any).pages || [];
                        const pageNumber = currentPages.filter((p: any) => p.key !== 'home').length + 1;
                        const newPage = {
                          id: newPageId,
                          key: newPageId,
                          path: `page-${pageNumber}`,
                          label: `Page ${pageNumber}`,
                          visible: true,
                          elements: []
                        };
                        form.setValue('pages' as any, [...currentPages, newPage]);
                        setSelectedPageId(newPageId);
                      }}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      <i className="fas fa-plus mr-2"></i>
                      Create Your First Page
                    </Button>
                  </div>
                </div>
              ) : selectedPageId && (((watchedValues as any).pages || []).find((p: any) => p.id === selectedPageId)) ? (
                <PageBuilder
                  elements={getPageElements(selectedPageId)}
                  onElementsChange={(elements: PageElement[]) => {
                    updatePageElements(selectedPageId, elements);
                  }}
                  cardData={enhancedCardData}
                  onNavigatePage={setSelectedPageId}
                />
              ) : (
                <div className="text-center py-8">
                  <div className="flex flex-col items-center space-y-4">
                    <i className="fas fa-hand-pointer text-teal-300 text-4xl"></i>
                    <div className="text-teal-200">
                      <div className="text-lg font-semibold mb-2">Select a Page to Edit</div>
                      <div className="text-sm opacity-75">
                        Click on any page toggle above to start adding elements and designing that page.
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
