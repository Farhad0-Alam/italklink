import { Switch } from "@/components/ui/switch";
import { ElementEditorProps } from "../registry/types";

export function ActionButtonsEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
          <span className="text-sm text-slate-300">Save Contact</span>
          <Switch
            checked={elementData?.showSaveContact !== false}
            onCheckedChange={(checked) => handleDataUpdate({ showSaveContact: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
          <span className="text-sm text-slate-300">Share Button</span>
          <Switch
            checked={elementData?.showShare !== false}
            onCheckedChange={(checked) => handleDataUpdate({ showShare: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
          <span className="text-sm text-slate-300">Download Button</span>
          <Switch
            checked={elementData?.showDownload !== false}
            onCheckedChange={(checked) => handleDataUpdate({ showDownload: checked })}
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Layout</label>
          <select
            value={elementData?.layout || 'horizontal'}
            onChange={(e) => handleDataUpdate({ layout: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 w-full"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
      </div>
    </div>
  );
}
