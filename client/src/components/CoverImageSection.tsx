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
  
  // Auto-swap triangle/triangle-negative based on invert toggle
  const getActualPreset = (preset: string, invert: boolean) => {
    if (preset === "triangle" && invert) return "triangle-negative";
    if (preset === "triangle-negative" && invert) return "triangle";
    return preset;
  };
  
  const topPreset = shapeDividerTop?.preset ? getActualPreset(shapeDividerTop.preset, shapeDividerTop.invert || false) : null;
  const bottomPreset = shapeDividerBottom?.preset ? getActualPreset(shapeDividerBottom.preset, shapeDividerBottom.invert || false) : null;
  
  const showTopDivider = shapeDividerTop?.enabled && topPreset && SHAPE_PRESETS[topPreset];
  const showBottomDivider = shapeDividerBottom?.enabled && bottomPreset && SHAPE_PRESETS[bottomPreset];
  
  // Only apply scaleY transform for non-triangle shapes
  const shouldInvertTop = shapeDividerTop?.invert && shapeDividerTop.preset !== "triangle" && shapeDividerTop.preset !== "triangle-negative";
  const shouldInvertBottom = shapeDividerBottom?.invert && shapeDividerBottom.preset !== "triangle" && shapeDividerBottom.preset !== "triangle-negative";

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
            viewBox={topPreset === "triangle-negative" ? "0 0 1000 100" : "0 0 1440 320"}
            preserveAspectRatio="none"
            style={{
              display: "block",
              transform: shouldInvertTop ? "rotate(180deg) scaleY(-1)" : "rotate(180deg)",
              transformOrigin: "center",
            }}
          >
            <path
              d={SHAPE_PRESETS[topPreset]}
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
            viewBox={bottomPreset === "triangle-negative" ? "0 0 1000 100" : "0 0 1440 320"}
            preserveAspectRatio="none"
            style={{
              display: "block",
              transform: shouldInvertBottom ? "scaleY(-1)" : undefined,
              transformOrigin: "center",
            }}
          >
            <path
              d={SHAPE_PRESETS[bottomPreset]}
              fill={shapeDividerBottom.color || brandColor}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
