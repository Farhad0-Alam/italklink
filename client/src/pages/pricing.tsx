import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Check, Star, Sparkles, Zap, Crown, Infinity, Plus, Minus, Users, ArrowLeft } from "lucide-react";

interface Plan {
  id: number;
  name: string;
  planType: string;
  price: number;
  currency: string;
  interval: string;
  businessCardsLimit: number;
  features: {
    featureList: number[];
    unlimitedPrice?: number;
    hasUnlimitedOption?: boolean;
    templateLimit?: number;
    trialDays?: number;
  };
}

interface Feature {
  id: number;
  name: string;
  description: string;
  icon: any;
  category: string;
}

const allFeatures: Feature[] = [
  { id: 1, name: "Professional Templates", description: "Access to premium card designs", icon: Star, category: "Design" },
  { id: 2, name: "Custom Branding", description: "Add your logo and brand colors", icon: Sparkles, category: "Branding" },
  { id: 3, name: "QR Code Generation", description: "Instant QR codes for easy sharing", icon: Zap, category: "Sharing" },
  { id: 4, name: "Analytics Dashboard", description: "Track views and engagement", icon: Crown, category: "Analytics" },
  { id: 5, name: "Contact Export", description: "Export contacts to various formats", icon: Check, category: "Export" },
  { id: 6, name: "Social Media Links", description: "Connect all your social profiles", icon: Check, category: "Social" },
  { id: 7, name: "Custom Contact Buttons", description: "Unlimited custom action buttons", icon: Infinity, category: "Customization" },
  { id: 8, name: "Video Integration", description: "Embed introduction videos", icon: Check, category: "Media" },
  { id: 9, name: "Lead Generation", description: "Capture leads directly from cards", icon: Check, category: "Business" },
  { id: 10, name: "Team Management", description: "Manage multiple team members", icon: Check, category: "Team" },
  { id: 11, name: "API Access", description: "Integrate with your existing systems", icon: Check, category: "Integration" },
  { id: 12, name: "Priority Support", description: "Get help when you need it", icon: Check, category: "Support" },
  { id: 13, name: "Custom Domain", description: "Use your own domain name", icon: Check, category: "Professional" },
  { id: 14, name: "Advanced Analytics", description: "Detailed insights and reporting", icon: Check, category: "Analytics" },
  { id: 15, name: "White Label Options", description: "Remove branding completely", icon: Crown, category: "Enterprise" }
];

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const cardHover = {
  hover: { 
    y: -10,
    scale: 1.02,
    transition: { duration: 0.3, ease: "easeOut" }
  }
};

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [additionalUsers, setAdditionalUsers] = useState<{[key: number]: number}>({});

  const { data: plans, isLoading } = useQuery<Plan[]>({
    queryKey: ['/api/plans'],
    staleTime: 1000 * 30, // 30 seconds - refresh more frequently for new plans
  });

  // Calculate pricing display logic
  const getDisplayPrice = (plan: Plan) => {
    if (plan.price === 0) return 0;
    
    if (isYearly) {
      // Show monthly price but bill annually (typically 20% discount)
      const annualDiscount = 0.2;
      const monthlyEquivalent = plan.interval === 'yearly' 
        ? plan.price / 12 
        : plan.price * (1 - annualDiscount);
      return Math.round(monthlyEquivalent);
    }
    
    return plan.interval === 'yearly' ? plan.price / 12 : plan.price;
  };

  const getActualBillingPrice = (plan: Plan) => {
    if (plan.price === 0) return 0;
    
    if (isYearly) {
      return plan.interval === 'yearly' ? plan.price : plan.price * 12 * 0.8; // 20% annual discount
    }
    
    return plan.interval === 'monthly' ? plan.price : plan.price / 12;
  };

  const getPlanFeatures = (plan: Plan): Feature[] => {
    if (!plan.features?.featureList) return [];
    return plan.features.featureList.map(id => allFeatures.find(f => f.id === id)).filter(Boolean) as Feature[];
  };

  const getPlanIcon = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'free': return Star;
      case 'pro': return Zap;
      case 'enterprise': return Crown;
      default: return Sparkles;
    }
  };

  const getPlanColor = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'free': return 'from-blue-400 to-blue-600';
      case 'pro': return 'from-purple-400 to-purple-600';
      case 'enterprise': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const isPopular = (planType: string) => planType.toLowerCase() === 'pro';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading pricing plans...</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle additional users for team plans
  const handleUserCountChange = (planId: number, count: number) => {
    setAdditionalUsers(prev => ({ ...prev, [planId]: Math.max(0, count) }));
  };

  const getTeamPlanPrice = (plan: Plan, additionalUserCount: number = 0) => {
    const basePrice = getDisplayPrice(plan);
    // Apply yearly discount to additional users too
    const perUserMonthly = isYearly ? 12 * 0.8 : 12; // $9.60/month for yearly, $12/month for monthly
    const additionalUserPrice = additionalUserCount * perUserMonthly;
    return basePrice + additionalUserPrice;
  };

  const getPerUserMonthly = () => isYearly ? 12 * 0.8 : 12;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      {/* Back to Dashboard */}
      <div className="container mx-auto px-4 pt-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setLocation('/dashboard')}
          className="flex items-center space-x-2 hover:bg-gray-100"
          data-testid="button-back-dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Button>
      </div>
      
      {/* Plan Selection Toggle */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Create stunning digital business cards with unlimited customization
            </p>
            
            {/* Plan Selection Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Plan selection
              </h2>
              <div className="flex items-center justify-center">
                <div className="bg-gray-100 dark:bg-slate-700 rounded-full p-1 flex items-center">
                  <button
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      !isYearly 
                        ? 'bg-orange-500 text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setIsYearly(false)}
                    data-testid="toggle-monthly"
                  >
                    Pay monthly
                  </button>
                  <button
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                      isYearly 
                        ? 'bg-orange-500 text-white shadow-sm' 
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                    onClick={() => setIsYearly(true)}
                    data-testid="toggle-yearly"
                  >
                    Yearly and save 20%
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Plan Cards - Scrollable Section */}
      <div className="py-16 px-4" id="plans-section">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <AnimatePresence>
              {plans?.map((plan) => {
                const isTeamPlan = plan.planType.toLowerCase().includes('team');
                const userCount = isTeamPlan ? (additionalUsers[plan.id] || 0) + 3 : 1;
                const totalPrice = isTeamPlan ? getTeamPlanPrice(plan, additionalUsers[plan.id] || 0) : getDisplayPrice(plan);
                const perUserMonthly = getPerUserMonthly();
                const actualBillingPrice = isTeamPlan && additionalUsers[plan.id] > 0 
                  ? (getActualBillingPrice(plan) + (additionalUsers[plan.id] * perUserMonthly * 12))
                  : getActualBillingPrice(plan);
                const popular = isPopular(plan.planType);
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <Card className={`border-2 hover:shadow-lg transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' 
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-white dark:bg-slate-800`}
                    onClick={() => setSelectedPlan(plan.id)}
                    data-testid={`plan-card-${plan.planType}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="text-center">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {plan.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {plan.planType === 'free' ? 'For Individuals' : 
                             isTeamPlan ? `${userCount} users included!` : 
                             'For Individuals'}
                          </p>
                          
                          {/* Pricing Display */}
                          <div className="mb-6">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                              ${totalPrice === 0 ? '0' : totalPrice.toFixed(2)}/month
                            </div>
                            {plan.price > 0 && isYearly && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                Billed at ${actualBillingPrice.toFixed(2)}/year
                                {isTeamPlan && additionalUsers[plan.id] > 0 && (
                                  <span> (includes additional users)</span>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Add Users Section for Team Plans */}
                          {isTeamPlan && (
                            <div className="mb-6">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Add users</span>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserCountChange(plan.id, (additionalUsers[plan.id] || 0) - 1);
                                    }}
                                    data-testid={`decrease-users-${plan.id}`}
                                  >
                                    <Minus className="h-4 w-4" />
                                  </Button>
                                  <div className="bg-black text-white px-4 py-1 rounded-md font-bold min-w-[50px] text-center">
                                    {userCount}
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0 rounded-md"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUserCountChange(plan.id, (additionalUsers[plan.id] || 0) + 1);
                                    }}
                                    data-testid={`increase-users-${plan.id}`}
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                              {additionalUsers[plan.id] > 0 && (
                                <div className="text-xs text-gray-500 mb-3">
                                  +${(additionalUsers[plan.id] * perUserMonthly).toFixed(2)}/month for {additionalUsers[plan.id]} additional user{additionalUsers[plan.id] > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Select Plan Button */}
                          <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlan(plan.id);
                              const detailsSection = document.getElementById('plan-details');
                              if (detailsSection) {
                                detailsSection.scrollIntoView({ behavior: 'smooth' });
                              }
                            }}
                            data-testid={`select-plan-${plan.planType}`}
                          >
                            Select plan
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Includes:</h4>
                          <div className="space-y-2">
                            {getPlanFeatures(plan).slice(0, 6).map((feature) => (
                              <div key={feature.id} className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{feature.name}</span>
                              </div>
                            ))}
                            {getPlanFeatures(plan).length > 6 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                +{getPlanFeatures(plan).length - 6} more features
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      {/* FAQ Section */}
      <div className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-8">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for upgrades, 
                and at your next billing cycle for downgrades.
              </p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We accept all major credit cards, PayPal, and other secure payment methods through Stripe.
              </p>
            </div>
            
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Is there a free trial available?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Our free plan lets you get started immediately with basic features. No trial period needed!
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Do you offer custom enterprise solutions?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes! Our Enterprise plan includes custom integrations, dedicated support, and volume pricing. 
                Contact our sales team for more information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}