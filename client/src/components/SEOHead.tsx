import { BusinessCard } from '@shared/schema';
import { useEffect } from 'react';

interface SEOHeadProps {
  cardData: BusinessCard;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ cardData }) => {
  useEffect(() => {
    // Update document title
    document.title = `${cardData.fullName || 'Digital Business Card'} - Professional Digital Contact Card`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `Connect with ${cardData.fullName || 'this professional'} through their digital business card. ${cardData.title ? `${cardData.title} at ${cardData.company || 'their company'}` : 'Professional contact information'}.`
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = `Connect with ${cardData.fullName || 'this professional'} through their digital business card. ${cardData.title ? `${cardData.title} at ${cardData.company || 'their company'}` : 'Professional contact information'}.`;
      document.head.appendChild(meta);
    }
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', 
        `${cardData.fullName}, digital business card, contact, professional, ${cardData.title || ''}, ${cardData.company || ''}`
      );
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', 
        `${cardData.fullName}, digital business card, contact, professional, ${cardData.title || ''}, ${cardData.company || ''}`
      );
      document.head.appendChild(metaKeywords);
    }
    
    // Update Open Graph meta tags
    const updateOGMeta = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };
    
    updateOGMeta('og:title', `${cardData.fullName || 'Digital Business Card'} - Professional Contact`);
    updateOGMeta('og:description', `Connect with ${cardData.fullName || 'this professional'} instantly. Professional digital business card with contact information.`);
    updateOGMeta('og:type', 'profile');
    updateOGMeta('og:image', cardData.profileImageUrl || '/icon-512x512.png');
    updateOGMeta('og:url', window.location.href);
    
    // Update Twitter Card meta tags
    const updateTwitterMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (meta) {
        meta.setAttribute('content', content);
      } else {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        meta.setAttribute('content', content);
        document.head.appendChild(meta);
      }
    };
    
    updateTwitterMeta('twitter:card', 'summary_large_image');
    updateTwitterMeta('twitter:title', `${cardData.fullName || 'Digital Business Card'} - Professional Contact`);
    updateTwitterMeta('twitter:description', `Connect with ${cardData.fullName || 'this professional'} instantly.`);
    updateTwitterMeta('twitter:image', cardData.profileImageUrl || '/icon-512x512.png');
    
    // Update structured data
    let structuredData = document.querySelector('script[type="application/ld+json"]#person-schema');
    if (structuredData) {
      structuredData.remove();
    }
    
    structuredData = document.createElement('script');
    structuredData.setAttribute('type', 'application/ld+json');
    structuredData.setAttribute('id', 'person-schema');
    structuredData.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Person",
      "name": cardData.fullName || "Professional",
      "jobTitle": cardData.title || undefined,
      "worksFor": cardData.company ? {
        "@type": "Organization",
        "name": cardData.company
      } : undefined,
      "telephone": cardData.phone || undefined,
      "email": cardData.email || undefined,
      "url": cardData.website || undefined,
      "image": cardData.profileImageUrl || undefined,
      "address": cardData.location || undefined,
      "description": cardData.bio || `Professional digital business card for ${cardData.fullName || 'this contact'}`,
      "sameAs": [
        cardData.socialLinks?.linkedin && cardData.socialLinks.linkedin.startsWith('http') ? cardData.socialLinks.linkedin : undefined,
        cardData.socialLinks?.twitter ? `https://twitter.com/${cardData.socialLinks.twitter.replace('@', '')}` : undefined,
        cardData.socialLinks?.facebook && cardData.socialLinks.facebook.startsWith('http') ? cardData.socialLinks.facebook : undefined,
        cardData.socialLinks?.instagram ? `https://instagram.com/${cardData.socialLinks.instagram.replace('@', '')}` : undefined
      ].filter(Boolean)
    }, null, 2);
    
    document.head.appendChild(structuredData);
    
  }, [cardData]);

  return null; // This component only updates the head, doesn't render anything
};