import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function MeetingRequestContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Meeting Title</label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Project Discussion"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="What this meeting is about..."
          className="text-sm"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Default Duration (minutes)</label>
        <Input
          type="number"
          value={data.defaultDuration || 60}
          onChange={(e) => onChange({ ...data, defaultDuration: parseInt(e.target.value) })}
          min={15}
          step={15}
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
        <Input
          value={data.buttonText || "Request Meeting"}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          placeholder="Request Meeting"
          className="text-sm"
        />
      </div>
    </div>
  );
}

function MeetingRequestDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Button Style</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonColor || "#8b5cf6"}
                onChange={(e) => onChange({ ...data, buttonColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.textColor || "#ffffff"}
                onChange={(e) => onChange({ ...data, textColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
            <select
              value={data.buttonWidth || "auto"}
              onChange={(e) => onChange({ ...data, buttonWidth: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="auto">Auto</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function MeetingRequestSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Meeting Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.allowNotes !== false}
                onChange={(e) => onChange({ ...data, allowNotes: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Allow Notes from Requester
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.requireApproval !== false}
                onChange={(e) => onChange({ ...data, requireApproval: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Require Approval
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

export function MeetingRequestEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="meetingRequest"
        elementTitle="Meeting Request"
        compact
        contentPanel={<MeetingRequestContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<MeetingRequestDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<MeetingRequestSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
