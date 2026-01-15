import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Layout, Type, Image, Video, Phone, Share2, Link, FileText, MessageSquare, Map, Bot, Calendar, ShoppingBag, Layers, ChevronDown, ChevronRight, Plus, User } from "lucide-react";
import { generateFieldId } from "@/lib/card-data";
import { PageElement } from "@shared/schema";
import { useUserPlan } from "@/hooks/useUserPlan";
import { Lock } from "lucide-react";

interface ElementType {
  type: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  isPremium?: boolean;
  elementId?: number;
  defaultConfig?: any;
}

// Element type to ID mapping for plan checks
const ELEMENT_TYPE_TO_ID: Record<string, number> = {
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

// Categorized element types for Elementor-style display
const elementCategories = [
  {
    name: "Layout",
    elements: ["profile", "navigationMenu"]
  },
  {
    name: "Basic",
    elements: ["heading", "paragraph", "image", "video", "link"]
  },
  {
    name: "Contact",
    elements: ["contactSection", "socialSection", "actionButtons", "contactForm"]
  },
  {
    name: "Interactive",
    elements: ["accordion", "imageSlider", "testimonials", "googleMaps", "pdfViewer"]
  },
  {
    name: "AI & Voice",
    elements: ["aiChatbot", "ragKnowledge", "voiceAgent", "voiceAssistant"]
  },
  {
    name: "Booking",
    elements: ["bookAppointment", "scheduleCall", "meetingRequest", "availabilityDisplay"]
  },
  {
    name: "Commerce",
    elements: ["shop", "digitalWallet", "qrcode"]
  },
  {
    name: "Advanced",
    elements: ["subscribeForm", "installButton", "arPreviewMindAR", "html"]
  }
];

// Icon mapping for element types
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
    installButton: Plus,
    arPreviewMindAR: Layout,
    html: FileText,
    navigationMenu: Layout,
  };
  return iconMap[type] || Layout;
};

// Title mapping for element types
const getElementTitle = (type: string) => {
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

// Get default configuration for each element type
const getDefaultElementConfig = (type: string, id: string): any => {
  switch (type) {
    case "heading":
      return { 
        text: "New Heading", 
        level: "h2" as const, 
        alignment: "center" as const,
        size: "lg",
        color: "#000000"
      };
    case "paragraph":
      return { 
        text: "Enter your text here...", 
        alignment: "left" as const,
        size: "base",
        color: "#374151"
      };
    case "contactSection":
      return { 
        contacts: [
          { 
            id: generateFieldId(), 
            label: "Phone", 
            value: "+1-234-567-8900", 
            icon: "fas fa-phone", 
            type: "phone" as const 
          },
          { 
            id: generateFieldId(), 
            label: "Email", 
            value: "hello@example.com", 
            icon: "fas fa-envelope", 
            type: "email" as const 
          }
        ],
        layout: "vertical" as const,
        showLabels: true
      };
    case "socialSection":
      return { 
        socials: [
          { 
            id: generateFieldId(), 
            label: "LinkedIn", 
            url: "https://linkedin.com/in/yourprofile", 
            icon: "fab fa-linkedin", 
            platform: "LinkedIn" 
          }
        ],
        layout: "horizontal" as const,
        size: "md",
        showLabels: true
      };
    case "actionButtons":
      return { 
        showSaveContact: true,
        showShare: true,
        showDownload: true,
        layout: "horizontal" as const
      };
    case "link":
      return { 
        text: "Click Here", 
        url: "https://example.com", 
        style: "button" as const,
        variant: "primary" as const,
        size: "md",
        fullWidth: false
      };
    case "image":
      return { 
        src: "", 
        alt: "Image",
        width: "100%",
        height: "auto",
        borderRadius: "md",
        shadow: "none"
      };
    case "video":
      return { 
        url: "", 
        autoplay: false,
        controls: true,
        loop: false,
        muted: true,
        thumbnail: ""
      };
    case "profile":
      return {
        enabled: true,
        showCoverImage: true,
        showProfilePhoto: true,
        showLogo: true,
        showName: true,
        showTitle: true,
        showCompany: true,
        showBio: true,
        fullName: "",
        title: "",
        company: "",
        bio: "",
        brandColor: "#22c55e",
        accentColor: "#16a34a",
        layout: "classic" as const,
        alignment: "center" as const
      };
    case "navigationMenu":
      return {
        items: [
          { id: generateFieldId(), label: "Home", url: "#home", icon: "fas fa-home" },
          { id: generateFieldId(), label: "About", url: "#about", icon: "fas fa-user" },
          { id: generateFieldId(), label: "Contact", url: "#contact", icon: "fas fa-phone" }
        ],
        position: "top" as const,
        layout: "horizontal" as const,
        showIcons: true
      };
    case "accordion":
      return {
        items: [
          { id: generateFieldId(), title: "Section 1", content: "Content for section 1" },
          { id: generateFieldId(), title: "Section 2", content: "Content for section 2" }
        ],
        allowMultiple: false,
        defaultOpen: false
      };
    case "imageSlider":
      return {
        images: [],
        autoplay: true,
        interval: 3000,
        showArrows: true,
        showDots: true,
        height: "300px"
      };
    case "testimonials":
      return {
        testimonials: [],
        layout: "grid" as const,
        columns: 1,
        showAvatars: true,
        showStars: true
      };
    case "googleMaps":
      return {
        location: "New York, NY",
        zoom: 12,
        height: "300px",
        showMarker: true,
        showControls: true
      };
    case "aiChatbot":
      return {
        greeting: "Hello! How can I help you today?",
        placeholder: "Type your message...",
        position: "bottom-right" as const,
        autoOpen: false,
        showAvatar: true
      };
    case "ragKnowledge":
      return {
        knowledgeBaseId: "",
        placeholder: "Ask a question about our services...",
        position: "bottom-right" as const,
        sources: [],
        temperature: 0.7
      };
    case "voiceAgent":
      return {
        phoneNumber: "",
        greeting: "Hello, how can I help you?",
        language: "en" as const,
        voice: "female" as const,
        enabled: true
      };
    case "voiceAssistant":
      return {
        greeting: "Hello! I'm your voice assistant.",
        language: "en" as const,
        position: "bottom-right" as const,
        autoStart: false,
        showInterface: true
      };
    case "bookAppointment":
      return {
        calendarId: "",
        service: "",
        duration: 30,
        timezone: "UTC",
        confirmationMessage: "Your appointment has been booked!",
        showCalendar: true
      };
    case "scheduleCall":
      return {
        calendarId: "",
        duration: 30,
        bufferTime: 5,
        timezone: "UTC",
        confirmationMessage: "Your call has been scheduled!"
      };
    case "meetingRequest":
      return {
        calendarId: "",
        meetingTypes: [],
        defaultDuration: 60,
        timezone: "UTC",
        requireApproval: false
      };
    case "availabilityDisplay":
      return {
        calendarId: "",
        showBookButton: true,
        showTimezone: true,
        daysInAdvance: 30,
        timezone: "UTC",
        layout: "weekly" as const
      };
    case "shop":
      return {
        products: [],
        layout: "grid" as const,
        columns: 2,
        showPrices: true,
        showCart: true,
        currency: "USD"
      };
    case "digitalWallet":
      return {
        wallets: [],
        position: "bottom-right" as const,
        autoShow: false,
        currencies: ["USD"]
      };
    case "qrcode":
      return {
        url: "https://example.com",
        size: 128,
        color: "#000000",
        backgroundColor: "#FFFFFF",
        includeLogo: false,
        logoSize: 30
      };
    case "pdfViewer":
      return {
        fileUrl: "",
        height: "500px",
        showToolbar: true,
        showDownload: true,
        showPrint: true
      };
    case "subscribeForm":
      return {
        placeholder: "Enter your email",
        buttonText: "Subscribe",
        successMessage: "Thank you for subscribing!",
        listId: "",
        doubleOptIn: false,
        layout: "inline" as const
      };
    case "installButton":
      return {
        text: "Install App",
        platform: "both" as const,
        position: "bottom-right" as const,
        showBadge: true,
        delay: 0
      };
    case "arPreviewMindAR":
      return {
        modelUrl: "",
        markerPattern: "",
        camera: "user" as const,
        scale: 1,
        rotation: "0 0 0",
        position: "0 0 0",
        showControls: true
      };
    case "html":
      return {
        code: "<div>Your custom HTML here</div>",
        height: "auto",
        sanitize: true,
        allowScripts: false
      };
    case "contactForm":
      return {
        fields: [
          { id: generateFieldId(), type: "text" as const, label: "Name", required: true, placeholder: "Your name" },
          { id: generateFieldId(), type: "email" as const, label: "Email", required: true, placeholder: "Your email" },
          { id: generateFieldId(), type: "textarea" as const, label: "Message", required: false, placeholder: "Your message" }
        ],
        submitText: "Send Message",
        successMessage: "Thank you for your message!",
        errorMessage: "Something went wrong. Please try again.",
        layout: "vertical" as const,
        showLabels: true
      };
    default:
      return {};
  }
};

// Create default page element
const createDefaultPageElement = (type: string): PageElement => {
  const id = generateFieldId();
  const uniqueOrder = Date.now() + Math.random();
  const data = getDefaultElementConfig(type, id);

  const baseElement: PageElement = {
    id,
    type,
    order: uniqueOrder,
    data
  };

  // Add visible property for specific elements
  if (type === "profile") {
    return { ...baseElement, visible: true };
  }

  return baseElement;
};

interface ElementsPanelProps {
  onAddElement: (element: PageElement) => void;
  onClose?: () => void;
}

export function ElementsPanel({ onAddElement, onClose }: ElementsPanelProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    Layout: true,
    Basic: true,
    Contact: true,
    Interactive: false,
    "AI & Voice": false,
    Booking: false,
    Commerce: false,
    Advanced: false,
  });

  const { data: apiElementTypes } = useQuery<ElementType[]>({
    queryKey: ['/api/element-types'],
    staleTime: 5 * 60 * 1000,
  });

  const { hasElement, isAdmin, isLoading: planLoading, isPlanLoaded } = useUserPlan();

  // Build API element ID map
  const apiElementIdMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (apiElementTypes && apiElementTypes.length > 0) {
      apiElementTypes.forEach(et => {
        if (et.elementId) {
          map[et.type] = et.elementId;
        }
      });
    }
    return map;
  }, [apiElementTypes]);

  const isElementLocked = (elementType: string): boolean => {
    if (planLoading) return true;
    if (!isPlanLoaded) return true;
    if (isAdmin) return false;
    const elementId = apiElementIdMap[elementType] || ELEMENT_TYPE_TO_ID[elementType];
    if (!elementId) return true;
    return !hasElement(elementId);
  };

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const handleAddElement = (type: string) => {
    if (isElementLocked(type)) return;

    const element = createDefaultPageElement(type);
    onAddElement(element);
  };

  // Filter elements based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return elementCategories;

    const query = searchQuery.toLowerCase();
    return elementCategories.map(category => ({
      ...category,
      elements: category.elements.filter(type => 
        getElementTitle(type).toLowerCase().includes(query) ||
        type.toLowerCase().includes(query)
      )
    })).filter(category => category.elements.length > 0);
  }, [searchQuery]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900 text-center mb-3">Elements</h2>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Widget..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Elements Grid - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3">
        {filteredCategories.map((category) => (
          <div key={category.name} className="mb-3">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category.name)}
              className="flex items-center w-full text-left mb-2 text-xs font-semibold text-gray-600 hover:text-gray-900"
            >
              {expandedCategories[category.name] ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              {category.name}
            </button>

            {/* Elements Grid */}
            {expandedCategories[category.name] && (
              <div className="grid grid-cols-2 gap-2">
                {category.elements.map((type) => {
                  const IconComponent = getElementIcon(type);
                  const isLocked = isElementLocked(type);

                  return (
                    <button
                      key={type}
                      onClick={() => handleAddElement(type)}
                      disabled={isLocked}
                      className={`
                        relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all text-center
                        ${isLocked 
                          ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60' 
                          : 'bg-white border-gray-200 hover:border-orange-400 hover:shadow-sm cursor-pointer'
                        }
                      `}
                    >
                      {isLocked && (
                        <div className="absolute top-1 right-1">
                          <Lock className="w-2.5 h-2.5 text-gray-400" />
                        </div>
                      )}
                      <IconComponent className={`w-5 h-5 mb-1.5 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`} />
                      <span className={`text-[10px] font-medium leading-tight ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>
                        {getElementTitle(type)}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}