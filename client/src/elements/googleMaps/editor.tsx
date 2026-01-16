import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ElementEditorProps } from "../registry/types";

export function GoogleMapsEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  const getMapEmbedUrl = (location: string, zoom: number): string => {
    const encodedLocation = encodeURIComponent(location);
    return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodedLocation}&zoom=${zoom}`;
  };

  return (
    <div className="mb-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Location</label>
          <Input
            value={elementData?.location || ''}
            onChange={(e) => handleDataUpdate({ location: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="New York, NY or full address"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Zoom Level: {elementData?.zoom || 12}</label>
          <input
            type="range"
            min="1"
            max="20"
            value={elementData?.zoom || 12}
            onChange={(e) => handleDataUpdate({ zoom: Number(e.target.value) })}
            className="w-full accent-green-500"
          />
        </div>

        <div>
          <label className="text-xs text-gray-400 block mb-1">Height: {elementData?.height || 300}px</label>
          <input
            type="range"
            min="150"
            max="500"
            value={parseInt(elementData?.height) || 300}
            onChange={(e) => handleDataUpdate({ height: `${e.target.value}px` })}
            className="w-full accent-green-500"
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Show Controls</span>
          <Switch
            checked={elementData?.showControls !== false}
            onCheckedChange={(checked) => handleDataUpdate({ showControls: checked })}
          />
        </div>

        {elementData?.location && (
          <div className="mt-3 rounded overflow-hidden">
            <iframe
              src={getMapEmbedUrl(elementData.location, elementData?.zoom || 12)}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
      </div>
    </div>
  );
}
