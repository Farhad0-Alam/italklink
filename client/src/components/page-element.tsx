import { PageElement } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { generateFieldId } from "@/lib/card-data";
import { AIChat } from "@/components/ai-chat";

// Image Slider Component
interface ImageSliderComponentProps {
  images: { id: string; src: string; alt?: string; }[];
}

function ImageSliderComponent({ images }: ImageSliderComponentProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  return (
    <div className="relative rounded-lg overflow-hidden bg-slate-100">
      <div className="aspect-video relative">
        <img
          src={images[currentSlide]?.src}
          alt={images[currentSlide]?.alt || ''}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentSlide(prev => prev > 0 ? prev - 1 : images.length - 1)}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <i className="fas fa-chevron-left text-sm"></i>
            </button>
            <button
              onClick={() => setCurrentSlide(prev => prev < images.length - 1 ? prev + 1 : 0)}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <i className="fas fa-chevron-right text-sm"></i>
            </button>
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}
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
}

export function PageElementRenderer({ element, isEditing = false, onUpdate, onDelete }: PageElementProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Helper function to safely access element data
  const getData = () => element.data || {};
  
  const handleDataUpdate = (newData: any) => {
    if (onUpdate) {
      onUpdate({ ...element, data: { ...(element.data || {}), ...newData } });
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const getElementTitle = () => {
    switch (element.type) {
      case "heading": return element.data.text || "Heading";
      case "paragraph": return "Paragraph";
      case "link": return element.data.text || "Link";
      case "image": return "Image";
      case "qrcode": return "QR Code";
      case "contactSection": return "Contact Section";
      case "socialSection": return "Social Section";
      case "video": return "Video";
      case "contactForm": return element.data.title || "Contact Form";
      case "accordion": return "Accordion";
      case "testimonials": return element.data.title || "Testimonials";
      case "googleMaps": return element.data.title || "Google Maps";
      case "aiChatbot": return element.data.title || "AI Chatbot";
      default: return "Page Element";
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
                  value={element.data.text}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Heading text"
                />
                <div className="flex gap-2">
                  <select
                    value={element.data.level}
                    onChange={(e) => handleDataUpdate({ level: e.target.value })}
                    className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1"
                  >
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>
                  <select
                    value={element.data.alignment}
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
                  value={element.data.text}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Paragraph text"
                  rows={3}
                />
                <select
                  value={element.data.alignment}
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
                  value={element.data.text}
                  onChange={(e) => handleDataUpdate({ text: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Link text"
                />
                <Input
                  value={element.data.url}
                  onChange={(e) => handleDataUpdate({ url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="https://example.com"
                />
                <select
                  value={element.data.style}
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
                  value={element.data.alt || ''}
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
          <div className="mb-4 flex justify-center">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={element.data.value}
                  onChange={(e) => handleDataUpdate({ value: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="QR Code content"
                />
                <Input
                  type="number"
                  value={element.data.size}
                  onChange={(e) => handleDataUpdate({ size: parseInt(e.target.value) })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Size"
                  min="50"
                  max="300"
                />
              </div>
            ) : (
              element.data.value && (
                <QRCodeSVG
                  value={element.data.value}
                  size={element.data.size}
                  level="M"
                  includeMargin={true}
                />
              )
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
                  value={element.data.url}
                  onChange={(e) => handleDataUpdate({ url: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="YouTube/Vimeo URL"
                />
                <Input
                  value={element.data.thumbnail || ''}
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
        return (
          <div className="mb-4">
            {isEditing ? (
              <div className="space-y-2">
                <Input
                  value={element.data.title}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white"
                  placeholder="Form title"
                />
                <div className="text-white text-sm">Fields: {element.data.fields.join(', ')}</div>
                <div className="grid grid-cols-3 gap-2">
                  {['name', 'email', 'phone', 'company', 'message'].map(field => (
                    <label key={field} className="flex items-center text-white text-xs">
                      <input
                        type="checkbox"
                        checked={element.data.fields.includes(field)}
                        onChange={(e) => {
                          const fields = e.target.checked 
                            ? [...element.data.fields, field]
                            : element.data.fields.filter(f => f !== field);
                          handleDataUpdate({ fields });
                        }}
                        className="mr-1"
                      />
                      {field}
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="font-bold mb-3 text-slate-800">{element.data.title}</h3>
                <div className="space-y-3">
                  {element.data.fields.includes('name') && (
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      readOnly
                    />
                  )}
                  {element.data.fields.includes('email') && (
                    <input
                      type="email"
                      placeholder="Your Email"
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      readOnly
                    />
                  )}
                  {element.data.fields.includes('phone') && (
                    <input
                      type="tel"
                      placeholder="Your Phone"
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      readOnly
                    />
                  )}
                  {element.data.fields.includes('company') && (
                    <input
                      type="text"
                      placeholder="Company Name"
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      readOnly
                    />
                  )}
                  {element.data.fields.includes('message') && (
                    <textarea
                      placeholder="Your Message"
                      className="w-full p-2 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-talklink-500"
                      rows={3}
                      readOnly
                    />
                  )}
                  <Button className="bg-talklink-500 hover:bg-talklink-600 text-white w-full">
                    <i className="fas fa-paper-plane mr-2"></i>
                    Send Message
                  </Button>
                </div>
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
              <div className="space-y-2">
                <div className="text-white text-sm">Image Slider (Upload images)</div>
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
                          alt: file.name
                        };
                        handleDataUpdate({ 
                          images: [...element.data.images, newImage] 
                        });
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="grid grid-cols-3 gap-2">
                  {element.data.images.map((img, index) => (
                    <div key={img.id} className="relative">
                      <img src={img.src} alt={img.alt || ''} className="w-full h-20 object-cover rounded" />
                      <Button
                        onClick={() => {
                          const newImages = element.data.images.filter((_, i) => i !== index);
                          handleDataUpdate({ images: newImages });
                        }}
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 w-6 h-6 p-0 text-xs"
                      >
                        <i className="fas fa-times"></i>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              element.data.images.length > 0 && (
                <ImageSliderComponent images={element.data.images} />
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
                <Input
                  value={element.data.title}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Section title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <select
                  value={element.data.displayStyle}
                  onChange={(e) => handleDataUpdate({ displayStyle: e.target.value })}
                  className="bg-slate-700 border-slate-600 text-white rounded px-2 py-1 w-full"
                >
                  <option value="cards">Cards</option>
                  <option value="slider">Slider</option>
                  <option value="grid">Grid</option>
                </select>
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
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">
              {element.data.title}
            </h3>
            {isEditing ? (
              <div className="space-y-4">
                <Input
                  value={element.data.title}
                  onChange={(e) => handleDataUpdate({ title: e.target.value })}
                  placeholder="Map section title"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <Input
                  value={element.data.address}
                  onChange={(e) => handleDataUpdate({ address: e.target.value })}
                  placeholder="Address or location"
                  className="bg-slate-700 border-slate-600 text-white"
                />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-white text-sm mb-1 block">Zoom Level</label>
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
                    <label className="text-white text-sm mb-1 block">Map Type</label>
                    <select
                      value={element.data.mapType}
                      onChange={(e) => handleDataUpdate({ mapType: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white rounded px-2 py-2 w-full"
                    >
                      <option value="roadmap">Roadmap</option>
                      <option value="satellite">Satellite</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="terrain">Terrain</option>
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
                  <span className="text-white text-sm">Show location marker</span>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        );

      case "aiChatbot":
        return (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4 text-center">
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
                  <label className="text-white text-sm">Knowledge Base Content:</label>
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
                  <label className="text-white text-sm">PDF Documents:</label>
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
                    <label className="text-white text-sm mb-1 block">Position</label>
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
                    <label className="text-white text-sm mb-1 block">Primary Color</label>
                    <Input
                      type="color"
                      value={element.data.appearance.primaryColor}
                      onChange={(e) => handleDataUpdate({ 
                        appearance: { 
                          ...element.data.appearance, 
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
                  <span className="text-white text-sm">Enable chatbot</span>
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
      <Collapsible open={isExpanded}>
        <CollapsibleTrigger 
          onClick={toggleExpanded}
          className="w-full mb-2"
          data-testid={`toggle-${element.type}-${element.id}`}
        >
          <div className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {getElementTitle()}
              </span>
              <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
                {element.type}
              </span>
            </div>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} text-xs text-slate-500`}></i>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {renderElement()}
        </CollapsibleContent>
      </Collapsible>
      {isEditing && onDelete && (
        <Button
          onClick={() => onDelete(element.id)}
          variant="destructive"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
          data-testid={`delete-${element.type}-${element.id}`}
        >
          <i className="fas fa-trash text-xs"></i>
        </Button>
      )}
    </div>
  );
}