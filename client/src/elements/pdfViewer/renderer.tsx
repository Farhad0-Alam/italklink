import { PdfViewerButton } from "@/components/PdfViewerButton";
import { ElementRendererProps } from "../registry/types";

export function PDFViewerRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};

  if (!elementData.pdf_file) {
    return (
      <div className="w-full max-w-[430px] mx-auto">
        <div className="border-2 border-dashed border-purple-300 p-8 text-center text-purple-500 rounded-2xl">
          <i className="fas fa-file-pdf text-4xl mb-4"></i>
          <p>Upload PDF file to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="pdf-viewer-element w-full flex justify-center" data-testid="pdf-viewer-element">
        <PdfViewerButton
          pdf_file={elementData.pdf_file}
          button_text={elementData.button_text || "View PDF"}
          scale={elementData.scale || 1.0}
          file_name={elementData.file_name || ""}
          buttonColor={elementData.buttonColor || "#6b21a8"}
          textColor={elementData.textColor || "#ffffff"}
          className="w-full max-w-xs"
        />
      </div>
    </div>
  );
}
