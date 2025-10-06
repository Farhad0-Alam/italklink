import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Check, Star, Sparkles, Zap, Crown, Infinity, Plus, Minus, Users, ArrowLeft, Tag, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface BillingPlan {
  id: number;
  name: string;
  planType: string;
  price: number;
  currency: string;
  interval: string;
  businessCardsLimit: number;
  baseUsers: number;
  pricePerUser: number;
  setupFee: number;
  allowUserSelection: boolean;
  minUsers: number;
  maxUsers: number | null;
  description: string | null;
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

export default function Pricing() {
  const [, setLocation] = useLocation();
  const [isYearly, setIsYearly] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [userQuantities, setUserQuantities] = useState<{[key: number]: number}>({});
  const [couponCode, setCouponCode] = useState('');
  const [validatedCoupon, setValidatedCoupon] = useState<{
    valid: boolean;
    discount?: number;
    message?: string;
  } | null>(null);
  const { toast } = useToast();

  const { data: plans, isLoading } = useQuery<BillingPlan[]>({
    queryKey: ['/api/plans'],
    queryFn: async () => {
      const res = await fetch('/api/plans?active=true', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch plans');
      const json = await res.json();
      return json.data || json;
    },
    staleTime: 1000 * 30,
  });

  const validateCouponMutation = useMutation({
    mutationFn: async ({ code, planId, userCount }: { code: string; planId: number; userCount: number }) => {
      return apiRequest('POST', '/api/billing/coupons/validate', {
        code: code.toUpperCase(),
        planId,
        userCount
      });
    },
    onSuccess: (response: any) => {
      const data = response.data;
      setValidatedCoupon(data);
      if (data.valid) {
        toast({
          title: "Coupon Applied",
          description: data.message || `Discount of $${data.discount?.toFixed(2)} applied!`,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: data.message || "This coupon is not valid.",
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to validate coupon code",
        variant: "destructive"
      });
    }
  });

  const checkoutMutation = useMutation({
    mutationFn: async ({ planId, userCount, couponCode }: { planId: number; userCount: number; couponCode?: string }) => {
      return apiRequest('POST', '/api/billing/checkout/create-session', {
        planId,
        userCount,
        couponCode: couponCode?.toUpperCase() || undefined,
        isYearly
      });
    },
    onSuccess: (response: any) => {
      const data = response.data;
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Checkout Error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive"
      });
    }
  });

  const handleUserCountChange = (planId: number, count: number) => {
    const plan = plans?.find(p => p.id === planId);
    if (!plan) return;
    
    const minUsers = plan.minUsers || plan.baseUsers || 1;
    const maxUsers = plan.maxUsers || 9999;
    const clampedCount = Math.min(Math.max(minUsers, count), maxUsers);
    
    setUserQuantities(prev => ({ 
      ...prev, 
      [planId]: clampedCount 
    }));
    
    setValidatedCoupon(null);
  };

  const getUserCount = (planId: number) => {
    const plan = plans?.find(p => p.id === planId);
    return userQuantities[planId] || plan?.baseUsers || 1;
  };

  const calculatePlanPrice = (plan: BillingPlan, userCount: number) => {
    if (plan.price === 0) return { basePrice: 0, perUserPrice: 0, setupFee: 0, total: 0, monthlyTotal: 0, yearlyTotal: 0, yearlySavings: 0 };
    
    // Convert from cents to dollars
    const priceInDollars = plan.price / 100;
    const perUserPriceInDollars = (plan.pricePerUser || 0) / 100;
    const setupFeeInDollars = (plan.setupFee || 0) / 100;
    
    // Derive base monthly price from plan
    // If plan is yearly, divide by 12; if monthly, use as-is
    const isYearlyPlan = plan.interval === 'yearly';
    const baseMonthlyPrice = isYearlyPlan ? priceInDollars / 12 : priceInDollars;
    
    const additionalUsers = Math.max(0, userCount - (plan.baseUsers || 1));
    const baseMonthlyPerUserPrice = additionalUsers * (isYearlyPlan ? perUserPriceInDollars / 12 : perUserPriceInDollars);
    
    const fullMonthlyPrice = baseMonthlyPrice + baseMonthlyPerUserPrice;
    
    // Apply 20% discount if yearly toggle is selected
    let monthlyTotal = fullMonthlyPrice;
    let yearlyTotal = fullMonthlyPrice * 12;
    let yearlySavings = 0;
    
    if (isYearly) {
      yearlySavings = yearlyTotal * 0.20;
      yearlyTotal = yearlyTotal - yearlySavings;
      monthlyTotal = yearlyTotal / 12;
    }
    
    return { 
      basePrice: baseMonthlyPrice, 
      perUserPrice: baseMonthlyPerUserPrice, 
      setupFee: setupFeeInDollars, 
      total: isYearly ? yearlyTotal + setupFeeInDollars : monthlyTotal + setupFeeInDollars, 
      monthlyTotal,
      yearlyTotal,
      yearlySavings
    };
  };

  const applyDiscount = (amount: number, discount?: number) => {
    if (!discount) return amount;
    return Math.max(0, amount - discount);
  };

  const handleApplyCoupon = (planId: number) => {
    if (!couponCode.trim()) {
      toast({
        title: "Enter Coupon Code",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }

    const userCount = getUserCount(planId);
    validateCouponMutation.mutate({
      code: couponCode,
      planId,
      userCount
    });
  };

  const handleCheckout = (planId: number) => {
    const plan = plans?.find(p => p.id === planId);
    if (!plan) return;

    if (plan.price === 0) {
      toast({
        title: "Free Plan",
        description: "This plan is free. No checkout required.",
      });
      return;
    }

    const userCount = getUserCount(planId);
    checkoutMutation.mutate({
      planId,
      userCount,
      couponCode: validatedCoupon?.valid ? couponCode : undefined
    });
  };

  const getPlanFeatures = (plan: BillingPlan): Feature[] => {
    if (!plan.features?.featureList) return [];
    return plan.features.featureList.map(id => allFeatures.find(f => f.id === id)).filter(Boolean) as Feature[];
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <Navigation />
      
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
      
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Perfect Plan
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Create stunning digital business cards with unlimited customization
            </p>
            
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
                    onClick={() => {
                      setIsYearly(false);
                      setValidatedCoupon(null);
                    }}
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
                    onClick={() => {
                      setIsYearly(true);
                      setValidatedCoupon(null);
                    }}
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
      
      <div className="py-16 px-4" id="plans-section">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <AnimatePresence>
              {plans?.map((plan) => {
                const userCount = getUserCount(plan.id);
                const pricing = calculatePlanPrice(plan, userCount);
                const finalTotal = applyDiscount(pricing.total, validatedCoupon?.valid && selectedPlan === plan.id ? validatedCoupon.discount : undefined);
                const popular = isPopular(plan.planType);
                const isSelected = selectedPlan === plan.id;
                const hasPerUserPricing = plan.allowUserSelection && (plan.pricePerUser || 0) > 0;
                
                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative"
                  >
                    {popular && (
                      <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white">
                        Most Popular
                      </Badge>
                    )}
                    <Card className={`border-2 hover:shadow-lg transition-all duration-200 ${
                      isSelected 
                        ? 'border-orange-500 shadow-lg ring-2 ring-orange-200' 
                        : 'border-gray-200 dark:border-gray-700'
                    } bg-white dark:bg-slate-800 h-full flex flex-col`}
                    data-testid={`plan-card-${plan.planType}`}
                    >
                      <CardHeader className="pb-4">
                        <div className="text-center">
                          <CardTitle className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {plan.name}
                          </CardTitle>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            {plan.price === 0 ? 'For Individuals' : 
                             hasPerUserPricing ? `Base: ${plan.baseUsers} user${plan.baseUsers > 1 ? 's' : ''}` : 
                             'For Individuals'}
                          </p>
                          
                          <div className="mb-6">
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                              ${pricing.monthlyTotal.toFixed(2)}/month
                            </div>
                            {plan.price > 0 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {isYearly ? `Billed at $${pricing.yearlyTotal.toFixed(2)}/year` : `Billed monthly`}
                                {pricing.setupFee > 0 && (
                                  <div className="text-xs mt-1">+ ${pricing.setupFee.toFixed(2)} setup fee</div>
                                )}
                              </div>
                            )}
                            {isYearly && pricing.yearlySavings > 0 && (
                              <Badge className="mt-2 bg-green-500 text-white">
                                Save ${pricing.yearlySavings.toFixed(2)} (20% off)
                              </Badge>
                            )}
                            {validatedCoupon?.valid && isSelected && validatedCoupon.discount && (
                              <div className="mt-2 text-sm text-green-600 dark:text-green-400 font-semibold">
                                Coupon applied: -${validatedCoupon.discount.toFixed(2)}
                              </div>
                            )}
                          </div>
                          
                          {hasPerUserPricing && (
                            <div className="mb-6 bg-gray-50 dark:bg-slate-700 p-4 rounded-lg">
                              <Label className="text-sm text-gray-600 dark:text-gray-400 mb-2 block">
                                Number of users
                              </Label>
                              <div className="flex items-center justify-center space-x-2 mb-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-md"
                                  onClick={() => handleUserCountChange(plan.id, userCount - 1)}
                                  disabled={userCount <= (plan.minUsers || plan.baseUsers || 1)}
                                  data-testid={`decrease-users-${plan.id}`}
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <div className="bg-orange-500 text-white px-4 py-2 rounded-md font-bold min-w-[60px] text-center">
                                  {userCount}
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 w-8 p-0 rounded-md"
                                  onClick={() => handleUserCountChange(plan.id, userCount + 1)}
                                  disabled={plan.maxUsers !== null && userCount >= plan.maxUsers}
                                  data-testid={`increase-users-${plan.id}`}
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                              {userCount > (plan.baseUsers || 1) && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  +${pricing.perUserPrice.toFixed(2)}/month for {userCount - (plan.baseUsers || 1)} additional user{userCount - (plan.baseUsers || 1) > 1 ? 's' : ''}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {plan.price > 0 && (
                            <div className="mb-4 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Input
                                  placeholder="Enter coupon code"
                                  value={couponCode}
                                  onChange={(e) => {
                                    setCouponCode(e.target.value.toUpperCase());
                                    setValidatedCoupon(null);
                                  }}
                                  onFocus={() => setSelectedPlan(plan.id)}
                                  className="text-sm"
                                  data-testid={`input-coupon-${plan.id}`}
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedPlan(plan.id);
                                    handleApplyCoupon(plan.id);
                                  }}
                                  disabled={validateCouponMutation.isPending || !couponCode.trim()}
                                  data-testid={`button-apply-coupon-${plan.id}`}
                                >
                                  {validateCouponMutation.isPending && isSelected ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Tag className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                          
                          <Button
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg"
                            onClick={() => {
                              setSelectedPlan(plan.id);
                              handleCheckout(plan.id);
                            }}
                            disabled={checkoutMutation.isPending && isSelected}
                            data-testid={`button-select-plan-${plan.planType}`}
                          >
                            {checkoutMutation.isPending && isSelected ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : (
                              plan.price === 0 ? 'Get Started Free' : 'Subscribe Now'
                            )}
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 flex-1">
                        <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Includes:</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {plan.businessCardsLimit === -1 ? 'Unlimited' : plan.businessCardsLimit} business card{plan.businessCardsLimit !== 1 ? 's' : ''}
                              </span>
                            </div>
                            {getPlanFeatures(plan).slice(0, 5).map((feature) => (
                              <div key={feature.id} className="flex items-center space-x-2">
                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                <span className="text-sm text-gray-600 dark:text-gray-300">{feature.name}</span>
                              </div>
                            ))}
                            {getPlanFeatures(plan).length > 5 && (
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                +{getPlanFeatures(plan).length - 5} more features
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
                We accept all major credit cards and other secure payment methods through Stripe.
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
