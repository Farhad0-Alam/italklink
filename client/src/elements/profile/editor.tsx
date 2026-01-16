import { ProfileSectionEditor } from "@/components/ProfileSectionEditor";
import { ElementEditorProps } from "../registry/types";

export function ProfileEditor({ element, onUpdate, onSave, cardData }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="w-full">
      <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg border border-slate-200">
        <ProfileSectionEditor
          data={elementData}
          onChange={(newData) => handleDataUpdate(newData)}
          onSave={onSave}
          cardData={cardData}
        />
      </div>
    </div>
  );
}
