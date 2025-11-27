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
  onUpdate?: (element: PageElement) => void;
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

  // Helper to update element with new data
  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        handleDataUpdate({ pwaAppIcon: base64 });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    }
  };

  // In editing mode, show PWA Installation Settings
  if (isEditing) {
    const lightLabel = (label: string) => (
      <label className="text-xs font-medium text-slate-600 block mb-2">
        {label}
      </label>
    );

    const lightInput = (props: any) => (
      <input
        {...props}
        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      />
    );

    const lightColorPicker = (props: any) => (
      <input
        type="color"
        {...props}
        className="h-9 w-16 rounded border border-slate-300 cursor-pointer"
      />
    );

    const lightSelect = (value: string, onChange: (v: string) => void, options: {value: string, label: string}[]) => (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-9 px-3 rounded border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    );

    return (
      <div className="p-4 space-y-4 bg-white rounded-lg border-2 border-slate-200">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
          <i className="fas fa-cog text-slate-700 text-lg"></i>
          <h3 className="font-semibold text-slate-800 text-lg">PWA Installation Settings</h3>
        </div>

        {/* App Name */}
        <div>
          {lightLabel('App Name')}
          {lightInput({
            id: 'install-app-name',
            value: cardData?.pwaAppName || 'APP',
            onChange: (e: any) => handleDataUpdate({ pwaAppName: e.target.value }),
            placeholder: 'Enter app name',
            'data-testid': 'input-install-app-name'
          })}
        </div>

        {/* App Icon */}
        <div>
          {lightLabel('App Icon')}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 border border-slate-300 flex items-center justify-center flex-shrink-0">
              {cardData?.pwaAppIcon ? (
                <img src={cardData.pwaAppIcon} alt="PWA Icon" className="w-full h-full object-cover" />
              ) : (
                <i className="fas fa-image text-slate-400 text-xl"></i>
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
                className="px-3 py-1.5 rounded text-sm font-medium transition-opacity hover:opacity-90 bg-green-500 text-white"
                data-testid="button-upload-install-icon"
              >
                <i className="fas fa-upload mr-1"></i>
                Upload
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        {/* Theme Color */}
        <div>
          {lightLabel('Theme Color')}
          <div className="flex items-center gap-2">
            {lightColorPicker({
              id: 'install-theme-color',
              value: cardData?.pwaThemeColor || '#22c55e',
              onChange: (e: any) => handleDataUpdate({ pwaThemeColor: e.target.value }),
              'data-testid': 'input-install-theme-color'
            })}
            <span className="text-xs font-mono text-slate-600">
              {cardData?.pwaThemeColor || '#22c55e'}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200"></div>

        {/* Enable Install Button */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              id="install-enabled"
              checked={cardData?.pwaInstallButtonEnabled !== false}
              onChange={(e) => handleDataUpdate({ pwaInstallButtonEnabled: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-green-500 focus:ring-green-500"
              data-testid="checkbox-install-enabled"
            />
            <span className="text-sm font-medium text-slate-700">
              <i className="fas fa-download text-green-500 mr-2"></i>
              Enable Install Button
            </span>
          </label>
          <p className="text-xs text-slate-600 mt-1 ml-7">Show install button on card</p>
        </div>

        {cardData?.pwaInstallButtonEnabled !== false && (
          <>
            {/* Button Text */}
            <div>
              {lightLabel('Install Button Text')}
              {lightInput({
                id: 'install-button-text',
                value: cardData?.pwaInstallButtonText || 'Install App',
                onChange: (e: any) => handleDataUpdate({ pwaInstallButtonText: e.target.value }),
                placeholder: 'Install App',
                'data-testid': 'input-install-button-text'
              })}
            </div>

            {/* Button Color */}
            <div>
              {lightLabel('Button Color')}
              <div className="flex items-center gap-2">
                {lightColorPicker({
                  id: 'install-button-color',
                  value: cardData?.pwaInstallButtonColor || '#22c55e',
                  onChange: (e: any) => handleDataUpdate({ pwaInstallButtonColor: e.target.value }),
                  'data-testid': 'input-install-button-color'
                })}
                <span className="text-xs font-mono text-slate-600">
                  {cardData?.pwaInstallButtonColor || '#22c55e'}
                </span>
              </div>
            </div>

            {/* Text Color */}
            <div>
              {lightLabel('Text Color')}
              <div className="flex items-center gap-2">
                {lightColorPicker({
                  id: 'install-text-color',
                  value: cardData?.pwaInstallButtonTextColor || '#ffffff',
                  onChange: (e: any) => onUpdate?.({ pwaInstallButtonTextColor: e.target.value }),
                  'data-testid': 'input-install-text-color'
                })}
                <span className="text-xs font-mono text-slate-600">
                  {cardData?.pwaInstallButtonTextColor || '#ffffff'}
                </span>
              </div>
            </div>

            {/* Button Size */}
            <div>
              {lightLabel('Button Size')}
              {lightSelect(
                cardData?.pwaInstallButtonSize || 'md',
                (value) => onUpdate?.({ pwaInstallButtonSize: value as 'sm' | 'md' | 'lg' }),
                [
                  { value: 'sm', label: 'Small' },
                  { value: 'md', label: 'Medium' },
                  { value: 'lg', label: 'Large' }
                ]
              )}
            </div>

            {/* Button Style */}
            <div>
              {lightLabel('Button Style')}
              {lightSelect(
                cardData?.pwaInstallButtonStyle || 'solid',
                (value) => onUpdate?.({ pwaInstallButtonStyle: value as 'solid' | 'outline' | 'ghost' }),
                [
                  { value: 'solid', label: 'Filled' },
                  { value: 'outline', label: 'Outline' },
                  { value: 'ghost', label: 'Ghost' }
                ]
              )}
            </div>

            {/* Button Alignment */}
            <div>
              {lightLabel('Button Alignment')}
              {lightSelect(
                cardData?.pwaInstallButtonAlignment || 'center',
                (value) => onUpdate?.({ pwaInstallButtonAlignment: value as 'left' | 'center' | 'right' }),
                [
                  { value: 'left', label: 'Left' },
                  { value: 'center', label: 'Center' },
                  { value: 'right', label: 'Right' }
                ]
              )}
            </div>
          </>
        )}

        <div className="p-3 rounded-md border border-blue-200 bg-blue-50">
          <p className="text-xs text-blue-700">
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
