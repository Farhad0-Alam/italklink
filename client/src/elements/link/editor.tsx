import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { IconPicker } from "@/components/icon-picker";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  ShadowPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel,
  HoverEffectsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function LinkContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Link Text</label>
        <Input
          value={data.text || ""}
          onChange={(e) => onChange({ ...data, text: e.target.value })}
          placeholder="Click here"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">URL</label>
        <Input
          value={data.url || ""}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="https://example.com"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Style</label>
        <select
          value={data.style || "button"}
          onChange={(e) => onChange({ ...data, style: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="button">Button</option>
          <option value="text">Text Link</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Open In</label>
        <select
          value={data.target || "_self"}
          onChange={(e) => onChange({ ...data, target: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="_self">Same Tab</option>
          <option value="_blank">New Tab</option>
        </select>
      </div>

      {data.style === "button" && (
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Button Icon</label>
          <IconPicker
            value={data.buttonIcon || ""}
            onChange={(icon) => onChange({ ...data, buttonIcon: icon })}
          />
        </div>
      )}
    </div>
  );
}

function LinkDesignPanel({ data, onChange, cardData }: { data: any; onChange: (data: any) => void; cardData?: any }) {
  const theme = cardData?.theme || { brandColor: "#1e40af", secondaryColor: "#a855f7", tertiaryColor: "#ffffff" };
  const defaultBgColor = theme.brandColor || "#1e40af";
  const defaultTextColor = theme.tertiaryColor || "#ffffff";
  const defaultBorderColor = theme.secondaryColor || "#a855f7";

  if (data.style === "text") {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Text Style</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={data.textColor || "#3b82f6"}
                  onChange={(e) => onChange({ ...data, textColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Font Size</label>
              <select
                value={data.fontSize || ""}
                onChange={(e) => onChange({ ...data, fontSize: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
              >
                <option value="">Default</option>
                <option value="12px">12px</option>
                <option value="14px">14px</option>
                <option value="16px">16px</option>
                <option value="18px">18px</option>
                <option value="20px">20px</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={data.underline !== false}
                  onChange={(e) => onChange({ ...data, underline: e.target.checked })}
                  className="rounded border-gray-300 w-4 h-4"
                />
                Underline
              </label>
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

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Button Colors</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Background Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonBgColor || defaultBgColor}
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Text Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonTextColor || defaultTextColor}
                onChange={(e) => onChange({ ...data, buttonTextColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.buttonBorderColor || defaultBorderColor}
                onChange={(e) => onChange({ ...data, buttonBorderColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Button Shape</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Border Radius</label>
            <input
              type="range"
              min="0"
              max="24"
              value={data.buttonBorderRadius ?? 8}
              onChange={(e) => onChange({ ...data, buttonBorderRadius: Number(e.target.value) })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{data.buttonBorderRadius ?? 8}px</span>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Width</label>
            <select
              value={data.buttonWidth || "auto"}
              onChange={(e) => onChange({ ...data, buttonWidth: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="auto">Auto</option>
              <option value="full">Full Width</option>
            </select>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Shadow</h4>
        <ShadowPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Spacing</h4>
        <SpacingPanel data={data} onChange={onChange} />
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Hover Effects</h4>
        <HoverEffectsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

function LinkSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Visibility</h4>
        <VisibilitySettingsPanel data={data} onChange={onChange} />
      </div>

      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Tracking</h4>
        <div className="space-y-3">
          <div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={data.trackClicks !== false}
                onChange={(e) => onChange({ ...data, trackClicks: e.target.checked })}
                className="rounded border-gray-300 w-4 h-4"
              />
              Track Clicks
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-6">Record when users click this link</p>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-3">Advanced</h4>
        <AdvancedSettingsPanel data={data} onChange={onChange} />
      </div>
    </div>
  );
}

export function LinkEditor({ element, onUpdate, cardData }: ElementEditorProps) {
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
        elementType="link"
        elementTitle="Link/Button"
        compact
        contentPanel={<LinkContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<LinkDesignPanel data={editorData} onChange={handleChange} cardData={cardData} />}
        settingsPanel={<LinkSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
