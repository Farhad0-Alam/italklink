import { ElementConfig, ElementRendererProps } from "../registry/types";
import { ContactSectionRenderer } from "./renderer";
import { ContactSectionEditor } from "./editor";
import { generateFieldId } from "@/lib/card-data";

function ContactSectionElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ContactSectionEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <ContactSectionRenderer {...props} />;
}

export const contactSectionConfig: ElementConfig = {
  metadata: {
    type: "contactSection",
    title: "Contact Info",
    icon: "Phone",
    category: "Contact",
    description: "Display contact information"
  },
  defaultData: () => ({ 
    contacts: [
      { 
        id: generateFieldId(), 
        label: "Phone", 
        value: "+1-234-567-8900", 
        icon: "fas fa-phone", 
        type: "phone" as const 
      },
      { 
        id: generateFieldId(), 
        label: "Email", 
        value: "hello@example.com", 
        icon: "fas fa-envelope", 
        type: "email" as const 
      }
    ],
    layout: "vertical" as const,
    showLabels: true
  }),
  Renderer: ContactSectionElementRenderer,
  Editor: ContactSectionEditor
};

export default contactSectionConfig;
