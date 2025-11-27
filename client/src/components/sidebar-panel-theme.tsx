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

