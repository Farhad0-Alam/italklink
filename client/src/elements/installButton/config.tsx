import { ElementConfig, ElementRendererProps } from "../registry/types";
import { InstallButtonRenderer } from "./renderer";
import { InstallButtonEditor } from "./editor";

function InstallButtonElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <InstallButtonEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <InstallButtonRenderer {...props} />;
}

export const installButtonConfig: ElementConfig = {
  metadata: {
    type: "installButton",
    title: "Install Button",
    icon: "Plus",
    category: "Advanced",
    description: "Add PWA install button"
  },
  defaultData: () => ({
    text: "Install App",
    platform: "both" as const,
    position: "bottom-right" as const,
    showBadge: true,
    delay: 0
  }),
  Renderer: InstallButtonElementRenderer,
  Editor: InstallButtonEditor
};

export default installButtonConfig;
