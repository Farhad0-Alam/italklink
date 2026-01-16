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

function ScheduleCallContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Call Title</label>
        <Input
          value={data.title || ""}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="e.g., Discovery Call"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="What will be discussed on this call..."
          className="text-sm"
          rows={2}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Duration (min)</label>
          <Input
            type="number"
            value={data.duration || 30}
            onChange={(e) => onChange({ ...data, duration: parseInt(e.target.value) })}
            min={15}
            step={15}
            className="text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Buffer (min)</label>
          <Input
            type="number"
            value={data.bufferTime || 5}
            onChange={(e) => onChange({ ...data, bufferTime: parseInt(e.target.value) })}
            min={0}
            step={5}
            className="text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
        <Input
          value={data.buttonText || "Schedule a Call"}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          placeholder="Schedule a Call"
          className="text-sm"
        />
      </div>
    </div>
  );
}

function ScheduleCallDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
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
                value={data.buttonColor || "#3b82f6"}
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Style</label>
            <select
              value={data.buttonStyle || "filled"}
              onChange={(e) => onChange({ ...data, buttonStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="filled">Filled</option>
              <option value="outlined">Outlined</option>
            </select>
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

function ScheduleCallSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Call Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showDuration !== false}
                onChange={(e) => onChange({ ...data, showDuration: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Duration
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.sendReminder !== false}
                onChange={(e) => onChange({ ...data, sendReminder: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Send Reminder
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

export function ScheduleCallEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="scheduleCall"
        elementTitle="Schedule Call"
        compact
        contentPanel={<ScheduleCallContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<ScheduleCallDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<ScheduleCallSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
