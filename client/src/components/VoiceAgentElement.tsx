import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Phone, PhoneCall, Bot, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceAgentElementProps {
  phoneNumber: string;
  agentName?: string;
  description?: string;
  buttonText?: string;
  primaryColor?: string;
  showAgentInfo?: boolean;
  isEditing?: boolean;
}

export function VoiceAgentElement({
  phoneNumber,
  agentName = 'AI Assistant',
  description = 'Call us anytime to speak with our AI assistant',
  buttonText = 'Call Now',
  primaryColor = '#22c55e',
  showAgentInfo = true,
  isEditing = false,
}: VoiceAgentElementProps) {
  const [showCallDialog, setShowCallDialog] = useState(false);
  const { toast } = useToast();

  const handleCallClick = () => {
    if (isEditing) {
      toast({
        title: 'Preview Mode',
        description: 'Phone calling is disabled in preview mode.',
        variant: 'default',
      });
      return;
    }

    // Open call dialog
    setShowCallDialog(true);
  };

  const handleInitiateCall = () => {
    // Initiate the call using tel: protocol
    window.location.href = `tel:${phoneNumber}`;
    setShowCallDialog(false);
    
    toast({
      title: 'Initiating Call',
      description: `Calling ${phoneNumber}...`,
    });
  };

  const formatPhoneNumber = (phone: string) => {
    // Format phone number for display (e.g., +1 234-567-8900)
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 ${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  return (
    <div className="w-full">
      {/* Voice Agent Card */}
      <div 
        className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-sm"
        style={{ borderColor: `${primaryColor}20` }}
      >
        {showAgentInfo && (
          <div className="flex items-start gap-4 mb-4">
            <div 
              className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${primaryColor}15` }}
            >
              <Bot className="w-6 h-6" style={{ color: primaryColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {agentName}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {description}
              </p>
            </div>
          </div>
        )}

        {/* Phone Number Display */}
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-5 h-5 text-gray-500" />
          <a 
            href={`tel:${phoneNumber}`}
            className="text-lg font-medium hover:underline"
            style={{ color: primaryColor }}
            onClick={(e) => {
              if (isEditing) {
                e.preventDefault();
                toast({
                  title: 'Preview Mode',
                  description: 'Phone calling is disabled in preview mode.',
                  variant: 'default',
                });
              }
            }}
          >
            {formatPhoneNumber(phoneNumber)}
          </a>
        </div>

        {/* Call Now Button */}
        <Button
          onClick={handleCallClick}
          className="w-full text-white font-semibold shadow-md hover:shadow-lg transition-all"
          style={{ 
            backgroundColor: primaryColor,
            borderColor: primaryColor,
          }}
          data-testid="button-call-now"
        >
          <PhoneCall className="w-5 h-5 mr-2" />
          {buttonText}
        </Button>

        {/* Features List */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
            <span>24/7 AI-powered support</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
            <span>Instant answers to your questions</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
            <span>Book appointments over the phone</span>
          </div>
        </div>
      </div>

      {/* Call Confirmation Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" style={{ color: primaryColor }} />
              Call {agentName}
            </DialogTitle>
            <DialogDescription>
              You're about to call our AI assistant at {formatPhoneNumber(phoneNumber)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Our AI assistant will help you with:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• Answering questions about our services</li>
                <li>• Scheduling appointments</li>
                <li>• Providing information from our knowledge base</li>
                <li>• Connecting you with the right person</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleInitiateCall}
                className="flex-1 text-white font-semibold"
                style={{ 
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
                data-testid="button-confirm-call"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button
                onClick={() => setShowCallDialog(false)}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel-call"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
