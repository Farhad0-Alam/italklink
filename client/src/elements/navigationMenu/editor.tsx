import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconPicker } from "@/components/icon-picker";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function NavigationMenuContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const items = data.items || [];

  const addItem = () => {
    const newItem = {
      id: generateFieldId(),
      label: "New Link",
      url: "#",
      icon: "fas fa-link"
    };
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
        <h4 className="text-sm font-medium text-gray-700">Menu Items ({items.length})</h4>
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
            <label className="block text-xs text-gray-500 mb-1">Label</label>
            <Input
              value={item.label || ''}
              onChange={(e) => updateItem(index, 'label', e.target.value)}
              className="text-sm"
              placeholder="Link text"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">URL</label>
            <Input
              value={item.url || ''}
              onChange={(e) => updateItem(index, 'url', e.target.value)}
              className="text-sm"
              placeholder="https://example.com or #section"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Icon</label>
            <IconPicker
              value={item.icon || ''}
              onChange={(icon) => updateItem(index, 'icon', icon)}
            />
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <i className="fas fa-bars text-2xl mb-2"></i>
          <p className="text-sm">No menu items</p>
          <p className="text-xs">Click "Add" to create your first link</p>
        </div>
      )}
    </div>
  );
}

function NavigationMenuDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Direction</label>
            <select
              value={data.layout || "horizontal"}
              onChange={(e) => onChange({ ...data, layout: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Alignment</label>
            <div className="flex gap-1">
              {['left', 'center', 'right'].map(align => (
                <button
                  key={align}
                  onClick={() => onChange({ ...data, alignment: align })}
                  className={`flex-1 py-2 px-3 text-sm rounded border ${
                    (data.alignment || 'center') === align 
                      ? 'border-orange-500 bg-orange-50 text-orange-600' 
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <i className={`fas fa-align-${align}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
            <select
              value={data.menuStyle || "links"}
              onChange={(e) => onChange({ ...data, menuStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="links">Text Links</option>
              <option value="buttons">Buttons</option>
              <option value="pills">Pills</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Link Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.linkColor || "#1f2937"}
                onChange={(e) => onChange({ ...data, linkColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Hover Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.hoverColor || "#10b981"}
                onChange={(e) => onChange({ ...data, hoverColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
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

function NavigationMenuSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Display Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showIcons !== false}
                onChange={(e) => onChange({ ...data, showIcons: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Icons
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.openInNewTab || false}
                onChange={(e) => onChange({ ...data, openInNewTab: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Open Links in New Tab
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

export function NavigationMenuEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="navigationMenu"
        elementTitle="Navigation Menu"
        compact
        contentPanel={<NavigationMenuContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<NavigationMenuDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<NavigationMenuSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
