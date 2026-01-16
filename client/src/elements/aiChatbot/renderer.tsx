import { AIChat } from "@/components/ai-chat";
import { ElementRendererProps } from "../registry/types";

export function AIChatbotRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <AIChat
        greeting={elementData.greeting}
        placeholder={elementData.placeholder}
      />
    </div>
  );
}
