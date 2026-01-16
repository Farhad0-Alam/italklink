import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function HeadingEditor({ element, onUpdate, cardData }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className={`text-${elementData.alignment || 'left'} mb-4`}>
      <div className="space-y-2">
        <Input
          value={elementData?.text || ''}
          onChange={(e) => handleDataUpdate({ text: e.target.value })}
          className="bg-slate-700 border-slate-600 text-white"
          placeholder="Heading text"
        />
        <div className="flex gap-2">
          <select
            value={elementData?.level || 'h1'}
            onChange={(e) => handleDataUpdate({ level: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
          >
            <option value="h1">H1</option>
            <option value="h2">H2</option>
            <option value="h3">H3</option>
          </select>
          <select
            value={elementData?.alignment || 'left'}
            onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Text Color</label>
          <input
            type="color"
            value={elementData?.color || cardData?.headingColor || "#0f0f0f"}
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
