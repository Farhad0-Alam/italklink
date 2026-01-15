// Main exports for BusinessCards module - redirecting to new location
export { BusinessCardComponent } from '@/components/business-card/BusinessCard';
export { useBusinessCards } from '@/hooks/useBusinessCards';
export type { BusinessCardProps, BusinessCardsProps, BusinessCardsConfig } from '@/types/business-card';

// Re-export for backward compatibility
export { BusinessCardComponent as BusinessCards } from '@/components/business-card/BusinessCard';

// Module metadata
export const businessCardsModule = {
  name: 'BusinessCards',
  version: '1.0.0',
  description: 'Business Cards module for iTalkLink',
  type: 'feature'
};
