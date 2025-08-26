import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useBusinessCardPWA } from '@/hooks/useBusinessCardPWA';
import { BusinessCard } from '@shared/schema';

interface BusinessCardPWAInstallerProps {
  cardData: BusinessCard;
  className?: string;
}

export const BusinessCardPWAInstaller = ({ cardData, className = '' }: BusinessCardPWAInstallerProps) => {
  const { 
    isInstallable, 
    isInstalled, 
    installBusinessCard
  } = useBusinessCardPWA(cardData);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    setInstalling(true);
    await installBusinessCard();
    setInstalling(false);
  };

  // Only show if installable and not already installed (like 2TalkLink)
  if (!isInstallable || isInstalled) {
    return null;
  }

  return (
    /* Floating Install Button - Only shows when PWA installable */
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      <Button
        onClick={handleInstall}
        disabled={installing}
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-200 flex items-center space-x-2"
      >
        <Download className="h-5 w-5" />
        <span className="hidden sm:inline font-medium">
          {installing ? 'Installing...' : 'Install Card'}
        </span>
      </Button>
    </div>
  );
};