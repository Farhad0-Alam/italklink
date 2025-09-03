export interface FormBuilderProps {
  children?: React.ReactNode;
  className?: string;
}

export interface FormBuilderConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}
