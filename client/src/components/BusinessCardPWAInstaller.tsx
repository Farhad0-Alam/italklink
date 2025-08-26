import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, X } from 'lucide-react';
import { useBusinessCardPWA } from '@/hooks/useBusinessCardPWA';
import { BusinessCard } from '@shared/schema';
import {
  Dialog,
  DialogContent,
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

      {/* Install Instructions Modal - 2TalkLink Design */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-lg p-0 bg-white">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Install Business Card</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowModal(false)}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-gray-600 text-sm leading-relaxed">
              Install {cardData.fullName || 'this person'}'s digital business card on your device for quick access.
            </p>

            {/* Install as App Section */}
            <div className="bg-green-50 rounded-lg p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-12 bg-green-600 rounded-md relative">
                  <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-2 left-1/2 transform -translate-x-1/2"></div>
                  <div className="w-4 h-0.5 bg-white rounded absolute bottom-1.5 left-1/2 transform -translate-x-1/2"></div>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Install as App</h3>
              <p className="text-sm text-gray-600">
                Add this business card to your home screen for instant access.
              </p>
            </div>

            {/* Installation Instructions */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Installation Instructions:</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Chrome/Android:</span> Tap "Add to Home screen" notification
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Safari/iOS:</span> Share → "Add to Home Screen"
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center mt-0.5">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-medium">Desktop:</span> Look for install icon in address bar
                  </div>
                </div>
              </div>
            </div>

            {/* Why Install */}
            <div>
              <h4 className="font-semibold text-blue-700 mb-3">Why Install?</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-sm text-blue-700">Instant access from home screen</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-sm text-blue-700">Works offline once installed</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-sm text-blue-700">Native app-like experience</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-sm text-blue-700">Quick contact sharing</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600">•</span>
                  <span className="text-sm text-blue-700">Always up-to-date information</span>
                </div>
              </div>
            </div>

            {/* Got it button */}
            <div className="pt-4">
              <Button
                onClick={() => setShowModal(false)}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium"
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