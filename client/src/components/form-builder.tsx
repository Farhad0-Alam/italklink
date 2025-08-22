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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storage, fileToBase64, validateImageFile } from "@/lib/storage";
import { useToast } from "@/hooks/use-toast";
import { logEvent } from "@/lib/share";
import { getAvailableIcons, generateFieldId } from "@/lib/card-data";
import { PageBuilder } from "./page-builder";

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
  const [collapsedSections, setCollapsedSections] = useState<{[key: string]: boolean}>({
    coverLogo: false,
    basicInfo: false,
    contactInfo: false,
    socialMedia: false,
    customization: false,
    appearance: false,
    seo: false,
    pageBuilder: false
  });

  const form = useForm<BusinessCard>({
    resolver: zodResolver(businessCardSchema),
    defaultValues: cardData,
  });

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  // Update parent when form values change, but only when actually different
  const watchedValues = form.watch();
  const prevDataRef = useRef<string>("");
  
  useEffect(() => {
    const currentData = JSON.stringify(watchedValues);
    
    if (currentData !== prevDataRef.current) {
      prevDataRef.current = currentData;
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
      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
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
            <i className="fas fa-edit text-talklink-500 mr-3"></i>
            {t('form.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cover & Logo Upload */}
          <div className="bg-blue-900/30 border border-blue-600/30 rounded-lg p-4 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('coverLogo')}
            >
              <h3 className="text-lg font-semibold text-blue-300">Cover & Logo</h3>
              <i className={`fas ${collapsedSections.coverLogo ? 'fa-chevron-down' : 'fa-chevron-up'} text-blue-300`}></i>
            </div>
            {!collapsedSections.coverLogo && (
            <div>
            {/* Header Design Options */}
            <div className="space-y-3">
              <Label className="text-white">Header Design</Label>
              <div className="grid grid-cols-3 gap-3">
                <div 
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                    watchedValues.headerDesign === 'cover-logo' || !watchedValues.headerDesign 
                      ? 'border-talklink-500 bg-talklink-500/10' 
                      : 'border-slate-600 bg-slate-700'
                  }`}
                  onClick={() => form.setValue('headerDesign', 'cover-logo')}
                >
                  <div className="text-center">
                    <div className="h-8 bg-gradient-to-r from-green-400 to-green-600 rounded mb-1 relative">
                      <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded"></div>
                    </div>
                    <div className="w-4 h-4 bg-white rounded-full mx-auto -mt-2 border border-green-400"></div>
                    <p className="text-xs text-white mt-1">Cover + Logo</p>
                  </div>
                </div>
                
                <div 
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                    watchedValues.headerDesign === 'profile-center' 
                      ? 'border-talklink-500 bg-talklink-500/10' 
                      : 'border-slate-600 bg-slate-700'
                  }`}
                  onClick={() => form.setValue('headerDesign', 'profile-center')}
                >
                  <div className="text-center">
                    <div className="h-8 bg-gradient-to-r from-blue-400 to-blue-600 rounded mb-1"></div>
                    <div className="w-4 h-4 bg-white rounded-full mx-auto -mt-2"></div>
                    <p className="text-xs text-white mt-1">Profile Center</p>
                  </div>
                </div>
                
                <div 
                  className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
                    watchedValues.headerDesign === 'split-design' 
                      ? 'border-talklink-500 bg-talklink-500/10' 
                      : 'border-slate-600 bg-slate-700'
                  }`}
                  onClick={() => form.setValue('headerDesign', 'split-design')}
                >
                  <div className="text-center">
                    <div className="h-8 bg-gradient-to-r from-purple-400 to-purple-600 rounded mb-1 flex">
                      <div className="flex-1"></div>
                      <div className="w-2 bg-white rounded-full my-auto mr-1"></div>
                    </div>
                    <div className="w-4 h-4 bg-white rounded-full mx-auto -mt-2"></div>
                    <p className="text-xs text-white mt-1">Split Layout</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="profilePhoto" className="text-white text-sm">Profile Photo</Label>
                <div className="mt-1">
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                    {watchedValues.profilePhoto ? (
                      <img 
                        src={watchedValues.profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-user text-slate-400 text-sm"></i>
                        <p className="text-slate-400 text-xs mt-1">Profile</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full text-xs py-1"
                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                    disabled={isUploading}
                  >
                    <i className="fas fa-upload mr-1"></i>
                    Upload
                  </Button>
                  <input
                    id="profile-photo-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'profilePhoto')}
                    className="hidden"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="backgroundImage" className="text-white text-sm">Cover Photo</Label>
                <div className="mt-1">
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                    {watchedValues.backgroundImage ? (
                      <img 
                        src={watchedValues.backgroundImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-image text-slate-400 text-sm"></i>
                        <p className="text-slate-400 text-xs mt-1">Cover</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full text-xs py-1"
                    onClick={() => document.getElementById('background-input')?.click()}
                    disabled={isUploading}
                  >
                    <i className="fas fa-upload mr-1"></i>
                    Upload
                  </Button>
                  <input
                    id="background-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="logo" className="text-white text-sm">Logo</Label>
                <div className="mt-1">
                  <div className="w-full h-20 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                    {watchedValues.logo ? (
                      <img 
                        src={watchedValues.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-image text-slate-400 text-sm"></i>
                        <p className="text-slate-400 text-xs mt-1">Logo</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full text-xs py-1"
                    onClick={() => document.getElementById('logo-input')?.click()}
                    disabled={isUploading}
                  >
                    <i className="fas fa-upload mr-1"></i>
                    Upload
                  </Button>
                  <input
                    id="logo-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
            </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="bg-green-900/30 border border-green-600/30 rounded-lg p-4 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('basicInfo')}
            >
              <h3 className="text-lg font-semibold text-green-300">{t('form.basicInfo')}</h3>
              <i className={`fas ${collapsedSections.basicInfo ? 'fa-chevron-down' : 'fa-chevron-up'} text-green-300`}></i>
            </div>
            {!collapsedSections.basicInfo && (
            <div>
            
            <div>
              <Label htmlFor="fullName" className="text-white">{t('field.fullName')} *</Label>
              <Input
                id="fullName"
                {...form.register("fullName")}
                placeholder="John Doe"
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="input-full-name"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.fullName.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="title" className="text-white">{t('field.title')} *</Label>
              <Input
                id="title"
                {...form.register("title")}
                placeholder="Senior Developer"
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="input-title"
              />
              {form.formState.errors.title && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="company" className="text-white">{t('field.company')}</Label>
              <Input
                id="company"
                {...form.register("company")}
                placeholder="Tech Corp"
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="input-company"
              />
            </div>

            <div>
              <Label htmlFor="about" className="text-white">{t('field.about')}</Label>
              <Textarea
                id="about"
                {...form.register("about")}
                placeholder="Brief description..."
                rows={3}
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="textarea-about"
              />
            </div>
            
            {/* Basic Info Section Styling */}
            <div className="border-t border-green-600/30 pt-4 space-y-3">
              <h4 className="text-sm font-medium text-green-200">Text Colors (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white text-xs">Name Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.basicInfo?.nameColor || "#1f2937"}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.nameColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.basicInfo?.nameColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.nameColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#1f2937"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-xs">Title Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.basicInfo?.titleColor || "#4b5563"}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.titleColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.basicInfo?.titleColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.titleColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#4b5563"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-xs">Company Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.basicInfo?.companyColor || "#6b7280"}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.companyColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.basicInfo?.companyColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.companyColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#6b7280"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-xs">About Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.basicInfo?.aboutColor || "#4b5563"}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.aboutColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.basicInfo?.aboutColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.basicInfo.aboutColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#4b5563"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="bg-purple-900/30 border border-purple-600/30 rounded-lg p-4 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('contactInfo')}
            >
              <h3 className="text-lg font-semibold text-purple-300">{t('form.contactInfo')}</h3>
              <i className={`fas ${collapsedSections.contactInfo ? 'fa-chevron-down' : 'fa-chevron-up'} text-purple-300`}></i>
            </div>
            {!collapsedSections.contactInfo && (
            <div>
            
            <div>
              <Label htmlFor="phone" className="text-white">{t('field.phone')}</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="+1 (555) 123-4567"
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="input-phone"
              />
            </div>

            <div>
              <Label htmlFor="email" className="text-white">{t('field.email')}</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                placeholder="john@example.com"
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="input-email"
              />
              {form.formState.errors.email && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="website" className="text-white">{t('field.website')}</Label>
              <Input
                id="website"
                {...form.register("website")}
                placeholder="https://johndoe.com"
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="input-website"
              />
              {form.formState.errors.website && (
                <p className="text-red-400 text-sm mt-1">{form.formState.errors.website.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="location" className="text-white">{t('field.location')}</Label>
              <Input
                id="location"
                {...form.register("location")}
                placeholder="New York, NY"
                className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                data-testid="input-location"
              />
            </div>
            
            {/* Contact Info Section Styling */}
            <div className="border-t border-purple-600/30 pt-4 space-y-3">
              <h4 className="text-sm font-medium text-purple-200">Icon Styling (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white text-xs">Icon Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.contactInfo?.iconColor || "#ffffff"}
                      onChange={(e) => form.setValue('sectionStyles.contactInfo.iconColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.contactInfo?.iconColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.contactInfo.iconColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-xs">Icon Background</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.contactInfo?.iconBackgroundColor || "#475569"}
                      onChange={(e) => form.setValue('sectionStyles.contactInfo.iconBackgroundColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.contactInfo?.iconBackgroundColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.contactInfo.iconBackgroundColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#475569"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-xs">Icon Text Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.contactInfo?.iconTextColor || "#64748b"}
                      onChange={(e) => form.setValue('sectionStyles.contactInfo.iconTextColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.contactInfo?.iconTextColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.contactInfo.iconTextColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
            </div>
            </div>
            )}
          </div>

          {/* Contact Information Additional */}
          <div className="bg-orange-900/30 border border-orange-600/30 rounded-lg p-4 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('socialMedia')}
            >
              <h4 className="text-md font-medium text-orange-300">Additional Contact Methods</h4>
              <i className={`fas ${collapsedSections.socialMedia ? 'fa-chevron-down' : 'fa-chevron-up'} text-orange-300`}></i>
            </div>
            {!collapsedSections.socialMedia && (
            <div>
            {form.watch("customContacts")?.map((contact, index) => (
              <div key={contact.id} className="flex gap-2 items-end">
                <div className="flex-1">
                  <Label className="text-white">Label</Label>
                  <Input
                    value={contact.label}
                    onChange={(e) => {
                      const newContacts = [...(form.watch("customContacts") || [])];
                      newContacts[index] = { ...contact, label: e.target.value };
                      form.setValue("customContacts", newContacts);
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
                      const newContacts = [...(form.watch("customContacts") || [])];
                      newContacts[index] = { ...contact, value: e.target.value };
                      form.setValue("customContacts", newContacts);
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="Contact value"
                  />
                </div>
                <div className="w-32">
                  <Label className="text-white">Icon</Label>
                  <Select
                    value={contact.icon}
                    onValueChange={(value) => {
                      const newContacts = [...(form.watch("customContacts") || [])];
                      const selectedIcon = getAvailableIcons().find(icon => icon.icon === value);
                      newContacts[index] = { 
                        ...contact, 
                        icon: value,
                        type: selectedIcon?.category === 'contact' ? 
                          (selectedIcon.name.toLowerCase().includes('phone') ? 'phone' as const : 
                           selectedIcon.name.toLowerCase().includes('email') ? 'email' as const : 
                           selectedIcon.name.toLowerCase().includes('website') ? 'website' as const : 'other' as const) : 'other' as const
                      };
                      form.setValue("customContacts", newContacts);
                    }}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue>
                        {contact.icon && <i className={`${contact.icon} mr-2`}></i>}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {getAvailableIcons().filter(icon => icon.category === 'contact').map(icon => (
                        <SelectItem key={icon.icon} value={icon.icon}>
                          <div className="flex items-center">
                            <i className={`${icon.icon} mr-2`}></i>
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
                    const newContacts = form.watch("customContacts")?.filter((_, i) => i !== index) || [];
                    form.setValue("customContacts", newContacts);
                  }}
                  className="mb-0"
                >
                  <i className="fas fa-trash text-xs"></i>
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const newContact = {
                  id: generateFieldId(),
                  label: "",
                  value: "",
                  icon: "fas fa-phone",
                  type: "other" as const
                };
                const currentContacts = form.watch("customContacts") || [];
                form.setValue("customContacts", [...currentContacts, newContact]);
              }}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <i className="fas fa-plus mr-2"></i>
              Add Contact Method
            </Button>
            </div>
            )}
          </div>

          {/* Social Media */}
          <div className="bg-pink-900/30 border border-pink-600/30 rounded-lg p-4 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('customization')}
            >
              <h3 className="text-lg font-semibold text-pink-300">{t('form.socialMedia')}</h3>
              <i className={`fas ${collapsedSections.customization ? 'fa-chevron-down' : 'fa-chevron-up'} text-pink-300`}></i>
            </div>
            {!collapsedSections.customization && (
            <div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="whatsapp" className="text-white">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  {...form.register("whatsapp")}
                  placeholder="+1234567890"
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="input-whatsapp"
                />
              </div>

              <div>
                <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                <Input
                  id="linkedin"
                  {...form.register("linkedin")}
                  placeholder="linkedin.com/in/johndoe"
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="input-linkedin"
                />
              </div>

              <div>
                <Label htmlFor="instagram" className="text-white">Instagram</Label>
                <Input
                  id="instagram"
                  {...form.register("instagram")}
                  placeholder="@johndoe"
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="input-instagram"
                />
              </div>

              <div>
                <Label htmlFor="twitter" className="text-white">Twitter/X</Label>
                <Input
                  id="twitter"
                  {...form.register("twitter")}
                  placeholder="@johndoe"
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="input-twitter"
                />
              </div>
            </div>
            
            {/* Custom Social Media Fields */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-talklink-300">Additional Social Platforms</h4>
              {form.watch("customSocials")?.map((social, index) => (
                <div key={social.id} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label className="text-white">Platform</Label>
                    <Input
                      value={social.platform}
                      onChange={(e) => {
                        const newSocials = [...(form.watch("customSocials") || [])];
                        newSocials[index] = { ...social, platform: e.target.value };
                        form.setValue("customSocials", newSocials);
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
                        const newSocials = [...(form.watch("customSocials") || [])];
                        newSocials[index] = { ...social, value: e.target.value };
                        form.setValue("customSocials", newSocials);
                      }}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="@username or URL"
                    />
                  </div>
                  <div className="w-32">
                    <Label className="text-white">Icon</Label>
                    <Select
                      value={social.icon}
                      onValueChange={(value) => {
                        const newSocials = [...(form.watch("customSocials") || [])];
                        newSocials[index] = { ...social, icon: value };
                        form.setValue("customSocials", newSocials);
                      }}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue>
                          {social.icon && <i className={`${social.icon} mr-2`}></i>}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableIcons().filter(icon => icon.category === 'social').map(icon => (
                          <SelectItem key={icon.icon} value={icon.icon}>
                            <div className="flex items-center">
                              <i className={`${icon.icon} mr-2`}></i>
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
                      const newSocials = form.watch("customSocials")?.filter((_, i) => i !== index) || [];
                      form.setValue("customSocials", newSocials);
                    }}
                    className="mb-0"
                  >
                    <i className="fas fa-trash text-xs"></i>
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newSocial = {
                    id: generateFieldId(),
                    label: "",
                    value: "",
                    icon: "fab fa-facebook",
                    platform: ""
                  };
                  const currentSocials = form.watch("customSocials") || [];
                  form.setValue("customSocials", [...currentSocials, newSocial]);
                }}
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
              >
                <i className="fas fa-plus mr-2"></i>
                Add Social Platform
              </Button>
            </div>
            
            {/* Social Media Section Styling */}
            <div className="border-t border-pink-600/30 pt-4 space-y-3">
              <h4 className="text-sm font-medium text-pink-200">Icon Styling (Optional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-white text-xs">Icon Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.socialMedia?.iconColor || "#ffffff"}
                      onChange={(e) => form.setValue('sectionStyles.socialMedia.iconColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.socialMedia?.iconColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.socialMedia.iconColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-xs">Icon Background</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.socialMedia?.iconBackgroundColor || "#475569"}
                      onChange={(e) => form.setValue('sectionStyles.socialMedia.iconBackgroundColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.socialMedia?.iconBackgroundColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.socialMedia.iconBackgroundColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#475569"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-white text-xs">Icon Text Color</Label>
                  <div className="flex items-center gap-1">
                    <input
                      type="color"
                      value={watchedValues.sectionStyles?.socialMedia?.iconTextColor || "#64748b"}
                      onChange={(e) => form.setValue('sectionStyles.socialMedia.iconTextColor', e.target.value)}
                      className="w-8 h-6 rounded cursor-pointer"
                    />
                    <Input
                      value={watchedValues.sectionStyles?.socialMedia?.iconTextColor || ""}
                      onChange={(e) => form.setValue('sectionStyles.socialMedia.iconTextColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}
          </div>

          {/* Appearance Settings */}
          <div className="bg-indigo-900/30 border border-indigo-600/30 rounded-lg p-4 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('appearance')}
            >
              <h3 className="text-lg font-semibold text-indigo-300">Appearance</h3>
              <i className={`fas ${collapsedSections.appearance ? 'fa-chevron-down' : 'fa-chevron-up'} text-indigo-300`}></i>
            </div>
            {!collapsedSections.appearance && (
            <div className="space-y-4">
              {/* Customize Theme */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-indigo-200">Customize Theme</h4>
                
                {/* Default Colors */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white text-sm">Primary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watchedValues.primaryColor || "#22c55e"}
                        onChange={(e) => form.setValue('primaryColor', e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                        data-testid="input-primary-color"
                      />
                      <Input
                        value={watchedValues.primaryColor || "#22c55e"}
                        onChange={(e) => form.setValue('primaryColor', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-xs"
                        placeholder="#22c55e"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-sm">Secondary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watchedValues.secondaryColor || "#16a34a"}
                        onChange={(e) => form.setValue('secondaryColor', e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                        data-testid="input-secondary-color"
                      />
                      <Input
                        value={watchedValues.secondaryColor || "#16a34a"}
                        onChange={(e) => form.setValue('secondaryColor', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-xs"
                        placeholder="#16a34a"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-sm">Tertiary Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watchedValues.tertiaryColor || "#0d9488"}
                        onChange={(e) => form.setValue('tertiaryColor', e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                        data-testid="input-tertiary-color"
                      />
                      <Input
                        value={watchedValues.tertiaryColor || "#0d9488"}
                        onChange={(e) => form.setValue('tertiaryColor', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-xs"
                        placeholder="#0d9488"
                      />
                    </div>
                  </div>
                </div>

                {/* Gradient Settings */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-gradient"
                      checked={watchedValues.useGradient || false}
                      onChange={(e) => form.setValue('useGradient', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <Label htmlFor="use-gradient" className="text-white cursor-pointer">Use Gradient</Label>
                  </div>
                  
                  {watchedValues.useGradient && (
                    <div className="space-y-3 ml-6">
                      <div>
                        <Label className="text-white text-sm">Angle: {watchedValues.gradientAngle || 90}°</Label>
                        <input
                          type="range"
                          min="0"
                          max="360"
                          value={watchedValues.gradientAngle || 90}
                          onChange={(e) => form.setValue('gradientAngle', parseInt(e.target.value))}
                          className="w-full mt-1"
                          data-testid="input-gradient-angle"
                        />
                      </div>
                      
                      {watchedValues.gradientStops?.map((stop, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="color"
                            value={stop.color}
                            onChange={(e) => {
                              const newStops = [...(watchedValues.gradientStops || [])];
                              newStops[index] = { ...stop, color: e.target.value };
                              form.setValue('gradientStops', newStops);
                            }}
                            className="w-10 h-8 rounded cursor-pointer"
                          />
                          <Label className="text-white text-xs">Stop {index + 1}:</Label>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={stop.position}
                            onChange={(e) => {
                              const newStops = [...(watchedValues.gradientStops || [])];
                              newStops[index] = { ...stop, position: parseInt(e.target.value) };
                              form.setValue('gradientStops', newStops);
                            }}
                            className="flex-1"
                          />
                          <span className="text-white text-xs w-10">{stop.position}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Background */}
                <div>
                  <Label className="text-white text-sm">Background Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={watchedValues.backgroundColor || "#ffffff"}
                      onChange={(e) => form.setValue('backgroundColor', e.target.value)}
                      className="w-12 h-8 rounded cursor-pointer"
                      data-testid="input-background-color"
                    />
                    <Input
                      value={watchedValues.backgroundColor || "#ffffff"}
                      onChange={(e) => form.setValue('backgroundColor', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white text-xs"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                {/* Font Family */}
                <div>
                  <Label className="text-white text-sm">Font Family</Label>
                  <Select
                    value={watchedValues.font || "inter"}
                    onValueChange={(value) => form.setValue('font', value)}
                  >
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                      <SelectItem value="work-sans">Work Sans</SelectItem>
                      <SelectItem value="dm-sans">DM Sans</SelectItem>
                      <SelectItem value="plus-jakarta-sans">Plus Jakarta Sans</SelectItem>
                      <SelectItem value="manrope">Manrope</SelectItem>
                      <SelectItem value="space-grotesk">Space Grotesk</SelectItem>
                      <SelectItem value="outfit">Outfit</SelectItem>
                      <SelectItem value="nunito-sans">Nunito Sans</SelectItem>
                      <SelectItem value="red-hat-display">Red Hat Display</SelectItem>
                      <SelectItem value="ibm-plex-sans">IBM Plex Sans</SelectItem>
                      <SelectItem value="figtree">Figtree</SelectItem>
                      <SelectItem value="quicksand">Quicksand</SelectItem>
                      <SelectItem value="raleway">Raleway</SelectItem>
                      <SelectItem value="montserrat">Montserrat</SelectItem>
                      <SelectItem value="source-sans-pro">Source Sans Pro</SelectItem>
                      <SelectItem value="lato">Lato</SelectItem>
                      <SelectItem value="open-sans">Open Sans</SelectItem>
                      <SelectItem value="rubik">Rubik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Heading Style */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-indigo-200">Heading Style</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white text-sm">Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watchedValues.headingColor || "#1f2937"}
                        onChange={(e) => form.setValue('headingColor', e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={watchedValues.headingColor || "#1f2937"}
                        onChange={(e) => form.setValue('headingColor', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-xs"
                        placeholder="#1f2937"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-sm">Size: {watchedValues.headingSize || 16}px</Label>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      value={watchedValues.headingSize || 16}
                      onChange={(e) => form.setValue('headingSize', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Weight</Label>
                    <Select
                      value={(watchedValues.headingWeight || 600).toString()}
                      onValueChange={(value) => form.setValue('headingWeight', parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                        <SelectItem value="700">Bold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Paragraph Style */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-indigo-200">Paragraph Style</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-white text-sm">Color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={watchedValues.paragraphColor || "#4b5563"}
                        onChange={(e) => form.setValue('paragraphColor', e.target.value)}
                        className="w-12 h-8 rounded cursor-pointer"
                      />
                      <Input
                        value={watchedValues.paragraphColor || "#4b5563"}
                        onChange={(e) => form.setValue('paragraphColor', e.target.value)}
                        className="bg-slate-700 border-slate-600 text-white text-xs"
                        placeholder="#4b5563"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white text-sm">Size: {watchedValues.paragraphSize || 14}px</Label>
                    <input
                      type="range"
                      min="10"
                      max="20"
                      value={watchedValues.paragraphSize || 14}
                      onChange={(e) => form.setValue('paragraphSize', parseInt(e.target.value))}
                      className="w-full mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-white text-sm">Weight</Label>
                    <Select
                      value={(watchedValues.paragraphWeight || 400).toString()}
                      onValueChange={(value) => form.setValue('paragraphWeight', parseInt(value))}
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="300">Light</SelectItem>
                        <SelectItem value="400">Normal</SelectItem>
                        <SelectItem value="500">Medium</SelectItem>
                        <SelectItem value="600">Semibold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* SEO Settings */}
          <div className="bg-amber-900/30 border border-amber-600/30 rounded-lg p-4 space-y-4">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleSection('seo')}
            >
              <h3 className="text-lg font-semibold text-amber-300">SEO Settings</h3>
              <i className={`fas ${collapsedSections.seo ? 'fa-chevron-down' : 'fa-chevron-up'} text-amber-300`}></i>
            </div>
            {!collapsedSections.seo && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle" className="text-white">Meta Title</Label>
                <Input
                  id="metaTitle"
                  {...form.register("metaTitle")}
                  placeholder={`${watchedValues.fullName || 'Your Name'} - Digital Business Card`}
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="input-meta-title"
                />
                <p className="text-xs text-slate-400 mt-1">Recommended: 50-60 characters</p>
              </div>

              <div>
                <Label htmlFor="metaDescription" className="text-white">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  {...form.register("metaDescription")}
                  placeholder={`Connect with ${watchedValues.fullName || 'me'} - ${watchedValues.title || 'Professional'}. View my digital business card for contact information and more.`}
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="textarea-meta-description"
                />
                <p className="text-xs text-slate-400 mt-1">Recommended: 150-160 characters</p>
              </div>

              <div>
                <Label htmlFor="ogTitle" className="text-white">Open Graph Title</Label>
                <Input
                  id="ogTitle"
                  {...form.register("ogTitle")}
                  placeholder={watchedValues.metaTitle || `${watchedValues.fullName || 'Your Name'} - Digital Business Card`}
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="input-og-title"
                />
              </div>

              <div>
                <Label htmlFor="ogDescription" className="text-white">Open Graph Description</Label>
                <Textarea
                  id="ogDescription"
                  {...form.register("ogDescription")}
                  placeholder={watchedValues.metaDescription || `Connect with ${watchedValues.fullName || 'me'} - ${watchedValues.title || 'Professional'}. View my digital business card for contact information and more.`}
                  rows={3}
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                  data-testid="textarea-og-description"
                />
              </div>

              <div>
                <Label htmlFor="ogImage" className="text-white">Open Graph Image</Label>
                <div className="mt-1">
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                    {watchedValues.ogImage ? (
                      <img 
                        src={watchedValues.ogImage} 
                        alt="OG Image" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-image text-slate-400 text-2xl"></i>
                        <p className="text-slate-400 text-sm mt-2">Open Graph Image</p>
                        <p className="text-slate-500 text-xs mt-1">Recommended: 1200x630px</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full"
                    onClick={() => document.getElementById('og-image-input')?.click()}
                    disabled={isUploading}
                  >
                    <i className="fas fa-upload mr-2"></i>
                    Upload OG Image
                  </Button>
                  <input
                    id="og-image-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'ogImage' as any)}
                    className="hidden"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="keywords" className="text-white">Keywords</Label>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(watchedValues.keywords || []).map((keyword, index) => (
                      <div key={index} className="flex items-center bg-slate-700 rounded-full px-3 py-1">
                        <span className="text-white text-sm">{keyword}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newKeywords = [...(watchedValues.keywords || [])];
                            newKeywords.splice(index, 1);
                            form.setValue('keywords', newKeywords);
                          }}
                          className="ml-2 text-red-400 hover:text-red-300"
                        >
                          <i className="fas fa-times text-xs"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      id="new-keyword"
                      placeholder="Add keyword..."
                      className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          if (input.value.trim()) {
                            const newKeywords = [...(watchedValues.keywords || []), input.value.trim()];
                            form.setValue('keywords', newKeywords);
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      onClick={() => {
                        const input = document.getElementById('new-keyword') as HTMLInputElement;
                        if (input?.value.trim()) {
                          const newKeywords = [...(watchedValues.keywords || []), input.value.trim()];
                          form.setValue('keywords', newKeywords);
                          input.value = '';
                        }
                      }}
                    >
                      <i className="fas fa-plus"></i>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            )}
          </div>

          {/* Page Builder */}
          <div className="bg-teal-900/30 border border-teal-600/30 rounded-lg p-4 space-y-4">
            <PageBuilder
              elements={form.watch("pageElements") || []}
              onElementsChange={(elements: PageElement[]) => {
                form.setValue("pageElements", elements);
              }}
              cardData={watchedValues}
            />
          </div>

          {/* Auto Save Status */}
          <div className="flex items-center justify-center p-3 bg-slate-700/50 rounded-lg border border-slate-600">
            <div className="flex items-center space-x-2 text-slate-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm">Auto-saving changes...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
