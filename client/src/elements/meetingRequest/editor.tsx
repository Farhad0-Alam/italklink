import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function MeetingRequestEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">Meeting Request</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Default Duration (minutes)</label>
          <Input
            type="number"
            value={elementData.defaultDuration || 60}
            onChange={(e) => handleDataUpdate({ defaultDuration: parseInt(e.target.value) })}
            min={15}
            step={15}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
          <Input
            value={elementData.buttonText || "Request Meeting"}
            onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
            placeholder="Request Meeting"
          />
        </div>
      </div>
    </div>
  );
}
