import { ElementRendererProps } from "../registry/types";

export function HeadingRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
  const HeadingTag = (elementData.level as keyof JSX.IntrinsicElements) || 'h1';
  const headingColor = elementData?.color || cardData?.headingColor || "#0f0f0f";

  return (
    <div className={`text-${elementData.alignment || 'left'} mb-4`}>
      <HeadingTag 
        className={`font-bold ${
          elementData.level === 'h1' ? 'text-2xl' : 
          elementData.level === 'h2' ? 'text-xl' : 'text-lg'
        }`}
        style={{ color: headingColor }}
      >
        {elementData.text}
      </HeadingTag>
    </div>
  );
}
