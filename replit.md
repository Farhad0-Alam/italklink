# Digital Business Card Preview Generator

## Overview

This is a React-based web application that generates digital business card previews as a lead magnet for 2TalkLink. Users can create professional digital business card previews in under 60 seconds using a comprehensive form builder with live preview functionality. The app supports multiple templates, QR code generation, PNG export, and link sharing capabilities. All user data remains client-side with no server storage requirements.

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

### Database (Configured but Unused)
- **Drizzle ORM**: PostgreSQL ORM configured but not actively used
- **Neon Database**: Serverless PostgreSQL provider (setup only)
- **Connection**: Database ready for future user data if needed

### Server Infrastructure
- **Express.js**: Minimal server for health checks and optional webhook logging
- **Serverless Ready**: Designed for deployment on platforms like Vercel or Netlify
- **Static Assets**: Serves production build with fallback routing