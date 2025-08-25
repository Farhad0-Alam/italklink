import { forwardRef, useState } from "react";
import { BusinessCard } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { generateShareUrl } from "@/lib/share";
import { PageElementRenderer } from "./page-element";
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessCardProps {
  data: BusinessCard;
  showQR?: boolean;
  isInteractive?: boolean;
}

export const BusinessCardComponent = forwardRef<HTMLDivElement, BusinessCardProps>(
  ({ data, showQR = false, isInteractive = true }, ref) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [showShareMenu, setShowShareMenu] = useState(false);
    const { toast } = useToast();

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

    const handleShare = async (platform?: string) => {
      const url = shareUrl;
      const text = `Check out ${data.fullName}'s business card`;
      
      if (platform === 'copy') {
        try {
          await navigator.clipboard.writeText(url);
          toast({
            title: "Link copied!",
            description: "Business card link copied to clipboard",
          });
        } catch (err) {
          toast({
            title: "Copy failed",
            description: "Please copy the link manually",
            variant: "destructive",
          });
        }
        setShowShareMenu(false);
        return;
      }

      let shareUrl_platform = '';
      switch (platform) {
        case 'facebook':
          shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case 'twitter':
          shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case 'linkedin':
          shareUrl_platform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case 'whatsapp':
          shareUrl_platform = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
          break;
        default:
          if (navigator.share) {
            try {
              await navigator.share({
                title: text,
                url: url,
              });
            } catch (err) {
              console.log('Share cancelled');
            }
          } else {
            await handleShare('copy');
          }
          setShowShareMenu(false);
          return;
      }
      
      if (shareUrl_platform) {
        window.open(shareUrl_platform, '_blank', 'width=600,height=400');
        setShowShareMenu(false);
      }
    };

    // Use sample image for preview when no profile photo
    const profileImageSrc = data.profilePhoto || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300";
    
    // Helper function to get section-specific styling with global fallback
    const getSectionStyle = (section: 'basicInfo' | 'contactInfo' | 'socialMedia', styleType: string) => {
      const sectionStyle = data.sectionStyles?.[section];
      const globalStyle = data[styleType as keyof typeof data];
      
      if (sectionStyle && sectionStyle[styleType as keyof typeof sectionStyle]) {
        return sectionStyle[styleType as keyof typeof sectionStyle];
      }
      
      return globalStyle;
    };
    

    // Generate gradient style if enabled
    const gradientStyle = data.useGradient && data.gradientStops?.length > 0 
      ? {
          background: `linear-gradient(${data.gradientAngle || 90}deg, ${
            data.gradientStops
              .sort((a, b) => a.position - b.position)
              .map(stop => `${stop.color} ${stop.position}%`)
              .join(', ')
          })`
        }
      : {};

    return (
      <div 
        ref={ref} 
        className="rounded-2xl shadow-2xl overflow-hidden max-w-sm mx-auto card-shadow"
        style={{ 
          backgroundColor: data.backgroundColor || '#ffffff',
          fontFamily: data.font ? `var(--font-${data.font})` : 'var(--font-inter)'
        }}
      >
        <div className="relative">
          {/* Header Design - Cover + Logo */}
          {(data.headerDesign === 'cover-logo' || !data.headerDesign) && (
            <div 
              className="h-40 relative"
              style={{ 
                backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
                backgroundColor: !data.backgroundImage && !data.useGradient ? data.brandColor || '#22c55e' : undefined,
                ...(data.useGradient && !data.backgroundImage ? gradientStyle : {}),
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Logo in top left corner */}
              {data.logo && (
                <div className="absolute top-4 left-4 z-10">
                  <img 
                    src={data.logo}
                    alt="Logo"
                    className="h-8 w-auto max-w-20 object-contain"
                    data-testid="img-logo"
                  />
                </div>
              )}
              
              {/* Profile Photo with White Border */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 z-30">
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
          )}

          {/* Header Design - Profile Center */}
          {data.headerDesign === 'profile-center' && (
            <div 
              className="h-32 relative"
              style={{ 
                backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
                backgroundColor: !data.backgroundImage && !data.useGradient ? data.brandColor || '#22c55e' : undefined,
                ...(data.useGradient && !data.backgroundImage ? gradientStyle : {}),
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            >
              {/* Large Profile Photo */}
              <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
                <div className="w-32 h-32 rounded-full bg-white p-2">
                  <img 
                    src={profileImageSrc}
                    alt={data.fullName || "Profile photo"}
                    className="w-full h-full rounded-full object-cover"
                    data-testid="img-profile-photo"
                  />
                </div>
              </div>
              
              {/* Logo in top right */}
              {data.logo && (
                <div className="absolute top-4 right-4 z-10">
                  <img 
                    src={data.logo}
                    alt="Logo"
                    className="h-6 w-auto max-w-16 object-contain"
                    data-testid="img-logo"
                  />
                </div>
              )}
            </div>
          )}

          {/* Header Design - Split Layout */}
          {data.headerDesign === 'split-design' && (
            <div className="h-40 relative flex">
              {/* Left side - Cover */}
              <div 
                className="flex-1 relative"
                style={{ 
                  backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
                  backgroundColor: !data.backgroundImage && !data.useGradient ? data.brandColor || '#22c55e' : undefined,
                  ...(data.useGradient && !data.backgroundImage ? gradientStyle : {}),
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* Profile Photo on left side */}
                <div className="absolute -bottom-12 right-4 z-30">
                  <div className="w-20 h-20 rounded-full bg-white p-1">
                    <img 
                      src={profileImageSrc}
                      alt={data.fullName || "Profile photo"}
                      className="w-full h-full rounded-full object-cover"
                      data-testid="img-profile-photo"
                    />
                  </div>
                </div>
              </div>
              
              {/* Right side - Logo space */}
              <div 
                className="w-24 flex items-center justify-center z-10"
                style={{ backgroundColor: data.accentColor || '#16a34a' }}
              >
                {data.logo && (
                  <img 
                    src={data.logo}
                    alt="Logo"
                    className="h-12 w-auto max-w-20 object-contain"
                    data-testid="img-logo"
                  />
                )}
              </div>
            </div>
          )}
        </div>
          
        {/* Content */}
        <div className={`pb-8 px-6 text-center text-slate-800 ${
          data.headerDesign === 'profile-center' ? 'pt-20' : 
          data.headerDesign === 'split-design' ? 'pt-16' : 'pt-16'
        }`}>
          {/* Name, Title, Company */}
          <h3 
            className="text-xl font-bold mb-1" 
            style={{
              color: getSectionStyle('basicInfo', 'nameColor') || data.headingColor || '#1f2937',
              fontSize: `${getSectionStyle('basicInfo', 'nameFontSize') || (data.headingSize || 20) + 4}px`,
              fontWeight: getSectionStyle('basicInfo', 'nameFontWeight') || data.headingWeight || 600,
              fontFamily: getSectionStyle('basicInfo', 'nameFont') || 'Inter, sans-serif',
              fontStyle: getSectionStyle('basicInfo', 'nameTextStyle') || 'normal'
            }}
            data-testid="text-name"
          >
            {data.fullName || "Your Name"}
          </h3>
          <p 
            className="text-sm mb-2" 
            style={{
              color: getSectionStyle('basicInfo', 'titleColor') || data.paragraphColor || '#4b5563',
              fontSize: `${getSectionStyle('basicInfo', 'titleFontSize') || data.paragraphSize || 14}px`,
              fontWeight: getSectionStyle('basicInfo', 'titleFontWeight') || data.paragraphWeight || 400,
              fontFamily: getSectionStyle('basicInfo', 'titleFont') || 'Inter, sans-serif',
              fontStyle: getSectionStyle('basicInfo', 'titleTextStyle') || 'normal'
            }}
            data-testid="text-title"
          >
            {data.title || "Your Title"}
          </p>
          {data.company && (
            <p 
              className="text-sm mb-4" 
              style={{
                color: getSectionStyle('basicInfo', 'companyColor') || '#6b7280',
                fontSize: `${getSectionStyle('basicInfo', 'companyFontSize') || data.paragraphSize || 14}px`,
                fontWeight: getSectionStyle('basicInfo', 'companyFontWeight') || data.paragraphWeight || 400,
                fontFamily: getSectionStyle('basicInfo', 'companyFont') || 'Inter, sans-serif',
                fontStyle: getSectionStyle('basicInfo', 'companyTextStyle') || 'normal'
              }}
              data-testid="text-company"
            >
              {data.company}
            </p>
          )}
          
          {/* Contact Icons - Always Show */}
          <div className="flex justify-center space-x-3 mb-6 flex-wrap gap-y-3">
            {data.phone && (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleContactAction('phone', data.phone)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                  style={{ 
                    backgroundColor: getSectionStyle('contactInfo', 'iconBackgroundColor') || '#475569',
                    color: getSectionStyle('contactInfo', 'iconColor') || '#ffffff'
                  }}
                  data-testid="button-contact-phone"
                >
                  <i className="fas fa-phone text-sm"></i>
                </button>
                <span 
                  className="text-xs"
                  style={{ 
                    color: getSectionStyle('contactInfo', 'iconTextColor') || '#64748b',
                    fontSize: `${getSectionStyle('contactInfo', 'iconTextSize') || 12}px`,
                    fontWeight: getSectionStyle('contactInfo', 'iconTextWeight') || 400,
                    fontFamily: getSectionStyle('contactInfo', 'iconTextFont') || 'Inter, sans-serif',
                    fontStyle: getSectionStyle('contactInfo', 'iconTextStyle') || 'normal'
                  }}
                >
                  Phone
                </span>
              </div>
            )}
            {data.email && (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleContactAction('email', data.email)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                  style={{ 
                    backgroundColor: getSectionStyle('contactInfo', 'iconBackgroundColor') || '#475569',
                    color: getSectionStyle('contactInfo', 'iconColor') || '#ffffff'
                  }}
                  data-testid="button-contact-email"
                >
                  <i className="fas fa-envelope text-sm"></i>
                </button>
                <span 
                  className="text-xs"
                  style={{ 
                    color: getSectionStyle('contactInfo', 'iconTextColor') || '#64748b',
                    fontSize: `${getSectionStyle('contactInfo', 'iconTextSize') || 12}px`,
                    fontWeight: getSectionStyle('contactInfo', 'iconTextWeight') || 400,
                    fontFamily: getSectionStyle('contactInfo', 'iconTextFont') || 'Inter, sans-serif',
                    fontStyle: getSectionStyle('contactInfo', 'iconTextStyle') || 'normal'
                  }}
                >
                  Email
                </span>
              </div>
            )}
            {data.whatsapp && (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleContactAction('whatsapp', data.whatsapp)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-talklink-600 transition-colors mb-1"
                  style={{ 
                    backgroundColor: getSectionStyle('contactInfo', 'iconBackgroundColor') || data.brandColor || '#22c55e',
                    color: getSectionStyle('contactInfo', 'iconColor') || '#ffffff'
                  }}
                  data-testid="button-contact-whatsapp"
                >
                  <i className="fab fa-whatsapp text-sm"></i>
                </button>
                <span 
                  className="text-xs"
                  style={{ 
                    color: getSectionStyle('contactInfo', 'iconTextColor') || '#64748b',
                    fontSize: `${getSectionStyle('contactInfo', 'iconTextSize') || 12}px`,
                    fontWeight: getSectionStyle('contactInfo', 'iconTextWeight') || 400,
                    fontFamily: getSectionStyle('contactInfo', 'iconTextFont') || 'Inter, sans-serif',
                    fontStyle: getSectionStyle('contactInfo', 'iconTextStyle') || 'normal'
                  }}
                >
                  WhatsApp
                </span>
              </div>
            )}
            {/* Custom Contact Methods */}
            {data.customContacts?.map((contact) => (
              contact.value && contact.label && (
                <div key={contact.id} className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction(contact.type, contact.value)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                    style={{ 
                      backgroundColor: getSectionStyle('contactInfo', 'iconBackgroundColor') || '#475569',
                      color: getSectionStyle('contactInfo', 'iconColor') || '#ffffff'
                    }}
                    data-testid={`button-custom-contact-${contact.id}`}
                  >
                    <i className={`${contact.icon} text-sm`}></i>
                  </button>
                  <span 
                    className="text-xs"
                    style={{ 
                      color: getSectionStyle('contactInfo', 'iconTextColor') || '#64748b',
                      fontSize: `${getSectionStyle('contactInfo', 'iconTextSize') || 12}px`,
                      fontWeight: getSectionStyle('contactInfo', 'iconTextWeight') || 400,
                      fontFamily: getSectionStyle('contactInfo', 'iconTextFont') || 'Inter, sans-serif',
                      fontStyle: getSectionStyle('contactInfo', 'iconTextStyle') || 'normal'
                    }}
                  >
                    {contact.label}
                  </span>
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
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors mb-1"
                  style={{ 
                    backgroundColor: getSectionStyle('socialMedia', 'iconBackgroundColor') || '#475569',
                    color: getSectionStyle('socialMedia', 'iconColor') || '#ffffff'
                  }}
                  data-testid="button-social-linkedin"
                >
                  <i className="fab fa-linkedin-in text-sm"></i>
                </button>
                <span 
                  className="text-xs"
                  style={{ 
                    color: getSectionStyle('socialMedia', 'iconTextColor') || '#64748b',
                    fontSize: `${getSectionStyle('socialMedia', 'iconTextSize') || 12}px`,
                    fontWeight: getSectionStyle('socialMedia', 'iconTextWeight') || 400,
                    fontFamily: getSectionStyle('socialMedia', 'iconTextFont') || 'Inter, sans-serif',
                    fontStyle: getSectionStyle('socialMedia', 'iconTextStyle') || 'normal'
                  }}
                >
                  LinkedIn
                </span>
              </div>
            )}
            {data.instagram && (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleContactAction('instagram', data.instagram)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-pink-500 transition-colors mb-1"
                  style={{ 
                    backgroundColor: getSectionStyle('socialMedia', 'iconBackgroundColor') || '#475569',
                    color: getSectionStyle('socialMedia', 'iconColor') || '#ffffff'
                  }}
                  data-testid="button-social-instagram"
                >
                  <i className="fab fa-instagram text-sm"></i>
                </button>
                <span 
                  className="text-xs"
                  style={{ 
                    color: getSectionStyle('socialMedia', 'iconTextColor') || '#64748b',
                    fontSize: `${getSectionStyle('socialMedia', 'iconTextSize') || 12}px`,
                    fontWeight: getSectionStyle('socialMedia', 'iconTextWeight') || 400,
                    fontFamily: getSectionStyle('socialMedia', 'iconTextFont') || 'Inter, sans-serif',
                    fontStyle: getSectionStyle('socialMedia', 'iconTextStyle') || 'normal'
                  }}
                >
                  Instagram
                </span>
              </div>
            )}
            {data.twitter && (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleContactAction('twitter', data.twitter)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-400 transition-colors mb-1"
                  style={{ 
                    backgroundColor: getSectionStyle('socialMedia', 'iconBackgroundColor') || '#475569',
                    color: getSectionStyle('socialMedia', 'iconColor') || '#ffffff'
                  }}
                  data-testid="button-social-twitter"
                >
                  <i className="fab fa-twitter text-sm"></i>
                </button>
                <span 
                  className="text-xs"
                  style={{ 
                    color: getSectionStyle('socialMedia', 'iconTextColor') || '#64748b',
                    fontSize: `${getSectionStyle('socialMedia', 'iconTextSize') || 12}px`,
                    fontWeight: getSectionStyle('socialMedia', 'iconTextWeight') || 400,
                    fontFamily: getSectionStyle('socialMedia', 'iconTextFont') || 'Inter, sans-serif',
                    fontStyle: getSectionStyle('socialMedia', 'iconTextStyle') || 'normal'
                  }}
                >
                  Twitter
                </span>
              </div>
            )}
            {data.facebook && (
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleContactAction('facebook', data.facebook)}
                  className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors mb-1"
                  style={{ 
                    backgroundColor: getSectionStyle('socialMedia', 'iconBackgroundColor') || '#475569',
                    color: getSectionStyle('socialMedia', 'iconColor') || '#ffffff'
                  }}
                  data-testid="button-social-facebook"
                >
                  <i className="fab fa-facebook-f text-sm"></i>
                </button>
                <span 
                  className="text-xs"
                  style={{ 
                    color: getSectionStyle('socialMedia', 'iconTextColor') || '#64748b',
                    fontSize: `${getSectionStyle('socialMedia', 'iconTextSize') || 12}px`,
                    fontWeight: getSectionStyle('socialMedia', 'iconTextWeight') || 400,
                    fontFamily: getSectionStyle('socialMedia', 'iconTextFont') || 'Inter, sans-serif',
                    fontStyle: getSectionStyle('socialMedia', 'iconTextStyle') || 'normal'
                  }}
                >
                  Facebook
                </span>
              </div>
            )}
            {/* Custom Social Platforms */}
            {data.customSocials?.map((social) => (
              social.value && (
                <div key={social.id} className="flex flex-col items-center">
                  <button 
                    onClick={() => handleContactAction(social.platform, social.value)}
                    className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-talklink-500 transition-colors mb-1"
                    style={{ 
                      backgroundColor: getSectionStyle('socialMedia', 'iconBackgroundColor') || getSectionStyle('socialMedia', 'primaryColor') || '#475569',
                      color: getSectionStyle('socialMedia', 'iconColor') || '#ffffff'
                    }}
                    data-testid={`button-custom-social-${social.id}`}
                  >
                    <i className={`${social.icon} text-sm`}></i>
                  </button>
                  <span 
                    className="text-xs"
                    style={{ 
                      color: getSectionStyle('socialMedia', 'iconTextColor') || '#64748b',
                      fontSize: `${getSectionStyle('socialMedia', 'iconTextSize') || 12}px`,
                      fontWeight: getSectionStyle('socialMedia', 'iconTextWeight') || 400,
                      fontFamily: getSectionStyle('socialMedia', 'iconTextFont') || 'Inter, sans-serif',
                      fontStyle: getSectionStyle('socialMedia', 'iconTextStyle') || 'normal'
                    }}
                  >
                    {social.label || 'Social'}
                  </span>
                </div>
              )
            ))}
          </div>


          {/* Page Elements */}
          {data.pageElements && data.pageElements.length > 0 && (
            <div className="space-y-4 mb-6">
              {data.pageElements.map((element) => (
                <PageElementRenderer key={element.id} element={element} isInteractive={isInteractive} cardData={data} />
              ))}
            </div>
          )}

          {/* Company & Contact Info */}
          {(data.company || data.website || data.location) && (
            <Collapsible open={expandedSections.company}>
              <CollapsibleTrigger 
                onClick={() => toggleSection('company')}
                className="w-full mb-4"
              >
                <div className="flex items-center justify-center space-x-2">
                  <span 
                    className="text-sm font-medium"
                    style={{ color: data.brandColor || '#22c55e' }}
                  >
                    Company Info
                  </span>
                  <i className={`fas fa-chevron-${expandedSections.company ? 'up' : 'down'} text-xs`}></i>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mb-6">
                {data.company && <p className="text-sm text-slate-600">{data.company}</p>}
                {data.website && (
                  <button 
                    onClick={() => handleContactAction('website', data.website)}
                    className="text-sm underline"
                    style={{ color: data.brandColor || '#22c55e' }}
                    data-testid="button-website"
                  >
                    Visit Website
                  </button>
                )}
                {data.location && <p className="text-sm text-slate-600">{data.location}</p>}
              </CollapsibleContent>
            </Collapsible>
          )}

          
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

          {/* Floating Share Button */}
          {isInteractive && (
            <div className="absolute top-4 right-4 z-10">
              <div className="relative">
                <Button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  size="sm"
                  className="w-10 h-10 rounded-full p-0 bg-white/90 hover:bg-white shadow-lg border"
                  variant="outline"
                  data-testid="button-share-card"
                >
                  <Share2 className="h-4 w-4 text-gray-700" />
                </Button>
                
                {/* Share Menu */}
                {showShareMenu && (
                  <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border p-2 min-w-48 z-20">
                    <div className="space-y-1">
                      <Button
                        onClick={() => handleShare('copy')}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        onClick={() => handleShare('whatsapp')}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={() => handleShare('facebook')}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        onClick={() => handleShare('twitter')}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        onClick={() => handleShare('linkedin')}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Linkedin className="h-4 w-4 mr-2" />
                        LinkedIn
                      </Button>
                      <hr className="my-1" />
                      <Button
                        onClick={() => handleShare()}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        More Options
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

BusinessCardComponent.displayName = "BusinessCard";