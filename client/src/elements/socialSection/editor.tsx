import { useState, useEffect, useCallback, useRef } from "react";
import { SocialSectionEditor as SocialSectionEditorComponent } from "@/components/SocialSectionEditor";
import { schemaToEditorSocial, editorToSchemaSocial } from "@/lib/element-adapters";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function SocialSectionContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  const socials = (data.socials || []).map(schemaToEditorSocial);

  return (
    <div className="space-y-4">
      <SocialSectionEditorComponent
        socials={socials}
        onChange={(updatedSocials) => {
          const schemaSocials = updatedSocials.map(editorToSchemaSocial);
          onChange({ ...data, socials: schemaSocials });
        }}
        layout={data.layout || 'horizontal'}
        onLayoutChange={(layout) => onChange({ ...data, layout })}
        size={data.size || 'md'}
        onSizeChange={(size) => onChange({ ...data, size })}
        showLabels={data.showLabels !== false}
        onShowLabelsChange={(show) => onChange({ ...data, showLabels: show })}
      />
    </div>
  );
}

function SocialSectionDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Icon Style</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon Shape</label>
            <select
              value={data.iconShape || "circle"}
              onChange={(e) => onChange({ ...data, iconShape: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="circle">Circle</option>
              <option value="rounded">Rounded Square</option>
              <option value="square">Square</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Icon Size</label>
            <select
              value={data.size || "md"}
              onChange={(e) => onChange({ ...data, size: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Color Mode</label>
            <select
              value={data.colorMode || "brand"}
              onChange={(e) => onChange({ ...data, colorMode: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="brand">Brand Colors</option>
              <option value="monochrome">Monochrome</option>
              <option value="custom">Custom Color</option>
            </select>
          </div>

          {data.colorMode === "custom" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Custom Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.customColor || "#10b981"}
                  onChange={(e) => onChange({ ...data, customColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Arrangement</label>
            <select
              value={data.layout || "horizontal"}
              onChange={(e) => onChange({ ...data, layout: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="horizontal">Horizontal</option>
              <option value="vertical">Vertical</option>
              <option value="grid">Grid</option>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Gap Between Icons</label>
            <input
              type="range"
              min="4"
              max="24"
              value={parseInt(data.gap || "12")}
              onChange={(e) => onChange({ ...data, gap: e.target.value + "px" })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.gap || "12px"}</span>
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

function SocialSectionSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Labels</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.showLabels !== false}
                onChange={(e) => onChange({ ...data, showLabels: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Show Platform Labels
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

export function SocialSectionEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="socialSection"
        elementTitle="Social Links"
        compact
        contentPanel={<SocialSectionContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<SocialSectionDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<SocialSectionSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
