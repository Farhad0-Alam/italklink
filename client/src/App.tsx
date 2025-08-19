import React from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider } from "./components/theme-provider";
import { Navigation } from "./components/navigation";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "./pages/home";
import { Builder } from "./pages/builder";
import { Share } from "./pages/share";
import NotFound from "@/pages/not-found";
import i18n from "./lib/i18n";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/builder" component={Builder} />
      <Route path="/share" component={Share} />
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
              <Navigation />
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
