# TalkLink - Digital Business Card Platform

## Overview
TalkLink is an enterprise-grade platform offering professional digital business cards integrated with a comprehensive appointment booking and CRM system. It enables users to create customizable business cards, manage scheduling, track leads, and analyze business performance. The platform supports team scheduling, calendar integrations, automated notifications, and revenue analytics, aiming to provide a complete solution for business networking and client management. It also includes an email signature generator and a visitor notification subscription system.

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
- **Digital Business Card Builder**: Real-time form with live preview, multiple templates, QR code generation, image export, and URL sharing. Includes advanced positioning controls for profile photos, company logos, and text elements, along with customizable profile image styling with modern animations and custom colors.
- **Appointment Booking System**: Public booking pages, integration with business cards, customizable event types, team scheduling, calendar integrations (Google Calendar, Zoom, Microsoft Teams), payment processing (Stripe), and automated multi-channel notifications.
- **CRM Integration**: Automatic lead capture, contact management (scoring, lifecycle), visual deal pipeline, task management, activity timeline, and team collaboration.
- **Visitor Notification Subscription**: "Subscribe to Updates" card element, email and browser push notification subscriptions, unsubscribe system, subscriber management for card owners, and rate limiting.
- **Web Push Notification System**: Utilizes `web-push` library with VAPID keys for secure, real-time push notification delivery, including automatic cleanup of invalid subscriptions.
- **Email Signature Generator**: Live preview, multiple templates, comprehensive customization (contact info, visuals, colors, social links), and HTML export compatible with various email clients (inline CSS, table-based layout). Dynamic download filenames based on signature name.

### System Design
- **Infrastructure**: All media storage migrated from Supabase to Replit App Storage with ACL policies and protected download routes.
- **CORS Configuration**: Enhanced CORS middleware with environment variable support for production domains, strict origin checking for credentialed requests, and built-in support for Replit domains and localhost.
- **Performance Optimization**: Elimination of global `watchedValues` patterns, replaced with scoped `useWatch` hooks and JSON string diff guards to prevent unnecessary re-renders and eliminate "Maximum update depth exceeded" errors.

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
- **Cloud Storage**: @google-cloud/storage (for Replit App Storage).