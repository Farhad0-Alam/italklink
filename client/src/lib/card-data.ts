import { BusinessCard, businessCardSchema } from "@shared/schema";

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
};

export const validateCardData = (data: unknown): BusinessCard => {
  return businessCardSchema.parse(data);
};

export const sanitizeCardData = (data: Partial<BusinessCard>): Partial<BusinessCard> => {
  // Remove empty strings and convert to undefined
  const sanitized: Partial<BusinessCard> = {};
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      sanitized[key as keyof BusinessCard] = value;
    }
  });
  
  return sanitized;
};
