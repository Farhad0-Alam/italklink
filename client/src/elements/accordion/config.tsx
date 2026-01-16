import { ElementConfig, ElementRendererProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";
import { AccordionRenderer } from "./renderer";
import { AccordionEditor } from "./editor";

function AccordionElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <AccordionEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <AccordionRenderer {...props} />;
}

export const accordionConfig: ElementConfig = {
  metadata: {
    type: "accordion",
    title: "Accordion",
    icon: "ChevronDown",
    category: "Interactive",
    description: "Collapsible content sections"
  },
  defaultData: () => ({
    items: [
      { id: generateFieldId(), title: "Section 1", content: "Content for section 1" },
      { id: generateFieldId(), title: "Section 2", content: "Content for section 2" }
    ],
    allowMultiple: false,
    defaultOpen: false
  }),
  Renderer: AccordionElementRenderer,
  Editor: AccordionEditor
};

export default accordionConfig;
