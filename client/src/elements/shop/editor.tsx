import { Input } from "@/components/ui/input";
import { ElementEditorProps } from "../registry/types";

export function ShopEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  return (
    <div className="mb-4">
      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="fas fa-shopping-bag text-green-600"></i>
            Digital Shop
          </h3>
          <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">Draggable</span>
        </div>
        <p className="text-sm text-slate-600">
          Showcase your digital products directly on your business card.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Shop Title</label>
            <Input
              value={elementData.title || "My Digital Products"}
              onChange={(e) => handleDataUpdate({ title: e.target.value })}
              placeholder="Enter shop title"
              data-testid="shop-element-title"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
            <Input
              value={elementData.description || ""}
              onChange={(e) => handleDataUpdate({ description: e.target.value })}
              placeholder="Enter shop description"
              data-testid="shop-element-description"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Max Items to Display</label>
            <Input
              type="number"
              min="1"
              max="12"
              value={elementData.maxItems || 6}
              onChange={(e) => handleDataUpdate({ maxItems: parseInt(e.target.value) })}
              data-testid="shop-element-maxitems"
            />
          </div>
        </div>
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">
            <i className="fas fa-info-circle mr-2"></i>
            Shows your latest digital products with search and purchase options.
          </p>
        </div>
      </div>
    </div>
  );
}
