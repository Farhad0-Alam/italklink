import { ElementConfig, ElementRendererProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";
import { ContactFormRenderer } from "./renderer";
import { ContactFormEditor } from "./editor";

function ContactFormElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <ContactFormEditor element={props.element} onUpdate={props.onUpdate} onSave={props.onSave} cardData={props.cardData} />;
  }
  return <ContactFormRenderer {...props} />;
}

export const contactFormConfig: ElementConfig = {
  metadata: {
    type: "contactForm",
    title: "Contact Form",
    icon: "MessageSquare",
    category: "Contact",
    description: "Add a contact form"
  },
  defaultData: () => ({
    fields: [
      { id: generateFieldId(), type: "text" as const, label: "Name", required: true, placeholder: "Your name" },
      { id: generateFieldId(), type: "email" as const, label: "Email", required: true, placeholder: "Your email" },
      { id: generateFieldId(), type: "textarea" as const, label: "Message", required: false, placeholder: "Your message" }
    ],
    submitText: "Send Message",
    successMessage: "Thank you for your message!",
    errorMessage: "Something went wrong. Please try again.",
    layout: "vertical" as const,
    showLabels: true
  }),
  Renderer: ContactFormElementRenderer,
  Editor: ContactFormEditor
};

export default contactFormConfig;
