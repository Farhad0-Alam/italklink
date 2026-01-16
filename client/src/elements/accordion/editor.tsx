import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function AccordionContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const items = data.items || [];

  const addItem = () => {
    const newItem = { id: generateFieldId(), title: "New Section", content: "Content here..." };
    onChange({ ...data, items: [...items, newItem] });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, items: updated });
  };

  const removeItem = (index: number) => {
    const updated = items.filter((_: any, i: number) => i !== index);
    onChange({ ...data, items: updated });
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === items.length - 1)) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...items];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onChange({ ...data, items: updated });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-700">Accordion Items ({items.length})</h4>
        <Button variant="outline" size="sm" onClick={addItem}>
          <i className="fas fa-plus mr-2"></i>Add
        </Button>
      </div>

      {items.map((item: any, index: number) => (
        <div key={item.id || index} className="bg-gray-50 p-3 rounded-lg border space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveItem(index, 'up')}
                disabled={index === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <i className="fas fa-chevron-up"></i>
              </button>
              <button
                onClick={() => moveItem(index, 'down')}
                disabled={index === items.length - 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
              >
                <i className="fas fa-chevron-down"></i>
              </button>
              <span className="text-sm font-medium text-gray-600">#{index + 1}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(index)}
              className="text-red-400 hover:text-red-500 h-6 w-6 p-0"
            >
              <i className="fas fa-times"></i>
            </Button>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Title</label>
            <Input
              value={item.title || ''}
              onChange={(e) => updateItem(index, 'title', e.target.value)}
              className="text-sm"
              placeholder="Section title"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Content</label>
            <Textarea
              value={item.content || ''}
              onChange={(e) => updateItem(index, 'content', e.target.value)}
              className="text-sm"
              placeholder="Section content..."
              rows={3}
            />
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <i className="fas fa-layer-group text-2xl mb-2"></i>
          <p className="text-sm">No accordion items</p>
          <p className="text-xs">Click "Add" to create your first item</p>
        </div>
      )}
    </div>
  );
}

function AccordionDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Style</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Accordion Style</label>
            <select
              value={data.style || "bordered"}
              onChange={(e) => onChange({ ...data, style: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="bordered">Bordered</option>
              <option value="separated">Separated Cards</option>
              <option value="minimal">Minimal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Header Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.headerColor || "#f3f4f6"}
                onChange={(e) => onChange({ ...data, headerColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Header Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.headerTextColor || "#1f2937"}
                onChange={(e) => onChange({ ...data, headerTextColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon Style</label>
            <select
              value={data.iconStyle || "chevron"}
              onChange={(e) => onChange({ ...data, iconStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="chevron">Chevron</option>
              <option value="plus">Plus/Minus</option>
              <option value="arrow">Arrow</option>
              <option value="none">None</option>
            </select>
          </div>
        </div>
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

function AccordionSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Behavior</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.allowMultiple || false}
                onChange={(e) => onChange({ ...data, allowMultiple: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Allow Multiple Open
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Allow multiple sections open at once</p>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.defaultOpen !== false}
                onChange={(e) => onChange({ ...data, defaultOpen: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              First Item Open by Default
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

export function AccordionEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="accordion"
        elementTitle="Accordion"
        compact
        contentPanel={<AccordionContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<AccordionDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<AccordionSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
