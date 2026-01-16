import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function ARPreviewEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">AR Preview</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Model URL</label>
          <Input
            value={elementData.modelUrl || ""}
            onChange={(e) => handleDataUpdate({ modelUrl: e.target.value })}
            placeholder="URL to 3D model"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Marker Pattern URL</label>
          <Input
            value={elementData.markerPattern || ""}
            onChange={(e) => handleDataUpdate({ markerPattern: e.target.value })}
            placeholder="URL to marker pattern"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Scale</label>
          <Input
            type="number"
            value={elementData.scale || 1}
            onChange={(e) => handleDataUpdate({ scale: parseFloat(e.target.value) })}
            min={0.1}
            max={10}
            step={0.1}
          />
        </div>

        <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
          <p className="text-sm text-purple-800">
            <i className="fas fa-info-circle mr-2"></i>
            AR Preview uses MindAR for augmented reality experiences.
          </p>
        </div>
      </div>
    </div>
  );
}
