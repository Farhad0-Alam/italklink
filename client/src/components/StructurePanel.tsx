import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, User, Type, Phone, Share2, Layers, Image, Video, FileText, MessageSquare, Layout, Map, Bot, Calendar, ShoppingBag, Link, X, Plus, Trash2, Copy, FileText as PageIcon } from "lucide-react";
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
  pages?: Page[];
  selectedPageId?: string;
  onSelectPage?: (pageId: string) => void;
  onAddPage?: () => void;
  onDeletePage?: (pageId: string) => void;
  onRenamePage?: (pageId: string, newLabel: string) => void;
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
          ${isSelected ? 'bg-orange-100 border border-orange-300' : 'hover:bg-gray-100'}
          ${!isVisible ? 'opacity-50' : ''}
          ${isDragging ? 'opacity-50 bg-orange-50 shadow-lg' : ''}
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
              className="p-0.5 hover:bg-gray-200 rounded"
            >
              {expandedElements[element.id] ? (
                <ChevronDown className="w-3 h-3 text-gray-500" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 hover:bg-gray-200 rounded"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-3 h-3 text-gray-400 hover:text-gray-600" />
        </div>

        {/* Icon */}
        <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`} />

        {/* Title */}
        <span className={`flex-1 text-xs font-medium truncate ${isSelected ? 'text-orange-700' : 'text-gray-700'}`}>
          {getElementTitle(element.type, element.data)}
        </span>

        {/* Visibility Toggle */}
        {onToggleVisibility && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(element.id, !isVisible);
            }}
            className="p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 rounded"
          >
            {isVisible ? (
              <Eye className="w-3 h-3 text-gray-500" />
            ) : (
              <EyeOff className="w-3 h-3 text-gray-400" />
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
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-50 text-xs text-gray-500"
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
  onClose,
  pages = [],
  selectedPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
  onRenamePage
}: StructurePanelProps) {
  const [expandedElements, setExpandedElements] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"elements" | "pages">("elements");
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

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

  const customPages = pages.filter(p => p.key !== "home");

  const handleStartEdit = (page: Page) => {
    setEditingPageId(page.id);
    setEditingLabel(page.label);
  };

  const handleSaveEdit = () => {
    if (editingPageId && onRenamePage) {
      onRenamePage(editingPageId, editingLabel);
    }
    setEditingPageId(null);
    setEditingLabel("");
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-gray-900">Structure</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => setViewMode("elements")}
            className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-colors ${
              viewMode === "elements" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Elements
          </button>
          <button
            onClick={() => setViewMode("pages")}
            className={`flex-1 text-xs py-1.5 px-3 rounded-md transition-colors ${
              viewMode === "pages" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pages
          </button>
        </div>
      </div>

      {/* Elements View */}
      {viewMode === "elements" && (
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
              No elements yet. Add elements from the sidebar.
            </div>
          )}
        </div>
      )}

      {/* Pages View */}
      {viewMode === "pages" && (
        <div className="flex-1 overflow-y-auto p-2">
          {/* Add Page Button */}
          {onAddPage && (
            <Button
              onClick={onAddPage}
              size="sm"
              className="w-full mb-3 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Page
            </Button>
          )}

          {/* Pages List */}
          <div className="space-y-1">
            {customPages.map((page) => (
              <div
                key={page.id}
                className={`flex items-center justify-between p-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedPageId === page.id
                    ? "bg-blue-50 border-blue-300"
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
                onClick={() => onSelectPage?.(page.id)}
              >
                <div className="flex items-center flex-1 min-w-0">
                  <PageIcon className="w-4 h-4 text-gray-500 mr-2 flex-shrink-0" />
                  {editingPageId === page.id ? (
                    <input
                      type="text"
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                      className="flex-1 text-sm bg-white border border-gray-300 rounded px-2 py-0.5"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span 
                      className="text-sm text-gray-900 truncate"
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(page);
                      }}
                    >
                      {page.label}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-1 ml-2">
                  {onDeletePage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePage(page.id);
                      }}
                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {customPages.length === 0 && (
            <div className="text-center py-8 text-gray-500 text-xs">
              No custom pages yet. Click "Add New Page" to create one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
