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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { PageElement } from '@shared/schema';
import { PageElementRenderer } from './page-element';
import { ElementSelector } from './element-selector';

interface SortableElementProps {
  element: PageElement;
  onUpdate: (element: PageElement) => void;
  onDelete: (elementId: string) => void;
  cardData?: any;
}

function SortableElement({ element, onUpdate, onDelete, cardData }: SortableElementProps) {
  const [isExpanded, setIsExpanded] = useState(false);
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

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getElementTitle = () => {
    switch (element.type) {
      case "heading": return element.data.text || "Heading";
      case "paragraph": return "Paragraph";
      case "link": return element.data.text || "Link";
      case "image": return "Image";
      case "qrcode": return "QR Code";
      case "contactSection": return "Contact Section";
      case "socialSection": return "Social Section";
      case "video": return "Video";
      case "contactForm": return element.data.title || "Contact Form";
      case "accordion": return "Accordion";
      case "testimonials": return element.data.title || "Testimonials";
      case "googleMaps": return element.data.title || "Google Maps";
      case "aiChatbot": return element.data.title || "AI Chatbot";
      default: return "Page Element";
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <Collapsible open={isExpanded}>
          <div className="flex items-center p-3 bg-slate-100 border-b border-slate-200">
            <div
              {...attributes}
              {...listeners}
              className="flex-shrink-0 w-6 h-6 bg-slate-300 rounded cursor-grab active:cursor-grabbing flex items-center justify-center mr-3"
            >
              <i className="fas fa-grip-vertical text-xs text-slate-600"></i>
            </div>
            <CollapsibleTrigger 
              onClick={toggleExpanded}
              className="flex-1 flex items-center justify-between text-left hover:bg-slate-200 rounded px-2 py-1 transition-colors"
              data-testid={`toggle-editor-${element.type}-${element.id}`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-700">
                  {getElementTitle()}
                </span>
                <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                  {element.type}
                </span>
              </div>
              <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs text-slate-500`}></i>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent>
            <div className="p-3">
              <PageElementRenderer
                element={element}
                isEditing={true}
                onUpdate={onUpdate}
                onDelete={onDelete}
                cardData={cardData}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

interface PageBuilderProps {
  elements: PageElement[];
  onElementsChange: (elements: PageElement[]) => void;
  cardData?: any; // Business card data for theme colors
}

export function PageBuilder({ elements, onElementsChange, cardData }: PageBuilderProps) {
  const [showElementSelector, setShowElementSelector] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Sort elements by order
  const sortedElements = [...elements].sort((a, b) => a.order - b.order);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = sortedElements.findIndex(el => el.id === active.id);
      const newIndex = sortedElements.findIndex(el => el.id === over?.id);
      
      const newElements = arrayMove(sortedElements, oldIndex, newIndex);
      
      // Update order values
      const updatedElements = newElements.map((el, index) => ({
        ...el,
        order: index
      }));
      
      onElementsChange(updatedElements);
    }
  }

  const handleAddElement = (element: PageElement) => {
    const newElements = [...elements, element];
    onElementsChange(newElements);
  };

  const handleUpdateElement = (updatedElement: PageElement) => {
    const newElements = elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    onElementsChange(newElements);
  };

  const handleDeleteElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    onElementsChange(newElements);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-talklink-400">Page Elements</h3>
        <Button
          onClick={() => setShowElementSelector(true)}
          className="bg-talklink-500 hover:bg-talklink-600 text-white"
          size="sm"
        >
          <i className="fas fa-plus mr-2"></i>
          Add Element
        </Button>
      </div>

      {sortedElements.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <i className="fas fa-plus-circle text-4xl mb-4"></i>
          <p>No elements added yet. Click "Add Element" to get started.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedElements.map(el => el.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sortedElements.map((element) => (
                <SortableElement
                  key={element.id}
                  element={element}
                  onUpdate={handleUpdateElement}
                  onDelete={handleDeleteElement}
                  cardData={cardData}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ElementSelector
        open={showElementSelector}
        onOpenChange={setShowElementSelector}
        onAddElement={handleAddElement}
      />
    </div>
  );
}