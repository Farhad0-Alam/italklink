import { z } from "zod";
import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Database Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'incomplete']);
export const planTypeEnum = pgEnum('plan_type', ['free', 'pro', 'enterprise']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);

// Database Tables

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique().notNull(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  password: varchar("password"), // For email/password authentication (null for OAuth users)
  role: userRoleEnum("role").default('user'),
  
  // Subscription fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default('active'),
  planType: planTypeEnum("plan_type").default('free'),
  subscriptionEndsAt: timestamp("subscription_ends_at"),
  
  // Usage limits
  businessCardsCount: integer("business_cards_count").default(0),
  businessCardsLimit: integer("business_cards_limit").default(1), // Free plan limit
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  planType: planTypeEnum("plan_type").notNull(),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency").default('usd'),
  interval: varchar("interval").notNull(), // month, year
  businessCardsLimit: integer("business_cards_limit").notNull(),
  features: jsonb("features").notNull(), // array of feature strings
  stripePriceId: varchar("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Business cards table
export const businessCards = pgTable("business_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  
  // Card data (matching the BusinessCard schema)
  fullName: varchar("full_name").notNull(),
  title: varchar("title").notNull(),
  company: varchar("company"),
  about: text("about"),
  
  // Contact info
  phone: varchar("phone"),
  email: varchar("email"),
  website: varchar("website"),
  location: varchar("location"),
  
  // Social media
  whatsapp: varchar("whatsapp"),
  linkedin: varchar("linkedin"),
  instagram: varchar("instagram"),
  twitter: varchar("twitter"),
  facebook: varchar("facebook"),
  youtube: varchar("youtube"),
  telegram: varchar("telegram"),
  
  // Dynamic fields
  customContacts: jsonb("custom_contacts"),
  customSocials: jsonb("custom_socials"),
  pageElements: jsonb("page_elements"),
  
  // Branding
  brandColor: varchar("brand_color").default('#22c55e'),
  accentColor: varchar("accent_color").default('#16a34a'),
  font: varchar("font").default('inter'),
  template: varchar("template").default('minimal'),
  
  // Media
  profilePhoto: text("profile_photo"), // base64
  logo: text("logo"), // base64
  galleryImages: jsonb("gallery_images"),
  
  // Extended content
  vision: text("vision"),
  mission: text("mission"),
  
  // Settings
  isPublic: boolean("is_public").default(true),
  shareSlug: varchar("share_slug").unique(),
  
  // Stats
  viewCount: integer("view_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payment history table
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default('usd'),
  status: varchar("status").notNull(), // succeeded, failed, pending
  planType: planTypeEnum("plan_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Database Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;

export type DbBusinessCard = typeof businessCards.$inferSelect;
export type InsertDbBusinessCard = typeof businessCards.$inferInsert;

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Zod schemas for database
export const insertUserSchema = createInsertSchema(users);
export const insertDbBusinessCardSchema = createInsertSchema(businessCards);
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertPaymentSchema = createInsertSchema(payments);

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

export const testimonialsElementSchema = baseElementSchema.extend({
  type: z.literal("testimonials"),
  data: z.object({
    title: z.string().default("What Our Clients Say"),
    testimonials: z.array(z.object({
      id: z.string(),
      name: z.string(),
      title: z.string().optional(),
      company: z.string().optional(),
      content: z.string(),
      avatar: z.string().optional(), // base64 image
      rating: z.number().min(1).max(5).default(5),
    })).default([]),
    displayStyle: z.enum(["cards", "slider", "grid"]).default("cards"),
  }),
});

export const googleMapsElementSchema = baseElementSchema.extend({
  type: z.literal("googleMaps"),
  data: z.object({
    title: z.string().default("Find Us"),
    address: z.string(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    zoom: z.number().min(1).max(20).default(15),
    mapType: z.enum(["roadmap", "satellite", "hybrid", "terrain"]).default("roadmap"),
    showMarker: z.boolean().default(true),
    height: z.number().default(300), // in pixels
  }),
});

export const aiChatbotElementSchema = baseElementSchema.extend({
  type: z.literal("aiChatbot"),
  data: z.object({
    title: z.string().default("AI Assistant"),
    welcomeMessage: z.string().default("Hi! How can I help you today?"),
    knowledgeBase: z.object({
      textContent: z.string().optional(),
      websiteUrl: z.string().url().optional().or(z.literal("")),
      pdfFiles: z.array(z.object({
        id: z.string(),
        name: z.string(),
        content: z.string(), // extracted text content
        uploadedAt: z.date().optional(),
      })).default([]),
    }),
    appearance: z.object({
      position: z.enum(["bottom-right", "bottom-left", "embedded"]).default("bottom-right"),
      primaryColor: z.string().default("#22c55e"),
      chatHeight: z.number().default(400),
      chatWidth: z.number().default(350),
    }),
    isEnabled: z.boolean().default(true),
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
  testimonialsElementSchema,
  googleMapsElementSchema,
  aiChatbotElementSchema,
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

// Plan features interface
export interface PlanFeatures {
  businessCards: number;
  customBranding: boolean;
  analytics: boolean;
  customDomains: boolean;
  prioritySupport: boolean;
  apiAccess: boolean;
  teamCollaboration?: boolean;
}

// Plan features schema
export const PlanFeaturesSchema = z.object({
  businessCards: z.number(),
  customBranding: z.boolean(),
  analytics: z.boolean(),
  customDomains: z.boolean(),
  prioritySupport: z.boolean(),
  apiAccess: z.boolean(),
  teamCollaboration: z.boolean().optional(),
});

export type PlanFeaturesData = z.infer<typeof PlanFeaturesSchema>;
