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