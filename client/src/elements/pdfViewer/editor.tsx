import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function PDFViewerEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <div className="mb-4">
          <h4 className="text-md font-semibold text-slate-800">PDF Viewer</h4>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Upload PDF File *</label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.type === 'application/pdf') {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const base64 = event.target?.result as string;
                    handleDataUpdate({ 
                      pdf_file: base64,
                      file_name: file.name
                    });
                  };
                  reader.readAsDataURL(file);
                }
              }}
              className="w-full"
              data-testid="pdf-file-input"
            />
            {elementData.file_name && (
              <p className="text-xs text-green-600 mt-1">
                <i className="fas fa-check mr-1"></i>
                Uploaded: {elementData.file_name}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
            <Input
              value={elementData.button_text || "View PDF"}
              onChange={(e) => handleDataUpdate({ button_text: e.target.value })}
              placeholder="View PDF"
              className="w-full"
              data-testid="pdf-button-text-input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
              <Input
                type="color"
                value={elementData.buttonColor || "#6b21a8"}
                onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                className="w-full h-10"
                data-testid="pdf-button-color-input"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
              <Input
                type="color"
                value={elementData.textColor || "#ffffff"}
                onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                className="w-full h-10"
                data-testid="pdf-text-color-input"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">
              Scale ({Math.round((elementData.scale || 1.0) * 100)}%)
            </label>
            <Input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={elementData.scale || 1.0}
              onChange={(e) => handleDataUpdate({ scale: parseFloat(e.target.value) })}
              className="w-full"
              data-testid="pdf-scale-input"
            />
            <div className="text-xs text-slate-500 mt-1">
              Adjust PDF zoom level (50% - 300%)
            </div>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
            <p className="text-sm text-purple-800">
              <i className="fas fa-info-circle mr-2"></i>
              PDF will open in a modal with clickable links, zoom controls, and download options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
