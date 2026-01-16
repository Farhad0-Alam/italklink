import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  ShadowPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel,
  AnimationPanel,
  HoverEffectsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function ImageContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        onChange({ ...data, src: result.url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Image URL</label>
        <Input
          value={data.src || ""}
          onChange={(e) => onChange({ ...data, src: e.target.value })}
          placeholder="https://example.com/image.jpg"
          className="text-sm"
        />
      </div>

      <div className="text-center text-gray-400 text-xs">— or —</div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileUpload(file);
          }}
          className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
          disabled={isUploading}
        />
        {isUploading && (
          <p className="text-xs text-orange-500 mt-1">Uploading...</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Alt Text</label>
        <Input
          value={data.alt || ""}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Describe the image for accessibility"
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Important for accessibility and SEO</p>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link URL (Optional)</label>
        <Input
          value={data.linkUrl || ""}
          onChange={(e) => onChange({ ...data, linkUrl: e.target.value })}
          placeholder="https://example.com"
          className="text-sm"
        />
      </div>

      {data.src && (
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <img 
            src={data.src} 
            alt={data.alt || ''} 
            className="max-w-full h-auto rounded max-h-32 object-contain mx-auto"
          />
        </div>
      )}
    </div>
  );
}

function ImageDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Size & Fit</h4>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
              <Input
                value={data.width || ""}
                onChange={(e) => onChange({ ...data, width: e.target.value })}
                placeholder="auto or 100%"
                className="text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Height</label>
              <Input
                value={data.height || ""}
                onChange={(e) => onChange({ ...data, height: e.target.value })}
                placeholder="auto"
                className="text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Object Fit</label>
            <select
              value={data.objectFit || "cover"}
              onChange={(e) => onChange({ ...data, objectFit: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
              <option value="fill">Fill</option>
              <option value="none">None</option>
              <option value="scale-down">Scale Down</option>
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
              <option value="xl">Extra Large</option>
              <option value="full">Full (Circle)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Width</label>
            <input
              type="range"
              min="0"
              max="8"
              value={parseInt(data.borderWidth || "0")}
              onChange={(e) => onChange({ ...data, borderWidth: e.target.value + "px" })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.borderWidth || "0px"}</span>
          </div>

          {parseInt(data.borderWidth || "0") > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.borderColor || "#e5e7eb"}
                  onChange={(e) => onChange({ ...data, borderColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Shadow</h4>
        <ShadowPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Hover Effects</h4>
        <HoverEffectsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function ImageSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Animation</h4>
        <AnimationPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Loading</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Loading Behavior</label>
            <select
              value={data.loading || "lazy"}
              onChange={(e) => onChange({ ...data, loading: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="lazy">Lazy Load (Recommended)</option>
              <option value="eager">Eager Load</option>
            </select>
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

export function ImageEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="image"
        elementTitle="Image"
        compact
        contentPanel={
          <ImageContentPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
        designPanel={
          <ImageDesignPanel 
            data={editorData} 
            onChange={handleChange}
          />
        }
        settingsPanel={
          <ImageSettingsPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
      />
    </div>
  );
}
