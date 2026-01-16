import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function PDFViewerContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange({ 
          ...data,
          pdf_file: base64,
          file_name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload PDF File</label>
        <Input
          type="file"
          accept=".pdf"
          onChange={handleFileUpload}
          className="text-sm"
        />
        {data.file_name && (
          <p className="text-xs text-green-600 mt-1">
            <i className="fas fa-check mr-1"></i>
            Uploaded: {data.file_name}
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
        <Input
          value={data.button_text || "View PDF"}
          onChange={(e) => onChange({ ...data, button_text: e.target.value })}
          placeholder="View PDF"
          className="text-sm"
        />
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
        <p className="text-sm text-purple-800">
          <i className="fas fa-info-circle mr-2"></i>
          PDF opens in a modal with zoom controls and download options.
        </p>
      </div>
    </div>
  );
}

function PDFViewerDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
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
                value={data.buttonColor || "#6b21a8"}
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
              <option value="full">Full (Pill)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Width</label>
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

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">PDF Viewer</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Default Scale ({Math.round((data.scale || 1.0) * 100)}%)
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={data.scale || 1.0}
              onChange={(e) => onChange({ ...data, scale: parseFloat(e.target.value) })}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">Initial zoom level (50% - 300%)</p>
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

function PDFViewerSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Viewer Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.allowDownload !== false}
                onChange={(e) => onChange({ ...data, allowDownload: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Allow Download
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showPageNumbers !== false}
                onChange={(e) => onChange({ ...data, showPageNumbers: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Page Numbers
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

export function PDFViewerEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="pdfViewer"
        elementTitle="PDF Viewer"
        compact
        contentPanel={<PDFViewerContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<PDFViewerDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<PDFViewerSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
