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

function BookAppointmentContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Service Name</label>
        <Input
          value={data.service || ""}
          onChange={(e) => onChange({ ...data, service: e.target.value })}
          placeholder="e.g., Consultation"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Brief description of the service..."
          className="text-sm"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Duration (minutes)</label>
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
        <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
        <Input
          value={data.buttonText || "Book Now"}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          placeholder="Book Now"
          className="text-sm"
        />
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800">
          <i className="fas fa-info-circle mr-2"></i>
          Links to your booking page for appointment scheduling.
        </p>
      </div>
    </div>
  );
}

function BookAppointmentDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
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
                value={data.buttonColor || "#10b981"}
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius</label>
            <select
              value={data.borderRadius || "md"}
              onChange={(e) => onChange({ ...data, borderRadius: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="full">Pill</option>
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

function BookAppointmentSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Booking Options</h4>
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
                checked={data.showPrice || false}
                onChange={(e) => onChange({ ...data, showPrice: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Price
            </label>
          </div>

          {data.showPrice && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Price</label>
              <Input
                value={data.price || ""}
                onChange={(e) => onChange({ ...data, price: e.target.value })}
                placeholder="$50"
                className="text-sm"
              />
            </div>
          )}
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

export function BookAppointmentEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="bookAppointment"
        elementTitle="Book Appointment"
        compact
        contentPanel={<BookAppointmentContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<BookAppointmentDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<BookAppointmentSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
