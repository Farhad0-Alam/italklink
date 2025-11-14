import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import i18n from "./lib/i18n";

// Lazy load Landing to reduce initial bundle size (it imports framer-motion + 30+ icons)
const Landing = lazy(() => import("./pages/landing"));

// Lazy load auth pages - they're not needed until user navigates to them
const Login = lazy(() => import("./pages/login"));
const Register = lazy(() => import("./pages/register"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const ForgotPassword = lazy(() => import("./pages/forgot-password"));
const ResetPassword = lazy(() => import("./pages/reset-password"));

// Lazy load all other pages to improve initial load performance
const MyLinks = lazy(() => import("./pages/my-links"));
const Templates = lazy(() => import("./pages/templates"));
const Appointments = lazy(() => import("./pages/appointments"));
const Builder = lazy(() => import("./pages/builder").then(module => ({ default: module.Builder })));
const Share = lazy(() => import("./pages/share").then(module => ({ default: module.Share })));
const TemplatePreview = lazy(() => import("./pages/template-preview"));
const CardEditor = lazy(() => import("./pages/card-editor"));
const Admin = lazy(() => import("./pages/admin"));
const Pricing = lazy(() => import("./pages/pricing"));
const Affiliate = lazy(() => import("./pages/affiliate"));
const Profile = lazy(() => import("./pages/profile"));
const AccountSettings = lazy(() => import("./pages/account-settings"));
const Billing = lazy(() => import("./pages/billing"));
const Usage = lazy(() => import("./pages/usage"));
const Help = lazy(() => import("./pages/help"));
const Automation = lazy(() => import("./pages/automation"));
const Availability = lazy(() => import("./pages/availability"));
const EventTypes = lazy(() => import("./pages/event-types"));
const NotFound = lazy(() => import("@/pages/not-found"));
const CRM = lazy(() => import("./pages/crm"));
const BookingPage = lazy(() => import("./pages/booking"));
const EmailTemplatesPage = lazy(() => import("./pages/EmailTemplatesPage"));
const Analytics = lazy(() => import("./pages/analytics"));
const CardAnalytics = lazy(() => import("./pages/card-analytics"));
const TeamDashboard = lazy(() => import("./pages/TeamDashboard"));
const Uploads = lazy(() => import("./pages/uploads"));
const QrCodes = lazy(() => import("./pages/qr-codes"));
const EmailSignature = lazy(() => import("./pages/email-signature"));

// Lazy load CardRoutes to prevent loading multi-page module eagerly
const LazyCardRoutes = lazy(() => import("@/modules/multi-page").then(module => ({ default: module.CardRoutes })));

// Loading component for lazy-loaded routes
const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<LoadingSkeleton />}>
    {children}
  </Suspense>
);

function Router() {
  return (
    <Switch>
      {/* All pages lazy loaded for optimal initial bundle size */}
      <Route path="/">{() => <PageSuspense><Landing /></PageSuspense>}</Route>
      <Route path="/landing">{() => <PageSuspense><Landing /></PageSuspense>}</Route>
      <Route path="/login">{() => <PageSuspense><Login /></PageSuspense>}</Route>
      <Route path="/register">{() => <PageSuspense><Register /></PageSuspense>}</Route>
      <Route path="/forgot-password">{() => <PageSuspense><ForgotPassword /></PageSuspense>}</Route>
      <Route path="/reset-password">{() => <PageSuspense><ResetPassword /></PageSuspense>}</Route>
      <Route path="/dashboard">{() => <PageSuspense><Dashboard /></PageSuspense>}</Route>
      
      {/* Lazy-loaded pages - Fixed to preserve route params */}
      <Route path="/my-links">{() => <PageSuspense><MyLinks /></PageSuspense>}</Route>
      <Route path="/pricing">{() => <PageSuspense><Pricing /></PageSuspense>}</Route>
      <Route path="/templates">{() => <PageSuspense><Templates /></PageSuspense>}</Route>
      <Route path="/appointments/:rest*">{(params) => <PageSuspense><Appointments {...params} /></PageSuspense>}</Route>
      <Route path="/appointments">{() => <PageSuspense><Appointments /></PageSuspense>}</Route>
      <Route path="/builder">{() => <PageSuspense><Builder /></PageSuspense>}</Route>
      <Route path="/card-editor/:id?">{(params) => <PageSuspense><CardEditor {...params} /></PageSuspense>}</Route>
      <Route path="/card-editor">{() => <PageSuspense><CardEditor /></PageSuspense>}</Route>
      <Route path="/share">{() => <PageSuspense><Share /></PageSuspense>}</Route>
      <Route path="/template-preview/:templateId">{(params) => <PageSuspense><TemplatePreview {...params} /></PageSuspense>}</Route>
      <Route path="/affiliate">{() => <PageSuspense><Affiliate /></PageSuspense>}</Route>
      <Route path="/profile">{() => <PageSuspense><Profile /></PageSuspense>}</Route>
      <Route path="/account-settings">{() => <PageSuspense><AccountSettings /></PageSuspense>}</Route>
      <Route path="/billing">{() => <PageSuspense><Billing /></PageSuspense>}</Route>
      <Route path="/usage">{() => <PageSuspense><Usage /></PageSuspense>}</Route>
      <Route path="/automation">{() => <PageSuspense><Automation /></PageSuspense>}</Route>
      <Route path="/availability">{() => <PageSuspense><Availability /></PageSuspense>}</Route>
      <Route path="/event-types">{() => <PageSuspense><EventTypes /></PageSuspense>}</Route>
      <Route path="/email-templates">{() => <PageSuspense><EmailTemplatesPage /></PageSuspense>}</Route>
      <Route path="/uploads">{() => <PageSuspense><Uploads /></PageSuspense>}</Route>
      <Route path="/qr-codes">{() => <PageSuspense><QrCodes /></PageSuspense>}</Route>
      <Route path="/crm">{() => <PageSuspense><CRM /></PageSuspense>}</Route>
      <Route path="/analytics">{() => <PageSuspense><Analytics /></PageSuspense>}</Route>
      <Route path="/card-analytics">{() => <PageSuspense><CardAnalytics /></PageSuspense>}</Route>
      <Route path="/teams">{() => <PageSuspense><TeamDashboard /></PageSuspense>}</Route>
      <Route path="/help">{() => <PageSuspense><Help /></PageSuspense>}</Route>
      <Route path="/email-signature">{() => <PageSuspense><EmailSignature /></PageSuspense>}</Route>
      <Route path="/booking/:eventTypeSlug">{(params) => <PageSuspense><BookingPage {...params} /></PageSuspense>}</Route>
      <Route path="/admin/users">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      <Route path="/admin/plans">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      <Route path="/admin/coupons">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      <Route path="/admin/affiliates">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      <Route path="/admin/conversions">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      <Route path="/admin/icon-packs">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      <Route path="/admin/profile">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      <Route path="/admin">{() => <PageSuspense><Admin /></PageSuspense>}</Route>
      
      {/* Multi-page card routes - Lazy loaded */}
      <Route path="/card/:cardId" nest>
        <PageSuspense>
          <LazyCardRoutes />
        </PageSuspense>
      </Route>
      
      {/* Catch-all route for sharing - must be LAST */}
      <Route path="/:shareSlug">{(params) => <PageSuspense><Share {...params} /></PageSuspense>}</Route>
      <Route>{() => <PageSuspense><NotFound /></PageSuspense>}</Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <ThemeProvider>
          <TooltipProvider>
            <div className="min-h-screen">
              <ImpersonationBanner />
              <Router />
              <Toaster />
            </div>
          </TooltipProvider>
        </ThemeProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
