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
      title: "QRCode",
      icon: "fas fa-qrcode",
      color: "bg-red-100",
      description: "Generate QR code"
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
            size: 150
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
            successMessage: "Thank you! We'll get back to you soon."
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
            height: 300
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
      
      default:
        return;
    }

    onAddElement(element);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-slate-800">
            Add New Element
          </DialogTitle>
          <p className="text-center text-slate-600">
            Select And Add Element to the Page
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-3 gap-4 p-4">
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
      </DialogContent>
    </Dialog>
  );
}