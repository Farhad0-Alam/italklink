import { Feature, hasFeatureAccess, FeatureNames, getRequiredPlanForFeature } from "@/lib/featureAccess";
import { UpgradePrompt } from "./UpgradePrompt";

interface UserSubscription {
  id: string;
  planId: number;
  userCount: number;
  pricePaid: number;
  features: any;
  isActive: boolean;
  status: string;
}

interface FeatureGateProps {
  feature: Feature;
  subscription: UserSubscription | null | undefined;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgradePrompt?: boolean;
}

export function FeatureGate({
  feature,
  subscription,
  children,
  fallback,
  showUpgradePrompt = true,
}: FeatureGateProps) {
  const hasAccess = hasFeatureAccess(subscription, feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showUpgradePrompt) {
    return (
      <UpgradePrompt
        featureName={FeatureNames[feature]}
        requiredPlan={getRequiredPlanForFeature(feature)}
      />
    );
  }

  return null;
}
