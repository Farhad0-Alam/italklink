import { Button } from "@/components/ui/button";
import { ElementRendererProps } from "../registry/types";

export function ActionButtonsRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
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
