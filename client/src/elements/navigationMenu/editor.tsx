import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

export function NavigationMenuEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  const items = elementData?.items || [];

  const addItem = () => {
    const newItem = {
      id: generateFieldId(),
      label: "New Link",
      url: "#",
      icon: "fas fa-link"
    };
    handleDataUpdate({ items: [...items, newItem] });
  };

  const updateItem = (index: number, field: string, value: string) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleDataUpdate({ items: updatedItems });
  };

  const removeItem = (index: number) => {
    const updatedItems = items.filter((_: any, i: number) => i !== index);
    handleDataUpdate({ items: updatedItems });
  };

  return (
    <div className="mb-4">
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Layout</label>
          <select
            value={elementData?.layout || 'horizontal'}
            onChange={(e) => handleDataUpdate({ layout: e.target.value })}
            className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 w-full"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-xs text-gray-400 block">Menu Items</label>
          {items.map((item: any, index: number) => (
            <div key={item.id || index} className="flex gap-2 items-center bg-slate-800 p-2 rounded">
              <Input
                value={item.label || ''}
                onChange={(e) => updateItem(index, 'label', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm flex-1"
                placeholder="Label"
              />
              <Input
                value={item.url || ''}
                onChange={(e) => updateItem(index, 'url', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white text-sm flex-1"
                placeholder="URL"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-400 hover:text-red-300"
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full"
          >
            <i className="fas fa-plus mr-2"></i>Add Item
          </Button>
        </div>
      </div>
    </div>
  );
}
