export interface AnalyticsProps {
  children?: React.ReactNode;
  className?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}
