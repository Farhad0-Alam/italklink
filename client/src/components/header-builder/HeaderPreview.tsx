import { forwardRef, memo } from "react";
import { BusinessCard } from "@shared/schema";
import type { HeaderPreset } from "@/lib/header-schema";
import { ShapeDivider } from "./ShapeDivider";

interface HeaderPreviewProps {
  headerPreset: HeaderPreset;
  cardData: BusinessCard;
  profileImageSrc?: string;
  className?: string;
}

export const HeaderPreview = memo(forwardRef<HTMLDivElement, HeaderPreviewProps>(
  ({ headerPreset, cardData, profileImageSrc, className = "" }, ref) => {
    
    const getBackgroundStyle = (): React.CSSProperties => {
      const { background } = headerPreset;
      
      switch (background.type) {
        case "solid":
          return { backgroundColor: background.solid?.color || "#22c55e" };
          
        case "gradient":
          if (background.gradient) {
            const { type, angle, stops } = background.gradient;
            const stopsList = stops.map(stop => 
              `${stop.color} ${stop.position}%`
            ).join(", ");
            
            const gradientValue = type === "linear" 
              ? `linear-gradient(${angle}deg, ${stopsList})`
              : `radial-gradient(circle, ${stopsList})`;
              
            return { background: gradientValue };
          }
          return { backgroundColor: "#22c55e" };
          
        case "image":
          if (background.image) {
            const style: React.CSSProperties = {
              backgroundImage: `url(${background.image.url})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            };
            
            if (background.image.overlay) {
              style.position = "relative";
            }
            
            return style;
          }
          return { backgroundColor: "#22c55e" };
          
        default:
          return { backgroundColor: "#22c55e" };
      }
    };

    const renderElement = (element: HeaderPreset["elements"][0]) => {
      if (!element.visible) return null;

      const elementStyle: React.CSSProperties = {
        position: "absolute",
        left: `${element.position.x}%`,
        top: `${element.position.y}px`,
        width: element.type === "profile" || element.type === "logo" 
          ? `${element.content.size || 80}px` 
          : `${element.position.width}px`,
        height: element.type === "profile" || element.type === "logo" 
          ? `${element.content.size || 80}px` 
          : `${element.position.height}px`,
        fontSize: `${element.style.fontSize}px`,
        fontWeight: element.style.fontWeight,
        color: element.style.color,
        fontFamily: element.style.fontFamily,
        textAlign: element.style.textAlign,
        opacity: element.style.opacity,
        zIndex: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: element.style.textAlign === "left" ? "flex-start" : 
                       element.style.textAlign === "right" ? "flex-end" : "center",
        transform: "translateX(-50%)" // Center horizontally based on x position
      };

      const getContent = () => {
        switch (element.type) {
          case "profile":
            if (profileImageSrc || cardData.profilePhoto) {
              return (
                <img
                  src={profileImageSrc || cardData.profilePhoto}
                  alt={cardData.fullName || "Profile"}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: `${element.content.borderRadius || 50}%`,
                    objectFit: "cover"
                  }}
                  data-testid="img-profile-photo"
                />
              );
            }
            return <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center text-xs">Photo</div>;
            
          case "logo":
            if (cardData.logo) {
              return (
                <img
                  src={cardData.logo}
                  alt="Logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain"
                  }}
                  data-testid="img-logo"
                />
              );
            }
            return <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs opacity-50">Logo</div>;
            
          case "name":
            return cardData.fullName || "Your Name";
            
          case "title":
            return cardData.title || "Your Title";
            
          case "company":
            return cardData.company || "Your Company";
            
          case "header":
            return element.content.text || "Header Text";
            
          default:
            return "";
        }
      };

      return (
        <div key={element.id} style={elementStyle}>
          {getContent()}
        </div>
      );
    };

    return (
      <div 
        ref={ref}
        className={`relative overflow-hidden ${className}`}
        style={{
          width: "430px", // Fixed canvas width
          height: `${headerPreset.canvasHeight}px`,
          ...getBackgroundStyle()
        }}
      >
        {/* Background Image Overlay */}
        {headerPreset.background.type === "image" && headerPreset.background.image?.overlay && (
          <div 
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: headerPreset.background.image.overlay.color,
              opacity: headerPreset.background.image.overlay.opacity
            }}
          />
        )}
        
        {/* Top Shape Divider */}
        {headerPreset.topDivider && (
          <ShapeDivider 
            divider={headerPreset.topDivider} 
            position="top" 
            canvasWidth={430}
          />
        )}
        
        {/* Header Elements */}
        {headerPreset.elements
          .sort((a, b) => a.order - b.order)
          .map(renderElement)}
        
        {/* Bottom Shape Divider */}
        {headerPreset.bottomDivider && (
          <ShapeDivider 
            divider={headerPreset.bottomDivider} 
            position="bottom" 
            canvasWidth={430}
          />
        )}
      </div>
    );
  }
));