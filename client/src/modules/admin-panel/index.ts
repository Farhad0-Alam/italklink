// Main exports for AdminPanel module
export { AdminPanel } from './components/AdminPanel';
export { useAdminPanel } from './hooks/useAdminPanel';
export type { AdminPanelProps, AdminPanelConfig } from './types';

// Module metadata
export const adminPanelModule = {
  name: 'AdminPanel',
  version: '1.0.0',
  description: 'AdminPanel module for 2TalkLink',
  type: 'feature'
};
