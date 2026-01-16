import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function AvailabilityDisplayContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
        <Input
          value={data.title || "My Availability"}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="My Availability"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Days to Show in Advance</label>
        <Input
          type="number"
          value={data.daysInAdvance || 7}
          onChange={(e) => onChange({ ...data, daysInAdvance: parseInt(e.target.value) })}
          min={1}
          max={30}
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Show availability for the next X days</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Book Button Text</label>
        <Input
          value={data.bookButtonText || "Book This Slot"}
          onChange={(e) => onChange({ ...data, bookButtonText: e.target.value })}
          placeholder="Book This Slot"
          className="text-sm"
        />
      </div>
    </div>
  );
}

function AvailabilityDisplayDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Display Style</label>
            <select
              value={data.layout || "weekly"}
              onChange={(e) => onChange({ ...data, layout: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="weekly">Weekly Calendar</option>
              <option value="compact">Compact List</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Available Slot Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.availableColor || "#10b981"}
                onChange={(e) => onChange({ ...data, availableColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Booked Slot Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.bookedColor || "#ef4444"}
                onChange={(e) => onChange({ ...data, bookedColor: e.target.value })}
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

function AvailabilityDisplaySettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Display Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showBookButton !== false}
                onChange={(e) => onChange({ ...data, showBookButton: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Book Button
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showTimezone !== false}
                onChange={(e) => onChange({ ...data, showTimezone: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Timezone
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.use24HourFormat || false}
                onChange={(e) => onChange({ ...data, use24HourFormat: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Use 24-Hour Format
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

export function AvailabilityDisplayEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="availabilityDisplay"
        elementTitle="Availability Display"
        compact
        contentPanel={<AvailabilityDisplayContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<AvailabilityDisplayDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<AvailabilityDisplaySettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
