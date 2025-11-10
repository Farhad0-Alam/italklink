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
