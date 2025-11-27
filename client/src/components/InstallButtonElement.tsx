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

  // In editing mode, just show a placeholder
  if (isEditing) {
    return (
      <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <i className="fas fa-download text-blue-600 text-lg"></i>
          <h3 className="font-semibold text-blue-800">Install Button</h3>
        </div>
        <p className="text-sm text-blue-700">
          Configured in Theme Settings. Customize text, colors, and size there.
        </p>
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
