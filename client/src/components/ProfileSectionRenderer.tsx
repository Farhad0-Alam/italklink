import { useMemo } from "react";

interface ProfileSectionRendererProps {
  data: any;
  cardData?: any;
}

export function ProfileSectionRenderer({ data, cardData }: ProfileSectionRendererProps) {
  const profileImageStyles = data.profileImageStyles || {};
  const coverImageStyles = data.coverImageStyles || {};
  const sectionStyles = data.sectionStyles || { basicInfo: {} };
  
  const brandColor = cardData?.brandColor || data.brandColor || "#22c55e";
  const accentColor = cardData?.accentColor || data.accentColor || "#f093fb";

  const profileImageSize = profileImageStyles.size || 120;
  const profileShape = profileImageStyles.shape || "circle";
  const profileBorderWidth = profileImageStyles.borderWidth ?? 3;
  const profileBorderColor = profileImageStyles.borderColor || brandColor;
  const profileAnimation = profileImageStyles.animation || "none";
  const profileShadow = profileImageStyles.shadow || 0;
  const profileOpacity = profileImageStyles.opacity || 100;
  const profileVisible = profileImageStyles.visible !== false;

  const coverHeight = coverImageStyles.height || 200;
  const profilePositionX = coverImageStyles.profilePositionX ?? 50;
  const profilePositionY = coverImageStyles.profilePositionY ?? 100;

  const nameStyles = sectionStyles.basicInfo || {};

  const getShapeStyles = () => {
    switch (profileShape) {
      case "square": return "0";
      case "rounded": return "12px";
      case "circle":
      default: return "50%";
    }
  };

  const getAnimationCSS = () => {
    if (profileAnimation === "none") return {};
    
    const gradientStops = profileImageStyles.animationGradient?.stops || [
      { color: brandColor, stop: 0 },
      { color: accentColor, stop: 100 }
    ];
    const gradientColors = gradientStops.map((s: any) => s.color).join(', ');

    switch (profileAnimation) {
      case "instagram":
        return {
          background: `linear-gradient(45deg, ${gradientColors})`,
          backgroundSize: "400% 400%",
          animation: "gradient-spin 3s ease infinite"
        };
      case "neon":
        const glowColor = profileImageStyles.useBrandColor !== false 
          ? brandColor 
          : profileImageStyles.animationColors?.primary || brandColor;
        return {
          boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}, 0 0 30px ${glowColor}`,
          animation: "neon-pulse 2s ease-in-out infinite"
        };
      case "wave":
        return {
          background: `linear-gradient(90deg, ${gradientColors}, ${gradientColors})`,
          backgroundSize: "200% 100%",
          animation: "wave-slide 2s linear infinite"
        };
      case "shimmer":
        return {
          background: `linear-gradient(90deg, ${gradientColors}, ${gradientColors})`,
          backgroundSize: "300% 100%",
          animation: "shimmer 2s ease-in-out infinite"
        };
      case "gradient-slide":
        return {
          background: `linear-gradient(90deg, ${gradientColors})`,
          backgroundSize: "200% 100%",
          animation: "gradient-slide 3s linear infinite"
        };
      default:
        return {};
    }
  };

  const renderShapeDivider = (position: "top" | "bottom") => {
    const dividerConfig = position === "top" 
      ? coverImageStyles.shapeDividerTop 
      : coverImageStyles.shapeDividerBottom;

    if (!dividerConfig?.enabled) return null;

    const shape = dividerConfig.preset || "wave";
    const color = dividerConfig.color || "#ffffff";
    const width = dividerConfig.width || 100;
    const height = dividerConfig.height || 60;
    const invert = dividerConfig.invert || false;

    const getShapePath = () => {
      switch (shape) {
        case "wave": return "M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z";
        case "waves-brush": return "M0,8 Q15,2 30,8 T60,8 Q75,2 90,8 L100,8 L100,20 L0,20 Z";
        case "clouds": return "M0,12 Q10,8 20,12 Q30,8 40,12 Q50,8 60,12 Q70,8 80,12 Q90,8 100,12 L100,20 L0,20 Z";
        case "zigzag": return "M0,15 L10,5 L20,15 L30,5 L40,15 L50,5 L60,15 L70,5 L80,15 L90,5 L100,15 L100,20 L0,20 Z";
        case "triangle": return "M0,20 L50,0 L100,20 Z";
        case "triangle-asymmetrical": return "M0,20 L70,0 L100,20 Z";
        case "tilt": return "M0,5 L100,15 L100,20 L0,20 Z";
        case "curve": return "M0,20 Q50,0 100,20 Z";
        case "curve-asymmetrical": return "M0,20 Q30,0 100,20 Z";
        case "drop": return "M0,10 C20,10 30,0 50,0 C70,0 80,10 100,10 L100,20 L0,20 Z";
        case "mountain": return "M0,20 L25,5 L50,12 L75,3 L100,20 Z";
        case "book": return "M0,10 Q25,15 50,10 Q75,5 100,10 L100,20 L0,20 Z";
        default: return "M0,10 Q25,0 50,10 T100,10 L100,20 L0,20 Z";
      }
    };

    return (
      <div 
        className={`absolute ${position === "top" ? "top-0" : "bottom-0"} left-0 right-0 overflow-hidden pointer-events-none`}
        style={{ 
          height: `${height}px`,
          width: `${width}%`,
          margin: "0 auto",
          transform: invert ? "scaleY(-1)" : undefined
        }}
      >
        <svg
          viewBox="0 0 100 20"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          <path d={getShapePath()} fill={color} />
        </svg>
      </div>
    );
  };

  if (data.enabled === false) {
    return null;
  }

  return (
    <div className="profile-section-element w-full" data-testid="profile-section-element">
      <style>{`
        @keyframes gradient-spin {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes neon-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes wave-slide {
          0% { background-position: 0% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes shimmer {
          0% { background-position: -100% 0%; }
          100% { background-position: 200% 0%; }
        }
        @keyframes gradient-slide {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>

      {/* Cover Image */}
      {data.coverImage && (
        <div 
          className="relative w-full overflow-hidden"
          style={{ 
            height: `${coverHeight}px`,
            borderWidth: coverImageStyles.borderWidth || 0,
            borderColor: coverImageStyles.borderColor || brandColor,
            borderStyle: "solid"
          }}
        >
          <img
            src={data.coverImage}
            alt="Cover"
            className="w-full h-full object-cover"
          />
          {renderShapeDivider("top")}
          {renderShapeDivider("bottom")}
        </div>
      )}

      {/* Profile Image Container */}
      <div 
        className="relative"
        style={{
          marginTop: data.coverImage ? `-${profileImageSize / 2}px` : "0",
          display: "flex",
          justifyContent: profilePositionX <= 33 ? "flex-start" : profilePositionX >= 67 ? "flex-end" : "center",
          paddingLeft: profilePositionX < 50 ? `${profilePositionX}%` : undefined,
          paddingRight: profilePositionX > 50 ? `${100 - profilePositionX}%` : undefined
        }}
      >
        {profileVisible && data.profilePhoto && (
          <div
            className="relative"
            style={{
              width: `${profileImageSize}px`,
              height: `${profileImageSize}px`,
              padding: profileBorderWidth > 0 ? `${profileBorderWidth}px` : 0,
              borderRadius: getShapeStyles(),
              opacity: profileOpacity / 100,
              boxShadow: profileShadow > 0 ? `0 ${profileShadow / 2}px ${profileShadow}px rgba(0,0,0,0.3)` : undefined,
              ...(profileAnimation !== "none" ? getAnimationCSS() : {
                background: profileBorderWidth > 0 ? profileBorderColor : "transparent"
              })
            }}
          >
            <img
              src={data.profilePhoto}
              alt="Profile"
              className="w-full h-full object-cover"
              style={{
                borderRadius: getShapeStyles(),
                display: "block"
              }}
            />
          </div>
        )}
      </div>

      {/* Text Content */}
      <div 
        className="text-center mt-4"
        style={{
          transform: `translate(${nameStyles.textGroupHorizontal ?? 0}px, ${nameStyles.textGroupVertical ?? 0}px)`
        }}
      >
        {/* Name */}
        {data.fullName && (
          <div
            style={{
              color: nameStyles.nameColor || "#ffffff",
              fontFamily: nameStyles.nameFont || "inherit",
              fontSize: `${nameStyles.nameFontSize || 24}px`,
              fontWeight: nameStyles.nameFontWeight || "bold",
              fontStyle: nameStyles.nameTextStyle === "italic" ? "italic" : "normal",
              marginBottom: `${nameStyles.nameSpacing ?? 8}px`,
              transform: `translate(${nameStyles.namePositionX ?? 0}px, ${nameStyles.namePositionY ?? 0}px)`
            }}
          >
            {data.fullName}
          </div>
        )}

        {/* Title */}
        {data.title && (
          <div
            style={{
              color: nameStyles.titleColor || "#4b5563",
              fontFamily: nameStyles.titleFont || "inherit",
              fontSize: `${nameStyles.titleFontSize || 14}px`,
              fontWeight: nameStyles.titleFontWeight || "normal",
              fontStyle: nameStyles.titleTextStyle === "italic" ? "italic" : "normal",
              marginBottom: `${nameStyles.titleSpacing ?? 8}px`,
              transform: `translate(${nameStyles.titlePositionX ?? 0}px, ${nameStyles.titlePositionY ?? 0}px)`
            }}
          >
            {data.title}
          </div>
        )}

        {/* Company */}
        {data.company && (
          <div
            style={{
              color: nameStyles.companyColor || "#6b7280",
              fontFamily: nameStyles.companyFont || "inherit",
              fontSize: `${nameStyles.companyFontSize || 14}px`,
              fontWeight: nameStyles.companyFontWeight || "normal",
              fontStyle: nameStyles.companyTextStyle === "italic" ? "italic" : "normal",
              marginBottom: `${nameStyles.companySpacing ?? 8}px`,
              transform: `translate(${nameStyles.companyPositionX ?? 0}px, ${nameStyles.companyPositionY ?? 0}px)`
            }}
          >
            {data.company}
          </div>
        )}
      </div>
    </div>
  );
}
