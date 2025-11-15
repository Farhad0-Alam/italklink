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
  onNavigatePage?: (pageId: string) => void;
}

export function PagePreview({ pageData, cardData, onNavigatePage }: PagePreviewProps) {
  const backgroundColor = cardData?.backgroundColor || "#f0f0f0";
  
  if (!pageData.elements || pageData.elements.length === 0) {
    return (
      <div className="h-full flex items-center justify-center" style={{ backgroundColor }}>
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

  return (
    <div className="h-full overflow-y-auto relative" style={{ backgroundColor }}>
      <div className="min-h-full relative">
        {pageData.elements
          .sort((a, b) => a.order - b.order)
          .map((element) => (
            <div key={element.id} className="mb-4">
              <PageElementRenderer
                element={element}
                isEditing={false}
                onUpdate={() => {}}
                onDelete={() => {}}
                cardData={cardData}
                onNavigatePage={onNavigatePage}
              />
            </div>
          ))}
      </div>
    </div>
  );
}