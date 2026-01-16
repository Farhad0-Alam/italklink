import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function HTMLContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">HTML Content</label>
        <Textarea
          value={data.content || ""}
          onChange={(e) => onChange({ ...data, content: e.target.value })}
          placeholder="Enter your HTML code here..."
          className="min-h-[200px] font-mono text-sm"
        />
      </div>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
        <p className="text-sm text-amber-800">
          <i className="fas fa-exclamation-triangle mr-2"></i>
          Security Note: JavaScript and external scripts are disabled for safety.
        </p>
      </div>
    </div>
  );
}

function HTMLDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Size</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Height (px)</label>
            <Input
              type="number"
              value={data.height || 300}
              onChange={(e) => onChange({ ...data, height: parseInt(e.target.value) || 300 })}
              min={100}
              max={1000}
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
            <Input
              value={data.width || ""}
              onChange={(e) => onChange({ ...data, width: e.target.value })}
              placeholder="100% or 400px"
              className="text-sm"
            />
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

function HTMLSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Security</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.sandbox !== false}
                onChange={(e) => onChange({ ...data, sandbox: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Security Sandboxing
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Recommended for security</p>
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

export function HTMLEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="html"
        elementTitle="Custom HTML"
        compact
        contentPanel={<HTMLContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<HTMLDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<HTMLSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
