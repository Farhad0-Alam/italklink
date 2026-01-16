import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, User, Type, Phone, Share2, Layers, Image, Video, FileText, MessageSquare, Layout, Map, Bot, Calendar, ShoppingBag, Link, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface PageElement {
  id: string;
  type: string;
  order: number;
  visible?: boolean;
  data?: any;
}

interface Page {
  id: string;
  key: string;
  path: string;
  label: string;
  visible?: boolean;
  elements?: PageElement[];
}

interface StructurePanelProps {
  elements: PageElement[];
  selectedElementId?: string;
  onSelectElement: (element: PageElement) => void;
  onToggleVisibility?: (elementId: string, visible: boolean) => void;
  onReorderElements?: (newOrder: string[]) => void;
  onClose: () => void;
}

const getElementIcon = (type: string) => {
  const iconMap: Record<string, any> = {
    profile: User,
    heading: Type,
    paragraph: FileText,
    image: Image,
    video: Video,
    link: Link,
    contactSection: Phone,
    socialSection: Share2,
    actionButtons: Layers,
    contactForm: MessageSquare,
    accordion: ChevronDown,
    imageSlider: Image,
    testimonials: MessageSquare,
    googleMaps: Map,
    aiChatbot: Bot,
    ragKnowledge: Bot,
    voiceAgent: Phone,
    voiceAssistant: MessageSquare,
    bookAppointment: Calendar,
    scheduleCall: Phone,
    meetingRequest: Calendar,
    availabilityDisplay: Calendar,
    shop: ShoppingBag,
    digitalWallet: ShoppingBag,
    qrcode: Layout,
    pdfViewer: FileText,
    subscribeForm: MessageSquare,
    installButton: Layout,
    arPreviewMindAR: Layout,
    html: FileText,
    navigationMenu: Layout,
  };
  return iconMap[type] || Layout;
};

const getElementTitle = (type: string, data?: any) => {
  if (type === "profile" && data?.fullName) {
    return `Profile: ${data.fullName}`;
  }
  if (type === "heading" && data?.text) {
    const text = data.text.length > 20 ? data.text.substring(0, 20) + "..." : data.text;
    return `Heading: ${text}`;
  }
  
  const titleMap: Record<string, string> = {
    profile: "Profile Section",
    heading: "Heading",
    paragraph: "Paragraph",
    image: "Image",
    video: "Video",
    link: "3D Button",
    contactSection: "Contact Info",
    socialSection: "Social Media",
    actionButtons: "Save & Share",
    contactForm: "Contact Form",
    accordion: "Accordion",
    imageSlider: "Image Slider",
    testimonials: "Testimonials",
    googleMaps: "Google Maps",
    aiChatbot: "AI Chatbot",
    ragKnowledge: "RAG Knowledge",
    voiceAgent: "Voice Agent",
    voiceAssistant: "Voice Assistant",
    bookAppointment: "Book Appointment",
    scheduleCall: "Schedule Call",
    meetingRequest: "Meeting Request",
    availabilityDisplay: "Availability",
    shop: "Digital Shop",
    digitalWallet: "Digital Wallet",
    qrcode: "QR Code",
    pdfViewer: "PDF Viewer",
    subscribeForm: "Subscribe Form",
    installButton: "Install Button",
    arPreviewMindAR: "AR Preview",
    html: "Custom HTML",
    navigationMenu: "Navigation",
  };
  return titleMap[type] || type;
};

interface SortableElementItemProps {
  element: PageElement;
  isSelected: boolean;
  expandedElements: Record<string, boolean>;
  onSelect: () => void;
  onToggleExpanded: () => void;
  onToggleVisibility?: (elementId: string, visible: boolean) => void;
}

function SortableElementItem({ 
  element, 
  isSelected, 
  expandedElements, 
  onSelect, 
  onToggleExpanded,
  onToggleVisibility 
}: SortableElementItemProps) {
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
  };

  const IconComponent = getElementIcon(element.type);
  const isVisible = element.visible !== false;
  const hasChildren = element.type === "contactSection" && element.data?.contacts?.length > 0;

  return (
    <div ref={setNodeRef} style={style}>
      {/* Element Row */}
      <div
        className={`
          flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group
          ${isSelected ? 'bg-slate-600 border border-pink-500' : 'hover:bg-slate-700'}
          ${!isVisible ? 'opacity-50' : ''}
          ${isDragging ? 'opacity-50 bg-slate-600 shadow-lg' : ''}
        `}
        onClick={onSelect}
      >
        {/* Expand/Collapse for elements with children */}
        <div className="w-4">
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded();
              }}
              className="p-0.5 hover:bg-slate-600 rounded"
            >
              {expandedElements[element.id] ? (
                <ChevronDown className="w-3 h-3 text-slate-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-slate-400" />
              )}
            </button>
          )}
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-slate-600 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3 text-slate-500 hover:text-slate-300" />
        </div>

        {/* Icon */}
        <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-pink-400' : 'text-slate-400'}`} />

        {/* Title */}
        <span className={`flex-1 text-xs font-medium truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
          {getElementTitle(element.type, element.data)}
        </span>

        {/* Visibility Toggle */}
        {onToggleVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(element.id, !isVisible);
            }}
            className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-slate-600 rounded"
          >
            {isVisible ? (
              <Eye className="w-3 h-3 text-slate-400" />
            ) : (
              <EyeOff className="w-3 h-3 text-slate-500" />
            )}
          </button>
        )}
      </div>

      {/* Children (for contact section) */}
      {hasChildren && expandedElements[element.id] && (
        <div className="ml-6 mt-0.5 space-y-0.5">
          {element.data.contacts.map((contact: any, idx: number) => (
            <div
              key={contact.id || idx}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-700 text-xs text-slate-400"
            >
              <span className="w-4" />
              <Phone className="w-3 h-3" />
              <span className="truncate">{contact.label || contact.type}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function StructurePanel({ 
  elements, 
  selectedElementId, 
  onSelectElement, 
  onToggleVisibility, 
  onReorderElements, 
  onClose
}: StructurePanelProps) {
  const [expandedElements, setExpandedElements] = useState<Record<string, boolean>>({});

  const sortedElements = [...elements].sort((a, b) => a.order - b.order);

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

    if (over && active.id !== over.id) {
      const oldIndex = sortedElements.findIndex((el) => el.id === active.id);
      const newIndex = sortedElements.findIndex((el) => el.id === over.id);
      
      const newOrder = arrayMove(sortedElements, oldIndex, newIndex).map((el) => el.id);
      
      if (onReorderElements) {
        onReorderElements(newOrder);
      }
    }
  };

  const toggleExpanded = (elementId: string) => {
    setExpandedElements(prev => ({
      ...prev,
      [elementId]: !prev[elementId]
    }));
  };

  return (
    <div className="h-full flex flex-col bg-slate-800">
      {/* Header */}
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Structure</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-slate-400 hover:text-white hover:bg-slate-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedElements.map(el => el.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-0.5">
              {sortedElements.map((element) => (
                <SortableElementItem
                  key={element.id}
                  element={element}
                  isSelected={selectedElementId === element.id}
                  expandedElements={expandedElements}
                  onSelect={() => onSelectElement(element)}
                  onToggleExpanded={() => toggleExpanded(element.id)}
                  onToggleVisibility={onToggleVisibility}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {sortedElements.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">
            No elements yet. Add elements from the Elements panel.
          </div>
        )}
      </div>
    </div>
  );
}
