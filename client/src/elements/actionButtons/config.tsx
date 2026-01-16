import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ActionButtonsRenderer } from "./renderer";
import { ActionButtonsEditor } from "./editor";

function ActionButtonsElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ActionButtonsEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ActionButtonsRenderer {...props} />;
}

export const actionButtonsConfig: ElementConfig = {
  metadata: {
    type: "actionButtons",
    title: "Save & Share",
    icon: "Layers",
    category: "Contact",
    description: "Add save contact and share buttons"
  },
  defaultData: () => ({ 
    showSaveContact: true,
    showShare: true,
    showDownload: true,
    layout: "horizontal" as const
  }),
  Renderer: ActionButtonsElementRenderer,
  Editor: ActionButtonsEditor
};

export default actionButtonsConfig;
