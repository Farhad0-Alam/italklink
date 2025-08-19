import { z } from "zod";

export const businessCardSchema = z.object({
  // Basic Information
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().optional(),
  about: z.string().optional(),
  
  // Contact Information
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  location: z.string().optional(),
  
  // Social Media
  whatsapp: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  telegram: z.string().optional(),
  
  // Branding
  brandColor: z.string().default("#22c55e"),
  accentColor: z.string().default("#16a34a"),
  font: z.enum(["inter", "roboto", "poppins"]).default("inter"),
  template: z.enum(["minimal", "bold", "photo"]).default("minimal"),
  
  // Media (base64 encoded)
  profilePhoto: z.string().optional(),
  logo: z.string().optional(),
  galleryImages: z.array(z.string()).default([]),
  
  // Extended content
  vision: z.string().optional(),
  mission: z.string().optional(),
  
  // Metadata
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type BusinessCard = z.infer<typeof businessCardSchema>;

export const insertBusinessCardSchema = businessCardSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertBusinessCard = z.infer<typeof insertBusinessCardSchema>;

// Language schema for i18n
export const languageSchema = z.enum(["en", "bn"]);
export type Language = z.infer<typeof languageSchema>;
