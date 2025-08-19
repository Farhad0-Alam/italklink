import { z } from "zod";

// Base element schema for drag-and-drop page builder
export const baseElementSchema = z.object({
  id: z.string(),
  order: z.number(),
});

// Different element types
export const headingElementSchema = baseElementSchema.extend({
  type: z.literal("heading"),
  data: z.object({
    text: z.string(),
    level: z.enum(["h1", "h2", "h3"]).default("h2"),
    alignment: z.enum(["left", "center", "right"]).default("center"),
  }),
});

export const paragraphElementSchema = baseElementSchema.extend({
  type: z.literal("paragraph"),
  data: z.object({
    text: z.string(),
    alignment: z.enum(["left", "center", "right"]).default("left"),
  }),
});

export const linkElementSchema = baseElementSchema.extend({
  type: z.literal("link"),
  data: z.object({
    text: z.string(),
    url: z.string(),
    style: z.enum(["button", "text"]).default("button"),
  }),
});

export const imageElementSchema = baseElementSchema.extend({
  type: z.literal("image"),
  data: z.object({
    src: z.string(), // base64 or URL
    alt: z.string().optional(),
    width: z.number().optional(),
    height: z.number().optional(),
  }),
});

export const qrcodeElementSchema = baseElementSchema.extend({
  type: z.literal("qrcode"),
  data: z.object({
    value: z.string(),
    size: z.number().default(150),
  }),
});

export const videoElementSchema = baseElementSchema.extend({
  type: z.literal("video"),
  data: z.object({
    url: z.string(),
    thumbnail: z.string().optional(),
  }),
});

export const contactFormElementSchema = baseElementSchema.extend({
  type: z.literal("contactForm"),
  data: z.object({
    title: z.string().default("Contact Me"),
    fields: z.array(z.string()).default(["name", "email", "message"]),
  }),
});

export const accordionElementSchema = baseElementSchema.extend({
  type: z.literal("accordion"),
  data: z.object({
    items: z.array(z.object({
      id: z.string(),
      title: z.string(),
      content: z.string(),
    })),
  }),
});

export const imageSliderElementSchema = baseElementSchema.extend({
  type: z.literal("imageSlider"),
  data: z.object({
    images: z.array(z.object({
      id: z.string(),
      src: z.string(),
      alt: z.string().optional(),
    })),
  }),
});

export const contactSectionElementSchema = baseElementSchema.extend({
  type: z.literal("contactSection"),
  data: z.object({
    contacts: z.array(z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
      icon: z.string(),
      type: z.enum(["phone", "email", "website", "text", "other"])
    })),
  }),
});

export const socialSectionElementSchema = baseElementSchema.extend({
  type: z.literal("socialSection"),
  data: z.object({
    socials: z.array(z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
      icon: z.string(),
      platform: z.string()
    })),
  }),
});

// Union type for all elements
export const pageElementSchema = z.discriminatedUnion("type", [
  headingElementSchema,
  paragraphElementSchema,
  linkElementSchema,
  imageElementSchema,
  qrcodeElementSchema,
  videoElementSchema,
  contactFormElementSchema,
  accordionElementSchema,
  imageSliderElementSchema,
  contactSectionElementSchema,
  socialSectionElementSchema,
]);

export type PageElement = z.infer<typeof pageElementSchema>;

export const businessCardSchema = z.object({
  // Basic Information
  fullName: z.string().min(1, "Full name is required"),
  title: z.string().min(1, "Title is required"),
  company: z.string().optional(),
  about: z.string().optional(),
  
  // Contact Information (legacy for backward compatibility)
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  website: z.string().url("Invalid website URL").optional().or(z.literal("")),
  location: z.string().optional(),
  
  // Social Media (legacy fields for backward compatibility)
  whatsapp: z.string().optional(),
  linkedin: z.string().optional(),
  instagram: z.string().optional(),
  twitter: z.string().optional(),
  facebook: z.string().optional(),
  youtube: z.string().optional(),
  telegram: z.string().optional(),
  
  // Dynamic contact fields (legacy)
  customContacts: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.string(),
    icon: z.string(),
    type: z.enum(["phone", "email", "website", "text", "other"])
  })).default([]),
  
  // Dynamic social media fields (legacy)
  customSocials: z.array(z.object({
    id: z.string(),
    label: z.string(),
    value: z.string(),
    icon: z.string(),
    platform: z.string()
  })).default([]),
  
  // New drag-and-drop page elements system
  pageElements: z.array(pageElementSchema).default([]),
  
  // Branding
  brandColor: z.string().default("#22c55e"),
  accentColor: z.string().default("#16a34a"),
  font: z.enum(["inter", "roboto", "poppins"]).default("inter"),
  template: z.enum(["minimal", "bold", "photo"]).default("minimal"),
  
  // Media (base64 encoded)
  profilePhoto: z.string().optional(),
  logo: z.string().optional(),
  galleryImages: z.array(z.string()).default([]),
  
  // Available icons for selection
  availableIcons: z.array(z.object({
    name: z.string(),
    icon: z.string(),
    category: z.string()
  })).default([]),
  
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
