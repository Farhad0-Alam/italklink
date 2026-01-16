import { ElementConfig, ElementRendererProps } from "../registry/types";
import { RAGKnowledgeRenderer } from "./renderer";
import { RAGKnowledgeEditor } from "./editor";

function RAGKnowledgeElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <RAGKnowledgeEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <RAGKnowledgeRenderer {...props} />;
}

export const ragKnowledgeConfig: ElementConfig = {
  metadata: {
    type: "ragKnowledge",
    title: "RAG Knowledge",
    icon: "Bot",
    category: "AI & Voice",
    description: "Knowledge-based AI chat"
  },
  defaultData: () => ({
    knowledgeBaseId: "",
    placeholder: "Ask a question about our services...",
    position: "bottom-right" as const,
    sources: [],
    temperature: 0.7
  }),
  Renderer: RAGKnowledgeElementRenderer,
  Editor: RAGKnowledgeEditor
};

export default ragKnowledgeConfig;
