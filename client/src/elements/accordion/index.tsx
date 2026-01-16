import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ElementConfig, ElementRendererProps } from "../registry/types";
import { generateFieldId } from "@/lib/card-data";

function AccordionRenderer({ element, isEditing, onUpdate }: ElementRendererProps) {
  const elementData = element.data || {};
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        if (!elementData.allowMultiple) {
          newSet.clear();
        }
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (isEditing) {
    const items = elementData?.items || [];

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

  const items = elementData?.items || [];

  return (
    <div className="mb-4 space-y-2">
      {items.map((item: any) => (
        <Collapsible 
          key={item.id} 
          open={openItems.has(item.id)}
          onOpenChange={() => toggleItem(item.id)}
        >
          <CollapsibleTrigger className="w-full flex items-center justify-between p-3 bg-slate-100 rounded hover:bg-slate-200 transition-colors">
            <span className="font-medium text-slate-800">{item.title}</span>
            <i className={`fas fa-chevron-${openItems.has(item.id) ? 'up' : 'down'} text-slate-500`}></i>
          </CollapsibleTrigger>
          <CollapsibleContent className="p-3 bg-white border border-slate-200 rounded-b">
            <p className="text-slate-600">{item.content}</p>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  );
}

export const accordionConfig: ElementConfig = {
  metadata: {
    type: "accordion",
    title: "Accordion",
    icon: "ChevronDown",
    category: "Interactive",
    description: "Collapsible content sections"
  },
  defaultData: () => ({
    items: [
      { id: generateFieldId(), title: "Section 1", content: "Content for section 1" },
      { id: generateFieldId(), title: "Section 2", content: "Content for section 2" }
    ],
    allowMultiple: false,
    defaultOpen: false
  }),
  Renderer: AccordionRenderer
};

export default accordionConfig;
