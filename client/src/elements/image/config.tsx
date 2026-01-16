import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ImageRenderer } from "./renderer";
import { ImageEditor } from "./editor";

function ImageElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ImageEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ImageRenderer {...props} />;
}

export const imageConfig: ElementConfig = {
  metadata: {
    type: "image",
    title: "Image",
    icon: "Image",
    category: "Basic",
    description: "Add an image to your card"
  },
  defaultData: () => ({ 
    src: "", 
    alt: "Image",
    width: "100%",
    height: "auto",
    borderRadius: "md",
    shadow: "none"
  }),
  Renderer: ImageElementRenderer,
  Editor: ImageEditor
};

export default imageConfig;
