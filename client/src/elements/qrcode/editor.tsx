import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { ElementEditorProps } from "../registry/types";

export function QRCodeEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

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
