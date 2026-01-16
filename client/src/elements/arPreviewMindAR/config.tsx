import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ARPreviewRenderer } from "./renderer";
import { ARPreviewEditor } from "./editor";

function ARPreviewElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ARPreviewEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ARPreviewRenderer {...props} />;
}

export const arPreviewMindARConfig: ElementConfig = {
  metadata: {
    type: "arPreviewMindAR",
    title: "AR Preview",
    icon: "Layout",
    category: "Advanced",
    description: "Add augmented reality preview"
  },
  defaultData: () => ({
    modelUrl: "",
    markerPattern: "",
    camera: "user" as const,
    scale: 1,
    rotation: "0 0 0",
    position: "0 0 0",
    showControls: true
  }),
  Renderer: ARPreviewElementRenderer,
  Editor: ARPreviewEditor
};

export default arPreviewMindARConfig;
