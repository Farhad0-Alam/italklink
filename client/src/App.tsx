import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { Suspense, lazy } from "react";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/theme-provider";
import { Navigation } from "./components/navigation";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CardRoutes } from "@/modules/multi-page";
import i18n from "./lib/i18n";

// Eager load only critical pages (Landing, Login, Dashboard)
import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";

// Lazy load all other pages to improve initial load performance
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
const TeamDashboard = lazy(() => import("./pages/TeamDashboard"));
const Uploads = lazy(() => import("./pages/uploads"));

// Loading component for lazy-loaded routes
const PageSuspense = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  }>
    {children}
  </Suspense>
);

function Router() {
  return (
    <Switch>
      {/* Critical pages loaded immediately */}
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      
      {/* Lazy-loaded pages */}
      <Route path="/pricing" component={() => <PageSuspense><Pricing /></PageSuspense>} />
      <Route path="/templates" component={() => <PageSuspense><Templates /></PageSuspense>} />
      <Route path="/appointments/:rest*" component={() => <PageSuspense><Appointments /></PageSuspense>} />
      <Route path="/appointments" component={() => <PageSuspense><Appointments /></PageSuspense>} />
      <Route path="/builder" component={() => <PageSuspense><Builder /></PageSuspense>} />
      <Route path="/cards/create" component={() => <PageSuspense><CardEditor /></PageSuspense>} />
      <Route path="/cards/:id/edit" component={() => <PageSuspense><CardEditor /></PageSuspense>} />
      <Route path="/card-editor/:id?" component={() => <PageSuspense><CardEditor /></PageSuspense>} />
      <Route path="/card-editor" component={() => <PageSuspense><CardEditor /></PageSuspense>} />
      <Route path="/share" component={() => <PageSuspense><Share /></PageSuspense>} />
      <Route path="/template-preview/:templateId" component={() => <PageSuspense><TemplatePreview /></PageSuspense>} />
      <Route path="/affiliate" component={() => <PageSuspense><Affiliate /></PageSuspense>} />
      <Route path="/profile" component={() => <PageSuspense><Profile /></PageSuspense>} />
      <Route path="/account-settings" component={() => <PageSuspense><AccountSettings /></PageSuspense>} />
      <Route path="/billing" component={() => <PageSuspense><Billing /></PageSuspense>} />
      <Route path="/usage" component={() => <PageSuspense><Usage /></PageSuspense>} />
      <Route path="/automation" component={() => <PageSuspense><Automation /></PageSuspense>} />
      <Route path="/availability" component={() => <PageSuspense><Availability /></PageSuspense>} />
      <Route path="/event-types" component={() => <PageSuspense><EventTypes /></PageSuspense>} />
      <Route path="/email-templates" component={() => <PageSuspense><EmailTemplatesPage /></PageSuspense>} />
      <Route path="/uploads" component={() => <PageSuspense><Uploads /></PageSuspense>} />
      <Route path="/crm" component={() => <PageSuspense><CRM /></PageSuspense>} />
      <Route path="/analytics" component={() => <PageSuspense><Analytics /></PageSuspense>} />
      <Route path="/teams" component={() => <PageSuspense><TeamDashboard /></PageSuspense>} />
      <Route path="/help" component={() => <PageSuspense><Help /></PageSuspense>} />
      <Route path="/booking/:eventTypeSlug" component={() => <PageSuspense><BookingPage /></PageSuspense>} />
      <Route path="/admin/templates/import" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/templates/builder" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/templates/header-builder" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/header-builder" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/header-templates" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/templates" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/users" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/plans" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/coupons" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/affiliates" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/conversions" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/icon-packs" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin/profile" component={() => <PageSuspense><Admin /></PageSuspense>} />
      <Route path="/admin" component={() => <PageSuspense><Admin /></PageSuspense>} />
      
      {/* Multi-page card routes */}
      <CardRoutes />
      
      <Route path="/:shareSlug" component={() => <PageSuspense><Share /></PageSuspense>} />
      <Route component={() => <PageSuspense><NotFound /></PageSuspense>} />
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
