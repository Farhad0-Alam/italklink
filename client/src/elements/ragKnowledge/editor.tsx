import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { KnowledgeManager } from "@/components/KnowledgeManager";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function RAGKnowledgeContentPanel({ data, onChange, cardData }: { data: any; onChange: (data: any) => void; cardData?: any }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Greeting Message</label>
        <Input
          value={data.greeting || "Hi! Ask me anything about our services."}
          onChange={(e) => onChange({ ...data, greeting: e.target.value })}
          placeholder="Greeting message"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Input Placeholder</label>
        <Input
          value={data.placeholder || "Ask a question about our services..."}
          onChange={(e) => onChange({ ...data, placeholder: e.target.value })}
          placeholder="Input placeholder"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">System Instructions (Optional)</label>
        <Textarea
          value={data.systemPrompt || ""}
          onChange={(e) => onChange({ ...data, systemPrompt: e.target.value })}
          placeholder="Additional instructions for the AI..."
          className="text-sm"
          rows={2}
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Knowledge Base</h4>
        <KnowledgeManager cardId={cardData?.id} />
      </div>

      <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
        <p className="text-sm text-purple-800">
          <i className="fas fa-info-circle mr-2"></i>
          RAG-powered chatbot answers questions using your knowledge base.
        </p>
      </div>
    </div>
  );
}

function RAGKnowledgeDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
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
                value={data.themeColor || "#7c3aed"}
                onChange={(e) => onChange({ ...data, themeColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Display Mode</label>
            <select
              value={data.displayMode || "inline"}
              onChange={(e) => onChange({ ...data, displayMode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="inline">Inline</option>
              <option value="floating">Floating Widget</option>
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

function RAGKnowledgeSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Behavior</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showSources !== false}
                onChange={(e) => onChange({ ...data, showSources: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Source References
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.persistChat || false}
                onChange={(e) => onChange({ ...data, persistChat: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Persist Chat History
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

export function RAGKnowledgeEditor({ element, onUpdate, cardData }: ElementEditorProps) {
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
        elementType="ragKnowledge"
        elementTitle="RAG Knowledge Base"
        compact
        contentPanel={<RAGKnowledgeContentPanel data={editorData} onChange={handleChange} cardData={cardData} />}
        designPanel={<RAGKnowledgeDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<RAGKnowledgeSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
