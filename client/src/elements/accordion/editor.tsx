import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ElementEditorProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

export function AccordionEditor({ element, onUpdate }: ElementEditorProps) {
  const elementData = element.data || {};
  const items = elementData?.items || [];

  const handleDataUpdate = (newData: any) => {
    onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
  };

  const addItem = () => {
    const newItem = { id: generateFieldId(), title: "New Section", content: "Content here..." };
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
        {items.map((item: any, index: number) => (
          <div key={item.id || index} className="bg-slate-800 p-3 rounded space-y-2">
            <div className="flex gap-2">
              <Input
                value={item.title || ''}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                className="bg-slate-700 border-slate-600 text-white"
                placeholder="Section title"
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
            <Input
              value={item.content || ''}
              onChange={(e) => updateItem(index, 'content', e.target.value)}
              className="bg-slate-700 border-slate-600 text-white"
              placeholder="Section content"
            />
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={addItem} className="w-full">
          <i className="fas fa-plus mr-2"></i>Add Section
        </Button>
      </div>
    </div>
  );
}
