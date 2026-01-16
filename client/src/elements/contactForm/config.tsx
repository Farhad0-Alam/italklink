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
    title: "Contact Me",
    fieldConfigs: [
      {
        key: "name",
        enabled: true,
        type: "text",
        label: "Name",
        placeholder: "Your Name",
        required: true,
        isCustom: false
      },
      {
        key: "email",
        enabled: true,
        type: "email",
        label: "Email",
        placeholder: "Your Email",
        required: true,
        isCustom: false
      },
      {
        key: "message",
        enabled: true,
        type: "textarea",
        label: "Message",
        placeholder: "Your Message",
        required: true,
        rows: 3,
        isCustom: false
      }
    ],
    fields: ["name", "email", "message"],
    buttonText: "Send Message",
    successMessage: "✅ Message sent successfully!",
    errorMessage: "❌ Failed to send message. Please try again.",
    layout: "stack",
    showLabels: false,
    gap: 12,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
    inputBorderColor: "#cbd5e1",
    titleColor: "#1e293b",
    inputBgColor: "#ffffff",
    inputTextColor: "#0f172a",
    buttonColor: "#1e293b",
    buttonTextColor: "#ffffff",
    redirectUrl: "",
    openRedirectNewTab: false,
    enableHoneypot: true,
    enableGDPR: false,
    gdprText: "I agree to be contacted and allow you to store my submitted information.",
    includeMeta: true,
    includeUTM: true,
    clientWebhookUrl: "",
    googleSheetsEnabled: false,
    googleSheetsSheetId: "",
    googleSheetsTabName: "Sheet1",
    autoReplyEnabled: false,
    autoReplyFromName: "",
    autoReplyFromEmail: "",
    autoReplyEmailFieldKey: "email",
    autoReplySubject: "Thank you for contacting us",
    autoReplyMessage: "Hi {{name}},\n\nThanks for reaching out. We'll get back to you soon.\n\nBest regards,\n{{from_name}}"
  }),
  Renderer: ContactFormElementRenderer,
  Editor: ContactFormEditor
};

export default contactFormConfig;