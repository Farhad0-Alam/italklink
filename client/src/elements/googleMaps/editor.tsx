import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function GoogleMapsContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const getMapEmbedUrl = (location: string, zoom: number): string => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}&zoom=${zoom}`;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
        <Input
          value={data.location || ""}
          onChange={(e) => onChange({ ...data, location: e.target.value })}
          placeholder="New York, NY or full address"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Enter a city, address, or landmark</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Marker Title</label>
        <Input
          value={data.markerTitle || ""}
          onChange={(e) => onChange({ ...data, markerTitle: e.target.value })}
          placeholder="My Business Location"
          className="text-sm"
        />
      </div>

      {data.location && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <div className="rounded overflow-hidden">
            <iframe
              src={getMapEmbedUrl(data.location, data.zoom || 12)}
              width="100%"
              height="150"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function GoogleMapsDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Map Options</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Zoom Level</label>
            <input
              type="range"
              min="1"
              max="20"
              value={data.zoom || 12}
              onChange={(e) => onChange({ ...data, zoom: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.zoom || 12} (1 = world, 20 = street)</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
            <input
              type="range"
              min="150"
              max="500"
              value={parseInt(data.height) || 300}
              onChange={(e) => onChange({ ...data, height: `${e.target.value}px` })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.height || "300px"}</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Map Type</label>
            <select
              value={data.mapType || "roadmap"}
              onChange={(e) => onChange({ ...data, mapType: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="roadmap">Roadmap</option>
              <option value="satellite">Satellite</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Border</h4>
        <div className="space-y-4">
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
            </select>
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

function GoogleMapsSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Map Controls</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showControls !== false}
                onChange={(e) => onChange({ ...data, showControls: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Controls
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.allowFullscreen !== false}
                onChange={(e) => onChange({ ...data, allowFullscreen: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Allow Fullscreen
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

export function GoogleMapsEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="googleMaps"
        elementTitle="Google Maps"
        compact
        contentPanel={<GoogleMapsContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<GoogleMapsDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<GoogleMapsSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
