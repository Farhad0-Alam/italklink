import { forwardRef, useState } from "react";
import { BusinessCard } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { QRCodeSVG } from "qrcode.react";
import { generateShareUrl } from "@/lib/share";
import { PageElementRenderer } from "./page-element";
import { HeaderPreview } from "./header-builder/HeaderPreview";
import { CoverImageSection } from "./CoverImageSection";
import { defaultHeaderPreset } from "@/lib/header-schema";
import {
  Share2,
  Copy,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useButtonTracking } from "@/modules/automation/useButtonTracking";

// Helper function to get optimized image source
const getOptimizedImageSrc = (
  originalSrc: string | null | undefined,
  variant: "thumb" | "card" | "large" = "card",
): string => {
  if (!originalSrc) return "";

  // If it's already a base64 image, return as-is (backward compatibility)
  if (originalSrc.startsWith("data:")) {
    return originalSrc;
  }

  // If it's a Supabase storage URL, try to get WebP variant
  if (originalSrc.includes("supabase") && originalSrc.includes("storage")) {
    // Extract the path and try to construct WebP variant URL
    const pathMatch = originalSrc.match(
      /\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/,
    );
    if (pathMatch) {
      const storagePath = pathMatch[1];
      // Remove file extension and add WebP variant suffix
      const basePath = storagePath.replace(/\.[^.]+$/, "");
      const webpVariant =
        variant === "thumb"
          ? "thumb_200.webp"
          : variant === "card"
            ? "card_430.webp"
            : "large_1200.webp";

      // Construct optimized URL
      const optimizedUrl = originalSrc.replace(
        storagePath,
        `${basePath}_${webpVariant}`,
      );
      return optimizedUrl;
    }
  }

  // Fallback to original URL
  return originalSrc;
};

// Helper function to adjust color brightness
const adjustColor = (color: string, amount: number): string => {
  // Remove # if present
  const hex = color.replace("#", "");

  // Convert to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Adjust brightness
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));

  // Convert back to hex
  const newHex = ((newR << 16) | (newG << 8) | newB)
    .toString(16)
    .padStart(6, "0");
  return `#${newHex}`;
};

interface BusinessCardProps {
  data: BusinessCard;
  showQR?: boolean;
  isInteractive?: boolean;
  isMobilePreview?: boolean;
  onNavigatePage?: (pageId: string) => void;
}

export const BusinessCardComponent = forwardRef<
  HTMLDivElement,
  BusinessCardProps
>(
  (
    {
      data,
      showQR = false,
      isInteractive = true,
      isMobilePreview = false,
      onNavigatePage,
    },
    ref,
  ) => {
    const [expandedSections, setExpandedSections] = useState<
      Record<string, boolean>
    >({});
    const [showShareMenu, setShowShareMenu] = useState(false);
    const { toast } = useToast();
    const { trackButtonClick } = useButtonTracking();

    const toggleSection = (section: string) => {
      if (!isInteractive) return;
      setExpandedSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    };

    const handleContactAction = async (type: string, value?: string) => {
      if (!isInteractive || !value) return;

      // Track button click for automation
      if (data.id) {
        const buttonActionMap: Record<
          string,
          "call" | "email" | "link" | "whatsapp"
        > = {
          phone: "call",
          email: "email",
          whatsapp: "whatsapp",
          website: "link",
          linkedin: "link",
          instagram: "link",
          twitter: "link",
          facebook: "link",
        };

        const buttonAction = buttonActionMap[type] || "link";
        const buttonLabel =
          type === "phone"
            ? "Call"
            : type === "email"
              ? "Email"
              : type === "whatsapp"
                ? "WhatsApp"
                : type === "website"
                  ? "Website"
                  : type.charAt(0).toUpperCase() + type.slice(1);

        // Track interaction (don't wait for response)
        trackButtonClick(
          data.id,
          `${type}-button`,
          buttonLabel,
          buttonAction,
          value,
        ).catch(console.error);
      }

      switch (type) {
        case "phone":
          window.open(`tel:${value}`);
          break;
        case "email":
          window.open(`mailto:${value}`);
          break;
        case "whatsapp":
          window.open(`https://wa.me/${value.replace(/[^\d]/g, "")}`);
          break;
        case "website":
          window.open(value, "_blank");
          break;
        case "linkedin":
          window.open(
            value.startsWith("http") ? value : `https://${value}`,
            "_blank",
          );
          break;
        case "instagram":
          const instaHandle = value.replace("@", "");
          window.open(`https://instagram.com/${instaHandle}`, "_blank");
          break;
        case "twitter":
          const twitterHandle = value.replace("@", "");
          window.open(`https://twitter.com/${twitterHandle}`, "_blank");
          break;
        case "facebook":
          window.open(
            value.startsWith("http") ? value : `https://facebook.com/${value}`,
            "_blank",
          );
          break;
      }
    };

    const shareUrl = generateShareUrl(data);

    const handleShare = async (platform?: string) => {
      const url = shareUrl;
      const text = `Check out ${data.fullName}'s business card`;

      if (platform === "copy") {
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

      let shareUrl_platform = "";
      switch (platform) {
        case "facebook":
          shareUrl_platform = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          break;
        case "twitter":
          shareUrl_platform = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
          break;
        case "linkedin":
          shareUrl_platform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
          break;
        case "whatsapp":
          shareUrl_platform = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
          break;
        default:
          if (navigator.share) {
            try {
              await navigator.share({
                title: text,
                url: url,
              });
            } catch (err) {
              console.log("Share cancelled");
            }
          } else {
            await handleShare("copy");
          }
          setShowShareMenu(false);
          return;
      }

      if (shareUrl_platform) {
        window.open(shareUrl_platform, "_blank", "width=600,height=400");
        setShowShareMenu(false);
      }
    };

    // Use optimized profile image with fallback
    const fallbackImage =
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300";
    const profileImageSrc =
      getOptimizedImageSrc(data.profilePhoto, "card") || fallbackImage;

    // Helper function to get section-specific styling with global fallback
    const getSectionStyle = (
      section: "basicInfo" | "contactInfo" | "socialMedia",
      styleType: string,
    ): string | undefined => {
      const sectionStyle = data.sectionStyles?.[section];
      if (
        sectionStyle &&
        sectionStyle[styleType as keyof typeof sectionStyle]
      ) {
        const sectionValue =
          sectionStyle[styleType as keyof typeof sectionStyle];
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

    // Helper function to get profile image styles and animation class
    const getProfileImageStyle = (baseSize: number = 120) => {
      const styles = data.profileImageStyles || {};
      const size = styles.size || baseSize;
      const shape = styles.shape || "circle";
      const borderWidth = styles.borderWidth !== undefined ? styles.borderWidth : 3; // Default 3px border
      
      // Use brand color as default border color
      const defaultBorderColor = data.brandColor || data.accentColor || "#ffffff";
      const borderColor = styles.borderColor || defaultBorderColor;
      
      const shadow = styles.shadow || 0;
      const opacity = styles.opacity !== undefined ? styles.opacity / 100 : 1;
      const animation = styles.animation || "none";
      
      // Get animation colors (use brand color if useBrandColor is true)
      const useBrandColor = styles.useBrandColor !== false; // Default to true
      
      // Animation-specific default gradients
      const getDefaultGradient = () => {
        switch(animation) {
          case 'instagram':
            return {
              stops: [
                { color: '#f09433', stop: 0 },
                { color: '#e6683c', stop: 25 },
                { color: '#dc2743', stop: 50 },
                { color: '#cc2366', stop: 75 },
                { color: '#bc1888', stop: 100 }
              ],
              angle: 45,
              type: 'linear' as const
            };
          case 'wave':
            return {
              stops: [
                { color: '#1E40AF', stop: 0 },
                { color: '#06B6D4', stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
          case 'shimmer':
            return {
              stops: [
                { color: 'transparent', stop: 0 },
                { color: '#E5E7EB', stop: 50 },
                { color: 'transparent', stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
          case 'gradient-slide':
            return {
              stops: [
                { color: '#8B5CF6', stop: 0 },
                { color: '#3B82F6', stop: 100 }
              ],
              angle: 45,
              type: 'linear' as const
            };
          case 'neon':
            return {
              stops: [
                { color: '#00D9FF', stop: 0 },
                { color: '#00D9FF', stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
          default:
            return {
              stops: [
                { color: data.brandColor || "#4ecdc4", stop: 0 },
                { color: data.accentColor || "#f093fb", stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
        }
      };
      
      // Get gradient configuration with animation-specific defaults
      const animationGradient = styles.animationGradient || {};
      const defaultGradient = getDefaultGradient();
      const gradientStops = animationGradient.stops || defaultGradient.stops;
      const gradientAngle = animationGradient.angle !== undefined ? animationGradient.angle : defaultGradient.angle;
      const gradientType = animationGradient.type || defaultGradient.type;
      
      // Build gradient CSS string from stops, honoring type in both brand and custom modes
      const gradientCss = useBrandColor 
        ? (gradientType === 'linear'
            ? `linear-gradient(${gradientAngle}deg, ${defaultBorderColor} 0%, ${data.accentColor || defaultBorderColor} 100%)`
            : `radial-gradient(circle, ${defaultBorderColor} 0%, ${data.accentColor || defaultBorderColor} 100%)`)
        : (gradientType === 'linear'
            ? `linear-gradient(${gradientAngle}deg, ${gradientStops.map(s => `${s.color} ${s.stop}%`).join(', ')})`
            : `radial-gradient(circle, ${gradientStops.map(s => `${s.color} ${s.stop}%`).join(', ')})`);
      
      // Fallback to simple colors for non-gradient animations (neon)
      // Preserve legacy two-color system for backward compatibility
      const animationColors = styles.animationColors || {};
      const primaryAnimColor = useBrandColor ? defaultBorderColor : (animationColors.primary || defaultBorderColor);
      const secondaryAnimColor = useBrandColor ? (data.accentColor || defaultBorderColor) : (animationColors.secondary || data.accentColor || defaultBorderColor);

      // Border radius based on shape
      const borderRadius = 
        shape === "circle" ? "50%" :
        shape === "square" ? "0" :
        "16px"; // rounded

      // Determine if animation needs pseudo-elements (wrapper) or can be on image
      const usePseudoElements = animation === "instagram" || animation === "shimmer" || animation === "gradient-slide";
      
      // Wrapper styles - hosts pseudo-element animations and positioning
      const wrapperStyles: React.CSSProperties = {
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius,
      };

      // Get position values (-50 to +50)
      const positionX = styles.positionX || 0;
      const positionY = styles.positionY || 0;
      
      // Image styles - appearance properties
      const imageStyles: React.CSSProperties = {
        width: '100%',
        height: '100%',
        borderRadius,
        opacity,
        objectFit: 'cover' as const,
        objectPosition: `${50 + positionX}% ${50 + positionY}%`, // Center is 50%, range is 0-100%
      };

      // Add shadow to wrapper
      if (shadow > 0) {
        wrapperStyles.boxShadow = `0 ${shadow / 2}px ${shadow}px rgba(0, 0, 0, 0.3)`;
      }

      // Add border to image ONLY if no animation is active (fixes double border issue)
      if (borderWidth > 0 && animation === "none") {
        imageStyles.border = `${borderWidth}px solid ${borderColor}`;
      }

      // For animated borders, add CSS variables for custom colors
      if (animation !== "none") {
        wrapperStyles['--profile-gradient' as any] = gradientCss;
        wrapperStyles['--profile-anim-color-1' as any] = primaryAnimColor; // For neon animation
        wrapperStyles['--profile-anim-color-2' as any] = secondaryAnimColor; // For legacy two-color animations
        wrapperStyles['--profile-border-width' as any] = `${borderWidth}px`;
        
        // Apply to image for direct animations (neon, wave)
        imageStyles['--profile-gradient' as any] = gradientCss;
        imageStyles['--profile-anim-color-1' as any] = primaryAnimColor;
        imageStyles['--profile-anim-color-2' as any] = secondaryAnimColor;
        imageStyles['--profile-border-width' as any] = `${borderWidth}px`;
      }

      // Separate animation classes for wrapper vs image
      const wrapperAnimationClass = usePseudoElements ? (
        animation === "instagram" ? "profile-image-instagram" :
        animation === "shimmer" ? "profile-image-shimmer" :
        animation === "gradient-slide" ? "profile-image-gradient-slide" :
        ""
      ) : "";

      const imageAnimationClass = !usePseudoElements ? (
        animation === "neon" ? "profile-image-neon" :
        animation === "wave" ? "profile-image-wave" :
        ""
      ) : "";

      return { 
        wrapperStyles, 
        imageStyles, 
        wrapperAnimationClass,
        imageAnimationClass,
        visible: styles.visible !== false 
      };
    };

    // Helper function for cover image styles and animation
    const getCoverImageStyle = (defaultHeight: number = 200) => {
      const styles = data.coverImageStyles || {};
      const height = styles.height || defaultHeight;
      const borderWidth = styles.borderWidth || 0;
      const animation = styles.animation || "none";
      
      // Get animation colors (use brand color if useBrandColor is true)
      const useBrandColor = styles.useBrandColor !== false; // Default to true
      
      // Animation-specific default gradients (same as profile)
      const getDefaultGradient = () => {
        switch(animation) {
          case 'instagram':
            return {
              stops: [
                { color: '#f09433', stop: 0 },
                { color: '#e6683c', stop: 25 },
                { color: '#dc2743', stop: 50 },
                { color: '#cc2366', stop: 75 },
                { color: '#bc1888', stop: 100 }
              ],
              angle: 45,
              type: 'linear' as const
            };
          case 'wave':
            return {
              stops: [
                { color: '#1E40AF', stop: 0 },
                { color: '#06B6D4', stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
          case 'shimmer':
            return {
              stops: [
                { color: 'transparent', stop: 0 },
                { color: '#E5E7EB', stop: 50 },
                { color: 'transparent', stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
          case 'gradient-slide':
            return {
              stops: [
                { color: '#8B5CF6', stop: 0 },
                { color: '#3B82F6', stop: 100 }
              ],
              angle: 45,
              type: 'linear' as const
            };
          case 'neon':
            return {
              stops: [
                { color: '#00D9FF', stop: 0 },
                { color: '#00D9FF', stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
          default:
            return {
              stops: [
                { color: data.brandColor || "#4ecdc4", stop: 0 },
                { color: data.accentColor || "#f093fb", stop: 100 }
              ],
              angle: 90,
              type: 'linear' as const
            };
        }
      };
      
      // Get gradient configuration with animation-specific defaults
      const animationGradient = styles.animationGradient || {};
      const defaultGradient = getDefaultGradient();
      const gradientStops = animationGradient.stops || defaultGradient.stops;
      const gradientAngle = animationGradient.angle !== undefined ? animationGradient.angle : defaultGradient.angle;
      const gradientType = animationGradient.type || defaultGradient.type;
      
      // Use brand color as default
      const defaultBorderColor = data.brandColor || data.accentColor || "#ffffff";
      
      // Build gradient CSS string
      const gradientCss = useBrandColor 
        ? (gradientType === 'linear'
            ? `linear-gradient(${gradientAngle}deg, ${defaultBorderColor} 0%, ${data.accentColor || defaultBorderColor} 100%)`
            : `radial-gradient(circle, ${defaultBorderColor} 0%, ${data.accentColor || defaultBorderColor} 100%)`)
        : (gradientType === 'linear'
            ? `linear-gradient(${gradientAngle}deg, ${gradientStops.map(s => `${s.color} ${s.stop}%`).join(', ')})`
            : `radial-gradient(circle, ${gradientStops.map(s => `${s.color} ${s.stop}%`).join(', ')})`);
      
      // Simple colors for non-gradient animations (neon)
      const animationColors = styles.animationColors || {};
      const primaryAnimColor = useBrandColor ? defaultBorderColor : (animationColors.primary || defaultBorderColor);
      const secondaryAnimColor = useBrandColor ? (data.accentColor || defaultBorderColor) : (animationColors.secondary || data.accentColor || defaultBorderColor);

      // Determine if animation needs pseudo-elements
      const usePseudoElements = animation === "instagram" || animation === "shimmer" || animation === "gradient-slide";
      
      // Wrapper styles - hosts pseudo-element animations
      const wrapperStyles: React.CSSProperties = {
        position: 'relative',
        height: `${height}px`,
      };

      // Cover styles - background properties
      const coverStyles: React.CSSProperties = {
        backgroundImage: data.backgroundImage
          ? `url(${getOptimizedImageSrc(data.backgroundImage, "large")})`
          : undefined,
        backgroundColor: !data.backgroundImage
          ? data.brandColor || "#22c55e"
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      };

      // Add border if no animation
      if (borderWidth > 0 && animation === "none") {
        coverStyles.border = `${borderWidth}px solid ${defaultBorderColor}`;
      }

      // For animated borders, add CSS variables
      if (animation !== "none") {
        wrapperStyles['--cover-gradient' as any] = gradientCss;
        wrapperStyles['--cover-anim-color-1' as any] = primaryAnimColor;
        wrapperStyles['--cover-anim-color-2' as any] = secondaryAnimColor;
        wrapperStyles['--cover-border-width' as any] = `${borderWidth}px`;
      }

      // Animation classes
      const wrapperAnimationClass = usePseudoElements ? (
        animation === "instagram" ? "cover-image-instagram" :
        animation === "shimmer" ? "cover-image-shimmer" :
        animation === "gradient-slide" ? "cover-image-gradient-slide" :
        ""
      ) : "";

      const coverAnimationClass = !usePseudoElements ? (
        animation === "neon" ? "cover-image-neon" :
        animation === "wave" ? "cover-image-wave" :
        ""
      ) : "";

      return { 
        wrapperStyles, 
        coverStyles, 
        wrapperAnimationClass,
        coverAnimationClass,
        height 
      };
    };

    // Helper functions for enhanced icon styling
    const getSkinClass = (section: "contactInfo" | "socialMedia"): string => {
      const skin = getSectionStyle(section, "skin") || "flat";
      return `tl-skin-${skin}`;
    };

    const getShapeClass = (section: "contactInfo" | "socialMedia"): string => {
      const shape = getSectionStyle(section, "shape") || "rounded";
      return `tl-shape-${shape}`;
    };

    const getColumnClass = (section: "contactInfo" | "socialMedia"): string => {
      const columns = getSectionStyle(section, "columns") || "auto";
      if (
        ["contactInfo", "socialMedia"].includes(section) &&
        columns === "auto"
      ) {
        return `tl-cols-4`;
      }
      return `tl-cols-${columns}`;
    };

    const getAlignmentClass = (
      section: "contactInfo" | "socialMedia",
    ): string => {
      const alignment = getSectionStyle(section, "alignment") || "left";
      return `tl-align-${alignment}`;
    };

    const getViewType = (
      section: "contactInfo" | "socialMedia",
    ): "icon-text" | "icon" | "text" => {
      const view = getSectionStyle(section, "view") || "icon-text";
      return view as "icon-text" | "icon" | "text";
    };

    const shouldShowLabel = (
      section: "contactInfo" | "socialMedia",
    ): boolean => {
      const viewType = getViewType(section);
      if (viewType !== "icon-text") return false;

      const showLabel = getSectionStyle(section, "showLabel");
      // Handle both string and boolean values for backward compatibility
      if (typeof showLabel === "boolean") return showLabel;
      if (typeof showLabel === "string") return showLabel !== "false";
      return true; // Default to true if not set
    };

    const getTextPositionClass = (
      section: "contactInfo" | "socialMedia",
    ): string => {
      const textPosition = getSectionStyle(section, "textPosition") || "right";
      return `tl-text-${textPosition}`;
    };

    // Helper functions for type safety
    const parseNumeric = (
      value: string | undefined,
      defaultValue: number,
    ): number => {
      if (!value) return defaultValue;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? defaultValue : parsed;
    };

    const parseHexColor = (
      color: string | undefined,
      fallback: string,
    ): string => {
      if (!color || !/^#[0-9a-fA-F]{6}$/.test(color)) return fallback;
      return color;
    };

    const hexToRgba = (hex: string, opacity: number): string => {
      const validHex = parseHexColor(hex, "#000000");
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
          id: "primary-phone",
          type: "phone",
          value: data.phone,
          label: "Phone",
          icon: "fas fa-phone",
        });
      }

      if (data.email) {
        contacts.push({
          id: "primary-email",
          type: "email",
          value: data.email,
          label: "Email",
          icon: "fas fa-envelope",
        });
      }

      if (data.website) {
        contacts.push({
          id: "primary-website",
          type: "website",
          value: data.website,
          label: "Website",
          icon: "fas fa-globe",
        });
      }

      if (data.linkedin) {
        contacts.push({
          id: "primary-linkedin",
          type: "linkedin",
          value: data.linkedin,
          label: "LinkedIn",
          icon: "fab fa-linkedin",
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
            ? "rounded-none shadow-none min-h-full"
            : "rounded-none md:rounded-2xl shadow-none md:shadow-2xl card-shadow"
        }`}
        style={{
          maxWidth: isMobilePreview ? "100%" : "430px",
          backgroundColor: isMobilePreview
            ? "transparent"
            : data.backgroundColor || "#ffffff",
          fontFamily: data.font
            ? `var(--font-${data.font})`
            : "var(--font-inter)",
          color: data.textColor || "#000000",
          minHeight: isMobilePreview ? "100%" : "auto",
        }}
      >
        <div className="relative">
          {/* Header Design - Cover + Logo */}
          {(data.headerDesign === "cover-logo" || !data.headerDesign) && (
            <CoverImageSection
              coverImageUrl={data.backgroundImage ? getOptimizedImageSrc(data.backgroundImage, "large") : undefined}
              brandColor={data.brandColor || "#22c55e"}
              coverImageStyles={data.coverImageStyles}
              defaultHeight={160}
            >
              {/* Logo in top left corner */}
              {data.logo && (
                <div 
                  className="absolute z-10"
                  style={{
                    top: data.coverImageStyles?.logoPositionY !== undefined ? `${data.coverImageStyles.logoPositionY}%` : '16px',
                    left: data.coverImageStyles?.logoPositionX !== undefined ? `${data.coverImageStyles.logoPositionX}%` : '16px',
                  }}
                >
                  <img
                    src={data.logo}
                    alt="Logo"
                    className="h-8 w-auto max-w-20 object-contain"
                    data-testid="img-logo"
                  />
                </div>
              )}

              {/* Profile Photo with Styling */}
              {(() => {
                const { wrapperStyles, imageStyles, wrapperAnimationClass, imageAnimationClass, visible } = getProfileImageStyle(96);
                if (!visible) return null;
                // Profile positioning on cover (default: bottom-center, slightly below cover)
                const profilePosX = data.coverImageStyles?.profilePositionX ?? 50; // 0-100%, default 50% (center)
                const profilePosY = data.coverImageStyles?.profilePositionY ?? 100; // 0-100%, default 100% (bottom edge + overflow)
                return (
                  <div 
                    className="absolute z-30"
                    style={{
                      left: `${profilePosX}%`,
                      top: `${profilePosY}%`,
                      transform: 'translate(-50%, -50%)', // Center element at the X,Y point
                    }}
                  >
                    <div className={wrapperAnimationClass} style={wrapperStyles}>
                      <img
                        src={profileImageSrc}
                        alt={data.fullName || "Profile photo"}
                        className={imageAnimationClass}
                        style={imageStyles}
                        data-testid="img-profile-photo"
                      />
                    </div>
                  </div>
                );
              })()}
            </CoverImageSection>
          )}

          {/* Header Design - Profile Center */}
          {data.headerDesign === "profile-center" && (
            <CoverImageSection
              coverImageUrl={data.backgroundImage ? getOptimizedImageSrc(data.backgroundImage, "large") : undefined}
              brandColor={data.brandColor || "#22c55e"}
              coverImageStyles={data.coverImageStyles}
              defaultHeight={128}
            >
              {/* Large Profile Photo */}
              {(() => {
                const { wrapperStyles, imageStyles, wrapperAnimationClass, imageAnimationClass, visible } = getProfileImageStyle(128);
                if (!visible) return null;
                return (
                  <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-20">
                    <div className={wrapperAnimationClass} style={wrapperStyles}>
                      <img
                        src={profileImageSrc}
                        alt={data.fullName || "Profile photo"}
                        className={imageAnimationClass}
                        style={imageStyles}
                        data-testid="img-profile-photo"
                      />
                    </div>
                  </div>
                );
              })()}

              {/* Logo in top right */}
              {data.logo && (
                <div 
                  className="absolute z-10"
                  style={{
                    top: data.coverImageStyles?.logoPositionY !== undefined ? `${data.coverImageStyles.logoPositionY}%` : '16px',
                    right: data.coverImageStyles?.logoPositionX !== undefined ? `${100 - data.coverImageStyles.logoPositionX}%` : '16px',
                  }}
                >
                  <img
                    src={data.logo}
                    alt="Logo"
                    className="h-6 w-auto max-w-16 object-contain"
                    data-testid="img-logo"
                  />
                </div>
              )}
            </CoverImageSection>
          )}

          {/* Header Design - Split Layout */}
          {data.headerDesign === "split-design" && (
            <div className="relative flex" style={{ height: `${data.coverImageStyles?.height || 160}px` }}>
              {/* Left side - Cover */}
              <CoverImageSection
                coverImageUrl={data.backgroundImage ? getOptimizedImageSrc(data.backgroundImage, "large") : undefined}
                brandColor={data.brandColor || "#22c55e"}
                coverImageStyles={data.coverImageStyles}
                defaultHeight={160}
                className="flex-1"
              >
                {/* Profile Photo on left side */}
                {(() => {
                  const { wrapperStyles, imageStyles, wrapperAnimationClass, imageAnimationClass, visible } = getProfileImageStyle(80);
                  if (!visible) return null;
                  const profilePosX = data.coverImageStyles?.profilePositionX ?? 90; // Default: near right edge
                  const profilePosY = data.coverImageStyles?.profilePositionY ?? 100;
                  return (
                    <div 
                      className="absolute z-30"
                      style={{
                        left: `${profilePosX}%`,
                        top: `${profilePosY}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div className={wrapperAnimationClass} style={wrapperStyles}>
                        <img
                          src={profileImageSrc}
                          alt={data.fullName || "Profile photo"}
                          className={imageAnimationClass}
                          style={imageStyles}
                          data-testid="img-profile-photo"
                        />
                      </div>
                    </div>
                  );
                })()}
              </CoverImageSection>

              {/* Right side - Logo space */}
              <div
                className="w-24 flex items-center justify-center z-10"
                style={{ backgroundColor: data.accentColor || "#16a34a" }}
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
          {data.headerDesign === "shape-divider" && (
            <HeaderPreview
              headerPreset={data.headerPreset || defaultHeaderPreset}
              cardData={data}
              profileImageSrc={profileImageSrc}
            />
          )}
        </div>

        {/* Content */}
        <div
          className={`pb-8 px-6 text-center text-slate-800 ${
            data.headerDesign === "profile-center"
              ? "pt-20"
              : data.headerDesign === "split-design"
                ? "pt-16"
                : data.headerDesign === "shape-divider"
                  ? "pt-8"
                  : "pt-16"
          }`}
        >
          {/* Name, Title, Company with Group Positioning */}
          <div
            style={{
              transform: `translate(${Number(getSectionStyle("basicInfo", "textGroupHorizontal")) || 0}px, ${Number(getSectionStyle("basicInfo", "textGroupVertical")) || 0}px)`,
            }}
          >
            <h3
              className="text-xl font-bold"
              style={{
                color:
                  getSectionStyle("basicInfo", "nameColor") ||
                  data.headingColor ||
                  "#1f2937",
                fontSize: `${getSectionStyle("basicInfo", "nameFontSize") || (data.headingFontSize || 20) + 4}px`,
                fontWeight:
                  getSectionStyle("basicInfo", "nameFontWeight") ||
                  data.headingFontWeight ||
                  600,
                fontFamily:
                  getSectionStyle("basicInfo", "nameFont") || "Inter, sans-serif",
                fontStyle:
                  getSectionStyle("basicInfo", "nameTextStyle") || "normal",
                marginBottom: `${getSectionStyle("basicInfo", "nameSpacing") ?? 8}px`,
                textAlign: "center",
                transform: `translate(${Number(getSectionStyle("basicInfo", "namePositionX")) || 0}px, ${Number(getSectionStyle("basicInfo", "namePositionY")) || 0}px)`,
              }}
              data-testid="text-name"
            >
              {data.fullName || "Your Name"}
            </h3>
            <p
              className="text-sm"
              style={{
                color:
                  getSectionStyle("basicInfo", "titleColor") ||
                  data.paragraphColor ||
                  "#4b5563",
                fontSize: `${getSectionStyle("basicInfo", "titleFontSize") || data.paragraphFontSize || 14}px`,
                fontWeight:
                  getSectionStyle("basicInfo", "titleFontWeight") ||
                  data.paragraphFontWeight ||
                  400,
                fontFamily:
                  getSectionStyle("basicInfo", "titleFont") ||
                  "Inter, sans-serif",
                fontStyle:
                  getSectionStyle("basicInfo", "titleTextStyle") || "normal",
                marginBottom: `${getSectionStyle("basicInfo", "titleSpacing") ?? 8}px`,
                textAlign: "center",
                transform: `translate(${Number(getSectionStyle("basicInfo", "titlePositionX")) || 0}px, ${Number(getSectionStyle("basicInfo", "titlePositionY")) || 0}px)`,
              }}
              data-testid="text-title"
            >
              {data.title || "Your Title"}
            </p>
            {data.company && (
              <p
                className="text-sm"
                style={{
                  color:
                    getSectionStyle("basicInfo", "companyColor") || "#6b7280",
                  fontSize: `${getSectionStyle("basicInfo", "companyFontSize") || data.paragraphFontSize || 14}px`,
                  fontWeight:
                    getSectionStyle("basicInfo", "companyFontWeight") ||
                    data.paragraphFontWeight ||
                    400,
                  fontFamily:
                    getSectionStyle("basicInfo", "companyFont") ||
                    "Inter, sans-serif",
                  fontStyle:
                    getSectionStyle("basicInfo", "companyTextStyle") || "normal",
                  marginBottom: `${getSectionStyle("basicInfo", "companySpacing") ?? 8}px`,
                  textAlign: "center",
                  transform: `translate(${Number(getSectionStyle("basicInfo", "companyPositionX")) || 0}px, ${Number(getSectionStyle("basicInfo", "companyPositionY")) || 0}px)`,
                }}
                data-testid="text-company"
              >
                {data.company}
              </p>
            )}
          </div>

          {/* New Button Layout - Top 8 Buttons from Contact Information */}
          <div className="mb-6 space-y-2">
            {/* Grid of Contact Buttons ONLY - Responsive 2 rows of 4 */}
            <div className="space-y-2">
              {/* Contact Information with Enhanced Icon Styling */}
              {data.customContacts && data.customContacts.length > 0 && (
                <div
                  className={`px-4 ${getColumnClass("contactInfo")} ${getAlignmentClass("contactInfo")}`}
                  style={
                    getSectionStyle(
                      "contactInfo",
                      "containerStylingEnabled",
                    ) === "true"
                      ? {
                          gap: `${parseNumeric(getSectionStyle("contactInfo", "containerGap"), 8)}px`,
                        }
                      : {
                          gap: "8px",
                        }
                  }
                  data-testid="container-contact-info"
                >
                  {data.customContacts
                    .filter((contact) => contact?.value && contact?.label)
                    .map((contact) => {
                      const viewType = getViewType("contactInfo");
                      const shouldShowIcons =
                        viewType === "icon" || viewType === "icon-text";
                      const shouldShowText =
                        viewType === "text" || viewType === "icon-text";
                      const showLabel = shouldShowLabel("contactInfo");

                      // For text-only view, render as simple link/button
                      if (viewType === "text") {
                        return (
                          <button
                            key={contact.id}
                            onClick={() =>
                              handleContactAction(contact.type, contact.value)
                            }
                            className={`text-left p-2 rounded transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${getSkinClass("contactInfo")} ${getShapeClass("contactInfo")}`}
                            style={{
                              color:
                                getSectionStyle(
                                  "contactInfo",
                                  "iconTextColor",
                                ) || "#374151",
                              fontSize: `${parseNumeric(getSectionStyle("contactInfo", "iconTextSize"), 14)}px`,
                              fontFamily:
                                getSectionStyle(
                                  "contactInfo",
                                  "iconTextFont",
                                ) || "Inter, sans-serif",
                              fontWeight:
                                getSectionStyle(
                                  "contactInfo",
                                  "iconTextWeight",
                                ) || "500",
                            }}
                            data-testid={`button-text-contact-${contact.id}`}
                          >
                            {contact.label}
                          </button>
                        );
                      }

                      // For icon and icon-text views
                      return (
                        <div
                          key={contact.id}
                          className={`tl-icon-container ${viewType === "icon-text" ? `flex w-full ${getTextPositionClass("contactInfo")}` : "flex items-center"} ${getSectionStyle("contactInfo", "containerStylingEnabled") === "true" ? "justify-center" : ""}`}
                          style={
                            getSectionStyle(
                              "contactInfo",
                              "containerStylingEnabled",
                            ) === "true"
                              ? {
                                  backgroundColor:
                                    getSectionStyle(
                                      "contactInfo",
                                      "containerBackgroundColor",
                                    ) || "transparent",
                                  borderWidth: getSectionStyle(
                                    "contactInfo",
                                    "containerBorderColor",
                                  )
                                    ? "1px"
                                    : "0",
                                  borderStyle: getSectionStyle(
                                    "contactInfo",
                                    "containerBorderColor",
                                  )
                                    ? "solid"
                                    : "none",
                                  borderColor:
                                    getSectionStyle(
                                      "contactInfo",
                                      "containerBorderColor",
                                    ) || "transparent",
                                  borderRadius: `${parseNumeric(getSectionStyle("contactInfo", "containerBorderRadius"), 8)}px`,
                                  width: `${parseNumeric(getSectionStyle("contactInfo", "containerWidth"), 80)}px`,
                                  height: `${parseNumeric(getSectionStyle("contactInfo", "containerHeight"), 80)}px`,
                                  padding: "8px",
                                  boxShadow:
                                    getSectionStyle(
                                      "contactInfo",
                                      "containerDropShadowEnabled",
                                    ) === "true"
                                      ? `${parseNumeric(getSectionStyle("contactInfo", "containerDropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("contactInfo", "containerDropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("contactInfo", "containerDropShadowBlur"), 4)}px ${hexToRgba(getSectionStyle("contactInfo", "containerDropShadowColor") || "#000000", parseFloat(getSectionStyle("contactInfo", "containerDropShadowOpacity") || "0.25"))}`
                                      : "none",
                                }
                              : {}
                          }
                          data-testid={`container-custom-contact-${contact.id}`}
                        >
                          {shouldShowIcons && (
                            <button
                              onClick={() =>
                                handleContactAction(contact.type, contact.value)
                              }
                              className={`flex items-center justify-center ${viewType === "icon-text" ? "mb-1" : ""} tl-icon-base ${getSkinClass("contactInfo")} ${getShapeClass("contactInfo")} ${getSectionStyle("contactInfo", "enableHoverColor") === "true" ? "tl-icon-hover" : ""}`}
                              style={
                                {
                                  // Base CSS variables - always applied
                                  "--tl-icon-bg":
                                    getSectionStyle(
                                      "contactInfo",
                                      "iconBackgroundColor",
                                    ) ||
                                    data.secondaryColor ||
                                    data.accentColor ||
                                    "#16a34a",
                                  "--tl-icon-color":
                                    getSectionStyle(
                                      "contactInfo",
                                      "iconColor",
                                    ) ||
                                    data.tertiaryColor ||
                                    "#ffffff",
                                  "--tl-border":
                                    getSectionStyle(
                                      "contactInfo",
                                      "iconBorderColor",
                                    ) || "transparent",
                                  // Hover CSS variables - only when toggle enabled
                                  ...(getSectionStyle(
                                    "contactInfo",
                                    "enableHoverColor",
                                  ) === "true"
                                    ? {
                                        "--tl-icon-bg-hover":
                                          getSectionStyle(
                                            "contactInfo",
                                            "iconBackgroundHoverColor",
                                          ) ||
                                          adjustColor(
                                            getSectionStyle(
                                              "contactInfo",
                                              "iconBackgroundColor",
                                            ) ||
                                              data.secondaryColor ||
                                              data.accentColor ||
                                              "#16a34a",
                                            20,
                                          ),
                                        "--tl-icon-color-hover":
                                          getSectionStyle(
                                            "contactInfo",
                                            "iconHoverColor",
                                          ) ||
                                          adjustColor(
                                            getSectionStyle(
                                              "contactInfo",
                                              "iconColor",
                                            ) ||
                                              data.tertiaryColor ||
                                              "#ffffff",
                                            -20,
                                          ),
                                        "--tl-border-hover":
                                          getSectionStyle(
                                            "contactInfo",
                                            "iconBorderColor",
                                          ) || "transparent",
                                      }
                                    : {}),
                                  borderWidth: getSectionStyle(
                                    "contactInfo",
                                    "iconBorderColor",
                                  )
                                    ? `${parseNumeric(getSectionStyle("contactInfo", "borderSize"), 1)}px`
                                    : "0",
                                  borderStyle: getSectionStyle(
                                    "contactInfo",
                                    "iconBorderColor",
                                  )
                                    ? "solid"
                                    : "none",
                                  width: `${parseNumeric(getSectionStyle("contactInfo", "iconBackgroundWidth"), parseNumeric(getSectionStyle("contactInfo", "iconBackgroundSize"), 48))}px`,
                                  height: `${parseNumeric(getSectionStyle("contactInfo", "iconBackgroundHeight"), parseNumeric(getSectionStyle("contactInfo", "iconBackgroundSize"), 48))}px`,
                                  boxShadow:
                                    getSectionStyle(
                                      "contactInfo",
                                      "dropShadowEnabled",
                                    ) === "true"
                                      ? `${parseNumeric(getSectionStyle("contactInfo", "dropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("contactInfo", "dropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("contactInfo", "dropShadowBlur"), 4)}px ${hexToRgba(getSectionStyle("contactInfo", "dropShadowColor") || "#000000", parseFloat(getSectionStyle("contactInfo", "dropShadowOpacity") || "0.25"))}`
                                      : "none",
                                } as React.CSSProperties
                              }
                              data-testid={`button-custom-contact-${contact.id}`}
                            >
                              <i
                                className={contact.icon}
                                style={{
                                  fontSize: `${parseNumeric(getSectionStyle("contactInfo", "iconSize"), 14)}px`,
                                }}
                              ></i>
                            </button>
                          )}
                          {shouldShowText && showLabel && (
                            <span
                              className="font-medium text-center"
                              style={{
                                color:
                                  getSectionStyle(
                                    "contactInfo",
                                    "iconTextColor",
                                  ) || "#374151",
                                fontSize: `${parseNumeric(getSectionStyle("contactInfo", "iconTextSize"), 12)}px`,
                                fontFamily:
                                  getSectionStyle(
                                    "contactInfo",
                                    "iconTextFont",
                                  ) || "Inter, sans-serif",
                                fontWeight:
                                  getSectionStyle(
                                    "contactInfo",
                                    "iconTextWeight",
                                  ) || "500",
                              }}
                            >
                              {contact.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Social Media with Enhanced Icon Styling */}
            {data.customSocials && data.customSocials.length > 0 && (
              <div
                className={`px-4 ${getColumnClass("socialMedia")} ${getAlignmentClass("socialMedia")}`}
                style={{
                  ...(getSectionStyle(
                    "socialMedia",
                    "containerStylingEnabled",
                  ) === "true"
                    ? {
                        backgroundColor:
                          getSectionStyle(
                            "socialMedia",
                            "containerBackgroundColor",
                          ) || "transparent",
                        borderColor:
                          getSectionStyle(
                            "socialMedia",
                            "containerBorderColor",
                          ) || "transparent",
                        borderWidth: getSectionStyle(
                          "socialMedia",
                          "containerBorderColor",
                        )
                          ? "1px"
                          : "0",
                        borderStyle: getSectionStyle(
                          "socialMedia",
                          "containerBorderColor",
                        )
                          ? "solid"
                          : "none",
                        borderRadius: `${parseNumeric(getSectionStyle("socialMedia", "containerBorderRadius"), 8)}px`,
                        padding:
                          getSectionStyle(
                            "socialMedia",
                            "containerStylingEnabled",
                          ) === "true"
                            ? "12px"
                            : "1rem",
                        width: getSectionStyle("socialMedia", "containerWidth")
                          ? `${parseNumeric(getSectionStyle("socialMedia", "containerWidth"), 100)}%`
                          : "100%",
                        minHeight: getSectionStyle(
                          "socialMedia",
                          "containerHeight",
                        )
                          ? `${parseNumeric(getSectionStyle("socialMedia", "containerHeight"), "auto")}px`
                          : "auto",
                        boxShadow:
                          getSectionStyle(
                            "socialMedia",
                            "containerDropShadowEnabled",
                          ) === "true"
                            ? `${parseNumeric(getSectionStyle("socialMedia", "containerDropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("socialMedia", "containerDropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("socialMedia", "containerDropShadowBlur"), 8)}px ${hexToRgba(getSectionStyle("socialMedia", "containerDropShadowColor") || "#000000", parseFloat(getSectionStyle("socialMedia", "containerDropShadowOpacity") || "0.1"))}`
                            : "none",
                      }
                    : {}),
                  gap: `${parseNumeric(getSectionStyle("socialMedia", "containerGap"), 8)}px`,
                }}
                data-testid="container-social-media"
              >
                {data.customSocials
                  ?.filter((social) => social.value)
                  .map((social) => {
                    const viewType = getViewType("socialMedia");
                    const shouldShowIcons =
                      viewType === "icon" || viewType === "icon-text";
                    const shouldShowText =
                      viewType === "text" || viewType === "icon-text";
                    const showLabel = shouldShowLabel("socialMedia");

                    // For text-only view, render as simple link/button
                    if (viewType === "text") {
                      return (
                        <button
                          key={social.id}
                          onClick={() =>
                            handleContactAction(social.platform, social.value)
                          }
                          className={`text-left p-2 rounded transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 ${getSkinClass("socialMedia")} ${getShapeClass("socialMedia")}`}
                          style={{
                            color:
                              getSectionStyle("socialMedia", "iconTextColor") ||
                              "#374151",
                            fontSize: `${parseNumeric(getSectionStyle("socialMedia", "iconTextSize"), 14)}px`,
                            fontFamily:
                              getSectionStyle("socialMedia", "iconTextFont") ||
                              "Inter, sans-serif",
                            fontWeight:
                              getSectionStyle(
                                "socialMedia",
                                "iconTextWeight",
                              ) || "500",
                          }}
                          data-testid={`button-text-social-${social.id}`}
                        >
                          {social.label || "Social"}
                        </button>
                      );
                    }

                    // For icon and icon-text views
                    return (
                      <button
                        key={social.id}
                        onClick={() =>
                          handleContactAction(social.platform, social.value)
                        }
                        className={`tl-social-button ${getSkinClass("socialMedia")} ${getShapeClass("socialMedia")} ${getSectionStyle("socialMedia", "enableHoverColor") === "true" ? "tl-icon-hover" : ""} ${viewType === "icon-text" ? `w-full ${getTextPositionClass("socialMedia")}` : "w-auto"}`}
                        data-platform={social.platform}
                        style={{
                          // Base CSS variables - always applied
                          "--tl-icon-bg":
                            getSectionStyle(
                              "socialMedia",
                              "iconBackgroundColor",
                            ) ||
                            data.brandColor ||
                            "#22c55e",
                          "--tl-icon-color":
                            getSectionStyle("socialMedia", "iconTextColor") ||
                            data.tertiaryColor ||
                            "#ffffff",
                          "--tl-border":
                            getSectionStyle("socialMedia", "iconBorderColor") ||
                            "transparent",
                          // Hover CSS variables - only when toggle enabled
                          ...(getSectionStyle(
                            "socialMedia",
                            "enableHoverColor",
                          ) === "true"
                            ? {
                                "--tl-icon-bg-hover":
                                  getSectionStyle(
                                    "socialMedia",
                                    "iconBackgroundHoverColor",
                                  ) ||
                                  adjustColor(
                                    getSectionStyle(
                                      "socialMedia",
                                      "iconBackgroundColor",
                                    ) ||
                                      data.brandColor ||
                                      "#22c55e",
                                    20,
                                  ),
                                "--tl-icon-color-hover":
                                  getSectionStyle(
                                    "socialMedia",
                                    "iconHoverColor",
                                  ) ||
                                  adjustColor(
                                    getSectionStyle(
                                      "socialMedia",
                                      "iconTextColor",
                                    ) ||
                                      data.tertiaryColor ||
                                      "#ffffff",
                                    -20,
                                  ),
                                "--tl-border-hover":
                                  getSectionStyle(
                                    "socialMedia",
                                    "iconBorderColor",
                                  ) || "transparent",
                              }
                            : {}),
                          borderWidth: getSectionStyle(
                            "socialMedia",
                            "iconBorderColor",
                          )
                            ? `${parseNumeric(getSectionStyle("socialMedia", "borderSize"), 1)}px`
                            : "0",
                          borderStyle: getSectionStyle(
                            "socialMedia",
                            "iconBorderColor",
                          )
                            ? "solid"
                            : "none",
                          borderBottom: getSectionStyle(
                            "socialMedia",
                            "iconBorderColor",
                          )
                            ? "none"
                            : `4px solid ${data.secondaryColor ? adjustColor(data.secondaryColor, -20) : data.accentColor ? adjustColor(data.accentColor, -20) : "#16a34a"}`,
                          fontFamily:
                            getSectionStyle("socialMedia", "iconTextFont") ||
                            "inherit",
                          fontSize: `${parseNumeric(getSectionStyle("socialMedia", "iconTextSize"), 14)}px`,
                          fontWeight:
                            getSectionStyle("socialMedia", "iconTextWeight") ||
                            "600",
                          fontStyle:
                            getSectionStyle("socialMedia", "iconTextStyle") ||
                            "normal",
                          boxShadow:
                            getSectionStyle(
                              "socialMedia",
                              "dropShadowEnabled",
                            ) === "true"
                              ? `${parseNumeric(getSectionStyle("socialMedia", "dropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("socialMedia", "dropShadowOffset"), 2)}px ${parseNumeric(getSectionStyle("socialMedia", "dropShadowBlur"), 4)}px ${hexToRgba(getSectionStyle("socialMedia", "dropShadowColor") || "#000000", parseFloat(getSectionStyle("socialMedia", "dropShadowOpacity") || "0.25"))}`
                              : "none",
                          // Icon container dimensions - for icon and icon-text views
                          ...(shouldShowIcons && {
                            width: `${parseNumeric(getSectionStyle("socialMedia", "iconBackgroundWidth"), parseNumeric(getSectionStyle("socialMedia", "iconBackgroundSize"), 100))}%`,
                            height: `${parseNumeric(getSectionStyle("socialMedia", "iconBackgroundHeight"), parseNumeric(getSectionStyle("socialMedia", "iconBackgroundSize"), 100))}%`,
                          }),
                        }}
                        data-testid={`button-custom-social-${social.id}`}
                      >
                        {shouldShowIcons && (
                          <i
                            className={`${social.icon} tl-icon-symbol`}
                            style={{
                              fontSize: `${parseNumeric(getSectionStyle("socialMedia", "iconSize"), 18)}px`,
                            }}
                          ></i>
                        )}
                        {shouldShowText && showLabel && (
                          <span className="tl-icon-text">
                            {social.label || "Social"}
                          </span>
                        )}
                      </button>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Page Elements */}
          {data.pageElements && data.pageElements.length > 0 && (
            <div className="space-y-4 mb-6">
              {data.pageElements.map((element) => (
                <PageElementRenderer
                  key={element.id}
                  element={element}
                  isInteractive={isInteractive}
                  cardData={data}
                  onNavigatePage={onNavigatePage}
                />
              ))}
            </div>
          )}

          {/* QR Code */}
          {showQR && (
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-2">Scan me</p>
              <div className="inline-block p-2 bg-white border border-slate-200 rounded-lg">
                <QRCodeSVG
                  value={
                    shareUrl.length > 200
                      ? shareUrl.substring(0, 200)
                      : shareUrl
                  }
                  size={80}
                  level="L"
                  includeMargin={false}
                />
              </div>
              <p
                className="text-xs mt-2 font-medium"
                style={{ color: data.brandColor || "#22c55e" }}
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
                        onClick={() => handleShare("copy")}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Link
                      </Button>
                      <Button
                        onClick={() => handleShare("whatsapp")}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button
                        onClick={() => handleShare("facebook")}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Facebook className="h-4 w-4 mr-2" />
                        Facebook
                      </Button>
                      <Button
                        onClick={() => handleShare("twitter")}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      >
                        <Twitter className="h-4 w-4 mr-2" />
                        Twitter
                      </Button>
                      <Button
                        onClick={() => handleShare("linkedin")}
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
  },
);

BusinessCardComponent.displayName = "BusinessCard";
