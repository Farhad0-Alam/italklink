import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  TypographyPanel,
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function SubscribeFormContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
        <Input
          value={data.title || "Subscribe to Updates"}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Subscribe to Updates"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description (Optional)</label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Get notified about new updates..."
          className="text-sm"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
        <Input
          value={data.buttonText || "Subscribe"}
          onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
          placeholder="Subscribe"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Success Message</label>
        <Input
          value={data.successMessage || "Thank you for subscribing!"}
          onChange={(e) => onChange({ ...data, successMessage: e.target.value })}
          placeholder="Thank you for subscribing!"
          className="text-sm"
        />
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Notification Channels</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <span className="text-sm font-medium text-gray-700">Browser Push</span>
              <p className="text-xs text-gray-500">Send push notifications</p>
            </div>
            <input
              type="checkbox"
              checked={data.enablePush !== false}
              onChange={(e) => onChange({ ...data, enablePush: e.target.checked })}
              className="rounded border-gray-300 w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <span className="text-sm font-medium text-gray-700">Email</span>
              <p className="text-xs text-gray-500">Collect email addresses</p>
            </div>
            <input
              type="checkbox"
              checked={data.enableEmail !== false}
              onChange={(e) => onChange({ ...data, enableEmail: e.target.checked })}
              className="rounded border-gray-300 w-5 h-5"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function SubscribeFormDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Form Style</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Layout</label>
            <select
              value={data.formLayout || "stacked"}
              onChange={(e) => onChange({ ...data, formLayout: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="stacked">Stacked</option>
              <option value="inline">Inline</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Button Colors</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonBgColor || "#10b981"}
                onChange={(e) => onChange({ ...data, buttonBgColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              {data.buttonBgColor && (
                <button
                  onClick={() => onChange({ ...data, buttonBgColor: undefined })}
                  className="text-xs text-orange-500 hover:text-orange-600"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonTextColor || "#ffffff"}
                onChange={(e) => onChange({ ...data, buttonTextColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Typography</h4>
        <TypographyPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Background</h4>
        <BackgroundPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function SubscribeFormSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Privacy</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showPrivacyNote !== false}
                onChange={(e) => onChange({ ...data, showPrivacyNote: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Privacy Note
            </label>
          </div>

          {data.showPrivacyNote !== false && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Privacy Note Text</label>
              <Input
                value={data.privacyNote || "We respect your privacy."}
                onChange={(e) => onChange({ ...data, privacyNote: e.target.value })}
                placeholder="We respect your privacy."
                className="text-sm"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function SubscribeFormEditor({ element, onUpdate }: ElementEditorProps) {
  const { activeTab, setActiveTab } = useElementEditorTabs("content");
  const elementIdRef = useRef(element.id);
  const isLocalUpdateRef = useRef(false);

  const [editorData, setEditorData] = useState(() => element.data || {});

  useEffect(() => {
    if (element.id !== elementIdRef.current) {
      elementIdRef.current = element.id;
      setEditorData(element.data || {});
    } else if (!isLocalUpdateRef.current && element.data) {
      setEditorData(element.data);
    }
    isLocalUpdateRef.current = false;
  }, [element.id, element.data]);

  const handleChange = useCallback((updatedData: any) => {
    isLocalUpdateRef.current = true;
    setEditorData(updatedData);
    onUpdate({ ...element, data: updatedData });
  }, [element, onUpdate]);

  return (
    <div className="h-full">
      <ElementEditorPanel
        activeTab={activeTab}
        onTabChange={setActiveTab}
        elementType="subscribeForm"
        elementTitle="Subscribe Form"
        compact
        contentPanel={<SubscribeFormContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<SubscribeFormDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<SubscribeFormSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
