import { SocialSectionEditor as SocialSectionEditorComponent } from "@/components/SocialSectionEditor";
import { schemaToEditorSocial, editorToSchemaSocial } from "@/lib/element-adapters";
import { ElementEditorProps } from "../registry/types";

export function SocialSectionEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  const socials = (elementData.socials || []).map(schemaToEditorSocial);
  
  return (
    <div className="mb-4">
      <SocialSectionEditorComponent
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
