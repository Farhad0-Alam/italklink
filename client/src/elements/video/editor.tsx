import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  ShadowPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function VideoContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    if (youtubeMatch) return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    return url;
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Video URL</label>
        <Input
          value={data.url || ""}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="YouTube or Vimeo URL"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Supports YouTube and Vimeo links</p>
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700">Playback Options</h4>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Autoplay</span>
          <input
            type="checkbox"
            checked={data.autoplay || false}
            onChange={(e) => onChange({ ...data, autoplay: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Show Controls</span>
          <input
            type="checkbox"
            checked={data.controls !== false}
            onChange={(e) => onChange({ ...data, controls: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Loop</span>
          <input
            type="checkbox"
            checked={data.loop || false}
            onChange={(e) => onChange({ ...data, loop: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Muted</span>
          <input
            type="checkbox"
            checked={data.muted !== false}
            onChange={(e) => onChange({ ...data, muted: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
        </div>
      </div>

      {data.url && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <div className="aspect-video bg-gray-200 rounded overflow-hidden">
            <iframe
              src={getEmbedUrl(data.url) || ''}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}

function VideoDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Size</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Aspect Ratio</label>
            <select
              value={data.aspectRatio || "16:9"}
              onChange={(e) => onChange({ ...data, aspectRatio: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="1:1">1:1 (Square)</option>
              <option value="9:16">9:16 (Portrait)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Width</label>
            <Input
              value={data.maxWidth || ""}
              onChange={(e) => onChange({ ...data, maxWidth: e.target.value })}
              placeholder="100% or 600px"
              className="text-sm"
            />
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
              <option value="xl">Extra Large</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Shadow</h4>
        <ShadowPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function VideoSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Loading</h4>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Loading Behavior</label>
          <select
            value={data.loading || "lazy"}
            onChange={(e) => onChange({ ...data, loading: e.target.value })}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
          >
            <option value="lazy">Lazy Load</option>
            <option value="eager">Eager Load</option>
          </select>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function VideoEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="video"
        elementTitle="Video"
        compact
        contentPanel={<VideoContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<VideoDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<VideoSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
