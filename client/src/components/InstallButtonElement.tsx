import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusinessCard, PageElement } from '@shared/schema';
import { useBusinessCardPWA } from '@/hooks/useBusinessCardPWA';
import { useState } from 'react';

interface InstallButtonElementProps {
  element: PageElement;
  isEditing: boolean;
  onUpdate?: (element: PageElement) => void;
  cardData?: BusinessCard;
}

export const InstallButtonElement = ({ element, isEditing, onUpdate, cardData }: InstallButtonElementProps) => {
  const [installing, setInstalling] = useState(false);
  
  // Use the full PWA hook for complete functionality
  const { 
    isInstallable, 
    isInstalled, 
    installBusinessCard 
  } = useBusinessCardPWA(cardData || {} as BusinessCard);

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await installBusinessCard();
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setInstalling(false);
    }
  };

  // EDITING MODE - Show settings panel
  if (isEditing) {
    return (
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-slate-800 text-lg">Install Button Settings</h3>
          <i className="fas fa-download text-green-600 text-xl"></i>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-slate-700 font-medium mb-2 block">Button Text</label>
            <Input
              value={element.data?.buttonText || 'Install App'}
              onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
              placeholder="Install App"
              className="text-black"
              data-testid="input-install-button-text"
            />
          </div>

          <div>
            <label className="text-sm text-slate-700 font-medium mb-2 block">Button Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={element.data?.buttonColor || '#22c55e'}
                onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                className="h-10 rounded cursor-pointer"
                data-testid="input-install-button-color"
              />
              <span className="text-xs text-slate-600">
                {element.data?.buttonColor || '#22c55e'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700 font-medium mb-2 block">Text Color</label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                value={element.data?.textColor || '#ffffff'}
                onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                className="h-10 rounded cursor-pointer"
                data-testid="input-install-text-color"
              />
              <span className="text-xs text-slate-600">
                {element.data?.textColor || '#ffffff'}
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-slate-700 font-medium mb-2 block">Button Size</label>
            <Select
              value={element.data?.buttonSize || 'md'}
              onValueChange={(value) => handleDataUpdate({ buttonSize: value })}
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
            <label className="text-sm text-slate-700 font-medium mb-2 block">Button Style</label>
            <Select
              value={element.data?.buttonStyle || 'filled'}
              onValueChange={(value) => handleDataUpdate({ buttonStyle: value })}
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

          <div>
            <label className="text-sm text-slate-700 font-medium mb-2 block">Button Alignment</label>
            <Select
              value={element.data?.alignment || 'center'}
              onValueChange={(value) => handleDataUpdate({ alignment: value })}
            >
              <SelectTrigger className="text-black" data-testid="select-install-alignment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              Button will only appear to visitors when PWA installation is available (Chrome, Edge, Firefox on Android & Safari on iPhone).
            </p>
          </div>
        </div>
      </div>
    );
  }

  // DISPLAY MODE - Show the button or nothing if not installable
  const buttonSize = element.data?.buttonSize || 'md';
  const buttonColor = element.data?.buttonColor || '#22c55e';
  const textColor = element.data?.textColor || '#ffffff';
  const buttonStyle = element.data?.buttonStyle || 'filled';
  const alignment = element.data?.alignment || 'center';
  const buttonText = element.data?.buttonText || 'Install App';

  // If already installed or not installable, hide the button
  if (isInstalled || !isInstallable) {
    return null;
  }

  // Calculate padding based on size
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  // Calculate alignment
  const alignmentClass = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  // Style configurations
  const filledStyle = {
    backgroundColor: buttonColor,
    color: textColor,
    border: 'none'
  };

  const outlineStyle = {
    backgroundColor: 'transparent',
    color: buttonColor,
    border: `2px solid ${buttonColor}`
  };

  const ghostStyle = {
    backgroundColor: 'transparent',
    color: buttonColor,
    border: 'none'
  };

  const styleMap = {
    filled: filledStyle,
    outline: outlineStyle,
    ghost: ghostStyle
  };

  return (
    <div className={`flex ${alignmentClass[alignment as keyof typeof alignmentClass]} py-6`}>
      <button
        onClick={handleInstallClick}
        disabled={installing}
        className={`
          ${sizeClasses[buttonSize as keyof typeof sizeClasses]}
          font-medium rounded-lg transition-all duration-200
          shadow-lg hover:shadow-xl transform hover:scale-105
          flex items-center gap-2
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
        style={styleMap[buttonStyle as keyof typeof styleMap]}
        data-testid="button-install-app"
      >
        <i className={`fas fa-${installing ? 'spinner fa-spin' : 'download'}`}></i>
        <span>{installing ? 'Installing...' : buttonText}</span>
      </button>
    </div>
  );
};
