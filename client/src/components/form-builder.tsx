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

  const form = useForm<BusinessCard>({
    resolver: zodResolver(businessCardSchema),
    defaultValues: cardData,
  });

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
    field: "profilePhoto" | "logo" | "backgroundImage"
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

  const handleSaveSettings = () => {
    const data = form.getValues();
    storage.saveCardData(data);
    logEvent("save_settings");
    toast({
      title: t("message.settingsSaved"),
      description: "Your card data has been saved locally",
    });
  };

  const handleGenerateQR = () => {
    onGenerateQR();
    logEvent("generate_qr");
    toast({
      title: t("message.qrGenerated"),
      description: "QR code has been generated for your card",
    });
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
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-talklink-400">Cover & Logo</h3>
            
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
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="profilePhoto" className="text-white">Profile Photo</Label>
                <div className="mt-2">
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                    {watchedValues.profilePhoto ? (
                      <img 
                        src={watchedValues.profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-user text-slate-400 text-xl mb-2"></i>
                        <p className="text-slate-400 text-sm">Profile Photo Preview</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full"
                    onClick={() => document.getElementById('profile-photo-input')?.click()}
                    disabled={isUploading}
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {isUploading ? "Uploading Profile..." : "Upload Profile Photo"}
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
                <Label htmlFor="backgroundImage" className="text-white">Cover Photo</Label>
                <div className="mt-2">
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                    {watchedValues.backgroundImage ? (
                      <img 
                        src={watchedValues.backgroundImage} 
                        alt="Cover" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-image text-slate-400 text-2xl mb-2"></i>
                        <p className="text-slate-400 text-sm">Cover Photo Preview</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full"
                    onClick={() => document.getElementById('background-input')?.click()}
                    disabled={isUploading}
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {isUploading ? "Uploading Cover..." : "Upload Cover Photo"}
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
                <Label htmlFor="logo" className="text-white">Logo</Label>
                <div className="mt-2">
                  <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-600 flex items-center justify-center mb-2">
                    {watchedValues.logo ? (
                      <img 
                        src={watchedValues.logo} 
                        alt="Logo" 
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="text-center">
                        <i className="fas fa-image text-slate-400 text-xl mb-2"></i>
                        <p className="text-slate-400 text-sm">Logo Preview</p>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 w-full"
                    onClick={() => document.getElementById('logo-input')?.click()}
                    disabled={isUploading}
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {isUploading ? "Uploading Logo..." : "Upload Logo"}
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-talklink-400">{t('form.basicInfo')}</h3>
            
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
          </div>


          {/* Custom URL Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-talklink-400">Card URL</h3>
            
            <div>
              <Label htmlFor="customUrl" className="text-white">Custom URL</Label>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm px-3 py-2 bg-slate-600 rounded-l border border-slate-600">
                  yoursite.com/
                </span>
                <Input
                  id="customUrl"
                  {...form.register("customUrl")}
                  placeholder="yourname"
                  className="bg-slate-700 border-slate-600 text-white focus:ring-talklink-500 rounded-l-none"
                  data-testid="input-custom-url"
                />
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Create a custom URL for your card (e.g., yoursite.com/yourname)
              </p>
            </div>
            
            <Button
              type="button"
              className="bg-talklink-500 hover:bg-talklink-600 text-white"
              data-testid="button-claim-url"
            >
              <i className="fas fa-link mr-2"></i>
              Claim your URL
            </Button>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-talklink-400">{t('form.contactInfo')}</h3>
            
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
          </div>

          {/* Contact Information Additional */}
          <div className="space-y-4">
            <h4 className="text-md font-medium text-talklink-300">Additional Contact Methods</h4>
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

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-talklink-400">{t('form.socialMedia')}</h3>
            
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
          </div>

          {/* Page Builder */}
          <div className="space-y-4">
            <PageBuilder
              elements={form.watch("pageElements") || []}
              onElementsChange={(elements: PageElement[]) => {
                form.setValue("pageElements", elements);
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerateQR}
              className="bg-talklink-500 hover:bg-talklink-600 text-white"
              data-testid="button-generate-qr"
            >
              <i className="fas fa-qrcode mr-2"></i>
              {t('action.generateQR')}
            </Button>
            
            <Button
              onClick={handleSaveSettings}
              variant="secondary"
              className="bg-slate-600 hover:bg-slate-500 text-white"
              data-testid="button-save-settings"
            >
              <i className="fas fa-save mr-2"></i>
              {t('action.saveSettings')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
