import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function QRCodeContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">QR Code URL</label>
        <Input
          value={data.url || ""}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://example.com"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">The URL this QR code will link to</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Label (Optional)</label>
        <Input
          value={data.label || ""}
          onChange={(e) => onChange({ ...data, label: e.target.value })}
          placeholder="Scan to visit"
          className="text-sm"
        />
      </div>

      {data.url && (
        <div className="mt-3 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-3 text-center">Preview:</p>
          <div className="flex justify-center">
            <QRCodeSVG
              value={data.url}
              size={data.size || 128}
              fgColor={data.color || "#000000"}
              bgColor={data.backgroundColor || "#FFFFFF"}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function QRCodeDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Size</h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">QR Code Size</label>
          <input
            type="range"
            min="64"
            max="256"
            value={data.size || 128}
            onChange={(e) => onChange({ ...data, size: Number(e.target.value) })}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{data.size || 128}px</span>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Foreground</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.color || "#000000"}
                onChange={(e) => onChange({ ...data, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500">{data.color || "#000000"}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.backgroundColor || "#FFFFFF"}
                onChange={(e) => onChange({ ...data, backgroundColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <span className="text-xs text-gray-500">{data.backgroundColor || "#FFFFFF"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Error Correction</h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Level</label>
          <select
            value={data.errorLevel || "M"}
            onChange={(e) => onChange({ ...data, errorLevel: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="L">Low (7%)</option>
            <option value="M">Medium (15%)</option>
            <option value="Q">Quartile (25%)</option>
            <option value="H">High (30%)</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">Higher = more readable if damaged</p>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Container</h4>
        <BackgroundPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function QRCodeSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Alignment</h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Horizontal Alignment</label>
          <div className="flex gap-1">
            {['left', 'center', 'right'].map(align => (
              <button
                key={align}
                onClick={() => onChange({ ...data, alignment: align })}
                className={`flex-1 py-2 px-3 text-sm rounded border ${
                  (data.alignment || 'center') === align 
                    ? 'border-orange-500 bg-orange-50 text-orange-600' 
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <i className={`fas fa-align-${align}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function QRCodeEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="qrcode"
        elementTitle="QR Code"
        compact
        contentPanel={<QRCodeContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<QRCodeDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<QRCodeSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
