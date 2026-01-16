import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function ActionButtonsRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    return (
      <div className="mb-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
            <span className="text-sm text-slate-300">Save Contact</span>
            <Switch
              checked={elementData?.showSaveContact !== false}
              onCheckedChange={(checked) => handleDataUpdate({ showSaveContact: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
            <span className="text-sm text-slate-300">Share Button</span>
            <Switch
              checked={elementData?.showShare !== false}
              onCheckedChange={(checked) => handleDataUpdate({ showShare: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-2 bg-slate-800 rounded">
            <span className="text-sm text-slate-300">Download Button</span>
            <Switch
              checked={elementData?.showDownload !== false}
              onCheckedChange={(checked) => handleDataUpdate({ showDownload: checked })}
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Layout</label>
            <select
              value={elementData?.layout || 'horizontal'}
              onChange={(e) => handleDataUpdate({ layout: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 w-full"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  const brandColor = cardData?.brandColor || "#22c55e";
  const layout = elementData?.layout || 'horizontal';
  const containerClass = layout === 'vertical' ? 'flex flex-col gap-2' : 'flex gap-2 justify-center flex-wrap';

  return (
    <div className="mb-4">
      <div className={containerClass}>
        {elementData?.showSaveContact !== false && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            style={{ borderColor: brandColor, color: brandColor }}
          >
            <i className="fas fa-user-plus"></i>
            Save Contact
          </Button>
        )}
        
        {elementData?.showShare !== false && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            style={{ borderColor: brandColor, color: brandColor }}
          >
            <i className="fas fa-share-alt"></i>
            Share
          </Button>
        )}
        
        {elementData?.showDownload !== false && (
          <Button
            variant="outline"
            className="flex items-center gap-2"
            style={{ borderColor: brandColor, color: brandColor }}
          >
            <i className="fas fa-download"></i>
            Download
          </Button>
        )}
      </div>
    </div>
  );
}

export const actionButtonsConfig: ElementConfig = {
  metadata: {
    type: "actionButtons",
    title: "Save & Share",
    icon: "Layers",
    category: "Contact",
    description: "Add save contact and share buttons"
  },
  defaultData: () => ({ 
    showSaveContact: true,
    showShare: true,
    showDownload: true,
    layout: "horizontal" as const
  }),
  Renderer: ActionButtonsRenderer
};

export default actionButtonsConfig;
