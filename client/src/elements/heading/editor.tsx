import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
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

function HeadingContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Heading Text</label>
        <Input
          value={data.text || ""}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Enter heading text"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Heading Level</label>
        <select
          value={data.level || "h1"}
          onChange={(e) => onChange({ ...data, level: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="h1">H1 - Main Heading</option>
          <option value="h2">H2 - Section Heading</option>
          <option value="h3">H3 - Subsection</option>
          <option value="h4">H4 - Minor Heading</option>
          <option value="h5">H5</option>
          <option value="h6">H6</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link URL (Optional)</label>
        <Input
          value={data.linkUrl || ""}
          onChange={(e) => onChange({ ...data, linkUrl: e.target.value })}
          placeholder="https://example.com"
          className="text-sm"
        />
      </div>
    </div>
  );
}

function HeadingDesignPanel({ data, onChange, cardData }: { data: any; onChange: (data: any) => void; cardData?: any }) {
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

function HeadingSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
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

export function HeadingEditor({ element, onUpdate, cardData }: ElementEditorProps) {
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
        elementType="heading"
        elementTitle="Heading"
        compact
        contentPanel={
          <HeadingContentPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
        designPanel={
          <HeadingDesignPanel 
            data={editorData} 
            onChange={handleChange}
            cardData={cardData}
          />
        }
        settingsPanel={
          <HeadingSettingsPanel 
            data={editorData} 
            onChange={handleChange} 
          />
        }
      />
    </div>
  );
}
