import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ParagraphRenderer } from "./renderer";
import { ParagraphEditor } from "./editor";

function ParagraphElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ParagraphEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ParagraphRenderer {...props} />;
}

export const paragraphConfig: ElementConfig = {
  metadata: {
    type: "paragraph",
    title: "Paragraph",
    icon: "FileText",
    category: "Basic",
    description: "Add text content to your card"
  },
  defaultData: () => ({ 
    text: "Enter your text here...", 
    alignment: "left" as const,
    size: "base"
  }),
  Renderer: ParagraphElementRenderer,
  Editor: ParagraphEditor
};

export default paragraphConfig;
