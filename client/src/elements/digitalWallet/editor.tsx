import { useState, useEffect, useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { ElementEditorPanel, useElementEditorTabs } from "@/components/ElementEditorTabs";
import { 
  SpacingPanel, 
  BackgroundPanel,
  VisibilitySettingsPanel, 
  AdvancedSettingsPanel
} from "@/components/SharedEditorPanels";
import { ElementEditorProps } from "../registry/types";

function DigitalWalletContentPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Wallet Address</label>
        <Input
          value={data.walletAddress || ""}
          onChange={(e) => onChange({ ...data, walletAddress: e.target.value })}
          placeholder="Your wallet address"
          className="text-sm"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Currency</label>
        <select
          value={data.currency || "USD"}
          onChange={(e) => onChange({ ...data, currency: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="BTC">Bitcoin</option>
          <option value="ETH">Ethereum</option>
          <option value="BDT">BDT (Taka)</option>
        </select>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Payment Methods</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <span className="text-sm font-medium text-gray-700">Apple Pay</span>
            </div>
            <input
              type="checkbox"
              checked={data.showApplePay !== false}
              onChange={(e) => onChange({ ...data, showApplePay: e.target.checked })}
              className="rounded border-gray-300 w-5 h-5"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
            <div>
              <span className="text-sm font-medium text-gray-700">Google Pay</span>
            </div>
            <input
              type="checkbox"
              checked={data.showGooglePay !== false}
              onChange={(e) => onChange({ ...data, showGooglePay: e.target.checked })}
              className="rounded border-gray-300 w-5 h-5"
            />
          </div>
        </div>
      </div>

      <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <i className="fas fa-info-circle mr-2"></i>
          Digital wallet buttons for quick payments.
        </p>
      </div>
    </div>
  );
}

function DigitalWalletDesignPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Layout</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Layout</label>
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
            <label className="block text-xs font-medium text-gray-600 mb-1">Button Size</label>
            <select
              value={data.buttonSize || "md"}
              onChange={(e) => onChange({ ...data, buttonSize: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
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

function DigitalWalletSettingsPanel({ data, onChange }: { data: any; onChange: (data: any) => void }) {
  return (
    <div className="space-y-6">
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

export function DigitalWalletEditor({ element, onUpdate }: ElementEditorProps) {
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
        elementType="digitalWallet"
        elementTitle="Digital Wallet"
        compact
        contentPanel={<DigitalWalletContentPanel data={editorData} onChange={handleChange} />}
        designPanel={<DigitalWalletDesignPanel data={editorData} onChange={handleChange} />}
        settingsPanel={<DigitalWalletSettingsPanel data={editorData} onChange={handleChange} />}
      />
    </div>
  );
}
