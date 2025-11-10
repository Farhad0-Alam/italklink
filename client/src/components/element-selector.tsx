import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PageElement } from "@shared/schema";
import { generateFieldId } from "@/lib/card-data";

interface ElementSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddElement: (element: PageElement) => void;
}

export function ElementSelector({ open, onOpenChange, onAddElement }: ElementSelectorProps) {
  const elementTypes = [
    {
      type: "heading",
      title: "Heading",
      icon: "fas fa-heading",
      color: "bg-blue-100",
      description: "Add a title or heading"
    },
    {
      type: "paragraph",
      title: "Paragraph",
      icon: "fas fa-align-left",
      color: "bg-orange-100",
      description: "Add text content"
    },
    {
      type: "addToContacts",
      title: "Add to Contacts",
      icon: "fas fa-address-book",
      color: "bg-emerald-100",
      description: "Save contact button"
    },
    {
      type: "shareButton",
      title: "Share Button",
      icon: "fas fa-share-alt",
      color: "bg-sky-100",
      description: "Share card button"
    },
    {
      type: "contactSection",
      title: "Contact Information",
      icon: "fas fa-address-card",
      color: "bg-blue-50",
      description: "Contact details section"
    },
    {
      type: "socialSection",
      title: "Social Media",
      icon: "fas fa-share-nodes",
      color: "bg-pink-50",
      description: "Social media links"
    },
    {
      type: "link",
      title: "Link",
      icon: "fas fa-link",
      color: "bg-purple-100",
      description: "Add a clickable link"
    },
    {
      type: "image",
      title: "Image",
      icon: "fas fa-image",
      color: "bg-green-100",
      description: "Upload an image"
    },
    {
      type: "qrcode",
      title: "QR Code",
      icon: "fas fa-qrcode",
      color: "bg-gradient-to-br from-indigo-500 to-purple-600",
      description: "Premium QR code generator"
    },
    {
      type: "video",
      title: "Video",
      icon: "fas fa-video",
      color: "bg-indigo-100",
      description: "Embed video"
    },
    {
      type: "contactForm",
      title: "Contact Form",
      icon: "fas fa-wpforms",
      color: "bg-teal-100",
      description: "Add contact form"
    },
    {
      type: "accordion",
      title: "Accordion",
      icon: "fas fa-list",
      color: "bg-yellow-100",
      description: "Collapsible content"
    },
    {
      type: "imageSlider",
      title: "Image Slider",
      icon: "fas fa-images",
      color: "bg-pink-100",
      description: "Image carousel"
    },
    {
      type: "testimonials",
      title: "Testimonials",
      icon: "fas fa-quote-right",
      color: "bg-emerald-100",
      description: "Customer reviews"
    },
    {
      type: "googleMaps",
      title: "Google Maps",
      icon: "fas fa-map-marker-alt",
      color: "bg-cyan-100",
      description: "Embedded map location"
    },
    {
      type: "aiChatbot",
      title: "AI Chatbot",
      icon: "fas fa-robot",
      color: "bg-violet-100",
      description: "Knowledge base assistant"
    },
    {
      type: "ragKnowledge",
      title: "RAG Knowledge",
      icon: "fas fa-brain",
      color: "bg-indigo-100",
      description: "Advanced URL knowledge ingestion with vector search"
    },
    {
      type: "digitalWallet",
      title: "Digital Wallet",
      icon: "fas fa-wallet",
      color: "bg-gradient-to-r from-black to-blue-600",
      description: "Save to Apple & Google Wallet"
    },
    {
      type: "navigationMenu",
      title: "Navigation Menu",
      icon: "fas fa-bars",
      color: "bg-gradient-to-r from-slate-500 to-slate-700",
      description: "Multi-page navigation menu"
    },
    {
      type: "arPreviewMindAR",
      title: "AR Preview",
      icon: "fas fa-cube",
      color: "bg-gradient-to-r from-purple-500 to-pink-600",
      description: "AR Digital Business Card Viewer"
    },
    {
      type: "pdfViewer",
      title: "PDF Viewer",
      icon: "fas fa-file-pdf",
      color: "bg-purple-100",
      description: "Display PDF with modal viewer and clickable links"
    },
    {
      type: "html",
      title: "Custom HTML",
      icon: "fas fa-code",
      color: "bg-gradient-to-r from-gray-600 to-gray-800",
      description: "Add custom HTML design"
    },
    // Appointment booking elements
    {
      type: "bookAppointment",
      title: "Book Appointment",
      icon: "fas fa-calendar-alt",
      color: "bg-gradient-to-r from-blue-500 to-teal-600",
      description: "Appointment booking button"
    },
    {
      type: "scheduleCall",
      title: "Schedule Call",
      icon: "fas fa-phone",
      color: "bg-gradient-to-r from-green-500 to-blue-600",
      description: "Schedule a phone/video call"
    },
    {
      type: "meetingRequest",
      title: "Meeting Request",
      icon: "fas fa-handshake",
      color: "bg-gradient-to-r from-purple-500 to-indigo-600",
      description: "Request a meeting button"
    },
    {
      type: "availabilityDisplay",
      title: "Availability Display",
      icon: "fas fa-clock",
      color: "bg-gradient-to-r from-amber-500 to-orange-600",
      description: "Show your availability schedule"
    },
    {
      type: "subscribeForm",
      title: "Subscribe to Updates",
      icon: "fas fa-bell",
      color: "bg-gradient-to-r from-orange-500 to-red-600",
      description: "Let visitors subscribe to notifications"
    }
  ];

  const handleAddElement = (type: string) => {
    const id = generateFieldId();
    let element: PageElement;

    switch (type) {
      case "heading":
        element = {
          id,
          type: "heading",
          order: Date.now(),
          data: {
            text: "New Heading",
            level: "h2" as const,
            alignment: "center" as const
          }
        };
        break;
      
      case "paragraph":
        element = {
          id,
          type: "paragraph",
          order: Date.now(),
          data: {
            text: "Enter your text here...",
            alignment: "left" as const
          }
        };
        break;
      
      case "addToContacts":
        element = {
          id,
          type: "addToContacts",
          order: Date.now(),
          data: {
            buttonText: "Add to Contacts",
            style: "filled" as const,
            buttonColor: "#22c55e",
            textColor: "#ffffff",
            showIcon: true
          }
        };
        break;
      
      case "shareButton":
        element = {
          id,
          type: "shareButton",
          order: Date.now(),
          data: {
            buttonText: "Share",
            style: "filled" as const,
            buttonColor: "#22c55e",
            textColor: "#ffffff",
            showIcon: true,
            showShareMenu: true
          }
        };
        break;
      
      case "contactSection":
        element = {
          id,
          type: "contactSection",
          order: Date.now(),
          data: {
            contacts: []
          }
        };
        break;
      
      case "socialSection":
        element = {
          id,
          type: "socialSection",
          order: Date.now(),
          data: {
            socials: []
          }
        };
        break;
      
      case "link":
        element = {
          id,
          type: "link",
          order: Date.now(),
          data: {
            text: "Click Here",
            url: "https://example.com",
            style: "button" as const
          }
        };
        break;
      
      case "image":
        element = {
          id,
          type: "image",
          order: Date.now(),
          data: {
            src: "",
            alt: "Image description"
          }
        };
        break;
      
      case "qrcode":
        element = {
          id,
          type: "qrcode",
          order: Date.now(),
          data: {
            value: window.location.href,
            size: 200,
            frameStyle: "none",
            frameColor: "#22c55e",
            customLabel: false,
            labelText: ""
          }
        };
        break;
      
      case "video":
        element = {
          id,
          type: "video",
          order: Date.now(),
          data: {
            url: "https://youtube.com/watch?v=...",
            thumbnail: ""
          }
        };
        break;
      
      case "contactForm":
        element = {
          id,
          type: "contactForm",
          order: Date.now(),
          data: {
            title: "Contact Me",
            fields: ["name", "email", "phone", "company", "message"],
            receiverEmail: "",
            emailNotifications: true,
            autoReply: false,
            fileAttachments: false,
            spamProtection: false,
            successMessage: "Thank you! We'll get back to you soon.",
            googleSheets: {
              enabled: false,
              spreadsheetId: "",
              sheetName: "Sheet1"
            }
          }
        };
        break;
      
      case "accordion":
        element = {
          id,
          type: "accordion",
          order: Date.now(),
          data: {
            items: [
              {
                id: generateFieldId(),
                title: "Question 1",
                content: "Answer 1"
              }
            ]
          }
        };
        break;
      
      case "imageSlider":
        element = {
          id,
          type: "imageSlider",
          order: Date.now(),
          data: {
            images: []
          }
        };
        break;
      
      case "testimonials":
        element = {
          id,
          type: "testimonials",
          order: Date.now(),
          data: {
            title: "What Our Clients Say",
            testimonials: [
              {
                id: generateFieldId(),
                name: "John Doe",
                title: "CEO",
                company: "Tech Corp",
                content: "This service exceeded our expectations. Highly recommended!",
                rating: 5
              }
            ],
            displayStyle: "cards" as const
          }
        };
        break;
      
      case "googleMaps":
        element = {
          id,
          type: "googleMaps",
          order: Date.now(),
          data: {
            title: "Find Us",
            address: "New York, NY, USA",
            zoom: 15,
            mapType: "roadmap" as const,
            showMarker: true,
            height: 300,
            displayMode: "map" as const
          }
        };
        break;
      
      case "aiChatbot":
        element = {
          id,
          type: "aiChatbot",
          order: Date.now(),
          data: {
            title: "AI Assistant",
            welcomeMessage: "Hi! How can I help you today?",
            knowledgeBase: {
              textContent: "",
              websiteUrl: "",
              pdfFiles: []
            },
            appearance: {
              position: "bottom-right" as const,
              primaryColor: "#22c55e",
              chatHeight: 400,
              chatWidth: 350
            },
            isEnabled: true
          }
        };
        break;
      
      case "ragKnowledge":
        element = {
          id,
          type: "ragKnowledge",
          order: Date.now(),
          data: {
            title: "Knowledge Base Assistant",
            description: "Advanced AI assistant with website knowledge ingestion",
            knowledgeBase: {
              textContent: "",
              websiteUrl: "",
              pdfFiles: []
            },
            showIngestForm: true,
            showChatBox: true,
            primaryColor: "#22c55e",
          }
        };
        break;
      
      case "digitalWallet":
        element = {
          id,
          type: "digitalWallet",
          order: Date.now(),
          data: {
            title: "Save to Digital Wallet",
            subtitle: "Add this business card to your phone's wallet",
            layout: "stacked",
            showApple: true,
            showGoogle: true,
            showQRDownload: false,
            modernStyle: false,
            backgroundColor: "#1e293b",
            textColor: "#ffffff",
            fontFamily: "Inter",
            appleButtonColor: "#000000",
            googleButtonColor: "#2563eb",
            appleButtonText: "Add to Apple Wallet",
            googleButtonText: "Add to Google Wallet",
            qrButtonText: "Download QR Code",
            qrButtonColor: "#000000"
          }
        };
        break;

      case "navigationMenu":
        element = {
          id,
          type: "navigationMenu",
          order: Date.now(),
          data: {
            title: "Navigation Menu",
            items: [
              { id: `home-${Date.now()}`, type: 'internal', label: 'Home', path: '', visible: true, order: 0 },
              { id: `about-${Date.now()}`, type: 'internal', label: 'About', path: 'about', visible: true, order: 1 },
              { id: `contact-${Date.now()}`, type: 'internal', label: 'Contact', path: 'contact', visible: true, order: 2 }
            ],
            style: {
              variant: 'tabs',
              orientation: 'horizontal',
              radius: 'lg',
              size: 'md',
              bg: 'transparent',
              fg: '#0f172a',
              fgActive: '#111827',
              sticky: true,
              mobileCollapse: true,
              position: 'default',
              fixed: false
            }
          }
        };
        break;

      case "arPreviewMindAR":
        element = {
          id,
          type: "arPreviewMindAR",
          order: Date.now(),
          data: {
            mindFileUrl: "",
            posterUrl: import.meta.env.VITE_AR_DEFAULT_POSTER || "",
            planeTextureUrl: "",
            planeWidth: 0.8,
            planeHeight: 0.45,
            accent: "#0ea5e9",
            ctas: [
              { label: "View Offer", action: "link", value: "https://yourdomain.com/card/slug/offers" },
              { label: "WhatsApp", action: "whatsapp", value: "+88017XXXXXXXX" }
            ]
          }
        };
        break;
      
      case "bookAppointment":
        element = {
          id,
          type: "bookAppointment",
          order: Date.now(),
          data: {
            title: "Book Appointment",
            subtitle: "Schedule a meeting with me",
            buttonText: "Book Now",
            buttonStyle: "primary" as const,
            buttonSize: "medium" as const,
            buttonColor: "#22c55e",
            textColor: "#ffffff",
            showIcon: true,
            iconType: "calendar" as const,
            eventTypeSlug: "",
            duration: 30,
            description: "",
            showDuration: true,
            openInNewTab: true,
          }
        };
        break;
      
      case "scheduleCall":
        element = {
          id,
          type: "scheduleCall",
          order: Date.now(),
          data: {
            title: "Schedule a Call",
            subtitle: "Let's discuss your project",
            buttonText: "Schedule Call",
            buttonStyle: "primary" as const,
            buttonSize: "medium" as const,
            buttonColor: "#2563eb",
            textColor: "#ffffff",
            showIcon: true,
            iconType: "phone" as const,
            callType: "video" as const,
            eventTypeSlug: "",
            duration: 30,
            description: "",
            showDuration: true,
            openInNewTab: true,
          }
        };
        break;
      
      case "meetingRequest":
        element = {
          id,
          type: "meetingRequest",
          order: Date.now(),
          data: {
            title: "Request a Meeting",
            subtitle: "Let's meet to discuss opportunities",
            buttonText: "Request Meeting",
            buttonStyle: "outlined" as const,
            buttonSize: "medium" as const,
            buttonColor: "#7c3aed",
            textColor: "#7c3aed",
            showIcon: true,
            iconType: "handshake" as const,
            meetingType: "consultation" as const,
            eventTypeSlug: "",
            duration: 60,
            description: "",
            showDuration: true,
            openInNewTab: true,
          }
        };
        break;
      
      case "availabilityDisplay":
        element = {
          id,
          type: "availabilityDisplay",
          order: Date.now(),
          data: {
            title: "My Availability",
            subtitle: "Choose a convenient time",
            displayStyle: "compact" as const,
            showTimezone: true,
            timezone: "UTC",
            availableSlots: [
              { day: "Monday", startTime: "09:00", endTime: "17:00", available: true },
              { day: "Tuesday", startTime: "09:00", endTime: "17:00", available: true },
              { day: "Wednesday", startTime: "09:00", endTime: "17:00", available: true },
              { day: "Thursday", startTime: "09:00", endTime: "17:00", available: true },
              { day: "Friday", startTime: "09:00", endTime: "17:00", available: true },
            ],
            primaryColor: "#22c55e",
            backgroundColor: "#f8fafc",
            textColor: "#475569",
            showBookingLink: true,
            bookingLinkText: "Book a slot",
            eventTypeSlug: "",
          }
        };
        break;

      case "html":
        element = {
          id,
          type: "html",
          order: Date.now(),
          data: {
            content: "",
            height: 300,
            sandbox: true,
            showPreview: true,
          },
        };
        break;
      
      case "pdfViewer":
        element = {
          id,
          type: "pdfViewer",
          order: Date.now(),
          data: {
            pdf_file: "",
            button_text: "View PDF",
            scale: 1.0,
            file_name: "",
          },
        };
        break;
      
      case "subscribeForm":
        element = {
          id,
          type: "subscribeForm",
          order: Date.now(),
          data: {
            title: "Stay Updated",
            description: "Subscribe to get notified about updates and news.",
            buttonText: "Subscribe",
            successMessage: "Thank you for subscribing!",
            requireName: false,
            requireEmail: true,
            enablePushNotifications: true,
            primaryColor: "#f97316",
            backgroundColor: "#ffffff",
            textColor: "#1e293b",
          },
        };
        break;
      
      default:
        return;
    }

    onAddElement(element);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white max-h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-2xl font-bold text-center text-slate-800">
            Add New Element
          </DialogTitle>
          <p className="text-center text-slate-600">
            Select And Add Element to the Page
          </p>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="grid grid-cols-3 gap-4 py-4">
            {elementTypes.map((elementType) => (
              <Button
                key={elementType.type}
                onClick={() => handleAddElement(elementType.type)}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center space-y-2 hover:bg-slate-50 border border-slate-200 rounded-lg"
              >
                <div className={`w-12 h-12 rounded-lg ${elementType.color} flex items-center justify-center`}>
                  <i className={`${elementType.icon} text-lg text-slate-700`}></i>
                </div>
                <span className="font-medium text-slate-800">{elementType.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}