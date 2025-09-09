import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { HeaderElement } from "@/lib/header-schema";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DragStackProps {
  elements: HeaderElement[];
  onElementsChange: (elements: HeaderElement[]) => void;
  onElementSelect: (elementId: string | null) => void;
  selectedElementId: string | null;
}

interface SortableElementProps {
  element: HeaderElement;
  isSelected: boolean;
  onToggleVisibility: (id: string, visible: boolean) => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const SortableElement = ({ element, isSelected, onToggleVisibility, onSelect, onDelete }: SortableElementProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getElementIcon = (type: HeaderElement["type"]) => {
    switch (type) {
      case "profile": return "fas fa-user-circle";
      case "logo": return "fas fa-crown";
      case "name": return "fas fa-signature";
      case "title": return "fas fa-briefcase";
      case "company": return "fas fa-building";
      case "header": return "fas fa-heading";
      default: return "fas fa-square";
    }
  };

  const getElementLabel = (type: HeaderElement["type"]) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-colors ${
        isSelected 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-200 bg-white hover:border-gray-300'
      } ${isDragging ? 'shadow-lg' : 'shadow-sm'}`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600"
      >
        <i className="fas fa-grip-vertical" />
      </div>

      {/* Element Icon & Info */}
      <div className="flex items-center gap-2 flex-1" onClick={() => onSelect(element.id)}>
        <i className={`${getElementIcon(element.type)} text-gray-600`} />
        <span className="font-medium text-gray-800">{getElementLabel(element.type)}</span>
        <span className="text-xs text-gray-500">#{element.order}</span>
      </div>

      {/* Visibility Toggle */}
      <Switch
        checked={element.visible}
        onCheckedChange={(checked) => onToggleVisibility(element.id, checked)}
        size="sm"
      />

      {/* Delete Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDelete(element.id)}
        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-8 w-8"
      >
        <i className="fas fa-trash text-xs" />
      </Button>
    </div>
  );
};

export const DragStack = ({ elements, onElementsChange, onElementSelect, selectedElementId }: DragStackProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = elements.findIndex((item) => item.id === active.id);
      const newIndex = elements.findIndex((item) => item.id === over.id);
      
      const newElements = arrayMove(elements, oldIndex, newIndex).map((el, index) => ({
        ...el,
        order: index
      }));
      
      onElementsChange(newElements);
    }
  };

  const handleToggleVisibility = (id: string, visible: boolean) => {
    const newElements = elements.map(el => 
      el.id === id ? { ...el, visible } : el
    );
    onElementsChange(newElements);
  };

  const handleDelete = (id: string) => {
    const newElements = elements.filter(el => el.id !== id);
    onElementsChange(newElements);
    if (selectedElementId === id) {
      onElementSelect(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Header Elements</Label>
        <span className="text-xs text-gray-500">{elements.length} items</span>
      </div>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={elements.map(el => el.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {elements.map((element) => (
              <SortableElement
                key={element.id}
                element={element}
                isSelected={selectedElementId === element.id}
                onToggleVisibility={handleToggleVisibility}
                onSelect={onElementSelect}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {elements.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-layer-group text-2xl mb-2 opacity-50" />
          <p className="text-sm">No elements added yet</p>
        </div>
      )}
    </div>
  );
};