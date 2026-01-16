import { ElementConfig, ElementRendererProps } from "../registry/types";
import { VoiceAgentRenderer } from "./renderer";
import { VoiceAgentEditor } from "./editor";

function VoiceAgentElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <VoiceAgentEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <VoiceAgentRenderer {...props} />;
}

export const voiceAgentConfig: ElementConfig = {
  metadata: {
    type: "voiceAgent",
    title: "Voice Agent",
    icon: "Phone",
    category: "AI & Voice",
    description: "Add voice calling capability"
  },
  defaultData: () => ({
    phoneNumber: "",
    greeting: "Hello, how can I help you?",
    language: "en" as const,
    voice: "female" as const,
    enabled: true
  }),
  Renderer: VoiceAgentElementRenderer,
  Editor: VoiceAgentEditor
};

export default voiceAgentConfig;
