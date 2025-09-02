import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download, Wallet, Plus } from 'lucide-react';

interface WalletButtonsProps {
  ecardId: string;
  cardData?: {
    fullName?: string;
    brandColor?: string;
  };
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

interface WalletStatus {
  hasApple: boolean;
  hasGoogle: boolean;
  lastGeneratedAt: string | null;
}

export function WalletButtons({ 
  ecardId, 
  cardData, 
  showLabels = true, 
  size = 'md' 
}: WalletButtonsProps) {
  const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState<'apple' | 'google' | null>(null);
  const { toast } = useToast();

  // Detect user's platform
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);
  const isMac = /Macintosh/.test(navigator.userAgent);
  
  // Show Apple Wallet primarily on iOS/Mac, Google Wallet on Android
  const showAppleFirst = isIOS || isMac;
  const showGoogleFirst = isAndroid;

  // Load wallet status
  useEffect(() => {
    const loadWalletStatus = async () => {
      try {
        const response = await fetch(`/api/wallet/status/${ecardId}`);
        if (response.ok) {
          const status = await response.json();
          setWalletStatus(status);
        }
      } catch (error) {
        console.error('Failed to load wallet status:', error);
      }
    };

    loadWalletStatus();
  }, [ecardId]);

  const generateApplePass = async () => {
    setGenerating('apple');
    try {
      const response = await fetch(`/api/wallet/apple/${ecardId}/create`, {
        method: 'POST',
      });
      
      if (response.status === 501) {
        // Service not configured yet
        const result = await response.json();
        toast({
          title: "Apple Wallet - Coming Soon",
          description: "Apple Wallet integration is being set up. You'll be able to add business cards to Apple Wallet soon!",
          duration: 5000,
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to generate Apple pass');
      }
      
      // Download the .pkpass file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${cardData?.fullName || 'BusinessCard'}.pkpass`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Apple Wallet Pass Created",
        description: "The pass has been downloaded. Tap to add it to Apple Wallet.",
      });
      
      // Refresh status
      setWalletStatus(prev => prev ? { ...prev, hasApple: true } : null);
      
    } catch (error) {
      console.error('Error generating Apple pass:', error);
      toast({
        title: "Error",
        description: "Failed to create Apple Wallet pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const generateGooglePass = async () => {
    setGenerating('google');
    try {
      const response = await fetch(`/api/wallet/google/${ecardId}/create`, {
        method: 'POST',
      });
      
      if (response.status === 501) {
        // Service not configured yet
        const result = await response.json();
        toast({
          title: "Google Wallet - Coming Soon",
          description: "Google Wallet integration is being set up. You'll be able to add business cards to Google Wallet soon!",
          duration: 5000,
        });
        return;
      }
      
      if (!response.ok) {
        throw new Error('Failed to generate Google pass');
      }
      
      const result = await response.json();
      
      // Open Google Wallet add URL
      if (result.addToGoogleWalletUrl) {
        window.open(result.addToGoogleWalletUrl, '_blank');
        
        toast({
          title: "Google Wallet Pass Created",
          description: "Opening Google Wallet to add your business card.",
        });
        
        // Refresh status
        setWalletStatus(prev => prev ? { ...prev, hasGoogle: true } : null);
      }
      
    } catch (error) {
      console.error('Error generating Google pass:', error);
      toast({
        title: "Error", 
        description: "Failed to create Google Wallet pass. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(null);
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base'
  };

  const iconSize = size === 'sm' ? 14 : size === 'md' ? 16 : 18;

  if (!walletStatus && !loading) {
    return null; // Still loading or failed to load
  }

  return (
    <div className={`flex gap-2 ${showLabels ? 'flex-col sm:flex-row' : 'flex-row'}`}>
      {/* Apple Wallet Button */}
      <Button
        onClick={generateApplePass}
        disabled={generating === 'apple'}
        variant="outline"
        className={`
          ${sizeClasses[size]}
          bg-black hover:bg-gray-800 text-white border-black 
          dark:bg-gray-900 dark:hover:bg-gray-800 dark:border-gray-700
          transition-all duration-200
          ${showAppleFirst ? 'order-1' : 'order-2'}
        `}
        data-testid="button-add-apple-wallet"
      >
        <Wallet className="mr-2" size={iconSize} />
        {generating === 'apple' ? 'Creating...' : showLabels ? 'Add to Apple Wallet' : 'Apple'}
      </Button>

      {/* Google Wallet Button */}
      <Button
        onClick={generateGooglePass}
        disabled={generating === 'google'}
        variant="outline"
        className={`
          ${sizeClasses[size]}
          bg-blue-600 hover:bg-blue-700 text-white border-blue-600
          dark:bg-blue-700 dark:hover:bg-blue-800 dark:border-blue-600
          transition-all duration-200
          ${showGoogleFirst ? 'order-1' : 'order-2'}
        `}
        data-testid="button-add-google-wallet"
      >
        <Plus className="mr-2" size={iconSize} />
        {generating === 'google' ? 'Creating...' : showLabels ? 'Add to Google Wallet' : 'Google'}
      </Button>
      
      {/* QR Code Download (fallback) */}
      <Button
        onClick={() => {
          const qrUrl = `/api/wallet/qr/${ecardId}`;
          const a = document.createElement('a');
          a.href = qrUrl;
          a.download = `${cardData?.fullName || 'BusinessCard'}-QR.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          
          toast({
            title: "QR Code Downloaded",
            description: "You can share or print this QR code to let others access your business card.",
          });
        }}
        variant="ghost"
        className={`
          ${sizeClasses[size]}
          text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200
          order-3
        `}
        data-testid="button-download-qr"
      >
        <Download className="mr-2" size={iconSize} />
        {showLabels ? 'Download QR' : 'QR'}
      </Button>
    </div>
  );
}