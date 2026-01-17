import { ElementConfig, ElementRegistry, ElementCategory } from "./types";
import { generateFieldId } from "@/lib/card-data";

import headingConfig from "../heading";
import paragraphConfig from "../paragraph";
import textEditorConfig from "../textEditor";
import profileConfig from "../profile";
import linkConfig from "../link";
import imageConfig from "../image";
import videoConfig from "../video";
import navigationMenuConfig from "../navigationMenu";
import contactSectionConfig from "../contactSection";
import socialSectionConfig from "../socialSection";
import actionButtonsConfig from "../actionButtons";
import contactFormConfig from "../contactForm";
import accordionConfig from "../accordion";
import imageSliderConfig from "../imageSlider";
import testimonialsConfig from "../testimonials";
import googleMapsConfig from "../googleMaps";
import aiChatbotConfig from "../aiChatbot";
import ragKnowledgeConfig from "../ragKnowledge";
import voiceAgentConfig from "../voiceAgent";
import voiceAssistantConfig from "../voiceAssistant";
import bookAppointmentConfig from "../bookAppointment";
import scheduleCallConfig from "../scheduleCall";
import meetingRequestConfig from "../meetingRequest";
import availabilityDisplayConfig from "../availabilityDisplay";
import shopConfig from "../shop";
import digitalWalletConfig from "../digitalWallet";
import qrcodeConfig from "../qrcode";
import pdfViewerConfig from "../pdfViewer";
import subscribeFormConfig from "../subscribeForm";
import installButtonConfig from "../installButton";
import arPreviewMindARConfig from "../arPreviewMindAR";
import htmlConfig from "../html";

export const elementRegistry: ElementRegistry = {
  heading: headingConfig,
  paragraph: paragraphConfig,
  textEditor: textEditorConfig,
  profile: profileConfig,
  link: linkConfig,
  image: imageConfig,
  video: videoConfig,
  navigationMenu: navigationMenuConfig,
  contactSection: contactSectionConfig,
  socialSection: socialSectionConfig,
  actionButtons: actionButtonsConfig,
  contactForm: contactFormConfig,
  accordion: accordionConfig,
  imageSlider: imageSliderConfig,
  testimonials: testimonialsConfig,
  googleMaps: googleMapsConfig,
  aiChatbot: aiChatbotConfig,
  ragKnowledge: ragKnowledgeConfig,
  voiceAgent: voiceAgentConfig,
  voiceAssistant: voiceAssistantConfig,
  bookAppointment: bookAppointmentConfig,
  scheduleCall: scheduleCallConfig,
  meetingRequest: meetingRequestConfig,
  availabilityDisplay: availabilityDisplayConfig,
  shop: shopConfig,
  digitalWallet: digitalWalletConfig,
  qrcode: qrcodeConfig,
  pdfViewer: pdfViewerConfig,
  subscribeForm: subscribeFormConfig,
  installButton: installButtonConfig,
  arPreviewMindAR: arPreviewMindARConfig,
  html: htmlConfig,
};

export const elementCategories: { name: ElementCategory; elements: string[] }[] = [
  {
    name: "Layout",
    elements: ["profile", "navigationMenu"]
  },
  {
    name: "Basic",
    elements: ["heading", "paragraph", "textEditor", "image", "video", "link"]
  },
  {
    name: "Contact",
    elements: ["contactSection", "socialSection", "actionButtons", "contactForm"]
  },
  {
    name: "Interactive",
    elements: ["accordion", "imageSlider", "testimonials", "googleMaps", "pdfViewer"]
  },
  {
    name: "AI & Voice",
    elements: ["aiChatbot", "ragKnowledge", "voiceAgent", "voiceAssistant"]
  },
  {
    name: "Booking",
    elements: ["bookAppointment", "scheduleCall", "meetingRequest", "availabilityDisplay"]
  },
  {
    name: "Commerce",
    elements: ["shop", "digitalWallet", "qrcode"]
  },
  {
    name: "Advanced",
    elements: ["subscribeForm", "installButton", "arPreviewMindAR", "html"]
  }
];

export function getElementConfig(type: string): ElementConfig | undefined {
  return elementRegistry[type];
}

export function getElementMetadata(type: string) {
  return elementRegistry[type]?.metadata;
}

export function getDefaultElementData(type: string): any {
  const config = elementRegistry[type];
  return config?.defaultData() || {};
}

export function createPageElement(type: string) {
  const id = generateFieldId();
  const uniqueOrder = Date.now() + Math.random();
  const config = elementRegistry[type];
  const data = config?.defaultData() || {};

  const element: any = {
    id,
    type,
    order: uniqueOrder,
    data
  };

  // Only set visible: true for profile elements (matches legacy behavior)
  if (type === "profile") {
    element.visible = true;
  }

  return element;
}

export function getElementRenderer(type: string) {
  return elementRegistry[type]?.Renderer;
}

export function getElementEditor(type: string) {
  return elementRegistry[type]?.Editor;
}

export function getAllElementTypes(): string[] {
  return Object.keys(elementRegistry);
}

export function getElementsByCategory(category: ElementCategory): string[] {
  const cat = elementCategories.find(c => c.name === category);
  return cat?.elements || [];
}

export * from "./types";
