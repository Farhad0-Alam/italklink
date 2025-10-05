interface UserSubscription {
  id: string;
  planId: number;
  userCount: number;
  pricePaid: number;
  features: {
    featureList?: number[];
    businessCardsLimit?: number;
    unlimitedCards?: boolean;
    appointmentBooking?: boolean;
    crmAccess?: boolean;
    advancedAnalytics?: boolean;
    teamManagement?: boolean;
    apiAccess?: boolean;
    whiteLabel?: boolean;
    prioritySupport?: boolean;
    customDomain?: boolean;
  };
  isActive: boolean;
  status: string;
}

export enum Feature {
  UNLIMITED_CARDS = 'unlimitedCards',
  APPOINTMENT_BOOKING = 'appointmentBooking',
  CRM_ACCESS = 'crmAccess',
  ADVANCED_ANALYTICS = 'advancedAnalytics',
  TEAM_MANAGEMENT = 'teamManagement',
  API_ACCESS = 'apiAccess',
  WHITE_LABEL = 'whiteLabel',
  PRIORITY_SUPPORT = 'prioritySupport',
  CUSTOM_DOMAIN = 'customDomain',
}

export const FeatureNames: Record<Feature, string> = {
  [Feature.UNLIMITED_CARDS]: 'Unlimited Business Cards',
  [Feature.APPOINTMENT_BOOKING]: 'Appointment Booking',
  [Feature.CRM_ACCESS]: 'CRM & Lead Management',
  [Feature.ADVANCED_ANALYTICS]: 'Advanced Analytics',
  [Feature.TEAM_MANAGEMENT]: 'Team Management',
  [Feature.API_ACCESS]: 'API Access',
  [Feature.WHITE_LABEL]: 'White Label Options',
  [Feature.PRIORITY_SUPPORT]: 'Priority Support',
  [Feature.CUSTOM_DOMAIN]: 'Custom Domain',
};

export const FeatureDescriptions: Record<Feature, string> = {
  [Feature.UNLIMITED_CARDS]: 'Create unlimited digital business cards',
  [Feature.APPOINTMENT_BOOKING]: 'Enable appointment booking on your cards',
  [Feature.CRM_ACCESS]: 'Access CRM features to manage leads and contacts',
  [Feature.ADVANCED_ANALYTICS]: 'View detailed analytics and insights',
  [Feature.TEAM_MANAGEMENT]: 'Manage team members and permissions',
  [Feature.API_ACCESS]: 'Access the API for custom integrations',
  [Feature.WHITE_LABEL]: 'Remove 2TalkLink branding',
  [Feature.PRIORITY_SUPPORT]: 'Get priority customer support',
  [Feature.CUSTOM_DOMAIN]: 'Use your own custom domain',
};

export function hasFeatureAccess(
  subscription: UserSubscription | null | undefined,
  feature: Feature
): boolean {
  if (!subscription || !subscription.isActive) {
    return false;
  }

  return subscription.features?.[feature] === true;
}

export function getBusinessCardLimit(
  subscription: UserSubscription | null | undefined
): number {
  if (!subscription || !subscription.isActive) {
    return 1; // Free plan gets 1 card
  }

  if (subscription.features?.unlimitedCards) {
    return Infinity;
  }

  return subscription.features?.businessCardsLimit || 1;
}

export function canCreateMoreCards(
  subscription: UserSubscription | null | undefined,
  currentCardCount: number
): boolean {
  const limit = getBusinessCardLimit(subscription);
  return currentCardCount < limit;
}

export function getRemainingCards(
  subscription: UserSubscription | null | undefined,
  currentCardCount: number
): number {
  const limit = getBusinessCardLimit(subscription);
  if (limit === Infinity) {
    return Infinity;
  }
  return Math.max(0, limit - currentCardCount);
}

export function isFeatureLocked(
  subscription: UserSubscription | null | undefined,
  feature: Feature
): boolean {
  return !hasFeatureAccess(subscription, feature);
}

export function getRequiredPlanForFeature(feature: Feature): string {
  switch (feature) {
    case Feature.UNLIMITED_CARDS:
    case Feature.APPOINTMENT_BOOKING:
    case Feature.CRM_ACCESS:
    case Feature.ADVANCED_ANALYTICS:
      return 'Pro Plan';
    case Feature.TEAM_MANAGEMENT:
    case Feature.API_ACCESS:
    case Feature.WHITE_LABEL:
    case Feature.PRIORITY_SUPPORT:
    case Feature.CUSTOM_DOMAIN:
      return 'Enterprise Plan';
    default:
      return 'Pro Plan';
  }
}

export interface FeatureGateProps {
  feature: Feature;
  subscription: UserSubscription | null | undefined;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}
