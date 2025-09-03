import { PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { useState, useEffect } from "react";
import { generateFieldId } from "@/lib/card-data";
import { AIChat } from "@/components/ai-chat";
import { IngestForm } from "@/components/IngestForm";
import { URLManager } from "@/components/URLManager";
import { DocumentManager, DocumentItem } from "@/components/DocumentManager";
import { RAGChatBox } from "@/components/RAGChatBox";
import { MessageCircle } from "lucide-react";
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
}

export function PageElementRenderer({ element, isEditing = false, onUpdate, onDelete, cardData }: PageElementProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  const renderElement = () => {
    switch (element.type) {
      case "heading":
        const HeadingTag = element.data.level as keyof JSX.IntrinsicElements;
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
              </div>
            ) : (
              <HeadingTag className={`font-bold ${
                element.data.level === 'h1' ? 'text-2xl' : 
                element.data.level === 'h2' ? 'text-xl' : 'text-lg'
              } text-slate-800`}>
                {element.data.text}
              </HeadingTag>
            )}
          </div>
        );

      case "paragraph":
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
              </div>
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed">
                {element.data.text}
              </p>
            )}
          </div>
        );

      case "link":
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
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
              </div>
            ) : (
              element.data.style === "button" ? (
                <Button
                  onClick={() => window.open(element.data.url, '_blank')}
                  className="w-full bg-talklink-500 hover:bg-talklink-600 text-white"
                >
                  {element.data.text}
                </Button>
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

      case "contactSection":
        return (
          <div className="mb-6">
            {isEditing ? (
              <div className="text-white">Contact Section (Edit in form builder)</div>
            ) : (
              <div className="flex justify-center space-x-4 flex-wrap gap-y-3">
                {element.data.contacts.map((contact) => (
                  contact.value && (
                    <div key={contact.id} className="flex flex-col items-center">
                      <button
                        className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                        onClick={() => {
                          if (contact.type === 'phone') {
                            window.open(`tel:${contact.value}`, '_self');
                          } else if (contact.type === 'email') {
                            window.open(`mailto:${contact.value}`, '_self');
                          } else if (contact.type === 'website') {
                            window.open(contact.value.startsWith('http') ? contact.value : `https://${contact.value}`, '_blank');
                          }
                        }}
                      >
                        <i className={`${contact.icon} text-sm`}></i>
                      </button>
                      <span className="text-xs text-slate-600">{contact.label}</span>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        );

      case "socialSection":
        const socials = element.data.socials.filter(social => social.value);
        return (
          <div className="mb-6">
            {isEditing ? (
              <div className="text-white">Social Section (Edit in form builder)</div>
            ) : (
              <div className="space-y-3">
                {/* Group socials into rows of 4 */}
                {Array.from({ length: Math.ceil(socials.length / 4) }, (_, rowIndex) => (
                  <div key={rowIndex} className="flex justify-center space-x-4">
                    {socials.slice(rowIndex * 4, (rowIndex + 1) * 4).map((social) => (
                      <div key={social.id} className="flex flex-col items-center">
                        <button
                          className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors mb-1"
                          onClick={() => {
                            const url = social.value.startsWith('http') ? social.value : `https://${social.platform.toLowerCase()}.com/${social.value.replace('@', '')}`;
                            window.open(url, '_blank');
                          }}
                        >
                          <i className={`${social.icon} text-sm`}></i>
                        </button>
                        <span className="text-xs text-slate-600">{social.platform || social.label}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        );

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
            ) : (
              <div className="space-y-2">
                {element.data.items.map((item) => (
                  <details key={item.id} className="bg-slate-50 rounded-lg border border-slate-200">
                    <summary className="cursor-pointer p-3 font-medium text-slate-800 hover:bg-slate-100 rounded-lg flex items-center justify-between">
                      <span>{item.title}</span>
                      <i className="fas fa-chevron-down text-xs text-slate-500"></i>
                    </summary>
                    <div className="p-3 pt-0 text-slate-600 text-sm leading-relaxed">
                      {item.content}
                    </div>
                  </details>
                ))}
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
                </div>
                <Input
                  value={element.data.knowledgeBase?.websiteUrl || ''}
                  onChange={(e) => handleDataUpdate({ 
                    knowledgeBase: { 
                      ...element.data.knowledgeBase, 
                      websiteUrl: e.target.value 
                    } 
                  })}
                  placeholder="Website URL for knowledge extraction"
                  className="bg-slate-700 border-slate-600 text-white"
                />
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
              <div className="space-y-6">
                {/* Chat Button for End Users */}
                {element.data.showChatBox && (
                  <div className="text-center">
                    <Button
                      onClick={() => setIsChatOpen(true)}
                      className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg shadow-lg"
                      style={{ backgroundColor: element.data.primaryColor || '#22c55e' }}
                      data-testid="button-open-knowledge-chat"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      Ask Knowledge Assistant
                    </Button>
                  </div>
                )}
                
                {/* RAG Chat Dialog */}
                {element.type === "ragKnowledge" && (
                  <RAGChatBox
                    isOpen={isChatOpen}
                    onClose={() => setIsChatOpen(false)}
                    primaryColor={element.data.primaryColor}
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
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          title: e.target.value 
                        })}
                        placeholder="Section title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Layout</label>
                      <select
                        value={element.data.layout || 'stacked'}
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          layout: e.target.value 
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
                      onChange={(e) => onUpdate && onUpdate(element.id, { 
                        ...element.data, 
                        subtitle: e.target.value 
                      })}
                      placeholder="Description text"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`show-apple-${element.id}`}
                        checked={element.data.showApple !== false}
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          showApple: e.target.checked 
                        })}
                        className="rounded"
                      />
                      <label htmlFor={`show-apple-${element.id}`} className="text-sm">
                        Show Apple Wallet
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`show-google-${element.id}`}
                        checked={element.data.showGoogle !== false}
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          showGoogle: e.target.checked 
                        })}
                        className="rounded"
                      />
                      <label htmlFor={`show-google-${element.id}`} className="text-sm">
                        Show Google Wallet
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Background Color</label>
                      <Input
                        type="color"
                        value={element.data.backgroundColor || '#1e293b'}
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          backgroundColor: e.target.value 
                        })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Text Color</label>
                      <Input
                        type="color"
                        value={element.data.textColor || '#ffffff'}
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          textColor: e.target.value 
                        })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Family</label>
                    <select
                      value={element.data.fontFamily || 'Inter'}
                      onChange={(e) => onUpdate && onUpdate(element.id, { 
                        ...element.data, 
                        fontFamily: e.target.value 
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
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`show-download-qr-${element.id}`}
                        checked={element.data.showQRDownload || false}
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          showQRDownload: e.target.checked 
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
                        onChange={(e) => onUpdate && onUpdate(element.id, { 
                          ...element.data, 
                          modernStyle: e.target.checked 
                        })}
                        className="rounded"
                      />
                      <label htmlFor={`modern-style-${element.id}`} className="text-sm">
                        Use Modern Card Style
                      </label>
                    </div>
                  </div>

                  {onDelete && (
                    <Button
                      onClick={() => onDelete(element.id)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-500 hover:text-red-500"
                    >
                      <i className="fas fa-times mr-2"></i>
                      Remove Element
                    </Button>
                  )}
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
                    className="w-full h-12 bg-black hover:bg-gray-800 text-white border-black transition-all duration-200 flex items-center justify-center space-x-3"
                    data-testid="button-add-apple-wallet"
                  >
                    <i className="fas fa-wallet text-lg"></i>
                    <span className="font-medium">Add to Apple Wallet</span>
                  </Button>
                )}

                {/* Google Wallet Button */}
                {element.data.showGoogle !== false && (
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
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white border-blue-600 transition-all duration-200 flex items-center justify-center space-x-3"
                    data-testid="button-add-google-wallet"
                  >
                    <i className="fas fa-credit-card text-lg"></i>
                    <span className="font-medium">Add to Google Wallet</span>
                  </Button>
                )}
              </div>

              {/* QR Download Option */}
              {element.data.showQRDownload && (
                <div className="mt-4">
                  <Button
                    onClick={() => {
                      // Generate QR code download link for business card
                      const shareUrl = `${window.location.origin}/${cardData?.shareSlug || cardData?.id}`;
                      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
                      const a = document.createElement('a');
                      a.href = qrUrl;
                      a.download = `${cardData?.fullName || 'BusinessCard'}-QR.png`;
                      a.target = '_blank';
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }}
                    variant="outline"
                    className="w-full h-10 border-slate-500 hover:bg-slate-700 hover:text-white transition-all duration-200 flex items-center justify-center space-x-2"
                    style={{
                      borderColor: element.data.textColor ? `${element.data.textColor}50` : '#64748b',
                      color: element.data.textColor || '#94a3b8'
                    }}
                    data-testid="button-download-qr"
                  >
                    <i className="fas fa-download"></i>
                    <span>Download QR Code</span>
                  </Button>
                </div>
              )}
            </div>
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
      {isEditing && onDelete && (
        <Button
          onClick={() => onDelete(element.id)}
          variant="destructive"
          size="sm"
          className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <i className="fas fa-trash text-xs"></i>
        </Button>
      )}
    </div>
  );
}