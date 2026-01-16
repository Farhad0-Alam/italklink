import { PageElement } from "@shared/schema";

export interface ElementMetadata {
  type: string;
  title: string;
  icon: string;
  category: ElementCategory;
  description?: string;
  isPremium?: boolean;
  elementId?: number;
}

export type ElementCategory = 
  | "Layout"
  | "Basic"
  | "Contact"
  | "Interactive"
  | "AI & Voice"
  | "Booking"
  | "Commerce"
  | "Advanced";

export interface ElementRendererProps {
  element: PageElement;
  isEditing?: boolean;
  onUpdate?: (element: PageElement) => void;
  onDelete?: (elementId: string) => void;
  onSave?: (dataOverride?: any) => Promise<void>;
  isInteractive?: boolean;
  cardData?: any;
  onNavigatePage?: (pageId: string) => void;
}

export interface ElementEditorProps {
  element: PageElement;
  onUpdate: (element: PageElement) => void;
  onSave?: (dataOverride?: any) => Promise<void>;
  cardData?: any;
}

export interface ElementConfig {
  metadata: ElementMetadata;
  defaultData: () => any;
  Renderer: React.ComponentType<ElementRendererProps>;
  Editor?: React.ComponentType<ElementEditorProps>;
}

export interface ElementRegistry {
  [key: string]: ElementConfig;
}
