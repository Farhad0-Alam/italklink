import { Textarea } from "@/components/ui/textarea";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function ParagraphRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
  const elementData = element.data || {};
  const paragraphColor = elementData?.color || cardData?.paragraphColor || "#141414";

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    return (
      <div className={`text-${elementData.alignment || 'left'} mb-4`}>
        <div className="space-y-2">
          <Textarea
            value={elementData?.text || ''}
            onChange={(e) => handleDataUpdate({ text: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Paragraph text"
            rows={3}
          />
          <select
            value={elementData?.alignment || 'left'}
            onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <div>
            <label className="text-xs text-gray-400 block mb-1">Text Color</label>
            <input
              type="color"
              value={elementData?.color || cardData?.paragraphColor || "#141414"}
              onChange={(e) => handleDataUpdate({ color: e.target.value })}
              className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
            />
            {elementData?.color && (
              <button
                onClick={() => handleDataUpdate({ color: undefined })}
                className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
              >
                <i className="fas fa-undo mr-1"></i>
                Reset to Theme
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`text-${elementData.alignment || 'left'} mb-4`}>
      <p className="text-sm leading-relaxed" style={{ color: paragraphColor }}>
        {elementData.text}
      </p>
    </div>
  );
}

export const paragraphConfig: ElementConfig = {
  metadata: {
    type: "paragraph",
    title: "Paragraph",
    icon: "FileText",
    category: "Basic",
    description: "Add text content to your card"
  },
  defaultData: () => ({ 
    text: "Enter your text here...", 
    alignment: "left" as const,
    size: "base",
    color: "#374151"
  }),
  Renderer: ParagraphRenderer
};

export default paragraphConfig;
