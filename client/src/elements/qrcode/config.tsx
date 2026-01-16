import { ElementConfig, ElementRendererProps } from "../registry/types";
import { QRCodeRenderer } from "./renderer";
import { QRCodeEditor } from "./editor";

function QRCodeElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <QRCodeEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <QRCodeRenderer {...props} />;
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
  Renderer: QRCodeElementRenderer,
  Editor: QRCodeEditor
};

export default qrcodeConfig;
