import { SocialLinksRenderer } from "@/components/SocialLinksRenderer";
import { SocialSectionEditor } from "@/components/SocialSectionEditor";
import { schemaToEditorSocial, editorToSchemaSocial } from "@/lib/element-adapters";
import { ElementConfig, ElementRendererProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function SocialSectionRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    const socials = (elementData.socials || []).map(schemaToEditorSocial);
    
    return (
      <div className="mb-4">
        <SocialSectionEditor
          socials={socials}
          onChange={(updatedSocials) => {
            const schemaSocials = updatedSocials.map(editorToSchemaSocial);
            handleDataUpdate({ socials: schemaSocials });
          }}
          layout={elementData.layout || 'horizontal'}
          onLayoutChange={(layout) => handleDataUpdate({ layout })}
          size={elementData.size || 'md'}
          onSizeChange={(size) => handleDataUpdate({ size })}
          showLabels={elementData.showLabels !== false}
          onShowLabelsChange={(show) => handleDataUpdate({ showLabels: show })}
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <SocialLinksRenderer
        socials={elementData.socials || []}
        layout={elementData.layout || 'horizontal'}
        size={elementData.size || 'md'}
        showLabels={elementData.showLabels !== false}
        cardData={cardData}
      />
    </div>
  );
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
  Renderer: SocialSectionRenderer
};

export default socialSectionConfig;
