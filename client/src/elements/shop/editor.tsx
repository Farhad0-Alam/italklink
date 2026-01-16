import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function ShopContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Shop Title</label>
        <Input
          value={data.title || "My Digital Products"}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Enter shop title"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
        <Textarea
          value={data.description || ""}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Enter shop description"
          className="text-sm"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Max Items to Display</label>
        <Input
          type="number"
          min="1"
          max="12"
          value={data.maxItems || 6}
          onChange={(e) => onChange({ ...data, maxItems: parseInt(e.target.value) })}
          className="text-sm"
        />
        <p className="text-xs text-gray-500 mt-1">Number of products to show (1-12)</p>
      </div>

      <div className="p-3 bg-green-50 border border-green-200 rounded-md">
        <p className="text-sm text-green-800">
          <i className="fas fa-info-circle mr-2"></i>
          Shows your digital products with search and purchase options.
        </p>
      </div>
    </div>
  );
}

function ShopDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Grid Columns</label>
            <select
              value={data.columns || "2"}
              onChange={(e) => onChange({ ...data, columns: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="1">1 Column</option>
              <option value="2">2 Columns</option>
              <option value="3">3 Columns</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Card Style</label>
            <select
              value={data.cardStyle || "modern"}
              onChange={(e) => onChange({ ...data, cardStyle: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="modern">Modern</option>
              <option value="minimal">Minimal</option>
              <option value="compact">Compact</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showSearch !== false}
                onChange={(e) => onChange({ ...data, showSearch: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Search Bar
            </label>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Colors</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.accentColor || "#10b981"}
                onChange={(e) => onChange({ ...data, accentColor: e.target.value })}
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

function ShopSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Display Options</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showPrices !== false}
                onChange={(e) => onChange({ ...data, showPrices: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Prices
            </label>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showRatings || false}
                onChange={(e) => onChange({ ...data, showRatings: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Ratings
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

export function ShopEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="shop"
        elementTitle="Digital Shop"
        compact
        contentPanel={<ShopContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<ShopDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<ShopSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
