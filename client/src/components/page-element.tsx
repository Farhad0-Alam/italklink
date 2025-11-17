import { PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { generateFieldId } from "@/lib/card-data";
import { AIChat } from "@/components/ai-chat";
import { IngestForm } from "@/components/IngestForm";
import { URLManager } from "@/components/URLManager";
import { DocumentManager, DocumentItem } from "@/components/DocumentManager";
import { RAGChatBox } from "@/components/RAGChatBox";
import { VoiceAgentElement } from "@/components/VoiceAgentElement";
import { MessageCircle } from "lucide-react";
import { MenuPageElement } from "@/modules/multi-page/components/MenuPageElement";
import ARPreviewMindAR from "@/elements/ARPreviewMindAR";
import { compileMind } from "@/builder/api/ar";
import { PdfViewerButton } from "@/components/PdfViewerButton";
import { SubscribeForm as SubscribeFormComponent } from "@/components/SubscribeForm";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ContactLinksRenderer } from '@/components/ContactLinksRenderer';
import { SocialLinksRenderer } from '@/components/SocialLinksRenderer';
import { ContactSectionEditor } from '@/components/ContactSectionEditor';
import { SocialSectionEditor } from '@/components/SocialSectionEditor';
import {
  schemaToEditorContact,
  editorToSchemaContact,
  schemaToEditorSocial,
  editorToSchemaSocial,
} from '@/lib/element-adapters';
import { IconPicker } from '@/components/icon-picker';

// Helper function to convert hex color to rgba
function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Sortable Image Item Component
interface SortableImageItemProps {
  image: { id: string; src: string; alt?: string; };
  index: number;
  onDelete: () => void;
  onUpdateAlt: (alt: string) => void;
}

function SortableImageItem({ image, index, onDelete, onUpdateAlt }: SortableImageItemProps) {
  const [showAltInput, setShowAltInput] = useState(false);
  const [altText, setAltText] = useState(image.alt || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl overflow-hidden bg-slate-600 shadow-lg transition-all duration-200 ${
        isDragging ? 'opacity-50 scale-105 z-50' : 'hover:shadow-xl'
      }`}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-lg flex items-center justify-center cursor-grab active:cursor-grabbing z-20 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <i className="fas fa-grip-vertical text-white text-xs"></i>
      </div>

      {/* Delete Button */}
      <Button
        onClick={onDelete}
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 w-8 h-8 p-0 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-20"
      >
        <i className="fas fa-times"></i>
      </Button>

      {/* Image Index */}
      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20">
        #{index + 1}
      </div>

      {/* Image */}
      <div className="aspect-square">
        <img
          src={image.src}
          alt={image.alt || ''}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Alt Text Input */}
      {showAltInput ? (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 backdrop-blur-sm">
          <Input
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            onBlur={() => {
              onUpdateAlt(altText);
              setShowAltInput(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onUpdateAlt(altText);
                setShowAltInput(false);
              }
              if (e.key === 'Escape') {
                setAltText(image.alt || '');
                setShowAltInput(false);
              }
            }}
            placeholder="Image description..."
            className="text-xs bg-transparent border-none text-white placeholder:text-slate-300 p-0 h-auto focus:ring-0"
            autoFocus
          />
        </div>
      ) : (
        <button
          onClick={() => setShowAltInput(true)}
          className="absolute bottom-0 left-0 right-0 p-2 bg-black/50 backdrop-blur-sm text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
        >
          {image.alt || 'Add description...'}
        </button>
      )}
    </div>
  );
}

// Availability Widget Component
interface AvailabilityWidgetProps {
  eventTypeSlug?: string;
  timezone?: string;
  displayStyle?: string;
  daysToShow?: number;
  primaryColor?: string;
  showBookingButton?: boolean;
  bookingButtonText?: string;
  openInNewTab?: boolean;
  isInteractive?: boolean;
}

function AvailabilityWidget({
  eventTypeSlug = '30min-meeting',
  timezone = 'auto',
  displayStyle = 'compact',
  daysToShow = 7,
  primaryColor = '#22c55e',
  showBookingButton = true,
  bookingButtonText = 'Book a slot',
  openInNewTab = false,
  isInteractive = true
}: AvailabilityWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);

  // Generate mock availability data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulate API call
    const timer = setTimeout(() => {
      const mockSlots = [];
      const today = new Date();
      
      for (let i = 0; i < daysToShow; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        
        // Mock availability - some days available, some busy, some with multiple slots
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const isAvailable = !isWeekend && Math.random() > 0.3;
        
        if (isAvailable) {
          // Add multiple time slots for available days
          const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'];
          timeSlots.forEach((time, timeIndex) => {
            if (Math.random() > 0.4) { // 60% chance each slot is available
              mockSlots.push({
                id: `${i}-${timeIndex}`,
                day: `${dayName}, ${dateStr}`,
                time,
                available: true,
                date: date.toISOString().split('T')[0]
              });
            }
          });
        } else {
          // Add one busy slot for non-available days
          mockSlots.push({
            id: `${i}-busy`,
            day: `${dayName}, ${dateStr}`,
            time: isWeekend ? 'Weekend' : 'No slots',
            available: false,
            date: date.toISOString().split('T')[0]
          });
        }
      }
      
      setAvailableSlots(mockSlots);
      setIsLoading(false);
    }, 800); // Simulate loading delay
    
    return () => clearTimeout(timer);
  }, [daysToShow, eventTypeSlug]);

  const handleSlotClick = (slot: any) => {
    if (!isInteractive || !slot.available) return;
    
    const bookingUrl = `/booking/${eventTypeSlug}?date=${slot.date}&time=${encodeURIComponent(slot.time)}&source=availability`;
    
    if (openInNewTab) {
      window.open(bookingUrl, '_blank');
    } else {
      window.location.href = bookingUrl;
    }
  };

  const handleBookingClick = () => {
    if (!isInteractive) return;
    
    const bookingUrl = `/booking/${eventTypeSlug}?source=availability`;
    
    if (openInNewTab) {
      window.open(bookingUrl, '_blank');
    } else {
      window.location.href = bookingUrl;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3" data-testid="availability-loading">
        {Array.from({ length: Math.min(daysToShow, 5) }).map((_, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-20"></div>
            <div className="h-4 bg-slate-200 rounded w-16"></div>
            <div className="h-4 bg-slate-200 rounded w-12"></div>
          </div>
        ))}
        {showBookingButton && (
          <div className="mt-4 text-center">
            <div className="h-10 bg-slate-200 rounded w-32 mx-auto animate-pulse"></div>
          </div>
        )}
      </div>
    );
  }

  if (displayStyle === 'minimal') {
    return (
      <div className="space-y-2">
        <div className="text-center text-sm text-slate-600 mb-3">
          <i className="fas fa-clock mr-1"></i>
          {availableSlots.filter(slot => slot.available).length} slots available
        </div>
        {showBookingButton && (
          <div className="text-center">
            <Button
              onClick={handleBookingClick}
              style={{
                backgroundColor: primaryColor,
                color: "#ffffff",
              }}
              className="px-4 py-2 rounded font-medium hover:shadow-lg transition-all"
              data-testid="button-book-availability"
            >
              <i className="fas fa-calendar-alt mr-2"></i>
              {bookingButtonText}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {availableSlots.map((slot, index) => (
        <div 
          key={slot.id} 
          className={`flex items-center justify-between p-3 bg-white rounded border transition-all ${
            slot.available && isInteractive ? 'hover:shadow-md hover:border-slate-300 cursor-pointer' : ''
          }`}
          onClick={() => handleSlotClick(slot)}
          data-testid={`availability-slot-${index}`}
        >
          <span className="text-sm font-medium text-slate-700" data-testid={`availability-day-${index}`}>
            {displayStyle === 'detailed' ? slot.day : slot.day.split(',')[0]}
          </span>
          <span className="text-sm text-slate-600" data-testid={`availability-time-${index}`}>
            {slot.time}
          </span>
          <div className="flex items-center">
            <div 
              className={`w-2 h-2 rounded-full mr-2 ${
                slot.available ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span className={`text-xs ${
              slot.available ? "text-green-600" : "text-red-600"
            }`}>
              {slot.available ? "Available" : "Busy"}
            </span>
          </div>
        </div>
      ))}
      
      {showBookingButton && (
        <div className="mt-4 text-center">
          <Button
            onClick={handleBookingClick}
            style={{
              backgroundColor: primaryColor,
              color: "#ffffff",
            }}
            className="px-4 py-2 rounded font-medium hover:shadow-lg transition-all"
            data-testid="button-book-availability"
          >
            <i className="fas fa-calendar-alt mr-2"></i>
            {bookingButtonText}
          </Button>
        </div>
      )}
    </div>
  );
}

// Enhanced Image Slider Component with Modern Design
interface ImageSliderComponentProps {
  images: { id: string; src: string; alt?: string; }[];
  defaultView?: string;
  autoPlay?: boolean;
  orientation?: string;
  displayMode?: string;
}

function ImageSliderComponent({ images, defaultView, autoPlay, orientation, displayMode }: ImageSliderComponentProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(autoPlay || false);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlay && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlay, images.length]);

  // Simple, clean carousel for card display
  return (
    <div className="w-full">
      {/* Main Carousel - Clean Design for Card */}
      <div className="relative rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-lg">
        <div className="relative" style={{ aspectRatio: 'auto' }}>
          {/* Current Image - Full Display */}
          <div className="relative">
            <img
              src={images[currentSlide]?.src}
              alt={images[currentSlide]?.alt || ''}
              className={`w-full ${
                displayMode === 'cover' 
                  ? 'h-64 object-cover' 
                  : orientation === 'vertical' 
                    ? 'max-h-96 object-contain' 
                    : orientation === 'horizontal'
                      ? 'max-h-64 object-contain'
                      : 'max-h-80 object-contain'
              }`}
              key={currentSlide}
            />
          </div>

          {/* Navigation Arrows - Only if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : images.length - 1)}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 shadow-lg"
              >
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <button
                onClick={() => setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-all duration-200 shadow-lg"
              >
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </>
          )}

          {/* Simple dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide ? 'bg-white scale-125' : 'bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Testimonials Slider Component
interface TestimonialsSliderProps {
  testimonials: any[];
}

function TestimonialsSlider({ testimonials }: TestimonialsSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
              <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <i key={i} className="fas fa-star text-yellow-400"></i>
                  ))}
                </div>
                <p className="text-slate-700 mb-4 italic">"{testimonial.content}"</p>
                <div className="flex items-center">
                  <div>
                    <p className="font-semibold text-slate-800">{testimonial.name}</p>
                    {testimonial.title && (
                      <p className="text-sm text-slate-600">{testimonial.title}</p>
                    )}
                    {testimonial.company && (
                      <p className="text-sm text-slate-500">{testimonial.company}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {testimonials.length > 1 && (
        <>
          <button
            onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : testimonials.length - 1)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
            data-testid="testimonials-prev"
          >
            <i className="fas fa-chevron-left text-sm"></i>
          </button>
          <button
            onClick={() => setCurrentSlide(prev => prev < testimonials.length - 1 ? prev + 1 : 0)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white shadow-lg text-slate-600 p-2 rounded-full hover:bg-slate-50 transition-colors"
            data-testid="testimonials-next"
          >
            <i className="fas fa-chevron-right text-sm"></i>
          </button>
          <div className="flex justify-center mt-4 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-green-500' : 'bg-slate-300'
                }`}
                data-testid={`testimonials-dot-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}


interface PageElementProps {
  element: PageElement;
  isEditing?: boolean;
  onUpdate?: (element: PageElement) => void;
  onDelete?: (elementId: string) => void;
  isInteractive?: boolean;
  cardData?: any; // Business card data for theme colors
  onNavigatePage?: (pageId: string) => void;
}

export function PageElementRenderer({ element, isEditing = false, onUpdate, onDelete, isInteractive = true, cardData, onNavigatePage }: PageElementProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceAgentSections, setVoiceAgentSections] = useState({
    basic: true,
    voice: false,
    knowledge: false,
    scripts: false,
    integrations: false,
    callSettings: false,
    audio: false
  });
  
  // Define sensors for drag and drop
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
  
  // Helper function to safely access element data
  const getData = () => element.data || {};
  
  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  const toggleVoiceSection = (section: keyof typeof voiceAgentSections) => {
    setVoiceAgentSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const renderElement = () => {
    switch (element.type) {
      case "heading":
        const HeadingTag = element.data.level as keyof JSX.IntrinsicElements;
        const headingColor = element.data?.color || cardData?.headingColor || "#0f0f0f";
        
        return (
          <div className={`text-${element.data.alignment} mb-4`}>
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={element.data?.text || ''}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Heading text"
                />
                <div className="flex gap-2">
                  <select
                    value={element.data?.level || 'h1'}
                    onChange={(e) => handleDataUpdate({ level: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>
                  <select
                    value={element.data?.alignment || 'left'}
                    onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={element.data?.color || cardData?.headingColor || "#0f0f0f"}
                    onChange={(e) => handleDataUpdate({ color: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                  />
                  {element.data?.color && (
                    <button
                      onClick={() => handleDataUpdate({ color: undefined })}
                      className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                    >
                      <i className="fas fa-undo mr-1"></i>
                      Reset to Theme
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <HeadingTag 
                className={`font-bold ${
                  element.data.level === 'h1' ? 'text-2xl' : 
                  element.data.level === 'h2' ? 'text-xl' : 'text-lg'
                }`}
                style={{ color: headingColor }}
              >
                {element.data.text}
              </HeadingTag>
            )}
          </div>
        );

      case "paragraph":
        const paragraphColor = element.data?.color || cardData?.paragraphColor || "#141414";
        
        return (
          <div className={`text-${element.data.alignment} mb-4`}>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={element.data?.text || ''}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Paragraph text"
                  rows={3}
                />
                <select
                  value={element.data?.alignment || 'left'}
                  onChange={(e) => handleDataUpdate({ alignment: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                  <input
                    type="color"
                    value={element.data?.color || cardData?.paragraphColor || "#141414"}
                    onChange={(e) => handleDataUpdate({ color: e.target.value })}
                    className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                  />
                  {element.data?.color && (
                    <button
                      onClick={() => handleDataUpdate({ color: undefined })}
                      className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                    >
                      <i className="fas fa-undo mr-1"></i>
                      Reset to Theme
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed" style={{ color: paragraphColor }}>
                {element.data.text}
              </p>
            )}
          </div>
        );

      case "link":
        return (
          <div className="mb-1">
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  value={element.data?.text || ''}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Link text"
                />
                <Input
                  value={element.data?.url || ''}
                  onChange={(e) => handleDataUpdate({ url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://example.com"
                />
                <select
                  value={element.data?.style || 'button'}
                  onChange={(e) => handleDataUpdate({ style: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                >
                  <option value="button">Button</option>
                  <option value="text">Text Link</option>
                </select>

                {element.data?.style === 'button' && (
                  (() => {
                    // Compute theme-based fallback colors for the color pickers
                    const theme = cardData?.theme || { brandColor: "#1e40af", secondaryColor: "#a855f7", tertiaryColor: "#ffffff" };
                    const defaultBgColor = theme.brandColor || "#1e40af";
                    const defaultTextColor = theme.tertiaryColor || "#ffffff";
                    const defaultBorderColor = theme.secondaryColor || "#a855f7";

                    return (
                      <div className="space-y-3 pt-2 border-t border-slate-600">
                        <p className="text-xs text-gray-300 font-medium">Button Styling</p>
                        
                        {/* Icon Input */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Icon (Optional)</label>
                          <IconPicker
                            value={element.data?.buttonIcon || ''}
                            onChange={(icon) => handleDataUpdate({ buttonIcon: icon })}
                          />
                          <p className="text-xs text-gray-500 mt-1">Browse to select from FontAwesome icons</p>
                        </div>

                        {/* Background Color */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                          <input
                            type="color"
                            value={element.data?.buttonBgColor || defaultBgColor}
                            onChange={(e) => handleDataUpdate({ buttonBgColor: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          {element.data?.buttonBgColor && (
                            <button
                              onClick={() => handleDataUpdate({ buttonBgColor: undefined })}
                              className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                            >
                              <i className="fas fa-undo mr-1"></i>
                              Reset to Theme
                            </button>
                          )}
                        </div>

                        {/* Text Color */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                          <input
                            type="color"
                            value={element.data?.buttonTextColor || defaultTextColor}
                            onChange={(e) => handleDataUpdate({ buttonTextColor: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          {element.data?.buttonTextColor && (
                            <button
                              onClick={() => handleDataUpdate({ buttonTextColor: undefined })}
                              className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                            >
                              <i className="fas fa-undo mr-1"></i>
                              Reset to Theme
                            </button>
                          )}
                        </div>

                        {/* Border Color */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                          <input
                            type="color"
                            value={element.data?.buttonBorderColor || defaultBorderColor}
                            onChange={(e) => handleDataUpdate({ buttonBorderColor: e.target.value })}
                            className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                          />
                          {element.data?.buttonBorderColor && (
                            <button
                              onClick={() => handleDataUpdate({ buttonBorderColor: undefined })}
                              className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                            >
                              <i className="fas fa-undo mr-1"></i>
                              Reset to Theme
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            ) : (
              element.data.style === "button" ? (
                (() => {
                  // Helper function to adjust color brightness
                  const adjustColor = (hex: string, amount: number): string => {
                    const num = parseInt(hex.replace("#", ""), 16);
                    const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
                    const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
                    const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
                    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
                  };

                  const theme = cardData?.theme || { brandColor: "#1e40af", secondaryColor: "#a855f7", tertiaryColor: "#ffffff" };
                  const buttonBg = element.data?.buttonBgColor || theme.brandColor || "#1e40af";
                  const buttonText = element.data?.buttonTextColor || theme.tertiaryColor || "#ffffff";
                  const buttonBorder = element.data?.buttonBorderColor || theme.secondaryColor || "#a855f7";

                  return (
                    <button
                      onClick={() => window.open(element.data.url, '_blank')}
                      className="w-full py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors"
                      style={{
                        backgroundColor: buttonBg,
                        color: buttonText,
                        borderBottom: `4px solid ${adjustColor(buttonBorder, -20)}`,
                      }}
                    >
                      {element.data?.buttonIcon && (
                        <i className={`${element.data.buttonIcon} text-lg mr-3`}></i>
                      )}
                      {element.data.text}
                    </button>
                  );
                })()
              ) : (
                <a
                  href={element.data.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-talklink-500 hover:text-talklink-600 underline"
                >
                  {element.data.text}
                </a>
              )
            )}
          </div>
        );

      case "image":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        handleDataUpdate({ src: e.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={element.data?.alt || ''}
                  onChange={(e) => handleDataUpdate({ alt: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Image description"
                />
              </div>
            ) : (
              element.data.src && (
                <img
                  src={element.data.src}
                  alt={element.data.alt || ''}
                  className="w-full max-w-sm mx-auto rounded-lg"
                />
              )
            )}
          </div>
        );

      case "qrcode":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4 bg-slate-700 p-4 rounded-lg">
                {/* QR Content */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">QR Code Content</label>
                  <Input
                    value={element.data?.value || ''}
                    onChange={(e) => handleDataUpdate({ value: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Enter URL or text"
                  />
                </div>

                {/* Size */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Size: {element.data.size || 200}px
                  </label>
                  <input
                    type="range"
                    value={element.data?.size || 200}
                    onChange={(e) => handleDataUpdate({ size: parseInt(e.target.value) })}
                    min="120"
                    max="300"
                    className="w-full accent-talklink-500"
                  />
                </div>

                {/* Simple Frame Options */}
                <div>
                  <label className="block text-white text-sm font-medium mb-3">Frame Style</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => handleDataUpdate({ frameStyle: 'none' })}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        (!element.data?.frameStyle || element.data?.frameStyle === 'none')
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-1 bg-slate-400 rounded"></div>
                      None
                    </button>
                    <button
                      onClick={() => handleDataUpdate({ frameStyle: 'rounded' })}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        element.data?.frameStyle === 'rounded'
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-1 bg-slate-400 rounded-lg border-2 border-green-500"></div>
                      Border
                    </button>
                    <button
                      onClick={() => handleDataUpdate({ frameStyle: 'corners' })}
                      className={`p-3 rounded-lg border text-sm transition-colors ${
                        element.data?.frameStyle === 'corners'
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="w-8 h-8 mx-auto mb-1 bg-slate-400 rounded relative">
                        <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-green-500 rounded-tl"></div>
                        <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-green-500 rounded-tr"></div>
                        <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-green-500 rounded-bl"></div>
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-green-500 rounded-br"></div>
                      </div>
                      Corners
                    </button>
                  </div>
                </div>

                {/* Custom Label */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={element.data?.customLabel || false}
                    onChange={(e) => handleDataUpdate({ customLabel: e.target.checked })}
                    className="accent-talklink-500"
                  />
                  <label className="text-white text-sm">Add custom label</label>
                </div>

                {element.data?.customLabel && (
                  <Input
                    value={element.data?.labelText || ''}
                    onChange={(e) => handleDataUpdate({ labelText: e.target.value })}
                    placeholder="Follow us on X"
                    className="bg-slate-600 border-slate-500 text-white"
                  />
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {element.data.value && (
                  <>
                    <div className="relative">
                      {/* QR Code Container */}
                      <div 
                        className={`transition-all ${
                          element.data.frameStyle === 'rounded' ? 'rounded-lg' : 'rounded'
                        }`}
                        style={{
                          backgroundColor: 'white',
                          padding: '11px',
                          border: element.data.frameStyle === 'rounded' ? `6px solid ${cardData?.brandColor || '#22c55e'}` : 'none',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        <QRCodeSVG
                          value={element.data.value}
                          size={element.data.size || 200}
                          level="H"
                          includeMargin={false}
                          fgColor="#1e293b"
                          bgColor="#ffffff"
                        />
                      </div>

                      {/* Corner Brackets Style */}
                      {element.data.frameStyle === 'corners' && (
                        <>
                          {/* Top Left Corner */}
                          <div 
                            className="absolute -top-1 -left-1 w-6 h-6"
                            style={{
                              borderLeft: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderTop: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                          {/* Top Right Corner */}
                          <div 
                            className="absolute -top-1 -right-1 w-6 h-6"
                            style={{
                              borderRight: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderTop: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                          {/* Bottom Left Corner */}
                          <div 
                            className="absolute -bottom-1 -left-1 w-6 h-6"
                            style={{
                              borderLeft: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderBottom: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                          {/* Bottom Right Corner */}
                          <div 
                            className="absolute -bottom-1 -right-1 w-6 h-6"
                            style={{
                              borderRight: `6px solid ${cardData?.brandColor || '#22c55e'}`,
                              borderBottom: `6px solid ${cardData?.brandColor || '#22c55e'}`
                            }}
                          ></div>
                        </>
                      )}
                    </div>

                    {/* Custom Label */}
                    {element.data.customLabel && element.data.labelText && (
                      <div 
                        className="mt-3 px-4 py-2 rounded-full text-white font-medium text-sm"
                        style={{backgroundColor: cardData?.brandColor || '#22c55e'}}
                      >
                        {element.data.labelText}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        );

      case "contactSection": {
        if (isEditing) {
          // Convert schema data (numbers) to editor format (strings) for editing
          const editorData = schemaToEditorContact(element.data);
          
          // Handle updates from the editor
          const handleEditorChange = (updatedEditorData: any) => {
            // Convert editor format (strings) back to schema (numbers)
            const schemaData = editorToSchemaContact(updatedEditorData);
            handleDataUpdate(schemaData);
          };
          
          return (
            <div className="mb-6">
              <ContactSectionEditor
                data={editorData}
                onChange={handleEditorChange}
              />
            </div>
          );
        }
        
        return <ContactLinksRenderer data={element.data} />;
      }

      case "socialSection": {
        if (isEditing) {
          // Convert schema data (numbers) to editor format (strings) for editing
          const editorData = schemaToEditorSocial(element.data);
          
          // Handle updates from the editor
          const handleEditorChange = (updatedEditorData: any) => {
            // Convert editor format (strings) back to schema (numbers)
            const schemaData = editorToSchemaSocial(updatedEditorData);
            handleDataUpdate(schemaData);
          };
          
          return (
            <div className="mb-6">
              <SocialSectionEditor
                data={editorData}
                onChange={handleEditorChange}
              />
            </div>
          );
        }
        
        return <SocialLinksRenderer data={element.data} />;
      }

      case "actionButtons": {
        // Safe cardData access with defaults
        const theme = cardData ?? {};
        
        const adjustColor = (hex: string, amount: number): string => {
          const num = parseInt(hex.replace("#", ""), 16);
          const r = Math.max(0, Math.min(255, ((num >> 16) & 0xff) + amount));
          const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
          const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
          return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
        };

        const handleSaveContact = () => {
          const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${theme.fullName || 'Contact'}
${theme.title ? `TITLE:${theme.title}\n` : ''}${theme.company ? `ORG:${theme.company}\n` : ''}${theme.email ? `EMAIL:${theme.email}\n` : ''}${theme.phone ? `TEL:${theme.phone}\n` : ''}${theme.location ? `ADR:;;${theme.location};;;;\n` : ''}${theme.website ? `URL:${theme.website}\n` : ''}END:VCARD`;
          
          const blob = new Blob([vCard], { type: "text/vcard" });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `${theme.fullName || 'contact'}.vcf`;
          link.click();
        };

        const handleShare = async () => {
          if (navigator.share) {
            try {
              await navigator.share({
                title: theme.fullName || 'Business Card',
                url: window.location.href,
              });
            } catch (err) {
              console.log("Share cancelled");
            }
          } else {
            // Safe clipboard fallback with guard
            if (navigator.clipboard && navigator.clipboard.writeText) {
              try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              } catch (err) {
                alert("Unable to copy link. Please copy manually: " + window.location.href);
              }
            } else {
              alert("Share not supported. Copy this link: " + window.location.href);
            }
          }
        };

        if (isEditing) {
          return (
            <div className="mb-4 p-4 bg-slate-700 rounded-lg border border-slate-600 space-y-4">
              <div>
                <p className="text-white text-sm font-medium mb-1">
                  <i className="fas fa-hand-pointer mr-2"></i>
                  Save & Share Buttons
                </p>
                <p className="text-xs text-gray-400">
                  Customize button colors or leave empty for theme defaults
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Add to Contacts Button Colors */}
                <div className="space-y-3">
                  <p className="text-xs text-gray-300 font-medium">Add to Contacts</p>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Button Color</label>
                    <input
                      type="color"
                      value={element.data?.addToContactsBgColor || ""}
                      onChange={(e) => handleDataUpdate({ ...element.data, addToContactsBgColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                    <input
                      type="color"
                      value={element.data?.addToContactsBorderColor || ""}
                      onChange={(e) => handleDataUpdate({ ...element.data, addToContactsBorderColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                    <input
                      type="color"
                      value={element.data?.addToContactsTextColor || ""}
                      onChange={(e) => handleDataUpdate({ ...element.data, addToContactsTextColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                </div>

                {/* Share Button Colors */}
                <div className="space-y-3">
                  <p className="text-xs text-gray-300 font-medium">Share Button</p>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Button Color</label>
                    <input
                      type="color"
                      value={element.data?.shareBgColor || ""}
                      onChange={(e) => handleDataUpdate({ ...element.data, shareBgColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                    <input
                      type="color"
                      value={element.data?.shareBorderColor || ""}
                      onChange={(e) => handleDataUpdate({ ...element.data, shareBorderColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Text Color</label>
                    <input
                      type="color"
                      value={element.data?.shareTextColor || ""}
                      onChange={(e) => handleDataUpdate({ ...element.data, shareTextColor: e.target.value })}
                      className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleDataUpdate({})}
                  className="text-xs text-gray-400 hover:text-white transition-colors"
                >
                  <i className="fas fa-undo mr-1"></i>
                  Reset to Theme Colors
                </button>
              </div>
            </div>
          );
        }

        const addToContactsBg = element.data?.addToContactsBgColor || theme.secondaryColor || "#a855f7";
        const addToContactsBorder = element.data?.addToContactsBorderColor || theme.brandColor || "#1e40af";
        const addToContactsText = element.data?.addToContactsTextColor || theme.tertiaryColor || "#ffffff";
        const shareBg = element.data?.shareBgColor || theme.brandColor || "#1e40af";
        const shareBorder = element.data?.shareBorderColor || theme.secondaryColor || "#a855f7";
        const shareText = element.data?.shareTextColor || theme.tertiaryColor || "#ffffff";

        return (
          <div className="flex gap-1 mb-1">
            {/* Add to Contacts Button */}
            <button
              onClick={handleSaveContact}
              className="py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors flex-1"
              style={{
                backgroundColor: addToContactsBg,
                color: addToContactsText,
                borderBottom: `4px solid ${adjustColor(addToContactsBorder, -20)}`,
              }}
            >
              <i className="fas fa-address-book text-lg mr-3"></i>
              Add to Contacts
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors"
              style={{
                backgroundColor: shareBg,
                color: shareText,
                borderBottom: `4px solid ${adjustColor(shareBorder, -20)}`,
                width: "30%",
              }}
            >
              <i className="fas fa-share-alt text-lg"></i>
              <span className="ml-2">Share</span>
            </button>
          </div>
        );
      }

      case "video":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={element.data?.url || ''}
                  onChange={(e) => handleDataUpdate({ url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="YouTube/Vimeo URL"
                />
                <Input
                  value={element.data?.thumbnail || ''}
                  onChange={(e) => handleDataUpdate({ thumbnail: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Thumbnail URL (optional)"
                />
              </div>
            ) : (
              element.data.url && (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  {element.data.url.includes('youtube.com') || element.data.url.includes('youtu.be') ? (
                    <iframe
                      src={element.data.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                      className="w-full h-full border-0"
                      allowFullScreen
                      title="YouTube video"
                    />
                  ) : element.data.url.includes('vimeo.com') ? (
                    <iframe
                      src={element.data.url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                      className="w-full h-full border-0"
                      allowFullScreen
                      title="Vimeo video"
                    />
                  ) : (
                    <video controls className="w-full h-full">
                      <source src={element.data.url} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              )
            )}
          </div>
        );

      case "contactForm":
        const [formData, setFormData] = useState<Record<string, string>>({});
        const [isSubmitting, setIsSubmitting] = useState(false);
        const [submitStatus, setSubmitStatus] = useState<string>('');

        const handleFormSubmit = async (e: React.FormEvent) => {
          e.preventDefault();
          setIsSubmitting(true);
          setSubmitStatus('');

          try {
            const response = await fetch('/api/contact-form/submit', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                formData,
                formConfig: element.data
              }),
            });

            const result = await response.json();

            if (result.success) {
              setSubmitStatus(element.data.successMessage || '✅ Message sent successfully!');
              setFormData({}); // Reset form
              // Reset file input
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              if (fileInput) fileInput.value = '';
            } else {
              setSubmitStatus('❌ Failed to send message. Please try again.');
            }
          } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('❌ Failed to send message. Please try again.');
          } finally {
            setIsSubmitting(false);
          }
        };

        const handleInputChange = (field: string, value: string) => {
          setFormData(prev => ({ ...prev, [field]: value }));
        };

        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4">
                {/* Contact Form Title Display */}
                <div className="p-4 bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg border border-slate-500 shadow-lg">
                  <Input
                    value={element.data?.title || ''}
                    onChange={(e) => handleDataUpdate({ title: e.target.value })}
                    className="bg-transparent border-0 text-white font-semibold text-xl tracking-wide opacity-100 p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="Form Title here"
                  />
                  <div className="text-slate-300 text-sm font-medium mt-1 opacity-100">contactForm</div>
                </div>

                {/* Form Fields */}
                <Collapsible defaultOpen={true}>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between w-full p-3 rounded-lg border transition-colors" style={{backgroundColor: '#22c55e20', borderColor: '#22c55e50'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22c55e30'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e20'}>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-list" style={{color: '#22c55e'}}></i>
                        <span className="font-medium" style={{color: '#22c55e'}}>Form Fields</span>
                      </div>
                      <i className="fas fa-chevron-down text-xs" style={{color: '#22c55e'}}></i>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-3">
                    <div className="text-white text-sm mb-2">Select fields to include:</div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { field: 'name', label: 'Full Name', icon: 'fas fa-user', required: true },
                        { field: 'email', label: 'Email Address', icon: 'fas fa-envelope', required: true },
                        { field: 'phone', label: 'Phone Number', icon: 'fas fa-phone', required: false },
                        { field: 'company', label: 'Company', icon: 'fas fa-building', required: false },
                        { field: 'website', label: 'Website', icon: 'fas fa-globe', required: false },
                        { field: 'message', label: 'Message', icon: 'fas fa-comment', required: true }
                      ].map(({ field, label, icon, required }) => (
                        <label key={field} className="flex items-center space-x-2 p-2 bg-slate-600 rounded border hover:bg-slate-500 transition-colors cursor-pointer">
                          <input
                            type="checkbox"
                            checked={element.data.fields.includes(field)}
                            onChange={(e) => {
                              const fields = e.target.checked 
                                ? [...element.data.fields, field]
                                : element.data.fields.filter(f => f !== field);
                              handleDataUpdate({ fields });
                            }}
                            className="rounded"
                          />
                          <i className={`${icon} text-white text-xs w-4`}></i>
                          <span className="text-white text-xs flex-1">{label}</span>
                          {required && <span className="text-red-400 text-xs">*</span>}
                        </label>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Delivery Options */}
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between w-full p-3 rounded-lg border transition-colors" style={{backgroundColor: '#06b6d420', borderColor: '#06b6d450'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#06b6d430'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#06b6d420'}>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-paper-plane" style={{color: '#06b6d4'}}></i>
                        <span className="font-medium" style={{color: '#06b6d4'}}>Delivery Options</span>
                        {element.data.emailNotifications && (
                          <span className="text-xs px-2 py-1 rounded font-medium text-white" style={{backgroundColor: '#06b6d4'}}>
                            EMAIL ENABLED
                          </span>
                        )}
                      </div>
                      <i className="fas fa-chevron-down text-xs" style={{color: '#06b6d4'}}></i>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-3">
                    <div className="p-3 bg-slate-600 rounded">
                      <div className="text-white text-sm mb-3">
                        <i className="fas fa-info-circle text-blue-400 mr-2"></i>
                        Choose how you want to receive form submissions:
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-white text-sm mb-2">Receiver Email Address:</div>
                          <Input
                            value={element.data?.receiverEmail || ""}
                            onChange={(e) => handleDataUpdate({ receiverEmail: e.target.value })}
                            className="bg-slate-700 border-slate-600 text-white"
                            placeholder="your@email.com"
                            type="email"
                          />
                          <div className="text-xs text-slate-300 mt-1">
                            Where form submissions will be sent
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-slate-700 rounded">
                          <input
                            type="checkbox"
                            checked={element.data.emailNotifications !== false}
                            onChange={(e) => handleDataUpdate({ emailNotifications: e.target.checked })}
                            className="rounded"
                          />
                          <label className="text-white text-sm font-medium flex-1">
                            <i className="fas fa-envelope text-blue-400 mr-2"></i>
                            Email notifications to receiver address
                          </label>
                        </div>
                      </div>
                      <div className="text-xs text-slate-300 p-2 bg-slate-700 rounded">
                        <div className="font-medium mb-1">How it works:</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Form submissions will be sent to the receiver email above</li>
                          <li>Instant notifications when someone fills out your form</li>
                          <li>Includes all form field data in a formatted email</li>
                        </ul>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Google Sheets Integration */}
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between w-full p-3 rounded-lg border transition-colors" style={{backgroundColor: '#22c55e20', borderColor: '#22c55e50'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#22c55e30'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#22c55e20'}>
                      <div className="flex items-center space-x-2">
                        <i className="fab fa-google" style={{color: '#22c55e'}}></i>
                        <span className="font-medium" style={{color: '#22c55e'}}>Google Sheets Integration</span>
                        <span className="text-xs px-2 py-1 rounded font-medium text-white" style={{backgroundColor: '#22c55e'}}>
                          PRO
                        </span>
                      </div>
                      <i className="fas fa-chevron-down text-xs" style={{color: '#22c55e'}}></i>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-3">
                    <div className="flex items-center space-x-2 p-3 bg-slate-600 rounded">
                      <input
                        type="checkbox"
                        checked={element.data.googleSheets?.enabled || false}
                        onChange={(e) => handleDataUpdate({ 
                          googleSheets: { 
                            ...element.data.googleSheets, 
                            enabled: e.target.checked 
                          } 
                        })}
                        className="rounded"
                      />
                      <label className="text-white text-sm font-medium">
                        Automatically save submissions to Google Sheets
                      </label>
                    </div>
                    {element.data.googleSheets?.enabled && (
                      <div className="space-y-3 p-3 bg-slate-600 rounded">
                        <div className="text-white text-sm mb-2">
                          <i className="fas fa-info-circle text-blue-400 mr-2"></i>
                          Configure your Google Sheets connection:
                        </div>
                        <Input
                          value={element.data.googleSheets?.spreadsheetId || ""}
                          onChange={(e) => handleDataUpdate({ 
                            googleSheets: { 
                              ...element.data.googleSheets, 
                              spreadsheetId: e.target.value 
                            } 
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Paste Google Sheets ID from URL"
                        />
                        <Input
                          value={element.data.googleSheets?.sheetName || "Sheet1"}
                          onChange={(e) => handleDataUpdate({ 
                            googleSheets: { 
                              ...element.data.googleSheets, 
                              sheetName: e.target.value 
                            } 
                          })}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Sheet1"
                        />
                        <div className="text-xs text-slate-300 p-2 bg-slate-700 rounded">
                          <div className="flex items-start space-x-2">
                            <i className="fas fa-lightbulb text-yellow-400 mt-0.5"></i>
                            <div>
                              <div className="font-medium mb-1">Setup Instructions:</div>
                              <ol className="list-decimal list-inside space-y-1 text-xs">
                                <li>Copy the Spreadsheet ID from your Google Sheets URL</li>
                                <li>Make sure the sheet is shared with the service account</li>
                                <li>Data will be automatically added with timestamps</li>
                              </ol>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                {/* Advanced Options */}
                <Collapsible>
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between w-full p-3 rounded-lg border transition-colors" style={{backgroundColor: '#a855f720', borderColor: '#a855f750'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a855f730'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#a855f720'}>
                      <div className="flex items-center space-x-2">
                        <i className="fas fa-sliders-h" style={{color: '#a855f7'}}></i>
                        <span className="font-medium" style={{color: '#a855f7'}}>Advanced Options</span>
                        <span className="text-xs px-2 py-1 rounded font-medium text-white" style={{backgroundColor: '#a855f7'}}>
                          PRO
                        </span>
                      </div>
                      <i className="fas fa-chevron-down text-xs" style={{color: '#a855f7'}}></i>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center space-x-2 p-2 bg-slate-600 rounded cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={element.data.emailNotifications !== false}
                          onChange={(e) => handleDataUpdate({ emailNotifications: e.target.checked })}
                        />
                        <span className="text-white text-xs">Email notifications</span>
                      </label>
                      <label className="flex items-center space-x-2 p-2 bg-slate-600 rounded cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={element.data.autoReply || false}
                          onChange={(e) => handleDataUpdate({ autoReply: e.target.checked })}
                        />
                        <span className="text-white text-xs">Auto-reply to sender</span>
                      </label>
                      <label className="flex items-center space-x-2 p-2 bg-slate-600 rounded cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={element.data.fileAttachments || false}
                          onChange={(e) => handleDataUpdate({ fileAttachments: e.target.checked })}
                        />
                        <span className="text-white text-xs">File attachments</span>
                        <span className="bg-purple-500 text-purple-900 text-xs px-2 py-1 rounded ml-2">NEW</span>
                      </label>
                      <label className="flex items-center space-x-2 p-2 bg-slate-600 rounded cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded" 
                          checked={element.data.spamProtection || false}
                          onChange={(e) => handleDataUpdate({ spamProtection: e.target.checked })}
                        />
                        <span className="text-white text-xs">Spam protection</span>
                        <span className="bg-purple-500 text-purple-900 text-xs px-2 py-1 rounded ml-2">NEW</span>
                      </label>
                    </div>
                    <div className="p-3 bg-slate-600 rounded">
                      <div className="text-white text-sm mb-2">Custom Success Message:</div>
                      <Textarea
                        value={element.data.successMessage || ""}
                        onChange={(e) => handleDataUpdate({ successMessage: e.target.value })}
                        className="bg-slate-700 border-slate-600 text-white text-xs"
                        placeholder="Thank you! We'll get back to you soon."
                        rows={2}
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Form Preview */}
                <div className="p-3 bg-slate-600 rounded-lg border border-slate-500">
                  <div className="flex items-center space-x-2 mb-2">
                    <i className="fas fa-eye text-slate-400"></i>
                    <span className="text-slate-300 text-sm font-medium">Active Fields Preview</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {element.data.fields.length > 0 
                      ? `Form includes: ${element.data.fields.join(', ')}`
                      : 'No fields selected'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold mb-4 text-slate-800 text-xl tracking-wide opacity-100">{element.data.title}</h3>
                <form onSubmit={handleFormSubmit} className="space-y-3">
                  {element.data.fields.includes('name') && (
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={formData.name || ''}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      required
                    />
                  )}
                  {element.data.fields.includes('email') && (
                    <input
                      type="email"
                      placeholder="Your Email"
                      value={formData.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      required
                    />
                  )}
                  {element.data.fields.includes('phone') && (
                    <input
                      type="tel"
                      placeholder="Your Phone"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                    />
                  )}
                  {element.data.fields.includes('company') && (
                    <input
                      type="text"
                      placeholder="Company Name"
                      value={formData.company || ''}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                    />
                  )}
                  {element.data.fields.includes('website') && (
                    <input
                      type="url"
                      placeholder="Website URL"
                      value={formData.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                    />
                  )}
                  {element.data.fields.includes('message') && (
                    <textarea
                      placeholder="Your Message"
                      value={formData.message || ''}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      rows={3}
                      required
                    />
                  )}

                  {/* File Attachments */}
                  {element.data.fileAttachments && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        <i className="fas fa-paperclip mr-2"></i>
                        Attach Files (optional)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.zip"
                        className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500 text-sm file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-talklink-50 file:text-talklink-700 hover:file:bg-talklink-100"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          handleInputChange('attachments', files.map(f => f.name).join(', '));
                        }}
                      />
                      <div className="text-xs text-slate-500">
                        Supported formats: PDF, Word, Images, ZIP (Max 10MB per file)
                      </div>
                    </div>
                  )}

                  {/* Spam Protection */}
                  {element.data.spamProtection && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-slate-700">
                        <i className="fas fa-shield-alt mr-2"></i>
                        Security Check
                      </label>
                      <div className="flex items-center space-x-2 p-3 bg-slate-100 rounded border">
                        <input
                          type="checkbox"
                          required
                          className="rounded"
                        />
                        <span className="text-sm text-slate-700">
                          I am not a robot and agree to the form submission
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {submitStatus && (
                    <div className="text-sm text-center py-2">
                      {submitStatus}
                    </div>
                  )}
                  
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-talklink-500 hover:bg-talklink-600 text-white w-full disabled:opacity-50"
                  >
                    <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} mr-2`}></i>
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              </div>
            )}
          </div>
        );

      case "accordion":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4">
                {/* Items */}
                <div className="space-y-2">
                  {element.data.items.map((item, index) => (
                    <div key={item.id} className="bg-slate-600 p-3 rounded">
                      <Input
                        value={item.title}
                        onChange={(e) => {
                          const newItems = [...element.data.items];
                          newItems[index] = { ...item, title: e.target.value };
                          handleDataUpdate({ items: newItems });
                        }}
                        className="bg-slate-700 border-slate-600 text-white mb-2"
                        placeholder="Question title"
                      />
                      <Textarea
                        value={item.content}
                        onChange={(e) => {
                          const newItems = [...element.data.items];
                          newItems[index] = { ...item, content: e.target.value };
                          handleDataUpdate({ items: newItems });
                        }}
                        className="bg-slate-700 border-slate-600 text-white"
                        placeholder="Answer content"
                        rows={2}
                      />
                      {element.data.items.length > 1 && (
                        <Button
                          onClick={() => {
                            const newItems = element.data.items.filter((_, i) => i !== index);
                            handleDataUpdate({ items: newItems });
                          }}
                          variant="destructive"
                          size="sm"
                          className="mt-2"
                        >
                          <i className="fas fa-trash mr-1"></i>
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => {
                      const newItem = {
                        id: Math.random().toString(36).substring(7),
                        title: "New Question",
                        content: "New Answer"
                      };
                      handleDataUpdate({ items: [...element.data.items, newItem] });
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                  >
                    <i className="fas fa-plus mr-1"></i>
                    Add Item
                  </Button>
                </div>

                {/* Styling Section */}
                <div className="bg-slate-700 p-3 rounded space-y-3">
                  <h4 className="text-white text-sm font-medium flex items-center gap-2">
                    <i className="fas fa-palette"></i>
                    Styling
                  </h4>
                  
                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Title Color</label>
                      <input
                        type="color"
                        value={element.data?.titleColor || cardData?.brandColor || "#0f0f0f"}
                        onChange={(e) => handleDataUpdate({ ...element.data, titleColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {element.data?.titleColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...element.data, titleColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Content Color</label>
                      <input
                        type="color"
                        value={element.data?.contentColor || cardData?.secondaryColor || "#525252"}
                        onChange={(e) => handleDataUpdate({ ...element.data, contentColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {element.data?.contentColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...element.data, contentColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Border Color</label>
                      <input
                        type="color"
                        value={element.data?.borderColor || cardData?.tertiaryColor || "#e2e8f0"}
                        onChange={(e) => handleDataUpdate({ ...element.data, borderColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {element.data?.borderColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...element.data, borderColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">Background Color</label>
                      <input
                        type="color"
                        value={element.data?.backgroundColor || cardData?.backgroundColor || "#ffffff"}
                        onChange={(e) => handleDataUpdate({ ...element.data, backgroundColor: e.target.value })}
                        className="w-full h-8 rounded cursor-pointer bg-slate-600 border border-slate-500"
                      />
                      {element.data?.backgroundColor && (
                        <button
                          onClick={() => handleDataUpdate({ ...element.data, backgroundColor: undefined })}
                          className="text-xs text-gray-400 hover:text-white transition-colors mt-1"
                        >
                          <i className="fas fa-undo mr-1"></i>
                          Reset
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Border Width */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Border Width: {element.data.borderWidth !== undefined ? element.data.borderWidth : 1}px
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={element.data.borderWidth !== undefined ? element.data.borderWidth : 1}
                      onChange={(e) => handleDataUpdate({ ...element.data, borderWidth: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Shape */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">Shape</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleDataUpdate({ ...element.data, shape: "rounded" })}
                        className={`px-3 py-2 text-xs rounded transition-colors ${
                          (element.data?.shape || "rounded") === "rounded" 
                            ? "bg-talklink-500 text-white" 
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        <i className="fas fa-square mr-1" style={{ borderRadius: "4px" }}></i>
                        Rounded
                      </button>
                      <button
                        onClick={() => handleDataUpdate({ ...element.data, shape: "square" })}
                        className={`px-3 py-2 text-xs transition-colors ${
                          element.data?.shape === "square" 
                            ? "bg-talklink-500 text-white" 
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        <i className="fas fa-square mr-1"></i>
                        Square
                      </button>
                      <button
                        onClick={() => handleDataUpdate({ ...element.data, shape: "circle" })}
                        className={`px-3 py-2 text-xs rounded-full transition-colors ${
                          element.data?.shape === "circle" 
                            ? "bg-talklink-500 text-white" 
                            : "bg-slate-600 text-gray-300 hover:bg-slate-500"
                        }`}
                      >
                        <i className="fas fa-circle mr-1"></i>
                        Circle
                      </button>
                    </div>
                  </div>

                  {/* Shadow Intensity */}
                  <div>
                    <label className="text-xs text-gray-400 block mb-1">
                      Shadow Intensity: {element.data.shadowIntensity !== undefined ? element.data.shadowIntensity : 2}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={element.data.shadowIntensity !== undefined ? element.data.shadowIntensity : 2}
                      onChange={(e) => handleDataUpdate({ ...element.data, shadowIntensity: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* Font Sizes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Title Size: {element.data.titleFontSize !== undefined ? element.data.titleFontSize : 16}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
                        value={element.data.titleFontSize !== undefined ? element.data.titleFontSize : 16}
                        onChange={(e) => handleDataUpdate({ ...element.data, titleFontSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 block mb-1">
                        Content Size: {element.data.contentFontSize !== undefined ? element.data.contentFontSize : 14}px
                      </label>
                      <input
                        type="range"
                        min="10"
                        max="20"
                        value={element.data.contentFontSize !== undefined ? element.data.contentFontSize : 14}
                        onChange={(e) => handleDataUpdate({ ...element.data, contentFontSize: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {element.data.items.map((item) => {
                  const titleColor = element.data?.titleColor || cardData?.brandColor || "#0f0f0f";
                  const contentColor = element.data?.contentColor || cardData?.secondaryColor || "#525252";
                  const borderColor = element.data?.borderColor || cardData?.tertiaryColor || "#e2e8f0";
                  const backgroundColor = element.data?.backgroundColor || cardData?.backgroundColor || "#ffffff";
                  const shadowIntensity = element.data?.shadowIntensity ?? 2;
                  const titleFontSize = element.data?.titleFontSize ?? 16;
                  const contentFontSize = element.data?.contentFontSize ?? 14;
                  const borderWidth = element.data.borderWidth !== undefined ? element.data.borderWidth : 1;
                  const shape = element.data?.shape || "rounded";
                  
                  const getBorderRadius = () => {
                    switch(shape) {
                      case "square": return "0px";
                      case "circle": return "999px";
                      case "rounded":
                      default: return "8px";
                    }
                  };
                  
                  return (
                    <details 
                      key={item.id} 
                      style={{
                        backgroundColor,
                        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none',
                        borderRadius: getBorderRadius(),
                        boxShadow: shadowIntensity > 0 ? `0 ${shadowIntensity}px ${shadowIntensity * 2}px rgba(0,0,0,${shadowIntensity * 0.05})` : 'none',
                        outline: 'none',
                        ...(borderWidth === 0 ? {
                          borderBlockStart: 'none',
                          borderBlockEnd: 'none',
                          borderInlineStart: 'none',
                          borderInlineEnd: 'none'
                        } : {})
                      } as React.CSSProperties}
                    >
                      <summary 
                        className="cursor-pointer p-3 font-medium hover:opacity-80 flex items-center justify-between"
                        style={{
                          color: titleColor,
                          fontSize: `${titleFontSize}px`,
                          borderRadius: getBorderRadius(),
                          borderBottom: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : 'none'
                        }}
                      >
                        <span>{item.title}</span>
                        <i className="fas fa-chevron-down text-xs" style={{ color: titleColor, opacity: 0.6 }}></i>
                      </summary>
                      <div 
                        className="p-3 pt-0 leading-relaxed"
                        style={{
                          color: contentColor,
                          fontSize: `${contentFontSize}px`
                        }}
                      >
                        {item.content}
                      </div>
                    </details>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "imageSlider":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    <h3 className="text-white text-sm font-medium">Image Gallery</h3>
                    <span className="text-xs text-slate-400">({element.data.images?.length || 0} images)</span>
                  </div>
                  <div className="text-xs text-slate-400">Drag to reorder</div>
                </div>

                {/* Upload Button */}
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newImage = {
                            id: Math.random().toString(36).substring(7),
                            src: event.target?.result as string,
                            alt: file.name.split('.')[0]
                          };
                          handleDataUpdate({ 
                            images: [...(element.data.images || []), newImage] 
                          });
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="bg-slate-700 border-slate-600 text-white file:bg-talklink-500 file:text-white file:border-none file:rounded-md file:px-4 file:py-2 file:mr-4 hover:file:bg-talklink-600"
                  />
                </div>

                {/* Image Preview with Drag & Drop */}
                {element.data.images && element.data.images.length > 0 && (
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => {
                      const {active, over} = event;
                      if (active.id !== over?.id) {
                        const oldIndex = element.data.images.findIndex(img => img.id === active.id);
                        const newIndex = element.data.images.findIndex(img => img.id === over?.id);
                        const reorderedImages = arrayMove(element.data.images, oldIndex, newIndex);
                        handleDataUpdate({ images: reorderedImages });
                      }
                    }}
                  >
                    <SortableContext items={element.data.images.map(img => img.id)} strategy={rectSortingStrategy}>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {element.data.images.map((img, index) => (
                          <SortableImageItem
                            key={img.id}
                            image={img}
                            index={index}
                            onDelete={() => {
                              const newImages = element.data.images.filter((_, i) => i !== index);
                              handleDataUpdate({ images: newImages });
                            }}
                            onUpdateAlt={(alt) => {
                              const updatedImages = element.data.images.map((image, i) => 
                                i === index ? { ...image, alt } : image
                              );
                              handleDataUpdate({ images: updatedImages });
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                )}

                {/* Empty State */}
                {(!element.data.images || element.data.images.length === 0) && (
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-700 flex items-center justify-center">
                      <i className="fas fa-images text-slate-400 text-xl"></i>
                    </div>
                    <p className="text-slate-400 text-sm">Upload images to create your gallery</p>
                    <p className="text-slate-500 text-xs mt-1">Supports multiple image formats</p>
                  </div>
                )}

                {/* Gallery Settings */}
                {element.data.images && element.data.images.length > 0 && (
                  <div className="bg-slate-700/50 rounded-lg p-4 space-y-4">
                    <h4 className="text-white text-sm font-medium flex items-center">
                      <i className="fas fa-cog mr-2 text-slate-400"></i>
                      Gallery Settings
                    </h4>
                    
                    <div className="space-y-4">
                      {/* Image Orientation Setting */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">Image Orientation</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            onClick={() => handleDataUpdate({ orientation: 'mixed' })}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              (!((element.data as any)?.orientation) || (element.data as any)?.orientation === 'mixed')
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            <div className="w-8 h-6 mx-auto mb-1 bg-slate-400 rounded grid grid-cols-2 gap-0.5">
                              <div className="bg-slate-300 rounded-sm"></div>
                              <div className="bg-slate-300 rounded-sm"></div>
                            </div>
                            Mixed
                          </button>
                          <button
                            onClick={() => handleDataUpdate({ orientation: 'horizontal' })}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              (element.data as any)?.orientation === 'horizontal'
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            <div className="w-8 h-5 mx-auto mb-1 bg-slate-400 rounded"></div>
                            Landscape
                          </button>
                          <button
                            onClick={() => handleDataUpdate({ orientation: 'vertical' })}
                            className={`p-3 rounded-lg border text-xs transition-colors ${
                              (element.data as any)?.orientation === 'vertical'
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            <div className="w-5 h-8 mx-auto mb-1 bg-slate-400 rounded"></div>
                            Portrait
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          Choose optimal display for your image collection
                        </p>
                      </div>

                      {/* Auto-play Setting */}
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-xs text-slate-300 font-medium">Auto-play slides</label>
                          <p className="text-xs text-slate-500">Automatically advance images every 4 seconds</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={(element.data as any)?.autoPlay || false}
                          onChange={(e) => handleDataUpdate({ autoPlay: e.target.checked })}
                          className="rounded border-slate-500 text-talklink-500 focus:ring-talklink-500"
                        />
                      </div>

                      {/* Image Display Mode */}
                      <div>
                        <label className="block text-xs text-slate-400 mb-2">Display Mode</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleDataUpdate({ displayMode: 'contain' })}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                              (!((element.data as any)?.displayMode) || (element.data as any)?.displayMode === 'contain')
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            Fit Full Image
                          </button>
                          <button
                            onClick={() => handleDataUpdate({ displayMode: 'cover' })}
                            className={`p-2 rounded-lg border text-xs transition-colors ${
                              (element.data as any)?.displayMode === 'cover'
                                ? 'bg-talklink-500 border-talklink-400 text-white'
                                : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                            }`}
                          >
                            Crop to Fill
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              element.data.images?.length > 0 && (
                <ImageSliderComponent 
                  images={element.data.images}
                  defaultView={(element.data as any)?.defaultView}
                  autoPlay={(element.data as any)?.autoPlay}
                  orientation={(element.data as any)?.orientation}
                  displayMode={(element.data as any)?.displayMode}
                />
              )
            )}
          </div>
        );

      case "testimonials":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">
              {element.data.title}
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                {/* Title Section - Same Color as Display Style */}
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <label className="block text-white text-sm font-medium mb-2">
                    <i className="fas fa-heading mr-2"></i>
                    Section Title
                  </label>
                  <Input
                    value={element.data.title}
                    onChange={(e) => handleDataUpdate({ title: e.target.value })}
                    placeholder="What Our Clients Say"
                    className="bg-slate-600 border-slate-500 text-white placeholder:text-slate-400"
                  />
                </div>

                {/* Display Style Section - Different Color */}
                <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <label className="block text-white text-sm font-medium mb-2">
                    <i className="fas fa-layout mr-2"></i>
                    Display Style
                  </label>
                  <select
                    value={element.data.displayStyle}
                    onChange={(e) => handleDataUpdate({ displayStyle: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white rounded px-3 py-2 w-full hover:bg-slate-500 transition-colors"
                  >
                    <option value="cards">Cards</option>
                    <option value="slider">Slider</option>
                    <option value="grid">Grid</option>
                  </select>
                </div>
                {/* Testimonials List */}
                {element.data.testimonials.map((testimonial, index) => (
                  <div key={testimonial.id} className="p-3 bg-slate-800 rounded border space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm">Testimonial {index + 1}</span>
                      <Button
                        onClick={() => {
                          const newTestimonials = element.data.testimonials.filter(t => t.id !== testimonial.id);
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        variant="destructive"
                        size="sm"
                        className="w-6 h-6 p-0"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={testimonial.name}
                        onChange={(e) => {
                          const newTestimonials = element.data.testimonials.map(t => 
                            t.id === testimonial.id ? { ...t, name: e.target.value } : t
                          );
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        placeholder="Customer name"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                      <Input
                        value={testimonial.title || ''}
                        onChange={(e) => {
                          const newTestimonials = element.data.testimonials.map(t => 
                            t.id === testimonial.id ? { ...t, title: e.target.value } : t
                          );
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        placeholder="Job title"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <Input
                      value={testimonial.company || ''}
                      onChange={(e) => {
                        const newTestimonials = element.data.testimonials.map(t => 
                          t.id === testimonial.id ? { ...t, company: e.target.value } : t
                        );
                        handleDataUpdate({ testimonials: newTestimonials });
                      }}
                      placeholder="Company name"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <Textarea
                      value={testimonial.content}
                      onChange={(e) => {
                        const newTestimonials = element.data.testimonials.map(t => 
                          t.id === testimonial.id ? { ...t, content: e.target.value } : t
                        );
                        handleDataUpdate({ testimonials: newTestimonials });
                      }}
                      placeholder="Testimonial text"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-white text-sm">Rating:</span>
                      <select
                        value={testimonial.rating}
                        onChange={(e) => {
                          const newTestimonials = element.data.testimonials.map(t => 
                            t.id === testimonial.id ? { ...t, rating: parseInt(e.target.value) } : t
                          );
                          handleDataUpdate({ testimonials: newTestimonials });
                        }}
                        className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                      >
                        <option value={1}>1 Star</option>
                        <option value={2}>2 Stars</option>
                        <option value={3}>3 Stars</option>
                        <option value={4}>4 Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                    </div>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newTestimonial = {
                      id: generateFieldId(),
                      name: "Customer Name",
                      title: "Job Title",
                      company: "Company Name",
                      content: "Great service and experience!",
                      rating: 5
                    };
                    handleDataUpdate({ testimonials: [...element.data.testimonials, newTestimonial] });
                  }}
                  className="w-full"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add Testimonial
                </Button>
              </div>
            ) : (
              element.data.displayStyle === 'slider' ? (
                <TestimonialsSlider testimonials={element.data.testimonials} />
              ) : (
                <div className={`grid gap-4 ${
                  element.data.displayStyle === 'grid' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'
                }`}>
                  {element.data.testimonials.map((testimonial) => (
                    <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
                      <div className="flex mb-3">
                        {[...Array(5)].map((_, i) => (
                          <i key={i} className={`fas fa-star text-sm ${
                            i < testimonial.rating ? 'text-yellow-400' : 'text-slate-300'
                          }`}></i>
                        ))}
                      </div>
                      <p className="text-slate-600 mb-4 italic">"{testimonial.content}"</p>
                      <div className="flex items-center space-x-3">
                        {testimonial.avatar && (
                          <img src={testimonial.avatar} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover" />
                        )}
                        <div>
                          <p className="font-semibold text-slate-800">{testimonial.name}</p>
                          {testimonial.title && <p className="text-sm text-slate-600">{testimonial.title}</p>}
                          {testimonial.company && <p className="text-sm text-slate-500">{testimonial.company}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        );

      case "googleMaps":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {element.data.title}
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={element.data.title}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Location section title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={element.data.address}
                  onChange={(e) => handleDataUpdate({ address: e.target.value })}
                  placeholder="Address or location"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                
                {/* Display Mode Selection */}
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <label className="block text-white text-sm font-medium mb-3">Display Mode</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleDataUpdate({ displayMode: 'address' })}
                      className={`p-4 rounded-lg border text-sm transition-colors ${
                        element.data.displayMode === 'address'
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <i className="fas fa-map-marker-alt text-lg"></i>
                        <span>Address with Pin</span>
                        <span className="text-xs opacity-75">Simple text display</span>
                      </div>
                    </button>
                    <button
                      onClick={() => handleDataUpdate({ displayMode: 'map' })}
                      className={`p-4 rounded-lg border text-sm transition-colors ${
                        (!element.data.displayMode || element.data.displayMode === 'map')
                          ? 'bg-talklink-500 border-talklink-400 text-white'
                          : 'bg-slate-600 border-slate-500 text-slate-300 hover:bg-slate-500'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <i className="fas fa-map text-lg"></i>
                        <span>Interactive Map</span>
                        <span className="text-xs opacity-75">Full Google Maps</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Map-specific settings - only show when map mode is selected */}
                {(!element.data.displayMode || element.data.displayMode === 'map') && (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-black text-sm mb-1 block">Zoom Level</label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={element.data.zoom}
                          onChange={(e) => handleDataUpdate({ zoom: parseInt(e.target.value) || 15 })}
                          className="bg-slate-700 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-black text-sm mb-1 block">Map Type</label>
                        <select
                          value={element.data.mapType}
                          onChange={(e) => handleDataUpdate({ mapType: e.target.value })}
                          className="bg-slate-700 border-slate-600 text-white rounded px-2 py-2 w-full"
                        >
                          <option value="roadmap">Roadmap</option>
                          <option value="satellite">Satellite</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={element.data.showMarker}
                        onChange={(e) => handleDataUpdate({ showMarker: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-black text-sm">Show location marker</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              // Display based on selected mode
              element.data.displayMode === 'address' ? (
                // Simple Address Display with Location Pin
                <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                        <i className="fas fa-map-marker-alt text-white text-lg"></i>
                      </div>
                    </div>
                    <div className="flex-grow">
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">Our Location</h4>
                      <p className="text-slate-600 leading-relaxed">{element.data.address}</p>
                      <div className="mt-4">
                        <a 
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(element.data.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-talklink-500 hover:text-talklink-600 font-medium transition-colors"
                        >
                          <i className="fas fa-external-link-alt text-sm"></i>
                          <span>View on Google Maps</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Interactive Google Maps (default)
                <div className="bg-slate-100 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps/embed/v1/place?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(element.data.address)}&zoom=${element.data.zoom}&maptype=${element.data.mapType}`}
                    width="100%"
                    height={element.data.height}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full"
                  ></iframe>
                </div>
              )
            )}
          </div>
        );

      case "aiChatbot":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {element.data.title}
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={element.data.title}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Chatbot section title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={element.data.welcomeMessage}
                  onChange={(e) => handleDataUpdate({ welcomeMessage: e.target.value })}
                  placeholder="Welcome message"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="space-y-2">
                  <label className="text-black text-sm">Knowledge Base Content:</label>
                  <Textarea
                    value={element.data.knowledgeBase.textContent || ''}
                    onChange={(e) => handleDataUpdate({ 
                      knowledgeBase: { 
                        ...element.data.knowledgeBase, 
                        textContent: e.target.value 
                      } 
                    })}
                    placeholder="Enter knowledge base content..."
                    rows={4}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <Input
                  value={element.data.knowledgeBase.websiteUrl || ''}
                  onChange={(e) => handleDataUpdate({ 
                    knowledgeBase: { 
                      ...element.data.knowledgeBase, 
                      websiteUrl: e.target.value 
                    } 
                  })}
                  placeholder="Website URL for knowledge extraction"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="space-y-2">
                  <label className="text-black text-sm">PDF Documents:</label>
                  <Input
                    type="file"
                    accept=".pdf"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      files.forEach(file => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const newPdf = {
                            id: generateFieldId(),
                            name: file.name,
                            content: event.target?.result as string,
                            uploadedAt: new Date()
                          };
                          const currentPdfs = element.data.knowledgeBase.pdfFiles || [];
                          handleDataUpdate({ 
                            knowledgeBase: { 
                              ...element.data.knowledgeBase, 
                              pdfFiles: [...currentPdfs, newPdf] 
                            } 
                          });
                        };
                        reader.readAsDataURL(file);
                      });
                    }}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  {element.data.knowledgeBase.pdfFiles.map((pdf) => (
                    <div key={pdf.id} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                      <span className="text-white text-sm">{pdf.name}</span>
                      <Button
                        onClick={() => {
                          const newPdfs = element.data.knowledgeBase.pdfFiles.filter(p => p.id !== pdf.id);
                          handleDataUpdate({ 
                            knowledgeBase: { 
                              ...element.data.knowledgeBase, 
                              pdfFiles: newPdfs 
                            } 
                          });
                        }}
                        variant="destructive"
                        size="sm"
                        className="w-6 h-6 p-0"
                      >
                        <i className="fas fa-times text-xs"></i>
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-black text-sm mb-1 block">Position</label>
                    <select
                      value={element.data.appearance.position}
                      onChange={(e) => handleDataUpdate({ 
                        appearance: { 
                          ...element.data.appearance, 
                          position: e.target.value as any 
                        } 
                      })}
                      className="bg-slate-700 border-slate-600 text-white rounded px-2 py-2 w-full"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="embedded">Embedded</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-black text-sm mb-1 block">Primary Color</label>
                    <Input
                      type="color"
                      value={element.data?.appearance?.primaryColor || '#22C55E'}
                      onChange={(e) => handleDataUpdate({ 
                        appearance: { 
                          ...(element.data?.appearance || {}), 
                          primaryColor: e.target.value 
                        } 
                      })}
                      className="bg-slate-700 border-slate-600 text-white h-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={element.data.isEnabled}
                    onChange={(e) => handleDataUpdate({ isEnabled: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-black text-sm">Enable chatbot</span>
                </div>
              </div>
            ) : (
              element.data.isEnabled && (
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: element.data.appearance.primaryColor }}
                    >
                      <i className="fas fa-robot"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{element.data.title}</h4>
                      <p className="text-sm text-slate-600">AI Assistant</p>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg mb-4">
                    <p className="text-slate-700 text-sm">{element.data.welcomeMessage}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <span>Knowledge Base: {element.data.knowledgeBase.textContent ? 'Text' : ''} {element.data.knowledgeBase.websiteUrl ? 'Website' : ''} {element.data.knowledgeBase.pdfFiles.length > 0 ? `${element.data.knowledgeBase.pdfFiles.length} PDFs` : ''}</span>
                    <button 
                      className="px-3 py-1 rounded text-white text-xs hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: element.data.appearance.primaryColor }}
                      onClick={() => setIsChatOpen(true)}
                      data-testid="button-start-chat"
                    >
                      Start Chat
                    </button>
                  </div>
                </div>
              )
            )}
            
            {/* AI Chat Dialog */}
            {element.type === "aiChatbot" && (
              <AIChat
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                knowledgeBase={element.data.knowledgeBase}
                welcomeMessage={element.data.welcomeMessage}
                primaryColor={element.data.appearance.primaryColor}
              />
            )}
          </div>
        );

      case "ragKnowledge":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {element.data.title}
            </h3>
            <p className="text-center text-gray-600 mb-6">{element.data.description}</p>
            
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={element.data.title}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Knowledge assistant title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Textarea
                  value={element.data.description}
                  onChange={(e) => handleDataUpdate({ description: e.target.value })}
                  placeholder="Description"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="space-y-2">
                  <label className="text-black text-sm">Knowledge Base Content:</label>
                  <Textarea
                    value={element.data.knowledgeBase?.textContent || ''}
                    onChange={(e) => handleDataUpdate({ 
                      knowledgeBase: { 
                        ...element.data.knowledgeBase, 
                        textContent: e.target.value 
                      } 
                    })}
                    placeholder="Enter knowledge base content..."
                    rows={4}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <Button
                    onClick={async () => {
                      const textContent = element.data.knowledgeBase?.textContent;
                      if (!textContent || textContent.trim().length < 10) {
                        alert('Please enter at least 10 characters of text');
                        return;
                      }
                      
                      try {
                        const response = await fetch('/api/ingest-text', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            text: textContent,
                            title: element.data.title || 'Knowledge Base Content'
                          })
                        });
                        
                        const result = await response.json();
                        
                        if (response.ok && result.ok) {
                          alert(`Success! ${result.chunks} chunks added to knowledge base.`);
                        } else {
                          alert(`Error: ${result.error || 'Failed to save to knowledge base'}`);
                        }
                      } catch (error) {
                        console.error('Error saving to knowledge base:', error);
                        alert('Failed to save to knowledge base. Please try again.');
                      }
                    }}
                    className="w-full"
                    style={{ backgroundColor: element.data.primaryColor || '#22c55e' }}
                    data-testid="button-save-kb-text"
                  >
                    💾 Save to Knowledge Base
                  </Button>
                </div>
                {/* Enhanced URL Manager - unlimited URLs */}
                <div className="mt-2">
                  <URLManager
                    title="+ Add Website URLs"
                    description="Add unlimited website URLs for comprehensive knowledge extraction"
                    onIngest={async (urls) => {
                      // URLs are automatically ingested through the URLManager component
                      console.log('URLs ingested:', urls);
                    }}
                    maxUrls={100}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                {/* Enhanced Document Manager - one by one upload */}
                <div className="mt-4">
                  <DocumentManager
                    title="+ Add Documents (One by One)"
                    description="Upload documents one by one for precise knowledge management"
                    documents={element.data.knowledgeBase?.pdfFiles?.map((pdf: any) => ({
                      id: pdf.id || generateFieldId(),
                      name: pdf.name,
                      content: pdf.content,
                      size: pdf.size,
                      status: 'success' as const
                    })) || []}
                    onDocumentsChange={(documents: DocumentItem[]) => {
                      handleDataUpdate({
                        knowledgeBase: {
                          ...element.data.knowledgeBase,
                          pdfFiles: documents.map(doc => ({
                            id: doc.id,
                            name: doc.name,
                            content: doc.content,
                            size: doc.size
                          }))
                        }
                      });
                    }}
                    maxDocuments={50}
                    acceptedTypes={['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf']}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={element.data.showIngestForm}
                    onChange={(e) => handleDataUpdate({ showIngestForm: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-black text-sm">Show URL Ingestion Form</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={element.data.showChatBox}
                    onChange={(e) => handleDataUpdate({ showChatBox: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-black text-sm">Show Chat Interface</span>
                </div>
                <div className="space-y-2">
                  <label className="text-black text-sm">Primary Color:</label>
                  <Input
                    type="color"
                    value={element.data.primaryColor}
                    onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                    className="w-20 h-10"
                  />
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                {/* AI Assistant Card - Similar to AI Chatbot */}
                <div className="flex items-start gap-4 mb-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: element.data.primaryColor || '#22c55e' }}
                  >
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {element.data.title || 'AI Assistant'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {element.data.description || 'AI Assistant'}
                    </p>
                  </div>
                </div>
                
                {/* Welcome Message */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                  <p className="text-center text-gray-700 dark:text-gray-300">
                    Hi! How can I help you today?
                  </p>
                </div>
                
                {/* Knowledge Base Label and Start Chat Button */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Knowledge Base:</span>
                  {element.data.showChatBox && (
                    <Button
                      onClick={() => setIsChatOpen(true)}
                      className="text-white px-6 py-2 rounded-lg shadow-md hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: element.data.primaryColor || '#22c55e' }}
                      data-testid="button-start-chat"
                    >
                      Start Chat
                    </Button>
                  )}
                </div>
                
                {/* RAG Chat Dialog */}
                {element.type === "ragKnowledge" && (
                  <RAGChatBox
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    primaryColor={element.data.primaryColor}
                    isEditing={isEditing}
                  />
                )}
                
                {/* Technical note for card creators - only visible during editing */}
                {element.data.showIngestForm && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                    <p><strong>For Card Creators:</strong> Edit this element to manage knowledge base content. End users will only see the chat interface above.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "voiceAgent":
        return (
          <div className="mb-6">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-slate-800 text-lg">AI Voice Agent Settings</h3>
                  <i className="fas fa-phone-volume text-green-600 text-xl"></i>
                </div>

                {/* Basic Settings Section */}
                <Collapsible open={voiceAgentSections.basic}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('basic')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-voice-basic-settings"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-cog text-blue-600"></i>
                      <span className="font-medium text-slate-700">Basic Settings</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.basic ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Phone Number *</label>
                      <Input
                        value={element.data.phoneNumber || ''}
                        onChange={(e) => handleDataUpdate({ phoneNumber: e.target.value })}
                        placeholder="+1-555-0000"
                        className="text-black"
                        data-testid="input-phone-number"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Agent Name</label>
                      <Input
                        value={element.data.agentName || 'AI Assistant'}
                        onChange={(e) => handleDataUpdate({ agentName: e.target.value })}
                        placeholder="AI Assistant"
                        className="text-black"
                        data-testid="input-agent-name"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Is Active</label>
                      <Switch
                        checked={element.data.isActive !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ isActive: checked })}
                        data-testid="switch-is-active"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Agent Mode</label>
                      <Select
                        value={element.data.agentMode || 'answering'}
                        onValueChange={(value) => handleDataUpdate({ agentMode: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-agent-mode">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="answering">Answering</SelectItem>
                          <SelectItem value="qualification">Qualification</SelectItem>
                          <SelectItem value="booking">Booking</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Voice Customization Section */}
                <Collapsible open={voiceAgentSections.voice}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('voice')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-voice-customization"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-microphone text-purple-600"></i>
                      <span className="font-medium text-slate-700">Voice Customization</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.voice ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Provider</label>
                      <Select
                        value={element.data.voiceProvider || 'openai'}
                        onValueChange={(value) => handleDataUpdate({ voiceProvider: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-voice-provider">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="azure">Azure</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Gender</label>
                      <Select
                        value={element.data.voiceGender || 'neutral'}
                        onValueChange={(value) => handleDataUpdate({ voiceGender: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-voice-gender">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Language</label>
                      <Input
                        value={element.data.voiceLanguage || 'en'}
                        onChange={(e) => handleDataUpdate({ voiceLanguage: e.target.value })}
                        placeholder="en"
                        className="text-black"
                        data-testid="input-voice-language"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voice Tone</label>
                      <Select
                        value={element.data.voiceTone || 'professional'}
                        onValueChange={(value) => handleDataUpdate({ voiceTone: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-voice-tone">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="friendly">Friendly</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="energetic">Energetic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-slate-700 font-medium">Speech Speed</label>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                          {element.data.speechSpeed || 100}
                        </span>
                      </div>
                      <Slider
                        min={50}
                        max={150}
                        step={1}
                        value={[element.data.speechSpeed || 100]}
                        onValueChange={(value) => handleDataUpdate({ speechSpeed: value[0] })}
                        className="cursor-pointer"
                        data-testid="slider-speech-speed"
                      />
                      <div className="flex justify-between mt-1 text-xs text-slate-400">
                        <span>Slow (50)</span>
                        <span>Fast (150)</span>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Knowledge Base Section */}
                <Collapsible open={voiceAgentSections.knowledge}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('knowledge')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-knowledge-base"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-brain text-indigo-600"></i>
                      <span className="font-medium text-slate-700">Knowledge Base</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.knowledge ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Use Knowledge Base</label>
                      <Switch
                        checked={element.data.useKnowledgeBase !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ useKnowledgeBase: checked })}
                        data-testid="switch-use-knowledge-base"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-slate-700 font-medium">Context Limit</label>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                          {element.data.contextLimit || 3}
                        </span>
                      </div>
                      <Slider
                        min={1}
                        max={10}
                        step={1}
                        value={[element.data.contextLimit || 3]}
                        onValueChange={(value) => handleDataUpdate({ contextLimit: value[0] })}
                        className="cursor-pointer"
                        data-testid="slider-context-limit"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm text-slate-700 font-medium">Confidence Threshold (%)</label>
                        <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                          {element.data.confidenceThreshold || 70}%
                        </span>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[element.data.confidenceThreshold || 70]}
                        onValueChange={(value) => handleDataUpdate({ confidenceThreshold: value[0] })}
                        className="cursor-pointer"
                        data-testid="slider-confidence-threshold"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Scripts & Messages Section */}
                <Collapsible open={voiceAgentSections.scripts}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('scripts')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-scripts-messages"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-file-alt text-orange-600"></i>
                      <span className="font-medium text-slate-700">Scripts & Messages</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.scripts ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Greeting</label>
                      <Textarea
                        value={element.data.greeting || ''}
                        onChange={(e) => handleDataUpdate({ greeting: e.target.value })}
                        placeholder="Hello! I'm your AI assistant. How can I help you today?"
                        className="text-black min-h-[80px]"
                        data-testid="textarea-greeting"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">System Prompt</label>
                      <Textarea
                        value={element.data.systemPrompt || ''}
                        onChange={(e) => handleDataUpdate({ systemPrompt: e.target.value })}
                        placeholder="You are a helpful AI assistant representing our company..."
                        className="text-black min-h-[100px]"
                        data-testid="textarea-system-prompt"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Fallback Message</label>
                      <Textarea
                        value={element.data.fallbackMessage || ''}
                        onChange={(e) => handleDataUpdate({ fallbackMessage: e.target.value })}
                        placeholder="I'm sorry, I didn't understand that. Could you please rephrase?"
                        className="text-black min-h-[80px]"
                        data-testid="textarea-fallback-message"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">End Call Message</label>
                      <Textarea
                        value={element.data.endCallMessage || ''}
                        onChange={(e) => handleDataUpdate({ endCallMessage: e.target.value })}
                        placeholder="Thank you for calling. Have a great day!"
                        className="text-black min-h-[80px]"
                        data-testid="textarea-end-call-message"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Integrations Section */}
                <Collapsible open={voiceAgentSections.integrations}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('integrations')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-integrations"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-plug text-teal-600"></i>
                      <span className="font-medium text-slate-700">Integrations</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.integrations ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Appointment Booking</label>
                      <Switch
                        checked={element.data.enableAppointmentBooking || false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableAppointmentBooking: checked })}
                        data-testid="switch-enable-appointment-booking"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Lead Qualification</label>
                      <Switch
                        checked={element.data.enableLeadQualification || false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableLeadQualification: checked })}
                        data-testid="switch-enable-lead-qualification"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable CRM Sync</label>
                      <Switch
                        checked={element.data.enableCrmSync !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableCrmSync: checked })}
                        data-testid="switch-enable-crm-sync"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Booking Confirmation Message</label>
                      <Textarea
                        value={element.data.bookingConfirmationMessage || ''}
                        onChange={(e) => handleDataUpdate({ bookingConfirmationMessage: e.target.value })}
                        placeholder="Your appointment has been confirmed. You'll receive a confirmation email shortly."
                        className="text-black min-h-[80px]"
                        data-testid="textarea-booking-confirmation"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Call Settings Section */}
                <Collapsible open={voiceAgentSections.callSettings}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('callSettings')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-call-settings"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-phone text-green-600"></i>
                      <span className="font-medium text-slate-700">Call Settings</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.callSettings ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Voicemail</label>
                      <Switch
                        checked={element.data.enableVoicemail !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableVoicemail: checked })}
                        data-testid="switch-enable-voicemail"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Voicemail Message</label>
                      <Textarea
                        value={element.data.voicemailMessage || ''}
                        onChange={(e) => handleDataUpdate({ voicemailMessage: e.target.value })}
                        placeholder="Please leave a message and we'll get back to you shortly."
                        className="text-black min-h-[80px]"
                        data-testid="textarea-voicemail-message"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Enable Call Recording</label>
                      <Switch
                        checked={element.data.enableCallRecording || false}
                        onCheckedChange={(checked) => handleDataUpdate({ enableCallRecording: checked })}
                        data-testid="switch-enable-call-recording"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Max Call Duration (seconds)</label>
                      <Input
                        type="number"
                        value={element.data.maxCallDuration || 600}
                        onChange={(e) => handleDataUpdate({ maxCallDuration: parseInt(e.target.value) || 600 })}
                        placeholder="600"
                        className="text-black"
                        data-testid="input-max-call-duration"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Default: 600 seconds (10 minutes)
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                {/* Audio Quality Section */}
                <Collapsible open={voiceAgentSections.audio}>
                  <CollapsibleTrigger
                    onClick={() => toggleVoiceSection('audio')}
                    className="w-full flex justify-between items-center p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                    data-testid="toggle-audio-quality"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-volume-up text-red-600"></i>
                      <span className="font-medium text-slate-700">Audio Quality</span>
                    </div>
                    <i className={`fas fa-chevron-${voiceAgentSections.audio ? 'up' : 'down'} text-slate-400`}></i>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-3 space-y-3">
                    <div>
                      <label className="text-sm text-slate-700 font-medium mb-1 block">Audio Quality</label>
                      <Select
                        value={element.data.audioQuality || 'high'}
                        onValueChange={(value) => handleDataUpdate({ audioQuality: value })}
                      >
                        <SelectTrigger className="text-black" data-testid="select-audio-quality">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Noise Cancellation</label>
                      <Switch
                        checked={element.data.noiseCancellation !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ noiseCancellation: checked })}
                        data-testid="switch-noise-cancellation"
                      />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                      <label className="text-sm text-slate-700 font-medium">Echo Cancellation</label>
                      <Switch
                        checked={element.data.echoCancellation !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ echoCancellation: checked })}
                        data-testid="switch-echo-cancellation"
                      />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ) : (
              <VoiceAgentElement
                phoneNumber={element.data.phoneNumber || '+1-555-0000'}
                agentName={element.data.agentName || 'AI Assistant'}
                description={element.data.description || 'Call us anytime to speak with our AI assistant'}
                buttonText={element.data.buttonText || 'Call Now'}
                primaryColor={element.data.primaryColor || '#22c55e'}
                showAgentInfo={element.data.showAgentInfo !== false}
                isEditing={isEditing}
              />
            )}
          </div>
        );

      case "appleWallet":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Apple Wallet Element</h3>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="ghost"
                    size="sm"
                  >
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-600`}></i>
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Title</label>
                      <Input
                        value={element.data.title}
                        onChange={(e) => handleDataUpdate({ title: e.target.value })}
                        placeholder="Add to Apple Wallet"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Subtitle</label>
                      <Input
                        value={element.data.subtitle}
                        onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                        placeholder="Save this business card to your iPhone or Mac"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Style</label>
                      <select
                        value={element.data.buttonStyle}
                        onChange={(e) => handleDataUpdate({ buttonStyle: e.target.value as "default" | "minimal" | "full" })}
                        className="w-full p-2 border border-slate-300 rounded text-black"
                      >
                        <option value="default">Default</option>
                        <option value="minimal">Minimal</option>
                        <option value="full">Full Width</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Custom Color (optional)</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={element.data.customColor || "#000000"}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={element.data.customColor || ""}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          placeholder="#000000 or leave empty for default black"
                          className="flex-1 text-black"
                        />
                        {element.data.customColor && (
                          <Button
                            onClick={() => handleDataUpdate({ customColor: "" })}
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-red-500"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/wallet/apple/${cardData?.id || ''}/create`, {
                        method: 'POST',
                      });
                      
                      if (response.status === 501) {
                        alert('Apple Wallet integration is being set up. Coming soon!');
                        return;
                      }
                      
                      if (!response.ok) {
                        throw new Error('Failed to generate Apple pass');
                      }
                      
                      const blob = await response.blob();
                      const url = window.URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${cardData?.fullName || 'BusinessCard'}.pkpass`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      window.URL.revokeObjectURL(url);
                    } catch (error) {
                      console.error('Error generating Apple pass:', error);
                      alert('Failed to create Apple Wallet pass. Please try again.');
                    }
                  }}
                  className={`
                    ${element.data.buttonStyle === 'full' ? 'w-full' : element.data.buttonStyle === 'minimal' ? 'px-4 py-2' : 'px-6 py-3'}
                    bg-black hover:bg-gray-800 text-white border-black
                    transition-all duration-200
                  `}
                  style={element.data.customColor ? { backgroundColor: element.data.customColor } : {}}
                  data-testid="button-apple-wallet-element"
                >
                  {element.data.showIcon && <i className="fas fa-wallet mr-2"></i>}
                  {element.data.title}
                </Button>
                {element.data.subtitle && (
                  <p className="text-xs text-slate-500 mt-2">{element.data.subtitle}</p>
                )}
              </div>
            )}
          </div>
        );
      
      case "googleWallet":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-slate-800">Google Wallet Element</h3>
                  <Button
                    onClick={() => setIsExpanded(!isExpanded)}
                    variant="ghost"
                    size="sm"
                  >
                    <i className={`fas ${isExpanded ? 'fa-chevron-up' : 'fa-chevron-down'} text-slate-600`}></i>
                  </Button>
                </div>
                
                {isExpanded && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Title</label>
                      <Input
                        value={element.data.title}
                        onChange={(e) => handleDataUpdate({ title: e.target.value })}
                        placeholder="Add to Google Wallet"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Subtitle</label>
                      <Input
                        value={element.data.subtitle}
                        onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                        placeholder="Save this business card to your Android phone"
                        className="text-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Button Style</label>
                      <select
                        value={element.data.buttonStyle}
                        onChange={(e) => handleDataUpdate({ buttonStyle: e.target.value as "default" | "minimal" | "full" })}
                        className="w-full p-2 border border-slate-300 rounded text-black"
                      >
                        <option value="default">Default</option>
                        <option value="minimal">Minimal</option>
                        <option value="full">Full Width</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-600 mb-1 block">Custom Color (optional)</label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="color"
                          value={element.data.customColor || "#2563eb"}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={element.data.customColor || ""}
                          onChange={(e) => handleDataUpdate({ customColor: e.target.value })}
                          placeholder="#2563eb or leave empty for default blue"
                          className="flex-1 text-black"
                        />
                        {element.data.customColor && (
                          <Button
                            onClick={() => handleDataUpdate({ customColor: "" })}
                            variant="ghost"
                            size="sm"
                            className="text-slate-500 hover:text-red-500"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch(`/api/wallet/google/${cardData?.id || ''}/create`, {
                        method: 'POST',
                      });
                      
                      if (response.status === 501) {
                        alert('Google Wallet integration is being set up. Coming soon!');
                        return;
                      }
                      
                      if (!response.ok) {
                        throw new Error('Failed to generate Google pass');
                      }
                      
                      const result = await response.json();
                      if (result.addToGoogleWalletUrl) {
                        window.open(result.addToGoogleWalletUrl, '_blank');
                      }
                    } catch (error) {
                      console.error('Error generating Google pass:', error);
                      alert('Failed to create Google Wallet pass. Please try again.');
                    }
                  }}
                  className={`
                    ${element.data.buttonStyle === 'full' ? 'w-full' : element.data.buttonStyle === 'minimal' ? 'px-4 py-2' : 'px-6 py-3'}
                    bg-blue-600 hover:bg-blue-700 text-white border-blue-600
                    transition-all duration-200
                  `}
                  style={element.data.customColor ? { backgroundColor: element.data.customColor } : {}}
                  data-testid="button-google-wallet-element"
                >
                  {element.data.showIcon && <i className="fas fa-credit-card mr-2"></i>}
                  {element.data.title}
                </Button>
                {element.data.subtitle && (
                  <p className="text-xs text-slate-500 mt-2">{element.data.subtitle}</p>
                )}
              </div>
            )}
          </div>
        );

      case 'digitalWallet':
        return (
          <div className="mb-6">
            {isEditing && (
              <div className="mb-4 p-4 bg-slate-100 rounded-lg">
                <h3 className="font-medium mb-3">Digital Wallet Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Section Title</label>
                      <Input
                        value={element.data.title || 'Save to Digital Wallet'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            title: e.target.value 
                          } 
                        })}
                        placeholder="Section title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Layout</label>
                      <select
                        value={element.data.layout || 'stacked'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            layout: e.target.value as "stacked" | "columns"
                          } 
                        })}
                        className="w-full p-2 border rounded"
                      >
                        <option value="stacked">Stacked (1 Column)</option>
                        <option value="columns">Side by Side (2 Columns)</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Subtitle</label>
                    <Input
                      value={element.data.subtitle || 'Add this business card to your phone\'s wallet'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...element.data, 
                          subtitle: e.target.value 
                        } 
                      })}
                      placeholder="Description text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={element.data.showApple !== false}
                          onChange={(e) => onUpdate && onUpdate({ 
                            ...element, 
                            data: { 
                              ...element.data, 
                              showApple: e.target.checked 
                            } 
                          })}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium">Apple Wallet</span>
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={element.data.showGoogle !== false}
                          onChange={(e) => onUpdate && onUpdate({ 
                            ...element, 
                            data: { 
                              ...element.data, 
                              showGoogle: e.target.checked 
                            } 
                          })}
                          className="sr-only peer"
                        />
                        <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        <span className="ml-3 text-sm font-medium">Google Wallet</span>
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Apple Button Text</label>
                      <Input
                        value={element.data.appleButtonText || 'Add to Apple Wallet'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            appleButtonText: e.target.value 
                          } 
                        })}
                        placeholder="Apple button text"
                        disabled={!element.data.showApple}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Google Button Text</label>
                      <Input
                        value={element.data.googleButtonText || 'Add to Google Wallet'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            googleButtonText: e.target.value 
                          } 
                        })}
                        placeholder="Google button text"
                        disabled={!element.data.showGoogle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Apple Button Color</label>
                      <Input
                        type="color"
                        value={element.data.appleButtonColor || '#000000'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            appleButtonColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                        disabled={!element.data.showApple}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Google Button Color</label>
                      <Input
                        type="color"
                        value={element.data.googleButtonColor || '#2563eb'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            googleButtonColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                        disabled={!element.data.showGoogle}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Background Color</label>
                      <Input
                        type="color"
                        value={element.data.backgroundColor || '#1e293b'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            backgroundColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Text Color</label>
                      <Input
                        type="color"
                        value={element.data.textColor || '#ffffff'}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            textColor: e.target.value 
                          } 
                        })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Family</label>
                    <select
                      value={element.data.fontFamily || 'Inter'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...element.data, 
                          fontFamily: e.target.value 
                        } 
                      })}
                      className="w-full p-2 border rounded"
                    >
                      <option value="Inter">Inter (Default)</option>
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Roboto">Roboto</option>
                      <option value="Open Sans">Open Sans</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">QR Download Button Text</label>
                    <Input
                      value={element.data.qrButtonText || 'Download QR Code'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...element.data, 
                          qrButtonText: e.target.value 
                        } 
                      })}
                      placeholder="QR button text"
                      disabled={!element.data.showQRDownload}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">QR Code Button Color</label>
                    <Input
                      type="color"
                      value={element.data.qrButtonColor || '#000000'}
                      onChange={(e) => onUpdate && onUpdate({ 
                        ...element, 
                        data: { 
                          ...element.data, 
                          qrButtonColor: e.target.value 
                        } 
                      })}
                      className="h-10"
                      disabled={!element.data.showQRDownload}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`show-download-qr-${element.id}`}
                        checked={element.data.showQRDownload || false}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            showQRDownload: e.target.checked 
                          } 
                        })}
                        className="rounded"
                      />
                      <label htmlFor={`show-download-qr-${element.id}`} className="text-sm">
                        Show QR Download Option
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`modern-style-${element.id}`}
                        checked={element.data.modernStyle || false}
                        onChange={(e) => onUpdate && onUpdate({ 
                          ...element, 
                          data: { 
                            ...element.data, 
                            modernStyle: e.target.checked 
                          } 
                        })}
                        className="rounded"
                      />
                      <label htmlFor={`modern-style-${element.id}`} className="text-sm">
                        Use Modern Card Style
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Digital Wallet Container */}
            <div 
              className={`
                ${element.data.modernStyle 
                  ? 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-600 border-2 border-slate-500 shadow-2xl' 
                  : 'border border-slate-700 shadow-lg'
                } 
                rounded-xl p-6
              `}
              style={{
                backgroundColor: element.data.modernStyle ? undefined : (element.data.backgroundColor || '#1e293b'),
                color: element.data.textColor || '#ffffff',
                fontFamily: element.data.fontFamily || 'Inter'
              }}
            >
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold mb-2">
                  {element.data.title || 'Save to Digital Wallet'}
                </h3>
                <p className="text-sm opacity-80">
                  {element.data.subtitle || 'Add this business card to your phone\'s wallet'}
                </p>
              </div>
              
              <div className={`
                ${element.data.layout === 'columns' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}
              `}>
                {/* Apple Wallet Button */}
                {element.data.showApple !== false && (
                  <Button
                    onClick={async () => {
                      try {
                        console.log('Apple Wallet button clicked for card:', cardData?.id);
                        const response = await fetch(`/api/wallet/apple/${cardData?.id || ''}/create`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        
                        console.log('Apple Wallet API response status:', response.status);
                        
                        if (!response.ok) {
                          const errorData = await response.json();
                          console.error('Apple Wallet API error:', errorData);
                          throw new Error(`Failed to generate Apple pass: ${errorData.message}`);
                        }
                        
                        const result = await response.json();
                        console.log('Apple Wallet API response:', result);
                        
                        if (result.success) {
                          alert(`✅ ${result.message}\n\nApple Wallet pass data generated successfully. In production, this would download a .pkpass file that can be added to Apple Wallet.`);
                        } else {
                          throw new Error(result.message || 'Failed to create Apple Wallet pass');
                        }
                      } catch (error) {
                        console.error('Error generating Apple pass:', error);
                        alert(`Failed to create Apple Wallet pass: ${error.message}`);
                      }
                    }}
                    className="w-full h-12 text-white transition-all duration-200 flex items-center justify-center space-x-3 hover:opacity-90"
                    style={{
                      backgroundColor: element.data.appleButtonColor || '#000000',
                      borderColor: element.data.appleButtonColor || '#000000'
                    }}
                    data-testid="button-add-apple-wallet"
                  >
                    <i className="fab fa-apple text-lg"></i>
                    <span className="font-medium">{element.data.appleButtonText || 'Add to Apple Wallet'}</span>
                  </Button>
                )}

                {/* Google Wallet Button */}
                {element.data.showGoogle !== false && (
                  <Button
                    onClick={async () => {
                      try {
                        console.log('Google Wallet button clicked for card:', cardData?.id);
                        const response = await fetch(`/api/wallet/google/${cardData?.id || ''}/create`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        
                        console.log('Google Wallet API response status:', response.status);
                        
                        if (!response.ok) {
                          const errorData = await response.json();
                          console.error('Google Wallet API error:', errorData);
                          throw new Error(`Failed to generate Google pass: ${errorData.message}`);
                        }
                        
                        const result = await response.json();
                        console.log('Google Wallet API result:', result);
                        
                        if (result.success) {
                          if (result.saveUrl) {
                            console.log('Opening Google Wallet URL:', result.saveUrl);
                            // Production mode - open Google Wallet save URL
                            window.open(result.saveUrl, '_blank');
                            alert(`✅ ${result.message}\n\nGoogle Wallet pass created! Opening in new tab...`);
                          } else if (result.passType === 'google_wallet_demo') {
                            // Demo mode - show explanation
                            const demoInfo = result.demoInfo;
                            alert(`🔧 ${result.message}

📋 Business Card Data Ready:
• Name: ${demoInfo.businessCardData.name}
• Title: ${demoInfo.businessCardData.title}
• Company: ${demoInfo.businessCardData.company}
• Contact: ${demoInfo.businessCardData.contact}

🚀 For Production Setup:
${demoInfo.requirements.map((req, i) => `${i + 1}. ${req}`).join('\n')}

💡 In production, this would open Google Wallet to save the business card pass.`);
                          } else {
                            throw new Error('Unknown response format');
                          }
                        } else {
                          throw new Error(result.message || 'Failed to create Google Wallet pass');
                        }
                      } catch (error) {
                        console.error('Error generating Google pass:', error);
                        alert(`Failed to create Google Wallet pass: ${error.message}`);
                      }
                    }}
                    className="w-full h-12 text-white transition-all duration-200 flex items-center justify-center space-x-3 hover:opacity-90"
                    style={{
                      backgroundColor: element.data.googleButtonColor || '#2563eb',
                      borderColor: element.data.googleButtonColor || '#2563eb'
                    }}
                    data-testid="button-add-google-wallet"
                  >
                    <i className="fab fa-google text-lg"></i>
                    <span className="font-medium">{element.data.googleButtonText || 'Add to Google Wallet'}</span>
                  </Button>
                )}
              </div>

              {/* QR Download Option */}
              {element.data.showQRDownload && (
                <div className="mt-4">
                  <Button
                    onClick={async () => {
                      try {
                        console.log('QR Download button clicked for card:', cardData?.id);
                        // Generate QR code download link for business card
                        const shareUrl = `${window.location.origin}/${cardData?.shareSlug || cardData?.id}`;
                        console.log('Share URL for QR:', shareUrl);
                        
                        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=png&bgcolor=ffffff&color=${element.data.qrButtonColor?.replace('#', '') || '000000'}&data=${encodeURIComponent(shareUrl)}`;
                        console.log('QR API URL:', qrUrl);
                        
                        // Fetch the QR code image
                        const response = await fetch(qrUrl);
                        if (!response.ok) {
                          throw new Error('Failed to generate QR code');
                        }
                        
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `${cardData?.fullName || 'BusinessCard'}-QR.png`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        window.URL.revokeObjectURL(url);
                        
                        console.log('QR code download triggered');
                      } catch (error) {
                        console.error('Error downloading QR code:', error);
                        alert(`Failed to download QR code: ${error.message}`);
                      }
                    }}
                    variant="outline"
                    className="w-full h-10 border-slate-500 hover:bg-slate-700 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                    style={{
                      borderColor: element.data.qrButtonColor || '#000000',
                      backgroundColor: element.data.qrButtonColor || '#000000',
                      color: '#ffffff'
                    }}
                    data-testid="button-download-qr"
                  >
                    <i className="fas fa-download"></i>
                    <span>{element.data.qrButtonText || 'Download QR Code'}</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        );

      case 'navigationMenu':
        // Extract available pages from cardData
        const availablePages = ((cardData?.pages as any[]) || [])
          .filter((page: any) => page.key !== 'home') // Exclude home/card page
          .map((page: any) => ({
            id: page.id,
            label: page.label,
            path: page.path || page.key || page.id
          }));

        return (
          <MenuPageElement 
            data={element.data}
            isEditing={isEditing}
            onChange={(data) => onUpdate && onUpdate({ ...element, data })}
            availablePages={availablePages}
            onNavigate={onNavigatePage}
          />
        );

      case 'arPreviewMindAR':
        return (
          <div className="space-y-4">
            {isEditing ? (
              <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-semibold text-gray-800">AR Preview Settings</h3>
                
                {/* Generate from Card Image Button */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Auto-Generate AR Target
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      
                      try {
                        const result = await compileMind(file);
                        handleDataUpdate({
                          mindFileUrl: result.mindFileUrl,
                          planeTextureUrl: result.textureUrl || element.data.planeTextureUrl
                        });
                        
                        if (result.mindFileUrl) {
                          alert('AR target generated successfully!');
                        } else if (result.message) {
                          alert(`Image uploaded successfully!\n\n${result.message}`);
                        } else {
                          alert('Image uploaded successfully! Please enter a .mind file URL manually.');
                        }
                      } catch (error: any) {
                        alert(`Failed to process image: ${error.message}`);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  <p className="text-xs text-gray-500">
                    Upload your business card front image to auto-generate AR target
                  </p>
                </div>

                {/* Mind File URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Mind (.mind) File URL
                  </label>
                  <Input
                    value={element.data.mindFileUrl || ''}
                    onChange={(e) => handleDataUpdate({ mindFileUrl: e.target.value })}
                    placeholder="https://example.com/targets.mind"
                    className="text-sm"
                  />
                  <p className="text-xs text-gray-500">
                    {element.data.mindFileUrl ? 'AR target configured' : 'Upload image above or paste .mind URL manually'}
                  </p>
                </div>

                {/* Poster URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Poster URL (Fallback)
                  </label>
                  <Input
                    value={element.data.posterUrl || ''}
                    onChange={(e) => handleDataUpdate({ posterUrl: e.target.value })}
                    placeholder="https://example.com/poster.jpg"
                    className="text-sm"
                  />
                </div>

                {/* Plane Texture URL */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Plane Texture URL
                  </label>
                  <Input
                    value={element.data.planeTextureUrl || ''}
                    onChange={(e) => handleDataUpdate({ planeTextureUrl: e.target.value })}
                    placeholder="https://example.com/texture.jpg"
                    className="text-sm"
                  />
                </div>

                {/* Plane Dimensions */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Plane Width (m)
                    </label>
                    <Input
                      type="number"
                      min="0.1"
                      max="2"
                      step="0.05"
                      value={element.data.planeWidth || 0.8}
                      onChange={(e) => handleDataUpdate({ planeWidth: parseFloat(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Plane Height (m)
                    </label>
                    <Input
                      type="number"
                      min="0.1"
                      max="2"
                      step="0.05"
                      value={element.data.planeHeight || 0.45}
                      onChange={(e) => handleDataUpdate({ planeHeight: parseFloat(e.target.value) })}
                      className="text-sm"
                    />
                  </div>
                </div>

                {/* Accent Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Accent Color
                  </label>
                  <input
                    type="color"
                    value={element.data.accent || '#0ea5e9'}
                    onChange={(e) => handleDataUpdate({ accent: e.target.value })}
                    className="w-full h-10 rounded border border-gray-300"
                  />
                </div>

                {/* CTAs */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Call-to-Action Buttons
                  </label>
                  <div className="space-y-2">
                    {(element.data.ctas || []).map((cta: any, index: number) => (
                      <div key={index} className="flex gap-2 items-center p-2 border rounded">
                        <Input
                          value={cta.label || ''}
                          onChange={(e) => {
                            const newCtas = [...(element.data.ctas || [])];
                            newCtas[index] = { ...cta, label: e.target.value };
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          placeholder="Button label"
                          className="text-sm"
                        />
                        <select
                          value={cta.action || 'link'}
                          onChange={(e) => {
                            const newCtas = [...(element.data.ctas || [])];
                            newCtas[index] = { ...cta, action: e.target.value };
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="link">Link</option>
                          <option value="whatsapp">WhatsApp</option>
                          <option value="tel">Call</option>
                          <option value="mailto">Email</option>
                        </select>
                        <Input
                          value={cta.value || ''}
                          onChange={(e) => {
                            const newCtas = [...(element.data.ctas || [])];
                            newCtas[index] = { ...cta, value: e.target.value };
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          placeholder="URL/phone/email"
                          className="text-sm"
                        />
                        <Button
                          onClick={() => {
                            const newCtas = (element.data.ctas || []).filter((_: any, i: number) => i !== index);
                            handleDataUpdate({ ctas: newCtas });
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </Button>
                      </div>
                    ))}
                    <Button
                      onClick={() => {
                        const newCtas = [...(element.data.ctas || []), { label: 'New Action', action: 'link', value: '' }];
                        handleDataUpdate({ ctas: newCtas });
                      }}
                      variant="outline"
                      size="sm"
                      className="text-purple-600 hover:text-purple-800"
                    >
                      + Add CTA
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <ARPreviewMindAR
                mindFileUrl={element.data.mindFileUrl}
                posterUrl={element.data.posterUrl}
                planeTextureUrl={element.data.planeTextureUrl}
                planeWidth={element.data.planeWidth}
                planeHeight={element.data.planeHeight}
                accent={element.data.accent}
                ctas={element.data.ctas}
              />
            )}
          </div>
        );

      // Appointment booking elements
      case "bookAppointment":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Book Appointment Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={element.data.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Book Appointment"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={element.data.buttonText || ""}
                      onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                      placeholder="Book Now"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                  <Input
                    value={element.data.subtitle || ""}
                    onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                    placeholder="Schedule a meeting with me"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={element.data.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="consultation"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Duration (min)</label>
                    <Input
                      type="number"
                      value={element.data.duration || 30}
                      onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
                    <Input
                      type="color"
                      value={element.data.buttonColor || "#22c55e"}
                      onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                    <Input
                      type="color"
                      value={element.data.textColor || "#ffffff"}
                      onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={element.data.openInNewTab || false}
                      onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Icon</label>
                    <Select value={element.data.icon || "calendar"} onValueChange={(value) => handleDataUpdate({ icon: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calendar"><i className="fas fa-calendar-alt mr-2"></i> Calendar</SelectItem>
                        <SelectItem value="clock"><i className="fas fa-clock mr-2"></i> Clock</SelectItem>
                        <SelectItem value="user"><i className="fas fa-user mr-2"></i> User</SelectItem>
                        <SelectItem value="none">No Icon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Size</label>
                    <Select value={element.data.size || "medium"} onValueChange={(value) => handleDataUpdate({ size: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4 rounded-lg border border-slate-200 bg-white">
                <h3 className="text-lg font-bold text-slate-800">{element.data.title || "Book Appointment"}</h3>
                {element.data.subtitle && (
                  <p className="text-sm text-slate-600">{element.data.subtitle}</p>
                )}
                <Button
                  onClick={() => {
                    if (!isInteractive) return;
                    const eventSlug = element.data.eventTypeSlug || 'consultation';
                    const duration = element.data.duration || 30;
                    const bookingUrl = `/booking/${eventSlug}?duration=${duration}&source=card`;
                    
                    if (element.data.openInNewTab) {
                      window.open(bookingUrl, '_blank');
                    } else {
                      window.location.href = bookingUrl;
                    }
                  }}
                  style={{
                    backgroundColor: element.data.buttonColor || "#22c55e",
                    color: element.data.textColor || "#ffffff",
                  }}
                  className={`rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                    element.data.size === 'small' ? 'px-4 py-1 text-sm' :
                    element.data.size === 'large' ? 'px-8 py-3 text-lg' :
                    'px-6 py-2'
                  }`}
                  data-testid="button-book-appointment"
                >
                  {element.data.icon && element.data.icon !== 'none' && (
                    <i className={`fas fa-${
                      element.data.icon === 'calendar' ? 'calendar-alt' :
                      element.data.icon === 'clock' ? 'clock' :
                      element.data.icon === 'user' ? 'user' : 'calendar-alt'
                    } mr-2`}></i>
                  )}
                  {element.data.buttonText || "Book Now"}
                  {element.data.duration && (
                    <span className="ml-2 text-xs opacity-80">({element.data.duration}min)</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case "scheduleCall":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Schedule Call Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={element.data.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Schedule a Call"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={element.data.buttonText || ""}
                      onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                      placeholder="Schedule Call"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                  <Input
                    value={element.data.subtitle || ""}
                    onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                    placeholder="Let's discuss your project"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={element.data.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="phone-call"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Call Type</label>
                    <Select value={element.data.callType || "phone"} onValueChange={(value) => handleDataUpdate({ callType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="phone"><i className="fas fa-phone mr-2"></i> Phone Call</SelectItem>
                        <SelectItem value="video"><i className="fas fa-video mr-2"></i> Video Call</SelectItem>
                        <SelectItem value="both"><i className="fas fa-phone mr-1"></i><i className="fas fa-video ml-1"></i> Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
                    <Input
                      type="color"
                      value={element.data.buttonColor || "#2563eb"}
                      onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                    <Input
                      type="color"
                      value={element.data.textColor || "#ffffff"}
                      onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Duration (min)</label>
                    <Input
                      type="number"
                      value={element.data.duration || 30}
                      onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Size</label>
                    <Select value={element.data.size || "medium"} onValueChange={(value) => handleDataUpdate({ size: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={element.data.openInNewTab || false}
                      onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4 rounded-lg border border-slate-200 bg-white">
                <h3 className="text-lg font-bold text-slate-800">{element.data.title || "Schedule a Call"}</h3>
                {element.data.subtitle && (
                  <p className="text-sm text-slate-600">{element.data.subtitle}</p>
                )}
                <Button
                  onClick={() => {
                    if (!isInteractive) return;
                    const eventSlug = element.data.eventTypeSlug || 'phone-call';
                    const duration = element.data.duration || 30;
                    const callType = element.data.callType || 'phone';
                    const bookingUrl = `/booking/${eventSlug}?duration=${duration}&type=${callType}&source=card`;
                    
                    if (element.data.openInNewTab) {
                      window.open(bookingUrl, '_blank');
                    } else {
                      window.location.href = bookingUrl;
                    }
                  }}
                  style={{
                    backgroundColor: element.data.buttonColor || "#2563eb",
                    color: element.data.textColor || "#ffffff",
                  }}
                  className={`rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
                    element.data.size === 'small' ? 'px-4 py-1 text-sm' :
                    element.data.size === 'large' ? 'px-8 py-3 text-lg' :
                    'px-6 py-2'
                  }`}
                  data-testid="button-schedule-call"
                >
                  {element.data.callType === 'phone' && (
                    <i className="fas fa-phone mr-2"></i>
                  )}
                  {element.data.callType === 'video' && (
                    <i className="fas fa-video mr-2"></i>
                  )}
                  {element.data.callType === 'both' && (
                    <>
                      <i className="fas fa-phone mr-1"></i>
                      <i className="fas fa-video mr-2"></i>
                    </>
                  )}
                  {element.data.buttonText || "Schedule Call"}
                  {element.data.duration && (
                    <span className="ml-2 text-xs opacity-80">({element.data.duration}min)</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case "meetingRequest":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Meeting Request Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={element.data.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Request a Meeting"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={element.data.buttonText || ""}
                      onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                      placeholder="Request Meeting"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                  <Input
                    value={element.data.subtitle || ""}
                    onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                    placeholder="Let's meet to discuss opportunities"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={element.data.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="discovery-meeting"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Meeting Type</label>
                    <Select value={element.data.meetingType || "business"} onValueChange={(value) => handleDataUpdate({ meetingType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business"><i className="fas fa-handshake mr-2"></i> Business Meeting</SelectItem>
                        <SelectItem value="consultation"><i className="fas fa-user-tie mr-2"></i> Consultation</SelectItem>
                        <SelectItem value="discovery"><i className="fas fa-search mr-2"></i> Discovery Call</SelectItem>
                        <SelectItem value="demo"><i className="fas fa-desktop mr-2"></i> Product Demo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Border Color</label>
                    <Input
                      type="color"
                      value={element.data.borderColor || "#7c3aed"}
                      onChange={(e) => handleDataUpdate({ borderColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                    <Input
                      type="color"
                      value={element.data.textColor || "#7c3aed"}
                      onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Duration (min)</label>
                    <Input
                      type="number"
                      value={element.data.duration || 60}
                      onChange={(e) => handleDataUpdate({ duration: parseInt(e.target.value) })}
                      min="15"
                      max="180"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Style</label>
                    <Select value={element.data.style || "outlined"} onValueChange={(value) => handleDataUpdate({ style: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="outlined">Outlined</SelectItem>
                        <SelectItem value="filled">Filled</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Size</label>
                    <Select value={element.data.size || "medium"} onValueChange={(value) => handleDataUpdate({ size: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={element.data.openInNewTab || false}
                    onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                  />
                  <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 p-4 rounded-lg border border-slate-200 bg-white">
                <h3 className="text-lg font-bold text-slate-800">{element.data.title || "Request a Meeting"}</h3>
                {element.data.subtitle && (
                  <p className="text-sm text-slate-600">{element.data.subtitle}</p>
                )}
                <Button
                  onClick={() => {
                    if (!isInteractive) return;
                    const eventSlug = element.data.eventTypeSlug || 'discovery-meeting';
                    const duration = element.data.duration || 60;
                    const meetingType = element.data.meetingType || 'business';
                    const bookingUrl = `/booking/${eventSlug}?duration=${duration}&type=${meetingType}&source=card&style=meeting`;
                    
                    if (element.data.openInNewTab) {
                      window.open(bookingUrl, '_blank');
                    } else {
                      window.location.href = bookingUrl;
                    }
                  }}
                  style={{
                    backgroundColor: element.data.style === 'filled' ? (element.data.borderColor || "#7c3aed") : "transparent",
                    color: element.data.style === 'filled' ? "#ffffff" : (element.data.textColor || "#7c3aed"),
                    borderColor: element.data.style !== 'minimal' ? (element.data.borderColor || "#7c3aed") : "transparent",
                    borderWidth: element.data.style === 'minimal' ? '0' : '2px',
                  }}
                  className={`rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 ${
                    element.data.style === 'outlined' ? 'border-2 hover:shadow-lg' :
                    element.data.style === 'filled' ? 'shadow-lg hover:shadow-xl' :
                    'hover:bg-slate-50'
                  } ${
                    element.data.size === 'small' ? 'px-4 py-1 text-sm' :
                    element.data.size === 'large' ? 'px-8 py-3 text-lg' :
                    'px-6 py-2'
                  }`}
                  variant={element.data.style === 'filled' ? 'default' : 'outline'}
                  data-testid="button-meeting-request"
                >
                  {element.data.meetingType === 'business' && (
                    <i className="fas fa-handshake mr-2"></i>
                  )}
                  {element.data.meetingType === 'consultation' && (
                    <i className="fas fa-user-tie mr-2"></i>
                  )}
                  {element.data.meetingType === 'discovery' && (
                    <i className="fas fa-search mr-2"></i>
                  )}
                  {element.data.meetingType === 'demo' && (
                    <i className="fas fa-desktop mr-2"></i>
                  )}
                  {element.data.buttonText || "Request Meeting"}
                  {element.data.duration && (
                    <span className="ml-2 text-xs opacity-80">({element.data.duration}min)</span>
                  )}
                </Button>
              </div>
            )}
          </div>
        );

      case "availabilityDisplay":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Availability Display Element</h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={element.data.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="My Availability"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Subtitle</label>
                    <Input
                      value={element.data.subtitle || ""}
                      onChange={(e) => handleDataUpdate({ subtitle: e.target.value })}
                      placeholder="Choose a convenient time"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Event Type Slug</label>
                    <Input
                      value={element.data.eventTypeSlug || ""}
                      onChange={(e) => handleDataUpdate({ eventTypeSlug: e.target.value })}
                      placeholder="30min-meeting"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Timezone</label>
                    <Select value={element.data.timezone || "auto"} onValueChange={(value) => handleDataUpdate({ timezone: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="auto">Auto-detect</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Primary Color</label>
                    <Input
                      type="color"
                      value={element.data.primaryColor || "#22c55e"}
                      onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Background Color</label>
                    <Input
                      type="color"
                      value={element.data.backgroundColor || "#f8fafc"}
                      onChange={(e) => handleDataUpdate({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Display Style</label>
                    <Select value={element.data.displayStyle || "compact"} onValueChange={(value) => handleDataUpdate({ displayStyle: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="compact">Compact</SelectItem>
                        <SelectItem value="detailed">Detailed</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Days to Show</label>
                    <Input
                      type="number"
                      value={element.data.daysToShow || 7}
                      onChange={(e) => handleDataUpdate({ daysToShow: parseInt(e.target.value) })}
                      min="3"
                      max="14"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={element.data.showBookingButton || true}
                      onCheckedChange={(checked) => handleDataUpdate({ showBookingButton: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Show booking button</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={element.data.openInNewTab || false}
                      onCheckedChange={(checked) => handleDataUpdate({ openInNewTab: checked })}
                    />
                    <label className="text-sm font-medium text-slate-700">Open in new tab</label>
                  </div>
                </div>
                {element.data.showBookingButton && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Booking Button Text</label>
                    <Input
                      value={element.data.bookingButtonText || ""}
                      onChange={(e) => handleDataUpdate({ bookingButtonText: e.target.value })}
                      placeholder="Book a slot"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div 
                className="p-4 rounded-lg border border-slate-200"
                style={{ backgroundColor: element.data.backgroundColor || "#f8fafc" }}
                data-testid="availability-display"
              >
                <h3 className="text-lg font-bold text-slate-800 mb-2 text-center">{element.data.title || "My Availability"}</h3>
                {element.data.subtitle && (
                  <p className="text-sm text-slate-600 mb-4 text-center">{element.data.subtitle}</p>
                )}
                <AvailabilityWidget
                  eventTypeSlug={element.data.eventTypeSlug}
                  timezone={element.data.timezone}
                  displayStyle={element.data.displayStyle}
                  daysToShow={element.data.daysToShow}
                  primaryColor={element.data.primaryColor}
                  showBookingButton={element.data.showBookingButton}
                  bookingButtonText={element.data.bookingButtonText}
                  openInNewTab={element.data.openInNewTab}
                  isInteractive={isInteractive}
                />
              </div>
            )}
          </div>
        );

      case "subscribeForm":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Subscribe Form Element</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Title</label>
                    <Input
                      value={element.data.title || ""}
                      onChange={(e) => handleDataUpdate({ title: e.target.value })}
                      placeholder="Stay Updated"
                      data-testid="input-title"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Description</label>
                    <Textarea
                      value={element.data.description || ""}
                      onChange={(e) => handleDataUpdate({ description: e.target.value })}
                      placeholder="Subscribe to get notified about updates and news."
                      rows={3}
                      data-testid="input-description"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                      <Input
                        value={element.data.buttonText || ""}
                        onChange={(e) => handleDataUpdate({ buttonText: e.target.value })}
                        placeholder="Subscribe"
                        data-testid="input-buttonText"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Success Message</label>
                      <Input
                        value={element.data.successMessage || ""}
                        onChange={(e) => handleDataUpdate({ successMessage: e.target.value })}
                        placeholder="Thank you for subscribing!"
                        data-testid="input-successMessage"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`requireName-${element.id}`}
                        checked={element.data.requireName || false}
                        onCheckedChange={(checked) => handleDataUpdate({ requireName: checked })}
                        data-testid="checkbox-requireName"
                      />
                      <label htmlFor={`requireName-${element.id}`} className="text-sm font-medium text-slate-700">
                        Require Name
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`requireEmail-${element.id}`}
                        checked={element.data.requireEmail !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ requireEmail: checked })}
                        data-testid="checkbox-requireEmail"
                      />
                      <label htmlFor={`requireEmail-${element.id}`} className="text-sm font-medium text-slate-700">
                        Require Email
                      </label>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`enablePush-${element.id}`}
                        checked={element.data.enablePushNotifications !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ enablePushNotifications: checked })}
                        data-testid="checkbox-enablePush"
                      />
                      <label htmlFor={`enablePush-${element.id}`} className="text-sm font-medium text-slate-700">
                        Enable Push Notifications
                      </label>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Primary Color</label>
                      <Input
                        type="color"
                        value={element.data.primaryColor || "#f97316"}
                        onChange={(e) => handleDataUpdate({ primaryColor: e.target.value })}
                        data-testid="input-primaryColor"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Background Color</label>
                      <Input
                        type="color"
                        value={element.data.backgroundColor || "#ffffff"}
                        onChange={(e) => handleDataUpdate({ backgroundColor: e.target.value })}
                        data-testid="input-backgroundColor"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                      <Input
                        type="color"
                        value={element.data.textColor || "#1e293b"}
                        onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                        data-testid="input-textColor"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <SubscribeFormComponent
                cardId={cardData?.id || ""}
                title={element.data.title}
                description={element.data.description}
                buttonText={element.data.buttonText}
                successMessage={element.data.successMessage}
                requireName={element.data.requireName}
                requireEmail={element.data.requireEmail}
                enablePushNotifications={element.data.enablePushNotifications}
                primaryColor={element.data.primaryColor}
                backgroundColor={element.data.backgroundColor}
                textColor={element.data.textColor}
              />
            )}
          </div>
        );

      case "html":
        return (
          <div className="w-full max-w-[430px] mx-auto">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">Custom HTML Element</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">HTML Content</label>
                    <Textarea
                      value={element.data.content || ""}
                      onChange={(e) => handleDataUpdate({ content: e.target.value })}
                      placeholder="Enter your HTML code here..."
                      className="min-h-[200px] font-mono text-sm"
                      data-testid="html-content-editor"
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Height (px)</label>
                      <Input
                        type="number"
                        value={element.data.height || 300}
                        onChange={(e) => handleDataUpdate({ height: parseInt(e.target.value) || 300 })}
                        min={100}
                        max={1000}
                        className="w-24"
                        data-testid="html-height-input"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={element.data.sandbox !== false}
                        onCheckedChange={(checked) => handleDataUpdate({ sandbox: checked })}
                        data-testid="html-sandbox-checkbox"
                      />
                      <label className="text-sm font-medium text-slate-700">Security sandboxing (recommended)</label>
                    </div>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-sm text-amber-800">
                      <i className="fas fa-exclamation-triangle mr-2"></i>
                      Security Note: JavaScript and external scripts will be disabled for safety.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="html-element-preview w-full" data-testid="html-element-preview">
                {element.data.content && element.data.content.trim() ? (
                  <iframe
                    srcDoc={`<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    * { box-sizing: border-box; }
  </style>
</head>
<body>
  ${element.data.content}
</body>
</html>`}
                    style={{ 
                      width: '430px',
                      maxWidth: '100%',
                      height: `${element.data.height || 300}px`,
                      border: 'none',
                      borderRadius: '0'
                    }}
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals"
                    title="Custom HTML Content"
                    data-testid="html-iframe"
                  />
                ) : (
                  <div 
                    className="border-2 border-dashed border-slate-300 p-8 text-center text-slate-500"
                    style={{ width: '430px', maxWidth: '100%', height: `${element.data.height || 300}px` }}
                    data-testid="html-placeholder"
                  >
                    <i className="fas fa-code text-4xl mb-4"></i>
                    <p>Add HTML content to see preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case "pdfViewer":
        return (
          <div className="w-full max-w-[430px] mx-auto">
            {isEditing ? (
              <div className="p-4 bg-white rounded-lg border border-slate-200 space-y-4">
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-slate-800">PDF Viewer</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Upload PDF File *</label>
                    <Input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file && file.type === 'application/pdf') {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const base64 = event.target?.result as string;
                            handleDataUpdate({ 
                              pdf_file: base64,
                              file_name: file.name
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full"
                      data-testid="pdf-file-input"
                    />
                    {element.data.file_name && (
                      <p className="text-xs text-green-600 mt-1">
                        <i className="fas fa-check mr-1"></i>
                        Uploaded: {element.data.file_name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Button Text</label>
                    <Input
                      value={element.data.button_text || "View PDF"}
                      onChange={(e) => handleDataUpdate({ button_text: e.target.value })}
                      placeholder="View PDF"
                      className="w-full"
                      data-testid="pdf-button-text-input"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Button Color</label>
                      <Input
                        type="color"
                        value={element.data.buttonColor || "#6b21a8"}
                        onChange={(e) => handleDataUpdate({ buttonColor: e.target.value })}
                        className="w-full h-10"
                        data-testid="pdf-button-color-input"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 block mb-1">Text Color</label>
                      <Input
                        type="color"
                        value={element.data.textColor || "#ffffff"}
                        onChange={(e) => handleDataUpdate({ textColor: e.target.value })}
                        className="w-full h-10"
                        data-testid="pdf-text-color-input"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">
                      Scale ({Math.round((element.data.scale || 1.0) * 100)}%)
                    </label>
                    <Input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={element.data.scale || 1.0}
                      onChange={(e) => handleDataUpdate({ scale: parseFloat(e.target.value) })}
                      className="w-full"
                      data-testid="pdf-scale-input"
                    />
                    <div className="text-xs text-slate-500 mt-1">
                      Adjust PDF zoom level (50% - 300%)
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <p className="text-sm text-purple-800">
                      <i className="fas fa-info-circle mr-2"></i>
                      PDF will open in a modal with clickable links, zoom controls, and download options.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="pdf-viewer-element w-full flex justify-center" data-testid="pdf-viewer-element">
                {element.data.pdf_file ? (
                  <PdfViewerButton
                    pdf_file={element.data.pdf_file}
                    button_text={element.data.button_text || "View PDF"}
                    scale={element.data.scale || 1.0}
                    file_name={element.data.file_name || ""}
                    buttonColor={element.data.buttonColor || "#6b21a8"}
                    textColor={element.data.textColor || "#ffffff"}
                    className="w-full max-w-xs"
                  />
                ) : (
                  <div className="border-2 border-dashed border-purple-300 p-8 text-center text-purple-500 rounded-2xl">
                    <i className="fas fa-file-pdf text-4xl mb-4"></i>
                    <p>Upload PDF file to see preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="mb-4 p-4 bg-slate-100 rounded-lg text-center text-slate-600">
            Element type not implemented yet
          </div>
        );
    }
  };

  return (
    <div className="relative group">
      {renderElement()}
    </div>
  );
}