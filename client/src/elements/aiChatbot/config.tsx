import { ElementConfig, ElementRendererProps } from "../registry/types";
import { AIChatbotRenderer } from "./renderer";
import { AIChatbotEditor } from "./editor";

function AIChatbotElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <AIChatbotEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <AIChatbotRenderer {...props} />;
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
  Renderer: AIChatbotElementRenderer,
  Editor: AIChatbotEditor
};

export default aiChatbotConfig;
