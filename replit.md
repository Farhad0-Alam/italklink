# TalkLink - Digital Business Card Platform

## Overview
TalkLink is an enterprise-grade platform offering professional digital business cards integrated with a comprehensive appointment booking and CRM system. It enables users to create customizable business cards, manage scheduling, track leads, and analyze business performance. The platform supports team scheduling, calendar integrations, automated notifications, and revenue analytics, aiming to provide a complete solution for business networking and client management. It also includes an email signature generator and a visitor notification subscription system.

## Recent Progress (November 12, 2025)
### ✅ COMPLETE: Production-Ready Elementor Shape Divider System

**Complete Elementor Shape Library (26 Professional Shapes):**
- Valley (triangle-negative): Inverted V shape - default/first option
- Triangle: Classic upward point
- Triangle Asymmetrical: Off-center triangle
- Curve: Smooth arc divider
- Curve Asymmetrical: Off-center arc
- Waves: Smooth wave pattern
- Wave Brush: Artistic brushed wave effect
- Tilt: Clean diagonal divider
- Opacity Tilt: Layered diagonal with transparency
- Arrow: Chevron divider
- Arrow Negative: Inverted chevron
- Clouds: Fluffy cloud shapes
- Clouds Negative: Inverted clouds
- Mountains (3 variations): Layered mountain peaks
- Split: Dual diagonal divider
- Split Negative: Inverted dual diagonal
- Pyramids: Layered triangle pattern
- Pyramids Negative: Inverted pyramids
- Drops: Water drop effect
- Drops Negative: Inverted drops
- Book: Open book pages
- Book Negative: Inverted book

**Advanced Controls (Elementor Pro Features):**
- **Width Slider**: 100-300% range with centered positioning, extends shapes beyond container edges using negative margins
- **Height Slider**: 20-200px range with edge-locked scaling (shapes stay flush with section boundaries)
- **Flip Toggle**: Horizontal flip (left-right mirror) via scaleX transform
- **Invert Toggle**: Vertical flip with auto-flip logic (top shapes default upside down, bottom shapes straight)
- **Bring to Front**: Z-index control to layer shapes above or below content
- **Color Picker**: Custom shape colors independent of section background
- **Position Toggle**: Top or bottom section placement with automatic orientation

**Auto-Flip Behavior (Matching Elementor):**
- Top position shapes automatically flip upside down (point into content)
- Bottom position shapes remain straight (point into content from below)
- Manual Invert toggle applies additional flip on top of auto-positioning (XOR logic)
- This ensures shapes always "flow into" the content section properly

**Technical Implementation:**
- Elementor's exact viewBox specification (0 0 1000 100) for all shapes
- Transform order: auto-flip → manual invert → horizontal flip → height scaling
- Width coverage: Negative left margin `-(width - 100) / 2` for widths >100%
- Height scaling: `transformOrigin: center ${position}` keeps shapes edge-locked
- Z-index: 1 (default) or 10 (bring to front)
- All 26 shapes tested at extreme values (width 100-300%, height 20-200px)

**Schema Fields (shapeDividerSchema):**
```typescript
enabled: boolean         // Show/hide shape divider
position: "top" | "bottom"  // Section position
preset: shapeDividerPresetSchema  // 26 Elementor shapes + custom
customPath: string       // SVG path for custom uploads
color: string           // Fill color
height: number          // Height in px (20-200)
width: number           // Width percentage (100-300)
invert: boolean         // Manual vertical flip
flip: boolean           // Horizontal flip
bringToFront: boolean   // Z-index control
opacity: number         // 0-1 transparency
```

**Files Modified:**
- `client/src/lib/header-schema.ts`: Complete schema with all Elementor controls
- `client/src/components/header-builder/ShapeDivider.tsx`: Production-ready rendering with edge-locked scaling
- `client/src/components/form-builder.tsx`: Complete UI with all control toggles and 26-shape preview grid

### ✅ COMPLETE: Profile Image Styling System with Modern Animations & Custom Colors

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