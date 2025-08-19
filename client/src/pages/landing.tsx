import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "wouter";

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
  buttonText: string;
  buttonVariant: "default" | "outline";
}

const pricingPlans: PricingPlan[] = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "1 Digital Business Card",
      "Basic Templates",
      "QR Code Generation",
      "Contact Sharing",
      "Basic Analytics"
    ],
    buttonText: "Get Started Free",
    buttonVariant: "outline"
  },
  {
    name: "Pro",
    price: "$9",
    period: "/month",
    description: "Best for professionals and entrepreneurs",
    features: [
      "Unlimited Business Cards",
      "Premium Templates",
      "Custom Branding",
      "Advanced Analytics",
      "Custom Domains",
      "Priority Support",
      "Lead Capture Forms",
      "Social Media Integration"
    ],
    popular: true,
    buttonText: "Start Pro Trial",
    buttonVariant: "default"
  },
  {
    name: "Enterprise",
    price: "$29",
    period: "/month",
    description: "For teams and large organizations",
    features: [
      "Everything in Pro",
      "Team Collaboration",
      "API Access",
      "White-label Solution",
      "Advanced Security",
      "Dedicated Account Manager",
      "Custom Integrations",
      "Bulk Operations"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline"
  }
];

const features = [
  {
    icon: "fas fa-magic",
    title: "AI-Powered Design",
    description: "Create stunning business cards in seconds with our intelligent design system"
  },
  {
    icon: "fas fa-mobile-alt",
    title: "Mobile Optimized",
    description: "Perfect viewing experience on all devices with responsive design"
  },
  {
    icon: "fas fa-qrcode",
    title: "Smart QR Codes",
    description: "Generate dynamic QR codes that update automatically with your latest info"
  },
  {
    icon: "fas fa-chart-line",
    title: "Real-time Analytics",
    description: "Track views, engagement, and leads with detailed analytics dashboard"
  },
  {
    icon: "fas fa-palette",
    title: "Custom Branding",
    description: "Match your brand with custom colors, fonts, and professional templates"
  },
  {
    icon: "fas fa-share-alt",
    title: "Easy Sharing",
    description: "Share via link, QR code, email, or social media with one click"
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    content: "CardFlow transformed how I network. I've generated 10x more leads since switching from paper cards."
  },
  {
    name: "Michael Chen",
    role: "Entrepreneur",
    company: "StartupXYZ",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "The analytics feature is amazing. I can see exactly who's interested in my services."
  },
  {
    name: "Emily Rodriguez",
    role: "Sales Manager",
    company: "GrowthCo",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "My conversion rate increased by 300% after switching to digital business cards."
  }
];

const faqs = [
  {
    question: "How does CardFlow compare to traditional business cards?",
    answer: "CardFlow digital business cards are environmentally friendly, always up-to-date, include rich media like videos and links, provide analytics, and cost less than constantly reprinting paper cards."
  },
  {
    question: "Can I customize the design to match my brand?",
    answer: "Absolutely! Pro and Enterprise plans include custom branding options including colors, fonts, logos, and premium templates. You can make your card uniquely yours."
  },
  {
    question: "How do people access my digital business card?",
    answer: "Share your card via QR code, direct link, email, text message, or social media. Recipients don't need to download any app - it works in any web browser."
  },
  {
    question: "What analytics do you provide?",
    answer: "Track total views, unique visitors, click-through rates on links, contact saves, and more. See when and where people engage with your card."
  },
  {
    question: "Is there a free plan available?",
    answer: "Yes! Our free plan includes 1 business card with basic features. Perfect for trying out the platform and personal use."
  },
  {
    question: "Can I import my existing contacts?",
    answer: "Yes, you can easily import your existing contact information and sync with popular CRM systems and contact management tools."
  }
];

export default function Landing() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-talklink-500 to-talklink-600 rounded-lg flex items-center justify-center">
                <i className="fas fa-address-card text-white text-sm"></i>
              </div>
              <span className="text-xl font-bold text-slate-900">CardFlow</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-slate-600 hover:text-slate-900 transition-colors">Features</a>
              <a href="#pricing" className="text-slate-600 hover:text-slate-900 transition-colors">Pricing</a>
              <a href="#templates" className="text-slate-600 hover:text-slate-900 transition-colors">Templates</a>
              <a href="#faq" className="text-slate-600 hover:text-slate-900 transition-colors">FAQ</a>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Get Started Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-12 lg:pt-32 lg:pb-20 bg-gradient-to-br from-slate-50 to-talklink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-talklink-100 text-talklink-700 hover:bg-talklink-200">
                🚀 Transform Your Networking
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
                Digital Business Cards 
                <span className="text-talklink-500"> of the Future</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                Create stunning, interactive digital business cards that generate real leads. 
                Share instantly, track engagement, and never run out of cards again.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button size="lg" className="bg-talklink-500 hover:bg-talklink-600" asChild>
                  <Link href="/register">
                    <i className="fas fa-rocket mr-2"></i>
                    Start Creating Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/builder">
                    <i className="fas fa-play mr-2"></i>
                    View Demo
                  </Link>
                </Button>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-slate-500">
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-talklink-500 mr-2"></i>
                  No credit card required
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-talklink-500 mr-2"></i>
                  Free forever plan
                </div>
                <div className="flex items-center">
                  <i className="fas fa-check-circle text-talklink-500 mr-2"></i>
                  Setup in 60 seconds
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative z-10">
                <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-300">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-talklink-400 to-talklink-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <i className="fas fa-user text-white text-2xl"></i>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">John Smith</h3>
                    <p className="text-slate-600 mb-4">Digital Marketing Expert</p>
                    
                    <div className="space-y-2">
                      <button className="w-full bg-slate-800 text-white py-2 rounded-lg text-sm">
                        <i className="fas fa-address-book mr-2"></i>Save Contact
                      </button>
                      <button className="w-full bg-talklink-500 text-white py-2 rounded-lg text-sm">
                        <i className="fas fa-calendar mr-2"></i>Book Meeting
                      </button>
                    </div>
                    
                    <div className="flex justify-center space-x-3 mt-4">
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <i className="fab fa-linkedin-in text-white text-xs"></i>
                      </div>
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <i className="fab fa-twitter text-white text-xs"></i>
                      </div>
                      <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                        <i className="fas fa-envelope text-white text-xs"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute top-10 -left-4 w-16 h-16 bg-talklink-200 rounded-full opacity-60 animate-pulse"></div>
              <div className="absolute bottom-10 -right-4 w-20 h-20 bg-blue-200 rounded-full opacity-40 animate-pulse delay-300"></div>
              <div className="absolute top-1/2 -right-8 w-12 h-12 bg-purple-200 rounded-full opacity-50 animate-pulse delay-700"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need to Stand Out
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful features designed to help you create professional digital business cards 
              that convert prospects into customers.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-talklink-500 to-talklink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i className={`${feature.icon} text-white text-xl`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gradient-to-br from-slate-50 to-talklink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Choose the perfect plan for your needs. Upgrade or downgrade at any time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-2 border-talklink-500 shadow-xl scale-105' : 'border border-slate-200'}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-talklink-500 text-white">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold text-slate-900">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <CardDescription className="text-slate-600 mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <i className="fas fa-check text-talklink-500 mr-3"></i>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-talklink-500 hover:bg-talklink-600' : ''}`}
                    variant={plan.buttonVariant}
                    size="lg"
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Loved by Professionals Worldwide
            </h2>
            <p className="text-xl text-slate-600">
              Join thousands of professionals who've transformed their networking with CardFlow
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex items-center mb-6">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900">{testimonial.name}</h4>
                      <p className="text-slate-600 text-sm">{testimonial.role}</p>
                      <p className="text-slate-500 text-sm">{testimonial.company}</p>
                    </div>
                  </div>
                  <blockquote className="text-slate-700 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div className="flex text-yellow-400 mt-4">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-slate-600">
              Everything you need to know about CardFlow
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Collapsible 
                key={index}
                open={expandedFaq === index}
                onOpenChange={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <Card className="border border-slate-200">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-slate-50">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-left text-lg font-semibold text-slate-900">
                          {faq.question}
                        </CardTitle>
                        <i className={`fas fa-chevron-${expandedFaq === index ? 'up' : 'down'} text-slate-400`}></i>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <p className="text-slate-600 leading-relaxed">{faq.answer}</p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-talklink-500 to-talklink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Networking?
          </h2>
          <p className="text-xl text-talklink-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who've ditched paper cards forever. 
            Create your first digital business card in under 60 seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-talklink-600 hover:bg-slate-100" asChild>
              <Link href="/register">
                <i className="fas fa-rocket mr-2"></i>
                Start Free Today
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-talklink-600" asChild>
              <Link href="/builder">
                <i className="fas fa-play mr-2"></i>
                Try Demo
              </Link>
            </Button>
          </div>
          
          <p className="text-talklink-200 mt-6 text-sm">
            No credit card required • Free forever plan • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-talklink-500 to-talklink-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-address-card text-white text-sm"></i>
                </div>
                <span className="text-xl font-bold">CardFlow</span>
              </div>
              <p className="text-slate-400 mb-6">
                The future of business networking is here. Create beautiful, interactive digital business cards that work.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Product</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#templates" className="hover:text-white transition-colors">Templates</a></li>
                <li><a href="/builder" className="hover:text-white transition-colors">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Support</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6">Company</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 CardFlow. All rights reserved. Made with ❤️ for the future of networking.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}