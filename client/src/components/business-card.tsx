import { forwardRef, useState } from "react";
import { BusinessCard } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { generateShareUrl } from "@/lib/share";
import { PageElementRenderer } from "./page-element";

interface BusinessCardProps {
  data: BusinessCard;
  showQR?: boolean;
  isInteractive?: boolean;
}

export const BusinessCardComponent = forwardRef<HTMLDivElement, BusinessCardProps>(
  ({ data, showQR = false, isInteractive = true }, ref) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const toggleSection = (section: string) => {
      if (!isInteractive) return;
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const handleContactAction = (type: string, value?: string) => {
      if (!isInteractive || !value) return;
      
      switch (type) {
        case 'phone':
          window.open(`tel:${value}`);
          break;
        case 'email':
          window.open(`mailto:${value}`);
          break;
        case 'whatsapp':
          window.open(`https://wa.me/${value.replace(/[^\d]/g, '')}`);
          break;
        case 'website':
          window.open(value, '_blank');
          break;
        case 'linkedin':
          window.open(value.startsWith('http') ? value : `https://${value}`, '_blank');
          break;
        case 'instagram':
          const instaHandle = value.replace('@', '');
          window.open(`https://instagram.com/${instaHandle}`, '_blank');
          break;
        case 'twitter':
          const twitterHandle = value.replace('@', '');
          window.open(`https://twitter.com/${twitterHandle}`, '_blank');
          break;
        case 'facebook':
          window.open(value.startsWith('http') ? value : `https://facebook.com/${value}`, '_blank');
          break;
      }
    };

    const shareUrl = generateShareUrl(data);

    // Use sample image for preview when no profile photo
    const profileImageSrc = data.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300";
    
    // Sample gallery images when none provided
    const galleryImages = data.galleryImages.length > 0 ? data.galleryImages : [
      "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200",
      "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60",
      "https://images.unsplash.com/photo-1549923746-c502d488b3ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60"
    ];

    return (
      <div ref={ref} className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-sm mx-auto card-shadow">
        <div className="relative">
          {/* Cover Photo with Logo */}
          <div 
            className="h-40 relative overflow-hidden"
            style={{ 
              background: data.backgroundImage 
                ? `url(${data.backgroundImage})` 
                : `linear-gradient(135deg, ${data.brandColor || '#22c55e'}, ${data.accentColor || '#16a34a'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Logo in top left corner */}
            {data.logo && (
              <div className="absolute top-4 left-4">
                <img 
                  src={data.logo}
                  alt="Logo"
                  className="h-8 w-auto max-w-20 object-contain"
                  data-testid="img-logo"
                />
              </div>
            )}
            
            {/* Profile Photo with White Border */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
              <div className="w-24 h-24 rounded-full bg-white p-1">
                <img 
                  src={profileImageSrc}
                  alt={data.fullName || "Profile photo"}
                  className="w-full h-full rounded-full object-cover"
                  data-testid="img-profile-photo"
                />
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="pt-16 pb-8 px-6 text-center text-slate-800">
            {/* Name & Title */}
            <h3 className="text-xl font-bold text-slate-800 mb-1" data-testid="text-name">
              {data.fullName || "Your Name"}
            </h3>
            <p className="text-sm text-slate-600 mb-4" data-testid="text-title">
              {data.title || "Your Title"}
            </p>
            
            {/* Contact Icons - Always Show */}
            <div className="flex justify-center space-x-3 mb-6 flex-wrap gap-y-3">
              {data.phone && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction('phone', data.phone)}
                    className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                    data-testid="button-contact-phone"
                  >
                    <i className="fas fa-phone text-sm"></i>
                  </button>
                  <span className="text-xs text-slate-600">Phone</span>
                </div>
              )}
              {data.email && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction('email', data.email)}
                    className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                    data-testid="button-contact-email"
                  >
                    <i className="fas fa-envelope text-sm"></i>
                  </button>
                  <span className="text-xs text-slate-600">Email</span>
                </div>
              )}
              <div className="flex flex-col items-center">
                <button className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1">
                  <i className="fas fa-comment text-sm"></i>
                </button>
                <span className="text-xs text-slate-600">Text</span>
              </div>
              {data.whatsapp && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction('whatsapp', data.whatsapp)}
                    className="w-10 h-10 text-white rounded-full flex items-center justify-center hover:bg-talklink-600 transition-colors mb-1"
                    style={{ backgroundColor: data.brandColor || '#22c55e' }}
                    data-testid="button-contact-whatsapp"
                  >
                    <i className="fab fa-whatsapp text-sm"></i>
                  </button>
                  <span className="text-xs text-slate-600">WhatsApp</span>
                </div>
              )}
              {/* Custom Contact Methods */}
              {data.customContacts?.map((contact) => (
                contact.value && (
                  <div key={contact.id} className="flex flex-col items-center">
                    <button 
                      onClick={() => handleContactAction(contact.type, contact.value)}
                      className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                      data-testid={`button-custom-contact-${contact.id}`}
                    >
                      <i className={`${contact.icon} text-sm`}></i>
                    </button>
                    <span className="text-xs text-slate-600">{contact.label || 'Contact'}</span>
                  </div>
                )
              ))}
            </div>
            
            {/* Social Icons */}
            <div className="flex justify-center space-x-4 mb-6 flex-wrap gap-y-3">
              {data.linkedin && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction('linkedin', data.linkedin)}
                    className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors mb-1"
                    data-testid="button-social-linkedin"
                  >
                    <i className="fab fa-linkedin-in text-sm"></i>
                  </button>
                  <span className="text-xs text-slate-600">LinkedIn</span>
                </div>
              )}
              {data.instagram && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction('instagram', data.instagram)}
                    className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors mb-1"
                    data-testid="button-social-instagram"
                  >
                    <i className="fab fa-instagram text-sm"></i>
                  </button>
                  <span className="text-xs text-slate-600">Instagram</span>
                </div>
              )}
              {data.twitter && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction('twitter', data.twitter)}
                    className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-black transition-colors mb-1"
                    data-testid="button-social-twitter"
                  >
                    <i className="fab fa-twitter text-sm"></i>
                  </button>
                  <span className="text-xs text-slate-600">Twitter</span>
                </div>
              )}
              {data.facebook && (
                <div className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction('facebook', data.facebook)}
                    className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors mb-1"
                    data-testid="button-social-facebook"
                  >
                    <i className="fab fa-facebook-f text-sm"></i>
                  </button>
                  <span className="text-xs text-slate-600">Facebook</span>
                </div>
              )}
              {/* Custom Social Media */}
              {data.customSocials?.map((social) => (
                social.value && (
                  <div key={social.id} className="flex flex-col items-center">
                    <button 
                      onClick={() => {
                        if (!isInteractive || !social.value) return;
                        const url = social.value.startsWith('http') ? social.value : `https://${social.platform.toLowerCase()}.com/${social.value.replace('@', '')}`;
                        window.open(url, '_blank');
                      }}
                      className="w-10 h-10 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors mb-1"
                      data-testid={`button-social-${social.id}`}
                    >
                      <i className={`${social.icon} text-sm`}></i>
                    </button>
                    <span className="text-xs text-slate-600">{social.platform || social.label || 'Social'}</span>
                  </div>
                )
              ))}
            </div>
            
            {/* Action Buttons */}
            <div className="space-y-2 mb-6">
              <div className="flex space-x-2">
                <button className="flex-1 bg-slate-800 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors">
                  <i className="fas fa-address-book mr-2"></i>Save Contacts
                </button>
                <button className="text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-80 transition-colors"
                        style={{ backgroundColor: data.brandColor || '#22c55e' }}>
                  <i className="fas fa-share mr-1"></i>Share
                </button>
              </div>
              {data.website && (
                <button 
                  onClick={() => handleContactAction('website', data.website)}
                  className="w-full text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-80 transition-colors"
                  style={{ backgroundColor: data.brandColor || '#22c55e' }}
                  data-testid="button-website"
                >
                  <i className="fas fa-globe mr-2"></i>Website
                </button>
              )}
              {data.customUrl && (
                <div className="w-full border-2 rounded-lg p-3"
                     style={{ borderColor: data.brandColor || '#22c55e' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs text-slate-600 mb-1">My Card URL</p>
                      <p className="text-sm font-medium text-slate-800" data-testid="text-custom-url">
                        yoursite.com/{data.customUrl}
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        if (!isInteractive) return;
                        navigator.clipboard.writeText(`yoursite.com/${data.customUrl}`);
                      }}
                      className="text-white py-2 px-3 rounded text-xs font-medium hover:opacity-80 transition-colors"
                      style={{ backgroundColor: data.brandColor || '#22c55e' }}
                      data-testid="button-copy-url"
                    >
                      <i className="fas fa-copy mr-1"></i>Copy
                    </button>
                  </div>
                </div>
              )}
              <button className="w-full text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-80 transition-colors"
                      style={{ backgroundColor: data.brandColor || '#22c55e' }}>
                <i className="fas fa-calendar mr-2"></i>Book Now
              </button>
            </div>
            
            {/* Dynamic Page Elements */}
            {data.pageElements && data.pageElements.length > 0 && (
              <div className="mb-6">
                {data.pageElements
                  .sort((a, b) => a.order - b.order)
                  .map((element) => (
                    <PageElementRenderer
                      key={element.id}
                      element={element}
                      isEditing={false}
                    />
                  ))
                }
              </div>
            )}
            
            {/* Expandable Sections */}
            <div className="space-y-2 mb-6">
              {data.about && (
                <Collapsible 
                  open={expandedSections.about} 
                  onOpenChange={() => toggleSection('about')}
                >
                  <CollapsibleTrigger asChild>
                    <button 
                      className="w-full text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-80 transition-colors flex justify-between items-center"
                      style={{ backgroundColor: data.brandColor || '#22c55e' }}
                      data-testid="button-toggle-about"
                    >
                      <span>About me</span>
                      <i className={`fas fa-chevron-${expandedSections.about ? 'up' : 'down'} text-xs`}></i>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 text-left">
                    {data.about}
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {data.vision && (
                <Collapsible 
                  open={expandedSections.vision} 
                  onOpenChange={() => toggleSection('vision')}
                >
                  <CollapsibleTrigger asChild>
                    <button 
                      className="w-full text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-80 transition-colors flex justify-between items-center"
                      style={{ backgroundColor: data.brandColor || '#22c55e' }}
                      data-testid="button-toggle-vision"
                    >
                      <span>Vision</span>
                      <i className={`fas fa-chevron-${expandedSections.vision ? 'up' : 'down'} text-xs`}></i>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 text-left">
                    {data.vision}
                  </CollapsibleContent>
                </Collapsible>
              )}
              
              {data.mission && (
                <Collapsible 
                  open={expandedSections.mission} 
                  onOpenChange={() => toggleSection('mission')}
                >
                  <CollapsibleTrigger asChild>
                    <button 
                      className="w-full text-white py-2 px-4 rounded-lg text-sm font-medium hover:opacity-80 transition-colors flex justify-between items-center"
                      style={{ backgroundColor: data.brandColor || '#22c55e' }}
                      data-testid="button-toggle-mission"
                    >
                      <span>Mission</span>
                      <i className={`fas fa-chevron-${expandedSections.mission ? 'up' : 'down'} text-xs`}></i>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-700 text-left">
                    {data.mission}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
            
            {/* Image Gallery */}
            <div className="mb-6">
              <img 
                src={galleryImages[currentImageIndex]}
                alt="Gallery image"
                className="w-full h-32 object-cover rounded-lg mb-2"
                data-testid="img-gallery-main"
              />
              <div className="flex space-x-2 justify-center">
                {galleryImages.slice(0, 5).map((img, index) => (
                  <img 
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`w-8 h-8 object-cover rounded cursor-pointer border-2 ${
                      index === currentImageIndex 
                        ? 'border-talklink-500' 
                        : 'border-slate-300'
                    }`}
                    style={index === currentImageIndex ? { borderColor: data.brandColor || '#22c55e' } : {}}
                    onClick={() => setCurrentImageIndex(index)}
                    data-testid={`img-gallery-thumb-${index}`}
                  />
                ))}
              </div>
            </div>
            
            {/* Contact Form */}
            <div 
              className="border-2 rounded-lg p-4 mb-6"
              style={{ borderColor: data.brandColor || '#22c55e' }}
            >
              <h4 
                className="font-semibold mb-3"
                style={{ color: data.brandColor || '#22c55e' }}
              >
                Add Contact Title here
              </h4>
              <div className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Full Name" 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  data-testid="input-contact-name"
                />
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  data-testid="input-contact-email"
                />
                <input 
                  type="tel" 
                  placeholder="Phone" 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  data-testid="input-contact-phone"
                />
                <textarea 
                  placeholder="Message" 
                  rows={3} 
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm"
                  data-testid="textarea-contact-message"
                />
                <button 
                  className="w-full text-white py-2 rounded font-medium hover:opacity-80 transition-colors"
                  style={{ backgroundColor: data.brandColor || '#22c55e' }}
                  data-testid="button-send-message"
                >
                  Send Message
                </button>
              </div>
            </div>
            
            {/* QR Code */}
            {showQR && (
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-2">Scan me</p>
                <div className="inline-block p-2 bg-white border border-slate-200 rounded-lg">
                  <QRCodeSVG 
                    value={shareUrl.length > 200 ? shareUrl.substring(0, 200) : shareUrl}
                    size={80}
                    level="L"
                    includeMargin={false}
                  />
                </div>
                <p 
                  className="text-xs mt-2 font-medium"
                  style={{ color: data.brandColor || '#22c55e' }}
                >
                  Share my eCardURL
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

BusinessCardComponent.displayName = "BusinessCard";
