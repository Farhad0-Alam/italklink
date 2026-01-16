import { forwardRef, useState } from "react";
import { BusinessCard } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { generateShareUrl } from "@/lib/share";
import { PageElementRenderer } from "@/elements/PageElementRenderer";
import DynamicHeaderRenderer from "./DynamicHeaderRenderer";
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  // Remove # if present
  const hex = color.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  
  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  const newHex = ((newR << 16) | (newG << 8) | newB).toString(16).padStart(6, '0');
  return `#${newHex}`;
};

interface BusinessCardProps {
  data: BusinessCard;
  showQR?: boolean;
  isInteractive?: boolean;
  isMobilePreview?: boolean;
}

export const BusinessCardComponent = forwardRef<HTMLDivElement, BusinessCardProps>(
  ({ data, showQR = false, isInteractive = true, isMobilePreview = false }, ref) => {
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
    

    // Simple gradient style for basic background support
    const gradientStyle = {};

    return (
      <div 
        ref={ref} 
        className={`overflow-hidden w-full mx-auto ${
          isMobilePreview 
            ? 'rounded-none shadow-none min-h-full' 
            : 'rounded-none md:rounded-2xl shadow-none md:shadow-2xl card-shadow'
        }`}
        style={{ 
          maxWidth: isMobilePreview ? '100%' : '430px',
          backgroundColor: isMobilePreview ? 'transparent' : (data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? '#1a1a1a' : (data.backgroundColor || '#ffffff')),
          fontFamily: data.font ? `var(--font-${data.font})` : 'var(--font-inter)',
          color: data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? '#ffffff' : (data.textColor || '#000000'),
          minHeight: isMobilePreview ? '100%' : 'auto'
        }}
      >
        <div className="relative">
          {/* Header Design - Cover + Logo */}
              {(data.headerDesign === 'cover-logo' || !data.headerDesign) && (
                <div 
                  className="h-40 relative"
                  style={{ 
                    backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
                    backgroundColor: !data.backgroundImage ? data.brandColor || '#22c55e' : undefined,
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
                    backgroundColor: !data.backgroundImage ? data.brandColor || '#22c55e' : undefined,
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
                      backgroundColor: !data.backgroundImage ? data.brandColor || '#22c55e' : undefined,
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
        <div className={`pb-8 px-6 text-center ${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'text-white' : 'text-slate-800'} ${
          data.headerDesign === 'profile-center' ? 'pt-20' : 
          data.headerDesign === 'split-design' ? 'pt-16' : 'pt-16'
        }`}>
          {/* Name, Title, Company */}
          <h3 
            className="text-xl font-bold mb-1" 
            style={{
              color: getSectionStyle('basicInfo', 'nameColor') || data.headingColor || (data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? '#ffffff' : '#1f2937'),
              fontSize: `${getSectionStyle('basicInfo', 'nameFontSize') || (data.headingFontSize || 20) + 4}px`,
              fontWeight: getSectionStyle('basicInfo', 'nameFontWeight') || data.headingFontWeight || 600,
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
              color: getSectionStyle('basicInfo', 'titleColor') || data.paragraphColor || (data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? '#e5e7eb' : '#4b5563'),
              fontSize: `${getSectionStyle('basicInfo', 'titleFontSize') || data.paragraphFontSize || 14}px`,
              fontWeight: getSectionStyle('basicInfo', 'titleFontWeight') || data.paragraphFontWeight || 400,
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
                color: getSectionStyle('basicInfo', 'companyColor') || (data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? '#d1d5db' : '#6b7280'),
                fontSize: `${getSectionStyle('basicInfo', 'companyFontSize') || data.paragraphFontSize || 14}px`,
                fontWeight: getSectionStyle('basicInfo', 'companyFontWeight') || data.paragraphFontWeight || 400,
                fontFamily: getSectionStyle('basicInfo', 'companyFont') || 'Inter, sans-serif',
                fontStyle: getSectionStyle('basicInfo', 'companyTextStyle') || 'normal'
              }}
              data-testid="text-company"
            >
              {data.company}
            </p>
          )}
          
          {/* New Button Layout - Top 8 Buttons from Contact Information */}
          <div className="mb-6 space-y-2">
            {/* Grid of Contact Buttons ONLY - Responsive 2 rows of 4 */}
            <div className="space-y-2">
              {/* Row 1 - Top 4 buttons */}
              <div className={`grid ${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'grid-cols-3' : 'grid-cols-4'} gap-3 px-4`}>

              </div>

              {/* Row 2 - Unlimited Custom Contact Methods */}
              {data.customContacts && data.customContacts.length > 0 && (
                <div className={`grid ${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'grid-cols-3' : 'grid-cols-4'} gap-3 px-4`}>
                  {data.customContacts.filter(contact => contact?.value && contact?.label).map((contact) => (
                    <div key={contact.id} className="flex flex-col items-center">
                      <button 
                        onClick={() => handleContactAction(contact.type, contact.value)}
                        className={`${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'w-full py-3 px-2 rounded-lg' : 'w-12 h-12 rounded-full'} flex ${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'flex-col' : ''} items-center justify-center transition-colors ${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'mb-0' : 'mb-1'}`}
                        style={{ 
                          backgroundColor: data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? '#2a2a2a' : (data.secondaryColor || data.accentColor || '#16a34a'),
                          color: data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? (data.brandColor || '#fbbf24') : (data.tertiaryColor || '#ffffff')
                        }}
                        data-testid={`button-custom-contact-${contact.id}`}
                      >
                        <i className={`${contact.icon} ${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'text-lg mb-1' : 'text-sm'}`}></i>
                        {data.template === '73c23253-4f67-4395-8375-1ea1db209920' && (
                          <span className="text-xs font-medium">{contact.label}</span>
                        )}
                      </button>
                      {data.template !== 'dark' && (
                        <span 
                          className="text-xs font-medium"
                          style={{ 
                            color: getSectionStyle('contactInfo', 'iconTextColor') || '#374151'
                          }}
                        >
                          {contact.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex gap-3 px-4">
              {/* Add to Contacts Button */}
              <button 
                onClick={() => {
                  const vCard = `BEGIN:VCARD
VERSION:3.0
FN:${data.fullName || 'Contact'}
ORG:${data.company || ''}
TITLE:${data.title || ''}
TEL:${data.phone || ''}
EMAIL:${data.email || ''}
URL:${data.website || ''}
END:VCARD`;
                  
                  const blob = new Blob([vCard], { type: 'text/vcard' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${data.fullName || 'contact'}.vcf`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  URL.revokeObjectURL(url);
                }}
                className={`py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors ${
                  data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'border-2' : ''
                }`}
                style={{
                  backgroundColor: data.template === '73c23253-4f67-4395-8375-1ea1db209920' 
                    ? '#2a2a2a' 
                    : (data.secondaryColor || data.accentColor || '#16a34a'),
                  color: data.template === '73c23253-4f67-4395-8375-1ea1db209920' 
                    ? (data.brandColor || '#fbbf24') 
                    : (data.tertiaryColor || '#ffffff'),
                  borderColor: data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? (data.brandColor || '#fbbf24') : 'transparent',
                  borderBottom: data.template === '73c23253-4f67-4395-8375-1ea1db209920' 
                    ? 'none' 
                    : `4px solid ${data.brandColor ? adjustColor(data.brandColor, -20) : '#16a34a'}`,
                  width: '70%'
                }}
                data-testid="button-save-contact"
              >
                <i className="fas fa-address-book text-lg mr-3"></i>
                {data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'Save Contact' : 'Add to Contacts'}
              </button>

              {/* Share Button */}
              <button 
                onClick={() => handleShare()}
                className={`py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors ${
                  data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'border-2' : ''
                }`}
                style={{ 
                  backgroundColor: data.template === '73c23253-4f67-4395-8375-1ea1db209920' 
                    ? 'transparent' 
                    : (data.brandColor || '#22c55e'),
                  color: data.template === '73c23253-4f67-4395-8375-1ea1db209920' 
                    ? (data.brandColor || '#fbbf24') 
                    : (data.tertiaryColor || '#ffffff'),
                  borderColor: data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? (data.brandColor || '#fbbf24') : 'transparent',
                  borderBottom: data.template === '73c23253-4f67-4395-8375-1ea1db209920' 
                    ? 'none' 
                    : `4px solid ${data.secondaryColor ? adjustColor(data.secondaryColor, -20) : (data.accentColor ? adjustColor(data.accentColor, -20) : '#16a34a')}`,
                  width: '30%'
                }}
                data-testid="button-share-main"
              >
                <i className="fas fa-share-alt text-lg mr-3"></i>
                Share
              </button>
            </div>


            {/* Custom Social Media Platforms */}
            <div className={`${data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? 'grid grid-cols-4 gap-3' : 'space-y-2'} px-4`}>
              {/* Custom Social Media Platforms */}
              {data.customSocials?.map((social) => (
                social.value && (
                  data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? (
                    // Template 2 (dark): Circular social buttons
                    <div key={social.id} className="flex flex-col items-center">
                      <button 
                        onClick={() => handleContactAction(social.platform, social.value)}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-colors mb-1"
                        style={{ 
                          backgroundColor: data.brandColor || '#fbbf24',
                          color: '#000000'
                        }}
                        data-testid={`button-custom-social-${social.id}`}
                      >
                        <i className={`${social.icon} text-sm`}></i>
                      </button>
                      <span 
                        className="text-xs font-medium text-center"
                        style={{ 
                          color: data.brandColor || '#fbbf24'
                        }}
                      >
                        {social.label || 'Social'}
                      </span>
                    </div>
                  ) : (
                    // Other templates: Rectangular social buttons
                    <button 
                      key={social.id}
                      onClick={() => handleContactAction(social.platform, social.value)}
                      className="w-full py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors"
                      style={{ 
                        backgroundColor: data.brandColor || '#22c55e',
                        color: data.tertiaryColor || '#ffffff',
                        borderBottom: `4px solid ${data.secondaryColor ? adjustColor(data.secondaryColor, -20) : (data.accentColor ? adjustColor(data.accentColor, -20) : '#16a34a')}`
                      }}
                      data-testid={`button-custom-social-${social.id}`}
                    >
                      <i className={`${social.icon} text-lg mr-3`}></i>
                      {social.label || 'Social'}
                    </button>
                  )
                )
              ))}
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
                style={{ color: data.template === '73c23253-4f67-4395-8375-1ea1db209920' ? (data.brandColor || '#fbbf24') : (data.brandColor || '#22c55e') }}
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