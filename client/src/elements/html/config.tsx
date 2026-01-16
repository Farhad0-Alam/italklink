import { ElementConfig, ElementRendererProps } from "../registry/types";
import { HTMLRenderer } from "./renderer";
import { HTMLEditor } from "./editor";

function HTMLElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <HTMLEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <HTMLRenderer {...props} />;
}

export const htmlConfig: ElementConfig = {
  metadata: {
    type: "html",
    title: "Custom HTML",
    icon: "FileText",
    category: "Advanced",
    description: "Add custom HTML code"
  },
  defaultData: () => ({
    code: "<div>Your custom HTML here</div>",
    height: "auto",
    sanitize: true,
    allowScripts: false
  }),
  Renderer: HTMLElementRenderer,
  Editor: HTMLEditor
};

export default htmlConfig;
