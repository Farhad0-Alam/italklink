# iTalkLink - Digital Business Card Platform

## Overview
iTalkLink is an enterprise-grade SaaS platform designed to streamline professional networking and business operations. It provides customizable digital business cards integrated with a comprehensive appointment booking and CRM system. The platform enables users to create digital business cards, manage scheduling, track leads, and analyze business performance, offering a robust suite of tools to enhance digital presence and client interactions.

## User Preferences
- Communication style: Simple, everyday language
- Development approach: Work autonomously with minimal interruptions
- Testing: Create new test users to verify functionality

## System Architecture

### UI/UX Decisions
The platform utilizes Shadcn/ui (Radix UI) and Tailwind CSS for a modern, responsive, and visually appealing interface. Key design elements include dynamic gradient backgrounds, full dark mode support, interactive elements with smooth transitions, professional typography, and responsive grid layouts. A live preview with a mobile mockup frame is available for card and email signature builders. The primary brand colors are green (#10b981 / green-600), black, and white.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, React Query v5 for state management, Wouter for routing, i18next for internationalization (English, Bengali), and React Hook Form with Zod for validation. Real-time features use WebSockets via openai/realtime-api-beta.
- **Backend**: Express.js with over 50 RESTful endpoints, multi-tenant role-based access control, CSRF protection, rate limiting, and session management. A WebSocket server supports real-time voice streaming.
- **Database**: PostgreSQL with Drizzle ORM, managing over 20 tables. `pgvector` is used for vector-based knowledge retrieval in the RAG system.
- **Core Features**:
    - **Digital Business Card Builder**: Real-time live preview, 9+ customizable HTML templates, QR code generation, image export, custom URL slugs, advanced positioning, and font styling.
    - **Appointment Booking System**: Public booking pages with templates, customizable event types, team scheduling, Google Calendar OAuth, Zoom meeting auto-creation, Stripe payment processing, and multi-channel notifications.
    - **CRM System**: Automatic lead capture, contact management with scoring, visual deal pipeline, task management, activity timelines, and team collaboration.
    - **Email Signature Generator**: Live preview editor with 9 HTML templates, full customization, and HTML export.
    - **Visitor Notification Subscription**: "Subscribe to Updates" card element for email and browser push notifications.
    - **RAG Voice Conversation System**: OpenAI Realtime API integration for bidirectional voice streaming and context-aware AI responses.
    - **Multi-Page Support**: Creation of multiple pages on business cards with navigation.
    - **Analytics & Tracking**: Card view tracking, button click tracking, lead scoring, and performance metrics dashboard.
    - **Digital Product Shop**: Full e-commerce marketplace with a 3-way commission split, affiliate tracking, coupon system, email notifications, and seller analytics.
    - **Mandatory Plan Selection**: Users must explicitly choose a plan to access features. A `PlanRequiredOverlay` component enforces this, redirecting new users to `/pricing` and requiring plan assignment during admin user creation.
    - **Plan Duration & Auto-Renewal**: Admin can assign Monthly, Yearly, or Unlimited plans. Subscription extensions are based on the existing end date. Stripe auto-renewal precisely extends user plans via webhooks.

### System Design Choices
- **Auto-Save Functionality**: All card edits are auto-saved with a 100ms debounce.
- **Database-Driven Content**: Icons, element types, and templates are stored in the database for dynamic updates.
- **Scalability**: Designed for multi-tenant user systems and role-based access control.
- **API Design**: Public APIs are provided for icons, element types, and plans.
- **Commission System**: Automated 3-way split for shop orders (default: 50% seller, 30% affiliate, 20% platform).

## Project Structure (Layered Architecture)

The project follows a layered architecture organizing code by technical concern:

```
client/src/
├── components/           # Reusable UI components
│   ├── admin/           # Admin panel components
│   ├── automation/      # Automation/tracking components
│   ├── business-card/   # Business card components
│   ├── crm/             # CRM components
│   ├── form-builder/    # Form builder components
│   ├── multi-page/      # Multi-page navigation components
│   └── ui/              # Shadcn UI primitives
├── hooks/               # Custom React hooks
│   ├── useButtonTracking.ts
│   ├── useCRM.ts
│   ├── useMultiPage.ts
│   └── use-*.ts
├── lib/                 # Utilities and helpers
│   ├── api/             # API utilities
│   └── utils/           # Common utilities
├── pages/               # Route pages
│   ├── admin/           # Admin pages
│   ├── auth/            # Authentication pages
│   ├── dashboard/       # Dashboard pages
│   ├── editor/          # Card editor pages
│   └── shop/            # E-commerce pages
├── types/               # TypeScript type definitions
│   ├── business-card.ts
│   ├── crm/
│   ├── form-builder.ts
│   └── multi-page/
├── contexts/            # React contexts
└── modules/             # Legacy re-exports (backward compatibility)
```

## External Dependencies
- **Cloud Hosting**: Replit
- **Database**: PostgreSQL (Neon-backed)
- **File Storage**: Replit App Storage (Google Cloud Storage)
- **Email Service**: SendGrid
- **SMS Service**: Twilio
- **Payment Gateway**: Stripe
- **Calendar Integrations**: Google Calendar, Zoom, Microsoft Teams
- **AI/Real-time APIs**: OpenAI Realtime API