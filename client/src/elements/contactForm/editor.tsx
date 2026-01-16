import { ElementEditorProps } from "../registry/types";
import { PageElementRenderer as LegacyPageElementRenderer } from "@/components/page-element";

export function ContactFormEditor({ element, onUpdate, onSave, cardData }: ElementEditorProps) {
  return (
    <LegacyPageElementRenderer
      element={element}
      isEditing={true}
      onUpdate={onUpdate}
      onSave={onSave}
      cardData={cardData}
    />
  );
}
