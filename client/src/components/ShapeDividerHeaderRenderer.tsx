import React from 'react';
import { BusinessCard } from '@shared/schema';
import type { ShapeDividerHeaderConfig } from './ShapeDividerBuilder';

const SHAPE_LIBRARY = {
  wave1: {
    top: '<path d="M0,32L48,37.3C96,43,192,53,288,48C384,43,480,21,576,32C672,43,768,85,864,90.7C960,96,1056,64,1152,48C1248,32,1344,32,1392,32L1440,32L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"/>',
    bottom: '<path d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,192C672,203,768,245,864,250.7C960,256,1056,224,1152,208C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"/>'
  },
  wave2: {
    top: '<path d="M0,64L60,85.3C120,107,240,149,360,144C480,139,600,85,720,90.7C840,96,960,160,1080,165.3C1200,171,1320,117,1380,90.7L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"/>',
    bottom: '<path d="M0,256L60,277.3C120,299,240,341,360,336C480,331,600,277,720,282.7C840,288,960,352,1080,357.3C1200,363,1320,309,1380,282.7L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"/>'
  },
  drip1: {
    top: '<path d="M0,0L120,21.3C240,43,480,85,720,90.7C960,96,1200,64,1320,48L1440,32L1440,0Z M240,64C240,78.9,251.1,90,266,90C280.9,90,292,78.9,292,64C292,49.1,280.9,38,266,38C251.1,38,240,49.1,240,64Z M720,96C720,110.9,731.1,122,746,122C760.9,122,772,110.9,772,96C772,81.1,760.9,70,746,70C731.1,70,720,81.1,720,96Z"/>',
    bottom: '<path d="M1440,320L1320,298.7C1200,277,960,235,720,229.3C480,224,240,256,120,272L0,288L0,320Z M1200,256C1200,270.9,1211.1,282,1226,282C1240.9,282,1252,270.9,1252,256C1252,241.1,1240.9,230,1226,230C1211.1,230,1200,241.1,1200,256Z M720,224C720,238.9,731.1,250,746,250C760.9,250,772,238.9,772,224C772,209.1,760.9,198,746,198C731.1,198,720,209.1,720,224Z"/>'
  },
  mountain1: {
    top: '<path d="M0,0L240,64L480,32L720,96L960,48L1200,80L1440,32L1440,0Z"/>',
    bottom: '<path d="M0,320L240,256L480,288L720,224L960,272L1200,240L1440,288L1440,320Z"/>'
  },
  mountain2: {
    top: '<path d="M0,0L144,32L288,64L432,32L576,96L720,48L864,80L1008,32L1152,64L1296,32L1440,48L1440,0Z"/>',
    bottom: '<path d="M0,320L144,288L288,256L432,288L576,224L720,272L864,240L1008,288L1152,256L1296,288L1440,272L1440,320Z"/>'
  },
  curve1: {
    top: '<path d="M0,0C480,64,960,64,1440,0L1440,0L0,0Z"/>',
    bottom: '<path d="M0,320C480,256,960,256,1440,320L1440,320L0,320Z"/>'
  },
  curve2: {
    top: '<path d="M0,32C240,96,480,96,720,32C960,96,1200,96,1440,32L1440,0L0,0Z"/>',
    bottom: '<path d="M0,288C240,224,480,224,720,288C960,224,1200,224,1440,288L1440,320L0,320Z"/>'
  },
  triangle1: {
    top: '<path d="M0,0L720,64L1440,0L1440,0L0,0Z"/>',
    bottom: '<path d="M0,320L720,256L1440,320L1440,320L0,320Z"/>'
  },
  triangle2: {
    top: '<path d="M0,32L1440,96L1440,0L0,0Z"/>',
    bottom: '<path d="M0,288L1440,224L1440,320L0,320Z"/>'
  },
  zigzag1: {
    top: '<path d="M0,0L72,32L144,0L216,32L288,0L360,32L432,0L504,32L576,0L648,32L720,0L792,32L864,0L936,32L1008,0L1080,32L1152,0L1224,32L1296,0L1368,32L1440,0L1440,0L0,0Z"/>',
    bottom: '<path d="M0,320L72,288L144,320L216,288L288,320L360,288L432,320L504,288L576,320L648,288L720,320L792,288L864,320L936,288L1008,320L1080,288L1152,320L1224,288L1296,320L1368,288L1440,320L1440,320L0,320Z"/>'
  }
};

interface ShapeDividerHeaderRendererProps {
  data: BusinessCard;
  profileImageSrc: string;
  headerConfig: ShapeDividerHeaderConfig;
}

export function ShapeDividerHeaderRenderer({ data, profileImageSrc, headerConfig }: ShapeDividerHeaderRendererProps) {
  const renderShape = (shapeConfig: any, position: 'top' | 'bottom') => {
    if (!shapeConfig?.enabled || !shapeConfig.shape) return null;

    const shape = SHAPE_LIBRARY[shapeConfig.shape as keyof typeof SHAPE_LIBRARY];
    if (!shape) return null;

    const shapeContent = position === 'top' ? shape.top : shape.bottom;
    
    const svgStyle: React.CSSProperties = {
      position: 'absolute',
      [position]: 0,
      left: '50%',
      transform: `translateX(-50%) ${shapeConfig.flip ? 'scaleX(-1)' : ''}`,
      width: `${shapeConfig.width}%`,
      height: `${shapeConfig.height}px`,
      zIndex: shapeConfig.bringToFront ? 10 : 1,
      pointerEvents: 'none'
    };

    return (
      <svg
        style={svgStyle}
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        className="fill-current"
        color={shapeConfig.color}
      >
        <g dangerouslySetInnerHTML={{ __html: shapeContent }} />
      </svg>
    );
  };

  const renderElement = (elementKey: string, content: string) => {
    const elementStyle = headerConfig.elements[elementKey as keyof typeof headerConfig.elements];
    if (!elementStyle?.visible) return null;

    const commonStyle: React.CSSProperties = {
      fontSize: `${elementStyle.fontSize}px`,
      color: elementStyle.color,
      textAlign: elementStyle.textAlign || 'center',
      marginTop: `${elementStyle.marginTop || 0}px`,
      marginBottom: `${elementStyle.marginBottom || 0}px`,
      fontWeight: elementStyle.fontWeight || 400
    };

    if (elementKey === 'profilePic') {
      const picStyle = elementStyle as any;
      return (
        <div 
          key={elementKey}
          className="flex justify-center"
          style={{ marginTop: commonStyle.marginTop, marginBottom: commonStyle.marginBottom }}
        >
          <img
            src={profileImageSrc}
            alt={data.fullName || "Profile"}
            style={{
              width: `${picStyle.size}px`,
              height: `${picStyle.size}px`,
              borderRadius: `${picStyle.borderRadius || 50}%`,
              border: `${picStyle.borderWidth || 0}px solid ${picStyle.borderColor || '#ffffff'}`,
              objectFit: 'cover'
            }}
            data-testid="img-profile-photo"
          />
        </div>
      );
    }

    if (elementKey === 'logo' && data.logo) {
      const logoStyle = elementStyle as any;
      const positionClasses = {
        'top-left': 'absolute top-4 left-4',
        'top-right': 'absolute top-4 right-4',
        'center': 'flex justify-center'
      };

      return (
        <div 
          key={elementKey}
          className={positionClasses[logoStyle.position as keyof typeof positionClasses] || positionClasses.center}
          style={{ marginTop: commonStyle.marginTop, marginBottom: commonStyle.marginBottom }}
        >
          <img
            src={data.logo}
            alt="Logo"
            style={{
              height: `${logoStyle.size}px`,
              width: 'auto',
              maxWidth: '120px',
              objectFit: 'contain'
            }}
            data-testid="img-logo"
          />
        </div>
      );
    }

    return (
      <div key={elementKey} style={commonStyle}>
        {content}
      </div>
    );
  };

  return (
    <div 
      className="relative overflow-hidden"
      style={{
        backgroundColor: headerConfig.backgroundColor,
        backgroundImage: headerConfig.backgroundImage ? `url(${headerConfig.backgroundImage})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: `${headerConfig.height}px`
      }}
    >
      {/* Top Shape */}
      {headerConfig.topShape && renderShape(headerConfig.topShape, 'top')}
      
      {/* Content */}
      <div className="relative z-5 h-full flex flex-col justify-center items-center px-6 py-4 space-y-2">
        {/* Logo (positioned absolutely if not center) */}
        {renderElement('logo', '')}
        
        {/* Profile Picture */}
        {renderElement('profilePic', '')}
        
        {/* Name */}
        {renderElement('name', data.fullName || '')}
        
        {/* Title */}
        {renderElement('title', data.title || '')}
        
        {/* Company */}
        {renderElement('company', data.company || '')}
      </div>
      
      {/* Bottom Shape */}
      {headerConfig.bottomShape && renderShape(headerConfig.bottomShape, 'bottom')}
    </div>
  );
}