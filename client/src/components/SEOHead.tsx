import { BusinessCard } from '@shared/schema';
import { useEffect } from 'react';

interface SEOHeadProps {
  cardData: BusinessCard;
}

export const SEOHead: React.FC<SEOHeadProps> = ({ cardData }) => {
  useEffect(() => {
    // Update document title - use custom metaTitle or generate from name
    const pageTitle = cardData.metaTitle || `${cardData.fullName || 'Digital Business Card'} - Professional Digital Contact Card`;
    document.title = pageTitle;
    
    // Update meta description - use custom metaDescription or generate
    const descriptionContent = cardData.metaDescription || 
      `Connect with ${cardData.fullName || 'this professional'} through their digital business card. ${cardData.title ? `${cardData.title} at ${cardData.company || 'their company'}` : 'Professional contact information'}.`;
    
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', descriptionContent);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = descriptionContent;
      document.head.appendChild(meta);
    }
    
    // Update meta keywords - use custom keywords or generate from card data
    const keywordsContent = cardData.keywords && cardData.keywords.length > 0 
      ? cardData.keywords.join(', ')
      : `${cardData.fullName}, digital business card, contact, professional, ${cardData.title || ''}, ${cardData.company || ''}`;
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywordsContent);
    } else {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      metaKeywords.setAttribute('content', keywordsContent);
      document.head.appendChild(metaKeywords);
    }
    
    // Update meta author
    let metaAuthor = document.querySelector('meta[name="author"]');
    if (cardData.author) {
      if (metaAuthor) {
        metaAuthor.setAttribute('content', cardData.author);
      } else {
        metaAuthor = document.createElement('meta');
        metaAuthor.setAttribute('name', 'author');
        metaAuthor.setAttribute('content', cardData.author);
        document.head.appendChild(metaAuthor);
      }
    } else {
      // Remove author meta tag if no author is set
      if (metaAuthor) {
        metaAuthor.remove();
      }
    }
    
    // Update robots meta tag for noIndex/noFollow
    const robotsDirectives = [];
    if (cardData.noIndex) robotsDirectives.push('noindex');
    if (cardData.noFollow) robotsDirectives.push('nofollow');
    
    if (robotsDirectives.length > 0) {
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.setAttribute('content', robotsDirectives.join(', '));
      } else {
        metaRobots = document.createElement('meta');
        metaRobots.setAttribute('name', 'robots');
        metaRobots.setAttribute('content', robotsDirectives.join(', '));
        document.head.appendChild(metaRobots);
      }
    } else {
      // Remove robots meta tag if no directives
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) {
        metaRobots.remove();
      }
    }
    
    // Update Open Graph meta tags - use custom OG fields or fall back to generated content
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
    
    const ogTitleContent = cardData.ogTitle || cardData.metaTitle || `${cardData.fullName || 'Digital Business Card'} - Professional Contact`;
    const ogDescriptionContent = cardData.ogDescription || cardData.metaDescription || `Connect with ${cardData.fullName || 'this professional'} instantly. Professional digital business card with contact information.`;
    const ogImageContent = cardData.ogImage || cardData.profileImageUrl || '/icon-512x512.png';
    
    updateOGMeta('og:title', ogTitleContent);
    updateOGMeta('og:description', ogDescriptionContent);
    updateOGMeta('og:type', 'profile');
    updateOGMeta('og:image', ogImageContent);
    updateOGMeta('og:url', window.location.href);
    
    // Update Twitter Card meta tags - use OG fields as fallback
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
    updateTwitterMeta('twitter:title', ogTitleContent);
    updateTwitterMeta('twitter:description', ogDescriptionContent);
    updateTwitterMeta('twitter:image', ogImageContent);
    
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