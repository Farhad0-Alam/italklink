import { useState } from "react";
import { ChevronDown, ChevronRight, Eye, EyeOff, GripVertical, User, Type, Phone, Share2, Layers, Image, Video, FileText, MessageSquare, Layout, Map, Bot, Calendar, ShoppingBag, Link, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageElement {
  id: string;
  type: string;
  order: number;
  visible?: boolean;
  data?: any;
}

interface StructurePanelProps {
  elements: PageElement[];
  selectedElementId?: string;
  onSelectElement: (element: PageElement) => void;
  onToggleVisibility?: (elementId: string, visible: boolean) => void;
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

export function StructurePanel({ elements, selectedElementId, onSelectElement, onToggleVisibility, onClose }: StructurePanelProps) {
  const [expandedElements, setExpandedElements] = useState<Record<string, boolean>>({});

  const sortedElements = [...elements].sort((a, b) => a.order - b.order);

  const toggleExpanded = (elementId: string) => {
    setExpandedElements(prev => ({
      ...prev,
      [elementId]: !prev[elementId]
    }));
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between">
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

      {/* Elements Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {sortedElements.map((element) => {
            const IconComponent = getElementIcon(element.type);
            const isSelected = selectedElementId === element.id;
            const isVisible = element.visible !== false;
            const hasChildren = element.type === "contactSection" && element.data?.contacts?.length > 0;

            return (
              <div key={element.id}>
                {/* Element Row */}
                <div
                  className={`
                    flex items-center gap-1 px-2 py-1.5 rounded cursor-pointer group
                    ${isSelected ? 'bg-orange-100 border border-orange-300' : 'hover:bg-gray-100'}
                    ${!isVisible ? 'opacity-50' : ''}
                  `}
                  onClick={() => onSelectElement(element)}
                >
                  {/* Expand/Collapse for elements with children */}
                  <div className="w-4">
                    {hasChildren && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(element.id);
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
                  <GripVertical className="w-3 h-3 text-gray-300 opacity-0 group-hover:opacity-100" />

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
          })}
        </div>

        {sortedElements.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-xs">
            No elements yet. Add elements from the sidebar.
          </div>
        )}
      </div>
    </div>
  );
}
