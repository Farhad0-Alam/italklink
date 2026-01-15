import { BusinessCard } from "@shared/schema";

export interface BusinessCardProps {
  data: BusinessCard;
  showQR?: boolean;
  isInteractive?: boolean;
  isMobilePreview?: boolean;
}

export interface BusinessCardsProps {
  children?: React.ReactNode;
  className?: string;
}

export interface BusinessCardsConfig {
  enabled: boolean;
  settings?: Record<string, any>;
}
