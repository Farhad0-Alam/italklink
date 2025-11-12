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
    overflow: "hidden",
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
  };

  // Add border if specified
  if (borderWidth > 0 && animation === "none") {
    coverStyles.border = `${borderWidth}px solid ${color1}`;
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
        coverStyles.border = `${borderWidth}px solid ${color1}`;
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

  // Shape divider props
  const shapeDivider = coverImageStyles?.shapeDivider;
  const showShapeDivider = shapeDivider?.enabled && shapeDivider?.preset && SHAPE_PRESETS[shapeDivider.preset];

  return (
    <div className={`${wrapperAnimationClass} ${className}`} style={wrapperStyles}>
      <div className={coverAnimationClass} style={coverStyles} />
      
      {/* Children (logo, profile, etc.) */}
      {children}
      
      {/* Shape Divider */}
      {showShapeDivider && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: `${shapeDivider.width || 100}%`,
            height: `${shapeDivider.height || 60}px`,
            zIndex: shapeDivider.bringToFront ? 20 : 1,
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
              transform: shapeDivider.invert ? "scaleY(-1)" : undefined,
              transformOrigin: "center",
            }}
          >
            <path
              d={SHAPE_PRESETS[shapeDivider.preset]}
              fill={shapeDivider.color || brandColor}
            />
          </svg>
        </div>
      )}
    </div>
  );
}
