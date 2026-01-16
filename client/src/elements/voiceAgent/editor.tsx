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

function VoiceAgentContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Phone Number</label>
        <Input
          value={data.phoneNumber || ""}
          onChange={(e) => onChange({ ...data, phoneNumber: e.target.value })}
          placeholder="+1234567890"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Greeting</label>
        <Input
          value={data.greeting || "Hello, how can I help you?"}
          onChange={(e) => onChange({ ...data, greeting: e.target.value })}
          placeholder="Greeting message"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Language</label>
        <select
          value={data.language || "en"}
          onChange={(e) => onChange({ ...data, language: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="bn">Bengali</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">System Instructions (Optional)</label>
        <Textarea
          value={data.systemPrompt || ""}
          onChange={(e) => onChange({ ...data, systemPrompt: e.target.value })}
          placeholder="Define how the voice agent should behave..."
          className="text-sm"
          rows={3}
        />
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800">
          <i className="fas fa-info-circle mr-2"></i>
          Voice Agent enables real-time voice conversations.
        </p>
      </div>
    </div>
  );
}

function VoiceAgentDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Button Style</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonColor || "#10b981"}
                onChange={(e) => onChange({ ...data, buttonColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Text</label>
            <Input
              value={data.buttonText || "Start Voice Call"}
              onChange={(e) => onChange({ ...data, buttonText: e.target.value })}
              placeholder="Start Voice Call"
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Size</label>
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

function VoiceAgentSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Voice Settings</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Voice Type</label>
            <select
              value={data.voiceType || "natural"}
              onChange={(e) => onChange({ ...data, voiceType: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="natural">Natural</option>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
            </select>
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

export function VoiceAgentEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="voiceAgent"
        elementTitle="Voice Agent"
        compact
        contentPanel={<VoiceAgentContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<VoiceAgentDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<VoiceAgentSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
