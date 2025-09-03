export interface DigitalWalletProps {
  children?: React.ReactNode;
  className?: string;
}

export interface DigitalWalletConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}
