import { Input } from "@/components/ui/input";
import { AIChat } from "@/components/ai-chat";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function AIChatbotRenderer({ element, isEditing, onUpdate }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    return (
      <div className="mb-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
          <h4 className="text-md font-semibold text-slate-800">AI Chatbot</h4>
          
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Greeting Message</label>
            <Input
              value={elementData.greeting || "Hello! How can I help you today?"}
              onChange={(e) => handleDataUpdate({ greeting: e.target.value })}
              placeholder="Greeting message"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Input Placeholder</label>
            <Input
              value={elementData.placeholder || "Type your message..."}
              onChange={(e) => handleDataUpdate({ placeholder: e.target.value })}
              placeholder="Input placeholder"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <i className="fas fa-info-circle mr-2"></i>
              AI Chatbot will appear as a floating chat widget.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <AIChat
        greeting={elementData.greeting}
        placeholder={elementData.placeholder}
      />
    </div>
  );
}

export const aiChatbotConfig: ElementConfig = {
  metadata: {
    type: "aiChatbot",
    title: "AI Chatbot",
    icon: "Bot",
    category: "AI & Voice",
    description: "Add an AI chatbot"
  },
  defaultData: () => ({
    greeting: "Hello! How can I help you today?",
    placeholder: "Type your message...",
    position: "bottom-right" as const,
    autoOpen: false,
    showAvatar: true
  }),
  Renderer: AIChatbotRenderer
};

export default aiChatbotConfig;
