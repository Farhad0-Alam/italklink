# 2TalkLink - Digital Business Card Platform

## Overview
2TalkLink is an enterprise-grade platform offering professional digital business cards integrated with a comprehensive appointment booking and CRM system. It enables users to create customizable business cards, manage scheduling, track leads, and analyze business performance. The platform supports team scheduling, calendar integrations, automated notifications, and revenue analytics, aiming to provide a complete solution for business networking and client management. It also includes an email signature generator and a visitor notification subscription system.

## Recent Progress (October 21, 2025)
- **User Management System Complete**: Implemented full CRUD operations for user management
- **6 Admin API Endpoints**: GET users, GET plans, POST users, PATCH users, DELETE users, POST assign-plan
- **Authentication Fixed**: Resolved critical enhanced-auth middleware issues by commenting out non-existent database fields
- **Database Populated**: 1 admin user (admin@2talklink.com) + 50+ regular users successfully seeded
- **Stripe Integration**: Recurring subscriptions with proper pricing working perfectly
- **Users Page Fixed**: Now loads data correctly from PostgreSQL (was initialData: [] issue) - matching PlansPage pattern
- **Both Admin Pages Working**: Plans page and Users page both successfully loading and displaying live database data

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