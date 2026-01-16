import { PageElement } from "@shared/schema";
import { getElementRenderer } from "./registry";
import { PageElementRenderer as LegacyPageElementRenderer } from "@/components/page-element";

interface PageElementProps {
  element: PageElement;
  isEditing?: boolean;
  onUpdate?: (element: PageElement) => void;
  onDelete?: (elementId: string) => void;
  onSave?: (dataOverride?: any) => Promise<void>;
  isInteractive?: boolean;
  cardData?: any;
  onNavigatePage?: (pageId: string) => void;
}

/**
 * Registry-based PageElementRenderer
 * 
 * This component uses the modular element registry to render elements.
 * If an element type is not found in the registry, it falls back to the legacy renderer.
 */
export function PageElementRenderer({ 
  element, 
  isEditing = false, 
  onUpdate, 
  onDelete, 
  onSave, 
  isInteractive = true, 
  cardData, 
  onNavigatePage 
}: PageElementProps) {
  const Renderer = getElementRenderer(element.type);

  if (Renderer) {
    return (
      <Renderer
        element={element}
        isEditing={isEditing}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onSave={onSave}
        isInteractive={isInteractive}
        cardData={cardData}
        onNavigatePage={onNavigatePage}
      />
    );
  }

  // Fallback to legacy renderer for unregistered element types
  return (
    <LegacyPageElementRenderer
      element={element}
      isEditing={isEditing}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onSave={onSave}
      isInteractive={isInteractive}
      cardData={cardData}
      onNavigatePage={onNavigatePage}
    />
  );
}

export default PageElementRenderer;
