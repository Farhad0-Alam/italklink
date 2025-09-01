import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Navigation } from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, Star, Sparkles, Zap, Crown, Infinity } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-orange-600/10"></div>
        <div className="relative container mx-auto text-center max-w-4xl">
          <motion.div variants={fadeInUp} className="mb-6">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 text-sm px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              Professional Digital Business Cards
            </Badge>
          </motion.div>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-black bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent mb-6"
          >
            Choose Your Perfect Plan
          </motion.h1>
          
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12"
          >
            Create stunning digital business cards with unlimited customization. 
            From individuals to enterprise teams, we have the perfect solution for your needs.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div 
            variants={fadeInUp}
            className="flex items-center justify-center mb-16"
          >
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-4 px-4 py-2">
                <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <Switch 
                  checked={isYearly}
                  onCheckedChange={setIsYearly}
                  className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500"
                  data-testid="switch-billing-toggle"
                />
                <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-slate-900 dark:text-white' : 'text-gray-500'}`}>
                  Yearly
                </span>
                {isYearly && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 text-xs">
                    Save 20%
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Pricing Cards */}
      <motion.section 
        className="relative py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-7xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-6">
            <AnimatePresence>
              {plans?.map((plan, index) => {
                const IconComponent = getPlanIcon(plan.planType);
                const features = getPlanFeatures(plan);
                const displayPrice = getDisplayPrice(plan);
                const billingPrice = getActualBillingPrice(plan);
                const popular = isPopular(plan.planType);
                
                return (
                  <motion.div
                    key={plan.id}
                    variants={fadeInUp}
                    whileHover="hover"
                    className="relative"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {popular && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                        <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0 px-4 py-1">
                          <Star className="w-3 h-3 mr-1" />
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    <motion.div variants={cardHover}>
                      <Card className={`relative h-full overflow-hidden border-2 transition-all duration-300 ${
                        popular 
                          ? 'border-orange-200 dark:border-orange-800 shadow-xl shadow-orange-100 dark:shadow-orange-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${getPlanColor(plan.planType)} opacity-5`}></div>
                        
                        <CardHeader className="relative text-center pb-8">
                          <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${getPlanColor(plan.planType)} mb-4`}>
                            <IconComponent className="w-6 h-6 text-white" />
                          </div>
                          
                          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            {plan.name}
                          </CardTitle>
                          
                          <div className="mb-4">
                            <div className="flex items-baseline justify-center mb-2">
                              <span className="text-5xl font-black text-slate-900 dark:text-white">
                                ${displayPrice === 0 ? '0' : displayPrice}
                              </span>
                              <span className="text-lg text-gray-500 ml-2">
                                /month
                              </span>
                            </div>
                            
                            {isYearly && plan.price > 0 && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Billed annually at ${Math.round(billingPrice / 100)}
                              </p>
                            )}
                            
                            {!isYearly && plan.price > 0 && (
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Billed monthly
                              </p>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="relative">
                          {/* Business Cards Limit */}
                          <div className="mb-6">
                            <div className="flex items-center justify-center mb-2">
                              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                {plan.businessCardsLimit === -1 ? '∞' : plan.businessCardsLimit}
                              </span>
                              <span className="text-gray-600 dark:text-gray-400 ml-2">
                                Business Cards
                              </span>
                            </div>
                          </div>

                          {/* Features List */}
                          <ul className="space-y-3 mb-8">
                            {features.map((feature, idx) => (
                              <motion.li
                                key={feature.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="flex items-start"
                              >
                                <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                                <div>
                                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                                    {feature.name}
                                  </span>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                    {feature.description}
                                  </p>
                                </div>
                              </motion.li>
                            ))}
                            
                            {/* Unlimited Custom Features */}
                            <motion.li
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: features.length * 0.1 }}
                              className="flex items-start border-t border-gray-200 dark:border-gray-700 pt-3"
                            >
                              <div className="flex-shrink-0 w-5 h-5 bg-gradient-to-r from-purple-400 to-purple-500 rounded-full flex items-center justify-center mt-0.5 mr-3">
                                <Infinity className="w-3 h-3 text-white" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-slate-900 dark:text-white">
                                  Unlimited Custom Features
                                </span>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  Add unlimited custom contact buttons, links, and interactive elements
                                </p>
                              </div>
                            </motion.li>
                          </ul>
                          
                          {/* CTA Button */}
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Button
                              className={`w-full py-3 text-base font-semibold transition-all duration-300 ${
                                popular
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
                                  : plan.price === 0
                                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                                  : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white'
                              }`}
                              onClick={() => setSelectedPlan(plan.id)}
                              data-testid={`button-select-${plan.planType}`}
                            >
                              {plan.price === 0 ? 'Get Started Free' : 'Choose Plan'}
                            </Button>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.section>

      {/* Feature Categories Section */}
      <motion.section 
        className="relative py-20 px-4 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-6xl">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive feature set helps you create professional digital business cards 
              that make lasting impressions and drive real business results.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {['Design', 'Customization', 'Analytics', 'Professional', 'Enterprise'].map((category, index) => {
              const categoryFeatures = allFeatures.filter(f => f.category === category);
              if (categoryFeatures.length === 0) return null;
              
              return (
                <motion.div
                  key={category}
                  variants={fadeInUp}
                  className="relative"
                >
                  <Card className="h-full border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
                    <CardHeader className="text-center pb-4">
                      <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 mb-4 mx-auto">
                        {categoryFeatures[0] && (() => {
                          const IconComponent = categoryFeatures[0].icon;
                          return <IconComponent className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">
                        {category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {categoryFeatures.map((feature) => (
                          <li key={feature.id} className="flex items-start">
                            <Check className="w-4 h-4 text-green-500 mt-1 mr-3 flex-shrink-0" />
                            <div>
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {feature.name}
                              </span>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                {feature.description}
                              </p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Unlimited Custom Features Highlight */}
      <motion.section 
        className="relative py-20 px-4"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div variants={fadeInUp}>
            <Card className="border-0 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 text-white shadow-2xl">
              <CardContent className="p-12">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-white/20 p-4 rounded-full">
                    <Infinity className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h3 className="text-3xl font-bold mb-4">
                  Unlimited Custom Features
                </h3>
                
                <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                  Create unlimited custom contact buttons, interactive elements, and personalized features. 
                  Your imagination is the only limit.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  {[
                    { icon: Zap, title: "Custom Buttons", desc: "Unlimited action buttons" },
                    { icon: Star, title: "Interactive Elements", desc: "Rich media and animations" },
                    { icon: Crown, title: "Personal Branding", desc: "Complete brand control" }
                  ].map((item, idx) => (
                    <div key={idx} className="text-center">
                      <div className="bg-white/20 p-3 rounded-xl inline-flex mb-3">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold mb-2">{item.title}</h4>
                      <p className="text-sm opacity-80">{item.desc}</p>
                    </div>
                  ))}
                </div>
                
                <Button 
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 font-semibold px-8 py-3"
                  data-testid="button-unlimited-features"
                >
                  Explore Unlimited Features
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        className="relative py-20 px-4 bg-white/30 dark:bg-slate-800/30"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="container mx-auto max-w-4xl">
          <motion.div variants={fadeInUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-6">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-6">
            {[
              {
                q: "What's included in unlimited custom features?",
                a: "Create unlimited contact buttons, custom links, interactive elements, media embeds, and personalized sections. Add any contact method or call-to-action you need."
              },
              {
                q: "How does annual billing work?",
                a: "When you choose yearly billing, you'll see the monthly equivalent price but pay annually for a 20% discount. You can cancel anytime with no penalties."
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Yes! You can change your plan at any time. Upgrades take effect immediately, and downgrades occur at your next billing cycle."
              },
              {
                q: "Do you offer enterprise discounts?",
                a: "Yes, we offer custom pricing for teams of 50+ users. Contact our sales team for a personalized quote and enterprise features."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {faq.a}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="relative py-20 px-4"
        initial="initial"
        animate="animate"
        variants={fadeInUp}
      >
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="border-0 bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-800 dark:to-slate-600 text-white shadow-2xl">
            <CardContent className="p-12">
              <h3 className="text-3xl font-bold mb-4">
                Ready to Transform Your Networking?
              </h3>
              <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
                Join thousands of professionals who've already upgraded to digital business cards.
                Start creating your professional presence today.
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold px-8 py-3"
                data-testid="button-start-free"
              >
                Start Free Trial
              </Button>
            </CardContent>
          </Card>
        </div>
      </motion.section>
    </div>
  );
}