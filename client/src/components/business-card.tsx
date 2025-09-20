import { forwardRef, useState } from "react";
import { BusinessCard } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { generateShareUrl } from "@/lib/share";
import { PageElementRenderer } from "./page-element";
import { HeaderPreview } from "./header-builder/HeaderPreview";
import { defaultHeaderPreset } from "@/lib/header-schema";
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useButtonTracking } from "@/modules/automation/useButtonTracking";

// Helper function to get optimized image source
const getOptimizedImageSrc = (originalSrc: string | null | undefined, variant: 'thumb' | 'card' | 'large' = 'card'): string => {
  if (!originalSrc) return "";
  
  // If it's already a base64 image, return as-is (backward compatibility)
  if (originalSrc.startsWith('data:')) {
    return originalSrc;
  }
  
  // If it's a Supabase storage URL, try to get WebP variant
  if (originalSrc.includes('supabase') && originalSrc.includes('storage')) {
    // Extract the path and try to construct WebP variant URL
    const pathMatch = originalSrc.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
    if (pathMatch) {
      const storagePath = pathMatch[1];
      // Remove file extension and add WebP variant suffix
      const basePath = storagePath.replace(/\.[^.]+$/, '');
      const webpVariant = variant === 'thumb' ? 'thumb_200.webp' : 
                         variant === 'card' ? 'card_430.webp' : 
                         'large_1200.webp';
      
      // Construct optimized URL
      const optimizedUrl = originalSrc.replace(storagePath, `${basePath}_${webpVariant}`);
      return optimizedUrl;
    }
  }
  
  // Fallback to original URL
  return originalSrc;
};

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
  onNavigatePage?: (pageId: string) => void;
}

export const BusinessCardComponent = forwardRef<HTMLDivElement, BusinessCardProps>(
  ({ data, showQR = false, isInteractive = true, isMobilePreview = false, onNavigatePage }, ref) => {
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [showShareMenu, setShowShareMenu] = useState(false);
    const { toast } = useToast();
    const { trackButtonClick } = useButtonTracking();

    const toggleSection = (section: string) => {
      if (!isInteractive) return;
      setExpandedSections(prev => ({
        ...prev,
        [section]: !prev[section]
      }));
    };

    const handleContactAction = async (type: string, value?: string) => {
      if (!isInteractive || !value) return;
      
      // Track button click for automation
      if (data.id) {
        const buttonActionMap: Record<string, 'call' | 'email' | 'link' | 'whatsapp'> = {
          'phone': 'call',
          'email': 'email', 
          'whatsapp': 'whatsapp',
          'website': 'link',
          'linkedin': 'link',
          'instagram': 'link',
          'twitter': 'link',
          'facebook': 'link'
        };
        
        const buttonAction = buttonActionMap[type] || 'link';
        const buttonLabel = type === 'phone' ? 'Call' : 
                           type === 'email' ? 'Email' :
                           type === 'whatsapp' ? 'WhatsApp' :
                           type === 'website' ? 'Website' :
                           type.charAt(0).toUpperCase() + type.slice(1);
        
        // Track interaction (don't wait for response)
        trackButtonClick(
          data.id, 
          `${type}-button`, 
          buttonLabel, 
          buttonAction, 
          value
        ).catch(console.error);
      }
      
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

    // Use optimized profile image with fallback
    const fallbackImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300";
    const profileImageSrc = getOptimizedImageSrc(data.profilePhoto, 'card') || fallbackImage;
    
    // Helper function to get section-specific styling with global fallback
    const getSectionStyle = (section: 'basicInfo' | 'contactInfo' | 'socialMedia', styleType: string): string | undefined => {
      const sectionStyle = data.sectionStyles?.[section];
      
      if (sectionStyle && sectionStyle[styleType as keyof typeof sectionStyle]) {
        const sectionValue = sectionStyle[styleType as keyof typeof sectionStyle];
        if (sectionValue !== undefined && sectionValue !== null) {
          return String(sectionValue);
        }
      }
      
      // Fallback to global style, but only return string values appropriate for CSS
      const globalValue = data[styleType as keyof typeof data];
      if (globalValue !== undefined && globalValue !== null) {
        return String(globalValue);
      }
      
      return undefined;
    };

    // Helper functions for type safety
    const parseNumeric = (value: string | undefined, defaultValue: number): number => {
      if (!value) return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const parseHexColor = (color: string | undefined, fallback: string): string => {
      if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return fallback;
      return color;
    };

    const hexToRgba = (hex: string, opacity: number): string => {
      const validHex = parseHexColor(hex, '#000000');
      const r = parseInt(validHex.slice(1, 3), 16);
      const g = parseInt(validHex.slice(3, 5), 16);
      const b = parseInt(validHex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    };

    // Generate primary contact buttons
    const getPrimaryContacts = () => {
      const contacts = [];
      
      if (data.phone) {
        contacts.push({
          id: 'primary-phone',
          type: 'phone',
          value: data.phone,
          label: 'Phone',
          icon: 'fas fa-phone'
        });
      }
      
      if (data.email) {
        contacts.push({
          id: 'primary-email', 
          type: 'email',
          value: data.email,
          label: 'Email',
          icon: 'fas fa-envelope'
        });
      }
      
      if (data.website) {
        contacts.push({
          id: 'primary-website',
          type: 'website', 
          value: data.website,
          label: 'Website',
          icon: 'fas fa-globe'
        });
      }
      
      if (data.linkedin) {
        contacts.push({
          id: 'primary-linkedin',
          type: 'linkedin',
          value: data.linkedin, 
          label: 'LinkedIn',
          icon: 'fab fa-linkedin'
        });
      }
      
      return contacts;
    };

    // Simple gradient style for basic background support
    const gradientStyle = {};

    return (
      <div 
        ref={ref} 
        className={`overflow-hidden w-full mx-auto relative ${
          isMobilePreview 
            ? 'rounded-none shadow-none min-h-full' 
            : 'rounded-none md:rounded-2xl shadow-none md:shadow-2xl card-shadow'
        }`}
        style={{ 
          maxWidth: isMobilePreview ? '100%' : '430px',
          backgroundColor: isMobilePreview ? 'transparent' : (data.template === 'dark' ? '#1a1a1a' : (data.backgroundColor || '#ffffff')),
          fontFamily: data.font ? `var(--font-${data.font})` : 'var(--font-inter)',
          color: data.template === 'dark' ? '#ffffff' : (data.textColor || '#000000'),
          minHeight: isMobilePreview ? '100%' : 'auto'
        }}
      >
        <div className="relative">
          {/* Header Design - Cover + Logo */}
              {(data.headerDesign === 'cover-logo' || !data.headerDesign) && (
                <div 
                  className="h-40 relative"
                  style={{ 
                    backgroundImage: data.backgroundImage ? `url(${getOptimizedImageSrc(data.backgroundImage, 'large')})` : undefined,
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
                    backgroundImage: data.backgroundImage ? `url(${getOptimizedImageSrc(data.backgroundImage, 'large')})` : undefined,
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
                      backgroundImage: data.backgroundImage ? `url(${getOptimizedImageSrc(data.backgroundImage, 'large')})` : undefined,
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

              {/* Header Design - Shape Divider */}
              {data.headerDesign === 'shape-divider' && (
                <HeaderPreview
                  headerPreset={data.headerPreset || defaultHeaderPreset}
                  cardData={data}
                  profileImageSrc={profileImageSrc}
                />
              )}
        </div>
          
        {/* Content */}
        <div className={`pb-8 px-6 text-center ${data.template === 'dark' ? 'text-white' : 'text-slate-800'} ${
          data.headerDesign === 'profile-center' ? 'pt-20' : 
          data.headerDesign === 'split-design' ? 'pt-16' :
          data.headerDesign === 'shape-divider' ? 'pt-8' : 'pt-16'
        }`}>
          {/* Name, Title, Company */}
          <h3 
            className="text-xl font-bold mb-1" 
            style={{
              color: getSectionStyle('basicInfo', 'nameColor') || data.headingColor || (data.template === 'dark' ? '#ffffff' : '#1f2937'),
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
              color: getSectionStyle('basicInfo', 'titleColor') || data.paragraphColor || (data.template === 'dark' ? '#e5e7eb' : '#4b5563'),
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
                color: getSectionStyle('basicInfo', 'companyColor') || (data.template === 'dark' ? '#d1d5db' : '#6b7280'),
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

              {/* Row 2 - Unlimited Custom Contact Methods */}
              {data.customContacts && data.customContacts.length > 0 && (
                <div 
                  className={`grid ${data.template === 'dark' ? 'grid-cols-3' : 'grid-cols-4'} px-4`}
                  style={getSectionStyle('contactInfo', 'containerStylingEnabled') === 'true' ? {
                    gap: `${parseNumeric(getSectionStyle('contactInfo', 'containerGap'), 8)}px`
                  } : {
                    gap: '8px'
                  }}
                >
                  {data.customContacts.filter(contact => contact?.value && contact?.label).map((contact) => (
                    <div 
                      key={contact.id} 
                      className={`flex flex-col items-center ${getSectionStyle('contactInfo', 'containerStylingEnabled') === 'true' ? 'justify-center' : ''}`}
                      style={getSectionStyle('contactInfo', 'containerStylingEnabled') === 'true' ? {
                        backgroundColor: getSectionStyle('contactInfo', 'containerBackgroundColor') || 'transparent',
                        borderWidth: getSectionStyle('contactInfo', 'containerBorderColor') ? '1px' : '0',
                        borderStyle: getSectionStyle('contactInfo', 'containerBorderColor') ? 'solid' : 'none',
                        borderColor: getSectionStyle('contactInfo', 'containerBorderColor') || 'transparent',
                        borderRadius: `${parseNumeric(getSectionStyle('contactInfo', 'containerBorderRadius'), 8)}px`,
                        width: `${parseNumeric(getSectionStyle('contactInfo', 'containerWidth'), 80)}px`,
                        height: `${parseNumeric(getSectionStyle('contactInfo', 'containerHeight'), 80)}px`,
                        padding: '8px',
                        boxShadow: getSectionStyle('contactInfo', 'containerDropShadowEnabled') === 'true' 
                          ? `${parseNumeric(getSectionStyle('contactInfo', 'containerDropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('contactInfo', 'containerDropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('contactInfo', 'containerDropShadowBlur'), 4)}px ${hexToRgba(getSectionStyle('contactInfo', 'containerDropShadowColor') || '#000000', parseFloat(getSectionStyle('contactInfo', 'containerDropShadowOpacity') || '0.25'))}`
                          : 'none'
                      } : {}}
                      data-testid={`container-custom-contact-${contact.id}`}
                    >
                      <button 
                        onClick={() => handleContactAction(contact.type, contact.value)}
                        className={`${data.template === 'dark' ? 'w-full py-2 px-2 rounded-lg' : 'rounded-full'} flex ${data.template === 'dark' ? 'flex-col' : ''} items-center justify-center ${data.template === 'dark' ? 'mb-0' : 'mb-1'} ${getSectionStyle('contactInfo', 'enableHoverColor') === 'true' ? 'contact-icon-hover' : ''}`}
                        style={{
                          // Base CSS variables - always applied
                          '--tl-icon-bg': getSectionStyle('contactInfo', 'iconBackgroundColor') || (data.template === 'dark' ? '#2a2a2a' : (data.secondaryColor || data.accentColor || '#16a34a')),
                          '--tl-icon-color': getSectionStyle('contactInfo', 'iconColor') || (data.template === 'dark' ? (data.brandColor || '#fbbf24') : (data.tertiaryColor || '#ffffff')),
                          '--tl-border': getSectionStyle('contactInfo', 'iconBorderColor') || 'transparent',
                          // Hover CSS variables - only when toggle enabled
                          ...(getSectionStyle('contactInfo', 'enableHoverColor') === 'true' ? {
                            '--tl-icon-bg-hover': getSectionStyle('contactInfo', 'iconBackgroundHoverColor') || adjustColor(getSectionStyle('contactInfo', 'iconBackgroundColor') || (data.template === 'dark' ? '#2a2a2a' : (data.secondaryColor || data.accentColor || '#16a34a')), 20),
                            '--tl-icon-color-hover': getSectionStyle('contactInfo', 'iconHoverColor') || adjustColor(getSectionStyle('contactInfo', 'iconColor') || (data.template === 'dark' ? (data.brandColor || '#fbbf24') : (data.tertiaryColor || '#ffffff')), -20),
                            '--tl-border-hover': getSectionStyle('contactInfo', 'iconBorderColor') || 'transparent',
                          } : {}),
                          borderWidth: getSectionStyle('contactInfo', 'iconBorderColor') ? `${parseNumeric(getSectionStyle('contactInfo', 'borderSize'), 1)}px` : '0',
                          borderStyle: getSectionStyle('contactInfo', 'iconBorderColor') ? 'solid' : 'none',
                          width: data.template === 'dark' ? 'auto' : `${parseNumeric(getSectionStyle('contactInfo', 'iconBackgroundSize'), 40)}px`,
                          height: data.template === 'dark' ? 'auto' : `${parseNumeric(getSectionStyle('contactInfo', 'iconBackgroundSize'), 40)}px`,
                          boxShadow: getSectionStyle('contactInfo', 'dropShadowEnabled') === 'true' 
                            ? `${parseNumeric(getSectionStyle('contactInfo', 'dropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('contactInfo', 'dropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('contactInfo', 'dropShadowBlur'), 4)}px ${hexToRgba(getSectionStyle('contactInfo', 'dropShadowColor') || '#000000', parseFloat(getSectionStyle('contactInfo', 'dropShadowOpacity') || '0.25'))}`
                            : 'none'
                        } as React.CSSProperties}
                        data-testid={`button-custom-contact-${contact.id}`}
                      >
                        <i 
                          className={`${contact.icon} ${data.template === 'dark' ? 'mb-1' : ''}`}
                          style={{
                            fontSize: `${parseNumeric(getSectionStyle('contactInfo', 'iconSize'), data.template === 'dark' ? 18 : 14)}px`
                          }}
                        ></i>
                        {data.template === 'dark' && (
                          <span 
                            className="font-medium"
                            style={{
                              fontSize: `${parseNumeric(getSectionStyle('contactInfo', 'iconTextSize'), 12)}px`,
                              fontFamily: getSectionStyle('contactInfo', 'iconTextFont') || 'Inter, sans-serif',
                              fontWeight: getSectionStyle('contactInfo', 'iconTextWeight') || '500',
                              color: getSectionStyle('contactInfo', 'iconTextColor') || 'inherit'
                            }}
                          >
                            {contact.label}
                          </span>
                        )}
                      </button>
                      {data.template !== 'dark' && (
                        <span 
                          className="font-medium"
                          style={{ 
                            color: getSectionStyle('contactInfo', 'iconTextColor') || '#374151',
                            fontSize: `${parseNumeric(getSectionStyle('contactInfo', 'iconTextSize'), 12)}px`,
                            fontFamily: getSectionStyle('contactInfo', 'iconTextFont') || 'Inter, sans-serif',
                            fontWeight: getSectionStyle('contactInfo', 'iconTextWeight') || '500'
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
                  data.template === 'dark' ? 'border-2' : ''
                }`}
                style={{
                  backgroundColor: data.template === 'dark' 
                    ? '#2a2a2a' 
                    : (data.secondaryColor || data.accentColor || '#16a34a'),
                  color: data.template === 'dark' 
                    ? (data.brandColor || '#fbbf24') 
                    : (data.tertiaryColor || '#ffffff'),
                  borderColor: data.template === 'dark' ? (data.brandColor || '#fbbf24') : 'transparent',
                  borderBottom: data.template === 'dark' 
                    ? 'none' 
                    : `4px solid ${data.brandColor ? adjustColor(data.brandColor, -20) : '#16a34a'}`,
                  width: '70%'
                }}
                data-testid="button-save-contact"
              >
                <i className="fas fa-address-book text-lg mr-3"></i>
                {data.template === 'dark' ? 'Save Contact' : 'Add to Contacts'}
              </button>

              {/* Share Button */}
              <button 
                onClick={() => handleShare()}
                className={`py-3 px-4 rounded-xl flex items-center justify-center font-semibold text-sm transition-colors ${
                  data.template === 'dark' ? 'border-2' : ''
                }`}
                style={{ 
                  backgroundColor: data.template === 'dark' 
                    ? 'transparent' 
                    : (data.brandColor || '#22c55e'),
                  color: data.template === 'dark' 
                    ? (data.brandColor || '#fbbf24') 
                    : (data.tertiaryColor || '#ffffff'),
                  borderColor: data.template === 'dark' ? (data.brandColor || '#fbbf24') : 'transparent',
                  borderBottom: data.template === 'dark' 
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
            <div 
              className={`${data.template === 'dark' ? 'grid grid-cols-4' : 'flex flex-col'} px-4`}
              style={{
                ...(getSectionStyle('socialMedia', 'containerStylingEnabled') === 'true' ? {
                  backgroundColor: getSectionStyle('socialMedia', 'containerBackgroundColor') || 'transparent',
                  borderColor: getSectionStyle('socialMedia', 'containerBorderColor') || 'transparent',
                  borderWidth: getSectionStyle('socialMedia', 'containerBorderColor') ? '1px' : '0',
                  borderStyle: getSectionStyle('socialMedia', 'containerBorderColor') ? 'solid' : 'none',
                  borderRadius: `${parseNumeric(getSectionStyle('socialMedia', 'containerBorderRadius'), 8)}px`,
                  padding: getSectionStyle('socialMedia', 'containerStylingEnabled') === 'true' ? '12px' : '1rem',
                  width: getSectionStyle('socialMedia', 'containerWidth') ? `${parseNumeric(getSectionStyle('socialMedia', 'containerWidth'), 100)}%` : '100%',
                  minHeight: getSectionStyle('socialMedia', 'containerHeight') ? `${parseNumeric(getSectionStyle('socialMedia', 'containerHeight'), 'auto')}px` : 'auto',
                  boxShadow: getSectionStyle('socialMedia', 'containerDropShadowEnabled') === 'true' 
                    ? `${parseNumeric(getSectionStyle('socialMedia', 'containerDropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('socialMedia', 'containerDropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('socialMedia', 'containerDropShadowBlur'), 8)}px ${hexToRgba(getSectionStyle('socialMedia', 'containerDropShadowColor') || '#000000', parseFloat(getSectionStyle('socialMedia', 'containerDropShadowOpacity') || '0.1'))}`
                    : 'none'
                } : {}),
                gap: `${parseNumeric(getSectionStyle('socialMedia', 'containerGap'), data.template === 'dark' ? 12 : 8)}px`
              }}
              data-testid="container-social-media"
            >
              {/* Custom Social Media Platforms */}
              {data.customSocials?.map((social) => (
                social.value && (
                  data.template === 'dark' ? (
                    // Template 2 (dark): Circular social buttons
                    <div key={social.id} className="flex flex-col items-center">
                      <button 
                        onClick={() => handleContactAction(social.platform, social.value)}
                        className={`rounded-full flex items-center justify-center mb-1 ${getSectionStyle('socialMedia', 'enableHoverColor') === 'true' ? 'social-icon-hover' : ''}`}
                        style={{
                          // Base CSS variables - always applied
                          '--tl-icon-bg': getSectionStyle('socialMedia', 'iconBackgroundColor') || (data.brandColor || '#fbbf24'),
                          '--tl-icon-color': getSectionStyle('socialMedia', 'iconColor') || '#000000',
                          '--tl-border': getSectionStyle('socialMedia', 'iconBorderColor') || 'transparent',
                          // Hover CSS variables - only when toggle enabled
                          ...(getSectionStyle('socialMedia', 'enableHoverColor') === 'true' ? {
                            '--tl-icon-bg-hover': getSectionStyle('socialMedia', 'iconBackgroundHoverColor') || adjustColor(getSectionStyle('socialMedia', 'iconBackgroundColor') || (data.brandColor || '#fbbf24'), 20),
                            '--tl-icon-color-hover': getSectionStyle('socialMedia', 'iconHoverColor') || adjustColor(getSectionStyle('socialMedia', 'iconColor') || '#000000', -20),
                            '--tl-border-hover': getSectionStyle('socialMedia', 'iconBorderColor') || 'transparent',
                          } : {}),
                          borderWidth: getSectionStyle('socialMedia', 'iconBorderColor') ? `${parseNumeric(getSectionStyle('socialMedia', 'borderSize'), 1)}px` : '0',
                          borderStyle: getSectionStyle('socialMedia', 'iconBorderColor') ? 'solid' : 'none',
                          width: `${parseNumeric(getSectionStyle('socialMedia', 'iconBackgroundSize'), 48)}px`,
                          height: `${parseNumeric(getSectionStyle('socialMedia', 'iconBackgroundSize'), 48)}px`,
                          boxShadow: getSectionStyle('socialMedia', 'dropShadowEnabled') === 'true' 
                            ? `${parseNumeric(getSectionStyle('socialMedia', 'dropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('socialMedia', 'dropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('socialMedia', 'dropShadowBlur'), 4)}px ${hexToRgba(getSectionStyle('socialMedia', 'dropShadowColor') || '#000000', parseFloat(getSectionStyle('socialMedia', 'dropShadowOpacity') || '0.25'))}`
                            : 'none'
                        } as React.CSSProperties}
                        data-testid={`button-custom-social-${social.id}`}
                      >
                        <i 
                          className={`${social.icon}`}
                          style={{
                            fontSize: `${parseNumeric(getSectionStyle('socialMedia', 'iconSize'), 14)}px`
                          }}
                        ></i>
                      </button>
                      <span 
                        className="text-center"
                        style={{ 
                          color: getSectionStyle('socialMedia', 'iconTextColor') || (data.brandColor || '#fbbf24'),
                          fontFamily: getSectionStyle('socialMedia', 'iconTextFont') || 'inherit',
                          fontSize: `${parseNumeric(getSectionStyle('socialMedia', 'iconTextSize'), 12)}px`,
                          fontWeight: getSectionStyle('socialMedia', 'iconTextWeight') || '500',
                          fontStyle: getSectionStyle('socialMedia', 'iconTextStyle') || 'normal'
                        }}
                        data-testid={`label-custom-social-${social.id}`}
                      >
                        {social.label || 'Social'}
                      </span>
                    </div>
                  ) : (
                    // Other templates: Rectangular social buttons
                    <button 
                      key={social.id} 
                        onClick={() => handleContactAction(social.platform, social.value)}
                        className={`w-full py-3 px-4 rounded-xl flex items-center justify-center text-sm ${getSectionStyle('socialMedia', 'enableHoverColor') === 'true' ? 'social-icon-hover' : ''}`}
                        style={{
                          // Base CSS variables - always applied
                          '--tl-icon-bg': getSectionStyle('socialMedia', 'iconBackgroundColor') || (data.brandColor || '#22c55e'),
                          '--tl-icon-color': getSectionStyle('socialMedia', 'iconTextColor') || (data.tertiaryColor || '#ffffff'),
                          '--tl-border': getSectionStyle('socialMedia', 'iconBorderColor') || 'transparent',
                          // Hover CSS variables - only when toggle enabled
                          ...(getSectionStyle('socialMedia', 'enableHoverColor') === 'true' ? {
                            '--tl-icon-bg-hover': getSectionStyle('socialMedia', 'iconBackgroundHoverColor') || adjustColor(getSectionStyle('socialMedia', 'iconBackgroundColor') || (data.brandColor || '#22c55e'), 20),
                            '--tl-icon-color-hover': getSectionStyle('socialMedia', 'iconHoverColor') || adjustColor(getSectionStyle('socialMedia', 'iconTextColor') || (data.tertiaryColor || '#ffffff'), -20),
                            '--tl-border-hover': getSectionStyle('socialMedia', 'iconBorderColor') || 'transparent',
                          } : {}),
                          borderWidth: getSectionStyle('socialMedia', 'iconBorderColor') ? `${parseNumeric(getSectionStyle('socialMedia', 'borderSize'), 1)}px` : '0',
                          borderStyle: getSectionStyle('socialMedia', 'iconBorderColor') ? 'solid' : 'none',
                          borderBottom: getSectionStyle('socialMedia', 'iconBorderColor') ? 'none' : `4px solid ${data.secondaryColor ? adjustColor(data.secondaryColor, -20) : (data.accentColor ? adjustColor(data.accentColor, -20) : '#16a34a')}`,
                          fontFamily: getSectionStyle('socialMedia', 'iconTextFont') || 'inherit',
                          fontSize: `${parseNumeric(getSectionStyle('socialMedia', 'iconTextSize'), 14)}px`,
                          fontWeight: getSectionStyle('socialMedia', 'iconTextWeight') || '600',
                          fontStyle: getSectionStyle('socialMedia', 'iconTextStyle') || 'normal',
                          boxShadow: getSectionStyle('socialMedia', 'dropShadowEnabled') === 'true' 
                            ? `${parseNumeric(getSectionStyle('socialMedia', 'dropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('socialMedia', 'dropShadowOffset'), 2)}px ${parseNumeric(getSectionStyle('socialMedia', 'dropShadowBlur'), 4)}px ${hexToRgba(getSectionStyle('socialMedia', 'dropShadowColor') || '#000000', parseFloat(getSectionStyle('socialMedia', 'dropShadowOpacity') || '0.25'))}`
                            : 'none'
                        }}
                        data-testid={`button-custom-social-${social.id}`}
                      >
                        <i 
                          className={`${social.icon} mr-3`}
                          style={{
                            fontSize: `${parseNumeric(getSectionStyle('socialMedia', 'iconSize'), 18)}px`
                          }}
                        ></i>
                        {social.label || 'Social'}
                      </button>
                  )
                )
              ))}
            </div>
          </div>


          {/* Page Elements */}
          {data.pageElements && data.pageElements.length > 0 && (
            <div className="space-y-4 mb-6">
              {data.pageElements.map((element) => (
                <PageElementRenderer key={element.id} element={element} isInteractive={isInteractive} cardData={data} onNavigatePage={onNavigatePage} />
              ))}
            </div>
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
                style={{ color: data.template === 'dark' ? (data.brandColor || '#fbbf24') : (data.brandColor || '#22c55e') }}
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