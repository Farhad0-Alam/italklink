import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function ScheduleCallEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">Schedule Call</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Call Duration (minutes)</label>
          <Input
            type="number"
            value={elementData.duration || 30}
            onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
            min={15}
            step={15}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Buffer Time (minutes)</label>
          <Input
            type="number"
            value={elementData.bufferTime || 5}
            onChange={(e) => handleDataUpdate({ bufferTime: parseInt(e.target.value) })}
            min={0}
            step={5}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
          <Input
            value={elementData.buttonText || "Schedule a Call"}
            onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
            placeholder="Schedule a Call"
          />
        </div>
      </div>
    </div>
  );
}
