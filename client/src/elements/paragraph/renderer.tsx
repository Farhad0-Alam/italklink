import { ElementRendererProps } from "../registry/types";

export function ParagraphRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
  const paragraphColor = elementData?.color || cardData?.paragraphColor || "#141414";

  return (
    <div className={`text-${elementData.alignment || 'left'} mb-4`}>
      <p className="text-sm leading-relaxed" style={{ color: paragraphColor }}>
        {elementData.text}
      </p>
    </div>
  );
}
