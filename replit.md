# TalkLink - Digital Business Card Platform

## Overview
TalkLink is an enterprise-grade platform providing professional digital business cards integrated with a comprehensive appointment booking and CRM system. It enables users to create customizable business cards, manage scheduling, track leads, and analyze business performance, aiming to streamline professional networking and business operations. The platform is designed as a complete SaaS solution, offering a robust suite of tools for individuals and businesses to enhance their digital presence and client interactions.

## User Preferences
- Communication style: Simple, everyday language
- Development approach: Work autonomously with minimal interruptions
- Testing: Create new test users to verify functionality

## Recent Updates (Current Session - 23/39 Tasks Complete - 59%)

### Digital Shop Development Complete Features
- **Completed Tasks 1-17, 20-24** (23 tasks - 59% of 39-task roadmap):
  * Task 1: Digital Downloads System - Token-based access, download tracking, 30-day expiration, 5 re-downloads
  * Task 2: Reviews & Ratings - 5-star ratings with seller responses, helpful votes, review display
  * Task 3: Order Management - Buyer/seller order history, invoice generation, order status tracking
  * Task 4: Search & Filters - Full-text search, category filters, price range, 5 sort options (newest/popular/price/rating/discount)
  * Task 5: Wishlist System - Save products, wishlist page, add-to-cart integration, wishlist sharing
  * Task 6: Affiliate Commission Tracking - 3-way split (50% seller, 30% affiliate, 20% platform), auto-generated links, tracking
  * Task 7: Email Notifications - Purchase confirmations, download links, order updates, seller notifications, low stock alerts via SendGrid
  * Task 8: Admin Product Moderation - Approve/reject products, content review queue, rejection reasons
  * Task 9: Refund Request System - Buyer refunds, seller/admin approval workflow, Stripe integration
  * Task 10: Product Bundles - Multi-product bundles, automatic discount pricing, 3-way commission split
  * Task 11: Seller Analytics Dashboard - Sales charts, revenue tracking, top products, customer insights, conversion rates
  * Task 12: Coupon & Discount Codes - Percentage/fixed discounts, usage limits, expiry dates, per-user caps, minimum order amounts
  * Task 13: Product Categories & Tags - Seller categories with icons, global tags, SEO-friendly URLs, product organization
  * Task 14: Seller Payout Integration - Stripe Connect, bank transfer setup, earnings tracking, payout requests ($50 min)
  * Task 15: Product Variations & Pricing - Multiple variants per product, size/color options, variant-specific pricing, inventory tracking
  * Task 20: Cart Icon with Badge - Real-time shopping cart indicator in navigation across all shop pages
  * Task 21: Seller Store Pages - Public seller profiles with all products, seller bio, customizable storefront
  * Task 16: Seller Subscription Plans - Tiered subscription plans with feature limits, Stripe integration, plan management
  * Task 17: Product Review Moderation - Admin quality control, approve/reject reviews, flag suspicious content, moderation audit trail
  * Task 22: Admin Commission Settings UI - Flexible global/category/promotional commission rates with admin controls
  * Task 23: Social Media Sharing - Twitter/Facebook/LinkedIn sharing with tracking, share analytics, copy link option
  * Task 24: Abandoned Cart Emails - Cart recovery workflow with 3 automated emails (1hr, 24hr, 48hr), recovery tracking, SendGrid integration

- **Digital Shop Infrastructure**:
  * Complete database schema with 26 shop tables (products, orders, downloads, reviews, cart, wishlist, commissions, coupons, bundles, categories, tags, payouts, variations, variant options, variant attributes, commission settings, category rates, promotional rates, social shares, abandoned carts, subscription plans, seller subscriptions)
  * 55+ API endpoints across 18 route files (shop, cart, checkout, downloads, reviews, orders, search, wishlist, analytics, affiliate, coupons, email, bundles, categories, tags, payouts, variations, commissions, shares, abandoned-carts, seller-subscriptions, review-moderation)
  * Full e-commerce flow: Browse → Search → Cart → Checkout → Download
  * Product organization: categories, tags, bundles for better UX
  * 3-way commission split automatically applied to all shop orders
  * Seller payout system with Stripe Connect integration
  * Email notifications integrated via SendGrid
  * Coupon validation engine with comprehensive rule checking
  * Tiered seller subscription plans with feature gating
  * Abandoned cart recovery with automated email sequences
  * Social media sharing analytics and tracking
  * Product review moderation system with quality control and audit trail

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
    - **Digital Product Shop**: Full e-commerce marketplace with 3-way commission split, affiliate tracking, coupon system, email notifications, and seller analytics.

### System Design Choices
- **Auto-Save Functionality**: All card edits are auto-saved with a 100ms debounce, providing a seamless user experience.
- **Database-Driven Content**: Icons, element types, and templates are stored and managed in the database, allowing dynamic updates and customization.
- **Scalability**: The architecture supports multi-tenant user systems and role-based access control, designed for SaaS growth.
- **API Design**: Public APIs are provided for icons, element types, and plans, enabling flexible integration.
- **Commission System**: Automated 3-way split for all shop orders with configurable percentages (default: 50% seller, 30% affiliate, 20% platform).

## External Dependencies
- **Cloud Hosting**: Replit (production host)
- **Database**: PostgreSQL (Neon-backed)
- **File Storage**: Replit App Storage (Google Cloud Storage)
- **Email Service**: SendGrid
- **SMS Service**: Twilio
- **Payment Gateway**: Stripe
- **Calendar Integrations**: Google Calendar, Zoom, Microsoft Teams (OAuth for integration)
- **AI/Real-time APIs**: OpenAI Realtime API (for RAG voice conversations)

## Next Priority Tasks (21 Remaining - PRIORITY ORDER)
1. **Task 22**: Admin Commission Settings UI - Adjust percentages, per-category rates, promotional rates (BUSINESS CONTROL)
2. **Task 23**: Social Media Sharing - Share products to Twitter/Facebook/LinkedIn with rich previews (MARKETING)
4. **Task 24**: Abandoned Cart Emails - Remind users of unpurchased items, cart recovery workflow (CONVERSION)
5. **Task 16**: Seller Subscription Plans - Tiered seller accounts with feature limits
6. **Task 17**: Product Review Moderation - Admin review approval queue, spam filtering
7. **Task 18**: Gift Cards - Generate, purchase, redeem gift cards for shop credit
