import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Monitor, X } from 'lucide-react';
import { usePWA } from '@/hooks/usePWA';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export const PWAInstallButton = () => {
  const { isInstallable, isInstalled, installApp } = usePWA();
  const [showModal, setShowModal] = useState(false);

  if (isInstalled) {
    return null; // Don't show button if already installed
  }

  if (!isInstallable) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="default"
        size="sm"
        onClick={installApp}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <Download className="h-4 w-4 mr-2" />
        Install App
      </Button>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-gray-700">
                Install Admin Dashboard
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
              Install the 2TalkLink Admin Dashboard for quick access and offline functionality.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <Smartphone className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <h3 className="font-medium text-sm">Mobile</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Access dashboard on your phone or tablet
                </p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Monitor className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <h3 className="font-medium text-sm">Desktop</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Quick access from your desktop or laptop
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Benefits:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Fast loading and offline access</li>
                <li>• Push notifications for important updates</li>
                <li>• Native app-like experience</li>
                <li>• Quick access from home screen</li>
              </ul>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm text-gray-600">
                Manual Installation Instructions:
              </p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Chrome/Edge:</strong> Click menu → "Install app"</p>
                <p><strong>Safari (iOS):</strong> Share → "Add to Home Screen"</p>
                <p><strong>Firefox:</strong> Address bar → Install icon</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};