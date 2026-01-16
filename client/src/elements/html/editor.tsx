import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ElementEditorProps } from "../registry/types";

export function HTMLEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

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
