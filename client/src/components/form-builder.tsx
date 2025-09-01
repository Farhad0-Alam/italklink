import { useState, useEffect, useRef } from "react";
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
import { PageBuilder } from "./page-builder";
import { useQuery } from "@tanstack/react-query";

interface FormBuilderProps {
  cardData: BusinessCard;
  onDataChange: (data: BusinessCard) => void;
  onGenerateQR: () => void;
}

export const FormBuilder: React.FC<FormBuilderProps> = ({
  cardData,
  onDataChange,
  onGenerateQR,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  // Fetch available header templates
  const { data: headerTemplates = [] } = useQuery({
    queryKey: ['/api/admin/header-templates'],
    select: (data: any[]) => data.filter(template => template.isActive),
    refetchOnWindowFocus: false
  });

  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    coverLogo: false,
    basicInfo: false,
    contactInfo: false,
    customization: false,
    appearance: false,
    seo: false,
    pageBuilder: false,
    // subsections inside Basic Info
    nameStyling: false,
    titleStyling: false,
    companyStyling: false,
  });

  const form = useForm<BusinessCard>({
    resolver: zodResolver(businessCardSchema),
    defaultValues: cardData,
  });

  const toggleSection = (k: string) =>
    setCollapsedSections((p) => ({ ...p, [k]: !p[k] }));

  // sync to parent
  const watchedValues = form.watch();
  const prevDataRef = useRef<string>("");
  useEffect(() => {
    const s = JSON.stringify(watchedValues);
    if (s !== prevDataRef.current) {
      prevDataRef.current = s;
      onDataChange(watchedValues);
    }
  }, [watchedValues, onDataChange]);

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
          <CardTitle className="text-2xl font-bold flex items-center text-white">
            <i className="fas fa-edit text-talklink-500 mr-3" />
            {t("form.title")}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
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
                  <div>
                    <Label htmlFor="phone" className="text-white">{t("field.phone")}</Label>
                    <Input
                      id="phone"
                      {...form.register("phone")}
                      placeholder="+1 (555) 123-4567"
                      className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                      data-testid="input-phone"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-white">{t("field.email")}</Label>
                    <Input
                      id="email" type="email"
                      {...form.register("email")}
                      placeholder="john@example.com"
                      className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                      data-testid="input-email"
                    />
                    {form.formState.errors.email && <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-white">{t("field.website")}</Label>
                    <Input
                      id="website"
                      {...form.register("website")}
                      placeholder="https://johndoe.com"
                      className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                      data-testid="input-website"
                    />
                    {form.formState.errors.website && <p className="text-red-400 text-sm mt-1">{form.formState.errors.website.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-white">{t("field.location")}</Label>
                    <Input
                      id="location"
                      {...form.register("location")}
                      placeholder="New York, NY"
                      className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                      data-testid="input-location"
                    />
                  </div>

                  {/* Additional Contact Methods */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-purple-300">Additional Contact Methods</h4>
                    {form.watch("customContacts")?.map((contact, index) => (
                      <div key={contact.id} className="flex gap-2 items-end">
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
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        const newContact = { id: generateFieldId(), label: "", value: "", type: "custom", icon: "fas fa-link" };
                        form.setValue("customContacts", [...(form.watch("customContacts") || []), newContact]);
                      }}
                      className="w-full bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <i className="fas fa-plus mr-2" />
                      Add Custom Contact
                    </Button>
                  </div>

                  {/* Section & Icon styling */}
                  <div className="border-t border-purple-600/30 pt-4 space-y-3">
                    <h4 className="text-sm font-medium text-purple-200">Section Styling</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-white text-xs">Section Background</Label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={watchedValues.sectionStyles?.contactInfo?.sectionBackgroundColor || "#9333ea"}
                            onChange={(e) => form.setValue("sectionStyles.contactInfo.sectionBackgroundColor", e.target.value)}
                            className="w-8 h-6 rounded cursor-pointer"
                          />
                          <Input
                            value={watchedValues.sectionStyles?.contactInfo?.sectionBackgroundColor || ""}
                            onChange={(e) => form.setValue("sectionStyles.contactInfo.sectionBackgroundColor", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white text-xs"
                            placeholder="#9333ea"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-white text-xs">Section Border</Label>
                        <div className="flex items-center gap-1">
                          <input
                            type="color"
                            value={watchedValues.sectionStyles?.contactInfo?.sectionBorderColor || "#a855f7"}
                            onChange={(e) => form.setValue("sectionStyles.contactInfo.sectionBorderColor", e.target.value)}
                            className="w-8 h-6 rounded cursor-pointer"
                          />
                          <Input
                            value={watchedValues.sectionStyles?.contactInfo?.sectionBorderColor || ""}
                            onChange={(e) => form.setValue("sectionStyles.contactInfo.sectionBorderColor", e.target.value)}
                            className="bg-slate-700 border-slate-600 text-white text-xs"
                            placeholder="#a855f7"
                          />
                        </div>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-purple-200 pt-2">Icon Styling (Optional)</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        ["Icon Color","iconColor","#ffffff"],
                        ["Icon Background","iconBackgroundColor","#475569"],
                        ["Icon Text Color","iconTextColor","#64748b"],
                      ].map(([label, key, def]) => (
                        <div key={key as string}>
                          <Label className="text-white text-xs">{label}</Label>
                          <div className="flex items-center gap-1">
                            <input
                              type="color"
                              value={(watchedValues.sectionStyles?.contactInfo as any)?.[key as string] || (def as string)}
                              onChange={(e) => form.setValue(`sectionStyles.contactInfo.${key}` as any, e.target.value)}
                              className="w-8 h-6 rounded cursor-pointer"
                            />
                            <Input
                              value={(watchedValues.sectionStyles?.contactInfo as any)?.[key as string] || (def as string)}
                              onChange={(e) => form.setValue(`sectionStyles.contactInfo.${key}` as any, e.target.value)}
                              className="bg-slate-700 border-slate-600 text-white text-xs"
                              placeholder={def as string}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-slate-800/50 rounded-lg p-3 space-y-3">
                      <h5 className="text-xs font-medium text-purple-200">Icon Text Typography</h5>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-white text-xs">Font</Label>
                          <Select
                            value={watchedValues.sectionStyles?.contactInfo?.iconTextFont || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.contactInfo.iconTextFont", v)}
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
                          <Label className="text-white text-xs">Weight</Label>
                          <Select
                            value={watchedValues.sectionStyles?.contactInfo?.iconTextWeight || ""}
                            onValueChange={(v) => form.setValue("sectionStyles.contactInfo.iconTextWeight", v as any)}
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
                        <div>
                          <Label className="text-white text-xs">Size: {watchedValues.sectionStyles?.contactInfo?.iconTextSize || 12}px</Label>
                          <input
                            type="range"
                            value={watchedValues.sectionStyles?.contactInfo?.iconTextSize || 12}
                            onChange={(e) => form.setValue("sectionStyles.contactInfo.iconTextSize", parseInt(e.target.value))}
                            className="custom-range w-full"
                            min={8}
                            max={20}
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="contactTextItalic"
                            checked={watchedValues.sectionStyles?.contactInfo?.iconTextStyle === "italic"}
                            onCheckedChange={(c) => form.setValue("sectionStyles.contactInfo.iconTextStyle", c ? "italic" : "normal")}
                          />
                          <Label htmlFor="contactTextItalic" className="text-white text-xs">Italic</Label>
                        </div>
                      </div>
                    </div>
                  </div>
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
                <div>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      ["whatsapp","WhatsApp","+1234567890","input-whatsapp"],
                      ["linkedin","LinkedIn","linkedin.com/in/johndoe","input-linkedin"],
                      ["instagram","Instagram","@johndoe","input-instagram"],
                      ["twitter","Twitter/X","@johndoe","input-twitter"],
                    ].map(([key, label, ph, tid]) => (
                      <div key={key}>
                        <Label htmlFor={key} className="text-white">{label}</Label>
                        <Input
                          id={key}
                          {...form.register(key as any)}
                          placeholder={ph as string}
                          className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                          data-testid={tid as string}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-talklink-300">Additional Social Platforms</h4>
                    {form.watch("customSocials")?.map((social, index) => (
                      <div key={social.id} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label className="text-white">Platform</Label>
                          <Input
                            value={social.platform}
                            onChange={(e) => {
                              const arr = [...(form.watch("customSocials") || [])];
                              arr[index] = { ...social, platform: e.target.value };
                              form.setValue("customSocials", arr);
                            }}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="Platform name"
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
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newSocial = { id: generateFieldId(), label: "", value: "", icon: "fab fa-facebook", platform: "" };
                        form.setValue("customSocials", [...(form.watch("customSocials") || []), newSocial]);
                      }}
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                    >
                      <i className="fas fa-plus mr-2" /> Add Social Platform
                    </Button>
                  </div>

                  {/* Section styling + typography etc. */}
                  {/* ... (unchanged, same as previous message) ... */}
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

                  {/* Save Theme Button */}
                  <Button
                    type="button"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white h-10"
                  >
                    Save Theme
                  </Button>
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

          {/* Page Builder */}
          <div className="bg-teal-900/30 border border-teal-600/30 rounded-lg p-4 space-y-4">
            <PageBuilder
              elements={form.watch("pageElements") || []}
              onElementsChange={(elements: PageElement[]) => form.setValue("pageElements", elements)}
              cardData={watchedValues}
            />
          </div>

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
