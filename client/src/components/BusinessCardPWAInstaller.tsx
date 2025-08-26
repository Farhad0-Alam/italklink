import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, X, Check } from 'lucide-react';
import { useBusinessCardPWA } from '@/hooks/useBusinessCardPWA';
import { BusinessCard } from '@shared/schema';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface BusinessCardPWAInstallerProps {
  cardData: BusinessCard;
  className?: string;
}

export const BusinessCardPWAInstaller = ({ cardData, className = '' }: BusinessCardPWAInstallerProps) => {
  const { isInstallable, isInstalled, installBusinessCard } = useBusinessCardPWA(cardData);
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  const handleInstall = async () => {
    if (isInstallable) {
      setInstalling(true);
      const success = await installBusinessCard();
      setInstalling(false);
      if (success) {
        setShowModal(false);
      }
    } else {
      setShowModal(true);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Floating Install Button */}
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

      {/* Install Instructions Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-700">
                Install Business Card
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-gray-600">
              Install {cardData.fullName || 'this'}'s digital business card on your device for quick access.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center p-4 border rounded-lg bg-green-50">
              <Smartphone className="h-12 w-12 mx-auto mb-3 text-green-600" />
              <h3 className="font-medium text-lg mb-2">Install as App</h3>
              <p className="text-sm text-gray-600 mb-3">
                Add this business card to your home screen for instant access.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-3">Installation Instructions:</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-green-500" />
                  <span><strong>Chrome/Android:</strong> Tap "Add to Home screen" notification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-green-500" />
                  <span><strong>Safari/iOS:</strong> Share → "Add to Home Screen"</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-3 w-3 text-green-500" />
                  <span><strong>Desktop:</strong> Look for install icon in address bar</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2 text-blue-800">Why Install?</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Instant access from home screen</li>
                <li>• Works offline once installed</li>
                <li>• Native app-like experience</li>
                <li>• Quick contact sharing</li>
                <li>• Always up-to-date information</li>
              </ul>
            </div>

            <div className="text-center">
              <Button
                onClick={() => setShowModal(false)}
                variant="outline"
                className="w-full"
              >
                Got it, thanks!
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};