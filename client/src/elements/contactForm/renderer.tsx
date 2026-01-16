import { ElementRendererProps } from "../registry/types";
import { PageElementRenderer as LegacyPageElementRenderer } from "@/components/page-element";

export function ContactFormRenderer({ element, isEditing, onUpdate, onSave, cardData }: ElementRendererProps) {
  return (
    <LegacyPageElementRenderer
      element={element}
      isEditing={false}
      onUpdate={onUpdate}
      onSave={onSave}
      cardData={cardData}
    />
  );
}
