import { ElementRendererProps } from "../registry/types";

export function LinkRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
  const theme = cardData?.theme || { brandColor: "#1e40af", secondaryColor: "#a855f7", tertiaryColor: "#ffffff" };

  if (elementData?.style === 'button') {
    const bgColor = elementData?.buttonBgColor || theme.brandColor || "#1e40af";
    const textColor = elementData?.buttonTextColor || theme.tertiaryColor || "#ffffff";
    const borderColor = elementData?.buttonBorderColor || theme.secondaryColor || "#a855f7";
    const borderRadius = elementData?.buttonBorderRadius ?? 8;

    return (
      <div className="mb-1">
        <a
          href={elementData?.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 font-medium transition-all hover:opacity-90 hover:scale-[1.02]"
          style={{
            backgroundColor: bgColor,
            color: textColor,
            borderRadius: `${borderRadius}px`,
            border: `2px solid ${borderColor}`,
          }}
        >
          {elementData?.buttonIcon && <i className={elementData.buttonIcon}></i>}
          {elementData?.text || 'Click Here'}
        </a>
      </div>
    );
  }

  return (
    <div className="mb-1">
      <a
        href={elementData?.url || '#'}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {elementData?.text || 'Click Here'}
      </a>
    </div>
  );
}
