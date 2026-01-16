import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ElementEditorProps } from "../registry/types";

export function AvailabilityDisplayEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">Availability Display</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Days to Show</label>
          <Input
            type="number"
            value={elementData.daysInAdvance || 7}
            onChange={(e) => handleDataUpdate({ daysInAdvance: parseInt(e.target.value) })}
            min={1}
            max={30}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Show Book Button</span>
          <Switch
            checked={elementData.showBookButton !== false}
            onCheckedChange={(checked) => handleDataUpdate({ showBookButton: checked })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Layout</label>
          <select
            value={elementData.layout || "weekly"}
            onChange={(e) => handleDataUpdate({ layout: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="weekly">Weekly</option>
            <option value="compact">Compact</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
      </div>
    </div>
  );
}
