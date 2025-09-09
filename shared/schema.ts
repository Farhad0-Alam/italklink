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
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'super_admin', 'owner']);
export const teamRoleEnum = pgEnum('team_role', ['owner', 'admin', 'member']);
export const teamMemberStatusEnum = pgEnum('team_member_status', ['active', 'invited', 'suspended']);
export const frequencyEnum = pgEnum('frequency', ['monthly', 'yearly', 'custom']);
export const iconTypeEnum = pgEnum('icon_type', ['url', 'email', 'phone', 'whatsapp', 'text', 'connect']);
export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed_amount']);
export const couponStatusEnum = pgEnum('coupon_status', ['active', 'inactive', 'expired']);

// Affiliate system enums
export const affiliateStatusEnum = pgEnum('affiliate_status', ['pending', 'approved', 'suspended', 'rejected']);
export const kycStatusEnum = pgEnum('kyc_status', ['pending', 'submitted', 'approved', 'rejected', 'expired']);
export const conversionStatusEnum = pgEnum('conversion_status', ['pending', 'approved', 'paid', 'reversed']);
export const payoutStatusEnum = pgEnum('payout_status', ['draft', 'maker_approved', 'checker_approved', 'paid', 'failed', 'cancelled']);
export const payoutMethodEnum = pgEnum('payout_method', ['stripe_connect', 'paypal', 'bank_transfer', 'manual']);
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'needs_info', 'resolved', 'rejected']);
export const flagSeverityEnum = pgEnum('flag_severity', ['low', 'medium', 'high', 'critical']);
export const eventStatusEnum = pgEnum('event_status', ['pending', 'sent', 'failed']);
export const attributionModeEnum = pgEnum('attribution_mode', ['first_touch', 'last_touch', 'linear']);
export const commissionTypeEnum = pgEnum('commission_type', ['percentage', 'flat']);
export const commissionScopeEnum = pgEnum('commission_scope', ['global', 'plan', 'tier']);
export const balanceKindEnum = pgEnum('balance_kind', ['credit', 'debit']);
export const balanceRefTypeEnum = pgEnum('balance_ref_type', ['conversion', 'payout', 'adjustment', 'refund', 'chargeback', 'conversion_approval', 'conversion_reversal']);

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
  
  // Admin profile fields - commented out fields not in current DB
  // lastLoginAt: timestamp("last_login_at"),
  // isActive: boolean("is_active").default(true),
  // twoFactorEnabled: boolean("two_factor_enabled").default(false),
  // twoFactorSecret: varchar("two_factor_secret"),
  // backupCodes: jsonb("backup_codes"), // Array of backup codes
  // loginAttempts: integer("login_attempts").default(0),
  // lockedUntil: timestamp("locked_until"),
  // timezone: varchar("timezone").default('UTC'),
  // preferredLanguage: varchar("preferred_language").default('en'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Subscription plans table
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(), // NEVER change this ID type
  name: varchar("name").notNull(),
  planType: planTypeEnum("plan_type").notNull(),
  price: integer("price").notNull(), // in cents
  currency: varchar("currency").default('usd'),
  interval: varchar("interval").notNull(), // keep existing for compatibility
  businessCardsLimit: integer("business_cards_limit").notNull(),
  features: jsonb("features").notNull(), // array of feature strings - keep for compatibility
  stripePriceId: varchar("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  // New admin dashboard fields
  cardLabel: varchar("card_label"), // "Card Number" label string from admin
  trialDays: integer("trial_days").default(0),
  // Extra card pricing options
  extraCardOptions: jsonb("extra_card_options").default([]), // [{ cards: 5, price: 4500, label: "5 cards for $45" }]
  hasUnlimitedOption: boolean("has_unlimited_option").default(false),
  unlimitedPrice: integer("unlimited_price"), // price for unlimited cards in cents
  // Template limits
  templateLimit: integer("template_limit").default(-1), // -1 for unlimited, number for limit
  createdAt: timestamp("created_at").defaultNow(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").unique().notNull(), // Coupon code (e.g., "SAVE20", "NEWUSER")
  name: varchar("name").notNull(), // Display name for admin
  description: text("description"), // Optional description
  
  // Discount configuration
  discountType: couponTypeEnum("discount_type").notNull(), // 'percentage' or 'fixed_amount'
  discountValue: integer("discount_value").notNull(), // Percentage (20) or amount in cents (2000)
  maxDiscountAmount: integer("max_discount_amount"), // Max discount for percentage coupons in cents
  
  // Usage limits
  usageLimit: integer("usage_limit"), // Total times coupon can be used (null = unlimited)
  usageCount: integer("usage_count").default(0), // Current usage count
  userUsageLimit: integer("user_usage_limit").default(1), // Times per user (1 = once per user)
  
  // Validity
  startsAt: timestamp("starts_at").defaultNow(),
  expiresAt: timestamp("expires_at"), // null = never expires
  
  // Plan restrictions
  applicablePlans: jsonb("applicable_plans"), // Array of plan IDs (null = all plans)
  minimumOrderAmount: integer("minimum_order_amount"), // Minimum order in cents
  
  // Status and settings
  status: couponStatusEnum("status").default('active'),
  isActive: boolean("is_active").default(true),
  
  // Metadata
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coupon usage tracking table
export const couponUsages = pgTable("coupon_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: 'cascade' }),
  
  // Usage details
  originalAmount: integer("original_amount").notNull(), // Original price in cents
  discountAmount: integer("discount_amount").notNull(), // Discount applied in cents
  finalAmount: integer("final_amount").notNull(), // Final price in cents
  
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
  secondaryColor: varchar("secondary_color").default('#999999'),
  tertiaryColor: varchar("tertiary_color").default('#ffffff'),
  accentColor: varchar("accent_color").default('#16a34a'),
  backgroundColor: varchar("background_color").default('#ffffff'),
  textColor: varchar("text_color").default('#374151'),
  headingColor: varchar("heading_color").default('#000000'),
  paragraphColor: varchar("paragraph_color").default('#000000'),
  
  // Typography
  font: varchar("font").default('inter'),
  headingFont: varchar("heading_font").default('inter'),
  paragraphFont: varchar("paragraph_font").default('inter'),
  fontSize: integer("font_size").default(16),
  headingFontSize: integer("heading_font_size").default(24),
  paragraphFontSize: integer("paragraph_font_size").default(14),
  fontWeight: integer("font_weight").default(400),
  headingFontWeight: integer("heading_font_weight").default(600),
  paragraphFontWeight: integer("paragraph_font_weight").default(400),
  
  // Design
  template: varchar("template").default('minimal'),
  headerDesign: varchar("header_design").default('cover-logo'),
  borderRadius: integer("border_radius").default(8),
  
  // Advanced Header Design
  advancedHeaderEnabled: boolean("advanced_header_enabled").default(false),
  headerTemplate: jsonb("header_template"), // Complete header configuration with SVG shapes, layouts, etc.
  headerLayoutType: varchar("header_layout_type").default('standard'), // 'standard', 'split', 'overlay', 'geometric', 'custom'
  headerSvgShapes: jsonb("header_svg_shapes"), // Array of SVG shape configurations
  headerTextPositioning: jsonb("header_text_positioning"), // Text overlay positioning and styling
  
  // Background options
  backgroundType: varchar("background_type").default('color'), // 'color', 'gradient', 'image'
  backgroundGradient: jsonb("background_gradient"), // {type: 'linear', angle: 90, colors: []}
  backgroundImage: text("background_image"),
  
  // Animations
  animationType: varchar("animation_type").default('none'), // 'none', 'fade', 'slide', 'bounce'
  animationDuration: integer("animation_duration").default(500),
  
  // Media
  profilePhoto: text("profile_photo"), // base64
  logo: text("logo"), // base64
  galleryImages: jsonb("gallery_images"),
  
  // Extended content
  vision: text("vision"),
  mission: text("mission"),
  
  // Custom URL for sharing
  customUrl: varchar("custom_url"),
  
  // Multi-page system
  pages: jsonb("pages"), // [{ key, path, label, visible }]
  menu: jsonb("menu"), // Array of menu items with styling
  
  // Settings
  isPublic: boolean("is_public").default(true),
  shareSlug: varchar("share_slug").unique(),
  
  // Stats
  viewCount: integer("view_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Wallet passes table
export const walletPasses = pgTable("wallet_passes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ecardId: varchar("ecard_id").references(() => businessCards.id, { onDelete: 'cascade' }).notNull(),
  
  // Apple Wallet data
  applePassSerial: varchar("apple_pass_serial"),
  
  // Google Wallet data  
  googleObjectId: varchar("google_object_id"),
  
  // Tracking
  lastGeneratedAt: timestamp("last_generated_at").defaultNow(),
  themeHex: varchar("theme_hex").notNull(), // From ecard brand color
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  uniqueEcardId: index("unique_ecard_id").on(table.ecardId),
  lastGeneratedIdx: index("last_generated_idx").on(table.lastGeneratedAt),
}));

// Wallet Pass types
export type WalletPass = typeof walletPasses.$inferSelect;
export type InsertWalletPass = typeof walletPasses.$inferInsert;

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

// SVG Shapes Library table
export const svgShapes = pgTable("svg_shapes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // 'waves', 'geometric', 'abstract', 'nature', 'professional'
  description: text("description"),
  svgCode: text("svg_code").notNull(), // The actual SVG markup
  viewBox: varchar("view_box").notNull(), // SVG viewBox attribute
  customizableProps: jsonb("customizable_props"), // Properties that can be customized (colors, scale, etc.)
  tags: jsonb("tags"), // Array of tags for searching
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Header Design Templates table  
export const headerDesignTemplates = pgTable("header_design_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // 'modern', 'classic', 'creative', 'minimal', 'bold'
  description: text("description"),
  layoutType: varchar("layout_type").notNull(), // 'standard', 'split', 'overlay', 'geometric', 'custom'
  
  // Template configuration
  templateConfig: jsonb("template_config").notNull(), // Complete header layout configuration
  svgShapeIds: jsonb("svg_shape_ids"), // Array of SVG shape IDs used in this template
  textElements: jsonb("text_elements"), // Text positioning and styling configurations
  
  // Styling options
  colorScheme: jsonb("color_scheme"), // Default color scheme
  typographySettings: jsonb("typography_settings"), // Font and text styling defaults
  
  // Preview and metadata
  previewImage: text("preview_image"), // base64 preview
  thumbnailImage: text("thumbnail_image"), // smaller preview for grid views
  difficulty: varchar("difficulty").default('easy'), // 'easy', 'medium', 'advanced'
  
  // Settings
  isActive: boolean("is_active").default(true),
  isPremium: boolean("is_premium").default(false),
  usageCount: integer("usage_count").default(0),
  
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

// Admin Dashboard Tables

// Features table for plan features
export const features = pgTable("features", {
  id: serial("id").primaryKey(),
  key: varchar("key").unique().notNull(), // e.g. "custom_colors", "analytics"
  label: varchar("label").notNull(), // e.g. "Custom Colors", "Analytics"
  description: text("description"),
  category: varchar("category").default('general'), // e.g. "design", "functionality"
  createdAt: timestamp("created_at").defaultNow(),
});

// Plan features junction table
export const planFeatures = pgTable("plan_features", {
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: 'cascade' }).notNull(),
  featureId: integer("feature_id").references(() => features.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [{
  pk: { columns: [table.planId, table.featureId] }
}]);

// Plan templates junction table  
export const planTemplates = pgTable("plan_templates", {
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: 'cascade' }).notNull(),
  templateId: varchar("template_id").references(() => globalTemplates.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [{
  pk: { columns: [table.planId, table.templateId] }
}]);

// User plans table (assigns plans to users with validity)
export const userPlans = pgTable("user_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: 'cascade' }).notNull(),
  startsAt: timestamp("starts_at").defaultNow(),
  endsAt: timestamp("ends_at"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Icon types table
export const iconTypes = pgTable("icon_types", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  type: iconTypeEnum("type").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Icon packs table
export const iconPacks = pgTable("icon_packs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Icons table
export const icons = pgTable("icons", {
  id: serial("id").primaryKey(),
  packId: varchar("pack_id").references(() => iconPacks.id, { onDelete: 'cascade' }).notNull(),
  typeId: integer("type_id").references(() => iconTypes.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name").notNull(),
  svg: text("svg").notNull(), // SVG content
  tags: jsonb("tags").default([]), // array of strings for search
  sort: integer("sort").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Links table (references to business cards for dashboard)
export const links = pgTable("links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  businessCardId: varchar("business_card_id").references(() => businessCards.id, { onDelete: 'cascade' }),
  title: varchar("title").notNull(),
  slug: varchar("slug").unique().notNull(),
  url: varchar("url").notNull(),
  clicksCount: integer("clicks_count").default(0),
  visitorsCount: integer("visitors_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// AFFILIATE SYSTEM TABLES

// Affiliates table (extends users with affiliate-specific data)
export const affiliates = pgTable("affiliates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  code: varchar("code").unique().notNull(), // Unique affiliate code (e.g., "JOHN123")
  
  // Basic info
  country: varchar("country").notNull(),
  website: varchar("website"),
  sourceInfo: text("source_info"), // How they found us
  
  // KYC and compliance
  kycStatus: kycStatusEnum("kyc_status").default('pending'),
  taxInfo: jsonb("tax_info"), // W-9/W-8BEN data
  kycDocuments: jsonb("kyc_documents"), // Document URLs/references
  kycSubmittedAt: timestamp("kyc_submitted_at"),
  kycApprovedAt: timestamp("kyc_approved_at"),
  
  // Payout settings
  payoutMethod: payoutMethodEnum("payout_method").default('stripe_connect'),
  payoutDetails: jsonb("payout_details"), // Stripe Connect account, PayPal email, etc.
  payoutVerificationStatus: varchar("payout_verification_status").default('pending'),
  minPayoutThreshold: integer("min_payout_threshold").default(5000), // $50.00 in cents
  
  // Status and settings
  status: affiliateStatusEnum("status").default('pending'),
  notes: text("notes"), // Admin notes
  attribution: attributionModeEnum("attribution").default('last_touch'),
  
  // Approval workflow
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  suspendedAt: timestamp("suspended_at"),
  suspensionReason: text("suspension_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_affiliates_user_id").on(table.userId),
  index("idx_affiliates_code").on(table.code),
  index("idx_affiliates_status").on(table.status),
]);

// Click tracking table
export const clicks = pgTable("clicks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id, { onDelete: 'cascade' }).notNull(),
  
  // Tracking data
  ip: varchar("ip"),
  userAgent: text("user_agent"),
  referrer: varchar("referrer"),
  fingerprint: varchar("fingerprint_hash"), // Device fingerprint for deduplication
  
  // UTM and custom parameters
  utmSource: varchar("utm_source"),
  utmMedium: varchar("utm_medium"),
  utmCampaign: varchar("utm_campaign"),
  utmContent: varchar("utm_content"),
  utmTerm: varchar("utm_term"),
  sub1: varchar("sub1"),
  sub2: varchar("sub2"),
  sub3: varchar("sub3"),
  sub4: varchar("sub4"),
  sub5: varchar("sub5"),
  
  // Location and device
  geoCountry: varchar("geo_country"),
  geoRegion: varchar("geo_region"),
  geoCity: varchar("geo_city"),
  landingPath: varchar("landing_path"),
  
  // Anti-fraud
  isBot: boolean("is_bot").default(false),
  vpnDetected: boolean("vpn_detected").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_clicks_affiliate_id").on(table.affiliateId),
  index("idx_clicks_created_at").on(table.createdAt),
  index("idx_clicks_fingerprint_time").on(table.fingerprint, table.createdAt),
]);

// Conversions table
export const conversions = pgTable("conversions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id, { onDelete: 'cascade' }).notNull(),
  
  // Order details
  orderId: varchar("order_id").unique().notNull(), // Stripe payment intent or order ID
  customerId: varchar("customer_id"), // Stripe customer ID
  customerHash: varchar("customer_hash"), // Hashed email for privacy
  
  // Financial details
  amount: integer("amount").notNull(), // Original amount in cents
  currency: varchar("currency").default('USD'),
  homeAmount: integer("home_amount").notNull(), // Amount in USD (home currency)
  homeCurrency: varchar("home_currency").default('USD'),
  fxRate: varchar("fx_rate"), // Exchange rate used for conversion
  
  // Commission calculation
  commissionAmount: integer("commission_amount").notNull(), // Commission in cents
  commissionRate: varchar("commission_rate"), // Rate used (e.g., "0.15" for 15%)
  holdbackAmount: integer("holdback_amount").default(0), // Amount held back
  
  // Plan and product info
  planId: integer("plan_id").references(() => subscriptionPlans.id),
  planType: planTypeEnum("plan_type"),
  
  // Status and lifecycle
  status: conversionStatusEnum("status").default('pending'),
  lockUntil: timestamp("lock_until"), // Lock period for refunds
  approvedAt: timestamp("approved_at"),
  reversedAt: timestamp("reversed_at"),
  reversalReason: text("reversal_reason"),
  
  // Attribution
  clickId: varchar("click_id").references(() => clicks.id),
  attributionData: jsonb("attribution_data"), // Full attribution chain
  
  // Metadata
  metadata: jsonb("metadata"), // Additional data (subscription details, etc.)
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commission rules table
export const commissionRules = pgTable("commission_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  
  // Rule scope
  scope: commissionScopeEnum("scope").notNull(), // global, plan, tier
  scopeValue: varchar("scope_value"), // plan ID, tier name, etc.
  
  // Commission details
  type: commissionTypeEnum("type").notNull(), // percentage, flat
  value: varchar("value").notNull(), // "0.15" for 15% or "1500" for $15.00
  recurringEnabled: boolean("recurring_enabled").default(false),
  recurringValue: varchar("recurring_value"), // Different rate for recurring payments
  
  // Validity
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
  
  // Settings
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0), // Higher number = higher priority
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Payouts table
export const payouts = pgTable("payouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id, { onDelete: 'cascade' }).notNull(),
  
  // Payout period
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Financial details
  amount: integer("amount").notNull(), // Amount in cents
  currency: varchar("currency").default('USD'),
  conversionCount: integer("conversion_count").default(0),
  
  // Payout method and reference
  method: payoutMethodEnum("method").notNull(),
  transactionRef: varchar("transaction_ref"), // Stripe transfer ID, PayPal transaction ID, etc.
  
  // Approval workflow (maker/checker)
  status: payoutStatusEnum("status").default('draft'),
  approvalState: jsonb("approval_state"), // Track who approved at each stage
  makerUserId: varchar("maker_user_id").references(() => users.id),
  checkerUserId: varchar("checker_user_id").references(() => users.id),
  
  // Processing details
  processedAt: timestamp("processed_at"),
  failureReason: text("failure_reason"),
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Immutable ledger for affiliate balances
export const balances = pgTable("balances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id, { onDelete: 'cascade' }).notNull(),
  
  // Transaction details
  delta: integer("delta").notNull(), // Amount change in cents (positive or negative)
  currency: varchar("currency").default('USD'),
  kind: balanceKindEnum("kind").notNull(), // credit, debit
  
  // Reference
  refType: balanceRefTypeEnum("ref_type").notNull(), // conversion, payout, adjustment, etc.
  refId: varchar("ref_id").notNull(), // ID of the referenced entity
  
  // Description and metadata
  description: text("description").notNull(),
  metadata: jsonb("metadata"),
  
  // Running balance (calculated)
  runningBalance: integer("running_balance").notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Enhanced coupons table for affiliate binding
export const affiliateCoupons = pgTable("affiliate_coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: 'cascade' }).notNull(),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id, { onDelete: 'cascade' }).notNull(),
  
  // Anti-leakage settings
  isExclusive: boolean("is_exclusive").default(false), // Only this affiliate gets credit
  channelLock: varchar("channel_lock"), // email, social, paid, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Risk flags table
export const riskFlags = pgTable("risk_flags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Target entity
  entityType: varchar("entity_type").notNull(), // click, conversion, affiliate
  entityId: varchar("entity_id").notNull(),
  
  // Flag details
  ruleCode: varchar("rule_code").notNull(), // Identifies which rule triggered
  severity: flagSeverityEnum("severity").notNull(),
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Additional context
  
  // Resolution
  isResolved: boolean("is_resolved").default(false),
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolvedAt: timestamp("resolved_at"),
  resolutionNotes: text("resolution_notes"),
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Disputes table
export const disputes = pgTable("disputes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversionId: varchar("conversion_id").references(() => conversions.id, { onDelete: 'cascade' }).notNull(),
  affiliateId: varchar("affiliate_id").references(() => affiliates.id, { onDelete: 'cascade' }).notNull(),
  
  // Dispute details
  status: disputeStatusEnum("status").default('open'),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence"), // URLs to uploaded evidence
  
  // Communication
  messages: jsonb("messages"), // Array of messages between affiliate and admin
  
  // Resolution
  resolvedBy: varchar("resolved_by").references(() => users.id),
  resolution: text("resolution"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Events outbox for webhooks and integrations
export const eventsOutbox = pgTable("events_outbox", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Event details
  eventType: varchar("event_type").notNull(), // affiliate.approved, conversion.approved, etc.
  payload: jsonb("payload").notNull(),
  
  // Delivery tracking
  status: eventStatusEnum("status").default('pending'),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(5),
  nextAttemptAt: timestamp("next_attempt_at"),
  lastError: text("last_error"),
  
  // Webhook details
  webhookUrl: varchar("webhook_url"),
  signature: varchar("signature"), // HMAC signature
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// FX rates table for multi-currency support
export const fxRates = pgTable("fx_rates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  baseCurrency: varchar("base_currency").notNull(),
  quoteCurrency: varchar("quote_currency").notNull(),
  rate: varchar("rate").notNull(), // Decimal as string for precision
  source: varchar("source").default('manual'), // manual, api, etc.
  
  createdAt: timestamp("created_at").defaultNow(),
});

// Asset library for marketing materials
export const marketingAssets = pgTable("marketing_assets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull(), // banner, logo, cta, etc.
  
  // Asset details
  assetUrl: varchar("asset_url").notNull(),
  assetType: varchar("asset_type").notNull(), // image, video, html
  dimensions: varchar("dimensions"), // 728x90, 300x250, etc.
  fileSize: integer("file_size"),
  
  // Tracking
  clickCount: integer("click_count").default(0),
  downloadCount: integer("download_count").default(0),
  
  // Settings
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Daily counters for analytics
export const countersDaily = pgTable("counters_daily", {
  day: varchar("day").notNull(), // YYYY-MM-DD format
  metric: varchar("metric").notNull(), // 'visits', 'clicks'
  value: integer("value").default(0),
  profileId: varchar("profile_id"), // references business card id
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }),
}, (table) => [
  index("idx_counters_daily_day").on(table.day),
  index("idx_counters_daily_metric").on(table.metric),
]);

// Database Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type UpsertUser = typeof users.$inferInsert;

// Affiliate system types
export type Affiliate = typeof affiliates.$inferSelect;
export type InsertAffiliate = typeof affiliates.$inferInsert;

export type Click = typeof clicks.$inferSelect;
export type InsertClick = typeof clicks.$inferInsert;

export type Conversion = typeof conversions.$inferSelect;
export type InsertConversion = typeof conversions.$inferInsert;

export type CommissionRule = typeof commissionRules.$inferSelect;
export type InsertCommissionRule = typeof commissionRules.$inferInsert;

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

export type Balance = typeof balances.$inferSelect;
export type InsertBalance = typeof balances.$inferInsert;

export type AffiliateCoupon = typeof affiliateCoupons.$inferSelect;
export type InsertAffiliateCoupon = typeof affiliateCoupons.$inferInsert;

export type RiskFlag = typeof riskFlags.$inferSelect;
export type InsertRiskFlag = typeof riskFlags.$inferInsert;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;

export type EventOutbox = typeof eventsOutbox.$inferSelect;
export type InsertEventOutbox = typeof eventsOutbox.$inferInsert;

export type FxRate = typeof fxRates.$inferSelect;
export type InsertFxRate = typeof fxRates.$inferInsert;

export type MarketingAsset = typeof marketingAssets.$inferSelect;
export type InsertMarketingAsset = typeof marketingAssets.$inferInsert;

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

// New admin dashboard types
export type Feature = typeof features.$inferSelect;
export type InsertFeature = typeof features.$inferInsert;

export type PlanFeature = typeof planFeatures.$inferSelect;
export type InsertPlanFeature = typeof planFeatures.$inferInsert;

export type PlanTemplate = typeof planTemplates.$inferSelect;
export type InsertPlanTemplate = typeof planTemplates.$inferInsert;

export type UserPlan = typeof userPlans.$inferSelect;
export type InsertUserPlan = typeof userPlans.$inferInsert;

export type IconType = typeof iconTypes.$inferSelect;
export type InsertIconType = typeof iconTypes.$inferInsert;

export type IconPack = typeof iconPacks.$inferSelect;
export type InsertIconPack = typeof iconPacks.$inferInsert;

export type Icon = typeof icons.$inferSelect;
export type InsertIcon = typeof icons.$inferInsert;

export type Link = typeof links.$inferSelect;
export type InsertLink = typeof links.$inferInsert;

export type CounterDaily = typeof countersDaily.$inferSelect;
export type InsertCounterDaily = typeof countersDaily.$inferInsert;

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

export type CouponUsage = typeof couponUsages.$inferSelect;
export type InsertCouponUsage = typeof couponUsages.$inferInsert;

// Zod schemas for database
export const insertUserSchema = createInsertSchema(users);
export const insertDbBusinessCardSchema = createInsertSchema(businessCards);
export const insertWalletPassSchema = createInsertSchema(walletPasses);
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

// New admin dashboard schemas
export const insertFeatureSchema = createInsertSchema(features);
export const insertPlanFeatureSchema = createInsertSchema(planFeatures);
export const insertPlanTemplateSchema = createInsertSchema(planTemplates);
export const insertUserPlanSchema = createInsertSchema(userPlans);
export const insertIconTypeSchema = createInsertSchema(iconTypes);
export const insertIconPackSchema = createInsertSchema(iconPacks);
export const insertIconSchema = createInsertSchema(icons);
export const insertLinkSchema = createInsertSchema(links);
export const insertCounterDailySchema = createInsertSchema(countersDaily);
export const insertCouponSchema = createInsertSchema(coupons);
export const insertCouponUsageSchema = createInsertSchema(couponUsages);

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

// Knowledge base documents table (vector column handled via raw SQL)
export const kbDocs = pgTable("kb_docs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  url: text("url").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  contentTokens: integer("content_tokens"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Header templates table for advanced header designs
export const headerTemplates = pgTable("header_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  category: varchar("category").notNull().default('general'),
  isActive: boolean("is_active").notNull().default(true),
  elements: jsonb("elements").notNull().default('[]'),
  globalStyles: jsonb("global_styles").notNull().default('{}'),
  layoutType: varchar("layout_type").notNull().default('standard'),
  advancedLayout: jsonb("advanced_layout").notNull().default('{}'),
  previewImage: text("preview_image"),
  usageCount: integer("usage_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type KbDoc = typeof kbDocs.$inferSelect;
export type InsertKbDoc = typeof kbDocs.$inferInsert;

export type HeaderTemplate = typeof headerTemplates.$inferSelect;
export type InsertHeaderTemplate = typeof headerTemplates.$inferInsert;

export const insertHeaderTemplateSchema = createInsertSchema(headerTemplates);

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
    size: z.number().default(200),
    frameStyle: z.enum(['none', 'rounded', 'corners']).default('none'),
    frameColor: z.string().default('#22c55e'),
    customLabel: z.boolean().default(false),
    labelText: z.string().default(''),
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
    fields: z.array(z.string()).default(["name", "email", "phone", "company", "message"]),
    receiverEmail: z.string().optional().default(""),
    emailNotifications: z.boolean().optional().default(true),
    autoReply: z.boolean().optional().default(false),
    fileAttachments: z.boolean().optional().default(false),
    spamProtection: z.boolean().optional().default(false),
    successMessage: z.string().optional().default("Thank you! We'll get back to you soon."),
    googleSheets: z.object({
      enabled: z.boolean().default(false),
      spreadsheetId: z.string().optional().default(""),
      sheetName: z.string().optional().default("Sheet1"),
    }).optional().default({ enabled: false, spreadsheetId: "", sheetName: "Sheet1" }),
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
    mapType: z.enum(["roadmap", "satellite"]).default("roadmap"),
    showMarker: z.boolean().default(true),
    height: z.number().default(300), // in pixels
    displayMode: z.enum(["map", "address"]).default("map"),
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

export const ragKnowledgeElementSchema = baseElementSchema.extend({
  type: z.literal("ragKnowledge"),
  data: z.object({
    title: z.string().default("Knowledge Base Assistant"),
    description: z.string().default("Advanced AI assistant with website knowledge ingestion"),
    knowledgeBase: z.object({
      textContent: z.string().optional(),
      websiteUrl: z.string().url().optional().or(z.literal("")),
      pdfFiles: z.array(z.object({
        id: z.string(),
        name: z.string(),
        content: z.string(), // extracted text content
        size: z.number().optional(),
        uploadedAt: z.date().optional(),
      })).default([]),
    }),
    showIngestForm: z.boolean().default(true),
    showChatBox: z.boolean().default(true),
    primaryColor: z.string().default("#22c55e"),
  }),
});

export const appleWalletElementSchema = baseElementSchema.extend({
  type: z.literal("appleWallet"),
  data: z.object({
    title: z.string().default("Add to Apple Wallet"),
    subtitle: z.string().default("Save this business card to your iPhone or Mac"),
    buttonStyle: z.enum(["default", "minimal", "full"]).default("default"),
    showIcon: z.boolean().default(true),
    customColor: z.string().default(""),
  }),
});

export const googleWalletElementSchema = baseElementSchema.extend({
  type: z.literal("googleWallet"),
  data: z.object({
    title: z.string().default("Add to Google Wallet"),
    subtitle: z.string().default("Save this business card to your Android phone"),
    buttonStyle: z.enum(["default", "minimal", "full"]).default("default"),
    showIcon: z.boolean().default(true),
    customColor: z.string().default(""),
  }),
});

export const digitalWalletElementSchema = baseElementSchema.extend({
  type: z.literal("digitalWallet"),
  data: z.object({
    title: z.string().default("Save to Digital Wallet"),
    subtitle: z.string().default("Add this business card to your phone's wallet"),
    layout: z.enum(["stacked", "columns"]).default("stacked"),
    showApple: z.boolean().default(true),
    showGoogle: z.boolean().default(true),
    showQRDownload: z.boolean().default(false),
    modernStyle: z.boolean().default(false),
    backgroundColor: z.string().default("#1e293b"),
    textColor: z.string().default("#ffffff"),
    fontFamily: z.string().default("Inter"),
    appleButtonColor: z.string().default("#000000"),
    googleButtonColor: z.string().default("#2563eb"),
    appleButtonText: z.string().default("Add to Apple Wallet"),
    googleButtonText: z.string().default("Add to Google Wallet"),
    qrButtonText: z.string().default("Download QR Code"),
    qrButtonColor: z.string().default("#000000"),
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
  ragKnowledgeElementSchema,
  appleWalletElementSchema,
  googleWalletElementSchema,
  digitalWalletElementSchema,
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
  
  // Branding & Colors
  brandColor: z.string().default("#22c55e"),
  secondaryColor: z.string().default("#999999"),
  tertiaryColor: z.string().default("#ffffff"),
  accentColor: z.string().default("#16a34a"),
  backgroundColor: z.string().default("#ffffff"),
  textColor: z.string().default("#374151"),
  headingColor: z.string().default("#000000"),
  paragraphColor: z.string().default("#000000"),
  
  // Typography
  font: z.enum([
    "inter", 
    "roboto", 
    "poppins",
    "work-sans",
    "playfair-display",
    "montserrat",
    "open-sans",
    "lato",
    "nunito",
    "source-sans-pro",
    "raleway",
    "ubuntu",
    "merriweather",
    "oswald",
    "pt-sans",
    "libre-baskerville",
    "crimson-text",
    "fira-sans",
    "noto-sans",
    "karla",
    "dm-sans",
    "mulish",
    "rubik",
    "outfit",
    "manrope",
    "space-grotesk",
    "plus-jakarta-sans",
    "lexend",
    "be-vietnam-pro",
    "public-sans",
    "commissioner",
    "epilogue",
    "satoshi",
    "cabinet-grotesk",
    "general-sans",
    "supreme",
    "gt-walsheim",
    "circular",
    "avenir-next",
    "helvetica-neue",
    "sf-pro",
    "system-ui",
    "times-new-roman",
    "georgia",
    "arial",
    "verdana",
    "trebuchet-ms",
    "impact",
    "comic-sans-ms",
    "outfit",
    "nunito-sans",
    "red-hat-display",
    "ibm-plex-sans",
    "figtree",
    "quicksand",
    "raleway",
    "montserrat",
    "source-sans-pro",
    "lato",
    "open-sans",
    "rubik"
  ]).default("inter"),
  template: z.enum(["minimal", "bold", "photo", "dark"]).default("minimal"),
  headerDesign: z.enum(["cover-logo", "profile-center", "split-design", "shape-divider"]).default("cover-logo"),
  
  // Shape Divider Header Configuration
  shapeDividerHeader: z.object({
    backgroundImage: z.string().optional(),
    backgroundColor: z.string().default('#22c55e'),
    height: z.number().default(200),
    topShape: z.object({
      enabled: z.boolean().default(false),
      position: z.literal('top'),
      shape: z.string().default('wave1'),
      color: z.string().default('#ffffff'),
      width: z.number().default(100),
      height: z.number().default(100),
      flip: z.boolean().default(false),
      bringToFront: z.boolean().default(false)
    }).optional(),
    bottomShape: z.object({
      enabled: z.boolean().default(false),
      position: z.literal('bottom'),
      shape: z.string().default('wave1'),
      color: z.string().default('#ffffff'),
      width: z.number().default(100),
      height: z.number().default(100),
      flip: z.boolean().default(false),
      bringToFront: z.boolean().default(false)
    }).optional(),
    elements: z.object({
      profilePic: z.object({
        visible: z.boolean().default(true),
        fontSize: z.number().default(16),
        fontWeight: z.number().default(400),
        color: z.string().default('#ffffff'),
        textAlign: z.enum(['left', 'center', 'right']).default('center'),
        marginTop: z.number().default(0),
        marginBottom: z.number().default(8),
        size: z.number().default(80),
        borderRadius: z.number().default(50),
        borderWidth: z.number().default(0),
        borderColor: z.string().default('#ffffff')
      }).default({
        visible: true, fontSize: 16, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 8, size: 80,
        borderRadius: 50, borderWidth: 0, borderColor: '#ffffff'
      }),
      logo: z.object({
        visible: z.boolean().default(false),
        fontSize: z.number().default(16),
        fontWeight: z.number().default(400),
        color: z.string().default('#ffffff'),
        textAlign: z.enum(['left', 'center', 'right']).default('center'),
        marginTop: z.number().default(0),
        marginBottom: z.number().default(0),
        size: z.number().default(40),
        position: z.enum(['top-left', 'top-right', 'center']).default('top-left')
      }).default({
        visible: false, fontSize: 16, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 0, size: 40,
        position: 'top-left'
      }),
      name: z.object({
        visible: z.boolean().default(true),
        fontSize: z.number().default(24),
        fontWeight: z.number().default(600),
        color: z.string().default('#ffffff'),
        textAlign: z.enum(['left', 'center', 'right']).default('center'),
        marginTop: z.number().default(0),
        marginBottom: z.number().default(4)
      }).default({
        visible: true, fontSize: 24, fontWeight: 600, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 4
      }),
      title: z.object({
        visible: z.boolean().default(true),
        fontSize: z.number().default(16),
        fontWeight: z.number().default(400),
        color: z.string().default('#ffffff'),
        textAlign: z.enum(['left', 'center', 'right']).default('center'),
        marginTop: z.number().default(0),
        marginBottom: z.number().default(2)
      }).default({
        visible: true, fontSize: 16, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 2
      }),
      company: z.object({
        visible: z.boolean().default(true),
        fontSize: z.number().default(14),
        fontWeight: z.number().default(400),
        color: z.string().default('#ffffff'),
        textAlign: z.enum(['left', 'center', 'right']).default('center'),
        marginTop: z.number().default(0),
        marginBottom: z.number().default(0)
      }).default({
        visible: true, fontSize: 14, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 0
      })
    }).default({
      profilePic: {
        visible: true, fontSize: 16, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 8, size: 80,
        borderRadius: 50, borderWidth: 0, borderColor: '#ffffff'
      },
      logo: {
        visible: false, fontSize: 16, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 0, size: 40,
        position: 'top-left'
      },
      name: {
        visible: true, fontSize: 24, fontWeight: 600, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 4
      },
      title: {
        visible: true, fontSize: 16, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 2
      },
      company: {
        visible: true, fontSize: 14, fontWeight: 400, color: '#ffffff',
        textAlign: 'center', marginTop: 0, marginBottom: 0
      }
    })
  }).optional(),
  
  // Additional Typography
  headingFont: z.string().default("inter"),
  paragraphFont: z.string().default("inter"),
  fontSize: z.number().default(16),
  headingFontSize: z.number().default(24),
  paragraphFontSize: z.number().default(14),
  fontWeight: z.number().default(400),
  headingFontWeight: z.number().default(600),
  paragraphFontWeight: z.number().default(400),
  
  // Design
  borderRadius: z.number().default(8),
  
  // Background options
  backgroundType: z.string().default("color"), // 'color', 'gradient', 'image'
  backgroundGradient: z.object({
    type: z.string().default("linear"),
    angle: z.number().default(90),
    colors: z.array(z.object({
      color: z.string(),
      position: z.number()
    })).default([
      { color: "#22c55e", position: 0 },
      { color: "#16a34a", position: 50 },
      { color: "#0d9488", position: 100 }
    ])
  }).optional(),
  
  // Animations
  animationType: z.string().default("none"), // 'none', 'fade', 'slide', 'bounce'
  animationDuration: z.number().default(500),
  
  // Section-Specific Styling
  sectionStyles: z.object({
    basicInfo: z.object({
      nameColor: z.string().optional(),
      titleColor: z.string().optional(),
      companyColor: z.string().optional(),
      nameFont: z.string().optional(),
      titleFont: z.string().optional(),
      companyFont: z.string().optional(),
      nameFontSize: z.number().optional(),
      titleFontSize: z.number().optional(),
      companyFontSize: z.number().optional(),
      nameFontWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      titleFontWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      companyFontWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      nameTextStyle: z.enum(['normal', 'italic']).optional(),
      titleTextStyle: z.enum(['normal', 'italic']).optional(),
      companyTextStyle: z.enum(['normal', 'italic']).optional(),
      sectionBackgroundColor: z.string().optional(),
      sectionBorderColor: z.string().optional(),
    }).default({}),
    contactInfo: z.object({
      iconColor: z.string().optional(),
      iconBackgroundColor: z.string().optional(),
      iconTextColor: z.string().optional(),
      iconTextFont: z.string().optional(),
      iconTextSize: z.number().optional(),
      iconTextWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      iconTextStyle: z.enum(['normal', 'italic']).optional(),
      sectionBackgroundColor: z.string().optional(),
      sectionBorderColor: z.string().optional(),
    }).default({}),
    socialMedia: z.object({
      iconColor: z.string().optional(),
      iconBackgroundColor: z.string().optional(),
      iconTextColor: z.string().optional(),
      iconTextFont: z.string().optional(),
      iconTextSize: z.number().optional(),
      iconTextWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      iconTextStyle: z.enum(['normal', 'italic']).optional(),
      sectionBackgroundColor: z.string().optional(),
      sectionBorderColor: z.string().optional(),
    }).default({}),
    about: z.object({
      primaryColor: z.string().optional(),
      headingColor: z.string().optional(),
      headingSize: z.number().optional(),
      headingWeight: z.number().optional(),
      paragraphColor: z.string().optional(),
      paragraphSize: z.number().optional(),
      paragraphWeight: z.number().optional(),
    }).default({}),
  }).default({
    basicInfo: {},
    contactInfo: {},
    socialMedia: {},
    about: {},
  }),
  
  // SEO Settings
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().optional(),
  keywords: z.array(z.string()).default([]),
  
  // Media (base64 encoded)
  profilePhoto: z.string().optional(),
  logo: z.string().optional(),
  backgroundImage: z.string().optional(),
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
