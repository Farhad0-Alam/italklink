import { ElementConfig, ElementRendererProps } from "../registry/types";
import { PDFViewerRenderer } from "./renderer";
import { PDFViewerEditor } from "./editor";

function PDFViewerElementRenderer(props: ElementRendererProps) {
  if (props.isEditing && props.onUpdate) {
    return <PDFViewerEditor element={props.element} onUpdate={props.onUpdate} cardData={props.cardData} />;
  }
  return <PDFViewerRenderer {...props} />;
}

export const pdfViewerConfig: ElementConfig = {
  metadata: {
    type: "pdfViewer",
    title: "PDF Viewer",
    icon: "FileText",
    category: "Interactive",
    description: "Display a PDF document"
  },
  defaultData: () => ({
    fileUrl: "",
    height: "500px",
    showToolbar: true,
    showDownload: true,
    showPrint: true
  }),
  Renderer: PDFViewerElementRenderer,
  Editor: PDFViewerEditor
};

export default pdfViewerConfig;
