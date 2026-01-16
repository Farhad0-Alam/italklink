import { useState, useEffect, useCallback, useRef } from "react";
import { ProfileSectionEditor } from "@/components/ProfileSectionEditor";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function ProfileContentPanel({ data, onChange, onSave, cardData }: { data: any; onChange: (data: any) => void; onSave?: () => void; cardData?: any }) {
  return (
    <div className="space-y-4">
      <ProfileSectionEditor
        data={data}
        onChange={onChange}
        onSave={onSave}
        cardData={cardData}
      />
    </div>
  );
}

function ProfileDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Profile Style</label>
            <select
              value={data.profileStyle || "centered"}
              onChange={(e) => onChange({ ...data, profileStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="centered">Centered</option>
              <option value="left-aligned">Left Aligned</option>
              <option value="card">Card Style</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Avatar Size</label>
            <select
              value={data.avatarSize || "lg"}
              onChange={(e) => onChange({ ...data, avatarSize: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Avatar Shape</label>
            <select
              value={data.avatarShape || "circle"}
              onChange={(e) => onChange({ ...data, avatarShape: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="circle">Circle</option>
              <option value="rounded">Rounded Square</option>
              <option value="square">Square</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.nameColor || "#1f2937"}
                onChange={(e) => onChange({ ...data, nameColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Title Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.titleColor || "#6b7280"}
                onChange={(e) => onChange({ ...data, titleColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Background</h4>
        <BackgroundPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function ProfileSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Display Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showTitle !== false}
                onChange={(e) => onChange({ ...data, showTitle: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Job Title
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showCompany !== false}
                onChange={(e) => onChange({ ...data, showCompany: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Company
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showBio || false}
                onChange={(e) => onChange({ ...data, showBio: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Bio
            </label>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function ProfileEditor({ element, onUpdate, onSave, cardData }: ElementEditorProps) {
  const { activeTab, setActiveTab } = useElementEditorTabs("content");
  const elementIdRef = useRef(element.id);
  const isLocalUpdateRef = useRef(false);

  const [editorData, setEditorData] = useState(() => element.data || {});

  useEffect(() => {
    if (element.id !== elementIdRef.current) {
      elementIdRef.current = element.id;
      setEditorData(element.data || {});
    } else if (!isLocalUpdateRef.current && element.data) {
      setEditorData(element.data);
    }
    isLocalUpdateRef.current = false;
  }, [element.id, element.data]);

  const handleChange = useCallback((updatedData: any) => {
    isLocalUpdateRef.current = true;
    setEditorData(updatedData);
    onUpdate({ ...element, data: updatedData });
  }, [element, onUpdate]);

  return (
    <div className="h-full">
      <ElementEditorPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        elementType="profile"
        elementTitle="Profile"
        compact
        contentPanel={<ProfileContentPanel data={editorData} onChange={handleChange} onSave={onSave} cardData={cardData} />}
        designPanel={<ProfileDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<ProfileSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
