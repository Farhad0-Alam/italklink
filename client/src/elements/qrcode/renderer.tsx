import { QRCodeSVG } from "qrcode.react";
import { ElementRendererProps } from "../registry/types";

export function QRCodeRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

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
