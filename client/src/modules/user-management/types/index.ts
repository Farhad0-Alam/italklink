export interface UserManagementProps {
  children?: React.ReactNode;
  className?: string;
}

export interface UserManagementConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}
