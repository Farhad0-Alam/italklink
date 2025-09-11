import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/theme-provider";
import { Navigation } from "./components/navigation";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CardRoutes } from "@/modules/multi-page";
import Landing from "./pages/landing";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Templates from "./pages/templates";
import Collections from "./pages/collections";
import { Builder } from "./pages/builder";
import { Share } from "./pages/share";
import TemplatePreview from "./pages/template-preview";
import CardEditor from "./pages/card-editor";
import Admin from "./pages/admin";
import Pricing from "./pages/pricing";
import Affiliate from "./pages/affiliate";
import Profile from "./pages/profile";
import AccountSettings from "./pages/account-settings";
import Billing from "./pages/billing";
import Usage from "./pages/usage";
import Help from "./pages/help";
import Automation from "./pages/automation";
import Availability from "./pages/availability";
import EventTypes from "./pages/event-types";
import NotFound from "@/pages/not-found";
import CRM from "./pages/crm";
import BookingPage from "./pages/booking";
import EmailTemplatesPage from "./pages/EmailTemplatesPage";
import Analytics from "./pages/analytics";
import i18n from "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/landing" component={Landing} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/templates" component={Templates} />
      <Route path="/collections/:rest*" component={Collections} />
      <Route path="/collections" component={Collections} />
      <Route path="/builder" component={Builder} />
      <Route path="/cards/create" component={CardEditor} />
      <Route path="/cards/:id/edit" component={CardEditor} />
      <Route path="/card-editor/:id?" component={CardEditor} />
      <Route path="/card-editor" component={CardEditor} />
      <Route path="/share" component={Share} />
      <Route path="/template-preview/:templateId" component={TemplatePreview} />
      <Route path="/affiliate" component={Affiliate} />
      <Route path="/profile" component={Profile} />
      <Route path="/account-settings" component={AccountSettings} />
      <Route path="/billing" component={Billing} />
      <Route path="/usage" component={Usage} />
      <Route path="/automation" component={Automation} />
      <Route path="/availability" component={Availability} />
      <Route path="/event-types" component={EventTypes} />
      <Route path="/email-templates" component={EmailTemplatesPage} />
      <Route path="/crm" component={CRM} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/help" component={Help} />
      <Route path="/booking/:eventTypeSlug" component={BookingPage} />
      <Route path="/admin/templates/import" component={() => <Admin />} />
      <Route path="/admin/templates/builder" component={() => <Admin />} />
      <Route path="/admin/templates/header-builder" component={() => <Admin />} />
      <Route path="/admin/header-builder" component={() => <Admin />} />
      <Route path="/admin/header-templates" component={() => <Admin />} />
      <Route path="/admin/templates" component={() => <Admin />} />
      <Route path="/admin/users" component={() => <Admin />} />
      <Route path="/admin/plans" component={() => <Admin />} />
      <Route path="/admin/coupons" component={() => <Admin />} />
      <Route path="/admin/affiliates" component={() => <Admin />} />
      <Route path="/admin/conversions" component={() => <Admin />} />
      <Route path="/admin/icon-packs" component={() => <Admin />} />
      <Route path="/admin/profile" component={() => <Admin />} />
      <Route path="/admin" component={() => <Admin />} />
      
      {/* Multi-page card routes */}
      <CardRoutes />
      
      <Route path="/:shareSlug" component={Share} />
      <Route component={NotFound} />
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
