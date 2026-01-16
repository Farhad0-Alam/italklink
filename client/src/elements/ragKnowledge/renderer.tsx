import { RAGChatBox } from "@/components/RAGChatBox";
import { ElementRendererProps } from "../registry/types";

export function RAGKnowledgeRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <RAGChatBox
        cardId={cardData?.id}
        placeholder={elementData.placeholder}
      />
    </div>
  );
}
