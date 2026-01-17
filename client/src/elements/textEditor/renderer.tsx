import { ElementRendererProps } from "../registry/types";

export function TextEditorRenderer({ element, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
  const textColor = elementData?.color || cardData?.paragraphColor || "#333333";
  const textAlign = elementData?.alignment || "left";
  const fontSize = elementData?.fontSize || 16;
  const fontWeight = elementData?.fontWeight || "normal";
  const lineHeight = elementData?.lineHeight || 1.6;
  const fontFamily = elementData?.fontFamily || cardData?.paragraphFont || "inherit";
  const letterSpacing = elementData?.letterSpacing || "normal";
  const wordSpacing = elementData?.wordSpacing || "normal";
  const columns = elementData?.columns || 1;
  const dropCap = elementData?.dropCap || false;

  const containerStyle: React.CSSProperties = {
    padding: elementData?.padding || "0px",
    margin: elementData?.margin || "0px",
    backgroundColor: elementData?.backgroundColor || "transparent",
    borderRadius: elementData?.borderRadius || "0px",
  };

  const textStyle: React.CSSProperties = {
    color: textColor,
    textAlign: textAlign as any,
    fontSize: `${fontSize}px`,
    fontWeight: fontWeight,
    lineHeight: lineHeight,
    fontFamily: fontFamily,
    letterSpacing: letterSpacing,
    wordSpacing: wordSpacing,
    columnCount: columns > 1 ? columns : undefined,
    columnGap: columns > 1 ? "24px" : undefined,
  };

  const content = elementData?.content || "<p>Add your text here. Click to edit.</p>";

  const dropCapStyles = dropCap ? `
    .text-editor-content p:first-of-type::first-letter {
      float: left;
      font-size: 3.5em;
      line-height: 0.8;
      padding-right: 8px;
      padding-top: 4px;
      font-weight: bold;
      color: ${textColor};
    }
  ` : "";

  return (
    <div style={containerStyle} className="text-editor-element">
      {dropCap && <style>{dropCapStyles}</style>}
      <div 
        style={textStyle}
        className={`prose prose-sm max-w-none text-editor-content ${dropCap ? 'has-drop-cap' : ''}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
