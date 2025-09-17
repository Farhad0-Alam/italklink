import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Check, Star, Sparkles, Zap, Crown, Infinity, Plus, Minus, Users } from "lucide-react";

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
    // Assuming $12 per additional user as shown in example
    const additionalUserPrice = additionalUserCount * 12;
    return basePrice + additionalUserPrice;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
      {/* Fixed Plan Selector Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Choose Your Perfect Plan
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Create stunning digital business cards with unlimited customization
            </p>
          </div>
          
          {/* Plan Selection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            <AnimatePresence>
              {plans?.map((plan) => {
                const displayPrice = getDisplayPrice(plan);
                const popular = isPopular(plan.planType);
                const isSelected = selectedPlan === plan.id;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    <div
                      className={`bg-white dark:bg-slate-900 border-2 rounded-lg p-6 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-orange-500 shadow-lg'
                          : popular
                          ? 'border-orange-200 dark:border-orange-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                      data-testid={`plan-selector-${plan.planType}`}
                    >
                      {popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <Badge className="bg-orange-500 text-white px-3 py-1 text-xs font-medium">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                          {plan.name}
                        </h3>
                        <div className="mb-4">
                          <span className="text-3xl font-bold text-gray-900 dark:text-white">
                            ${displayPrice === 0 ? '0' : displayPrice}
                          </span>
                          <span className="text-gray-500 ml-1">/month</span>
                        </div>
                        
                        {/* User limit display */}
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {plan.businessCardsLimit === -1 ? 'Unlimited' : plan.businessCardsLimit} Cards
                        </div>
                        
                        {/* Add Users Section for Team Plans */}
                        {plan.planType.toLowerCase().includes('team') && (
                          <div className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4">
                            <div className="flex items-center justify-center space-x-3 mb-3">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">Add users</span>
                            </div>
                            <div className="flex items-center justify-center space-x-3">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserCountChange(plan.id, (additionalUsers[plan.id] || 0) - 1);
                                }}
                                data-testid={`decrease-users-${plan.id}`}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <div className="bg-orange-500 text-white px-4 py-1 rounded-md font-medium min-w-[50px] text-center">
                                {(additionalUsers[plan.id] || 0) + 3}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUserCountChange(plan.id, (additionalUsers[plan.id] || 0) + 1);
                                }}
                                data-testid={`increase-users-${plan.id}`}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            {additionalUsers[plan.id] > 0 && (
                              <div className="text-xs text-gray-500 mt-2">
                                +${additionalUsers[plan.id] * 12}/month for additional users
                              </div>
                            )}
                          </div>
                        )}
                        
                        <Button
                          className={`w-full mt-4 ${
                            popular
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : plan.price === 0
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900'
                          }`}
                          data-testid={`select-plan-${plan.planType}`}
                        >
                          {plan.price === 0 ? 'Get Started' : 
                           plan.planType.toLowerCase().includes('enterprise') ? 'Talk to sales' : 'Select plan'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-6">
            <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-1 flex items-center space-x-1">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  !isYearly ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setIsYearly(false)}
                data-testid="monthly-toggle"
              >
                Monthly
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isYearly ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
                onClick={() => setIsYearly(true)}
                data-testid="yearly-toggle"
              >
                Yearly
                {isYearly && (
                  <Badge className="ml-2 bg-green-500 text-white text-xs px-2 py-0.5">
                    Save 20%
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Plan Details Section */}
      <div className="bg-gray-50 dark:bg-slate-900 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {selectedPlan && plans && (
            <div>
              {(() => {
                const plan = plans.find(p => p.id === selectedPlan);
                if (!plan) return null;
                
                const features = getPlanFeatures(plan);
                const displayPrice = getDisplayPrice(plan);
                const totalPrice = plan.planType.toLowerCase().includes('team') 
                  ? getTeamPlanPrice(plan, additionalUsers[plan.id] || 0) 
                  : displayPrice;
                
                return (
                  <div className="grid lg:grid-cols-2 gap-12">
                    {/* Plan Summary */}
                    <div>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {plan.name}
                          </h2>
                          {isPopular(plan.planType) && (
                            <Badge className="bg-orange-500 text-white px-3 py-1">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        
                        <div className="mb-6">
                          <div className="flex items-baseline mb-2">
                            <span className="text-4xl font-bold text-gray-900 dark:text-white">
                              ${totalPrice === 0 ? '0' : totalPrice}
                            </span>
                            <span className="text-gray-500 ml-2">/month</span>
                          </div>
                          
                          {plan.businessCardsLimit && (
                            <p className="text-gray-600 dark:text-gray-300 mb-4">
                              {plan.businessCardsLimit === -1 ? 'Unlimited' : plan.businessCardsLimit} Business Cards
                            </p>
                          )}
                          
                          {isYearly && plan.price > 0 && (
                            <p className="text-sm text-gray-500">
                              Billed annually at ${Math.round(getActualBillingPrice(plan))} 
                              {plan.planType.toLowerCase().includes('team') && additionalUsers[plan.id] > 0 && (
                                <span> (+${(additionalUsers[plan.id] || 0) * 12 * 12} for additional users)</span>
                              )}
                            </p>
                          )}
                        </div>
                        
                        <Button 
                          className={`w-full py-3 text-lg font-semibold ${
                            isPopular(plan.planType)
                              ? 'bg-orange-500 hover:bg-orange-600 text-white'
                              : plan.price === 0
                              ? 'bg-blue-500 hover:bg-blue-600 text-white'
                              : 'bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-100 dark:text-gray-900'
                          }`}
                          data-testid={`cta-${plan.planType}`}
                        >
                          {plan.price === 0 ? 'Get Started Free' : 
                           plan.planType.toLowerCase().includes('enterprise') ? 'Contact Sales' : 'Get Started'}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Features List */}
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Includes:
                      </h3>
                      
                      <ul className="space-y-4">
                        {features.map((feature) => (
                          <li key={feature.id} className="flex items-start">
                            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900 dark:text-white">
                                {feature.name}
                              </span>
                              <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </li>
                        ))}
                        
                        {/* Always show unlimited custom features */}
                        <li className="flex items-start border-t border-gray-200 dark:border-gray-600 pt-4">
                          <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <Infinity className="w-3 h-3 text-white" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 dark:text-white">
                              Unlimited Custom Features
                            </span>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                              Add unlimited custom contact buttons, links, and interactive elements
                            </p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {!selectedPlan && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-gray-600 dark:text-gray-300 mb-2">
                Select a plan above to see details
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Compare features and find the perfect plan for your needs
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Simple FAQ Section */}
      <div className="bg-white dark:bg-slate-800 py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Get answers to common questions about our pricing and features
            </p>
          </div>
          
          <div className="space-y-8">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Can I change my plan later?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
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