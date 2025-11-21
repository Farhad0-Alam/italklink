import { useMemo, useState, useEffect } from "react";
import { PageElement } from "@shared/schema";
import { getSkinStyles } from "@/lib/skin-presets";

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

interface CustomIcon {
  [key: string]: string; // key: icon name, value: SVG
}

export function ContactLinksRenderer({ data }: ContactLinksRendererProps) {
  const {
    contacts = [],
    iconPackId,
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
    gap,
    outerContainer,
    iconContainer,
    enableLabelSkin = false,
  } = data;

  // State for custom icons from selected icon pack
  const [customIcons, setCustomIcons] = useState<CustomIcon>({});

  // Fetch custom icons if iconPackId is provided
  useEffect(() => {
    if (iconPackId) {
      fetch(`/api/admin/icon-packs/${iconPackId}/icons`)
        .then(res => res.json())
        .then(response => {
          if (response.success && response.data) {
            const iconMap: CustomIcon = {};
            response.data.forEach((icon: any) => {
              iconMap[icon.name] = icon.svg;
            });
            setCustomIcons(iconMap);
          }
        })
        .catch(() => setCustomIcons({}));
    }
  }, [iconPackId]);

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

    // Get skin preset styles - skins always define both icon and label styling
    const skinStyles = getSkinStyles(skin, iconColor);

    const iconContainerStyle: React.CSSProperties = {
      width: `${iconWidth}px`,
      height: `${iconHeight}px`,
      background: skinStyles.icon.background || iconBgColor,
      borderColor: iconBorderColor,
      borderWidth: `${iconBorderSize}px`,
      borderStyle: iconBorderSize > 0 ? "solid" : "none",
      boxShadow: `${shadowOffsetX}px ${shadowOffsetY}px ${shadowBlur}px ${hexToRgba(
        shadowColor,
        shadowOpacity / 100
      )}`,
      ...skinStyles.icon.border && { border: skinStyles.icon.border },
      ...skinStyles.icon.borderRight && { borderRight: skinStyles.icon.borderRight },
    };

    const iconStyle: React.CSSProperties = {
      fontSize: `${iconSize}px`,
      color: skinStyles.icon.color || iconColor,
    };

    // Label style - always apply skin styling, use enableLabelSkin to optionally fall back to plain text
    const labelStyle: React.CSSProperties = enableLabelSkin ? {
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      fontStyle,
      color: skinStyles.label.color || textColor,
      background: skinStyles.label.background,
      padding: "4px 12px",
      display: "inline-block",
      ...skinStyles.label.border && { border: skinStyles.label.border },
      ...skinStyles.label.borderBottom && { borderBottom: skinStyles.label.borderBottom },
    } : {
      fontFamily,
      fontSize: `${fontSize}px`,
      fontWeight,
      fontStyle,
      color: textColor,
    };

    // Outer Container Style (wraps all icons)
    const outerContainerStyle: React.CSSProperties = outerContainer?.enabled
      ? {
          backgroundColor: outerContainer.background ?? "#ffffff",
          borderColor: outerContainer.borderColor ?? "#e5e7eb",
          borderWidth: `${outerContainer.borderWidth ?? 1}px`,
          borderStyle: (outerContainer.borderWidth ?? 1) > 0 ? "solid" : "none",
          borderRadius: `${outerContainer.borderRadius ?? 8}px`,
          padding: `${outerContainer.padding ?? 16}px`,
          width: outerContainer.width ?? "100%",
          height: outerContainer.height ?? "auto",
          boxShadow: outerContainer.shadowEnabled
            ? `${outerContainer.shadowOffsetX ?? 0}px ${outerContainer.shadowOffsetY ?? 4}px ${outerContainer.shadowBlur ?? 10}px ${hexToRgba(
                outerContainer.shadowColor ?? "#000000",
                (outerContainer.shadowOpacity ?? 10) / 100
              )}`
            : "none",
        }
      : {};

    // Icon Container Style (each individual icon)
    const itemContainerStyle: React.CSSProperties = iconContainer?.enabled
      ? {
          backgroundColor: iconContainer.background ?? "#ffffff",
          borderColor: iconContainer.borderColor ?? "#e5e7eb",
          borderWidth: `${iconContainer.borderWidth ?? 1}px`,
          borderStyle: (iconContainer.borderWidth ?? 1) > 0 ? "solid" : "none",
          borderRadius: `${iconContainer.borderRadius ?? 8}px`,
          padding: `${iconContainer.padding ?? 16}px`,
          boxShadow: iconContainer.shadowEnabled
            ? `${iconContainer.shadowOffsetX ?? 0}px ${iconContainer.shadowOffsetY ?? 4}px ${iconContainer.shadowBlur ?? 10}px ${hexToRgba(
                iconContainer.shadowColor ?? "#000000",
                (iconContainer.shadowOpacity ?? 10) / 100
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
      outerContainerStyle,
      itemContainerStyle,
    };
  }, [
    skin,
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
    outerContainer,
    iconContainer,
    enableLabelSkin,
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
    <div className="mb-6" style={styles.outerContainerStyle}>
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
              ...styles.itemContainerStyle,
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
                {customIcons[contact.type] ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: customIcons[contact.type] }}
                    className="transition-colors duration-200 flex items-center justify-center"
                    style={{
                      width: `${iconSize}px`,
                      height: `${iconSize}px`,
                      color: styles.iconStyle.color,
                      ...(enableHoverColor && { 
                        "--icon-hover-color": iconHoverColor 
                      } as React.CSSProperties)
                    }}
                  />
                ) : (
                  <i
                    className={`${contact.icon} transition-colors duration-200 ${
                      enableHoverColor ? "group-hover:text-[var(--icon-hover-color)]" : ""
                    }`}
                    style={styles.iconStyle}
                  ></i>
                )}
              </div>
            )}

            {/* Label */}
            {view !== "icon-only" && showLabel && (
              <span 
                className={`${textPosition === "left" || textPosition === "right" ? "ml-2" : "mt-1"} text-center ${enableLabelSkin ? styles.shapeClass : ""}`}
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
