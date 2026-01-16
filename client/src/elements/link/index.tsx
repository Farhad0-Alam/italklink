import { Input } from "@/components/ui/input";
import { IconPicker } from "@/components/icon-picker";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function LinkRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    const theme = cardData?.theme || { brandColor: "#1e40af", secondaryColor: "#a855f7", tertiaryColor: "#ffffff" };
    const defaultBgColor = theme.brandColor || "#1e40af";
    const defaultTextColor = theme.tertiaryColor || "#ffffff";
    const defaultBorderColor = theme.secondaryColor || "#a855f7";

    return (
      <div className="mb-1">
        <div className="space-y-3">
          <Input
            value={elementData?.text || ''}
            onChange={(e) => handleDataUpdate({ text: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="Link text"
          />
          <Input
            value={elementData?.url || ''}
            onChange={(e) => handleDataUpdate({ url: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white"
            placeholder="https://example.com"
          />
          <select
            value={elementData?.style || 'button'}
            onChange={(e) => handleDataUpdate({ style: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
          >
            <option value="button">Button</option>
            <option value="text">Text Link</option>
          </select>

          {elementData?.style === 'button' && (
            <div className="space-y-3 pt-2 border-t border-slate-600">
              <p className="text-xs text-gray-300 font-medium">Button Styling</p>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Icon (Optional)</label>
                <IconPicker
                  value={elementData?.buttonIcon || ''}
                  onChange={(icon) => handleDataUpdate({ buttonIcon: icon })}
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                <input
                  type="color"
                  value={elementData?.buttonBgColor || defaultBgColor}
                  onChange={(e) => handleDataUpdate({ buttonBgColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                />
                {elementData?.buttonBgColor && (
                  <button
                    onClick={() => handleDataUpdate({ buttonBgColor: undefined })}
                    className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                  >
                    <i className="fas fa-undo mr-1"></i>Reset to Theme
                  </button>
                )}
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                <input
                  type="color"
                  value={elementData?.buttonTextColor || defaultTextColor}
                  onChange={(e) => handleDataUpdate({ buttonTextColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                <input
                  type="color"
                  value={elementData?.buttonBorderColor || defaultBorderColor}
                  onChange={(e) => handleDataUpdate({ buttonBorderColor: e.target.value })}
                  className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                />
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Border Radius: {elementData?.buttonBorderRadius ?? 8}px</label>
                <input
                  type="range"
                  min="0"
                  max="24"
                  value={elementData?.buttonBorderRadius ?? 8}
                  onChange={(e) => handleDataUpdate({ buttonBorderRadius: Number(e.target.value) })}
                  className="w-full accent-green-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

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

export const linkConfig: ElementConfig = {
  metadata: {
    type: "link",
    title: "3D Button",
    icon: "Link",
    category: "Basic",
    description: "Add a clickable button or link"
  },
  defaultData: () => ({ 
    text: "Click Here", 
    url: "https://example.com", 
    style: "button" as const,
    variant: "primary" as const,
    size: "md",
    fullWidth: false
  }),
  Renderer: LinkRenderer
};

export default linkConfig;
