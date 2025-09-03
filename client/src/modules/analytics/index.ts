// Main exports for Analytics module
export { Analytics } from './components/Analytics';
export { useAnalytics } from './hooks/useAnalytics';
export type { AnalyticsProps, AnalyticsConfig } from './types';

// Module metadata
export const analyticsModule = {
  name: 'Analytics',
  version: '1.0.0',
  description: 'Analytics module for 2TalkLink',
  type: 'feature'
};
