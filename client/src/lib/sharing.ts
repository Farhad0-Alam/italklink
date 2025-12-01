export interface ShareConfig {
  title: string;
  description: string;
  url: string;
  image?: string;
  hashtags?: string[];
}

export function getTwitterShareUrl(config: ShareConfig): string {
  const text = `${config.title} - ${config.description}`.slice(0, 140);
  const url = new URL('https://twitter.com/intent/tweet');
  url.searchParams.set('text', text);
  url.searchParams.set('url', config.url);
  if (config.hashtags?.length) {
    url.searchParams.set('hashtags', config.hashtags.join(','));
  }
  return url.toString();
}

export function getFacebookShareUrl(config: ShareConfig): string {
  const url = new URL('https://www.facebook.com/sharer/sharer.php');
  url.searchParams.set('u', config.url);
  url.searchParams.set('quote', config.title);
  return url.toString();
}

export function getLinkedInShareUrl(config: ShareConfig): string {
  const url = new URL('https://www.linkedin.com/sharing/share-offsite/');
  url.searchParams.set('url', config.url);
  return url.toString();
}

export function getWhatsAppShareUrl(config: ShareConfig): string {
  const text = `${config.title}\n${config.description}\n${config.url}`;
  const url = new URL('https://wa.me/');
  url.searchParams.set('text', text);
  return url.toString();
}

export async function trackShare(
  productId: string,
  platform: string,
  shareUrl: string,
  sharedBy?: string
) {
  try {
    await fetch('/api/shares/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId,
        platform,
        shareLink: shareUrl,
        sharedBy,
        ipAddress: undefined,
      }),
    });
  } catch (error) {
    console.error('Failed to track share:', error);
  }
}
