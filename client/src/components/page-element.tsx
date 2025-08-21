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
                    value={element.data.title}
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
                            value={element.data.receiverEmail || ""}
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