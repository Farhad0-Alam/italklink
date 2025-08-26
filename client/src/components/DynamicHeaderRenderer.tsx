import React from 'react';
import { BusinessCard } from '@shared/schema';

interface HeaderElement {
  id: string;
  type: 'text' | 'image' | 'logo' | 'tagline' | 'social' | 'contact' | 'button' | 'divider' | 'svg_shape' | 'layout_container';
  content: any;
  styles: Record<string, any>;
  order: number;
  visible: boolean;
  layoutConfig?: {
    container: string;
    alignment: string;
  };
}

interface HeaderTemplate {
  elements: HeaderElement[];
  globalStyles: {
    backgroundColor: string;
    textColor: string;
    accentColor: string;
    fontFamily: string;
    containerWidth: string;
    padding: string;
    borderRadius: string;
    shadow: string;
  };
  layoutType: 'standard' | 'split' | 'overlay' | 'geometric' | 'custom';
  advancedLayout: {
    columns: number;
    rows: number;
    gridGap: string;
    flexDirection: 'row' | 'column';
    justifyContent: string;
    alignItems: string;
    backgroundEffects: {
      gradients: any[];
      svgOverlays: any[];
      patterns: any[];
    };
  };
}

interface DynamicHeaderRendererProps {
  data: BusinessCard;
  profileImageSrc: string;
}

export default function DynamicHeaderRenderer({ data, profileImageSrc }: DynamicHeaderRendererProps) {
  // Return null if advanced header is not enabled or no template
  if (!data.advancedHeaderEnabled || !data.headerTemplate) {
    return null;
  }

  const headerTemplate = data.headerTemplate as HeaderTemplate;
  
  // Get layout styles based on layout type
  const getLayoutStyles = () => {
    const { layoutType, advancedLayout } = headerTemplate;
    
    const baseStyles: React.CSSProperties = {
      backgroundColor: headerTemplate.globalStyles.backgroundColor,
      color: headerTemplate.globalStyles.textColor,
      fontFamily: headerTemplate.globalStyles.fontFamily,
      padding: headerTemplate.globalStyles.padding,
      borderRadius: headerTemplate.globalStyles.borderRadius,
      position: 'relative',
      minHeight: '200px'
    };

    switch (layoutType) {
      case 'split':
        return {
          ...baseStyles,
          display: 'grid',
          gridTemplateColumns: `repeat(${advancedLayout.columns}, 1fr)`,
          gap: advancedLayout.gridGap,
          alignItems: advancedLayout.alignItems
        };
      case 'overlay':
        return {
          ...baseStyles,
          position: 'relative',
          display: 'flex',
          flexDirection: advancedLayout.flexDirection,
          justifyContent: advancedLayout.justifyContent,
          alignItems: advancedLayout.alignItems
        };
      case 'geometric':
        return {
          ...baseStyles,
          display: 'grid',
          gridTemplateColumns: `repeat(${advancedLayout.columns}, 1fr)`,
          gridTemplateRows: `repeat(${advancedLayout.rows}, 1fr)`,
          gap: advancedLayout.gridGap
        };
      case 'custom':
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: advancedLayout.flexDirection,
          justifyContent: advancedLayout.justifyContent,
          alignItems: advancedLayout.alignItems,
          gap: advancedLayout.gridGap
        };
      default:
        return {
          ...baseStyles,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem'
        };
    }
  };

  // Render individual header elements
  const renderElement = (element: HeaderElement) => {
    if (!element.visible) return null;

    const elementStyles = {
      ...element.styles,
      order: element.order
    };

    switch (element.type) {
      case 'text':
        return (
          <div key={element.id} style={elementStyles}>
            {element.content.text}
          </div>
        );

      case 'image':
        if (element.content.src) {
          return (
            <img
              key={element.id}
              src={element.content.src}
              alt={element.content.alt}
              style={elementStyles}
            />
          );
        }
        // Default to profile image if no specific image
        return (
          <img
            key={element.id}
            src={profileImageSrc}
            alt={data.fullName || "Profile photo"}
            style={{
              ...elementStyles,
              borderRadius: elementStyles.borderRadius || '50%',
              objectFit: 'cover'
            }}
            data-testid="img-profile-photo"
          />
        );

      case 'logo':
        if (data.logo) {
          return (
            <img
              key={element.id}
              src={data.logo}
              alt="Logo"
              style={elementStyles}
              data-testid="img-logo"
            />
          );
        }
        return (
          <div key={element.id} style={elementStyles}>
            {element.content.text || 'LOGO'}
          </div>
        );

      case 'tagline':
        return (
          <div key={element.id} style={elementStyles}>
            {element.content.text || data.title || 'Your Professional Tagline'}
          </div>
        );

      case 'svg_shape':
        if (element.content.svgCode) {
          return (
            <div
              key={element.id}
              style={{
                ...elementStyles,
                display: 'inline-block'
              }}
            >
              <svg
                viewBox={element.content.viewBox || '0 0 100 100'}
                style={{
                  width: elementStyles.width || '100px',
                  height: elementStyles.height || '100px'
                }}
                dangerouslySetInnerHTML={{ __html: element.content.svgCode }}
              />
            </div>
          );
        }
        return null;

      case 'layout_container':
        return (
          <div
            key={element.id}
            style={{
              ...elementStyles,
              display: element.styles.display || 'flex',
              flexDirection: element.styles.flexDirection || 'row',
              justifyContent: element.styles.justifyContent || 'center',
              alignItems: element.styles.alignItems || 'center',
              gap: element.styles.gap || '1rem'
            }}
          >
            {/* Container for child elements - can be enhanced later */}
            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-gray-300 rounded p-2">
              <span className="text-gray-500 text-sm">Container</span>
            </div>
          </div>
        );

      case 'social':
        return (
          <div key={element.id} style={{ ...elementStyles, display: 'flex', gap: '0.75rem' }}>
            {element.content.icons?.map((icon: any, index: number) => (
              <a
                key={index}
                href={icon.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: icon.color }}
              >
                {icon.svgCode ? (
                  <div dangerouslySetInnerHTML={{ __html: icon.svgCode }} />
                ) : (
                  <span>{icon.name}</span>
                )}
              </a>
            ))}
          </div>
        );

      case 'contact':
        return (
          <div key={element.id} style={elementStyles}>
            {element.content.email && <div>Email: {element.content.email}</div>}
            {element.content.phone && <div>Phone: {element.content.phone}</div>}
            {element.content.website && <div>Web: {element.content.website}</div>}
          </div>
        );

      case 'button':
        return (
          <button
            key={element.id}
            style={{
              ...elementStyles,
              border: 'none',
              cursor: 'pointer',
              borderRadius: elementStyles.borderRadius || '0.375rem'
            }}
          >
            {element.content.text}
          </button>
        );

      case 'divider':
        return (
          <hr
            key={element.id}
            style={{
              ...elementStyles,
              border: 'none',
              height: elementStyles.height || '1px',
              backgroundColor: elementStyles.backgroundColor || '#e5e7eb'
            }}
          />
        );

      default:
        return null;
    }
  };

  // Render background effects
  const renderBackgroundEffects = () => {
    const { backgroundEffects } = headerTemplate.advancedLayout;
    
    return (
      <>
        {/* SVG Overlays */}
        {backgroundEffects.svgOverlays?.map((overlay: any, index: number) => (
          <div
            key={`svg-overlay-${index}`}
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: overlay.opacity || 0.5,
              zIndex: overlay.zIndex || 1
            }}
          >
            <svg
              viewBox={overlay.viewBox || '0 0 100 100'}
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: overlay.svgCode }}
            />
          </div>
        ))}

        {/* Gradient Overlays */}
        {backgroundEffects.gradients?.map((gradient: any, index: number) => (
          <div
            key={`gradient-${index}`}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: gradient.css,
              opacity: gradient.opacity || 0.5,
              zIndex: gradient.zIndex || 1
            }}
          />
        ))}
      </>
    );
  };

  const sortedElements = headerTemplate.elements
    .filter(el => el.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <div style={getLayoutStyles()}>
      {/* Background Effects */}
      {renderBackgroundEffects()}
      
      {/* Header Elements */}
      {sortedElements.map(renderElement)}
    </div>
  );
}