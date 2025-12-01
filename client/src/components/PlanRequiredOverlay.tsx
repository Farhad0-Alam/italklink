import { Link } from "wouter";
import { Crown, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface PlanRequiredOverlayProps {
  title?: string;
  description?: string;
  showPricing?: boolean;
}

export function PlanRequiredOverlay({
  title = "Choose a Plan to Continue",
  description = "To access all features and start creating your digital business card, please select a plan that fits your needs.",
  showPricing = true,
}: PlanRequiredOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm" data-testid="plan-required-overlay">
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="mb-8">
          <div className="relative inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30">
            <Crown className="w-10 h-10 text-amber-400" />
            <div className="absolute inset-0 rounded-full animate-pulse bg-amber-400/10" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 bg-gradient-to-r from-amber-200 via-yellow-200 to-amber-200 bg-clip-text text-transparent">
            {title}
          </h1>
          
          <p className="text-slate-300 text-lg max-w-lg mx-auto">
            {description}
          </p>
        </div>

        <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm mb-8" data-testid="features-locked-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Lock className="w-4 h-4" />
              <span className="text-sm font-medium">Features Currently Locked</span>
            </div>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-slate-400">
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                <span className="text-red-400">✕</span>
                <span>Business Cards</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                <span className="text-red-400">✕</span>
                <span>Page Elements</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                <span className="text-red-400">✕</span>
                <span>Templates</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                <span className="text-red-400">✕</span>
                <span>Appointments</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                <span className="text-red-400">✕</span>
                <span>CRM & Analytics</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-700/30 rounded-lg p-3">
                <span className="text-red-400">✕</span>
                <span>Digital Shop</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {showPricing && (
          <div className="space-y-4">
            <Link href="/pricing">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold px-8 py-6 text-lg shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300"
                data-testid="button-choose-plan"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                View Plans & Pricing
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            
            <p className="text-slate-500 text-sm">
              Choose from Free, Pro, or Enterprise plans
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PlanRequiredInline({
  title = "Plan Required",
  description = "Select a plan to access this feature.",
}: Omit<PlanRequiredOverlayProps, "showPricing">) {
  return (
    <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-amber-500/30 backdrop-blur-sm" data-testid="plan-required-inline">
      <CardContent className="py-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-500/20 border border-amber-500/30">
          <Crown className="w-8 h-8 text-amber-400" />
        </div>
        
        <CardTitle className="text-xl text-white mb-2">{title}</CardTitle>
        <CardDescription className="text-slate-400 mb-4">{description}</CardDescription>
        
        <Link href="/pricing">
          <Button 
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium"
            data-testid="button-view-plans"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            View Plans
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function withPlanRequired<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  isPlanAssigned: boolean,
  isAdmin: boolean
) {
  return function PlanProtectedComponent(props: P) {
    if (isAdmin || isPlanAssigned) {
      return <WrappedComponent {...props} />;
    }
    return <PlanRequiredOverlay />;
  };
}
