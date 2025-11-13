import { ReactNode } from "react";
import { ShapeDivider } from "@/components/header-builder/ShapeDivider";
import { SHAPE_PRESETS } from "@/lib/header-schema";

interface CoverImageSectionProps {
  coverImageUrl?: string;
  brandColor?: string;
  coverImageStyles?: any;
  defaultHeight?: number;
  children?: ReactNode;
  className?: string;
}

// Helper function to generate SVG mask for cutout mode
function generateCutoutMask(
  topDivider: any,
  bottomDivider: any,
  height: number
): string | null {
  const hasTopCutout = topDivider?.enabled && topDivider?.cutout && topDivider?.preset && SHAPE_PRESETS[topDivider.preset];
  const hasBottomCutout = bottomDivider?.enabled && bottomDivider?.cutout && bottomDivider?.preset && SHAPE_PRESETS[bottomDivider.preset];
  
  if (!hasTopCutout && !hasBottomCutout) return null;
  
  const svgParts: string[] = [];
  
  // SVG mask: white = visible, black = transparent cutout
  svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 ${height}" preserveAspectRatio="none">`);
  
  // Fill entire area with white (visible by default)
  svgParts.push(`<rect width="1440" height="${height}" fill="white"/>`);
  
  // Add top cutout (black path)
  if (hasTopCutout) {
    const topHeight = topDivider.height || 60;
    const topWidth = topDivider.width || 100;
    const topInvert = topDivider.invert;
    const scaleX = topWidth / 100;
    const translateX = (1440 - (1440 * scaleX)) / 2;
    
    svgParts.push(`<g transform="translate(${translateX}, 0) scale(${scaleX}, 1)${topInvert ? ` scale(1, -1) translate(0, -${topHeight})` : ''}">`);
    svgParts.push(`<path d="${SHAPE_PRESETS[topDivider.preset]}" fill="black" transform="scale(1, ${topHeight / 320})"/>`);
    svgParts.push(`</g>`);
  }
  
  // Add bottom cutout (black path)
  if (hasBottomCutout) {
    const bottomHeight = bottomDivider.height || 60;
    const bottomWidth = bottomDivider.width || 100;
    const bottomInvert = bottomDivider.invert;
    const scaleX = bottomWidth / 100;
    const translateX = (1440 - (1440 * scaleX)) / 2;
    const yOffset = height - bottomHeight;
    
    svgParts.push(`<g transform="translate(${translateX}, ${yOffset}) scale(${scaleX}, 1)${bottomInvert ? ` scale(1, -1) translate(0, -${bottomHeight})` : ''}">`);
    svgParts.push(`<path d="${SHAPE_PRESETS[bottomDivider.preset]}" fill="black" transform="scale(1, ${bottomHeight / 320})"/>`);
    svgParts.push(`</g>`);
  }
  
  svgParts.push(`</svg>`);
  
  const svgString = svgParts.join('');
  const encoded = encodeURIComponent(svgString);
  return `url("data:image/svg+xml,${encoded}")`;
}

export function CoverImageSection({
  coverImageUrl,
  brandColor = "#22c55e",
  coverImageStyles = {},
  defaultHeight = 200,
  children,
  className = "",
}: CoverImageSectionProps) {
  const height = coverImageStyles?.height || defaultHeight;
  const borderWidth = coverImageStyles?.borderWidth || 0;
  const animation = coverImageStyles?.animation || "none";
  const opacity = coverImageStyles?.opacity !== undefined ? coverImageStyles.opacity : 1;
  const borderColor = coverImageStyles?.borderColor || brandColor; // Use custom color or fall back to brand color
  
  // Get animation colors
  const useBrandColor = coverImageStyles?.animationColors?.useBrandColor ?? true;
  const color1 = useBrandColor ? brandColor : (coverImageStyles?.animationColors?.primary || brandColor);
  const color2 = useBrandColor ? brandColor : (coverImageStyles?.animationColors?.secondary || brandColor);
  
  // Get gradient or use defaults
  const getDefaultGradient = (animationType: string) => {
    switch (animationType) {
      case "instagram":
        return "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)";
      case "neon":
        return "#00D9FF";
      case "wave":
        return "linear-gradient(90deg, #1E40AF 0%, #06B6D4 100%)";
      case "shimmer":
        return "linear-gradient(90deg, transparent 0%, #E5E7EB 50%, transparent 100%)";
      case "gradient-slide":
        return "linear-gradient(45deg, #8B5CF6 0%, #3B82F6 100%)";
      default:
        return brandColor;
    }
  };

  const gradient = coverImageStyles?.gradient || getDefaultGradient(animation);
  
  // Determine if animation uses pseudo-elements
  const usePseudoElements = animation === "instagram" || animation === "shimmer" || animation === "gradient-slide";

  // Wrapper styles
  const wrapperStyles: React.CSSProperties = {
    height: `${height}px`,
    position: "relative",
    overflow: "visible",
  };

  // Cover image styles
  const coverStyles: React.CSSProperties = {
    width: "100%",
    height: "100%",
    backgroundImage: coverImageUrl ? `url(${coverImageUrl})` : undefined,
    backgroundColor: !coverImageUrl ? brandColor : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    opacity,
    overflow: "hidden",
  };

  // Add border if specified
  if (borderWidth > 0 && animation === "none") {
    coverStyles.border = `${borderWidth}px solid ${borderColor}`;
  }

  // Animation-specific styles and classes
  if (animation !== "none") {
    if (usePseudoElements) {
      // For instagram, shimmer, gradient-slide - use wrapper with pseudo-element
      wrapperStyles['--cover-gradient' as any] = gradient;
      wrapperStyles['--cover-anim-color-1' as any] = color1;
      wrapperStyles['--cover-anim-color-2' as any] = color2;
      wrapperStyles['--cover-border-width' as any] = `${borderWidth}px`;
    } else {
      // For neon, wave - apply directly to cover
      coverStyles['--cover-anim-color-1' as any] = color1;
      coverStyles['--cover-anim-color-2' as any] = color2;
      if (borderWidth > 0) {
        coverStyles.border = `${borderWidth}px solid ${borderColor}`;
      }
    }
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

  // Shape divider props - support both top and bottom
  const shapeDividerTop = coverImageStyles?.shapeDividerTop;
  const shapeDividerBottom = coverImageStyles?.shapeDividerBottom;
  const showTopDivider = shapeDividerTop?.enabled && shapeDividerTop?.preset && SHAPE_PRESETS[shapeDividerTop.preset] && !shapeDividerTop?.cutout;
  const showBottomDivider = shapeDividerBottom?.enabled && shapeDividerBottom?.preset && SHAPE_PRESETS[shapeDividerBottom.preset] && !shapeDividerBottom?.cutout;

  // Generate cutout mask if either divider is in cutout mode
  const cutoutMask = generateCutoutMask(shapeDividerTop, shapeDividerBottom, height);
  
  // Apply mask to cover styles if cutout mode is enabled
  if (cutoutMask) {
    coverStyles.maskImage = cutoutMask;
    coverStyles.WebkitMaskImage = cutoutMask;
    coverStyles.maskSize = 'cover';
    coverStyles.WebkitMaskSize = 'cover';
  }

  return (
    <div className={`${wrapperAnimationClass} ${className}`} style={wrapperStyles}>
      <div className={coverAnimationClass} style={coverStyles} />
      
      {/* Children (logo, profile, etc.) */}
      {children}
      
      {/* Top Shape Divider */}
      {showTopDivider && (
        <div
          style={{
            position: "absolute",
            top: borderWidth > 0 ? `-${borderWidth}px` : 0, // Overlap border
            left: "50%",
            transform: "translateX(-50%)",
            width: `${shapeDividerTop.width || 100}%`,
            height: `${shapeDividerTop.height || 60}px`,
            zIndex: shapeDividerTop.bringToFront ? 20 : 1,
            pointerEvents: "none",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{
              display: "block",
              transform: shapeDividerTop.invert ? "scaleY(-1)" : undefined,
              transformOrigin: "center",
            }}
          >
            <path
              d={SHAPE_PRESETS[shapeDividerTop.preset]}
              fill={shapeDividerTop.color || brandColor}
            />
          </svg>
        </div>
      )}
      
      {/* Bottom Shape Divider */}
      {showBottomDivider && (
        <div
          style={{
            position: "absolute",
            bottom: borderWidth > 0 ? `-${borderWidth}px` : 0, // Overlap border
            left: "50%",
            transform: "translateX(-50%)",
            width: `${shapeDividerBottom.width || 100}%`,
            height: `${shapeDividerBottom.height || 60}px`,
            zIndex: shapeDividerBottom.bringToFront ? 20 : 1,
            pointerEvents: "none",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 1440 320"
            preserveAspectRatio="none"
            style={{
              display: "block",
              transform: shapeDividerBottom.invert ? "scaleY(-1)" : undefined,
              transformOrigin: "center",
            }}
          >
            <path
              d={SHAPE_PRESETS[shapeDividerBottom.preset]}
              fill={shapeDividerBottom.color || brandColor}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
