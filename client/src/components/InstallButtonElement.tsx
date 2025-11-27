import { BusinessCard, PageElement } from '@shared/schema';
import { useBusinessCardPWA } from '@/hooks/useBusinessCardPWA';
import { useState } from 'react';
import { 
  PanelLabel, 
  PanelInput, 
  PanelColorPicker, 
  PanelCheckbox, 
  PanelSelect,
  PanelDivider,
  panelTheme 
} from '@/components/sidebar-panel-theme';
import { SelectItem } from '@/components/ui/select';

interface InstallButtonElementProps {
  element: PageElement;
  isEditing: boolean;
  onUpdate?: (cardData: Partial<BusinessCard>) => void;
  cardData?: BusinessCard;
}

export const InstallButtonElement = ({ element, isEditing, onUpdate, cardData }: InstallButtonElementProps) => {
  const [installing, setInstalling] = useState(false);
  
  // Use the full PWA hook for complete functionality
  const { 
    isInstallable, 
    isInstalled, 
    installBusinessCard,
    showInstructions,
    setShowInstructions
  } = useBusinessCardPWA(cardData || {} as BusinessCard);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdate?.({ pwaAppIcon: base64 });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  // In editing mode, show PWA Installation Settings
  if (isEditing) {
    return (
      <div className="p-4 space-y-4 bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-300 rounded-lg">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b-2 border-slate-200">
          <i className="fas fa-cog text-slate-600 text-lg"></i>
          <h3 className="font-semibold text-slate-800 text-lg">PWA Installation Settings</h3>
        </div>

        {/* App Name */}
        <div>
          <PanelLabel htmlFor="install-app-name">App Name</PanelLabel>
          <PanelInput
            id="install-app-name"
            value={cardData?.pwaAppName || 'APP'}
            onChange={(e) => onUpdate?.({ pwaAppName: e.target.value })}
            placeholder="Enter app name"
            data-testid="input-install-app-name"
          />
        </div>

        {/* App Icon */}
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
                id="install-app-icon"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                data-testid="input-install-app-icon"
              />
              <button
                onClick={() => document.getElementById('install-app-icon')?.click()}
                className="px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-90"
                style={{ backgroundColor: panelTheme.colors.success, color: 'white' }}
                data-testid="button-upload-install-icon"
              >
                <i className="fas fa-upload mr-1"></i>
                Upload
              </button>
            </div>
          </div>
        </div>

        <PanelDivider />

        {/* Theme Color */}
        <div>
          <PanelLabel htmlFor="install-theme-color">Theme Color</PanelLabel>
          <div className="flex items-center gap-2">
            <PanelColorPicker
              id="install-theme-color"
              value={cardData?.pwaThemeColor || '#22c55e'}
              onChange={(e) => onUpdate?.({ pwaThemeColor: e.target.value })}
              data-testid="input-install-theme-color"
            />
            <span className="text-xs font-mono" style={{ color: panelTheme.colors.textSecondary }}>
              {cardData?.pwaThemeColor || '#22c55e'}
            </span>
          </div>
        </div>

        <PanelDivider />

        {/* Enable Install Button */}
        <div>
          <PanelLabel>
            <div className="flex items-center gap-2">
              <i className="fas fa-download text-green-400"></i>
              <span>Enable Install Button</span>
            </div>
          </PanelLabel>
          <PanelCheckbox
            id="install-enabled"
            checked={cardData?.pwaInstallButtonEnabled !== false}
            onCheckedChange={(checked) => onUpdate?.({ pwaInstallButtonEnabled: checked })}
            label="Show install button on card"
          />
        </div>

        {cardData?.pwaInstallButtonEnabled !== false && (
          <>
            {/* Button Text */}
            <div>
              <PanelLabel htmlFor="install-button-text">Install Button Text</PanelLabel>
              <PanelInput
                id="install-button-text"
                value={cardData?.pwaInstallButtonText || 'Install App'}
                onChange={(e) => onUpdate?.({ pwaInstallButtonText: e.target.value })}
                placeholder="Install App"
                data-testid="input-install-button-text"
              />
            </div>

            {/* Button Color */}
            <div>
              <PanelLabel htmlFor="install-button-color">Button Color</PanelLabel>
              <div className="flex items-center gap-2">
                <PanelColorPicker
                  id="install-button-color"
                  value={cardData?.pwaInstallButtonColor || '#22c55e'}
                  onChange={(e) => onUpdate?.({ pwaInstallButtonColor: e.target.value })}
                  data-testid="input-install-button-color"
                />
                <span className="text-xs font-mono" style={{ color: panelTheme.colors.textSecondary }}>
                  {cardData?.pwaInstallButtonColor || '#22c55e'}
                </span>
              </div>
            </div>

            {/* Text Color */}
            <div>
              <PanelLabel htmlFor="install-text-color">Text Color</PanelLabel>
              <div className="flex items-center gap-2">
                <PanelColorPicker
                  id="install-text-color"
                  value={cardData?.pwaInstallButtonTextColor || '#ffffff'}
                  onChange={(e) => onUpdate?.({ pwaInstallButtonTextColor: e.target.value })}
                  data-testid="input-install-text-color"
                />
                <span className="text-xs font-mono" style={{ color: panelTheme.colors.textSecondary }}>
                  {cardData?.pwaInstallButtonTextColor || '#ffffff'}
                </span>
              </div>
            </div>

            {/* Button Size */}
            <div>
              <PanelLabel htmlFor="install-button-size">Button Size</PanelLabel>
              <PanelSelect
                value={cardData?.pwaInstallButtonSize || 'md'}
                onValueChange={(value) => onUpdate?.({ pwaInstallButtonSize: value as 'sm' | 'md' | 'lg' })}
              >
                <SelectItem value="sm">Small</SelectItem>
                <SelectItem value="md">Medium</SelectItem>
                <SelectItem value="lg">Large</SelectItem>
              </PanelSelect>
            </div>

            {/* Button Style */}
            <div>
              <PanelLabel htmlFor="install-button-style">Button Style</PanelLabel>
              <PanelSelect
                value={cardData?.pwaInstallButtonStyle || 'solid'}
                onValueChange={(value) => onUpdate?.({ pwaInstallButtonStyle: value as 'solid' | 'outline' | 'ghost' })}
              >
                <SelectItem value="solid">Filled</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
              </PanelSelect>
            </div>

            {/* Button Alignment */}
            <div>
              <PanelLabel htmlFor="install-button-alignment">Button Alignment</PanelLabel>
              <PanelSelect
                value={cardData?.pwaInstallButtonAlignment || 'center'}
                onValueChange={(value) => onUpdate?.({ pwaInstallButtonAlignment: value as 'left' | 'center' | 'right' })}
              >
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </PanelSelect>
            </div>
          </>
        )}

        <div className="p-3 rounded-md mt-4" style={{ backgroundColor: `${panelTheme.colors.accent}20`, borderColor: panelTheme.colors.accent, border: '1px solid' }}>
          <p className="text-xs" style={{ color: panelTheme.colors.textSecondary }}>
            <i className="fas fa-info-circle mr-2"></i>
            Install button appears on Android (Chrome, Edge, Firefox) and iPhone (Safari) only.
          </p>
        </div>
      </div>
    );
  }

  // DISPLAY MODE - Read all settings from cardData PWA settings
  if (!cardData?.pwaInstallButtonEnabled) {
    return null;
  }

  // If already installed, hide the button
  if (isInstalled) {
    return null;
  }

  const buttonSize = cardData?.pwaInstallButtonSize || 'md';
  const buttonColor = cardData?.pwaInstallButtonColor || '#22c55e';
  const textColor = cardData?.pwaInstallButtonTextColor || '#ffffff';
  const buttonStyle = cardData?.pwaInstallButtonStyle || 'filled';
  const alignment = cardData?.pwaInstallButtonAlignment || 'center';
  const buttonText = cardData?.pwaInstallButtonText || 'Install App';

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
