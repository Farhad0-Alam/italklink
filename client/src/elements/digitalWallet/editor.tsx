import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function DigitalWalletEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
        <h4 className="text-md font-semibold text-slate-800">Digital Wallet</h4>
        
        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Wallet Address</label>
          <Input
            value={elementData.walletAddress || ""}
            onChange={(e) => handleDataUpdate({ walletAddress: e.target.value })}
            placeholder="Your wallet address"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700 block mb-1">Currency</label>
          <select
            value={elementData.currency || "USD"}
            onChange={(e) => handleDataUpdate({ currency: e.target.value })}
            className="w-full p-2 border rounded"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="BTC">Bitcoin</option>
            <option value="ETH">Ethereum</option>
          </select>
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <i className="fas fa-info-circle mr-2"></i>
            Add Apple Pay and Google Pay buttons.
          </p>
        </div>
      </div>
    </div>
  );
}
