import { ElementConfig, ElementRendererProps } from "../registry/types";
import { HeadingRenderer } from "./renderer";
import { HeadingEditor } from "./editor";

function HeadingElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <HeadingEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <HeadingRenderer {...props} />;
}

export const headingConfig: ElementConfig = {
  metadata: {
    type: "heading",
    title: "Heading",
    icon: "Type",
    category: "Basic",
    description: "Add a heading to your card"
  },
  defaultData: () => ({ 
    text: "New Heading", 
    level: "h2" as const, 
    alignment: "center" as const,
    size: "lg"
  }),
  Renderer: HeadingElementRenderer,
  Editor: HeadingEditor
};

export default headingConfig;
