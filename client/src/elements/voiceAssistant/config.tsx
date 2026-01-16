import { ElementConfig, ElementRendererProps } from "../registry/types";
import { VoiceAssistantRenderer } from "./renderer";
import { VoiceAssistantEditor } from "./editor";

function VoiceAssistantElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <VoiceAssistantEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <VoiceAssistantRenderer {...props} />;
}

export const voiceAssistantConfig: ElementConfig = {
  metadata: {
    type: "voiceAssistant",
    title: "Voice Assistant",
    icon: "MessageSquare",
    category: "AI & Voice",
    description: "Add voice assistant widget"
  },
  defaultData: () => ({
    greeting: "Hello! I'm your voice assistant.",
    language: "en" as const,
    position: "bottom-right" as const,
    autoStart: false,
    showInterface: true
  }),
  Renderer: VoiceAssistantElementRenderer,
  Editor: VoiceAssistantEditor
};

export default voiceAssistantConfig;
