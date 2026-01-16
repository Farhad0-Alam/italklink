import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function AIChatbotContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Greeting Message</label>
        <Input
          value={data.greeting || "Hello! How can I help you today?"}
          onChange={(e) => onChange({ ...data, greeting: e.target.value })}
          placeholder="Greeting message"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Input Placeholder</label>
        <Input
          value={data.placeholder || "Type your message..."}
          onChange={(e) => onChange({ ...data, placeholder: e.target.value })}
          placeholder="Input placeholder"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">System Prompt (Optional)</label>
        <Textarea
          value={data.systemPrompt || ""}
          onChange={(e) => onChange({ ...data, systemPrompt: e.target.value })}
          placeholder="You are a helpful assistant..."
          className="text-sm"
          rows={3}
        />
        <p className="text-xs text-gray-500 mt-1">Define how the AI should behave</p>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          AI Chatbot appears as a floating chat widget.
        </p>
      </div>
    </div>
  );
}

function AIChatbotDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Appearance</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Theme Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.themeColor || "#10b981"}
                onChange={(e) => onChange({ ...data, themeColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
            <select
              value={data.position || "bottom-right"}
              onChange={(e) => onChange({ ...data, position: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Chat Window Size</label>
            <select
              value={data.size || "md"}
              onChange={(e) => onChange({ ...data, size: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function AIChatbotSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Behavior</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.autoOpen || false}
                onChange={(e) => onChange({ ...data, autoOpen: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Auto-open on Page Load
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showTypingIndicator !== false}
                onChange={(e) => onChange({ ...data, showTypingIndicator: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Typing Indicator
            </label>
          </div>
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

export function AIChatbotEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="aiChatbot"
        elementTitle="AI Chatbot"
        compact
        contentPanel={<AIChatbotContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<AIChatbotDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<AIChatbotSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
