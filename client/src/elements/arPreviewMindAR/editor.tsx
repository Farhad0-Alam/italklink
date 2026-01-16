import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function ARPreviewContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">3D Model URL</label>
        <Input
          value={data.modelUrl || ""}
          onChange={(e) => onChange({ ...data, modelUrl: e.target.value })}
          placeholder="URL to 3D model (.glb, .gltf)"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Supports GLB and GLTF formats</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Marker Pattern URL</label>
        <Input
          value={data.markerPattern || ""}
          onChange={(e) => onChange({ ...data, markerPattern: e.target.value })}
          placeholder="URL to marker pattern"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
        <Input
          value={data.buttonText || "View in AR"}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          placeholder="View in AR"
          className="text-sm"
        />
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
        <p className="text-sm text-purple-800">
          <i className="fas fa-info-circle mr-2"></i>
          AR Preview uses MindAR for augmented reality experiences.
        </p>
      </div>
    </div>
  );
}

function ARPreviewDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Model Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Scale</label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={data.scale || 1}
              onChange={(e) => onChange({ ...data, scale: parseFloat(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.scale || 1}x</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rotation</label>
            <input
              type="range"
              min="0"
              max="360"
              value={data.rotation || 0}
              onChange={(e) => onChange({ ...data, rotation: parseInt(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.rotation || 0}°</span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Button Style</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonColor || "#7c3aed"}
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
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function ARPreviewSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">AR Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.autoRotate || false}
                onChange={(e) => onChange({ ...data, autoRotate: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Auto-rotate Model
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showControls !== false}
                onChange={(e) => onChange({ ...data, showControls: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Zoom Controls
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

export function ARPreviewEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="arPreviewMindAR"
        elementTitle="AR Preview"
        compact
        contentPanel={<ARPreviewContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<ARPreviewDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<ARPreviewSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
