import { BusinessCard, PageElement } from '@shared/schema';
import { useBusinessCardPWA } from '@/hooks/useBusinessCardPWA';
import { useState } from 'react';
import { Download, Loader2, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";

type InstallButtonElement = Extract<PageElement, { type: "installButton" }>;

interface InstallButtonData {
  enabled: boolean;
  appName: string;
  iconUrl?: string;
  buttonText: string;
  buttonColor: string;
  textColor: string;
  buttonSize: 'sm' | 'md' | 'lg';
  buttonStyle: 'filled' | 'outline' | 'ghost';
  buttonAlignment: 'left' | 'center' | 'right';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  showIcon: boolean;
  iconPosition: 'left' | 'right';
}

const defaultData: InstallButtonData = {
  enabled: true,
  appName: "TalkLink",
  iconUrl: undefined,
  buttonText: "Install App",
  buttonColor: "#22c55e",
  textColor: "#ffffff",
  buttonSize: "md",
  buttonStyle: "filled",
  buttonAlignment: "center",
  borderRadius: "md",
  showIcon: true,
  iconPosition: "left",
};

interface InstallButtonElementProps {
  element: PageElement;
  isEditing: boolean;
  onUpdate?: (element: PageElement) => void;
  cardData?: BusinessCard;
}

export const InstallButtonElement = ({ element, isEditing, onUpdate, cardData }: InstallButtonElementProps) => {
  const [installing, setInstalling] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const { toast } = useToast();
  
  const { 
    isInstallable, 
    isInstalled, 
    installBusinessCard,
    showInstructions,
    setShowInstructions
  } = useBusinessCardPWA(cardData || {} as BusinessCard);

  const elementData = (element as InstallButtonElement).data || {};
  
  const data: InstallButtonData = {
    enabled: elementData.enabled ?? defaultData.enabled,
    appName: elementData.appName ?? cardData?.pwaAppName ?? defaultData.appName,
    iconUrl: elementData.iconUrl,
    buttonText: elementData.buttonText ?? cardData?.pwaInstallButtonText ?? defaultData.buttonText,
    buttonColor: elementData.buttonColor ?? cardData?.pwaInstallButtonColor ?? defaultData.buttonColor,
    textColor: elementData.textColor ?? cardData?.pwaInstallButtonTextColor ?? defaultData.textColor,
    buttonSize: (elementData.buttonSize ?? cardData?.pwaInstallButtonSize ?? defaultData.buttonSize) as 'sm' | 'md' | 'lg',
    buttonStyle: (elementData.buttonStyle ?? cardData?.pwaInstallButtonStyle ?? defaultData.buttonStyle) as 'filled' | 'outline' | 'ghost',
    buttonAlignment: (elementData.buttonAlignment ?? cardData?.pwaInstallButtonAlignment ?? defaultData.buttonAlignment) as 'left' | 'center' | 'right',
    borderRadius: (elementData.borderRadius ?? defaultData.borderRadius) as 'none' | 'sm' | 'md' | 'lg' | 'full',
    showIcon: elementData.showIcon ?? defaultData.showIcon,
    iconPosition: (elementData.iconPosition ?? defaultData.iconPosition) as 'left' | 'right',
  };

  const handleDataUpdate = (updates: Partial<InstallButtonData>) => {
    if (onUpdate) {
      const newData = { ...elementData, ...updates };
      onUpdate({
        ...element,
        type: "installButton",
        data: newData
      } as PageElement);
    }
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Icon must be less than 5MB", variant: "destructive" });
      return;
    }

    setUploadingIcon(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Upload failed');
      const { url } = await response.json();
      handleDataUpdate({ iconUrl: url });
      toast({ title: "Success", description: "Icon uploaded successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to upload icon", variant: "destructive" });
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleInstallClick = async () => {
    console.log('Install button clicked from element');
    setInstalling(true);
    
    try {
      const installed = await installBusinessCard();
      
      if (installed) {
        console.log('PWA installation initiated successfully');
      } else {
        console.log('PWA installation was not initiated - may need manual steps');
        if (setShowInstructions) {
          setShowInstructions(true);
        }
      }
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-3 text-base gap-2',
    lg: 'px-8 py-4 text-lg gap-2.5'
  };

  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  };

  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  const borderRadiusClass = {
    none: 'rounded-none',
    sm: 'rounded',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    full: 'rounded-full'
  };

  const filledStyle = {
    backgroundColor: data.buttonColor,
    color: data.textColor,
    border: 'none'
  };

  const outlineStyle = {
    backgroundColor: 'transparent',
    color: data.buttonColor,
    border: `2px solid ${data.buttonColor}`
  };

  const ghostStyle = {
    backgroundColor: 'transparent',
    color: data.buttonColor,
    border: 'none'
  };

  const styleMap = {
    filled: filledStyle,
    outline: outlineStyle,
    ghost: ghostStyle
  };

  const ButtonPreview = () => (
    <div className={`flex ${alignmentClass[data.buttonAlignment]} py-4`}>
      <div
        className={`
          ${sizeClasses[data.buttonSize]}
          ${borderRadiusClass[data.borderRadius]}
          font-medium transition-all duration-200
          shadow-lg flex items-center cursor-default
        `}
        style={styleMap[data.buttonStyle]}
      >
        {data.showIcon && data.iconPosition === 'left' && (
          data.iconUrl ? (
            <img src={data.iconUrl} alt="icon" className={`w-${iconSizes[data.buttonSize] * 0.25} h-${iconSizes[data.buttonSize] * 0.25} object-cover`} style={{ width: `${iconSizes[data.buttonSize]}px`, height: `${iconSizes[data.buttonSize]}px` }} />
          ) : (
            <Download size={iconSizes[data.buttonSize]} />
          )
        )}
        <span>{data.buttonText}</span>
        {data.showIcon && data.iconPosition === 'right' && (
          data.iconUrl ? (
            <img src={data.iconUrl} alt="icon" className={`w-${iconSizes[data.buttonSize] * 0.25} h-${iconSizes[data.buttonSize] * 0.25} object-cover`} style={{ width: `${iconSizes[data.buttonSize]}px`, height: `${iconSizes[data.buttonSize]}px` }} />
          ) : (
            <Download size={iconSizes[data.buttonSize]} />
          )
        )}
      </div>
    </div>
  );

  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">
            <Download className="w-5 h-5 text-green-600" />
            Install App Button
          </h3>
          <div className="flex items-center gap-2">
            <Label className="text-sm text-slate-600">Enable</Label>
            <Switch
              checked={data.enabled}
              onCheckedChange={(checked) => handleDataUpdate({ enabled: checked })}
              data-testid="switch-install-button-enabled"
            />
          </div>
        </div>

        <div className="space-y-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div>
            <Label className="text-sm text-slate-700 font-medium mb-1 block">App Name</Label>
            <Input
              value={data.appName}
              onChange={(e) => handleDataUpdate({ appName: e.target.value })}
              placeholder="My App"
              className="text-black"
              data-testid="input-install-app-name"
            />
            <p className="text-xs text-slate-500 mt-1">Name that appears on home screen after installation</p>
          </div>

          <div>
            <Label className="text-sm text-slate-700 font-medium mb-2 block">App Icon</Label>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="flex items-center justify-center w-full px-4 py-2 bg-white border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-slate-400 transition-colors">
                  <span className="text-sm text-slate-600">{uploadingIcon ? 'Uploading...' : 'Choose Icon'}</span>
                  <input
                    type="file"
                    onChange={handleIconUpload}
                    accept="image/*"
                    disabled={uploadingIcon}
                    className="hidden"
                    data-testid="input-install-icon-upload"
                  />
                </label>
              </div>
              {data.iconUrl && (
                <div className="flex items-center gap-2">
                  <img src={data.iconUrl} alt="app-icon" className="w-10 h-10 rounded object-cover" />
                  <button
                    onClick={() => handleDataUpdate({ iconUrl: undefined })}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                    data-testid="button-remove-install-icon"
                  >
                    <X size={18} className="text-red-600" />
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">Max 5MB. Recommended: 192x192px square PNG or JPG</p>
          </div>
        </div>

        <ButtonPreview />

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
            <div className="flex items-center gap-2">
              <i className="fas fa-palette text-purple-600"></i>
              <span className="font-medium text-slate-700">Button Settings</span>
            </div>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-slate-400`}></i>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div>
              <Label className="text-sm text-slate-700 font-medium mb-1 block">Button Text</Label>
              <Input
                value={data.buttonText}
                onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                placeholder="Install App"
                className="text-black"
                data-testid="input-install-button-text"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-700 font-medium mb-1 block">Button Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.buttonColor}
                    onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                    data-testid="input-install-button-color"
                  />
                  <Input
                    value={data.buttonColor}
                    onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                    placeholder="#22c55e"
                    className="flex-1 text-black"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-700 font-medium mb-1 block">Text Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.textColor}
                    onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    className="w-10 h-10 rounded border cursor-pointer"
                    data-testid="input-install-text-color"
                  />
                  <Input
                    value={data.textColor}
                    onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1 text-black"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-700 font-medium mb-1 block">Button Size</Label>
                <Select
                  value={data.buttonSize}
                  onValueChange={(value: 'sm' | 'md' | 'lg') => handleDataUpdate({ buttonSize: value })}
                >
                  <SelectTrigger className="text-black" data-testid="select-install-button-size">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-slate-700 font-medium mb-1 block">Button Style</Label>
                <Select
                  value={data.buttonStyle}
                  onValueChange={(value: 'filled' | 'outline' | 'ghost') => handleDataUpdate({ buttonStyle: value })}
                >
                  <SelectTrigger className="text-black" data-testid="select-install-button-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="filled">Filled</SelectItem>
                    <SelectItem value="outline">Outline</SelectItem>
                    <SelectItem value="ghost">Ghost</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm text-slate-700 font-medium mb-1 block">Alignment</Label>
                <Select
                  value={data.buttonAlignment}
                  onValueChange={(value: 'left' | 'center' | 'right') => handleDataUpdate({ buttonAlignment: value })}
                >
                  <SelectTrigger className="text-black" data-testid="select-install-button-alignment">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="right">Right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm text-slate-700 font-medium mb-1 block">Border Radius</Label>
                <Select
                  value={data.borderRadius}
                  onValueChange={(value: 'none' | 'sm' | 'md' | 'lg' | 'full') => handleDataUpdate({ borderRadius: value })}
                >
                  <SelectTrigger className="text-black" data-testid="select-install-border-radius">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="full">Full (Pill)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-slate-600" />
                <Label className="text-sm text-slate-700 font-medium">Show Icon</Label>
              </div>
              <Switch
                checked={data.showIcon}
                onCheckedChange={(checked) => handleDataUpdate({ showIcon: checked })}
                data-testid="switch-install-show-icon"
              />
            </div>

            {data.showIcon && (
              <div>
                <Label className="text-sm text-slate-700 font-medium mb-1 block">Icon Position</Label>
                <Select
                  value={data.iconPosition}
                  onValueChange={(value: 'left' | 'right') => handleDataUpdate({ iconPosition: value })}
                >
                  <SelectTrigger className="text-black" data-testid="select-install-icon-position">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left of Text</SelectItem>
                    <SelectItem value="right">Right of Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <p><strong>Note:</strong> This button lets visitors install your business card as an app on their phone. Works on both Android and iPhone.</p>
        </div>
      </div>
    );
  }

  if (!data.enabled) {
    return null;
  }

  if (cardData?.pwaInstallButtonEnabled === false) {
    return null;
  }

  if (isInstalled) {
    return null;
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <div className={`flex ${alignmentClass[data.buttonAlignment]} py-4`}>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`
          ${sizeClasses[data.buttonSize]}
          ${borderRadiusClass[data.borderRadius]}
          font-medium transition-all duration-200
          shadow-lg hover:shadow-xl transform hover:scale-105
          flex items-center
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        style={styleMap[data.buttonStyle]}
        data-testid="button-install-app"
      >
        {data.showIcon && data.iconPosition === 'left' && (
          installing ? (
            <Loader2 size={iconSizes[data.buttonSize]} className="animate-spin" />
          ) : data.iconUrl ? (
            <img src={data.iconUrl} alt="icon" style={{ width: `${iconSizes[data.buttonSize]}px`, height: `${iconSizes[data.buttonSize]}px` }} className="object-cover rounded" />
          ) : (
            <Download size={iconSizes[data.buttonSize]} />
          )
        )}
        <span>{installing ? 'Installing...' : data.buttonText}</span>
        {data.showIcon && data.iconPosition === 'right' && (
          installing ? (
            <Loader2 size={iconSizes[data.buttonSize]} className="animate-spin" />
          ) : data.iconUrl ? (
            <img src={data.iconUrl} alt="icon" style={{ width: `${iconSizes[data.buttonSize]}px`, height: `${iconSizes[data.buttonSize]}px` }} className="object-cover rounded" />
          ) : (
            <Download size={iconSizes[data.buttonSize]} />
          )
        )}
      </button>
    </div>
  );
};
