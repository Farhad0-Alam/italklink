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
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { PageElement } from '@shared/schema';
import { PageElementRenderer } from '@/elements/PageElementRenderer';
import { ElementSelector } from '@/components/element-selector';
import { LockedFeature } from '@/components/LockedFeature';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useUserPlan } from '@/hooks/useUserPlan';
import { useQuery } from '@tanstack/react-query';

interface ElementTypeFromAPI {
  type: string;
  elementId?: number;
}

// Fallback element type to ID mapping (matches database page_element_types)
const FALLBACK_ELEMENT_TYPE_TO_ID: Record<string, number> = {
  heading: 1,
  paragraph: 2,
  contactSection: 3,
  socialSection: 4,
  actionButtons: 5,
  link: 6,
  image: 7,
  qrcode: 8,
  video: 9,
  contactForm: 10,
  accordion: 11,
  imageSlider: 12,
  testimonials: 13,
  googleMaps: 14,
  aiChatbot: 15,
  ragKnowledge: 16,
  voiceAgent: 17,
  voiceAssistant: 18,
  digitalWallet: 19,
  navigationMenu: 20,
  arPreviewMindAR: 21,
  pdfViewer: 22,
  html: 23,
  subscribeForm: 24,
  installButton: 25,
  profile: 26,
  bookAppointment: 27,
  scheduleCall: 28,
  meetingRequest: 29,
  availabilityDisplay: 30,
  shop: 31,
};

interface SortableElementProps {
  element: PageElement;
  onUpdate: (element: PageElement) => void;
  onDelete: (elementId: string) => void;
  onClone: (elementId: string) => void;
  onToggleVisibility: (elementId: string) => void;
  cardData?: any;
  isElementLocked: (elementType: string) => boolean;
  getElementTitle: (element: PageElement) => string;
  onSave?: (dataOverride?: any) => Promise<void>;
}

function SortableElement({ element, onUpdate, onDelete, onClone, onToggleVisibility, cardData, isElementLocked, getElementTitle, onSave }: SortableElementProps) {
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

  // Check if this element is locked based on user's plan
  const isLocked = isElementLocked(element.type);
  const elementTitle = getElementTitle(element);

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
        <LockedFeature featureName={elementTitle} showOverlay={isLocked}>
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
                    {elementTitle}
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
                  onSave={onSave}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        </LockedFeature>
      </div>
    </div>
  );
}

interface PageBuilderProps {
  elements: PageElement[];
  onElementsChange: (elements: PageElement[]) => void;
  elementSpacing?: number;
  onElementSpacingChange?: (spacing: number) => void;
  cardData?: any; // Business card data for theme colors
  onNavigatePage?: (pageId: string) => void;
  onSave?: (dataOverride?: any) => Promise<void>;
}

export function PageBuilder({ elements, onElementsChange, elementSpacing = 16, onElementSpacingChange, cardData, onNavigatePage, onSave }: PageBuilderProps) {
  const [showElementSelector, setShowElementSelector] = useState(false);

  // Build updated cardData with new elements for immediate save
  const buildUpdatedCardData = (newElements: PageElement[]) => {
    if (!cardData) {
      console.log('[PageBuilder] WARNING: cardData is null/undefined, cannot save');
      return null;
    }

    // Update pageElements array
    let updatedPageElements = newElements;

    // Also update the home page in pages array if it exists
    let updatedPages = cardData.pages;
    if (Array.isArray(cardData.pages)) {
      updatedPages = cardData.pages.map((page: any) => {
        if (page.key === 'home' || page.id === 'home') {
          return { ...page, elements: newElements };
        }
        return page;
      });
    }

    return {
      ...cardData,
      pageElements: updatedPageElements,
      pages: updatedPages,
    };
  };

  // Trigger save with updated elements
  const saveWithElements = async (newElements: PageElement[]) => {
    if (onSave) {
      const updatedCard = buildUpdatedCardData(newElements);
      if (updatedCard) {
        try {
          await onSave(updatedCard);
        } catch (error) {
          console.error('[PageBuilder] Save failed:', error);
        }
      }
    }
  };

  // Fetch element types from API for accurate ID mapping
  const { data: apiElementTypes } = useQuery<ElementTypeFromAPI[]>({
    queryKey: ['/api/element-types'],
    staleTime: 5 * 60 * 1000,
  });

  // Get user plan for element access control
  const { hasElement, isAdmin, isLoading: planLoading, isPlanLoaded } = useUserPlan();

  // Build element type to ID map from API (with fallback)
  const elementIdMap = useMemo(() => {
    const map: Record<string, number> = { ...FALLBACK_ELEMENT_TYPE_TO_ID };
    if (apiElementTypes && apiElementTypes.length > 0) {
      apiElementTypes.forEach(et => {
        if (et.elementId) {
          map[et.type] = et.elementId;
        }
      });
    }
    return map;
  }, [apiElementTypes]);

  // Check if an element type is locked based on user's plan
  const isElementLocked = (elementType: string): boolean => {
    if (planLoading) return true;
    if (!isPlanLoaded) return true;
    if (isAdmin) return false;
    const elementId = elementIdMap[elementType];
    if (!elementId) return true; // Lock elements without ID mapping
    return !hasElement(elementId);
  };

  // Get element title for display
  const getElementTitle = (element: PageElement): string => {
    switch (element.type) {
      case "profile": return "Profile Section";
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
      saveWithElements(updatedElements); // Trigger immediate save after reorder
    }
  }

  const handleAddElement = (element: PageElement) => {
    const newElements = [...elements, element];
    onElementsChange(newElements);
    saveWithElements(newElements); // Trigger immediate save
  };

  const handleUpdateElement = (updatedElement: PageElement) => {
    const newElements = elements.map(el => 
      el.id === updatedElement.id ? updatedElement : el
    );
    onElementsChange(newElements);
    // Save is handled by individual element editors
  };

  const handleDeleteElement = (elementId: string) => {
    const newElements = elements.filter(el => el.id !== elementId);
    onElementsChange(newElements);
    saveWithElements(newElements); // Trigger immediate save
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
    saveWithElements(updatedElements); // Trigger immediate save
  };

  const handleToggleVisibility = (elementId: string) => {
    const newElements = elements.map(el => 
      el.id === elementId ? { ...el, visible: el.visible !== false ? false : true } : el
    );
    onElementsChange(newElements);
    saveWithElements(newElements); // Trigger immediate save
  };

  return (
    <div className="space-y-4">
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
                  isElementLocked={isElementLocked}
                  getElementTitle={getElementTitle}
                  onSave={onSave}
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