import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function ImageRenderer({ element, isEditing, onUpdate }: ElementRendererProps) {
  const elementData = element.data || {};
  const [isUploading, setIsUploading] = useState(false);

  const handleDataUpdate = useCallback((newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  }, [element, onUpdate]);

  const handleFileUpload = useCallback(async (file: File) => {
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
        const data = await response.json();
        handleDataUpdate({ src: data.url });
      }
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  }, [handleDataUpdate]);

  if (isEditing) {
    return (
      <div className="mb-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Image URL</label>
            <Input
              value={elementData?.src || ''}
              onChange={(e) => handleDataUpdate({ src: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          
          <div className="text-center text-gray-400 text-xs">or</div>
          
          <div>
            <label className="text-xs text-gray-400 block mb-1">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-slate-600 file:text-white hover:file:bg-slate-500"
              disabled={isUploading}
            />
            {isUploading && (
              <p className="text-xs text-green-400 mt-1">Uploading...</p>
            )}
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Alt Text</label>
            <Input
              value={elementData?.alt || ''}
              onChange={(e) => handleDataUpdate({ alt: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Image description"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Border Radius</label>
            <select
              value={elementData?.borderRadius || 'md'}
              onChange={(e) => handleDataUpdate({ borderRadius: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 w-full"
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="full">Full</option>
            </select>
          </div>

          {elementData?.src && (
            <div className="mt-3">
              <p className="text-xs text-gray-400 mb-2">Preview:</p>
              <img 
                src={elementData.src} 
                alt={elementData?.alt || ''} 
                className="max-w-full h-auto rounded"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!elementData?.src) {
    return (
      <div className="mb-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500 border-2 border-dashed border-slate-300">
        <i className="fas fa-image text-3xl mb-2"></i>
        <p>No image set</p>
      </div>
    );
  }

  const radiusMap: Record<string, string> = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };

  return (
    <div className="mb-4">
      <img 
        src={elementData.src} 
        alt={elementData?.alt || ''} 
        className={`w-full h-auto ${radiusMap[elementData?.borderRadius || 'md']}`}
      />
    </div>
  );
}

export const imageConfig: ElementConfig = {
  metadata: {
    type: "image",
    title: "Image",
    icon: "Image",
    category: "Basic",
    description: "Add an image to your card"
  },
  defaultData: () => ({ 
    src: "", 
    alt: "Image",
    width: "100%",
    height: "auto",
    borderRadius: "md",
    shadow: "none"
  }),
  Renderer: ImageRenderer
};

export default imageConfig;
