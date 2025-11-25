import { BusinessCard, businessCardSchema } from "@shared/schema";

export interface IconData {
  name: string;
  icon: string;
  category: string;
  id?: number;
}

export const fallbackIcons: IconData[] = [
  { name: "Phone", icon: "fas fa-phone", category: "contact" },
  { name: "Email", icon: "fas fa-envelope", category: "contact" },
  { name: "Website", icon: "fas fa-globe", category: "contact" },
  { name: "Text/SMS", icon: "fas fa-comment", category: "contact" },
  { name: "Address", icon: "fas fa-map-marker-alt", category: "contact" },
  { name: "Fax", icon: "fas fa-fax", category: "contact" },
  { name: "Skype", icon: "fab fa-skype", category: "contact" },
  { name: "Calendar", icon: "fas fa-calendar", category: "contact" },
  { name: "WhatsApp", icon: "fab fa-whatsapp", category: "social" },
  { name: "LinkedIn", icon: "fab fa-linkedin", category: "social" },
  { name: "Instagram", icon: "fab fa-instagram", category: "social" },
  { name: "Twitter/X", icon: "fab fa-twitter", category: "social" },
  { name: "Facebook", icon: "fab fa-facebook", category: "social" },
  { name: "YouTube", icon: "fab fa-youtube", category: "social" },
  { name: "TikTok", icon: "fab fa-tiktok", category: "social" },
  { name: "Discord", icon: "fab fa-discord", category: "social" },
  { name: "Telegram", icon: "fab fa-telegram", category: "social" },
  { name: "Snapchat", icon: "fab fa-snapchat", category: "social" },
  { name: "Pinterest", icon: "fab fa-pinterest", category: "social" },
  { name: "GitHub", icon: "fab fa-github", category: "social" },
  { name: "Behance", icon: "fab fa-behance", category: "social" },
  { name: "Dribbble", icon: "fab fa-dribbble", category: "social" },
];

export const getAvailableIcons = () => fallbackIcons;

// Generate unique ID for custom fields
export const generateFieldId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const defaultCardData: BusinessCard = {
  fullName: "",
  title: "",
  company: "",
  about: "",
  phone: "",
  email: "",
  website: "",
  location: "",
  whatsapp: "",
  linkedin: "",
  instagram: "",
  twitter: "",
  facebook: "",
  youtube: "",
  telegram: "",
  brandColor: "#22c55e",
  accentColor: "#16a34a", 
  font: "inter",
  template: "minimal",
  profilePhoto: "",
  logo: "",
  galleryImages: [],
  vision: "",
  mission: "",
  customContacts: [],
  customSocials: [],
  availableIcons: getAvailableIcons(),
};

export const sampleCardData: BusinessCard = {
  fullName: "Farhad Alam",
  title: "Pro Freelancer",
  company: "Tech Solutions",
  about: "Experienced freelancer specializing in web development and digital solutions.",
  phone: "+8801234567890",
  email: "farhad@example.com",
  website: "https://farhadalam.com",
  location: "Dhaka, Bangladesh",
  whatsapp: "+8801234567890",
  linkedin: "linkedin.com/in/farhadalam",
  instagram: "@farhadalam",
  twitter: "@farhadalam",
  facebook: "farhadalam",
  youtube: "",
  telegram: "@farhadalam",
  brandColor: "#22c55e",
  accentColor: "#16a34a",
  font: "inter",
  template: "minimal",
  profilePhoto: "",
  logo: "",
  galleryImages: [],
  vision: "To empower businesses through innovative digital solutions.",
  mission: "Creating scalable, user-friendly applications that drive business growth.",
  customContacts: [],
  customSocials: [],
  availableIcons: getAvailableIcons(),
};

export const validateCardData = (data: unknown): BusinessCard => {
  return businessCardSchema.parse(data);
};

export const sanitizeCardData = (data: Partial<BusinessCard>): Partial<BusinessCard> => {
  // Remove empty strings and convert to undefined
  const sanitized: Partial<BusinessCard> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      // Skip arrays and objects from this check
      if (Array.isArray(value) || typeof value === 'object') {
        (sanitized as any)[key] = value;
      } else {
        (sanitized as any)[key] = value;
      }
    }
  });
  
  return sanitized;
};
