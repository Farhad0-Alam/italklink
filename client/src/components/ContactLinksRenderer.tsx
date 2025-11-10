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

type ContactData = (PageElement & { type: "contactSection" })["data"];

interface ContactLinksRendererProps {
  data: ContactData;
}

export function ContactLinksRenderer({ data }: ContactLinksRendererProps) {
  const {
    contacts = [],
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

  // Filter contacts with values
  const validContacts = contacts.filter((c) => c.value);

  if (validContacts.length === 0) {
    return null;
  }

  const handleContactClick = (contact: typeof contacts[0]) => {
    if (contact.type === "phone") {
      window.open(`tel:${contact.value}`, "_self");
    } else if (contact.type === "email") {
      window.open(`mailto:${contact.value}`, "_self");
    } else if (contact.type === "website") {
      const url = contact.value.startsWith("http")
        ? contact.value
        : `https://${contact.value}`;
      window.open(url, "_blank");
    }
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

  return (
    <div className="mb-6" style={styles.containerStyle}>
      <div
        className={useGrid ? "" : styles.alignmentClass}
        style={containerLayoutStyle}
      >
        {validContacts.map((contact) => (
          <div
            key={contact.id}
            className={`group flex ${itemFlexClass} ${itemAlignClass} cursor-pointer`}
            onClick={() => handleContactClick(contact)}
            style={{
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
                  className={`${contact.icon} transition-colors duration-200 ${
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
                {contact.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
