import { ElementConfig, ElementRendererProps } from "../registry/types";
import { NavigationMenuRenderer } from "./renderer";
import { NavigationMenuEditor } from "./editor";
import { generateFieldId } from "@/lib/card-data";

function NavigationMenuElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <NavigationMenuEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <NavigationMenuRenderer {...props} />;
}

export const navigationMenuConfig: ElementConfig = {
  metadata: {
    type: "navigationMenu",
    title: "Navigation",
    icon: "Layout",
    category: "Layout",
    description: "Add navigation menu for multi-page cards"
  },
  defaultData: () => ({
    items: [
      { id: generateFieldId(), label: "Home", url: "#home", icon: "fas fa-home" },
      { id: generateFieldId(), label: "About", url: "#about", icon: "fas fa-user" },
      { id: generateFieldId(), label: "Contact", url: "#contact", icon: "fas fa-phone" }
    ],
    position: "top" as const,
    layout: "horizontal" as const,
    showIcons: true
  }),
  Renderer: NavigationMenuElementRenderer,
  Editor: NavigationMenuEditor
};

export default navigationMenuConfig;
