import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ReactNode, forwardRef } from "react";

// Theme constants matching sidebar design from GIFs
export const panelTheme = {
  colors: {
    background: '#2d1b4e',
    sectionBg: '#3d2755',
    inputBg: '#1f1635',
    borderColor: 'rgba(168, 85, 247, 0.3)',
    borderColorLight: 'rgba(168, 85, 247, 0.2)',
    textPrimary: '#ffffff',
    textSecondary: '#d8b4fe', // purple-200
    accent: '#a855f7', // purple-500
    success: '#22c55e',
    danger: '#dc2626',
    sliderTrack: '#4c1d95', // purple-900
    sliderThumb: '#d946ef', // fuchsia-500
  },
  spacing: {
    section: 'py-2 px-3',
    field: 'space-y-1.5',
  }
};

// Styled panel wrapper
export const PanelWrapper = ({ children }: { children: ReactNode }) => (
  <div 
    className="rounded-lg overflow-hidden"
    style={{ backgroundColor: panelTheme.colors.background }}
    onPointerDown={(e) => e.stopPropagation()}
  >
    {children}
  </div>
);

// Styled panel header
export const PanelHeader = ({ title }: { title: string }) => (
  <div className="px-4 py-3 border-b" style={{ borderColor: panelTheme.colors.borderColor }}>
    <h3 className="text-base font-semibold" style={{ color: panelTheme.colors.textPrimary }}>
      {title}
    </h3>
  </div>
);

// Styled collapsible section
interface SidebarSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}

export const SidebarSection = ({ title, isOpen, onToggle, children }: SidebarSectionProps) => (
  <Collapsible open={isOpen}>
    <div 
      className="px-3 py-2.5 cursor-pointer hover:opacity-90 transition-opacity"
      style={{ backgroundColor: panelTheme.colors.sectionBg }}
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium" style={{ color: panelTheme.colors.textSecondary }}>
          {title}
        </h4>
        <i 
          className={`fas ${isOpen ? "fa-chevron-up" : "fa-chevron-down"} text-xs`}
          style={{ color: panelTheme.colors.textSecondary }}
        />
      </div>
    </div>
    <CollapsibleContent>
      <div 
        className="px-3 py-3 space-y-3 border-x border-b"
        style={{ 
          backgroundColor: panelTheme.colors.sectionBg,
          borderColor: panelTheme.colors.borderColor
        }}
      >
        {children}
      </div>
    </CollapsibleContent>
  </Collapsible>
);

// Styled label
export const PanelLabel = ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
  <Label 
    htmlFor={htmlFor}
    className="text-xs font-medium"
    style={{ color: panelTheme.colors.textSecondary }}
  >
    {children}
  </Label>
);

// Styled input
export const PanelInput = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className = "", style = {}, ...props }, ref) => (
    <Input
      ref={ref}
      className={`h-8 text-sm ${className}`}
      style={{
        backgroundColor: panelTheme.colors.inputBg,
        borderColor: panelTheme.colors.borderColorLight,
        color: panelTheme.colors.textPrimary,
        ...style
      }}
      {...props}
    />
  )
);
PanelInput.displayName = "PanelInput";

// Styled select
interface PanelSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  placeholder?: string;
}

export const PanelSelect = ({ value, onValueChange, children, placeholder }: PanelSelectProps) => (
  <Select value={value} onValueChange={onValueChange}>
    <SelectTrigger 
      className="h-8 text-sm"
      style={{
        backgroundColor: panelTheme.colors.inputBg,
        borderColor: panelTheme.colors.borderColorLight,
        color: panelTheme.colors.textPrimary,
      }}
    >
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent 
      style={{
        backgroundColor: panelTheme.colors.inputBg,
        borderColor: panelTheme.colors.borderColorLight,
      }}
    >
      {children}
    </SelectContent>
  </Select>
);

// Styled checkbox with green checkmark
interface PanelCheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
}

export const PanelCheckbox = ({ id, checked, onCheckedChange, label }: PanelCheckboxProps) => (
  <div className="flex items-center space-x-2">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
      style={{
        borderColor: panelTheme.colors.borderColor,
      }}
    />
    <Label 
      htmlFor={id}
      className="text-sm cursor-pointer"
      style={{ color: panelTheme.colors.textSecondary }}
    >
      {label}
    </Label>
  </div>
);

// Styled slider
interface PanelSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}

export const PanelSlider = ({ value, onChange, min = 0, max = 100, step = 1, label }: PanelSliderProps) => (
  <div className="space-y-2">
    {label && (
      <PanelLabel>
        {label}: {value}{typeof value === 'number' && (max <= 100 ? '%' : 'px')}
      </PanelLabel>
    )}
    <Slider
      value={[value]}
      onValueChange={(values) => onChange(values[0])}
      min={min}
      max={max}
      step={step}
      className="[&_[role=slider]]:bg-fuchsia-500 [&_[role=slider]]:border-fuchsia-500 [&_.relative]:bg-purple-900 [&_[data-state]]:bg-fuchsia-500"
    />
  </div>
);

// Color picker input
export const PanelColorPicker = forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className = "", style = {}, ...props }, ref) => (
    <Input
      ref={ref}
      type="color"
      className={`h-8 w-full cursor-pointer ${className}`}
      style={{
        backgroundColor: panelTheme.colors.inputBg,
        borderColor: panelTheme.colors.borderColorLight,
        ...style
      }}
      {...props}
    />
  )
);
PanelColorPicker.displayName = "PanelColorPicker";

// Action button (green for add, red for delete)
interface PanelButtonProps {
  onClick: () => void;
  variant?: 'success' | 'danger' | 'default';
  children: ReactNode;
  className?: string;
}

export const PanelButton = ({ onClick, variant = 'default', children, className = "" }: PanelButtonProps) => {
  const getStyles = () => {
    switch (variant) {
      case 'success':
        return { backgroundColor: panelTheme.colors.success, color: 'white' };
      case 'danger':
        return { backgroundColor: panelTheme.colors.danger, color: 'white' };
      default:
        return { backgroundColor: panelTheme.colors.accent, color: 'white' };
    }
  };

  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm font-medium hover:opacity-90 transition-opacity ${className}`}
      style={getStyles()}
    >
      {children}
    </button>
  );
};

// Divider
export const PanelDivider = () => (
  <div 
    className="h-px w-full my-3"
    style={{ backgroundColor: panelTheme.colors.borderColor }}
  />
);

// PWA Settings Component
interface PWASettingsProps {
  cardData: any;
  onUpdate: (field: string, value: any) => void;
  onImageUpload?: (file: File, field: string) => Promise<string>;
}

export const PWASettings = ({ cardData, onUpdate, onImageUpload }: PWASettingsProps) => {
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (onImageUpload) {
      try {
        const base64 = await onImageUpload(file, field);
        onUpdate(field, base64);
      } catch (error) {
        console.error('Image upload failed:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <PanelLabel htmlFor="pwa-app-name">App Name</PanelLabel>
        <PanelInput
          id="pwa-app-name"
          value={cardData?.pwaAppName || ''}
          onChange={(e) => onUpdate('pwaAppName', e.target.value)}
          placeholder="Enter app name for installation"
          data-testid="input-pwa-app-name"
        />
      </div>

      <div>
        <PanelLabel>App Icon</PanelLabel>
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-slate-600 flex items-center justify-center flex-shrink-0">
            {cardData?.pwaAppIcon ? (
              <img src={cardData.pwaAppIcon} alt="PWA Icon" className="w-full h-full object-cover" />
            ) : (
              <i className="fas fa-image text-slate-500 text-xl"></i>
            )}
          </div>
          <div>
            <input
              type="file"
              id="pwa-app-icon"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'pwaAppIcon')}
              className="hidden"
              data-testid="input-pwa-app-icon"
            />
            <button
              onClick={() => document.getElementById('pwa-app-icon')?.click()}
              className="px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-90"
              style={{ backgroundColor: panelTheme.colors.accent, color: 'white' }}
              data-testid="button-upload-pwa-icon"
            >
              <i className="fas fa-upload mr-1"></i>
              Upload
            </button>
          </div>
        </div>
      </div>

      <PanelDivider />

      <div>
        <PanelLabel htmlFor="pwa-theme-color">Theme Color</PanelLabel>
        <div className="flex items-center gap-2">
          <PanelColorPicker
            id="pwa-theme-color"
            value={cardData?.pwaThemeColor || '#22c55e'}
            onChange={(e) => onUpdate('pwaThemeColor', e.target.value)}
            data-testid="input-pwa-theme-color"
          />
          <span className="text-xs" style={{ color: panelTheme.colors.textSecondary }}>
            {cardData?.pwaThemeColor || '#22c55e'}
          </span>
        </div>
      </div>

      <PanelDivider />

      <div>
        <PanelLabel htmlFor="pwa-install-enabled">
          <div className="flex items-center gap-2">
            <i className="fas fa-download text-green-400"></i>
            <span>Enable Install Button</span>
          </div>
        </PanelLabel>
        <PanelCheckbox
          id="pwa-install-enabled"
          checked={cardData?.pwaInstallButtonEnabled !== false}
          onCheckedChange={(checked) => onUpdate('pwaInstallButtonEnabled', checked)}
          label="Show install button on card"
        />
      </div>

      {cardData?.pwaInstallButtonEnabled !== false && (
        <>
          <div>
            <PanelLabel htmlFor="pwa-install-text">Install Button Text</PanelLabel>
            <PanelInput
              id="pwa-install-text"
              value={cardData?.pwaInstallButtonText || 'Install App'}
              onChange={(e) => onUpdate('pwaInstallButtonText', e.target.value)}
              placeholder="Install App"
              data-testid="input-pwa-install-text"
            />
          </div>

          <div>
            <PanelLabel htmlFor="pwa-button-color">Button Color</PanelLabel>
            <div className="flex items-center gap-2">
              <PanelColorPicker
                id="pwa-button-color"
                value={cardData?.pwaInstallButtonColor || '#22c55e'}
                onChange={(e) => onUpdate('pwaInstallButtonColor', e.target.value)}
                data-testid="input-pwa-button-color"
              />
              <span className="text-xs" style={{ color: panelTheme.colors.textSecondary }}>
                {cardData?.pwaInstallButtonColor || '#22c55e'}
              </span>
            </div>
          </div>

          <div>
            <PanelLabel htmlFor="pwa-text-color">Text Color</PanelLabel>
            <div className="flex items-center gap-2">
              <PanelColorPicker
                id="pwa-text-color"
                value={cardData?.pwaInstallButtonTextColor || '#ffffff'}
                onChange={(e) => onUpdate('pwaInstallButtonTextColor', e.target.value)}
                data-testid="input-pwa-text-color"
              />
              <span className="text-xs" style={{ color: panelTheme.colors.textSecondary }}>
                {cardData?.pwaInstallButtonTextColor || '#ffffff'}
              </span>
            </div>
          </div>

          <div>
            <PanelLabel htmlFor="pwa-button-size">Button Size</PanelLabel>
            <PanelSelect
              value={cardData?.pwaInstallButtonSize || 'md'}
              onValueChange={(value) => onUpdate('pwaInstallButtonSize', value)}
              placeholder="Select size"
            >
              <SelectItem value="sm">Small</SelectItem>
              <SelectItem value="md">Medium</SelectItem>
              <SelectItem value="lg">Large</SelectItem>
            </PanelSelect>
          </div>

          <div>
            <PanelLabel htmlFor="pwa-button-style">Button Style</PanelLabel>
            <PanelSelect
              value={cardData?.pwaInstallButtonStyle || 'filled'}
              onValueChange={(value) => onUpdate('pwaInstallButtonStyle', value)}
              placeholder="Select style"
            >
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="outline">Outline</SelectItem>
              <SelectItem value="ghost">Ghost</SelectItem>
            </PanelSelect>
          </div>

          <div>
            <PanelLabel htmlFor="pwa-button-alignment">Button Alignment</PanelLabel>
            <PanelSelect
              value={cardData?.pwaInstallButtonAlignment || 'center'}
              onValueChange={(value) => onUpdate('pwaInstallButtonAlignment', value)}
              placeholder="Select alignment"
            >
              <SelectItem value="left">Left</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="right">Right</SelectItem>
            </PanelSelect>
          </div>
        </>
      )}

      <div className="p-3 rounded-md" style={{ backgroundColor: `${panelTheme.colors.accent}20`, borderColor: panelTheme.colors.accent, border: '1px solid' }}>
        <p className="text-xs" style={{ color: panelTheme.colors.textSecondary }}>
          <i className="fas fa-info-circle mr-2"></i>
          Install button appears on Android (Chrome, Edge, Firefox) and iPhone (Safari) only.
        </p>
      </div>
    </div>
  );
};