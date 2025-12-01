import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';

export interface UserPlanData {
  hasPlan: boolean;
  plan: {
    id: number;
    name: string;
    planType: string;
    price: number;
    businessCardsLimit: number;
    elementFeatures: number[];
    templateIds: string[];
    moduleFeatures: Record<string, boolean>;
    features: any;
    unlimitedElements?: boolean;
    unlimitedTemplates?: boolean;
    unlimitedModules?: boolean;
  } | null;
  elementFeatures: number[];
  templateIds: string[];
  moduleFeatures: Record<string, boolean>;
  businessCardsLimit: number;
  subscription: {
    status: string;
    startDate: string;
    endDate: string | null;
    isActive: boolean;
  } | null;
  isAdmin: boolean;
  unlimitedElements?: boolean;
  unlimitedTemplates?: boolean;
  unlimitedModules?: boolean;
}

export function useUserPlan() {
  const { user, isAuthenticated } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<{ success: boolean; data: UserPlanData }>({
    queryKey: ['/api/billing/user/plan'],
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const planData = data?.data;
  
  const isPlanLoaded = !isLoading && !!planData;

  // Normalize elementFeatures to numbers once (API may return strings from JSON)
  const normalizedElementFeatures = planData?.elementFeatures 
    ? planData.elementFeatures.map((id: any) => Number(id)).filter((id: number) => !isNaN(id))
    : [];

  const hasElement = (elementId: number): boolean => {
    if (isLoading) return false;
    if (!planData) return false;
    if (planData.isAdmin) return true;
    if (planData.unlimitedElements || planData.plan?.unlimitedElements) return true;
    if (normalizedElementFeatures.length === 0) return false;
    return normalizedElementFeatures.includes(elementId);
  };

  const hasTemplate = (templateId: string): boolean => {
    if (isLoading) return false;
    if (!planData) return false;
    if (planData.isAdmin) return true;
    if (planData.unlimitedTemplates || planData.plan?.unlimitedTemplates) return true;
    if (!planData.templateIds || planData.templateIds.length === 0) return false;
    return planData.templateIds.includes(templateId);
  };

  const hasModule = (moduleName: string): boolean => {
    if (isLoading) return false;
    if (!planData) return false;
    if (planData.isAdmin) return true;
    if (planData.unlimitedModules || planData.plan?.unlimitedModules) return true;
    if (!planData.moduleFeatures || Object.keys(planData.moduleFeatures).length === 0) return false;
    return planData.moduleFeatures[moduleName] === true;
  };

  const canAccessCRM = (): boolean => hasModule('crm');
  const canAccessAppointments = (): boolean => hasModule('appointments');
  const canAccessAnalytics = (): boolean => hasModule('analytics');
  const canAccessNFC = (): boolean => hasModule('nfc');
  const canAccessDigitalShop = (): boolean => hasModule('digitalShop');
  const canAccessEmailSignature = (): boolean => hasModule('emailSignature');
  const canAccessVoiceConversation = (): boolean => hasModule('voiceConversation');
  const canAccessBulkGeneration = (): boolean => hasModule('bulkGeneration');
  const canAccessCustomDomain = (): boolean => hasModule('customDomain');
  const canAccessAPIAccess = (): boolean => hasModule('apiAccess');
  const canAccessWhiteLabel = (): boolean => hasModule('whiteLabel');
  const canAccessVisitorNotifications = (): boolean => hasModule('visitorNotifications');

  const getBusinessCardsLimit = (): number => {
    if (!planData) return 1;
    if (planData.isAdmin) return -1;
    return planData.businessCardsLimit || 1;
  };

  const isUnlimitedCards = (): boolean => {
    return getBusinessCardsLimit() === -1;
  };

  return {
    planData,
    isLoading,
    isPlanLoaded,
    error,
    refetch,
    isAdmin: planData?.isAdmin || false,
    hasPlan: planData?.hasPlan || false,
    plan: planData?.plan || null,
    elementFeatures: normalizedElementFeatures,
    templateIds: planData?.templateIds || [],
    moduleFeatures: planData?.moduleFeatures || {},
    businessCardsLimit: getBusinessCardsLimit(),
    subscription: planData?.subscription || null,
    hasElement,
    hasTemplate,
    hasModule,
    canAccessCRM,
    canAccessAppointments,
    canAccessAnalytics,
    canAccessNFC,
    canAccessDigitalShop,
    canAccessEmailSignature,
    canAccessVoiceConversation,
    canAccessBulkGeneration,
    canAccessCustomDomain,
    canAccessAPIAccess,
    canAccessWhiteLabel,
    canAccessVisitorNotifications,
    getBusinessCardsLimit,
    isUnlimitedCards,
  };
}
