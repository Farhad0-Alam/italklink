// Main exports for BusinessCards module
export { BusinessCardComponent } from './components/BusinessCard';
export { useBusinessCards } from './hooks/useBusinessCards';
export type { BusinessCardProps, BusinessCardsProps, BusinessCardsConfig } from './types';

// Re-export for backward compatibility
export { BusinessCardComponent as BusinessCards } from './components/BusinessCard';

// Module metadata
export const businessCardsModule = {
  name: 'BusinessCards',
  version: '1.0.0',
  description: 'Business Cards module for 2TalkLink',
  type: 'feature'
};
