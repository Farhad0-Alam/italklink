import { ContactSectionEditor as ContactSectionEditorComponent } from "@/components/ContactSectionEditor";
import { schemaToEditorContact, editorToSchemaContact } from "@/lib/element-adapters";
import { ElementEditorProps } from "../registry/types";

export function ContactSectionEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  const contacts = (elementData.contacts || []).map(schemaToEditorContact);
  
  return (
    <div className="mb-4">
      <ContactSectionEditorComponent
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
