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
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'super_admin']);
export const teamRoleEnum = pgEnum('team_role', ['owner', 'admin', 'member']);
export const teamMemberStatusEnum = pgEnum('team_member_status', ['active', 'invited', 'suspended']);

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
  
  // Custom URL for sharing
  customUrl: varchar("custom_url"),
  
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

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  ownerId: varchar("owner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Team settings
  maxMembers: integer("max_members").default(10),
  allowBulkGeneration: boolean("allow_bulk_generation").default(true),
  
  // Branding defaults for team cards
  defaultBrandColor: varchar("default_brand_color").default('#22c55e'),
  defaultAccentColor: varchar("default_accent_color").default('#16a34a'),
  defaultFont: varchar("default_font").default('inter'),
  defaultTemplate: varchar("default_template").default('minimal'),
  
  // Team logo and branding
  teamLogo: text("team_logo"), // base64
  companyName: varchar("company_name"),
  companyWebsite: varchar("company_website"),
  companyAddress: varchar("company_address"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Team members table
export const teamMembers = pgTable("team_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
  
  // Member info (for invited users who haven't joined yet)
  email: varchar("email"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  title: varchar("title"),
  department: varchar("department"),
  phone: varchar("phone"),
  
  // Role and status
  role: teamRoleEnum("role").default('member'),
  status: teamMemberStatusEnum("status").default('invited'),
  
  // Invitation
  invitedBy: varchar("invited_by").references(() => users.id),
  invitedAt: timestamp("invited_at").defaultNow(),
  joinedAt: timestamp("joined_at"),
  
  // Generated card reference
  businessCardId: varchar("business_card_id").references(() => businessCards.id),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bulk generation jobs table
export const bulkGenerationJobs = pgTable("bulk_generation_jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Job details
  jobName: varchar("job_name").notNull(),
  status: varchar("status").default('pending'), // pending, processing, completed, failed
  
  // Template and settings
  templateData: jsonb("template_data").notNull(), // Base card template
  memberCount: integer("member_count").default(0),
  completedCount: integer("completed_count").default(0),
  failedCount: integer("failed_count").default(0),
  
  // Processing info
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Admin logs table
export const adminLogs = pgTable("admin_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  actorId: varchar("actor_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  action: varchar("action").notNull(), // create, update, delete, suspend, etc.
  targetType: varchar("target_type").notNull(), // user, template, organization, etc.
  targetId: varchar("target_id"),
  details: jsonb("details"), // Additional context
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics events table
export const analyticsEvents = pgTable("analytics_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").references(() => businessCards.id, { onDelete: 'cascade' }),
  type: varchar("type").notNull(), // view, click, qr_scan, share
  metadata: jsonb("metadata"), // device info, utm params, etc.
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Global templates table
export const globalTemplates = pgTable("global_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  templateData: jsonb("template_data").notNull(), // The template configuration
  previewImage: text("preview_image"), // base64 preview
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Template collections table
export const templateCollections = pgTable("template_collections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Collection settings
  isPublic: boolean("is_public").default(false),
  shareSlug: varchar("share_slug").unique(),
  
  // Collection metadata
  templateCount: integer("template_count").default(0),
  viewCount: integer("view_count").default(0),
  tags: jsonb("tags"), // array of strings for categorization
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Template collection items table (many-to-many relationship)
export const templateCollectionItems = pgTable("template_collection_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").references(() => templateCollections.id, { onDelete: 'cascade' }).notNull(),
  templateId: varchar("template_id").notNull(), // Reference to template (could be global or user template)
  templateType: varchar("template_type").notNull(), // 'global' or 'business_card'
  
  // Item metadata
  order: integer("order").default(0), // For custom ordering within collection
  addedBy: varchar("added_by").references(() => users.id, { onDelete: 'set null' }),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Collection likes/favorites table
export const templateCollectionLikes = pgTable("template_collection_likes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").references(() => templateCollections.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Collection comments table
export const templateCollectionComments = pgTable("template_collection_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collectionId: varchar("collection_id").references(() => templateCollections.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

export type BulkGenerationJob = typeof bulkGenerationJobs.$inferSelect;
export type InsertBulkGenerationJob = typeof bulkGenerationJobs.$inferInsert;

export type AdminLog = typeof adminLogs.$inferSelect;
export type InsertAdminLog = typeof adminLogs.$inferInsert;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export type GlobalTemplate = typeof globalTemplates.$inferSelect;
export type InsertGlobalTemplate = typeof globalTemplates.$inferInsert;

export type TemplateCollection = typeof templateCollections.$inferSelect;
export type InsertTemplateCollection = typeof templateCollections.$inferInsert;

export type TemplateCollectionItem = typeof templateCollectionItems.$inferSelect;
export type InsertTemplateCollectionItem = typeof templateCollectionItems.$inferInsert;

export type TemplateCollectionLike = typeof templateCollectionLikes.$inferSelect;
export type InsertTemplateCollectionLike = typeof templateCollectionLikes.$inferInsert;

export type TemplateCollectionComment = typeof templateCollectionComments.$inferSelect;
export type InsertTemplateCollectionComment = typeof templateCollectionComments.$inferInsert;

// Zod schemas for database
export const insertUserSchema = createInsertSchema(users);
export const insertDbBusinessCardSchema = createInsertSchema(businessCards);
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertTeamSchema = createInsertSchema(teams);
export const insertTeamMemberSchema = createInsertSchema(teamMembers);
export const insertBulkGenerationJobSchema = createInsertSchema(bulkGenerationJobs);
export const insertAdminLogSchema = createInsertSchema(adminLogs);
export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents);
export const insertGlobalTemplateSchema = createInsertSchema(globalTemplates);
export const insertTemplateCollectionSchema = createInsertSchema(templateCollections);
export const insertTemplateCollectionItemSchema = createInsertSchema(templateCollectionItems);
export const insertTemplateCollectionLikeSchema = createInsertSchema(templateCollectionLikes);
export const insertTemplateCollectionCommentSchema = createInsertSchema(templateCollectionComments);

// Team invitation schema
export const teamInvitationSchema = z.object({
  email: z.string().email('Valid email required'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  title: z.string().min(1, 'Job title required'),
  department: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(['admin', 'member']).default('member'),
});

export type TeamInvitation = z.infer<typeof teamInvitationSchema>;

// Bulk card generation schema
export const bulkCardGenerationSchema = z.object({
  jobName: z.string().min(1, 'Job name required'),
  members: z.array(teamInvitationSchema).min(1, 'At least one member required'),
  templateCard: z.record(z.any()), // Will reference businessCardSchema later
  useTeamBranding: z.boolean().default(true),
});

export type BulkCardGeneration = z.infer<typeof bulkCardGenerationSchema>;

// Template collection schemas
export const createTemplateCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  templateIds: z.array(z.string()).min(1, 'At least one template is required'),
});

export const updateTemplateCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  isPublic: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const addTemplateToCollectionSchema = z.object({
  templateId: z.string(),
  templateType: z.enum(['global', 'business_card']),
});

export type CreateTemplateCollection = z.infer<typeof createTemplateCollectionSchema>;
export type UpdateTemplateCollection = z.infer<typeof updateTemplateCollectionSchema>;
export type AddTemplateToCollection = z.infer<typeof addTemplateToCollectionSchema>;

// CSV import schema
export const csvMemberSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'), 
  email: z.string().email('Valid email required'),
  title: z.string().min(1, 'Job title required'),
  department: z.string().optional(),
  phone: z.string().optional(),
  personalWebsite: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

export type CsvMember = z.infer<typeof csvMemberSchema>;

// Simplified team member schema for UI
export const simplifiedTeamMemberSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  title: z.string().min(1, 'Job title required'),
  role: z.enum(['admin', 'member']).default('member'),
});

// Team settings schema
export const teamSettingsSchema = z.object({
  name: z.string().min(1, 'Team name required'),
  description: z.string().optional(),
  maxMembers: z.number().min(1).max(1000).default(10),
  allowBulkGeneration: z.boolean().default(true),
  defaultBrandColor: z.string().default('#22c55e'),
  defaultAccentColor: z.string().default('#16a34a'),
  defaultFont: z.enum(['inter', 'roboto', 'poppins']).default('inter'),
  defaultTemplate: z.enum(['minimal', 'bold', 'photo']).default('minimal'),
  companyName: z.string().optional(),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companyAddress: z.string().optional(),
});

export type TeamSettings = z.infer<typeof teamSettingsSchema>;

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
  
  // Custom URL for user card sharing
  customUrl: z.string().optional(),
  
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


export type SimplifiedTeamMember = z.infer<typeof simplifiedTeamMemberSchema>;

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
