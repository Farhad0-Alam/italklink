import { BusinessCard } from "@shared/schema";

// Encode card data for URL sharing
export const encodeCardData = (cardData: BusinessCard): string => {
  try {
    const jsonString = JSON.stringify(cardData);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.error("Failed to encode card data:", error);
    return "";
  }
};

// Decode card data from URL
export const decodeCardData = (encodedData: string): BusinessCard | null => {
  try {
    const jsonString = decodeURIComponent(escape(atob(encodedData)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to decode card data:", error);
    return null;
  }
};

// Generate share URL
export const generateShareUrl = (cardData: BusinessCard): string => {
  const baseUrl = window.location.origin;
  
  // Use custom URL or shareSlug for clean URLs
  if (cardData.customUrl) {
    return `${baseUrl}/${cardData.customUrl}`;
  } else if (cardData.shareSlug) {
    return `${baseUrl}/${cardData.shareSlug}`;
  }
  
  // Fallback to encoded data
  const encodedData = encodeCardData(cardData);
  return `${baseUrl}/share#${encodedData}`;
};

// Copy to clipboard utility
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand('copy');
      textArea.remove();
      return result;
    }
  } catch (error) {
    console.error("Failed to copy to clipboard:", error);
    return false;
  }
};

// Analytics event logging
export const logEvent = async (action: string): Promise<void> => {
  try {
    await fetch("/api/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        timestamp: new Date().toISOString()
      })
    });
  } catch (error) {
    // Silently fail - analytics shouldn't break the app
    console.debug("Analytics event failed:", error);
  }
};

interface ShareOptions {
  toast?: (options: { title: string; description?: string; variant?: string }) => void;
  trackButtonClick?: (
    cardId: string,
    buttonType: string,
    buttonLabel: string,
    buttonAction: string,
    buttonLink?: string
  ) => Promise<void>;
}

/**
 * Creates a share handler for the business card
 * @param card - Business card data
 * @param options - Toast and tracking callbacks
 * @returns Share handler function
 */
export function createShareHandler(
  card: BusinessCard,
  options: ShareOptions = {}
) {
  const { toast, trackButtonClick } = options;
  const shareUrl = generateShareUrl(card);
  const text = `Check out ${card.fullName}'s business card`;

  return async (platform?: string): Promise<boolean> => {
    // Track share action if function is provided
    if (trackButtonClick && card.id) {
      trackButtonClick(
        card.id,
        "share-button",
        "Share",
        "share",
        shareUrl
      ).catch(console.error);
    }

    if (platform === "copy") {
      const success = await copyToClipboard(shareUrl);
      if (toast) {
        if (success) {
          toast({
            title: "Link copied!",
            description: "Business card link copied to clipboard",
          });
        } else {
          toast({
            title: "Copy failed",
            description: "Please copy the link manually",
            variant: "destructive",
          });
        }
      }
      return success;
    }

    let shareUrlPlatform = "";
    switch (platform) {
      case "facebook":
        shareUrlPlatform = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case "twitter":
        shareUrlPlatform = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        shareUrlPlatform = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case "whatsapp":
        shareUrlPlatform = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      default:
        // Try native share API
        if (navigator.share) {
          try {
            await navigator.share({
              title: text,
              url: shareUrl,
            });
            return true;
          } catch (err) {
            console.log("Share cancelled");
            return false;
          }
        } else {
          // Fallback to copy
          return createShareHandler(card, options)("copy");
        }
    }

    if (shareUrlPlatform) {
      window.open(shareUrlPlatform, "_blank", "width=600,height=400");
      return true;
    }

    return false;
  };
}

/**
 * Gets share platforms for the share menu
 */
export function getSharePlatforms() {
  return [
    { id: "copy", label: "Copy Link", icon: "fas fa-link" },
    { id: "whatsapp", label: "WhatsApp", icon: "fab fa-whatsapp" },
    { id: "facebook", label: "Facebook", icon: "fab fa-facebook" },
    { id: "twitter", label: "Twitter", icon: "fab fa-twitter" },
    { id: "linkedin", label: "LinkedIn", icon: "fab fa-linkedin" },
  ];
}
