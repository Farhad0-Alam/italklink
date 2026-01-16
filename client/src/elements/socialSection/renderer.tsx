import { SocialLinksRenderer } from "@/components/SocialLinksRenderer";
import { ElementRendererProps } from "../registry/types";

export function SocialSectionRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  return (
    <div className="mb-4">
      <SocialLinksRenderer
        socials={elementData.socials || []}
        layout={elementData.layout || 'horizontal'}
        size={elementData.size || 'md'}
        showLabels={elementData.showLabels !== false}
        cardData={cardData}
      />
    </div>
  );
}
