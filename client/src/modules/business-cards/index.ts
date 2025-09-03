// Main exports for BusinessCards module
export { BusinessCards } from './components/BusinessCards';
export { useBusinessCards } from './hooks/useBusinessCards';
export type { BusinessCardsProps, BusinessCardsConfig } from './types';

// Module metadata
export const businessCardsModule = {
  name: 'BusinessCards',
  version: '1.0.0',
  description: 'BusinessCards module for 2TalkLink',
  type: 'feature'
};
