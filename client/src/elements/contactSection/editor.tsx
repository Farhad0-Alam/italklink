import { useState, useEffect, useCallback, useRef } from "react";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { ContactContentPanel, ContactDesignPanel, ContactSettingsPanel } from "@/components/ContactEditorPanels";
import { schemaToEditorContact, editorToSchemaContact } from "@/lib/element-adapters";
import { ElementEditorProps } from "../registry/types";

export function ContactSectionEditor({ element, onUpdate }: ElementEditorProps) {
  const { activeTab, setActiveTab } = useElementEditorTabs("content");
  const elementIdRef = useRef(element.id);
  const isLocalUpdateRef = useRef(false);
  
  const [editorData, setEditorData] = useState(() => 
    schemaToEditorContact(element.data || {})
  );

  useEffect(() => {
    if (element.id !== elementIdRef.current) {
      elementIdRef.current = element.id;
      setEditorData(schemaToEditorContact(element.data || {}));
    } else if (!isLocalUpdateRef.current && element.data) {
      setEditorData(schemaToEditorContact(element.data));
    }
    isLocalUpdateRef.current = false;
  }, [element.id, element.data]);

  const handleChange = useCallback((updatedEditorData: any) => {
    isLocalUpdateRef.current = true;
    setEditorData(updatedEditorData);
    const schemaData = editorToSchemaContact(updatedEditorData);
    onUpdate({ ...element, data: schemaData });
  }, [element, onUpdate]);

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
