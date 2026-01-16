import { ContactLinksRenderer } from "@/components/ContactLinksRenderer";
import { ContactSectionEditor } from "@/components/ContactSectionEditor";
import { schemaToEditorContact, editorToSchemaContact } from "@/lib/element-adapters";
import { ElementConfig, ElementRendererProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function ContactSectionRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    const contacts = (elementData.contacts || []).map(schemaToEditorContact);
    
    return (
      <div className="mb-4">
        <ContactSectionEditor
          contacts={contacts}
          onChange={(updatedContacts) => {
            const schemaContacts = updatedContacts.map(editorToSchemaContact);
            handleDataUpdate({ contacts: schemaContacts });
          }}
          layout={elementData.layout || 'vertical'}
          onLayoutChange={(layout) => handleDataUpdate({ layout })}
          showLabels={elementData.showLabels !== false}
          onShowLabelsChange={(show) => handleDataUpdate({ showLabels: show })}
        />
      </div>
    );
  }

  return (
    <div className="mb-4">
      <ContactLinksRenderer
        contacts={elementData.contacts || []}
        layout={elementData.layout || 'vertical'}
        showLabels={elementData.showLabels !== false}
        cardData={cardData}
      />
    </div>
  );
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
  Renderer: ContactSectionRenderer
};

export default contactSectionConfig;
