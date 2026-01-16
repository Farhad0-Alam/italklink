import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function QRCodeRenderer({ element, isEditing, onUpdate, cardData }: ElementRendererProps) {
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
          <div>
            <label className="text-xs text-gray-400 block mb-1">QR Code URL</label>
            <Input
              value={elementData?.url || ''}
              onChange={(e) => handleDataUpdate({ url: e.target.value })}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Size: {elementData?.size || 128}px</label>
            <input
              type="range"
              min="64"
              max="256"
              value={elementData?.size || 128}
              onChange={(e) => handleDataUpdate({ size: Number(e.target.value) })}
              className="w-full accent-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Foreground</label>
              <input
                type="color"
                value={elementData?.color || '#000000'}
                onChange={(e) => handleDataUpdate({ color: e.target.value })}
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Background</label>
              <input
                type="color"
                value={elementData?.backgroundColor || '#FFFFFF'}
                onChange={(e) => handleDataUpdate({ backgroundColor: e.target.value })}
                className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
              />
            </div>
          </div>

          {elementData?.url && (
            <div className="mt-3 flex justify-center">
              <QRCodeSVG
                value={elementData.url}
                size={elementData?.size || 128}
                fgColor={elementData?.color || '#000000'}
                bgColor={elementData?.backgroundColor || '#FFFFFF'}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!elementData?.url) {
    return (
      <div className="mb-4 p-8 bg-slate-100 rounded-lg text-center text-slate-500 border-2 border-dashed border-slate-300">
        <i className="fas fa-qrcode text-3xl mb-2"></i>
        <p>No QR code URL set</p>
      </div>
    );
  }

  return (
    <div className="mb-4 flex justify-center">
      <QRCodeSVG
        value={elementData.url}
        size={elementData?.size || 128}
        fgColor={elementData?.color || '#000000'}
        bgColor={elementData?.backgroundColor || '#FFFFFF'}
      />
    </div>
  );
}

export const qrcodeConfig: ElementConfig = {
  metadata: {
    type: "qrcode",
    title: "QR Code",
    icon: "Layout",
    category: "Commerce",
    description: "Generate a QR code"
  },
  defaultData: () => ({
    url: "https://example.com",
    size: 128,
    color: "#000000",
    backgroundColor: "#FFFFFF",
    includeLogo: false,
    logoSize: 30
  }),
  Renderer: QRCodeRenderer
};

export default qrcodeConfig;
