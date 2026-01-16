import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ElementEditorProps } from "../registry/types";

export function SubscribeFormEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">Subscribe Form</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
          <Input
            value={elementData.title || "Subscribe to Updates"}
            onChange={(e) => handleDataUpdate({ title: e.target.value })}
            placeholder="Subscribe title"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
          <Input
            value={elementData.description || ""}
            onChange={(e) => handleDataUpdate({ description: e.target.value })}
            placeholder="Optional description"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
          <Input
            value={elementData.buttonText || "Subscribe"}
            onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
            placeholder="Subscribe"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Success Message</label>
          <Input
            value={elementData.successMessage || "Thank you for subscribing!"}
            onChange={(e) => handleDataUpdate({ successMessage: e.target.value })}
            placeholder="Thank you for subscribing!"
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-100 rounded">
          <span className="text-sm text-slate-600">Enable Browser Push Notifications</span>
          <Switch
            checked={elementData.enablePush !== false}
            onCheckedChange={(checked) => handleDataUpdate({ enablePush: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-2 bg-slate-100 rounded">
          <span className="text-sm text-slate-600">Enable Email Notifications</span>
          <Switch
            checked={elementData.enableEmail !== false}
            onCheckedChange={(checked) => handleDataUpdate({ enableEmail: checked })}
          />
        </div>
      </div>
    </div>
  );
}
