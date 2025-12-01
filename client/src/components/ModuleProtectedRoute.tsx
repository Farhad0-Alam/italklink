import { useLocation } from "wouter";
import { useUserPlan } from "@/hooks/useUserPlan";
import { UpgradePrompt } from "./UpgradePrompt";
import { Loader2 } from "lucide-react";

type ModuleName = 
  | 'crm' 
  | 'appointments' 
  | 'analytics' 
  | 'nfc' 
  | 'digitalShop' 
  | 'emailSignature' 
  | 'voiceConversation'
  | 'bulkGeneration'
  | 'customDomain'
  | 'apiAccess'
  | 'whiteLabel'
  | 'visitorNotifications';

const ModuleDisplayNames: Record<ModuleName, string> = {
  crm: 'CRM & Lead Management',
  appointments: 'Appointment Booking',
  analytics: 'Advanced Analytics',
  nfc: 'NFC Tag Management',
  digitalShop: 'Digital Product Shop',
  emailSignature: 'Email Signature Generator',
  voiceConversation: 'Voice Conversation',
  bulkGeneration: 'Bulk Card Generation',
  customDomain: 'Custom Domain',
  apiAccess: 'API Access',
  whiteLabel: 'White Label Options',
  visitorNotifications: 'Visitor Notifications',
};

const ModuleRequiredPlans: Record<ModuleName, string> = {
  crm: 'Pro Plan',
  appointments: 'Pro Plan',
  analytics: 'Pro Plan',
  nfc: 'Pro Plan',
  digitalShop: 'Pro Plan',
  emailSignature: 'Pro Plan',
  voiceConversation: 'Enterprise Plan',
  bulkGeneration: 'Enterprise Plan',
  customDomain: 'Enterprise Plan',
  apiAccess: 'Enterprise Plan',
  whiteLabel: 'Enterprise Plan',
  visitorNotifications: 'Pro Plan',
};

interface ModuleProtectedRouteProps {
  module: ModuleName;
  children: React.ReactNode;
  redirectOnUnauthorized?: boolean;
  redirectPath?: string;
}

export function ModuleProtectedRoute({
  module,
  children,
  redirectOnUnauthorized = false,
  redirectPath = '/pricing',
}: ModuleProtectedRouteProps) {
  const [, setLocation] = useLocation();
  const { hasModule, isAdmin, isLoading } = useUserPlan();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const hasAccess = isAdmin || hasModule(module);

  if (!hasAccess) {
    if (redirectOnUnauthorized) {
      setLocation(redirectPath);
      return null;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <UpgradePrompt
          featureName={ModuleDisplayNames[module]}
          requiredPlan={ModuleRequiredPlans[module]}
        />
      </div>
    );
  }

  return <>{children}</>;
}
