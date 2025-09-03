import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { MenuElement } from './MenuElement';
import { BusinessCardComponent } from '@/modules/business-cards';
import { useQuery } from '@tanstack/react-query';
import { BusinessCard } from '@shared/schema';

interface CardLayoutProps {
  children: React.ReactNode;
}

interface CardWithPages extends BusinessCard {
  pages?: Array<{
    key: string;
    path: string;
    label: string;
    visible: boolean;
  }>;
  menu?: Array<{
    id: string;
    type: 'internal' | 'external';
    label: string;
    path?: string;
    href?: string;
    target?: '_self' | '_blank';
    rel?: string;
    icon?: string;
    order: number;
    visible: boolean;
    style: {
      variant: 'tabs' | 'pills' | 'underline' | 'ghost';
      orientation: 'horizontal' | 'vertical';
      radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
      size: 'sm' | 'md' | 'lg';
      gap: number;
      weightActive: number;
      weight: number;
      underlineActive: boolean;
      shadow: boolean;
      sticky: boolean;
      mobileCollapse: boolean;
      bg: string;
      fg: string;
      fgActive: string;
      border: string;
    };
  }>;
}

export function CardLayout({ children }: CardLayoutProps) {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: card, isLoading, error } = useQuery<CardWithPages>({
    queryKey: ['/api/cards', slug],
    enabled: !!slug,
  });

  const handleMenuTrack = (eventName: string, payload: any) => {
    console.log('Menu tracking:', eventName, { slug, ...payload });
    // Future: Send to analytics service
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading card...</div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Card Not Found</h1>
          <p className="text-gray-600 mt-2">The business card you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="card-layout">
      {/* Brand Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {card.company ? card.company.charAt(0) : card.fullName.charAt(0)}
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{card.fullName}</h1>
                {card.title && <p className="text-sm text-gray-600">{card.title}</p>}
                {card.company && <p className="text-sm text-gray-500">{card.company}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      {card.menu && card.menu.length > 0 && (
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4">
            <MenuElement
              baseUrl={`/card/${slug}`}
              items={card.menu}
              onTrack={handleMenuTrack}
            />
          </div>
        </div>
      )}

      {/* Page Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}