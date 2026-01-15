import React from 'react';
import { PageElementRenderer } from './page-element';
import { ArrowLeft, GripVertical } from 'lucide-react';
import type { PageElement, BusinessCard } from '@shared/schema';
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

interface PagePreviewProps {
  pageData: {
    id: string;
    label: string;
    elements: PageElement[];
  };
  cardData: BusinessCard;
  elementSpacing?: number;
  individualElementSpacing?: Record<string, number>;
  onNavigatePage?: (pageId: string) => void;
  onBackToCard?: () => void;
  hideBackButton?: boolean;
  isEditing?: boolean;
  onReorderElements?: (newOrder: string[]) => void;
  onSelectElement?: (element: PageElement) => void;
  selectedElementId?: string;
  fullFrame?: boolean;
  ultraCompact?: boolean;
}

interface SortableElementWrapperProps {
  element: PageElement;
  spacing: number;
  cardData: BusinessCard;
  onNavigatePage?: (pageId: string) => void;
  isEditing?: boolean;
  onSelect?: () => void;
  isSelected?: boolean;
}

function SortableElementWrapper({ 
  element, 
  spacing, 
  cardData, 
  onNavigatePage,
  isEditing = false,
  onSelect,
  isSelected = false
}: SortableElementWrapperProps) {
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
    marginBottom: `${spacing}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isDragging ? 'opacity-50 z-50' : ''} ${isSelected ? 'ring-2 ring-orange-500 ring-offset-1 rounded' : ''}`}
      onClick={(e) => {
        if (isEditing && onSelect) {
          e.stopPropagation();
          onSelect();
        }
      }}
    >
      {/* Drag Handle - Only show in editing mode */}
      {isEditing && (
        <div
          {...attributes}
          {...listeners}
          className="absolute -left-6 top-1/2 -translate-y-1/2 p-1 bg-gray-100 hover:bg-gray-200 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4 text-gray-500" />
        </div>
      )}
      
      <PageElementRenderer
        element={element}
        isEditing={false}
        onUpdate={() => {}}
        onDelete={() => {}}
        cardData={cardData}
        onNavigatePage={onNavigatePage}
      />
    </div>
  );
}

export function PagePreview({ 
  pageData, 
  cardData, 
  elementSpacing = 16, 
  individualElementSpacing, 
  onNavigatePage, 
  onBackToCard, 
  hideBackButton = false,
  isEditing = false,
  onReorderElements,
  onSelectElement,
  selectedElementId,
  fullFrame,
  ultraCompact
}: PagePreviewProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorderElements) {
      const sortedElements = visibleElements.sort((a, b) => a.order - b.order);
      const oldIndex = sortedElements.findIndex((el) => el.id === active.id);
      const newIndex = sortedElements.findIndex((el) => el.id === over.id);
      
      const newOrder = arrayMove(sortedElements, oldIndex, newIndex).map((el) => el.id);
      onReorderElements(newOrder);
    }
  };

  // Get background settings from cardData
  const backgroundType = cardData?.backgroundType || "color";
  const backgroundColor = cardData?.backgroundColor || "#f0f0f0";
  const backgroundImage = cardData?.backgroundImage;
  const backgroundGradient = cardData?.backgroundGradient;
  
  // Build background style based on type
  const getBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
    };
    
    if (backgroundType === "color") {
      return { ...baseStyle, backgroundColor };
    } else if (backgroundType === "gradient" && backgroundGradient) {
      const { type, angle, colors } = backgroundGradient;
      const gradientColors = colors
        .sort((a: any, b: any) => a.position - b.position)
        .map((c: any) => `${c.color} ${c.position}%`)
        .join(', ');
      
      if (type === "linear") {
        return { 
          ...baseStyle, 
          background: `linear-gradient(${angle}deg, ${gradientColors})` 
        };
      } else if (type === "radial") {
        return { 
          ...baseStyle, 
          background: `radial-gradient(circle, ${gradientColors})` 
        };
      }
    } else if (backgroundType === "image" && backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    } else if (backgroundType?.startsWith("animation-")) {
      return { ...baseStyle, backgroundColor };
    }
    
    return { ...baseStyle, backgroundColor };
  };
  
  const backgroundStyle = getBackgroundStyle();
  const backgroundAnimationClass = backgroundType?.startsWith("animation-") 
    ? `bg-${backgroundType}` 
    : '';
  
  // Filter out invisible elements
  const visibleElements = (pageData.elements || []).filter(el => el.visible !== false);
  
  if (!visibleElements || visibleElements.length === 0) {
    return (
      <div 
        className={`h-full flex flex-col ${backgroundAnimationClass}`} 
        style={backgroundStyle}
      >
        {onBackToCard && !hideBackButton && (
          <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 z-10">
            <button
              onClick={onBackToCard}
              className="flex items-center text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
              data-testid="button-back-to-card"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to my page
            </button>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="fas fa-plus text-gray-400 text-xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{pageData.label}</h3>
            <p className="text-gray-500 text-sm mb-4">This page is empty</p>
            <p className="text-gray-400 text-xs">Add elements to design this page</p>
          </div>
        </div>
      </div>
    );
  }

  // Sort elements by order
  const sortedElements = [...visibleElements].sort((a, b) => a.order - b.order);

  // Calculate spacing for each element
  const getElementSpacing = (element: PageElement, index: number): number => {
    if (index >= sortedElements.length - 1) return 0;
    
    const nextElement = sortedElements[index + 1];
    if (nextElement.type === element.type) {
      return individualElementSpacing?.[element.type] ?? elementSpacing;
    }
    return elementSpacing;
  };

  return (
    <div 
      className={`h-full flex flex-col ${backgroundAnimationClass}`} 
      style={backgroundStyle}
    >
      {onBackToCard && !hideBackButton && (
        <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-3 z-10">
          <button
            onClick={onBackToCard}
            className="flex items-center text-gray-700 hover:text-gray-900 font-medium text-sm transition-colors"
            data-testid="button-back-to-card"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to my page
          </button>
        </div>
      )}
      <div className={`flex-1 overflow-y-auto relative ${isEditing ? 'pl-8' : ''}`}>
        <div className="min-h-full relative">
          {isEditing && onReorderElements ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedElements.map(el => el.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedElements.map((element, index) => (
                  <SortableElementWrapper
                    key={element.id}
                    element={element}
                    spacing={getElementSpacing(element, index)}
                    cardData={cardData}
                    onNavigatePage={onNavigatePage}
                    isEditing={isEditing}
                    onSelect={() => onSelectElement?.(element)}
                    isSelected={selectedElementId === element.id}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            sortedElements.map((element, index) => (
              <div key={element.id} style={{ marginBottom: `${getElementSpacing(element, index)}px` }}>
                <PageElementRenderer
                  element={element}
                  isEditing={false}
                  onUpdate={() => {}}
                  onDelete={() => {}}
                  cardData={cardData}
                  onNavigatePage={onNavigatePage}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
