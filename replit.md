# 2TalkLink - Digital Business Card Platform

## Overview

This is a comprehensive enterprise-grade platform that combines professional digital business cards with a complete appointment booking and CRM system. Users can create business cards with integrated appointment booking functionality, manage their scheduling, track leads through a full CRM pipeline, and analyze their business performance. The platform includes advanced features like team scheduling, calendar integrations, automated notifications, and revenue analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on top of Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom color schemes including TalkLink branding
- **State Management**: React hooks with localStorage persistence for user data
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Routing**: Wouter for lightweight client-side routing (/, /builder, /share)

### Data Management
- **Storage**: Browser localStorage only - no server-side data persistence
- **Schema**: Zod-validated BusinessCard schema with comprehensive field validation
- **Image Handling**: Client-side file processing with base64 encoding for previews
- **Persistence**: Auto-save functionality with debounced localStorage updates

### Core Features Architecture
- **Card Builder**: Real-time form with live preview updates
- **Template System**: Three template variants (minimal, bold, photo) with dynamic styling
- **QR Code Generation**: Client-side QR generation linking to shareable URLs
- **Image Export**: HTML-to-image conversion for PNG downloads
- **URL Sharing**: Base64-encoded card data in URL hash for share functionality

### Internationalization
- **i18next**: Supports English and Bengali localization
- **Persistence**: Language preference saved in localStorage
- **Dynamic**: Runtime language switching without page reload

### Responsive Design
- **Mobile-First**: Responsive layout optimized for mobile and desktop
- **Theme Support**: Light/dark mode toggle with system preference detection
- **Adaptive UI**: Collapsible sections and mobile-optimized interactions

### Build System
- **Development**: Vite dev server with HMR and TypeScript checking
- **Production**: Optimized Vite build with code splitting
- **Asset Handling**: Vite asset processing with automatic optimization

## Comprehensive Appointment Booking & CRM System (September 2025)

### Complete Enterprise-Grade Architecture
- **Database Schema**: 20+ comprehensive tables covering appointments, availability, event types, team scheduling, CRM, notifications, and analytics
- **API Endpoints**: 50+ enterprise-grade endpoints with comprehensive security, CSRF protection, rate limiting, and standardized validation
- **Frontend System**: React 18 with TypeScript, modern UI components, and comprehensive dashboard modules
- **Complete Integration**: Seamless flow from business cards → appointment booking → CRM → notifications → analytics
- **Multi-Tenant Security**: Enterprise-grade authentication, authorization, and data isolation with role-based access control
- **Production Architecture**: Real-time monitoring, performance tracking, comprehensive error handling, and scalability documentation

### Appointment Booking System Features
- **Public Booking Pages**: Multi-step booking flow with timezone detection, real-time availability checking, and mobile optimization
- **Business Card Integration**: 4 booking element types (Book Appointment, Calendar Widget, Quick Book, Schedule Meeting) with customizable styling
- **Event Types Management**: Different appointment types with durations, descriptions, pricing, buffer times, and custom branding
- **Team Scheduling**: Round-robin assignment, collective availability, intelligent lead routing, and capacity management
- **Calendar Integration**: Google Calendar, Zoom, Microsoft Teams with OAuth flows, two-way sync, and automated meeting creation
- **Payment Processing**: Stripe integration with multi-currency support, refunds, transaction management, and revenue tracking
- **Automated Notifications**: Multi-channel delivery (email, SMS, push) with customizable templates, scheduling, and follow-up sequences
- **Analytics Dashboard**: Booking trends, conversion rates, revenue analytics, no-show tracking, export capabilities, and performance insights

### Advanced CRM Integration
- **Automatic Lead Capture**: Business card interactions and appointment bookings automatically create CRM contacts with lead scoring
- **Contact Management**: Lead scoring, lifecycle stages (visitor, lead, customer, evangelist), deduplication, and data enrichment
- **Deal Pipeline**: Visual Kanban with drag-drop management, customizable stages, revenue tracking, and win/loss analysis
- **Task Management**: Assignment, priorities, due dates, completion tracking, and team collaboration
- **Activity Timeline**: Complete interaction history, automated CRM event tracking, and comprehensive audit trails
- **Team Collaboration**: Role-based access (super_admin, owner, user), team assignments, and collaborative workflows

### Technical Excellence
- **Frontend**: React Query with optimistic updates, cache invalidation, real-time synchronization, and comprehensive error boundaries
- **Backend**: Express.js with comprehensive validation, security middleware, performance monitoring, and standardized API responses
- **Database**: PostgreSQL with Drizzle ORM, proper normalization, optimized queries, and performance indexing
- **Security**: CSRF protection, rate limiting, authentication middleware, input sanitization, and comprehensive audit logging
- **Integration**: External service connectivity with OAuth flows, webhook handling, error recovery, and health monitoring
- **Scalability**: Multi-tenant architecture with horizontal scaling documentation, Redis-ready caching, and load balancing support

## External Dependencies

### Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form for UI and form management
- **Build Tools**: Vite for development server and production builds
- **TypeScript**: Full TypeScript support with strict type checking

### UI and Styling
- **Radix UI**: Complete set of unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Shadcn/ui**: Pre-built component library extending Radix UI
- **Class Variance Authority**: Type-safe variant-based styling system

### Utility Libraries
- **Zod**: Runtime type validation and schema definition
- **date-fns**: Date manipulation utilities
- **clsx & tailwind-merge**: Conditional class name utilities
- **React Query**: Server state management (minimal usage for health checks)

### Feature-Specific Libraries
- **qrcode.react**: QR code generation component
- **html-to-image**: DOM-to-image conversion for PNG export
- **i18next**: Internationalization framework with React integration
- **Wouter**: Lightweight routing library

### Development Tools
- **ESBuild**: Fast bundling for server-side code
- **PostCSS**: CSS processing with Tailwind and Autoprefixer
- **Font Awesome**: Icon library for social media and UI icons

### Production Database System
- **PostgreSQL**: Enterprise-grade database with 20+ tables, proper relationships, and foreign key constraints
- **Drizzle ORM**: Full schema management with automated migrations, type safety, and query optimization
- **Performance**: Optimized queries, proper indexing, connection pooling, and query performance monitoring
- **Data Integrity**: Transaction safety, validation constraints, audit trails, and backup procedures
- **Multi-Tenant**: User-scoped data isolation, role-based access control, and secure data segregation
- **Monitoring**: Database health checks, query performance tracking, and automated alerting

### Enterprise Server Infrastructure
- **Express.js**: Full-featured server with 50+ API endpoints, middleware stack, and comprehensive routing
- **Enterprise Security**: CSRF protection, rate limiting, authentication, authorization, and audit logging
- **Real-Time Features**: WebSocket support, notification delivery, calendar sync workers, and background processing
- **Production Ready**: Health monitoring, performance tracking, error handling, and deployment documentation
- **Integration Hub**: OAuth providers, webhook endpoints, external service connectors, and API gateway functionality
- **Scalability**: Horizontal scaling support, Redis-ready architecture, and load balancing configuration