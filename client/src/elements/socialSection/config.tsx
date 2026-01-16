import { ElementConfig, ElementRendererProps } from "../registry/types";
import { SocialSectionRenderer } from "./renderer";
import { SocialSectionEditor } from "./editor";
import { generateFieldId } from "@/lib/card-data";

function SocialSectionElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <SocialSectionEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <SocialSectionRenderer {...props} />;
}

export const socialSectionConfig: ElementConfig = {
  metadata: {
    type: "socialSection",
    title: "Social Media",
    icon: "Share2",
    category: "Contact",
    description: "Display social media links"
  },
  defaultData: () => ({ 
    socials: [
      { 
        id: generateFieldId(), 
        label: "LinkedIn", 
        url: "https://linkedin.com/in/yourprofile", 
        icon: "fab fa-linkedin", 
        platform: "LinkedIn" 
      }
    ],
    layout: "horizontal" as const,
    size: "md",
    showLabels: true
  }),
  Renderer: SocialSectionElementRenderer,
  Editor: SocialSectionEditor
};

export default socialSectionConfig;
