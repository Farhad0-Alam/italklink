import { z } from "zod";
import { sql } from 'drizzle-orm';
import { headerPresetSchema } from "../client/src/lib/header-schema";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// Database Enums
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due', 'incomplete']);
export const planTypeEnum = pgEnum('plan_type', ['free', 'paid', 'pro', 'enterprise']);
export const userRoleEnum = pgEnum('user_role', ['user', 'admin', 'super_admin', 'owner']);
export const teamRoleEnum = pgEnum('team_role', ['owner', 'admin', 'member']);
export const teamMemberStatusEnum = pgEnum('team_member_status', ['active', 'invited', 'suspended']);
export const frequencyEnum = pgEnum('frequency', ['monthly', 'yearly', 'custom']);
export const iconTypeEnum = pgEnum('icon_type', ['url', 'email', 'phone', 'whatsapp', 'text', 'connect']);
export const couponTypeEnum = pgEnum('coupon_type', ['percentage', 'fixed_amount']);
export const couponStatusEnum = pgEnum('coupon_status', ['active', 'inactive', 'expired']);

// Automation system enums
export const automationActionEnum = pgEnum('automation_action', ['crm_contact', 'email_sequence', 'lead_score', 'notification', 'google_sheet', 'webhook']);
export const crmProviderEnum = pgEnum('crm_provider', ['hubspot', 'salesforce', 'zoho', 'google_sheets', 'pipedrive', 'custom_webhook']);
export const leadPriorityEnum = pgEnum('lead_priority', ['low', 'medium', 'high', 'hot']);
export const automationStatusEnum = pgEnum('automation_status', ['active', 'paused', 'failed']);

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

// CRM system enums
export const lifecycleStageEnum = pgEnum('lifecycle_stage', ['visitor', 'lead', 'customer', 'evangelist', 'other']);
export const activityTypeEnum = pgEnum('activity_type', ['note', 'call', 'email', 'sms', 'meeting', 'task', 'page_view', 'button_click', 'form_submit', 'document_view', 'video_view', 'download']);
export const taskTypeEnum = pgEnum('task_type', ['call', 'email', 'follow_up', 'meeting', 'review', 'demo', 'proposal']);
export const taskStatusEnum = pgEnum('task_status', ['open', 'in_progress', 'done', 'cancelled']);
export const dealStatusEnum = pgEnum('deal_status', ['open', 'won', 'lost', 'abandoned']);

// Appointment booking system enums
export const appointmentStatusEnum = pgEnum('appointment_status', ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled']);
export const appointmentTypeEnum = pgEnum('appointment_type', ['consultation', 'demo', 'meeting', 'interview', 'sales_call', 'support', 'onboarding', 'training', 'custom']);
export const recurringPatternEnum = pgEnum('recurring_pattern', ['none', 'daily', 'weekly', 'monthly', 'yearly']);
export const notificationMethodEnum = pgEnum('notification_method', ['email', 'sms', 'push', 'webhook']);
export const notificationTriggerEnum = pgEnum('notification_trigger', ['booking_confirmed', 'reminder_24h', 'reminder_1h', 'appointment_start', 'appointment_cancelled', 'appointment_rescheduled', 'follow_up']);
export const availabilityTypeEnum = pgEnum('availability_type', ['available', 'busy', 'tentative', 'out_of_office']);
export const teamAssignmentEnum = pgEnum('team_assignment', ['round_robin', 'specific_member', 'any_available', 'most_available']);
export const calendarProviderEnum = pgEnum('calendar_provider', ['google', 'outlook', 'apple', 'ical', 'caldav']);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'paid', 'failed', 'refunded', 'partially_refunded']);
export const bufferTimeTypeEnum = pgEnum('buffer_time_type', ['before', 'after', 'both']);
export const weekdayEnum = pgEnum('weekday', ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

// Calendar and video meeting integration enums
export const videoMeetingProviderEnum = pgEnum('video_meeting_provider', ['zoom', 'google_meet', 'microsoft_teams', 'webex', 'gotomeeting', 'custom']);
export const calendarSyncStatusEnum = pgEnum('calendar_sync_status', ['pending', 'synced', 'failed', 'conflict', 'manual_review']);
export const meetingStatusEnum = pgEnum('meeting_status', ['created', 'started', 'ended', 'cancelled']);
export const integrationStatusEnum = pgEnum('integration_status', ['connected', 'disconnected', 'expired', 'error', 'revoked']);
export const conflictResolutionEnum = pgEnum('conflict_resolution', ['skip', 'overwrite', 'merge', 'manual']);
export const syncDirectionEnum = pgEnum('sync_direction', ['one_way_to_external', 'one_way_from_external', 'two_way']);

// QR Code system enums
export const deviceTypeEnum = pgEnum('device_type', ['mobile', 'desktop', 'tablet', 'bot']);
export const logoShapeEnum = pgEnum('logo_shape', ['circle', 'rectangle']);

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
  
  // Password reset fields
  resetToken: varchar("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  
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
  discount: integer("discount").default(0), // Discount percentage for yearly plans
  currency: varchar("currency").default('usd'),
  interval: varchar("interval").notNull(), // keep existing for compatibility
  businessCardsLimit: integer("business_cards_limit").notNull(),
  features: jsonb("features").notNull(), // array of feature strings - keep for compatibility
  stripePriceId: varchar("stripe_price_id"),
  isActive: boolean("is_active").default(true),
  // New admin dashboard fields
  cardLabel: varchar("card_label"), // "Card Number" label string from admin
  trialDays: integer("trial_days").default(0),
  // Template limits
  templateLimit: integer("template_limit").default(-1), // -1 for unlimited, number for limit
  // Custom pricing card features
  pricingFeatures: jsonb("pricing_features").default([]), // [{ name: "Professional Templates", description: "Access to premium card designs" }]
  // Per-user/per-card pricing fields
  baseUsers: integer("base_users").default(1), // Number of users/cards included in base price
  pricePerUser: integer("price_per_user").default(0), // Additional cost per user/card in cents
  setupFee: integer("setup_fee").default(0), // One-time setup fee in cents
  
  // User selection controls
  allowUserSelection: boolean("allow_user_selection").default(false), // Show user count selector
  minUsers: integer("min_users").default(1), // Minimum selectable users
  maxUsers: integer("max_users"), // Maximum selectable users (null = unlimited)
  
  // Comprehensive feature controls (stored in features jsonb for backward compatibility)
  // Structure: {
  //   analytics: boolean,
  //   crm: boolean,
  //   crmContactsLimit: number (-1 = unlimited),
  //   appointments: boolean,
  //   appointmentLimit: number (-1 = unlimited),
  //   emailSignature: boolean,
  //   bulkGeneration: boolean,
  //   customDomain: boolean,
  //   apiAccess: boolean,
  //   visitorNotifications: boolean,
  //   prioritySupport: boolean,
  //   whiteLabel: boolean
  // }
  
  description: text("description"), // Plan description for customers
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
  profileImageStyles: jsonb("profile_image_styles"), // {visible, size, shape, border, animation, shadow, opacity, positionX, positionY}
  logo: text("logo"), // base64
  coverImageStyles: jsonb("cover_image_styles"), // {height, borderWidth, borderColor, animation, opacity, gradient, shapeDivider: {enabled, preset, position, color, width, height, invert, bringToFront}}
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

// Card subscriptions table (for visitor notifications)
export const cardSubscriptions = pgTable("card_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").references(() => businessCards.id, { onDelete: 'cascade' }).notNull(),
  
  // Subscriber info
  email: varchar("email").notNull(),
  name: varchar("name"),
  
  // Push notification subscription (browser push)
  pushSubscription: jsonb("push_subscription"), // Web Push API subscription object
  
  // Subscription management
  isActive: boolean("is_active").default(true),
  unsubscribeToken: varchar("unsubscribe_token").unique().notNull(),
  
  // Timestamps
  subscribedAt: timestamp("subscribed_at").defaultNow(),
  unsubscribedAt: timestamp("unsubscribed_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_card_subscriptions_card").on(table.cardId),
  index("idx_card_subscriptions_email").on(table.email),
  index("idx_card_subscriptions_active").on(table.isActive),
  index("idx_card_subscriptions_token").on(table.unsubscribeToken),
]);

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

// Bios table - User professional bios linked to their profile
export const bios = pgTable("bios", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // Bio content
  role: varchar("role"), // Job title/role
  company: varchar("company"),
  bio: text("bio"), // Professional bio/about text
  tags: jsonb("tags").default([]), // Skills, interests, expertise tags
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_bios_user").on(table.userId),
]);

// Connections table - Track card interactions and scans
export const connections = pgTable("connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(), // Card owner
  targetUserId: varchar("target_user_id").references(() => users.id, { onDelete: 'cascade' }), // Person who clicked/scanned (if known)
  cardId: varchar("card_id").references(() => businessCards.id, { onDelete: 'cascade' }),
  
  // Interaction details
  platform: varchar("platform"), // web, mobile, qr, nfc, etc.
  eventType: varchar("event_type").default('view'), // view, click, save, share
  
  // Metadata
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  location: varchar("location"), // Geo location if available
  referrer: varchar("referrer"),
  
  clickedAt: timestamp("clicked_at").defaultNow(),
}, (table) => [
  index("idx_connections_user").on(table.userId),
  index("idx_connections_card").on(table.cardId),
  index("idx_connections_date").on(table.clickedAt),
]);

// Subscriptions table - Detailed subscription management separate from users table
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: 'set null' }),
  
  // Subscription details
  status: subscriptionStatusEnum("status").default('active'),
  
  // Stripe integration
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripePriceId: varchar("stripe_price_id"),
  
  // Dates
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  canceledAt: timestamp("canceled_at"),
  trialEndsAt: timestamp("trial_ends_at"),
  
  // Billing
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_subscriptions_user").on(table.userId),
  index("idx_subscriptions_status").on(table.status),
  index("idx_subscriptions_stripe").on(table.stripeSubscriptionId),
]);

// Analytics table - Aggregate analytics for digital cards
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cardId: varchar("card_id").references(() => businessCards.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Metrics
  pageViews: integer("page_views").default(0),
  linkClicks: integer("link_clicks").default(0),
  uniqueVisitors: integer("unique_visitors").default(0),
  qrScans: integer("qr_scans").default(0),
  vcardDownloads: integer("vcard_downloads").default(0),
  
  // Time tracking
  lastVisitedAt: timestamp("last_visited_at"),
  
  // Period tracking (for daily/weekly/monthly aggregates)
  periodType: varchar("period_type").default('all_time'), // all_time, daily, weekly, monthly
  periodStart: timestamp("period_start"),
  periodEnd: timestamp("period_end"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_card_analytics_card").on(table.cardId),
  index("idx_card_analytics_user").on(table.userId),
  index("idx_card_analytics_period").on(table.periodType, table.periodStart),
]);

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
  icon: varchar("icon"), // lucide-react icon name, e.g. "Check", "Palette", "BarChart"
  createdAt: timestamp("created_at").defaultNow(),
});

// Plan features junction table
export const planFeatures = pgTable("plan_features", {
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: 'cascade' }).notNull(),
  featureId: integer("feature_id").references(() => features.id, { onDelete: 'cascade' }).notNull(),
  isIncluded: boolean("is_included").default(true).notNull(), // true = checkmark, false = cross
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

// User subscriptions table (tracks active subscriptions with quantity and payment details)
export const userSubscriptions = pgTable("user_subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: 'set null' }),
  couponId: varchar("coupon_id").references(() => coupons.id, { onDelete: 'set null' }),
  
  // Subscription details
  stripeSubscriptionId: varchar("stripe_subscription_id").unique(),
  stripeCustomerId: varchar("stripe_customer_id"),
  userCount: integer("user_count").default(1).notNull(), // Number of users/cards purchased
  pricePaid: integer("price_paid").notNull(), // Actual amount paid in cents
  
  // Feature snapshot (preserves features even if plan changes)
  features: jsonb("features").default('{}').notNull(), // Snapshot of plan features at time of purchase
  
  // Subscription period
  startDate: timestamp("start_date").defaultNow().notNull(),
  endDate: timestamp("end_date"), // null for active subscriptions, set on cancellation
  cancelAt: timestamp("cancel_at"), // Scheduled cancellation date
  canceledAt: timestamp("canceled_at"), // When user canceled
  
  // Status
  isActive: boolean("is_active").default(true).notNull(),
  status: varchar("status").default('active'), // active, canceled, past_due, etc.
  
  // Metadata
  metadata: jsonb("metadata").default('{}'), // Additional data from Stripe
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export type Bio = typeof bios.$inferSelect;
export type InsertBio = typeof bios.$inferInsert;

export type Connection = typeof connections.$inferSelect;
export type InsertConnection = typeof connections.$inferInsert;

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = typeof analytics.$inferInsert;

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

export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type InsertUserSubscription = typeof userSubscriptions.$inferInsert;

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
export const insertBioSchema = createInsertSchema(bios);
export const insertConnectionSchema = createInsertSchema(connections);
export const insertSubscriptionSchema = createInsertSchema(subscriptions);
export const insertAnalyticsSchema = createInsertSchema(analytics);
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
export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions);
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

// ===== APPOINTMENT BOOKING VALIDATION SCHEMAS =====

// Event Type Creation/Update Schema
export const createEventTypeSchema = z.object({
  name: z.string().min(1, 'Event type name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  slug: z.string().min(1, 'URL slug is required').max(50, 'Slug too long').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  type: z.enum(['consultation', 'demo', 'meeting', 'interview', 'sales_call', 'support', 'onboarding', 'training', 'custom']).default('consultation'),
  duration: z.number().min(15, 'Minimum duration is 15 minutes').max(480, 'Maximum duration is 8 hours'),
  bufferTimeBefore: z.number().min(0).max(120).default(0),
  bufferTimeAfter: z.number().min(0).max(120).default(0),
  maxBookingsPerDay: z.number().min(1).max(50).optional(),
  minNoticeTime: z.number().min(0).default(60), // minutes
  maxAdvanceTime: z.number().min(1440).default(43200), // minutes (at least 1 day, max 30 days)
  availableWeekdays: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'])).min(1, 'At least one weekday required'),
  timeSlots: z.array(z.object({
    weekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)')
  })).default([]),
  timezone: z.string().default('UTC'),
  requireEmail: z.boolean().default(true),
  requirePhone: z.boolean().default(false),
  requireCompany: z.boolean().default(false),
  isPaid: z.boolean().default(false),
  price: z.number().min(0).optional(), // in cents
  currency: z.string().length(3).default('usd'),
  crmPipelineId: z.string().uuid().optional(),
  crmStageId: z.string().uuid().optional(),
  autoCreateDeal: z.boolean().default(false),
  dealValue: z.number().min(0).optional(), // in cents
  brandColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color').default('#22c55e'),
  welcomeMessage: z.string().max(1000).optional(),
  thankYouMessage: z.string().max(1000).optional(),
  isActive: z.boolean().default(true),
  isPublic: z.boolean().default(true),
});

export const updateEventTypeSchema = createEventTypeSchema.partial();

// Appointment Booking Schema  
export const bookAppointmentSchema = z.object({
  eventTypeId: z.string().uuid('Valid event type required'),
  startTime: z.string().datetime('Valid start time required'),
  attendeeName: z.string().min(1, 'Attendee name is required').max(100, 'Name too long'),
  attendeeEmail: z.string().email('Valid email address required'),
  attendeePhone: z.string().max(20).optional(),
  attendeeCompany: z.string().max(100).optional(),
  attendeeTimezone: z.string().optional(),
  description: z.string().max(1000).optional(),
  customFormData: z.record(z.any()).default({}),
  utmParams: z.object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
    term: z.string().optional(),
    content: z.string().optional(),
  }).optional(),
  referrer: z.string().optional(),
  location: z.string().max(500).optional(),
  meetingUrl: z.string().url().optional(),
});

// Appointment Reschedule Schema
export const rescheduleAppointmentSchema = z.object({
  newStartTime: z.string().datetime('Valid start time required'),
  reason: z.string().max(500).optional(),
  notifyAttendee: z.boolean().default(true),
});

// Appointment Cancellation Schema
export const cancelAppointmentSchema = z.object({
  reason: z.string().max(500).optional(),
  cancelledBy: z.enum(['attendee', 'host', 'system']),
  notifyAttendee: z.boolean().default(true),
  refundPayment: z.boolean().default(false),
});

// Availability Schedule Schema
export const createAvailabilitySchema = z.object({
  eventTypeId: z.string().uuid().optional(),
  weekday: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  timezone: z.string().default('UTC'),
  type: z.enum(['available', 'busy', 'tentative', 'out_of_office']).default('available'),
  effectiveFrom: z.string().datetime().optional(),
  effectiveTo: z.string().datetime().optional(),
  isOverride: z.boolean().default(false),
  overrideDate: z.string().datetime().optional(),
});

// Blackout Date Schema
export const createBlackoutDateSchema = z.object({
  eventTypeId: z.string().uuid().optional(),
  startDate: z.string().datetime('Valid start date required'),
  endDate: z.string().datetime('Valid end date required'),
  isAllDay: z.boolean().default(true),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(500).optional(),
  type: z.string().default('time_off'),
  isRecurring: z.boolean().default(false),
  recurringPattern: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  recurringEndDate: z.string().datetime().optional(),
});

// Calendar Integration Schema
export const createCalendarIntegrationSchema = z.object({
  provider: z.enum(['google', 'outlook', 'apple', 'ical', 'caldav']),
  calendarId: z.string().min(1, 'Calendar ID is required'),
  calendarName: z.string().max(100).optional(),
  syncConflicts: z.boolean().default(true),
  createEvents: z.boolean().default(true),
  updateEvents: z.boolean().default(true),
  deleteEvents: z.boolean().default(false),
  isPrimary: z.boolean().default(false),
});

// Booking Form Template Schema
export const createBookingFormSchema = z.object({
  name: z.string().min(1, 'Form name is required').max(100),
  description: z.string().max(500).optional(),
  fields: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'textarea', 'select', 'checkbox', 'radio', 'email', 'phone', 'url', 'number']),
    label: z.string().min(1, 'Field label is required'),
    placeholder: z.string().optional(),
    required: z.boolean().default(false),
    options: z.array(z.object({
      value: z.string(),
      label: z.string()
    })).optional(),
    validation: z.object({
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
      pattern: z.string().optional(),
      min: z.number().optional(),
      max: z.number().optional(),
    }).optional(),
  })).default([]),
  theme: z.object({
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#22c55e'),
    backgroundColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#ffffff'),
    textColor: z.string().regex(/^#[0-9A-F]{6}$/i).default('#374151'),
    borderRadius: z.number().min(0).max(50).default(8),
    fontFamily: z.string().default('Inter'),
  }).default({}),
});

// Appointment Filter/Search Schema
export const appointmentFiltersSchema = z.object({
  status: z.array(z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'rescheduled'])).optional(),
  eventTypeId: z.string().uuid().optional(),
  attendeeEmail: z.string().email().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  assignedUserId: z.string().uuid().optional(),
  crmContactId: z.string().uuid().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['startTime', 'createdAt', 'status', 'attendeeName']).default('startTime'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Appointment Analytics Query Schema
export const appointmentAnalyticsSchema = z.object({
  eventTypeId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  granularity: z.enum(['day', 'week', 'month']).default('day'),
  metrics: z.array(z.enum(['bookings', 'revenue', 'conversion_rate', 'cancellation_rate', 'no_show_rate'])).default(['bookings']),
});

// Type exports for the custom schemas
export type CreateEventType = z.infer<typeof createEventTypeSchema>;
export type UpdateEventType = z.infer<typeof updateEventTypeSchema>;
export type BookAppointment = z.infer<typeof bookAppointmentSchema>;
export type RescheduleAppointment = z.infer<typeof rescheduleAppointmentSchema>;
export type CancelAppointment = z.infer<typeof cancelAppointmentSchema>;
export type CreateAvailability = z.infer<typeof createAvailabilitySchema>;
export type CreateBlackoutDate = z.infer<typeof createBlackoutDateSchema>;
export type CreateCalendarIntegration = z.infer<typeof createCalendarIntegrationSchema>;
export type CreateBookingForm = z.infer<typeof createBookingFormSchema>;
export type AppointmentFilters = z.infer<typeof appointmentFiltersSchema>;
export type AppointmentAnalyticsQuery = z.infer<typeof appointmentAnalyticsSchema>;

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

// Button interaction tracking for automation
export const buttonInteractions = pgTable("button_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Reference data
  cardId: varchar("card_id").references(() => businessCards.id, { onDelete: 'cascade' }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  elementId: varchar("element_id").notNull(), // Page element ID
  
  // Interaction details
  interactionType: varchar("interaction_type").notNull(), // 'click', 'view', 'download'
  buttonLabel: varchar("button_label").notNull(),
  buttonAction: varchar("button_action").notNull(), // 'link', 'call', 'email', 'download'
  targetValue: text("target_value"), // URL, phone, email address
  
  // Visitor information
  visitorIp: varchar("visitor_ip"),
  visitorUserAgent: text("visitor_user_agent"),
  visitorLocation: jsonb("visitor_location"), // {country, city, region}
  visitorDevice: varchar("visitor_device"), // mobile, desktop, tablet
  referrer: text("referrer"),
  
  // Context data
  sessionId: varchar("session_id"),
  leadScore: integer("lead_score").default(10), // Points assigned to this interaction
  leadPriority: leadPriorityEnum("lead_priority").default('medium'),
  
  // Automation tracking
  automationsTriggered: jsonb("automations_triggered").default('[]'), // Array of automation IDs
  crmSynced: boolean("crm_synced").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_button_interactions_card_id").on(table.cardId),
  index("idx_button_interactions_user_id").on(table.userId),
  index("idx_button_interactions_created_at").on(table.createdAt),
]);

// CRM and automation configurations per user
export const automationConfigs = pgTable("automation_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // User association
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull().unique(),
  
  // CRM integrations
  crmConnections: jsonb("crm_connections").default('[]'), // Array of CRM configs
  /*
  Example CRM connection:
  {
    provider: 'hubspot',
    status: 'active',
    apiKey: 'encrypted_key',
    config: { portalId: '12345', defaultPipeline: 'sales' },
    lastSyncAt: '2024-01-01T00:00:00Z'
  }
  */
  
  // Default automation settings
  defaultLeadScore: integer("default_lead_score").default(10),
  autoLeadCapture: boolean("auto_lead_capture").default(true),
  smartNotifications: boolean("smart_notifications").default(true),
  
  // Button-specific automations
  buttonAutomations: jsonb("button_automations").default('{}'),
  /*
  Example button automation:
  {
    "call-button": {
      actions: ['crm_contact', 'lead_score', 'notification'],
      leadScore: 25,
      crmFields: { source: 'digital_card', status: 'new' }
    }
  }
  */
  
  // Analytics preferences
  analyticsEnabled: boolean("analytics_enabled").default(true),
  weeklyReports: boolean("weekly_reports").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead scoring and behavior analysis
export const leadProfiles = pgTable("lead_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Identification
  visitorFingerprint: varchar("visitor_fingerprint").notNull(), // Unique visitor identifier
  cardId: varchar("card_id").references(() => businessCards.id, { onDelete: 'cascade' }).notNull(),
  cardOwnerId: varchar("card_owner_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Contact information (when captured)
  email: varchar("email"),
  phone: varchar("phone"),
  name: varchar("name"),
  company: varchar("company"),
  
  // Behavioral data
  totalInteractions: integer("total_interactions").default(0),
  totalSessions: integer("total_sessions").default(0),
  lastSessionDuration: integer("last_session_duration"), // in seconds
  avgSessionDuration: integer("avg_session_duration"), // in seconds
  
  // Lead scoring
  leadScore: integer("lead_score").default(0),
  leadPriority: leadPriorityEnum("lead_priority").default('low'),
  engagementLevel: varchar("engagement_level").default('cold'), // cold, warm, hot
  
  // Behavioral patterns
  preferredInteractionTime: varchar("preferred_interaction_time"), // morning, afternoon, evening
  devicePreference: varchar("device_preference"), // mobile, desktop
  behaviorTags: jsonb("behavior_tags").default('[]'), // ['repeat_visitor', 'quick_engager', 'info_seeker']
  
  // Geographic data
  location: jsonb("location"), // Latest location data
  timezone: varchar("timezone"),
  
  // CRM integration
  crmContactId: varchar("crm_contact_id"), // ID in external CRM
  crmProvider: crmProviderEnum("crm_provider"),
  lastCrmSync: timestamp("last_crm_sync"),
  
  firstSeenAt: timestamp("first_seen_at").defaultNow(),
  lastSeenAt: timestamp("last_seen_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_lead_profiles_fingerprint").on(table.visitorFingerprint),
  index("idx_lead_profiles_card_id").on(table.cardId),
  index("idx_lead_profiles_lead_score").on(table.leadScore),
]);

// CRM SYSTEM TABLES

// CRM Contacts table
export const crmContacts = pgTable("crm_contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Basic contact info
  email: varchar("email"),
  phone: varchar("phone"),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  company: varchar("company"),
  jobTitle: varchar("job_title"),
  website: varchar("website"),
  
  // Contact metadata
  source: varchar("source"), // 'business_card', 'form', 'import', 'manual'
  tags: jsonb("tags").default('[]'), // Array of tag strings
  notes: text("notes"),
  
  // Lead scoring and qualification
  leadScore: integer("lead_score").default(0),
  leadPriority: leadPriorityEnum("lead_priority").default('low'),
  lifecycleStage: lifecycleStageEnum("lifecycle_stage").default('visitor'),
  
  // Communication preferences
  consentEmail: boolean("consent_email").default(false),
  consentSms: boolean("consent_sms").default(false),
  
  // Contact merge/deduplication
  mergedFrom: jsonb("merged_from").default('[]'), // Array of previous contact IDs
  
  // Location and social
  location: varchar("location"),
  timezone: varchar("timezone"),
  linkedin: varchar("linkedin"),
  twitter: varchar("twitter"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_crm_contacts_owner").on(table.ownerUserId),
  index("idx_crm_contacts_email").on(table.email),
  index("idx_crm_contacts_lead_score").on(table.leadScore),
]);

// CRM Activities table
export const crmActivities = pgTable("crm_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: varchar("contact_id").references(() => crmContacts.id, { onDelete: 'cascade' }).notNull(),
  
  // Activity details
  type: activityTypeEnum("type").notNull(),
  title: varchar("title").notNull(),
  description: text("description"),
  payload: jsonb("payload"), // Additional activity-specific data
  
  // Timing
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  
  // Attribution
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_crm_activities_contact").on(table.contactId),
  index("idx_crm_activities_type").on(table.type),
  index("idx_crm_activities_created_at").on(table.createdAt),
]);

// CRM Tasks table
export const crmTasks = pgTable("crm_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  contactId: varchar("contact_id").references(() => crmContacts.id, { onDelete: 'cascade' }).notNull(),
  
  // Task details
  title: varchar("title").notNull(),
  description: text("description"),
  type: taskTypeEnum("type").notNull(),
  status: taskStatusEnum("status").default('open'),
  priority: leadPriorityEnum("priority").default('medium'),
  
  // Timing
  dueAt: timestamp("due_at"),
  completedAt: timestamp("completed_at"),
  
  // Assignment
  assignedTo: varchar("assigned_to").references(() => users.id, { onDelete: 'set null' }),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_crm_tasks_contact").on(table.contactId),
  index("idx_crm_tasks_assigned_to").on(table.assignedTo),
  index("idx_crm_tasks_status").on(table.status),
  index("idx_crm_tasks_due_at").on(table.dueAt),
]);

// CRM Pipelines table
export const crmPipelines = pgTable("crm_pipelines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  name: varchar("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_crm_pipelines_owner").on(table.ownerUserId),
]);

// CRM Stages table
export const crmStages = pgTable("crm_stages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pipelineId: varchar("pipeline_id").references(() => crmPipelines.id, { onDelete: 'cascade' }).notNull(),
  
  name: varchar("name").notNull(),
  description: text("description"),
  order: integer("order").notNull(),
  
  // Stage characteristics
  isClosedWon: boolean("is_closed_won").default(false),
  isClosedLost: boolean("is_closed_lost").default(false),
  probability: integer("probability").default(0), // 0-100 percentage
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_crm_stages_pipeline").on(table.pipelineId),
  index("idx_crm_stages_order").on(table.order),
]);

// CRM Deals table
export const crmDeals = pgTable("crm_deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  pipelineId: varchar("pipeline_id").references(() => crmPipelines.id, { onDelete: 'cascade' }).notNull(),
  stageId: varchar("stage_id").references(() => crmStages.id, { onDelete: 'cascade' }).notNull(),
  primaryContactId: varchar("primary_contact_id").references(() => crmContacts.id, { onDelete: 'cascade' }),
  
  // Deal details
  title: varchar("title").notNull(),
  description: text("description"),
  value: integer("value"), // Amount in cents
  currency: varchar("currency").default('usd'),
  
  // Deal status and timing
  status: dealStatusEnum("status").default('open'),
  probability: integer("probability").default(0), // 0-100 percentage
  expectedCloseDate: timestamp("expected_close_date"),
  actualCloseDate: timestamp("actual_close_date"),
  
  // Ownership
  ownerUserId: varchar("owner_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_crm_deals_pipeline").on(table.pipelineId),
  index("idx_crm_deals_stage").on(table.stageId),
  index("idx_crm_deals_contact").on(table.primaryContactId),
  index("idx_crm_deals_owner").on(table.ownerUserId),
  index("idx_crm_deals_status").on(table.status),
]);

// CRM Sequences table (for email/SMS automation)
export const crmSequences = pgTable("crm_sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  name: varchar("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  
  // Sequence configuration
  steps: jsonb("steps").notNull().default('[]'), // Array of sequence steps
  /*
  Example step:
  {
    id: 'step-1',
    type: 'email',
    delay: 3600, // seconds
    templateId: 'template-id',
    subject: 'Follow up email',
    body: 'Email content...',
    conditions: { stage: 'lead' }
  }
  */
  
  // Enrollment triggers
  enrollmentTrigger: jsonb("enrollment_trigger").default('{}'),
  /*
  Example trigger:
  {
    type: 'contact_created',
    conditions: { source: 'business_card', leadScore: { min: 10 } }
  }
  */
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_crm_sequences_owner").on(table.ownerUserId),
  index("idx_crm_sequences_active").on(table.isActive),
]);

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  name: varchar("name").notNull(),
  subject: varchar("subject").notNull(),
  body: text("body").notNull(),
  
  // Template variables and metadata
  variables: jsonb("variables").default('[]'), // Array of variable names used in template
  /*
  Example variables:
  ['firstName', 'lastName', 'company', 'customField1']
  */
  
  // Template categories and organization
  category: varchar("category").default('general'), // 'welcome', 'follow_up', 'promotion', etc.
  tags: jsonb("tags").default('[]'),
  
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_email_templates_owner").on(table.ownerUserId),
  index("idx_email_templates_category").on(table.category),
]);

// ===== APPOINTMENT BOOKING SYSTEM =====

// Event Types table (appointment types configuration)
export const appointmentEventTypes = pgTable("appointment_event_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Basic event type info
  name: varchar("name").notNull(),
  description: text("description"),
  slug: varchar("slug").notNull(),
  
  // Scheduling settings
  duration: integer("duration").notNull().default(30), // in minutes
  price: integer("price").default(0), // in cents 
  currency: varchar("currency").default('USD'),
  meetingLocation: varchar("meeting_location"),
  brandColor: varchar("brand_color").default('#3B82F6'),
  instructionsBeforeEvent: text("instructions_before_event"),
  instructionsAfterEvent: text("instructions_after_event"),
  requiresConfirmation: boolean("requires_confirmation").default(false),
  bufferTimeBefore: integer("buffer_time_before").default(0), // in minutes
  bufferTimeAfter: integer("buffer_time_after").default(0), // in minutes
  
  // Status and metadata
  isActive: boolean("is_active").default(true),
  isPublic: boolean("is_public").default(false),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_event_types_user").on(table.userId),
  index("idx_event_types_slug").on(table.slug),
  index("idx_event_types_active").on(table.isActive),
  index("idx_event_types_public").on(table.isPublic),
]);

// Team member availability schedules (matches existing DB structure)
export const teamMemberAvailability = pgTable("team_member_availability", {
  id: varchar("id").primaryKey(),
  teamMemberId: varchar("team_member_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("start_time").notNull(), // time without time zone
  endTime: time("end_time").notNull(), // time without time zone
  isAvailable: boolean("is_available").default(true),
  timezone: varchar("timezone").default('UTC'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Blackout dates and time-off
export const blackoutDates = pgTable("blackout_dates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  eventTypeId: varchar("event_type_id").references(() => appointmentEventTypes.id, { onDelete: 'cascade' }),
  
  // Date range
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isAllDay: boolean("is_all_day").default(true),
  
  // Time-specific blackout (if not all day)
  startTime: varchar("start_time"), // HH:MM format
  endTime: varchar("end_time"), // HH:MM format
  
  // Blackout details
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").default('time_off'), // 'time_off', 'holiday', 'meeting', 'personal'
  
  // Recurring blackouts
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: recurringPatternEnum("recurring_pattern").default('none'),
  recurringEndDate: timestamp("recurring_end_date"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_blackout_user").on(table.userId),
  index("idx_blackout_event_type").on(table.eventTypeId),
  index("idx_blackout_dates").on(table.startDate, table.endDate),
]);

// Main appointments table
export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventTypeId: varchar("event_type_id").references(() => appointmentEventTypes.id, { onDelete: 'cascade' }).notNull(),
  hostUserId: varchar("host_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  assignedUserId: varchar("assigned_user_id").references(() => users.id, { onDelete: 'set null' }),
  
  // CRM Integration
  crmContactId: varchar("crm_contact_id").references(() => crmContacts.id, { onDelete: 'set null' }),
  crmDealId: varchar("crm_deal_id").references(() => crmDeals.id, { onDelete: 'set null' }),
  
  // Appointment timing
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  timezone: varchar("timezone").notNull(),
  duration: integer("duration").notNull(), // in minutes
  
  // Attendee information
  attendeeName: varchar("attendee_name").notNull(),
  attendeeEmail: varchar("attendee_email").notNull(),
  attendeePhone: varchar("attendee_phone"),
  attendeeCompany: varchar("attendee_company"),
  attendeeTimezone: varchar("attendee_timezone"),
  
  // Custom form responses
  customFormData: jsonb("custom_form_data").default('{}'),
  /*
  Example:
  {
    "company_size": "11-50",
    "budget_range": "$10k-$50k",
    "specific_needs": "Looking for CRM integration"
  }
  */
  
  // Appointment details
  title: varchar("title").notNull(),
  description: text("description"),
  location: text("location"), // meeting room, video link, address
  meetingUrl: text("meeting_url"), // Zoom, Google Meet, etc.
  meetingPassword: varchar("meeting_password"),
  
  // Status and tracking
  status: appointmentStatusEnum("status").default('scheduled'),
  confirmationToken: varchar("confirmation_token").unique(),
  rescheduleToken: varchar("reschedule_token").unique(),
  cancellationToken: varchar("cancellation_token").unique(),
  
  // Booking metadata
  bookingSource: varchar("booking_source").default('direct'), // 'direct', 'embedded', 'api'
  referrer: text("referrer"),
  utmParams: jsonb("utm_params").default('{}'),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  
  // Rescheduling history
  isRescheduled: boolean("is_rescheduled").default(false),
  originalAppointmentId: varchar("original_appointment_id").references(() => appointments.id),
  rescheduleReason: text("reschedule_reason"),
  rescheduleCount: integer("reschedule_count").default(0),
  
  // Cancellation details
  cancellationReason: text("cancellation_reason"),
  cancelledBy: varchar("cancelled_by"), // 'attendee', 'host', 'system'
  cancelledAt: timestamp("cancelled_at"),
  
  // No-show tracking
  noShowReason: text("no_show_reason"),
  markedNoShowAt: timestamp("marked_no_show_at"),
  markedNoShowBy: varchar("marked_no_show_by").references(() => users.id),
  
  // Follow-up and notes
  hostNotes: text("host_notes"),
  attendeeNotes: text("attendee_notes"),
  internalNotes: text("internal_notes"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpCompleted: boolean("follow_up_completed").default(false),
  
  // Recurring appointment details
  recurringGroupId: varchar("recurring_group_id"), // groups related recurring appointments
  isRecurring: boolean("is_recurring").default(false),
  recurringPattern: recurringPatternEnum("recurring_pattern").default('none'),
  recurringEndDate: timestamp("recurring_end_date"),
  recurringIndex: integer("recurring_index"), // 1st, 2nd, 3rd occurrence
  
  // External calendar integration
  externalCalendarEventIds: jsonb("external_calendar_event_ids").default('{}'),
  /*
  Example:
  {
    "google": "event_id_123",
    "outlook": "event_id_456"
  }
  */
  
  // Automation and webhooks
  automationsTriggered: jsonb("automations_triggered").default('[]'), // Array of automation IDs
  webhooksSent: jsonb("webhooks_sent").default('[]'), // Array of webhook delivery IDs
  
  // Analytics and scoring
  leadScore: integer("lead_score").default(0),
  leadPriority: leadPriorityEnum("lead_priority").default('medium'),
  conversionValue: integer("conversion_value"), // estimated value in cents
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_appointments_event_type").on(table.eventTypeId),
  index("idx_appointments_host").on(table.hostUserId),
  index("idx_appointments_assigned").on(table.assignedUserId),
  index("idx_appointments_contact").on(table.crmContactId),
  index("idx_appointments_deal").on(table.crmDealId),
  index("idx_appointments_start_time").on(table.startTime),
  index("idx_appointments_status").on(table.status),
  index("idx_appointments_attendee_email").on(table.attendeeEmail),
  index("idx_appointments_recurring_group").on(table.recurringGroupId),
  index("idx_appointments_created_at").on(table.createdAt),
]);

// Appointment notifications and reminders
export const appointmentNotifications = pgTable("appointment_notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }).notNull(),
  
  // Notification details
  type: notificationTriggerEnum("type").notNull(),
  method: notificationMethodEnum("method").notNull(),
  recipient: varchar("recipient").notNull(), // email or phone number
  
  // Timing
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  
  // Content
  subject: varchar("subject"),
  message: text("message"),
  templateId: varchar("template_id").references(() => emailTemplates.id),
  
  // Delivery tracking
  status: eventStatusEnum("status").default('pending'),
  deliveryAttempts: integer("delivery_attempts").default(0),
  lastAttemptAt: timestamp("last_attempt_at"),
  errorMessage: text("error_message"),
  
  // External service tracking
  externalId: varchar("external_id"), // Sendgrid, Twilio, etc.
  webhookData: jsonb("webhook_data"), // delivery confirmation data
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_notifications_appointment").on(table.appointmentId),
  index("idx_notifications_scheduled").on(table.scheduledFor),
  index("idx_notifications_status").on(table.status),
  index("idx_notifications_type").on(table.type),
]);

// Appointment payments
export const appointmentPayments = pgTable("appointment_payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }).notNull(),
  
  // Payment details
  amount: integer("amount").notNull(), // in cents
  currency: varchar("currency").default('usd'),
  status: paymentStatusEnum("status").default('pending'),
  
  // Payment provider integration
  stripePaymentIntentId: varchar("stripe_payment_intent_id"),
  stripeChargeId: varchar("stripe_charge_id"),
  paypalTransactionId: varchar("paypal_transaction_id"),
  
  // Payment metadata
  paymentMethod: varchar("payment_method"), // 'card', 'bank_transfer', 'paypal'
  lastFourDigits: varchar("last_four_digits"),
  cardBrand: varchar("card_brand"),
  
  // Refund tracking
  refundAmount: integer("refund_amount").default(0),
  refundReason: text("refund_reason"),
  refundedAt: timestamp("refunded_at"),
  refundedBy: varchar("refunded_by").references(() => users.id),
  
  // Billing information
  billingName: varchar("billing_name"),
  billingEmail: varchar("billing_email"),
  billingAddress: jsonb("billing_address"),
  
  // Payment processing
  processingFee: integer("processing_fee"), // in cents
  netAmount: integer("net_amount"), // amount after fees, in cents
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_payments_appointment").on(table.appointmentId),
  index("idx_payments_status").on(table.status),
  index("idx_payments_stripe_intent").on(table.stripePaymentIntentId),
]);

// Calendar integrations for external sync
export const calendarIntegrations = pgTable("calendar_integrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Integration details
  provider: calendarProviderEnum("provider").notNull(),
  calendarId: varchar("calendar_id").notNull(), // external calendar ID
  calendarName: varchar("calendar_name"),
  
  // Access credentials (encrypted)
  accessToken: text("access_token"), // encrypted OAuth token
  refreshToken: text("refresh_token"), // encrypted refresh token
  tokenExpiresAt: timestamp("token_expires_at"),
  
  // Sync settings
  syncConflicts: boolean("sync_conflicts").default(true),
  createEvents: boolean("create_events").default(true),
  updateEvents: boolean("update_events").default(true),
  deleteEvents: boolean("delete_events").default(false),
  
  // Sync status
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: varchar("last_sync_status").default('pending'), // 'success', 'failed', 'pending'
  lastSyncError: text("last_sync_error"),
  
  // Settings
  isActive: boolean("is_active").default(true),
  isPrimary: boolean("is_primary").default(false), // primary calendar for conflict checking
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_calendar_integrations_user").on(table.userId),
  index("idx_calendar_integrations_provider").on(table.provider),
  index("idx_calendar_integrations_active").on(table.isActive),
]);

// Calendar connections for comprehensive OAuth management
export const calendarConnections = pgTable("calendar_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Connection details
  provider: calendarProviderEnum("provider").notNull(),
  providerAccountId: varchar("provider_account_id"), // User's account ID at provider
  providerEmail: varchar("provider_email"), // Email associated with the provider account
  
  // OAuth tokens (encrypted)
  accessToken: text("access_token"), // encrypted access token
  refreshToken: text("refresh_token"), // encrypted refresh token
  idToken: text("id_token"), // encrypted ID token (for OpenID Connect)
  tokenType: varchar("token_type").default('Bearer'),
  scope: text("scope"), // granted scopes
  tokenExpiresAt: timestamp("token_expires_at"),
  
  // Connection metadata
  status: integrationStatusEnum("status").default('connected'),
  lastConnectionTest: timestamp("last_connection_test"),
  connectionTestResult: text("connection_test_result"), // Last test result/error
  
  // Sync settings
  syncDirection: syncDirectionEnum("sync_direction").default('two_way'),
  autoSync: boolean("auto_sync").default(true),
  syncConflictResolution: conflictResolutionEnum("sync_conflict_resolution").default('manual'),
  
  // Selected calendars (JSON array of calendar IDs to sync)
  selectedCalendars: jsonb("selected_calendars").default('[]'),
  /*
  Example:
  [
    {
      id: "primary",
      name: "John Doe",
      isPrimary: true,
      isSelected: true
    },
    {
      id: "calendar_id_123",
      name: "Work Calendar",
      isPrimary: false,
      isSelected: true
    }
  ]
  */
  
  // Sync status tracking
  lastSyncAt: timestamp("last_sync_at"),
  lastSyncStatus: calendarSyncStatusEnum("last_sync_status").default('pending'),
  lastSyncError: text("last_sync_error"),
  nextSyncAt: timestamp("next_sync_at"),
  
  // Provider-specific settings
  providerSettings: jsonb("provider_settings").default('{}'),
  /*
  Example for Google:
  {
    timeZone: "America/New_York",
    colorId: "3",
    sendNotifications: true,
    sendUpdates: "all"
  }
  */
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_calendar_connections_user").on(table.userId),
  index("idx_calendar_connections_provider").on(table.provider),
  index("idx_calendar_connections_status").on(table.status),
  index("idx_calendar_connections_sync_at").on(table.lastSyncAt),
]);

// Video meeting providers for Zoom, Google Meet, Teams integration
export const videoMeetingProviders = pgTable("video_meeting_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Provider details
  provider: videoMeetingProviderEnum("provider").notNull(),
  providerAccountId: varchar("provider_account_id"), // User ID at the provider
  providerEmail: varchar("provider_email"), // Email associated with provider account
  
  // OAuth tokens (encrypted)
  accessToken: text("access_token"), // encrypted access token
  refreshToken: text("refresh_token"), // encrypted refresh token
  tokenType: varchar("token_type").default('Bearer'),
  scope: text("scope"), // granted scopes
  tokenExpiresAt: timestamp("token_expires_at"),
  
  // Provider status
  status: integrationStatusEnum("status").default('connected'),
  lastConnectionTest: timestamp("last_connection_test"),
  connectionTestResult: text("connection_test_result"),
  
  // Default settings for this provider
  isDefaultProvider: boolean("is_default_provider").default(false),
  
  // Meeting creation settings
  defaultSettings: jsonb("default_settings").default('{}'),
  /*
  Example for Zoom:
  {
    waitingRoom: true,
    requirePassword: true,
    allowJoinBeforeHost: false,
    muteUponEntry: true,
    autoRecording: "cloud",
    meetingAuthentication: false
  }
  */
  
  // Usage limits and quotas
  monthlyMeetingCount: integer("monthly_meeting_count").default(0),
  meetingQuotaLimit: integer("meeting_quota_limit"), // null = unlimited
  lastQuotaReset: timestamp("last_quota_reset"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_video_providers_user").on(table.userId),
  index("idx_video_providers_provider").on(table.provider),
  index("idx_video_providers_status").on(table.status),
  index("idx_video_providers_default").on(table.isDefaultProvider),
]);

// External calendar events for tracking synced events
export const externalCalendarEvents = pgTable("external_calendar_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }).notNull(),
  calendarConnectionId: varchar("calendar_connection_id").references(() => calendarConnections.id, { onDelete: 'cascade' }).notNull(),
  
  // External event identification
  externalEventId: varchar("external_event_id").notNull(), // Event ID in the external calendar
  externalCalendarId: varchar("external_calendar_id").notNull(), // Calendar ID in the external system
  
  // Event metadata
  title: varchar("title").notNull(),
  description: text("description"),
  location: text("location"),
  
  // Timing
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  timezone: varchar("timezone"),
  isAllDay: boolean("is_all_day").default(false),
  
  // Sync tracking
  syncStatus: calendarSyncStatusEnum("sync_status").default('synced'),
  lastSyncAt: timestamp("last_sync_at").defaultNow(),
  syncVersion: integer("sync_version").default(1), // Version for conflict resolution
  
  // External event metadata
  externalEventData: jsonb("external_event_data").default('{}'),
  /*
  Example:
  {
    etag: "\"3456789012345\"",
    htmlLink: "https://calendar.google.com/event?eid=xyz",
    hangoutLink: "https://meet.google.com/xyz-abc-def",
    conferenceData: { ... },
    attendees: [...],
    recurrence: ["RRULE:FREQ=WEEKLY;COUNT=10"]
  }
  */
  
  // Conflict resolution
  hasConflict: boolean("has_conflict").default(false),
  conflictDetails: jsonb("conflict_details").default('{}'),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_external_events_appointment").on(table.appointmentId),
  index("idx_external_events_calendar_connection").on(table.calendarConnectionId),
  index("idx_external_events_external_id").on(table.externalEventId),
  index("idx_external_events_sync_status").on(table.syncStatus),
  index("idx_external_events_start_time").on(table.startTime),
]);

// Meeting links and video meeting management
export const meetingLinks = pgTable("meeting_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appointmentId: varchar("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }).notNull(),
  videoMeetingProviderId: varchar("video_meeting_provider_id").references(() => videoMeetingProviders.id, { onDelete: 'cascade' }).notNull(),
  
  // Meeting identification
  externalMeetingId: varchar("external_meeting_id").notNull(), // Meeting ID at the provider
  meetingNumber: varchar("meeting_number"), // Zoom meeting number, Teams meeting ID
  
  // Meeting access details
  joinUrl: text("join_url").notNull(),
  hostUrl: text("host_url"), // Host-specific join URL
  meetingPassword: varchar("meeting_password"), // encrypted password
  dialInNumbers: jsonb("dial_in_numbers").default('[]'), // Array of phone numbers
  
  // Meeting settings
  meetingSettings: jsonb("meeting_settings").default('{}'),
  /*
  Example:
  {
    waitingRoom: true,
    requirePassword: true,
    allowJoinBeforeHost: false,
    muteUponEntry: true,
    autoRecording: "cloud",
    recordingConsent: true
  }
  */
  
  // Meeting status and lifecycle
  meetingStatus: meetingStatusEnum("meeting_status").default('created'),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  
  // Participants tracking
  participantCount: integer("participant_count").default(0),
  maxParticipants: integer("max_participants"),
  participantData: jsonb("participant_data").default('[]'),
  
  // Recording information
  recordingUrls: jsonb("recording_urls").default('[]'),
  /*
  Example:
  [
    {
      type: "video",
      url: "https://zoom.us/rec/share/xyz",
      downloadUrl: "https://zoom.us/rec/download/xyz",
      playUrl: "https://zoom.us/rec/play/xyz",
      fileSize: 1234567,
      recordingStart: "2023-01-01T10:00:00Z",
      recordingEnd: "2023-01-01T11:00:00Z"
    }
  ]
  */
  
  // Security and access control
  accessCode: varchar("access_code"), // Custom access code for meetings
  waitingRoomEnabled: boolean("waiting_room_enabled").default(true),
  isLocked: boolean("is_locked").default(false),
  
  // External provider metadata
  providerData: jsonb("provider_data").default('{}'), // Raw data from provider API
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_meeting_links_appointment").on(table.appointmentId),
  index("idx_meeting_links_provider").on(table.videoMeetingProviderId),
  index("idx_meeting_links_external_id").on(table.externalMeetingId),
  index("idx_meeting_links_status").on(table.meetingStatus),
  index("idx_meeting_links_start_time").on(table.actualStartTime),
]);

// Integration audit logs for tracking sync operations and debugging
export const integrationLogs = pgTable("integration_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Integration context
  integrationType: varchar("integration_type").notNull(), // 'calendar', 'video_meeting'
  provider: varchar("provider").notNull(), // google, zoom, microsoft, etc.
  connectionId: varchar("connection_id").references(() => calendarConnections.id), // calendarConnectionId or videoMeetingProviderId
  
  // Operation details
  operation: varchar("operation").notNull(), // 'sync', 'create', 'update', 'delete', 'auth'
  resourceType: varchar("resource_type"), // 'event', 'meeting', 'calendar', 'token'
  resourceId: varchar("resource_id"), // appointment ID, meeting ID, etc.
  
  // Operation status
  status: varchar("status").notNull(), // 'success', 'failure', 'partial'
  errorCode: varchar("error_code"),
  errorMessage: text("error_message"),
  
  // Request/Response data
  requestPayload: jsonb("request_payload"),
  responsePayload: jsonb("response_payload"),
  
  // Performance metrics
  duration: integer("duration"), // milliseconds
  retryCount: integer("retry_count").default(0),
  
  // Additional metadata
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address"),
  apiVersion: varchar("api_version"),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_integration_logs_user").on(table.userId),
  index("idx_integration_logs_type_provider").on(table.integrationType, table.provider),
  index("idx_integration_logs_status").on(table.status),
  index("idx_integration_logs_created_at").on(table.createdAt),
  index("idx_integration_logs_operation").on(table.operation),
]);

// Booking form templates
export const bookingFormTemplates = pgTable("booking_form_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Template details
  name: varchar("name").notNull(),
  description: text("description"),
  
  // Form configuration
  fields: jsonb("fields").notNull().default('[]'), // Array of form field definitions
  /*
  Example field:
  {
    id: "company_size",
    type: "select",
    label: "Company Size",
    placeholder: "Select your company size",
    required: true,
    options: [
      { value: "1-10", label: "1-10 employees" },
      { value: "11-50", label: "11-50 employees" },
      { value: "51-200", label: "51-200 employees" },
      { value: "200+", label: "200+ employees" }
    ],
    validation: {
      minLength: null,
      maxLength: null,
      pattern: null
    }
  }
  */
  
  // Form styling
  theme: jsonb("theme").default('{}'), // Form styling configuration
  /*
  Example theme:
  {
    primaryColor: "#22c55e",
    backgroundColor: "#ffffff",
    textColor: "#374151",
    borderRadius: 8,
    fontFamily: "Inter"
  }
  */
  
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_booking_forms_user").on(table.userId),
  index("idx_booking_forms_active").on(table.isActive),
]);

// Appointment analytics and metrics
export const appointmentAnalytics = pgTable("appointment_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  eventTypeId: varchar("event_type_id").references(() => appointmentEventTypes.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Date for aggregation
  date: timestamp("date").notNull(), // date for daily metrics
  
  // Booking metrics
  totalBookings: integer("total_bookings").default(0),
  confirmedBookings: integer("confirmed_bookings").default(0),
  completedBookings: integer("completed_bookings").default(0),
  cancelledBookings: integer("cancelled_bookings").default(0),
  noShowBookings: integer("no_show_bookings").default(0),
  rescheduledBookings: integer("rescheduled_bookings").default(0),
  
  // Revenue metrics
  totalRevenue: integer("total_revenue").default(0), // in cents
  paidBookings: integer("paid_bookings").default(0),
  refundedAmount: integer("refunded_amount").default(0), // in cents
  
  // Conversion metrics
  pageViews: integer("page_views").default(0),
  conversionRate: integer("conversion_rate").default(0), // percentage * 100
  
  // Lead quality metrics
  avgLeadScore: integer("avg_lead_score").default(0),
  highPriorityLeads: integer("high_priority_leads").default(0),
  
  // Time metrics
  avgBookingNotice: integer("avg_booking_notice").default(0), // in hours
  avgReschedulingTime: integer("avg_rescheduling_time").default(0), // in hours
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_analytics_event_type").on(table.eventTypeId),
  index("idx_analytics_user").on(table.userId),
  index("idx_analytics_date").on(table.date),
]);

// ===== APPOINTMENT BOOKING VALIDATION SCHEMAS =====

// Appointment booking validation schemas
export const insertAppointmentEventTypeSchema = createInsertSchema(appointmentEventTypes);
export const insertTeamMemberAvailabilitySchema = createInsertSchema(teamMemberAvailability);
export const insertBlackoutDateSchema = createInsertSchema(blackoutDates);
export const insertAppointmentSchema = createInsertSchema(appointments);
export const insertAppointmentNotificationSchema = createInsertSchema(appointmentNotifications);
export const insertAppointmentPaymentSchema = createInsertSchema(appointmentPayments);
export const insertCalendarIntegrationSchema = createInsertSchema(calendarIntegrations);
export const insertBookingFormTemplateSchema = createInsertSchema(bookingFormTemplates);
export const insertAppointmentAnalyticsSchema = createInsertSchema(appointmentAnalytics);

// ===== AUTOMATION WORKFLOW SYSTEM =====

// Main Automations table (workflow definitions)
export const automations = pgTable("automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerUserId: varchar("owner_user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Basic information
  name: varchar("name").notNull(),
  description: text("description"),
  
  // Workflow configuration
  triggers: jsonb("triggers").notNull(), // Array of trigger objects
  conditions: jsonb("conditions").default('[]'), // Array of condition objects
  actions: jsonb("actions").notNull(), // Array of action objects
  
  // Settings
  enabled: boolean("enabled").default(true),
  
  // Metadata
  lastTriggered: timestamp("last_triggered"),
  totalRuns: integer("total_runs").default(0),
  successfulRuns: integer("successful_runs").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_automations_owner").on(table.ownerUserId),
  index("idx_automations_enabled").on(table.enabled),
]);

// Automation execution logs
export const automationRuns = pgTable("automation_runs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  automationId: varchar("automation_id").references(() => automations.id, { onDelete: 'cascade' }).notNull(),
  
  // Execution details
  triggerEvent: varchar("trigger_event").notNull(), // e.g., 'lead.created', 'task.overdue'
  triggerPayload: jsonb("trigger_payload"), // The data that triggered this run
  
  // Execution status
  status: varchar("status").notNull(), // 'success', 'failed', 'pending', 'partial'
  startedAt: timestamp("started_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  
  // Logs and results
  executionLog: jsonb("execution_log").default('[]'), // Array of step execution logs
  errorMessage: text("error_message"),
  
  // Results
  actionsExecuted: integer("actions_executed").default(0),
  actionsFailed: integer("actions_failed").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_automation_runs_automation").on(table.automationId),
  index("idx_automation_runs_status").on(table.status),
  index("idx_automation_runs_trigger").on(table.triggerEvent),
]);

export type KbDoc = typeof kbDocs.$inferSelect;
export type InsertKbDoc = typeof kbDocs.$inferInsert;

export type HeaderTemplate = typeof headerTemplates.$inferSelect;
export type InsertHeaderTemplate = typeof headerTemplates.$inferInsert;

// Automation system types
export type ButtonInteraction = typeof buttonInteractions.$inferSelect;
export type InsertButtonInteraction = typeof buttonInteractions.$inferInsert;

export type AutomationConfig = typeof automationConfigs.$inferSelect;
export type InsertAutomationConfig = typeof automationConfigs.$inferInsert;

export type LeadProfile = typeof leadProfiles.$inferSelect;
export type InsertLeadProfile = typeof leadProfiles.$inferInsert;

// CRM System Types
export type CrmContact = typeof crmContacts.$inferSelect;
export type InsertCrmContact = typeof crmContacts.$inferInsert;

export type CrmActivity = typeof crmActivities.$inferSelect;
export type InsertCrmActivity = typeof crmActivities.$inferInsert;

export type CrmTask = typeof crmTasks.$inferSelect;
export type InsertCrmTask = typeof crmTasks.$inferInsert;

export type CrmPipeline = typeof crmPipelines.$inferSelect;
export type InsertCrmPipeline = typeof crmPipelines.$inferInsert;

export type CrmStage = typeof crmStages.$inferSelect;
export type InsertCrmStage = typeof crmStages.$inferInsert;

export type CrmDeal = typeof crmDeals.$inferSelect;
export type InsertCrmDeal = typeof crmDeals.$inferInsert;

export type CrmSequence = typeof crmSequences.$inferSelect;
export type InsertCrmSequence = typeof crmSequences.$inferInsert;

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

// Appointment Booking System Types
export type AppointmentEventType = typeof appointmentEventTypes.$inferSelect;
export type InsertAppointmentEventType = typeof appointmentEventTypes.$inferInsert;

export type TeamMemberAvailability = typeof teamMemberAvailability.$inferSelect;
export type InsertTeamMemberAvailability = typeof teamMemberAvailability.$inferInsert;

export type BlackoutDate = typeof blackoutDates.$inferSelect;
export type InsertBlackoutDate = typeof blackoutDates.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

export type AppointmentNotification = typeof appointmentNotifications.$inferSelect;
export type InsertAppointmentNotification = typeof appointmentNotifications.$inferInsert;

export type AppointmentPayment = typeof appointmentPayments.$inferSelect;
export type InsertAppointmentPayment = typeof appointmentPayments.$inferInsert;

export type CalendarIntegration = typeof calendarIntegrations.$inferSelect;
export type InsertCalendarIntegration = typeof calendarIntegrations.$inferInsert;

export type BookingFormTemplate = typeof bookingFormTemplates.$inferSelect;
export type InsertBookingFormTemplate = typeof bookingFormTemplates.$inferInsert;

export type AppointmentAnalytics = typeof appointmentAnalytics.$inferSelect;
export type InsertAppointmentAnalytics = typeof appointmentAnalytics.$inferInsert;

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;

export type AutomationRun = typeof automationRuns.$inferSelect;
export type InsertAutomationRun = typeof automationRuns.$inferInsert;

export const insertHeaderTemplateSchema = createInsertSchema(headerTemplates);
export const insertButtonInteractionSchema = createInsertSchema(buttonInteractions);
export const insertAutomationConfigSchema = createInsertSchema(automationConfigs);
export const insertLeadProfileSchema = createInsertSchema(leadProfiles);

// CRM System Schemas
export const insertCrmContactSchema = createInsertSchema(crmContacts);
export const insertCrmActivitySchema = createInsertSchema(crmActivities);
export const insertCrmTaskSchema = createInsertSchema(crmTasks);
export const insertCrmPipelineSchema = createInsertSchema(crmPipelines);
export const insertCrmStageSchema = createInsertSchema(crmStages);
export const insertCrmDealSchema = createInsertSchema(crmDeals);
export const insertCrmSequenceSchema = createInsertSchema(crmSequences);
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates);
export const insertAutomationSchema = createInsertSchema(automations);
export const insertAutomationRunSchema = createInsertSchema(automationRuns);

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
    color: z.string().optional(),
  }),
});

export const paragraphElementSchema = baseElementSchema.extend({
  type: z.literal("paragraph"),
  data: z.object({
    text: z.string(),
    alignment: z.enum(["left", "center", "right"]).default("left"),
    color: z.string().optional(),
  }),
});

export const linkElementSchema = baseElementSchema.extend({
  type: z.literal("link"),
  data: z.object({
    text: z.string(),
    url: z.string(),
    style: z.enum(["button", "text"]).default("button"),
    buttonBgColor: z.string().optional(),
    buttonTextColor: z.string().optional(),
    buttonBorderColor: z.string().optional(),
    buttonIcon: z.string().optional(),
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
    titleColor: z.string().optional(),
    contentColor: z.string().optional(),
    borderColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    shadowIntensity: z.number().optional(),
    titleFontSize: z.number().optional(),
    contentFontSize: z.number().optional(),
    borderWidth: z.number().optional(),
    shape: z.enum(["rounded", "square", "circle"]).optional(),
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
      type: z.enum(["phone", "email", "website", "text", "other"]).optional().default("other"),
    })).default([]),
    // Icon Styling
    iconColor: z.string().optional().default("#9333ea"),
    iconSize: z.number().optional().default(20),
    iconBgColor: z.string().optional().default("transparent"),
    iconBorderColor: z.string().optional().default("transparent"),
    iconBorderSize: z.number().optional().default(0),
    iconBgSize: z.number().optional().default(40),
    view: z.enum(['icon-text', 'text-only', 'icon-only']).optional().default('icon-text'),
    size: z.enum(['small', 'medium', 'large']).optional().default('medium'),
    shape: z.enum(['circle', 'square', 'rounded', 'auto']).optional().default('circle'),
    alignment: z.enum(['left', 'center', 'right', 'justified']).optional().default('center'),
    showLabel: z.boolean().optional().default(true),
    iconWidth: z.number().optional().default(40),
    iconHeight: z.number().optional().default(40),
    // Advanced Layout Options
    skin: z.enum(['gradient', 'minimal', 'framed', 'boxed', 'flat']).optional().default('minimal'),
    columns: z.union([z.enum(['auto']), z.number().min(1).max(6)]).optional().default('auto'),
    textPosition: z.enum(['left', 'right', 'top', 'bottom']).optional().default('right'),
    // Hover Effects
    hoverColor: z.string().optional(),
    enableHoverColor: z.boolean().optional().default(false),
    iconHoverColor: z.string().optional().default("#a855f7"),
    bgHoverColor: z.string().optional().default("#4c1d95"),
    // Font Styling
    fontFamily: z.string().optional().default("inherit"),
    fontSize: z.number().optional().default(16),
    fontWeight: z.number().optional().default(400),
    fontStyle: z.enum(['normal', 'italic', 'oblique']).optional().default('normal'),
    textColor: z.string().optional().default("#000000"),
    // Drop Shadow
    shadowColor: z.string().optional().default("#000000"),
    shadowBlur: z.number().optional().default(10),
    shadowOffsetX: z.number().optional().default(0),
    shadowOffsetY: z.number().optional().default(2),
    shadowOpacity: z.number().optional().default(25),
    // Layout
    gap: z.number().optional(),
    // Outer Container Styling (wraps all icons together)
    outerContainer: z.object({
      enabled: z.boolean().optional().default(false),
      background: z.string().optional().default("#ffffff"),
      borderColor: z.string().optional().default("#e5e7eb"),
      borderWidth: z.number().optional().default(1),
      borderRadius: z.number().optional().default(8),
      padding: z.number().optional().default(16),
      width: z.string().optional().default("100%"),
      height: z.string().optional().default("auto"),
      shadowEnabled: z.boolean().optional().default(false),
      shadowColor: z.string().optional().default("#000000"),
      shadowOpacity: z.number().optional().default(10),
      shadowBlur: z.number().optional().default(10),
      shadowOffsetX: z.number().optional().default(0),
      shadowOffsetY: z.number().optional().default(4),
    }).optional().default({}),
    // Individual Icon Container Styling (each icon separately)
    iconContainer: z.object({
      enabled: z.boolean().optional().default(false),
      background: z.string().optional().default("#ffffff"),
      borderColor: z.string().optional().default("#e5e7eb"),
      borderWidth: z.number().optional().default(1),
      borderRadius: z.number().optional().default(8),
      padding: z.number().optional().default(16),
      shadowEnabled: z.boolean().optional().default(false),
      shadowColor: z.string().optional().default("#000000"),
      shadowOpacity: z.number().optional().default(10),
      shadowBlur: z.number().optional().default(10),
      shadowOffsetX: z.number().optional().default(0),
      shadowOffsetY: z.number().optional().default(4),
    }).optional().default({}),
    // Enable label to match icon skin styling
    enableLabelSkin: z.boolean().optional().default(false),
  }),
});

export const socialSectionElementSchema = baseElementSchema.extend({
  type: z.literal("socialSection"),
  data: z.object({
    socials: z.array(z.object({
      id: z.string(),
      label: z.string(),
      url: z.string(),
      icon: z.string(),
      platform: z.string()
    })).default([]),
    // Icon Styling
    iconColor: z.string().optional().default("#9333ea"),
    iconSize: z.number().optional().default(20),
    iconBgColor: z.string().optional().default("transparent"),
    iconBorderColor: z.string().optional().default("transparent"),
    iconBorderSize: z.number().optional().default(0),
    iconBgSize: z.number().optional().default(40),
    view: z.enum(['icon-text', 'text-only', 'icon-only']).optional().default('icon-text'),
    size: z.enum(['small', 'medium', 'large']).optional().default('medium'),
    shape: z.enum(['circle', 'square', 'rounded', 'auto']).optional().default('circle'),
    alignment: z.enum(['left', 'center', 'right', 'justified']).optional().default('center'),
    showLabel: z.boolean().optional().default(true),
    iconWidth: z.number().optional().default(40),
    iconHeight: z.number().optional().default(40),
    // Advanced Layout Options
    skin: z.enum(['gradient', 'minimal', 'framed', 'boxed', 'flat']).optional().default('minimal'),
    columns: z.union([z.enum(['auto']), z.number().min(1).max(6)]).optional().default('auto'),
    textPosition: z.enum(['left', 'right', 'top', 'bottom']).optional().default('right'),
    // Hover Effects
    hoverColor: z.string().optional(),
    enableHoverColor: z.boolean().optional().default(false),
    iconHoverColor: z.string().optional().default("#a855f7"),
    bgHoverColor: z.string().optional().default("#4c1d95"),
    // Font Styling
    fontFamily: z.string().optional().default("inherit"),
    fontSize: z.number().optional().default(16),
    fontWeight: z.number().optional().default(400),
    fontStyle: z.enum(['normal', 'italic', 'oblique']).optional().default('normal'),
    textColor: z.string().optional().default("#000000"),
    // Drop Shadow
    shadowColor: z.string().optional().default("#000000"),
    shadowBlur: z.number().optional().default(10),
    shadowOffsetX: z.number().optional().default(0),
    shadowOffsetY: z.number().optional().default(2),
    shadowOpacity: z.number().optional().default(25),
    // Layout
    gap: z.number().optional(),
    // Outer Container Styling (wraps all icons together)
    outerContainer: z.object({
      enabled: z.boolean().optional().default(false),
      background: z.string().optional().default("#ffffff"),
      borderColor: z.string().optional().default("#e5e7eb"),
      borderWidth: z.number().optional().default(1),
      borderRadius: z.number().optional().default(8),
      padding: z.number().optional().default(16),
      width: z.string().optional().default("100%"),
      height: z.string().optional().default("auto"),
      shadowEnabled: z.boolean().optional().default(false),
      shadowColor: z.string().optional().default("#000000"),
      shadowOpacity: z.number().optional().default(10),
      shadowBlur: z.number().optional().default(10),
      shadowOffsetX: z.number().optional().default(0),
      shadowOffsetY: z.number().optional().default(4),
    }).optional().default({}),
    // Individual Icon Container Styling (each icon separately)
    iconContainer: z.object({
      enabled: z.boolean().optional().default(false),
      background: z.string().optional().default("#ffffff"),
      borderColor: z.string().optional().default("#e5e7eb"),
      borderWidth: z.number().optional().default(1),
      borderRadius: z.number().optional().default(8),
      padding: z.number().optional().default(16),
      shadowEnabled: z.boolean().optional().default(false),
      shadowColor: z.string().optional().default("#000000"),
      shadowOpacity: z.number().optional().default(10),
      shadowBlur: z.number().optional().default(10),
      shadowOffsetX: z.number().optional().default(0),
      shadowOffsetY: z.number().optional().default(4),
    }).optional().default({}),
    // Enable label to match icon skin styling
    enableLabelSkin: z.boolean().optional().default(false),
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

// Appointment booking elements
export const bookAppointmentElementSchema = baseElementSchema.extend({
  type: z.literal("bookAppointment"),
  data: z.object({
    title: z.string().default("Book Appointment"),
    subtitle: z.string().default("Schedule a meeting with me"),
    buttonText: z.string().default("Book Now"),
    buttonStyle: z.enum(["primary", "secondary", "outlined", "filled"]).default("primary"),
    buttonSize: z.enum(["small", "medium", "large"]).default("medium"),
    buttonColor: z.string().default("#22c55e"),
    textColor: z.string().default("#ffffff"),
    showIcon: z.boolean().default(true),
    iconType: z.enum(["calendar", "clock", "video", "phone"]).default("calendar"),
    eventTypeSlug: z.string().default(""), // Links to user's event type
    duration: z.number().default(30), // in minutes
    description: z.string().default(""),
    showDuration: z.boolean().default(true),
    openInNewTab: z.boolean().default(true),
  }),
});

export const scheduleCallElementSchema = baseElementSchema.extend({
  type: z.literal("scheduleCall"),
  data: z.object({
    title: z.string().default("Schedule a Call"),
    subtitle: z.string().default("Let's discuss your project"),
    buttonText: z.string().default("Schedule Call"),
    buttonStyle: z.enum(["primary", "secondary", "outlined", "filled"]).default("primary"),
    buttonSize: z.enum(["small", "medium", "large"]).default("medium"),
    buttonColor: z.string().default("#2563eb"),
    textColor: z.string().default("#ffffff"),
    showIcon: z.boolean().default(true),
    iconType: z.enum(["phone", "video", "calendar", "chat"]).default("phone"),
    callType: z.enum(["phone", "video", "audio"]).default("video"),
    eventTypeSlug: z.string().default(""),
    duration: z.number().default(30),
    description: z.string().default(""),
    showDuration: z.boolean().default(true),
    openInNewTab: z.boolean().default(true),
  }),
});

export const meetingRequestElementSchema = baseElementSchema.extend({
  type: z.literal("meetingRequest"),
  data: z.object({
    title: z.string().default("Request a Meeting"),
    subtitle: z.string().default("Let's meet to discuss opportunities"),
    buttonText: z.string().default("Request Meeting"),
    buttonStyle: z.enum(["primary", "secondary", "outlined", "filled"]).default("outlined"),
    buttonSize: z.enum(["small", "medium", "large"]).default("medium"),
    buttonColor: z.string().default("#7c3aed"),
    textColor: z.string().default("#7c3aed"),
    showIcon: z.boolean().default(true),
    iconType: z.enum(["calendar", "handshake", "briefcase", "users"]).default("handshake"),
    meetingType: z.enum(["consultation", "demo", "sales_call", "general"]).default("consultation"),
    eventTypeSlug: z.string().default(""),
    duration: z.number().default(60),
    description: z.string().default(""),
    showDuration: z.boolean().default(true),
    openInNewTab: z.boolean().default(true),
  }),
});

export const availabilityDisplayElementSchema = baseElementSchema.extend({
  type: z.literal("availabilityDisplay"),
  data: z.object({
    title: z.string().default("My Availability"),
    subtitle: z.string().default("Choose a convenient time"),
    displayStyle: z.enum(["compact", "detailed", "calendar"]).default("compact"),
    showTimezone: z.boolean().default(true),
    timezone: z.string().default("UTC"),
    availableSlots: z.array(z.object({
      day: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      available: z.boolean().default(true),
    })).default([
      { day: "Monday", startTime: "09:00", endTime: "17:00", available: true },
      { day: "Tuesday", startTime: "09:00", endTime: "17:00", available: true },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00", available: true },
      { day: "Thursday", startTime: "09:00", endTime: "17:00", available: true },
      { day: "Friday", startTime: "09:00", endTime: "17:00", available: true },
    ]),
    primaryColor: z.string().default("#22c55e"),
    backgroundColor: z.string().default("#f8fafc"),
    textColor: z.string().default("#475569"),
    showBookingLink: z.boolean().default(true),
    bookingLinkText: z.string().default("Book a slot"),
    eventTypeSlug: z.string().default(""),
  }),
});

// Custom HTML element
export const htmlElementSchema = baseElementSchema.extend({
  type: z.literal("html"),
  data: z.object({
    content: z.string().default(""),
    height: z.number().default(300),
    sandbox: z.boolean().default(true),
    showPreview: z.boolean().default(true),
  }),
});

// PDF Viewer element
export const pdfViewerElementSchema = baseElementSchema.extend({
  type: z.literal("pdfViewer"),
  data: z.object({
    pdf_file: z.string().default(""), // Base64 encoded PDF file
    button_text: z.string().default("View PDF"),
    scale: z.number().min(0.5).max(3).default(1.0),
    file_name: z.string().default(""), // Original filename for display
    buttonColor: z.string().default("#6b21a8"), // Button color (purple default)
    textColor: z.string().default("#ffffff"), // Button text color
  }),
});

// Subscribe to Updates element (visitor notifications)
export const subscribeElementSchema = baseElementSchema.extend({
  type: z.literal("subscribe"),
  data: z.object({
    title: z.string().default("Stay Updated"),
    description: z.string().default("Get notified about new updates, offers, and announcements."),
    buttonText: z.string().default("Subscribe"),
    successMessage: z.string().default("Thanks for subscribing! You'll receive notifications from us."),
    placeholderEmail: z.string().default("Enter your email"),
    placeholderName: z.string().default("Enter your name (optional)"),
    enableBrowserNotifications: z.boolean().default(true),
    requireName: z.boolean().default(false),
    buttonColor: z.string().default("#3b82f6"), // Blue default
    textColor: z.string().default("#ffffff"),
    iconColor: z.string().default("#3b82f6"),
  }),
});

// Action Buttons element (Add to Contacts + Share)
export const actionButtonsElementSchema = baseElementSchema.extend({
  type: z.literal("actionButtons"),
  data: z.object({
    addToContactsBgColor: z.string().optional(),
    addToContactsBorderColor: z.string().optional(),
    addToContactsTextColor: z.string().optional(),
    shareBgColor: z.string().optional(),
    shareBorderColor: z.string().optional(),
    shareTextColor: z.string().optional(),
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
  bookAppointmentElementSchema,
  scheduleCallElementSchema,
  meetingRequestElementSchema,
  availabilityDisplayElementSchema,
  htmlElementSchema,
  pdfViewerElementSchema,
  subscribeElementSchema,
  actionButtonsElementSchema,
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
  
  // Advanced Header Design
  advancedHeaderEnabled: z.boolean().default(false),
  headerTemplate: z.record(z.any()).optional(), // Complete header configuration with SVG shapes, layouts, etc.
  
  // Header Preset Configuration (New System)
  headerPreset: headerPresetSchema.optional(),
  
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
      nameSpacing: z.number().optional(),
      titleSpacing: z.number().optional(),
      companySpacing: z.number().optional(),
      namePositionX: z.number().optional(),
      namePositionY: z.number().optional(),
      titlePositionX: z.number().optional(),
      titlePositionY: z.number().optional(),
      companyPositionX: z.number().optional(),
      companyPositionY: z.number().optional(),
      textGroupHorizontal: z.number().optional(),
      textGroupVertical: z.number().optional(),
      sectionBackgroundColor: z.string().optional(),
      sectionBorderColor: z.string().optional(),
    }).default({}),
    contactInfo: z.object({
      iconColor: z.string().optional(),
      iconHoverColor: z.string().optional(),
      iconSize: z.number().optional(),
      iconBackgroundColor: z.string().optional(),
      iconBackgroundHoverColor: z.string().optional(),
      iconBackgroundSize: z.number().optional(),
      enableHoverColor: z.boolean().optional(),
      iconBorderColor: z.string().optional(),
      borderSize: z.number().optional(),
      iconTextColor: z.string().optional(),
      iconTextFont: z.string().optional(),
      iconTextSize: z.number().optional(),
      iconTextWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      iconTextStyle: z.enum(['normal', 'italic']).optional(),
      dropShadowEnabled: z.boolean().optional(),
      dropShadowColor: z.string().optional(),
      dropShadowOpacity: z.number().optional(),
      dropShadowBlur: z.number().optional(),
      dropShadowOffset: z.number().optional(),
      // Individual container styling
      containerStylingEnabled: z.boolean().optional(),
      containerBackgroundColor: z.string().optional(),
      containerBorderColor: z.string().optional(),
      containerBorderRadius: z.number().optional(),
      containerWidth: z.number().optional(),
      containerHeight: z.number().optional(),
      containerGap: z.number().optional(),
      containerDropShadowEnabled: z.boolean().optional(),
      containerDropShadowColor: z.string().optional(),
      containerDropShadowOpacity: z.number().optional(),
      containerDropShadowBlur: z.number().optional(),
      containerDropShadowOffset: z.number().optional(),
      sectionBackgroundColor: z.string().optional(),
      sectionBorderColor: z.string().optional(),
      // Enhanced Icon Styling Options
      view: z.enum(['icon-text', 'icon', 'text']).optional(),
      skin: z.enum(['gradient', 'minimal', 'framed', 'boxed', 'flat']).optional(),
      shape: z.enum(['square', 'rounded', 'circle']).optional(),
      columns: z.union([z.enum(['auto']), z.number().min(1).max(6)]).optional(),
      alignment: z.enum(['left', 'center', 'right', 'justify']).optional(),
      showLabel: z.boolean().optional(),
      // Icon Container Dimensions
      iconBackgroundWidth: z.number().min(24).max(120).optional(),
      iconBackgroundHeight: z.number().min(24).max(120).optional(),
      // Text Position relative to icon
      textPosition: z.enum(['left', 'right', 'top', 'bottom']).optional(),
    }).default({}),
    socialMedia: z.object({
      iconColor: z.string().optional(),
      iconHoverColor: z.string().optional(),
      iconSize: z.number().optional(),
      iconBackgroundColor: z.string().optional(),
      iconBackgroundHoverColor: z.string().optional(),
      iconBackgroundSize: z.number().optional(),
      enableHoverColor: z.boolean().optional(),
      iconBorderColor: z.string().optional(),
      borderSize: z.number().optional(),
      iconTextColor: z.string().optional(),
      iconTextFont: z.string().optional(),
      iconTextSize: z.number().optional(),
      iconTextWeight: z.enum(['300', '400', '500', '600', '700', '800']).optional(),
      iconTextStyle: z.enum(['normal', 'italic']).optional(),
      dropShadowEnabled: z.boolean().optional(),
      dropShadowColor: z.string().optional(),
      dropShadowOpacity: z.number().optional(),
      dropShadowBlur: z.number().optional(),
      dropShadowOffset: z.number().optional(),
      // Individual container styling
      containerStylingEnabled: z.boolean().optional(),
      containerBackgroundColor: z.string().optional(),
      containerBorderColor: z.string().optional(),
      containerBorderRadius: z.number().optional(),
      containerWidth: z.number().optional(),
      containerHeight: z.number().optional(),
      containerGap: z.number().optional(),
      containerDropShadowEnabled: z.boolean().optional(),
      containerDropShadowColor: z.string().optional(),
      containerDropShadowOpacity: z.number().optional(),
      containerDropShadowBlur: z.number().optional(),
      containerDropShadowOffset: z.number().optional(),
      sectionBackgroundColor: z.string().optional(),
      sectionBorderColor: z.string().optional(),
      // Enhanced Icon Styling Options
      view: z.enum(['icon-text', 'icon', 'text']).optional(),
      skin: z.enum(['gradient', 'minimal', 'framed', 'boxed', 'flat']).optional(),
      shape: z.enum(['square', 'rounded', 'circle']).optional(),
      columns: z.union([z.enum(['auto']), z.number().min(1).max(6)]).optional(),
      alignment: z.enum(['left', 'center', 'right', 'justify']).optional(),
      showLabel: z.boolean().optional(),
      // Icon Container Dimensions
      iconBackgroundWidth: z.number().min(24).max(120).optional(),
      iconBackgroundHeight: z.number().min(24).max(120).optional(),
      // Text Position relative to icon
      textPosition: z.enum(['left', 'right', 'top', 'bottom']).optional(),
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
  noIndex: z.boolean().default(false),
  noFollow: z.boolean().default(false),
  author: z.string().optional(),
  
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

// Calendar and Video Meeting Integration Types
export type CalendarConnection = typeof calendarConnections.$inferSelect;
export type InsertCalendarConnection = typeof calendarConnections.$inferInsert;

export type VideoMeetingProvider = typeof videoMeetingProviders.$inferSelect;
export type InsertVideoMeetingProvider = typeof videoMeetingProviders.$inferInsert;

export type ExternalCalendarEvent = typeof externalCalendarEvents.$inferSelect;
export type InsertExternalCalendarEvent = typeof externalCalendarEvents.$inferInsert;

export type MeetingLink = typeof meetingLinks.$inferSelect;
export type InsertMeetingLink = typeof meetingLinks.$inferInsert;

export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = typeof integrationLogs.$inferInsert;

// Zod schemas for calendar and video integration validation
export const insertCalendarConnectionSchema = createInsertSchema(calendarConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVideoMeetingProviderSchema = createInsertSchema(videoMeetingProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExternalCalendarEventSchema = createInsertSchema(externalCalendarEvents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingLinkSchema = createInsertSchema(meetingLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertIntegrationLogSchema = createInsertSchema(integrationLogs).omit({
  id: true,
  createdAt: true,
});

// ===== TEAM SCHEDULING SYSTEM =====

// Team assignment tracking for round-robin and manual assignments
export const teamAssignments = pgTable("team_assignments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  appointmentId: varchar("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }).notNull(),
  assignedMemberId: varchar("assigned_member_id").references(() => users.id, { onDelete: 'set null' }),
  
  // Assignment details
  assignmentType: varchar("assignment_type").notNull(), // 'round_robin', 'manual', 'skill_based', 'geographic'
  assignmentReason: text("assignment_reason"), // Why this member was chosen
  priorityScore: integer("priority_score").default(0), // Score used for assignment decision
  
  // Assignment status
  status: varchar("status").default('assigned'), // 'assigned', 'accepted', 'rejected', 'reassigned'
  assignedAt: timestamp("assigned_at").defaultNow(),
  assignedBy: varchar("assigned_by").references(() => users.id), // Who made the assignment
  
  // Routing metadata
  routingRuleId: varchar("routing_rule_id"), // Which rule was used for assignment
  alternativeMembers: jsonb("alternative_members").default('[]'), // Other members who could have been assigned
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_team_assignments_team").on(table.teamId),
  index("idx_team_assignments_appointment").on(table.appointmentId),
  index("idx_team_assignments_member").on(table.assignedMemberId),
  index("idx_team_assignments_type").on(table.assignmentType),
  index("idx_team_assignments_status").on(table.status),
  index("idx_team_assignments_created_at").on(table.createdAt),
]);

// Round-robin state tracking for fair distribution
export const roundRobinState = pgTable("round_robin_state", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  eventTypeId: varchar("event_type_id").references(() => appointmentEventTypes.id, { onDelete: 'cascade' }),
  
  // Current state
  lastAssignedMemberId: varchar("last_assigned_member_id").references(() => users.id, { onDelete: 'set null' }),
  currentIndex: integer("current_index").default(0), // Current position in round-robin rotation
  totalAssignments: integer("total_assignments").default(0), // Total assignments made
  
  // Member assignment counts for balancing
  memberAssignmentCounts: jsonb("member_assignment_counts").default('{}'), // {memberId: count}
  rotationOrder: jsonb("rotation_order").default('[]'), // Ordered list of member IDs
  
  // Settings
  resetPeriod: varchar("reset_period").default('weekly'), // 'daily', 'weekly', 'monthly', 'never'
  lastResetAt: timestamp("last_reset_at").defaultNow(),
  isActive: boolean("is_active").default(true),
  
  // Balancing settings
  allowSkip: boolean("allow_skip").default(true), // Skip unavailable members
  rebalanceThreshold: integer("rebalance_threshold").default(5), // Trigger rebalancing when difference exceeds this
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_round_robin_team").on(table.teamId),
  index("idx_round_robin_event_type").on(table.eventTypeId),
  index("idx_round_robin_active").on(table.isActive),
  { unique: { columns: [table.teamId, table.eventTypeId] } }
]);

// Lead routing rules for intelligent assignment
export const leadRoutingRules = pgTable("lead_routing_rules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  createdBy: varchar("created_by").references(() => users.id, { onDelete: 'set null' }).notNull(),
  
  // Rule identification
  name: varchar("name").notNull(),
  description: text("description"),
  priority: integer("priority").default(0), // Higher priority rules evaluated first
  
  // Rule conditions
  conditions: jsonb("conditions").notNull(), // Complex condition matching rules
  /*
  Example conditions:
  {
    appointmentType: ["consultation", "demo"],
    clientLocation: {country: "US", states: ["CA", "NY"]},
    appointmentValue: {min: 1000, max: 10000},
    clientSize: ["enterprise", "mid-market"],
    timeRange: {start: "09:00", end: "17:00"},
    dayOfWeek: ["monday", "tuesday", "wednesday"]
  }
  */
  
  // Assignment targets
  assignmentStrategy: varchar("assignment_strategy").notNull(), // 'specific_members', 'skill_based', 'round_robin', 'least_busy', 'best_match'
  targetMembers: jsonb("target_members").default('[]'), // Array of member IDs for specific assignment
  requiredSkills: jsonb("required_skills").default('[]'), // Skills required for assignment
  preferredSkills: jsonb("preferred_skills").default('[]'), // Nice-to-have skills
  
  // Scoring weights
  skillWeight: integer("skill_weight").default(40),
  availabilityWeight: integer("availability_weight").default(30),
  locationWeight: integer("location_weight").default(20),
  performanceWeight: integer("performance_weight").default(10),
  
  // Rule settings
  isActive: boolean("is_active").default(true),
  fallbackRule: varchar("fallback_rule").default('round_robin'), // What to do if rule can't be applied
  
  // Usage tracking
  usageCount: integer("usage_count").default(0),
  successRate: integer("success_rate").default(100), // Percentage of successful assignments
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_routing_rules_team").on(table.teamId),
  index("idx_routing_rules_priority").on(table.priority),
  index("idx_routing_rules_active").on(table.isActive),
  index("idx_routing_rules_strategy").on(table.assignmentStrategy),
]);

// Team member skills and capabilities
export const teamMemberSkills = pgTable("team_member_skills", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  
  // Skill details
  skillName: varchar("skill_name").notNull(),
  skillCategory: varchar("skill_category").notNull(), // 'technical', 'language', 'industry', 'soft_skill'
  proficiencyLevel: integer("proficiency_level").notNull(), // 1-5 scale
  
  // Verification and validation
  isVerified: boolean("is_verified").default(false),
  verifiedBy: varchar("verified_by").references(() => users.id),
  verificationDate: timestamp("verification_date"),
  
  // Metadata
  acquisitionDate: timestamp("acquisition_date"),
  lastUsed: timestamp("last_used"),
  usageCount: integer("usage_count").default(0),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_member_skills_member").on(table.teamMemberId),
  index("idx_member_skills_skill").on(table.skillName),
  index("idx_member_skills_category").on(table.skillCategory),
  index("idx_member_skills_level").on(table.proficiencyLevel),
  { unique: { columns: [table.teamMemberId, table.skillName] } }
]);

// Team member capacity and workload management
export const teamMemberCapacity = pgTable("team_member_capacity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamMemberId: varchar("team_member_id").references(() => teamMembers.id, { onDelete: 'cascade' }).notNull(),
  
  // Capacity settings
  maxDailyAppointments: integer("max_daily_appointments").default(8),
  maxWeeklyAppointments: integer("max_weekly_appointments").default(40),
  maxConcurrentAppointments: integer("max_concurrent_appointments").default(1),
  
  // Buffer times
  bufferBetweenAppointments: integer("buffer_between_appointments").default(15), // minutes
  preparationTime: integer("preparation_time").default(10), // minutes before each appointment
  wrapupTime: integer("wrap_up_time").default(10), // minutes after each appointment
  
  // Workload preferences
  preferredAppointmentTypes: jsonb("preferred_appointment_types").default('[]'),
  maxAppointmentDuration: integer("max_appointment_duration").default(120), // minutes
  minAppointmentDuration: integer("min_appointment_duration").default(15), // minutes
  
  // Current load tracking
  currentDailyLoad: integer("current_daily_load").default(0),
  currentWeeklyLoad: integer("current_weekly_load").default(0),
  lastLoadUpdate: timestamp("last_load_update").defaultNow(),
  
  // Performance metrics
  averageAppointmentDuration: integer("average_appointment_duration").default(60),
  completionRate: integer("completion_rate").default(100),
  satisfactionScore: integer("satisfaction_score").default(100),
  
  // Effective dates
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_member_capacity_member").on(table.teamMemberId),
  index("idx_member_capacity_effective").on(table.effectiveFrom, table.effectiveTo),
]);

// Collective team availability patterns
export const teamAvailabilityPatterns = pgTable("team_availability_patterns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  
  // Pattern details
  patternName: varchar("pattern_name").notNull(),
  patternType: varchar("pattern_type").notNull(), // 'collective', 'minimum_coverage', 'specific_members'
  
  // Availability requirements
  minimumMembers: integer("minimum_members").default(1), // Minimum team members required to be available
  requiredMembers: jsonb("required_members").default('[]'), // Specific members that must be available
  preferredMembers: jsonb("preferred_members").default('[]'), // Preferred members when available
  
  // Time patterns
  weekdayPatterns: jsonb("weekday_patterns").notNull(), // Per-day availability requirements
  /*
  Example:
  {
    "monday": {minMembers: 2, preferredMembers: ["user1", "user2"], timeSlots: ["09:00-17:00"]},
    "tuesday": {minMembers: 3, timeSlots: ["08:00-20:00"]},
    ...
  }
  */
  
  // Override periods
  holidayPattern: jsonb("holiday_pattern"), // Special availability during holidays
  peakSeasonPattern: jsonb("peak_season_pattern"), // Enhanced coverage during peak periods
  
  // Settings
  isActive: boolean("is_active").default(true),
  priority: integer("priority").default(0),
  
  // Date range
  effectiveFrom: timestamp("effective_from").defaultNow(),
  effectiveTo: timestamp("effective_to"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_team_patterns_team").on(table.teamId),
  index("idx_team_patterns_type").on(table.patternType),
  index("idx_team_patterns_active").on(table.isActive),
  index("idx_team_patterns_effective").on(table.effectiveFrom, table.effectiveTo),
]);

// Assignment performance tracking and analytics
export const assignmentAnalytics = pgTable("assignment_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  teamMemberId: varchar("team_member_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // Time period
  periodType: varchar("period_type").notNull(), // 'daily', 'weekly', 'monthly'
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Assignment metrics
  totalAssignments: integer("total_assignments").default(0),
  completedAssignments: integer("completed_assignments").default(0),
  cancelledAssignments: integer("cancelled_assignments").default(0),
  noShowAssignments: integer("no_show_assignments").default(0),
  
  // Performance metrics
  averageResponseTime: integer("average_response_time").default(0), // minutes
  clientSatisfactionScore: integer("client_satisfaction_score").default(0),
  conversionRate: integer("conversion_rate").default(0), // percentage
  
  // Revenue impact
  totalRevenue: integer("total_revenue").default(0), // in cents
  averageAppointmentValue: integer("average_appointment_value").default(0),
  
  // Utilization metrics
  utilizationRate: integer("utilization_rate").default(0), // percentage of capacity used
  peakHours: jsonb("peak_hours").default('[]'), // Hours with highest booking rate
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_assignment_analytics_team").on(table.teamId),
  index("idx_assignment_analytics_member").on(table.teamMemberId),
  index("idx_assignment_analytics_period").on(table.periodType, table.periodStart),
  { unique: { columns: [table.teamId, table.teamMemberId, table.periodType, table.periodStart] } }
]);

// Lead routing performance tracking
export const routingAnalytics = pgTable("routing_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  teamId: varchar("team_id").references(() => teams.id, { onDelete: 'cascade' }).notNull(),
  routingRuleId: varchar("routing_rule_id").references(() => leadRoutingRules.id, { onDelete: 'set null' }),
  
  // Assignment tracking
  appointmentId: varchar("appointment_id").references(() => appointments.id, { onDelete: 'cascade' }).notNull(),
  assignedMemberId: varchar("assigned_member_id").references(() => users.id, { onDelete: 'set null' }),
  
  // Routing process details
  totalEvaluatedMembers: integer("total_evaluated_members").default(0),
  evaluationScores: jsonb("evaluation_scores").default('{}'), // {memberId: score}
  selectionReason: text("selection_reason"), // Why this member was chosen
  
  // Outcome tracking
  appointmentStatus: varchar("appointment_status"), // Final appointment status
  clientSatisfaction: integer("client_satisfaction"), // 1-5 rating
  appointmentValue: integer("appointment_value").default(0), // in cents
  
  // Performance metrics
  routingTime: integer("routing_time").default(0), // milliseconds to complete routing
  ruleMatchAccuracy: integer("rule_match_accuracy").default(100), // How well the rule matched
  
  // Metadata
  routingContext: jsonb("routing_context").default('{}'), // Additional context used in routing
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_routing_analytics_team").on(table.teamId),
  index("idx_routing_analytics_rule").on(table.routingRuleId),
  index("idx_routing_analytics_appointment").on(table.appointmentId),
  index("idx_routing_analytics_member").on(table.assignedMemberId),
  index("idx_routing_analytics_created_at").on(table.createdAt),
]);

// ===== PUBLIC UPLOADS SYSTEM =====

// Public uploads table for user-uploaded files with custom URLs
export const publicUploads = pgTable("public_uploads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  
  // File information
  slug: varchar("slug").unique().notNull(), // Custom URL slug like "my-document"
  originalFileName: varchar("original_file_name").notNull(),
  storagePath: text("storage_path").notNull(), // Path in storage system
  title: text("title"), // Optional display title
  
  // File metadata
  mimeType: varchar("mime_type").notNull(), // e.g., "text/html", "image/jpeg", "application/pdf"
  fileExtension: varchar("file_extension").notNull(), // e.g., ".html", ".jpg", ".pdf"
  fileSize: integer("file_size").notNull(), // File size in bytes
  
  // Settings
  isPublic: boolean("is_public").default(true),
  viewCount: integer("view_count").default(0),
  
  // Timestamps
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_public_uploads_user").on(table.userId),
  index("idx_public_uploads_slug").on(table.slug),
  index("idx_public_uploads_mime_type").on(table.mimeType),
  index("idx_public_uploads_public").on(table.isPublic),
  index("idx_public_uploads_created_at").on(table.createdAt),
]);

// Media variants table for optimized images
export const mediaVariants = pgTable("media_variants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  publicUploadId: varchar("public_upload_id").references(() => publicUploads.id, { onDelete: 'cascade' }).notNull(),
  
  // Variant details
  variantType: varchar("variant_type").notNull(), // 'thumb_200', 'card_430', 'large_1200', 'original'
  storagePath: text("storage_path").notNull(), // Path in Supabase storage
  publicUrl: text("public_url").notNull(), // Full public URL
  
  // Image metadata
  width: integer("width"),
  height: integer("height"),
  fileSize: integer("file_size").notNull(), // in bytes
  format: varchar("format").notNull(), // 'webp', 'jpeg', 'png', etc.
  quality: integer("quality"), // WebP quality setting used
  
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("idx_media_variants_upload").on(table.publicUploadId),
  index("idx_media_variants_type").on(table.variantType),
  index("idx_media_variants_format").on(table.format),
]);

// ===== QR CODE SYSTEM =====

// QR Links table for Dynamic QR codes
export const qrLinks = pgTable("qr_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  shortId: varchar("short_id").unique().notNull(), // 7-10 URL-safe chars (now customizable)
  name: text("name"), // Optional label for UI
  targetUrl: text("target_url").notNull(), // Absolute http/https URL
  utm: jsonb("utm"), // UTM parameters as JSON object
  rules: jsonb("rules"), // Smart routing rules as JSON object
  enabled: boolean("enabled").default(true),
  
  // QR code customization
  darkColor: text("dark_color").default('#000000'), // QR code dark color (hex)
  lightColor: text("light_color").default('#FFFFFF'), // QR code light color (hex)
  logoUrl: text("logo_url"), // Optional logo URL
  logoShape: logoShapeEnum("logo_shape").default('circle'), // Logo shape
  logoSize: integer("logo_size").default(20), // Logo size as percentage (10-40)
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  index("idx_qr_links_short_id").on(table.shortId),
  index("idx_qr_links_user_created").on(table.userId, table.createdAt),
  index("idx_qr_links_enabled").on(table.enabled),
]);

// QR Events table for scan tracking
export const qrEvents = pgTable("qr_events", {
  id: serial("id").primaryKey(),
  qrId: varchar("qr_id").references(() => qrLinks.id, { onDelete: 'cascade' }).notNull(),
  ts: timestamp("ts").defaultNow().notNull(),
  ipHash: text("ip_hash"), // SHA256 of IP + salt for privacy
  ua: text("ua"), // User agent string
  device: deviceTypeEnum("device"), // Parsed device type
  country: text("country"), // From headers (CF-IPCountry)
  referrer: text("referrer"), // Referrer URL
  landingHost: text("landing_host"), // Hostname used for access
}, (table) => [
  index("idx_qr_events_qr_ts").on(table.qrId, table.ts),
  index("idx_qr_events_device").on(table.device),
  index("idx_qr_events_country").on(table.country),
  index("idx_qr_events_ts").on(table.ts),
]);

// ===== TEAM SCHEDULING TYPE DEFINITIONS =====

// TypeScript types for team scheduling tables
export type TeamAssignment = typeof teamAssignments.$inferSelect;
export type InsertTeamAssignment = typeof teamAssignments.$inferInsert;

export type RoundRobinState = typeof roundRobinState.$inferSelect;
export type InsertRoundRobinState = typeof roundRobinState.$inferInsert;

export type LeadRoutingRule = typeof leadRoutingRules.$inferSelect;
export type InsertLeadRoutingRule = typeof leadRoutingRules.$inferInsert;

export type TeamMemberSkill = typeof teamMemberSkills.$inferSelect;
export type InsertTeamMemberSkill = typeof teamMemberSkills.$inferInsert;

export type TeamMemberCapacity = typeof teamMemberCapacity.$inferSelect;
export type InsertTeamMemberCapacity = typeof teamMemberCapacity.$inferInsert;

export type TeamAvailabilityPattern = typeof teamAvailabilityPatterns.$inferSelect;
export type InsertTeamAvailabilityPattern = typeof teamAvailabilityPatterns.$inferInsert;

export type AssignmentAnalytics = typeof assignmentAnalytics.$inferSelect;
export type InsertAssignmentAnalytics = typeof assignmentAnalytics.$inferInsert;

export type RoutingAnalytics = typeof routingAnalytics.$inferSelect;
export type InsertRoutingAnalytics = typeof routingAnalytics.$inferInsert;

// Public uploads types
export type PublicUpload = typeof publicUploads.$inferSelect;
export type InsertPublicUpload = typeof publicUploads.$inferInsert;

// QR Code types
export type QrLink = typeof qrLinks.$inferSelect;
export type InsertQrLink = typeof qrLinks.$inferInsert;

export type QrEvent = typeof qrEvents.$inferSelect;
export type InsertQrEvent = typeof qrEvents.$inferInsert;

// Media variants types
export type MediaVariant = typeof mediaVariants.$inferSelect;
export type InsertMediaVariant = typeof mediaVariants.$inferInsert;

// ===== VALIDATION SCHEMAS FOR TEAM SCHEDULING =====

// Zod schemas for input validation
export const insertTeamAssignmentSchema = createInsertSchema(teamAssignments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRoundRobinStateSchema = createInsertSchema(roundRobinState).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadRoutingRuleSchema = createInsertSchema(leadRoutingRules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberSkillSchema = createInsertSchema(teamMemberSkills).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamMemberCapacitySchema = createInsertSchema(teamMemberCapacity).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTeamAvailabilityPatternSchema = createInsertSchema(teamAvailabilityPatterns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAssignmentAnalyticsSchema = createInsertSchema(assignmentAnalytics).omit({
  id: true,
  createdAt: true,
});

export const insertRoutingAnalyticsSchema = createInsertSchema(routingAnalytics).omit({
  id: true,
  createdAt: true,
});

// Public uploads validation schema
export const insertPublicUploadSchema = createInsertSchema(publicUploads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  viewCount: true,
});

// Public upload validation with additional client-side validation
export const publicUploadFormSchema = z.object({
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(80, 'Slug must be at most 80 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  title: z.string().max(200, 'Title too long').optional(),
  file: z.instanceof(File).refine(
    (file) => file.size <= 2 * 1024 * 1024, // 2MB
    'File size must be less than 2MB'
  ).refine(
    (file) => {
      const allowedTypes = [
        'text/html',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'image/webp',
        'image/avif',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      return allowedTypes.includes(file.type);
    },
    'File type not supported. Allowed: HTML, images (JPG, PNG, GIF, WEBP, AVIF), PDF, DOC, DOCX'
  ),
});

export type PublicUploadForm = z.infer<typeof publicUploadFormSchema>;

// Media variants validation schema
export const insertMediaVariantSchema = createInsertSchema(mediaVariants).omit({
  id: true,
  createdAt: true,
});

// Media upload response schema for client
export const mediaUploadResponseSchema = z.object({
  ok: z.boolean(),
  type: z.enum(['image', 'pdf']),
  storagePath: z.string(),
  variants: z.object({
    thumb_200_webp: z.string().url().optional(),
    card_430_webp: z.string().url().optional(),
    large_1200_webp: z.string().url().optional(),
    original: z.string().url().optional(),
  }),
  width: z.number().optional(),
  height: z.number().optional(),
});

export type MediaUploadResponse = z.infer<typeof mediaUploadResponseSchema>;

// ===== QR CODE VALIDATION SCHEMAS =====

// QR Link validation schema
export const insertQrLinkSchema = createInsertSchema(qrLinks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  shortId: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, 'Short ID can only contain letters, numbers, hyphens, and underscores'),
  targetUrl: z.string().url('Target URL must be a valid HTTP/HTTPS URL'),
  darkColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Dark color must be a valid hex color').optional(),
  lightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Light color must be a valid hex color').optional(),
  logoUrl: z.string().url().optional().nullable(),
  logoShape: z.enum(['circle', 'rectangle']).optional(),
  logoSize: z.number().min(10).max(40).optional(),
  utm: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
  }).optional(),
  rules: z.object({
    platform: z.record(z.string().url()).optional(),
    device: z.record(z.string().url()).optional(),
    geo: z.record(z.string().url()).optional(),
    ab: z.array(z.object({
      weight: z.number().min(1).max(100),
      url: z.string().url(),
    })).optional(),
    fallback: z.string().url().optional(),
  }).optional(),
});

export type QrLinkForm = z.infer<typeof insertQrLinkSchema>;

// QR Event validation schema
export const insertQrEventSchema = createInsertSchema(qrEvents).omit({
  id: true,
});

// Static QR validation schema (for on-demand generation)
export const staticQrSchema = z.object({
  data: z.string().min(1, 'Data is required'),
  format: z.enum(['png', 'svg']).default('svg'),
  size: z.enum(['256', '512', '1024']).default('512'),
  margin: z.number().min(0).max(10).default(2),
  dark: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Dark color must be valid hex').default('#000000'),
  light: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Light color must be valid hex').default('#ffffff'),
  logoUrl: z.string().url().optional(),
});

export type StaticQrForm = z.infer<typeof staticQrSchema>;
