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

interface ModuleGateProps {
  module: ModuleName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
  requiredPlan?: string;
}

export function ModuleGate({
  module,
  children,
  fallback,
  showUpgradePrompt = true,
  requiredPlan = 'Pro Plan',
}: ModuleGateProps) {
  const { hasModule, isAdmin, isLoading, moduleFeatures } = useUserPlan();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasAccess = isAdmin || hasModule(module);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        featureName={ModuleDisplayNames[module]}
        requiredPlan={requiredPlan}
      />
    );
  }

  return null;
}

export function useModuleAccess(module: ModuleName): { hasAccess: boolean; isLoading: boolean } {
  const { hasModule, isAdmin, isLoading } = useUserPlan();
  
  return {
    hasAccess: isAdmin || hasModule(module),
    isLoading,
  };
}
