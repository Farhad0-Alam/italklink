# TalkLink - Digital Business Card Platform

## Overview
TalkLink is an enterprise-grade platform providing professional digital business cards integrated with a comprehensive appointment booking and CRM system. It enables users to create customizable business cards, manage scheduling, track leads, and analyze business performance, aiming to streamline professional networking and business operations. The platform is designed as a complete SaaS solution, offering a robust suite of tools for individuals and businesses to enhance their digital presence and client interactions.

## User Preferences
- Communication style: Simple, everyday language
- Development approach: Work autonomously with minimal interruptions
- Testing: Create new test users to verify functionality

## Recent Updates (Current Session)

### Digital Shop Development Progress
- **Completed Tasks 1-6** (15% of 39-task roadmap):
  * Task 1: Digital Downloads System - Token-based access, download tracking, expiration handling
  * Task 2: Reviews & Ratings - 5-star ratings with seller responses, helpful votes
  * Task 3: Order Management - Buyer/seller history, invoice generation, order tracking
  * Task 4: Search & Filters - Full-text search, category filters, price range, 5 sort options
  * Task 5: Wishlist System - Save products, add-to-cart integration
  * Task 6: Affiliate Commission Tracking - 3-way split (50% seller, 30% affiliate, 20% platform), auto-generated affiliate links
  * Task 11: Seller Analytics Dashboard - Sales charts, revenue tracking, top products, customer insights

- **Digital Shop Infrastructure**:
  * Complete database schema with 8 shop tables (products, orders, downloads, reviews, cart, wishlist, commissions)
  * 20+ API endpoints across 6 route files
  * Full e-commerce flow: Browse → Search → Cart → Checkout → Download
  * Commission tracking integrated into order pipeline

## System Architecture

### UI/UX Decisions
The platform features a modern, international UI/UX design with a focus on responsiveness and visual appeal. This includes:
- **Design System**: Shadcn/ui (Radix UI) and Tailwind CSS for a consistent and customizable interface.
- **Theming**: Dynamic gradient backgrounds (blue→purple, emerald→teal, orange→amber, etc.) are used throughout, with full dark mode support.
- **Interactive Elements**: Smooth hover transitions, shadow effects, and rounded corners contribute to a polished user experience.
- **Typography**: Professional typography and spacing are maintained across the platform.
- **Layout**: Responsive grid layouts ensure optimal viewing on various screen sizes.
- **Real-time Previews**: A live preview with a mobile mockup frame is provided for digital business card and email signature builders.

### Technical Implementations
- **Frontend**: Built with React 18 and TypeScript, utilizing React Query v5 for state management, Wouter for routing, i18next for internationalization (English, Bengali), and React Hook Form with Zod for form validation. Real-time features leverage WebSockets via openai/realtime-api-beta.
- **Backend**: Implemented using Express.js. It features over 50 RESTful endpoints, multi-tenant role-based access control, CSRF protection, rate limiting, and session management. A WebSocket server handles real-time voice streaming.
- **Database**: PostgreSQL with Drizzle ORM is used for data persistence, managing over 20 tables. Vector-based knowledge retrieval is supported via `pgvector` for the RAG system.
- **Core Features**:
    - **Digital Business Card Builder**: Real-time live preview, 9+ customizable HTML templates, QR code generation, image export, custom URL slugs, advanced positioning, customizable colors, multiple fonts, and profile image styling.
    - **Appointment Booking System**: Public booking pages with templates, customizable event types, team scheduling, Google Calendar OAuth, Zoom meeting auto-creation, payment processing via Stripe, and multi-channel notifications (email, SMS, push).
    - **CRM System**: Automatic lead capture, contact management with scoring, visual deal pipeline, task management, activity timelines, and team collaboration.
    - **Email Signature Generator**: Live preview editor, 9 HTML templates, full customization, and HTML export.
    - **Visitor Notification Subscription**: "Subscribe to Updates" card element for email and browser push notifications, with subscriber management.
    - **RAG Voice Conversation System**: OpenAI Realtime API integration, bidirectional voice streaming via WebSocket, and vector-based knowledge retrieval for context-aware AI responses.
    - **Multi-Page Support**: Creation of multiple pages on business cards with navigation and customization.
    - **Analytics & Tracking**: Card view tracking, button click tracking, lead scoring, and performance metrics dashboard.

### System Design Choices
- **Auto-Save Functionality**: All card edits are auto-saved with a 100ms debounce, providing a seamless user experience.
- **Database-Driven Content**: Icons, element types, and templates are stored and managed in the database, allowing dynamic updates and customization.
- **Scalability**: The architecture supports multi-tenant user systems and role-based access control, designed for SaaS growth.
- **API Design**: Public APIs are provided for icons, element types, and plans, enabling flexible integration.

## External Dependencies
- **Cloud Hosting**: Replit (production host)
- **Database**: PostgreSQL (Neon-backed)
- **File Storage**: Replit App Storage (Google Cloud Storage)
- **Email Service**: SendGrid
- **SMS Service**: Twilio
- **Payment Gateway**: Stripe
- **Calendar Integrations**: Google Calendar, Zoom, Microsoft Teams (OAuth for integration)
- **AI/Real-time APIs**: OpenAI Realtime API (for RAG voice conversations)