import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ElementRendererProps } from "../registry/types";

export function AccordionRenderer({ element }: ElementRendererProps) {
  const elementData = element.data || {};
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const items = elementData?.items || [];

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
