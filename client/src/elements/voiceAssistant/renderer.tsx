import { VoiceAssistantCard } from "@/components/VoiceAssistantCard";
import { ElementRendererProps } from "../registry/types";

export function VoiceAssistantRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <VoiceAssistantCard
        greeting={elementData.greeting}
        language={elementData.language}
        cardData={cardData}
      />
    </div>
  );
}
