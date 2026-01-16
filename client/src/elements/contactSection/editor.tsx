import { useState } from "react";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { ContactContentPanel, ContactDesignPanel, ContactSettingsPanel } from "@/components/ContactEditorPanels";
import { schemaToEditorContact, editorToSchemaContact } from "@/lib/element-adapters";
import { ElementEditorProps } from "../registry/types";

export function ContactSectionEditor({ element, onUpdate }: ElementEditorProps) {
  const { activeTab, setActiveTab } = useElementEditorTabs("content");
  const elementData = element.data || {};

  // Convert schema format to editor format for the panels
  const editorData = schemaToEditorContact(elementData);

  const handleChange = (updatedEditorData: any) => {
    // Convert editor format back to schema format
    const schemaData = editorToSchemaContact(updatedEditorData);
    onUpdate({ ...element, data: schemaData });
  };

  return (
    <div className="h-full">
      <ElementEditorPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        elementType="contactSection"
        elementTitle="Contact Info"
        compact
        contentPanel={
          <ContactContentPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
        designPanel={
          <ContactDesignPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
        settingsPanel={
          <ContactSettingsPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
      />
    </div>
  );
}
