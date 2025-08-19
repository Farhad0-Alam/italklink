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
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-talklink-50 rounded-full mb-8">
              <div className="w-2 h-2 bg-talklink-500 rounded-full mr-3 animate-pulse"></div>
              <span className="text-talklink-700 font-medium text-sm">Transform Your Professional Network</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[0.9] tracking-tight">
              Digital Cards.
              <br />
              <span className="text-talklink-500">Real Results.</span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Create stunning digital business cards in 60 seconds.
              <br className="hidden sm:block" />
              Share instantly. Track everything. Never run out.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button size="lg" className="bg-talklink-500 hover:bg-talklink-600 text-lg px-8 py-4 h-auto" asChild>
                <Link href="/register">
                  Create Your Card Free
                  <i className="fas fa-arrow-right ml-2"></i>
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 h-auto border-2" asChild>
                <Link href="/builder">
                  <i className="fas fa-play mr-2"></i>
                  Watch Demo
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-talklink-500 rounded-full mr-3"></div>
                No credit card
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-talklink-500 rounded-full mr-3"></div>
                Free forever
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-talklink-500 rounded-full mr-3"></div>
                60-second setup
              </div>
            </div>
          </div>
          
          {/* Interactive Card Preview */}
          <div className="relative max-w-md mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-talklink-400 to-blue-500 rounded-3xl blur-2xl opacity-20 scale-110"></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-slate-100">
              <div className="text-center">
                <div className="relative inline-block mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-talklink-500 to-talklink-600 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-user text-white text-2xl"></i>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                    <i className="fas fa-check text-white text-xs"></i>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Alex Rivera</h3>
                <p className="text-slate-600 mb-6">Product Designer</p>
                
                <div className="space-y-3 mb-6">
                  <button className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors">
                    <i className="fas fa-download mr-2"></i>Save Contact
                  </button>
                  <button className="w-full bg-talklink-500 text-white py-3 rounded-xl text-sm font-medium hover:bg-talklink-600 transition-colors">
                    <i className="fas fa-calendar mr-2"></i>Schedule Meeting
                  </button>
                </div>
                
                <div className="flex justify-center space-x-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                    <i className="fab fa-linkedin-in text-slate-600"></i>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                    <i className="fab fa-twitter text-slate-600"></i>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                    <i className="fas fa-envelope text-slate-600"></i>
                  </div>
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer">
                    <i className="fas fa-globe text-slate-600"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Built for Modern
              <span className="text-talklink-500"> Professionals</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Everything you need to create, share, and track your digital presence.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="group">
                <div className="bg-white rounded-2xl p-8 h-full hover:shadow-xl transition-all duration-300 border border-slate-100 hover:-translate-y-1">
                  <div className="w-14 h-14 bg-talklink-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-talklink-500 transition-colors duration-300">
                    <i className={`${feature.icon} text-talklink-500 group-hover:text-white text-xl transition-colors duration-300`}></i>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Button size="lg" className="bg-talklink-500 hover:bg-talklink-600 text-lg px-8 py-4 h-auto" asChild>
              <Link href="/register">
                Start Building Your Card
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              Choose Your
              <span className="text-talklink-500"> Growth Plan</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-light">
              Start free. Scale as you grow. Cancel anytime.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`relative ${plan.popular ? 'scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-talklink-500 text-white px-6 py-2 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                <div className={`bg-white rounded-3xl p-8 h-full ${plan.popular ? 'border-2 border-talklink-500 shadow-2xl' : 'border border-slate-200 shadow-lg'} hover:shadow-xl transition-all duration-300`}>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-5xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-500 text-lg">{plan.period}</span>
                    </div>
                    <p className="text-slate-600">{plan.description}</p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <div className="w-5 h-5 bg-talklink-100 rounded-full flex items-center justify-center mt-0.5 mr-3 flex-shrink-0">
                          <i className="fas fa-check text-talklink-500 text-xs"></i>
                        </div>
                        <span className="text-slate-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full h-12 text-base font-medium ${plan.popular ? 'bg-talklink-500 hover:bg-talklink-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
                    asChild
                  >
                    <Link href="/register">
                      {plan.buttonText}
                    </Link>
                  </Button>
                </div>
              </div>
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
      <section className="py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-8 tracking-tight">
            Ready to Go
            <span className="text-talklink-400"> Digital?</span>
          </h2>
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto font-light">
            Join thousands of professionals creating their digital presence.
            <br />Get started in 60 seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button size="lg" className="bg-talklink-500 hover:bg-talklink-600 text-lg px-8 py-4 h-auto" asChild>
              <Link href="/register">
                Create Your Card Free
                <i className="fas fa-arrow-right ml-2"></i>
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8 py-4 h-auto" asChild>
              <Link href="/builder">
                <i className="fas fa-play mr-2"></i>
                Watch Demo
              </Link>
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-slate-400">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-talklink-500 rounded-full mr-3"></div>
              No credit card required
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-talklink-500 rounded-full mr-3"></div>
              Free forever plan
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-talklink-500 rounded-full mr-3"></div>
              Cancel anytime
            </div>
          </div>
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