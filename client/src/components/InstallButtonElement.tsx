import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusinessCard, PageElement } from '@shared/schema';

interface InstallButtonElementProps {
  element: PageElement;
  isEditing: boolean;
  onUpdate?: (element: PageElement) => void;
  cardData?: BusinessCard;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallButtonElement = ({ element, isEditing, onUpdate, cardData }: InstallButtonElementProps) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    // Register service worker for business cards
    if ('serviceWorker' in navigator && !isEditing) {
      navigator.serviceWorker.register('/card-sw.js')
        .catch((error) => {
          console.error('Business Card SW registration failed:', error);
        });
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isEditing]);

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User installed business card app');
        }
        setDeferredPrompt(null);
        setIsInstallable(false);
      } catch (error) {
        console.error('Error installing business card app:', error);
      }
    }
  };

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

          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              <i className="fas fa-info-circle mr-2"></i>
              This button allows visitors to install the business card as a Progressive Web App on their Android or iPhone device.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Display mode - show the install button
  return (
    <div className="flex justify-center py-6">
      <Button
        onClick={handleInstall}
        disabled={!isInstallable || !deferredPrompt}
        className="font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        style={{
          backgroundColor: element.data?.buttonColor || '#22c55e',
          color: element.data?.textColor || '#ffffff',
          padding: element.data?.buttonSize === 'sm' ? '8px 16px' : element.data?.buttonSize === 'lg' ? '16px 32px' : '12px 24px',
          fontSize: element.data?.buttonSize === 'sm' ? '14px' : element.data?.buttonSize === 'lg' ? '18px' : '16px',
          opacity: isInstallable && deferredPrompt ? 1 : 0.5,
          cursor: isInstallable && deferredPrompt ? 'pointer' : 'not-allowed'
        }}
        data-testid="button-install-app"
      >
        <i className="fas fa-download"></i>
        <span>{element.data?.buttonText || 'Install App'}</span>
      </Button>
    </div>
  );
};
