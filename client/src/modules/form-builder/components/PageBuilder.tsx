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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PageElement } from '@shared/schema';
import { PageElementRenderer } from '@/components/page-element';
import { ElementSelector } from '@/components/element-selector';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface SortableElementProps {
  element: PageElement;
  onUpdate: (element: PageElement) => void;
  onDelete: (elementId: string) => void;
  onClone: (elementId: string) => void;
  onToggleVisibility: (elementId: string) => void;
  cardData?: any;
}

function SortableElement({ element, onUpdate, onDelete, onClone, onToggleVisibility, cardData }: SortableElementProps) {
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone(element.id);
              }}
              className="ml-2 px-2 py-1 text-xs text-slate-600 hover:text-talklink-600 hover:bg-slate-200 rounded transition-colors"
              title="Clone element"
              data-testid={`btn-clone-${element.type}-${element.id}`}
            >
              <i className="fas fa-clone"></i>
            </button>
            <Switch
              checked={element.visible !== false}
              onCheckedChange={(e) => {
                e.stopPropagation?.();
                onToggleVisibility(element.id);
              }}
              className="ml-2"
              title={element.visible !== false ? "Hide element" : "Show element"}
              data-testid={`switch-visibility-${element.type}-${element.id}`}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(element.id);
              }}
              className="ml-2 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete element"
              data-testid={`btn-delete-${element.type}-${element.id}`}
            >
              <i className="fas fa-trash"></i>
            </button>
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
  elementSpacing?: number;
  onElementSpacingChange?: (spacing: number) => void;
  individualElementSpacing?: Record<string, number>;
  onIndividualSpacingChange?: (elementType: string, spacing: number) => void;
  cardData?: any; // Business card data for theme colors
  onNavigatePage?: (pageId: string) => void;
}

export function PageBuilder({ elements, onElementsChange, elementSpacing = 16, onElementSpacingChange, individualElementSpacing, onIndividualSpacingChange, cardData, onNavigatePage }: PageBuilderProps) {
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
    console.log('[PageBuilder] Adding element:', element.type, 'with order:', element.order);
    console.log('[PageBuilder] Current elements count:', elements.length);
    const newElements = [...elements, element];
    console.log('[PageBuilder] New elements count after adding:', newElements.length);
    console.log('[PageBuilder] All element orders:', newElements.map(e => ({ type: e.type, order: e.order })));
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

  const handleCloneElement = (elementId: string) => {
    const elementToClone = elements.find(el => el.id === elementId);
    if (!elementToClone) return;

    // Sort elements by order to get the correct position
    const sortedElements = [...elements].sort((a, b) => a.order - b.order);
    
    // Find the index of the original element in the sorted array
    const originalIndex = sortedElements.findIndex(el => el.id === elementId);
    if (originalIndex === -1) return;

    // Deep clone the element to avoid shared references
    const clonedElement: PageElement = {
      ...structuredClone(elementToClone),
      id: `${elementToClone.type}-${crypto.randomUUID()}`,
      order: 0, // Will be reindexed below
    };

    // Insert the cloned element right after the original
    sortedElements.splice(originalIndex + 1, 0, clonedElement);
    
    // Recompute order indices to keep sorting stable
    const updatedElements = sortedElements.map((el, index) => ({
      ...el,
      order: index
    }));
    
    onElementsChange(updatedElements);
  };

  const handleToggleVisibility = (elementId: string) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, visible: el.visible !== false ? false : true } : el
    );
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

      {/* Individual Element Spacing Controls */}
      {onIndividualSpacingChange && sortedElements.length > 0 && (
        <Accordion type="single" collapsible className="bg-slate-50 border border-slate-200 rounded-lg">
          <AccordionItem value="individual-spacing" className="border-none">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-slate-100">
              <div className="flex items-center gap-2">
                <i className="fas fa-sliders-h text-slate-600"></i>
                <span className="text-sm font-medium text-slate-700">Individual Element Spacing</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="space-y-4">
                <p className="text-xs text-slate-500 mb-3">
                  Control spacing between consecutive elements of the same type
                </p>
                {(() => {
                  // Get unique element types present in the current page
                  const uniqueTypes = [...new Set(sortedElements.map(el => el.type))];
                  const typeLabels: Record<string, string> = {
                    'link': 'Buttons/Links',
                    'heading': 'Headings',
                    'paragraph': 'Paragraphs',
                    'socialSection': 'Social Links',
                    'contactSection': 'Contact Sections',
                    'accordion': 'Accordions',
                    'subscribeSection': 'Subscribe Sections',
                    'image': 'Images',
                    'video': 'Videos',
                    'divider': 'Dividers',
                    'spacer': 'Spacers',
                    'cta': 'Call to Actions',
                    'form': 'Forms',
                    'gallery': 'Galleries',
                    'testimonial': 'Testimonials',
                    'pricing': 'Pricing Tables',
                    'faq': 'FAQs',
                    'countdown': 'Countdowns',
                    'map': 'Maps',
                    'newsletter': 'Newsletters',
                    'team': 'Team Members',
                    'timeline': 'Timelines',
                    'progress': 'Progress Bars',
                    'stats': 'Statistics',
                    'iframe': 'Embeds',
                    'audio': 'Audio Players',
                  };

                  return uniqueTypes.map(type => {
                    const currentSpacing = individualElementSpacing?.[type] ?? elementSpacing;
                    const label = typeLabels[type] || type;
                    const count = sortedElements.filter(el => el.type === type).length;

                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs font-medium text-slate-600">
                            {label} ({count})
                          </Label>
                          <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                            {currentSpacing}px
                          </span>
                        </div>
                        <Slider
                          min={0}
                          max={48}
                          step={1}
                          value={[currentSpacing]}
                          onValueChange={(value) => onIndividualSpacingChange(type, value[0])}
                          className="cursor-pointer"
                        />
                      </div>
                    );
                  });
                })()}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

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
                  onClone={handleCloneElement}
                  onToggleVisibility={handleToggleVisibility}
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