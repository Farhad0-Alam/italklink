import { VoiceAgentElement } from "@/components/VoiceAgentElement";
import { ElementRendererProps } from "../registry/types";

export function VoiceAgentRenderer({ element, onUpdate, onSave, cardData }: ElementRendererProps) {
  return (
    <div className="mb-4">
      <VoiceAgentElement
        element={element}
        onUpdate={onUpdate}
        onSave={onSave}
        cardData={cardData}
      />
    </div>
  );
}
