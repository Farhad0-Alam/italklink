import React from 'react';
import { PageElementRenderer } from './page-element';
import type { PageElement, BusinessCard } from '@shared/schema';

interface PagePreviewProps {
  pageData: {
    id: string;
    label: string;
    elements: PageElement[];
  };
  cardData: BusinessCard;
  elementSpacing?: number;
  individualElementSpacing?: Record<string, number>;
  onNavigatePage?: (pageId: string) => void;
}

export function PagePreview({ pageData, cardData, elementSpacing = 16, individualElementSpacing, onNavigatePage }: PagePreviewProps) {
  // Debug logging
  console.log('[PagePreview] Props received:', {
    elementSpacing,
    individualElementSpacing,
    pageDataLength: pageData?.elements?.length
  });
  
  // Get background settings from cardData
  const backgroundType = cardData?.backgroundType || "color";
  const backgroundColor = cardData?.backgroundColor || "#f0f0f0";
  const backgroundImage = cardData?.backgroundImage;
  const backgroundGradient = cardData?.backgroundGradient;
  
  // Build background style based on type
  const getBackgroundStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'relative',
    };
    
    if (backgroundType === "color") {
      return { ...baseStyle, backgroundColor };
    } else if (backgroundType === "gradient" && backgroundGradient) {
      const { type, angle, colors } = backgroundGradient;
      const gradientColors = colors
        .sort((a: any, b: any) => a.position - b.position)
        .map((c: any) => `${c.color} ${c.position}%`)
        .join(', ');
      
      if (type === "linear") {
        return { 
          ...baseStyle, 
          background: `linear-gradient(${angle}deg, ${gradientColors})` 
        };
      } else if (type === "radial") {
        return { 
          ...baseStyle, 
          background: `radial-gradient(circle, ${gradientColors})` 
        };
      }
    } else if (backgroundType === "image" && backgroundImage) {
      return {
        ...baseStyle,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      };
    } else if (backgroundType?.startsWith("animation-")) {
      // Background animations will use CSS classes
      return { ...baseStyle, backgroundColor };
    }
    
    // Fallback to color
    return { ...baseStyle, backgroundColor };
  };
  
  const backgroundStyle = getBackgroundStyle();
  const backgroundAnimationClass = backgroundType?.startsWith("animation-") 
    ? `bg-${backgroundType}` 
    : '';
  
  // Filter out invisible elements
  const visibleElements = (pageData.elements || []).filter(el => el.visible !== false);
  
  if (!visibleElements || visibleElements.length === 0) {
    return (
      <div 
        className={`h-full flex items-center justify-center ${backgroundAnimationClass}`} 
        style={backgroundStyle}
      >
        <div className="text-center p-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <i className="fas fa-plus text-gray-400 text-xl"></i>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{pageData.label}</h3>
          <p className="text-gray-500 text-sm mb-4">This page is empty</p>
          <p className="text-gray-400 text-xs">Add elements to design this page</p>
        </div>
      </div>
    );
  }

  // Sort elements by order
  const sortedElements = visibleElements.sort((a, b) => a.order - b.order);

  return (
    <div 
      className={`h-full overflow-y-auto relative ${backgroundAnimationClass}`} 
      style={backgroundStyle}
    >
      <div className="min-h-full relative">
        {sortedElements.map((element, index) => {
          // Calculate spacing for this element
          let spacing = elementSpacing; // Default global spacing
          
          // Check if next element exists and is the same type
          if (index < sortedElements.length - 1) {
            const nextElement = sortedElements[index + 1];
            
            // If next element is same type, use individual spacing for this type
            if (nextElement.type === element.type) {
              spacing = individualElementSpacing?.[element.type] ?? elementSpacing;
              console.log(`[PagePreview] Element ${index} (${element.type}): Next is same type, using individual spacing:`, spacing);
            } else {
              console.log(`[PagePreview] Element ${index} (${element.type}): Next is different type (${nextElement.type}), using global spacing:`, spacing);
            }
            // Otherwise use global spacing (already set as default)
          } else {
            // Last element, no spacing needed
            spacing = 0;
            console.log(`[PagePreview] Element ${index} (${element.type}): Last element, no spacing`);
          }

          return (
            <div key={element.id} style={{ marginBottom: `${spacing}px` }}>
              <PageElementRenderer
                element={element}
                isEditing={false}
                onUpdate={() => {}}
                onDelete={() => {}}
                cardData={cardData}
                onNavigatePage={onNavigatePage}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}