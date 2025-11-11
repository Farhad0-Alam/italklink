import { useMemo } from "react";
import { PageElement } from "@shared/schema";

// Helper function to convert hex color to rgba
function hexToRgba(hex: string, alpha: number = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return `rgba(0, 0, 0, ${alpha})`;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

type SocialData = (PageElement & { type: "socialSection" })["data"];

interface SocialLinksRendererProps {
  data: SocialData;
}

export function SocialLinksRenderer({ data }: SocialLinksRendererProps) {
  const {
    socials = [],
    iconColor = "#9333ea",
    iconSize = 20,
    iconBgColor = "transparent",
    iconBorderColor = "transparent",
    iconBorderSize = 0,
    iconBgSize = 40,
    view = "icon-text",
    shape = "circle",
    alignment = "center",
    showLabel = true,
    iconWidth = 40,
    iconHeight = 40,
    // Advanced Layout Options
    skin = "minimal",
    columns = "auto",
    textPosition = "right",
    enableHoverColor = false,
    iconHoverColor = "#a855f7",
    bgHoverColor = "#4c1d95",
    fontFamily = "inherit",
    fontSize = 16,
    fontWeight = 400,
    fontStyle = "normal",
    textColor = "#000000",
    shadowColor = "#000000",
    shadowBlur = 10,
    shadowOffsetX = 0,
    shadowOffsetY = 2,
    shadowOpacity = 25,
    containerBackground = "#ffffff",
    containerBorderColor = "#e5e7eb",
    containerBorderWidth = 1,
    containerBorderRadius = 8,
    containerPadding = 16,
    gap,
    enableContainerStyling = false,
    applyContainerToEachIcon = false,
    containerWidth = "100%",
    containerHeight = "auto",
    enableContainerShadow = false,
    containerShadowColor = "#000000",
    containerShadowOpacity = 10,
    containerShadowBlur = 10,
    containerShadowOffsetX = 0,
    containerShadowOffsetY = 4,
  } = data;

  // Build styles with useMemo for performance
  const styles = useMemo(() => {
    const shapeClasses = {
      circle: "rounded-full",
      square: "rounded-none",
      rounded: "rounded-lg",
      auto: "rounded-md",
    };

    const alignmentClasses = {
      left: "justify-start",
      center: "justify-center",
      right: "justify-end",
      justified: "justify-between",
    };

    const iconContainerStyle: React.CSSProperties = {
      width: `${iconWidth}px`,
      height: `${iconHeight}px`,
      backgroundColor: iconBgColor,
      borderColor: iconBorderColor,
      borderWidth: `${iconBorderSize}px`,
      borderStyle: iconBorderSize > 0 ? "solid" : "none",
      boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${hexToRgba(
        shadowColor,
        shadowOpacity / 100
      )}`,
    };

    const iconStyle: React.CSSProperties = {
      fontSize: `${iconSize}px`,
      color: iconColor,
    };

    const labelStyle: React.CSSProperties = {
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      fontStyle,
      color: textColor,
    };

    const containerStyle: React.CSSProperties = enableContainerStyling
      ? {
          backgroundColor: containerBackground,
          borderColor: containerBorderColor,
          borderWidth: `${containerBorderWidth}px`,
          borderStyle: containerBorderWidth > 0 ? "solid" : "none",
          borderRadius: `${containerBorderRadius}px`,
          padding: `${containerPadding}px`,
          width: containerWidth,
          height: containerHeight,
          boxShadow: enableContainerShadow
            ? `${containerShadowOffsetX}px ${containerShadowOffsetY}px ${containerShadowBlur}px ${hexToRgba(
                containerShadowColor,
                containerShadowOpacity / 100
              )}`
            : "none",
        }
      : {};

    return {
      shapeClass: shapeClasses[shape],
      alignmentClass: alignmentClasses[alignment],
      iconContainerStyle,
      iconStyle,
      labelStyle,
      containerStyle,
    };
  }, [
    iconWidth,
    iconHeight,
    iconBgColor,
    iconBorderColor,
    iconBorderSize,
    shadowOffsetX,
    shadowOffsetY,
    shadowBlur,
    shadowColor,
    shadowOpacity,
    iconSize,
    iconColor,
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    textColor,
    shape,
    alignment,
    enableContainerStyling,
    containerBackground,
    containerBorderColor,
    containerBorderWidth,
    containerBorderRadius,
    containerPadding,
    containerWidth,
    containerHeight,
    enableContainerShadow,
    containerShadowColor,
    containerShadowOpacity,
    containerShadowBlur,
    containerShadowOffsetX,
    containerShadowOffsetY,
  ]);

  // Filter socials with URLs
  const validSocials = socials.filter((s) => s.url);

  if (validSocials.length === 0) {
    return null;
  }

  const handleSocialClick = (social: typeof socials[0]) => {
    let url = social.url;
    
    // If URL doesn't start with http, construct platform URL
    if (!url.startsWith("http")) {
      const username = url.replace("@", "");
      const platform = social.platform.toLowerCase();
      url = `https://${platform}.com/${username}`;
    }
    
    window.open(url, "_blank");
  };

  const gapValue = gap !== undefined ? `${gap}px` : "12px";

  // Determine grid/flex layout
  const useGrid = columns !== "auto";
  const gridCols = typeof columns === "number" ? columns : parseInt(columns || "auto");
  
  // Build container style
  const containerLayoutStyle: React.CSSProperties = useGrid && !isNaN(gridCols)
    ? {
        display: "grid",
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        gap: gapValue,
      }
    : {
        display: "flex",
        flexWrap: "wrap",
        gap: gapValue,
      };

  // Determine item flex direction based on textPosition
  const itemFlexClass = textPosition === "top" || textPosition === "bottom"
    ? "flex-col"
    : "flex-row";
  const itemAlignClass = textPosition === "top" || textPosition === "bottom"
    ? "items-center"
    : "items-center";

  // Determine where to apply container styling
  // When applyContainerToEachIcon is false (default): apply to outer wrapper, give items basic padding for clickability
  // When applyContainerToEachIcon is true: apply to each icon individually, no outer wrapper styling
  const outerContainerStyle = enableContainerStyling && !applyContainerToEachIcon ? styles.containerStyle : {};
  const itemContainerStyle = enableContainerStyling && applyContainerToEachIcon 
    ? styles.containerStyle 
    : {}; 
  
  // Add minimal padding to items when outer wrapper has container (for clickability)
  const itemBasePadding = enableContainerStyling && !applyContainerToEachIcon ? { padding: '8px' } : {};

  return (
    <div className="mb-6" style={outerContainerStyle}>
      <div
        className={useGrid ? "" : styles.alignmentClass}
        style={containerLayoutStyle}
      >
        {validSocials.map((social) => (
          <div
            key={social.id}
            className={`group flex ${itemFlexClass} ${itemAlignClass} cursor-pointer`}
            onClick={() => handleSocialClick(social)}
            style={{
              ...itemContainerStyle,
              ...itemBasePadding,
              "--icon-hover-color": enableHoverColor ? iconHoverColor : iconColor,
              "--bg-hover-color": enableHoverColor ? bgHoverColor : iconBgColor,
              flexDirection: textPosition === "left" ? "row-reverse" : 
                           textPosition === "top" ? "column-reverse" : undefined,
            } as React.CSSProperties}
          >
            {/* Icon Container */}
            {view !== "text-only" && (
              <div
                className={`flex items-center justify-center transition-all duration-200 ${styles.shapeClass} ${
                  enableHoverColor ? "group-hover:bg-[var(--bg-hover-color)]" : ""
                }`}
                style={styles.iconContainerStyle}
              >
                <i
                  className={`${social.icon} transition-colors duration-200 ${
                    enableHoverColor ? "group-hover:text-[var(--icon-hover-color)]" : ""
                  }`}
                  style={styles.iconStyle}
                ></i>
              </div>
            )}

            {/* Label */}
            {view !== "icon-only" && showLabel && (
              <span 
                className={`${textPosition === "left" || textPosition === "right" ? "ml-2" : "mt-1"} text-center`}
                style={styles.labelStyle}
              >
                {social.label || social.platform}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
