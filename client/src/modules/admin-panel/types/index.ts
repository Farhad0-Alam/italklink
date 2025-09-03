export interface AdminPanelProps {
  children?: React.ReactNode;
  className?: string;
}

export interface AdminPanelConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}
