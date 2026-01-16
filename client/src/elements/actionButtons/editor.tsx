import { useState, useEffect, useCallback, useRef } from "react";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function ActionButtonsContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-gray-700">Button Visibility</h4>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div>
            <span className="text-sm font-medium text-gray-700">Save Contact</span>
            <p className="text-xs text-gray-500">Add to phone contacts</p>
          </div>
          <input
            type="checkbox"
            checked={data.showSaveContact !== false}
            onChange={(e) => onChange({ ...data, showSaveContact: e.target.checked })}
            className="rounded border-gray-300 w-5 h-5"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div>
            <span className="text-sm font-medium text-gray-700">Share Button</span>
            <p className="text-xs text-gray-500">Share card via native share</p>
          </div>
          <input
            type="checkbox"
            checked={data.showShare !== false}
            onChange={(e) => onChange({ ...data, showShare: e.target.checked })}
            className="rounded border-gray-300 w-5 h-5"
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div>
            <span className="text-sm font-medium text-gray-700">Download Button</span>
            <p className="text-xs text-gray-500">Download card as image</p>
          </div>
          <input
            type="checkbox"
            checked={data.showDownload !== false}
            onChange={(e) => onChange({ ...data, showDownload: e.target.checked })}
            className="rounded border-gray-300 w-5 h-5"
          />
        </div>
      </div>
    </div>
  );
}

function ActionButtonsDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Arrangement</label>
            <select
              value={data.layout || "horizontal"}
              onChange={(e) => onChange({ ...data, layout: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
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
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Size</label>
            <select
              value={data.size || "md"}
              onChange={(e) => onChange({ ...data, size: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
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
              {data.buttonColor && (
                <button
                  onClick={() => onChange({ ...data, buttonColor: undefined })}
                  className="text-xs text-orange-500 hover:text-orange-600"
                >
                  Reset to theme
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Text/Icon Color</label>
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

function ActionButtonsSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Labels</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showLabels !== false}
                onChange={(e) => onChange({ ...data, showLabels: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Button Labels
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

export function ActionButtonsEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="actionButtons"
        elementTitle="Action Buttons"
        compact
        contentPanel={<ActionButtonsContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<ActionButtonsDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<ActionButtonsSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
