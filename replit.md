# TalkLink - Digital Business Card Platform

## Overview
TalkLink is an enterprise-grade platform offering professional digital business cards integrated with a comprehensive appointment booking and CRM system. It enables users to create customizable business cards, manage scheduling, track leads, and analyze business performance. The platform supports team scheduling, calendar integrations, automated notifications, and revenue analytics, aiming to provide a complete solution for business networking and client management. It also includes an email signature generator and a visitor notification subscription system.

## Recent Progress (November 12, 2025)
### ✅ COMPLETE: Profile Image Styling System with Modern Animations

**Profile Image Customization:**
- Complete styling controls for business card profile images
- Visibility toggle (show/hide profile image)
- Size adjustment (slider control)
- Shape options (circle, square, rounded)
- Border customization (width, color)
- Shadow effects (adjustable intensity)
- Opacity control

**Modern Border Animations:**
- Instagram Gradient: Spinning multi-color gradient border effect
- Neon Glow: Pulsating neon glow effect
- Color Wave: Color-cycling border animation
- Shimmer: Sweeping shimmer overlay effect
- Gradient Slide: Sliding gradient border animation

**Technical Implementation:**
- Added `profileImageStyles` jsonb field to business_cards table
- CSS keyframe animations in index.css (instagram-spin, neon-glow, color-wave, shimmer, gradient-slide)
- Helper function `getProfileImageStyle()` in BusinessCard component
- Smart animation routing: pseudo-element animations (instagram, shimmer, gradient-slide) on wrapper div, direct animations (neon, wave) on image element
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

- **UI & Styling**: Radix UI, Tailwind CSS, Shadcn/ui, Class Variance Authority.
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