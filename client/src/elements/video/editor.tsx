import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ElementEditorProps } from "../registry/types";

export function VideoEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  const getEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    return url;
  };

  return (
    <div className="mb-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Video URL</label>
          <Input
            value={elementData?.url || ''}
            onChange={(e) => handleDataUpdate({ url: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="YouTube or Vimeo URL"
          />
          <p className="text-xs text-gray-500 mt-1">Supports YouTube and Vimeo links</p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Autoplay</span>
          <Switch
            checked={elementData?.autoplay || false}
            onCheckedChange={(checked) => handleDataUpdate({ autoplay: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Show Controls</span>
          <Switch
            checked={elementData?.controls !== false}
            onCheckedChange={(checked) => handleDataUpdate({ controls: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Loop</span>
          <Switch
            checked={elementData?.loop || false}
            onCheckedChange={(checked) => handleDataUpdate({ loop: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-300">Muted</span>
          <Switch
            checked={elementData?.muted !== false}
            onCheckedChange={(checked) => handleDataUpdate({ muted: checked })}
          />
        </div>

        {elementData?.url && (
          <div className="mt-3">
            <p className="text-xs text-gray-400 mb-2">Preview:</p>
            <div className="aspect-video bg-slate-800 rounded overflow-hidden">
              <iframe
                src={getEmbedUrl(elementData.url) || ''}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
