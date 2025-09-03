// Main exports for UserManagement module
export { UserManagement } from './components/UserManagement';
export { useUserManagement } from './hooks/useUserManagement';
export type { UserManagementProps, UserManagementConfig } from './types';

// Module metadata
export const userManagementModule = {
  name: 'UserManagement',
  version: '1.0.0',
  description: 'UserManagement module for 2TalkLink',
  type: 'feature'
};
