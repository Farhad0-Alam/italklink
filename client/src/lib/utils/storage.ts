import { BusinessCard } from "@shared/schema";
import { defaultCardData } from "@/lib/card-data";

const STORAGE_KEY = "tl_preview_state";
const LANGUAGE_KEY = "tl_language";
const THEME_KEY = "tl_theme";

export const storage = {
  // Card data
  saveCardData: (data: BusinessCard): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save card data:", error);
    }
  },

  loadCardData: (): BusinessCard => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultCardData, ...parsed };
      }
    } catch (error) {
      console.warn("Failed to load card data:", error);
    }
    return defaultCardData;
  },

  clearCardData: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn("Failed to clear card data:", error);
    }
  },

  // Language preference
  saveLanguage: (language: string): void => {
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.warn("Failed to save language:", error);
    }
  },

  loadLanguage: (): string => {
    try {
      return localStorage.getItem(LANGUAGE_KEY) || "en";
    } catch (error) {
      console.warn("Failed to load language:", error);
      return "en";
    }
  },

  // Theme preference
  saveTheme: (theme: string): void => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.warn("Failed to save theme:", error);
    }
  },

  loadTheme: (): string => {
    try {
      return localStorage.getItem(THEME_KEY) || "light";
    } catch (error) {
      console.warn("Failed to load theme:", error);
      return "light";
    }
  },
};

// File handling utilities
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.size > 1.5 * 1024 * 1024) { // 1.5MB limit
      reject(new Error("File size too large. Maximum 1.5MB allowed."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return allowedTypes.includes(file.type);
};
