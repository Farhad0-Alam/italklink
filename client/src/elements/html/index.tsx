import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ElementConfig, ElementRendererProps } from "../registry/types";

function HTMLRenderer({ element, isEditing, onUpdate }: ElementRendererProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  if (isEditing) {
    return (
      <div className="w-full max-w-[430px] mx-auto">
        <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
          <div className="mb-4">
            <h4 className="text-md font-semibold text-slate-800">Custom HTML Element</h4>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">HTML Content</label>
              <Textarea
                value={elementData.content || ""}
                onChange={(e) => handleDataUpdate({ content: e.target.value })}
                placeholder="Enter your HTML code here..."
                className="min-h-[200px] font-mono text-sm"
                data-testid="html-content-editor"
              />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Height (px)</label>
                <Input
                  type="number"
                  value={elementData.height || 300}
                  onChange={(e) => handleDataUpdate({ height: parseInt(e.target.value) || 300 })}
                  min={100}
                  max={1000}
                  className="w-24"
                  data-testid="html-height-input"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={elementData.sandbox !== false}
                  onCheckedChange={(checked) => handleDataUpdate({ sandbox: checked })}
                  data-testid="html-sandbox-checkbox"
                />
                <label className="text-sm font-medium text-slate-700">Security sandboxing (recommended)</label>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Security Note: JavaScript and external scripts will be disabled for safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!elementData.content || !elementData.content.trim()) {
    return (
      <div className="w-full max-w-[430px] mx-auto">
        <div 
          className="border-2 border-dashed border-slate-300 p-8 text-center text-slate-500"
          style={{ width: '430px', maxWidth: '100%', height: `${elementData.height || 300}px` }}
          data-testid="html-placeholder"
        >
          <i className="fas fa-code text-4xl mb-4"></i>
          <p>Add HTML content to see preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[430px] mx-auto">
      <div className="html-element-preview w-full" data-testid="html-element-preview">
        <iframe
          srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${elementData.content}
</body>
</html>`}
          style={{ 
            width: '430px',
            maxWidth: '100%',
            height: `${elementData.height || 300}px`,
            border: 'none',
            borderRadius: '0'
          }}
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
          title="Custom HTML Content"
          data-testid="html-iframe"
        />
      </div>
    </div>
  );
}

export const htmlConfig: ElementConfig = {
  metadata: {
    type: "html",
    title: "Custom HTML",
    icon: "FileText",
    category: "Advanced",
    description: "Add custom HTML code"
  },
  defaultData: () => ({
    code: "<div>Your custom HTML here</div>",
    height: "auto",
    sanitize: true,
    allowScripts: false
  }),
  Renderer: HTMLRenderer
};

export default htmlConfig;
