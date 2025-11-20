# TalkLink - Digital Business Card Platform

## Overview
TalkLink is an enterprise-grade platform offering professional digital business cards integrated with a comprehensive appointment booking and CRM system. It enables users to create customizable business cards, manage scheduling, track leads, and analyze business performance. The platform supports team scheduling, calendar integrations, automated notifications, and revenue analytics, aiming to provide a complete solution for business networking and client management. It also includes an email signature generator and a visitor notification subscription system.

## Recent Progress (November 20, 2025)
### ✅ COMPLETE: Supabase to Replit App Storage Migration (November 20, 2025)

**Complete Infrastructure Migration:**
- Migrated all media storage from Supabase Storage to Replit App Storage
- Replaced `server/lib/supabase.ts` with Replit-only implementation
- Completely rewrote `server/routes/media.ts` to use Replit App Storage with ACL policies
- Added protected file download route at `/objects/:objectPath` with authentication and access control
- Fixed all critical migration bugs: download route path handling, upload bucket parsing, ACL metadata structure

**File Upload Flow:**
- Multer memory storage → Sharp image processing (WebP variants) → Replit App Storage upload with ACL → Database metadata storage
- Path structure: Files stored at `user_{userId}/{YYYY}/{MM}/{DD}/{basename}/` in Replit App Storage
- Download URL format: `/objects/{objectPath}` served through protected route with requireAuth middleware
- ACL policy: Files set as "public" visibility within authenticated context (route protected by requireAuth)

**Code Updates:**
- Updated `client/src/components/business-card.tsx` to use Replit URLs (`/objects/...`) instead of Supabase URLs
- Updated schema comments to reflect Replit App Storage
- Removed all Supabase references from codebase
- No Supabase packages installed - 100% Replit infrastructure

**Technical Implementation:**
- Uses `@google-cloud/storage` for Replit App Storage access
- ACL policies use owner (userId) and visibility ("public") structure
- WebP variants generated for all image uploads (thumb_200, card_430, large_1200)
- Protected download route validates authentication before serving files

### ✅ COMPLETE: Final Performance Optimization - Zero Infinite Loop Errors (November 15, 2025)

**Complete Elimination of watchedValues Pattern:**
- Eliminated ALL 285+ `watchedValues` references from form-builder.tsx (6650 lines)
- Replaced global `const watchedValues = form.watch()` with scoped `useWatch` hooks for namespace-based subscriptions
- Implemented optimal watcher pattern: sectionStyles, coverImageStyles, profileImageStyles, pages, and individual fields (brandColor, backgroundType, ogImage, noIndex, noFollow)
- Added JSON string diff guard in `enhancedCardData` to prevent cascade `onDataChange` triggers
- **Result**: Zero React "Maximum update depth exceeded" errors - production-ready stability confirmed
- Architect review passed: No regression bugs in form controls, live preview sync, or conditional rendering logic

**Critical Performance Fix (Position Controls):**
- Fixed React infinite loop error in business card editor's position sliders
- Replaced global `watchedValues` object with individual `form.watch()` calls for all 8 position sliders
- Prevents cascade re-renders by ensuring each slider only subscribes to its own field value
- Added `Number()` type conversion wrapper for all position values to ensure type safety
- Proper null/undefined fallbacks (default to 0) throughout business-card.tsx

**Text Positioning System (Production-Ready):**
- **Name Styling**: Horizontal and Vertical position sliders (-150px to +150px each)
- **Title Styling**: Horizontal and Vertical position sliders (-150px to +150px each)
- **Company Styling**: Horizontal and Vertical position sliders (-150px to +150px each)
- Each text element can be positioned independently with precise control
- Text Group Position sliders still available to move all three elements together as a unit (-150px to +150px)

**Position Controls:**
- **Horizontal Position**: Moves text left/right (-150px to +150px)
- **Vertical Position**: Moves text up/down (-150px to +150px)
- All three text elements (Name, Title, Company) have independent positioning
- Text Group Position sliders also use extended range (-150px to +150px)
- Text stays centered (textAlign: "center") while position sliders move elements
- Extended range allows positioning text near card edges

**Technical Implementation:**
- Removed Text Alignment dropdown from all styling sections
- Added `namePositionX`, `namePositionY`, `titlePositionX`, `titlePositionY`, `companyPositionX`, `companyPositionY` to schema
- Each text element uses CSS `transform: translate()` for individual positioning
- Text Group Position sliders apply additional transform to parent container
- All position changes apply in real-time with live preview
- Optimized form watching pattern prevents unnecessary re-renders

### ✅ COMPLETE: Profile Image Styling System with Modern Animations & Custom Colors (November 12, 2025)

**Profile Image Customization:**
- Complete styling controls for business card profile images
- Visibility toggle (show/hide profile image)
- Size adjustment (slider control)
- Shape options (circle, square, rounded)
- Border customization (width, color)
- Default 3px solid border using brand color
- Shadow effects (adjustable intensity)
- Opacity control

**Modern Border Animations:**
- Instagram Gradient: Spinning multi-color gradient border effect
- Neon Glow: Pulsating neon glow effect
- Color Wave: Color-cycling border animation
- Shimmer: Sweeping shimmer overlay effect
- Gradient Slide: Sliding gradient border animation

**Custom Animation Colors (NEW):**
- Advanced color picker UI using react-colorful library
- Hex code input with validation and real-time preview
- "Use Brand Color" toggle to auto-apply card's brand/accent colors
- Primary color picker (available for all animations)
- Secondary color picker (for gradient-based animations: Instagram, Wave, Gradient Slide)
- CSS custom properties (--profile-anim-color-1, --profile-anim-color-2) for dynamic theming
- Seamless fallback to brand colors when toggle is enabled

**Technical Implementation:**
- Added `profileImageStyles` jsonb field to business_cards table with animationColors and useBrandColor support
- CSS keyframe animations use CSS variables for dynamic color control with proper fallbacks
- Helper function `getProfileImageStyle()` injects CSS variables at render-time
- Fixed double-border bug: static border suppressed when animation is active
- Smart animation routing: pseudo-element animations (instagram, shimmer, gradient-slide) on wrapper div, direct animations (neon, wave) on image element
- FormBuilder color controls conditionally render based on animation selection
- Applied across all three header designs (cover-logo, profile-center, logo-side)
- Fully responsive with proper z-index layering

### ✅ COMPLETE: Full PostgreSQL Database Integration (October 22, 2025)

**ALL Admin Pages (8 pages) - 100% Complete:**
- Dashboard, Users, Plans, Subscriptions, Templates, Analytics, Appointments, Settings
- Full CRUD operations with live PostgreSQL data
- Real-time updates and comprehensive management features

**ALL User Dashboard Pages (14 pages) - 100% Complete:**
- ✅ **Dashboard/My Links**: Business cards with create/edit/delete/duplicate/status toggle
- ✅ **Templates**: Database-driven template selection and customization
- ✅ **Appointments**: Full calendar management with event types, stats, CRUD operations
- ✅ **CRM**: Complete contact/deal/task/activity management with analytics
- ✅ **Analytics**: Booking trends, popular times, conversion rates, no-show tracking
- ✅ **Availability**: User availability settings with create/update operations
- ✅ **Uploads**: File management with upload/delete operations
- ✅ **QR Codes**: Dynamic QR code generation with analytics (already integrated)
- ✅ **Email Signature**: Saved signatures with create/delete operations
- ✅ **Affiliate**: Profile, applications, analytics, conversions, marketing assets
- ✅ **Account Settings**: User settings with update operations
- ✅ **Billing**: Subscription, invoices, payment methods (Stripe integrated)
- ✅ **Usage**: Usage statistics (storage, cards, API calls)
- ✅ **Help**: Knowledge base articles with search functionality

**API Endpoints Added (35+ new endpoints):**
- Analytics: `/api/analytics/*` (booking-trends, popular-times, conversion-rates, no-shows)
- Affiliate: `/api/affiliate/*` (me, apply, analytics, conversions, marketing-assets)
- Billing: `/api/billing/*` (subscription, invoices, payment-methods)
- Uploads: `/api/uploads/*` (get, delete)
- Availability: `/api/user/availability/*` (get, create, update)
- Email Signature: `/api/email-signatures/*` (get, create, delete)
- Usage: `/api/usage/stats`
- Account Settings: `/api/account/settings` (get, update)
- Help/KB: `/api/help/articles/*` (list, get by ID)

**Architecture:**
- 100% dynamic platform with zero mock data
- All pages fetch live data from PostgreSQL using requireAuth middleware
- Consistent API response format: `{ success: true, data: [...] }`
- Query pattern: `staleTime: 0, refetchOnWindowFocus: true` for real-time data
- Complete separation: Admin pages use enhancedAuth + requireRole('admin'), User pages use requireAuth

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript and Vite.
- **UI/UX**: Shadcn/ui (built on Radix UI) and Tailwind CSS for styling, with custom branding and responsive design (mobile-first approach, light/dark mode).
- **State Management**: React hooks with localStorage persistence.
- **Form Handling**: React Hook Form with Zod validation.
- **Routing**: Wouter for client-side routing.
- **Internationalization**: i18next supporting English and Bengali, with language preference saved in localStorage.

### Backend & Data Management
- **Database**: PostgreSQL with Drizzle ORM (20+ tables for appointments, CRM, etc.), optimized for performance and multi-tenancy.
- **Server**: Express.js with 50+ API endpoints, comprehensive security (CSRF, rate limiting, authentication), and real-time features.
- **Data Persistence**: Browser localStorage for frontend, PostgreSQL for backend.
- **Security**: Multi-tenant architecture with role-based access control, data isolation, and robust security measures.

### Core Features
- **Digital Business Card Builder**: Real-time form with live preview, multiple templates, QR code generation, image export, and URL sharing.
- **Appointment Booking System**: Public booking pages, integration with business cards, customizable event types, team scheduling, calendar integrations (Google Calendar, Zoom, Microsoft Teams), payment processing (Stripe), and automated multi-channel notifications.
- **CRM Integration**: Automatic lead capture, contact management (scoring, lifecycle), visual deal pipeline, task management, activity timeline, and team collaboration.
- **Visitor Notification Subscription**: "Subscribe to Updates" card element, email and browser push notification subscriptions, unsubscribe system, subscriber management for card owners, and rate limiting.
- **Web Push Notification System**: Utilizes `web-push` library with VAPID keys for secure, real-time push notification delivery, including automatic cleanup of invalid subscriptions.
- **Email Signature Generator**: Live preview, multiple templates, comprehensive customization (contact info, visuals, colors, social links), and HTML export compatible with various email clients (inline CSS, table-based layout).

## External Dependencies

- **UI & Styling**: Radix UI, Tailwind CSS, Shadcn/ui, Class Variance Authority, react-colorful (color picker).
- **Data Validation**: Zod.
- **Date Utilities**: date-fns.
- **Routing**: Wouter.
- **Internationalization**: i18next.
- **QR Code Generation**: qrcode.react.
- **Image Export**: html-to-image.
- **Icons**: Lucide React, react-icons/si (for social platforms).
- **Database ORM**: Drizzle ORM.
- **Push Notifications**: web-push library.
- **Payment Processing**: Stripe.
- **Calendar Integrations**: Google Calendar, Zoom, Microsoft Teams (via OAuth).
- **Server-side Framework**: Express.js.