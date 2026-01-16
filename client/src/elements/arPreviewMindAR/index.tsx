import { Input } from "@/components/ui/input";
import ARPreviewMindAR from "@/elements/ARPreviewMindAR";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function ARPreviewRenderer({ element, isEditing, onUpdate }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
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

  return (
    <div className="mb-4">
      <ARPreviewMindAR
        modelUrl={elementData.modelUrl}
        markerPattern={elementData.markerPattern}
        scale={elementData.scale}
      />
    </div>
  );
}

export const arPreviewMindARConfig: ElementConfig = {
  metadata: {
    type: "arPreviewMindAR",
    title: "AR Preview",
    icon: "Layout",
    category: "Advanced",
    description: "Add augmented reality preview"
  },
  defaultData: () => ({
    modelUrl: "",
    markerPattern: "",
    camera: "user" as const,
    scale: 1,
    rotation: "0 0 0",
    position: "0 0 0",
    showControls: true
  }),
  Renderer: ARPreviewRenderer
};

export default arPreviewMindARConfig;
