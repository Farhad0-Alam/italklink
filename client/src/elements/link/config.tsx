import { ElementConfig, ElementRendererProps } from "../registry/types";
import { LinkRenderer } from "./renderer";
import { LinkEditor } from "./editor";

function LinkElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <LinkEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <LinkRenderer {...props} />;
}

export const linkConfig: ElementConfig = {
  metadata: {
    type: "link",
    title: "3D Button",
    icon: "Link",
    category: "Basic",
    description: "Add a clickable button or link"
  },
  defaultData: () => ({ 
    text: "Click Here", 
    url: "https://example.com", 
    style: "button" as const,
    variant: "primary" as const,
    size: "md",
    fullWidth: false
  }),
  Renderer: LinkElementRenderer,
  Editor: LinkEditor
};

export default linkConfig;
