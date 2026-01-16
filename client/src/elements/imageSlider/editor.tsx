import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  ShadowPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function ImageSliderContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const images = data.images || [];
  const [isUploading, setIsUploading] = useState<number | null>(null);

  const addImage = () => {
    const newImage = { id: generateFieldId(), src: "", alt: "" };
    onChange({ ...data, images: [...images, newImage] });
  };

  const updateImage = (index: number, field: string, value: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, images: updated });
  };

  const removeImage = (index: number) => {
    const updated = images.filter((_: any, i: number) => i !== index);
    onChange({ ...data, images: updated });
  };

  const handleFileUpload = async (file: File, index: number) => {
    if (!file) return;
    setIsUploading(index);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        const result = await response.json();
        updateImage(index, 'src', result.url);
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(null);
    }
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === images.length - 1)) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...images];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange({ ...data, images: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Images ({images.length})</h4>
        <Button variant="outline" size="sm" onClick={addImage}>
          <i className="fas fa-plus mr-2"></i>Add
        </Button>
      </div>

      {images.map((image: any, index: number) => (
        <div key={image.id || index} className="bg-gray-50 p-3 rounded-lg border space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveImage(index, 'up')}
                disabled={index === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
              <button
                onClick={() => moveImage(index, 'down')}
                disabled={index === images.length - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <i className="fas fa-chevron-down"></i>
              </button>
              <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeImage(index)}
              className="text-red-400 hover:text-red-500 h-6 w-6 p-0"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Image URL</label>
            <Input
              value={image.src || ''}
              onChange={(e) => updateImage(index, 'src', e.target.value)}
              className="text-sm"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Or Upload</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, index);
              }}
              className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-orange-100 file:text-orange-700 hover:file:bg-orange-200"
              disabled={isUploading === index}
            />
            {isUploading === index && <p className="text-xs text-orange-500 mt-1">Uploading...</p>}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Alt Text</label>
            <Input
              value={image.alt || ''}
              onChange={(e) => updateImage(index, 'alt', e.target.value)}
              className="text-sm"
              placeholder="Image description"
            />
          </div>

          {image.src && (
            <img 
              src={image.src} 
              alt={image.alt || ''} 
              className="w-full h-20 object-cover rounded"
            />
          )}
        </div>
      ))}

      {images.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <i className="fas fa-images text-2xl mb-2"></i>
          <p className="text-sm">No images yet</p>
          <p className="text-xs">Click "Add" to add your first image</p>
        </div>
      )}
    </div>
  );
}

function ImageSliderDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Size & Fit</h4>
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
              <option value="3:2">3:2</option>
            </select>
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
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Border</h4>
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

function ImageSliderSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Slider Behavior</h4>
        <div className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.autoplay || false}
                onChange={(e) => onChange({ ...data, autoplay: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Autoplay
            </label>
          </div>

          {data.autoplay && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Interval (seconds)</label>
              <Input
                type="number"
                value={data.autoplayInterval || 3}
                onChange={(e) => onChange({ ...data, autoplayInterval: Number(e.target.value) })}
                min={1}
                max={10}
                className="text-sm"
              />
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.loop !== false}
                onChange={(e) => onChange({ ...data, loop: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Loop
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showDots !== false}
                onChange={(e) => onChange({ ...data, showDots: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Navigation Dots
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showArrows !== false}
                onChange={(e) => onChange({ ...data, showArrows: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Navigation Arrows
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

export function ImageSliderEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="imageSlider"
        elementTitle="Image Slider"
        compact
        contentPanel={<ImageSliderContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<ImageSliderDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<ImageSliderSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
