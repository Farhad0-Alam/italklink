import { useState, useEffect, useCallback, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  TypographyPanel, 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel,
  AnimationPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function ParagraphContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Paragraph Text</label>
        <Textarea
          value={data.text || ""}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Enter your paragraph text here..."
          className="min-h-[120px] text-sm"
          rows={5}
        />
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={data.preserveLineBreaks || false}
            onChange={(e) => onChange({ ...data, preserveLineBreaks: e.target.checked })}
            className="rounded border-gray-300 w-4 h-4"
          />
          Preserve Line Breaks
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-6">Keep line breaks as entered</p>
      </div>
    </div>
  );
}

function ParagraphDesignPanel({ data, onChange, cardData }: { data: any; onChange: (data: any) => void; cardData?: any }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Typography</h4>
        <TypographyPanel data={data} onChange={onChange} cardData={cardData} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Background</h4>
        <BackgroundPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function ParagraphSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Animation</h4>
        <AnimationPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function ParagraphEditor({ element, onUpdate, cardData }: ElementEditorProps) {
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
        elementType="paragraph"
        elementTitle="Paragraph"
        compact
        contentPanel={
          <ParagraphContentPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
        designPanel={
          <ParagraphDesignPanel 
            data={editorData} 
            onChange={handleChange}
            cardData={cardData}
          />
        }
        settingsPanel={
          <ParagraphSettingsPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
      />
    </div>
  );
}
