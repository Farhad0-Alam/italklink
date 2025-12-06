import { useState, useEffect } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Link } from "wouter";
import { 
  Sparkles, Calendar, Users, BarChart3, Bell, Zap, Globe, 
  QrCode, Smartphone, Layout, MessageSquare, Bot, Brain, FileText,
  Camera, Video, Mail, Phone, MapPin, Share2, CreditCard, Clock,
  TrendingUp, Target, Workflow, Megaphone, Database, ShieldCheck,
  Palette, Layers, Code, Wand2, CircleDot, ChevronDown, ChevronRight,
  CheckCircle2, Star, ArrowRight, PlayCircle, Image, Sliders
} from "lucide-react";
import { Footer } from "@/components/Footer";

// Premium Animated Logo Component with coordinated sequence
const AnimatedLandingLogo = () => {
  const spiralControls = useAnimationControls();
  const dotControls = useAnimationControls();

  useEffect(() => {
    const runAnimation = async () => {
      while (true) {
        // Step 1: Rotate spiral for 4 seconds
        await spiralControls.start({
          rotate: 360,
          transition: { duration: 4, ease: "linear" }
        });
        
        // Reset rotation for next cycle
        spiralControls.set({ rotate: 0 });
        
        // Step 2: Cricket ball bounce - 3 bounces hitting top of circle
        // Bounce 1 - highest
        await dotControls.start({
          y: -170,
          transition: { duration: 0.25, ease: "easeOut" }
        });
        await dotControls.start({
          y: 0,
          transition: { duration: 0.25, ease: "easeIn" }
        });
        
        // Bounce 2 - medium (losing energy)
        await dotControls.start({
          y: -130,
          transition: { duration: 0.22, ease: "easeOut" }
        });
        await dotControls.start({
          y: 0,
          transition: { duration: 0.22, ease: "easeIn" }
        });
        
        // Bounce 3 - lowest
        await dotControls.start({
          y: -80,
          transition: { duration: 0.18, ease: "easeOut" }
        });
        await dotControls.start({
          y: 0,
          transition: { duration: 0.18, ease: "easeIn" }
        });
        
        // Step 3: Wait 5 seconds before repeating
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    };
    
    runAnimation();
  }, [spiralControls, dotControls]);

  return (
    <motion.div 
      className="w-8 h-8 rounded-lg overflow-hidden shadow-lg"
      whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(34, 197, 94, 0.6)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <svg viewBox="0 0 1000 1000" className="w-full h-full">
        {/* Green background */}
        <path fill="#22c55e" d="M817.9,999.9H182.1C81.8,999.9-0.2,917.8-0.2,817.5v-635C-0.2,82.2,81.8,0.1,182.1,0.1h635.7c100.3,0,182.4,82.1,182.4,182.4v635C1000.2,917.8,918.2,999.9,817.9,999.9z"/>
        
        {/* White "i" spiral stroke - controlled rotation */}
        <motion.g
          style={{ transformOrigin: "500px 500px" }}
          animate={spiralControls}
        >
          <path 
            fill="none" 
            stroke="#FFFFFF" 
            strokeWidth="70" 
            strokeMiterlimit="10" 
            d="M315,857c-116.4-65.3-195-189.8-195-332.7C120,313.7,290.7,143,501.3,143c210.6,0,381.2,170.7,381.2,381.2c0,82.3-26.7,166.9-77.1,232.3c-47.2,61.2-124.5,112.4-204.8,97.6c-27.8-5.1-55-17.9-74.7-38.6c-17.8-18.8-26.3-42.5-27.2-68V437"
          />
        </motion.g>
        
        {/* White dot - controlled cricket ball bounce */}
        <motion.ellipse
          cx="498.5"
          cy="357.5"
          rx="44.5"
          ry="44.5"
          fill="#FFFFFF"
          animate={dotControls}
        />
      </svg>
    </motion.div>
  );
};

// Comprehensive feature data organized by category
const cardBuilderElements = [
  { icon: "fas fa-heading", name: "Headings", description: "Multiple heading levels" },
  { icon: "fas fa-paragraph", name: "Text Blocks", description: "Rich paragraph text" },
  { icon: "fas fa-image", name: "Images", description: "Upload & display images" },
  { icon: "fas fa-images", name: "Image Sliders", description: "Beautiful carousels" },
  { icon: "fas fa-video", name: "Videos", description: "Embed videos" },
  { icon: "fas fa-file-pdf", name: "PDF Viewer", description: "Display PDF documents" },
  { icon: "fas fa-link", name: "Link Buttons", description: "Call-to-action buttons" },
  { icon: "fas fa-qrcode", name: "QR Codes", description: "Dynamic QR generation" },
  { icon: "fas fa-phone", name: "Contact Section", description: "Phone, email, address" },
  { icon: "fas fa-share-nodes", name: "Social Links", description: "Social media icons" },
  { icon: "fas fa-envelope", name: "Contact Forms", description: "Custom form builder" },
  { icon: "fas fa-list", name: "Accordions", description: "Collapsible sections" },
  { icon: "fas fa-quote-left", name: "Testimonials", description: "Customer reviews" },
  { icon: "fas fa-map-marker-alt", name: "Google Maps", description: "Location embeds" },
  { icon: "fas fa-code", name: "HTML", description: "Custom HTML code" },
  { icon: "fas fa-robot", name: "AI Chatbot", description: "Smart assistant" },
  { icon: "fas fa-brain", name: "RAG Knowledge Base", description: "AI-powered Q&A" },
  { icon: "fas fa-file-upload", name: "Document Manager", description: "Upload training docs" },
  { icon: "fas fa-globe", name: "URL Manager", description: "Import web content" },
  { icon: "fas fa-wallet", name: "Apple Wallet", description: "Wallet passes" },
  { icon: "fas fa-wallet", name: "Google Wallet", description: "Wallet passes" },
  { icon: "fas fa-calendar-check", name: "Book Appointment", description: "Booking button" },
  { icon: "fas fa-phone-volume", name: "Schedule Call", description: "Call scheduling" },
  { icon: "fas fa-handshake", name: "Meeting Request", description: "Request meetings" },
  { icon: "fas fa-cube", name: "AR Preview", description: "Augmented reality" },
  { icon: "fas fa-bars", name: "Navigation Menu", description: "Multi-page navigation" }
];

const appointmentFeatures = [
  { icon: Calendar, title: "Public Booking Pages", description: "Multi-step booking flow with timezone detection" },
  { icon: Clock, title: "Event Types", description: "Different appointment types with custom durations" },
  { icon: Users, title: "Team Scheduling", description: "Round-robin assignment & collective availability" },
  { icon: Globe, title: "Calendar Integration", description: "Google Calendar, Zoom, Microsoft Teams sync" },
  { icon: Clock, title: "Availability Management", description: "Set working hours & buffer times" },
  { icon: CreditCard, title: "Payment Processing", description: "Stripe integration with multi-currency" },
  { icon: Bell, title: "Automated Reminders", description: "Email & SMS notifications" },
  { icon: BarChart3, title: "Booking Analytics", description: "Track conversions & no-shows" }
];

const crmFeatures = [
  { icon: Users, title: "Auto Lead Capture", description: "Card views & bookings create contacts" },
  { icon: Database, title: "Contact Management", description: "Lead scoring & lifecycle stages" },
  { icon: Layers, title: "Visual Pipeline", description: "Kanban board with drag-drop" },
  { icon: CheckCircle2, title: "Task Management", description: "Assign, prioritize, track tasks" },
  { icon: FileText, title: "Activity Timeline", description: "Complete interaction history" },
  { icon: ShieldCheck, title: "Team Collaboration", description: "Role-based access control" }
];

const automationFeatures = [
  { icon: Bell, title: "Multi-Channel Notifications", description: "Email, SMS, push notifications" },
  { icon: FileText, title: "Custom Templates", description: "Personalized message templates" },
  { icon: Workflow, title: "Follow-up Sequences", description: "Automated drip campaigns" },
  { icon: Bot, title: "AI Chatbot", description: "Intelligent customer support" },
  { icon: Brain, title: "RAG Knowledge Base", description: "Train AI on your documents" },
  { icon: Layout, title: "Form Builder", description: "Custom lead capture forms" }
];

const analyticsFeatures = [
  { icon: BarChart3, title: "Booking Trends", description: "Appointment analytics & forecasting" },
  { icon: TrendingUp, title: "Conversion Tracking", description: "View-to-booking conversion rates" },
  { icon: CreditCard, title: "Revenue Analytics", description: "Track earnings & commissions" },
  { icon: Target, title: "Engagement Metrics", description: "Card views & click tracking" },
  { icon: Clock, title: "No-Show Analysis", description: "Track & reduce no-shows" },
  { icon: FileText, title: "Export Reports", description: "Download data in multiple formats" }
];

const emailSignatureFeatures = [
  { icon: Layout, title: "Multiple Templates", description: "Simple, Advanced, and Premium signature designs" },
  { icon: Palette, title: "Full Customization", description: "Custom fonts, colors, sizes, and styles" },
  { icon: Mail, title: "Contact Info Fields", description: "Name, title, company, phones, email, website, address" },
  { icon: Share2, title: "Social Links", description: "Add LinkedIn, Twitter, Facebook, Instagram links" },
  { icon: Image, title: "Profile Images", description: "Add your photo or company logo" },
  { icon: Code, title: "HTML Export", description: "Copy ready-to-use HTML for any email client" },
  { icon: CheckCircle2, title: "Live Preview", description: "See changes in real-time as you design" },
  { icon: Smartphone, title: "Email Client Compatible", description: "Works with Gmail, Outlook, Apple Mail, and more" }
];

const qrCodeFeatures = [
  { icon: QrCode, title: "Dynamic Generation", description: "Instantly create QR codes for any content" },
  { icon: Palette, title: "Color Customization", description: "Match your brand with custom colors" },
  { icon: Sliders, title: "Size Options", description: "Generate codes in any size you need" },
  { icon: Image, title: "Logo Embedding", description: "Add your logo to the center of QR codes" },
  { icon: FileText, title: "Multiple Formats", description: "Download as PNG, SVG, or PDF" },
  { icon: Share2, title: "Share Anywhere", description: "Business cards, marketing materials, websites" }
];

const integrations = [
  { name: "Google Calendar", icon: "fab fa-google", color: "bg-blue-500" },
  { name: "Zoom", icon: "fas fa-video", color: "bg-blue-600" },
  { name: "Microsoft Teams", icon: "fab fa-microsoft", color: "bg-blue-700" },
  { name: "Stripe", icon: "fab fa-stripe", color: "bg-purple-600" },
  { name: "Email", icon: "fas fa-envelope", color: "bg-red-500" },
  { name: "SMS", icon: "fas fa-sms", color: "bg-green-500" }
];

const pricingTiers = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for individuals",
    features: ["1 Digital Card", "Basic Templates", "QR Code", "Limited Analytics"],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$19",
    description: "For professionals",
    features: ["Unlimited Cards", "All Templates", "Appointment Booking", "Full CRM", "Advanced Analytics", "Custom Branding"],
    cta: "Start Free Trial",
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams & businesses",
    features: ["Everything in Pro", "Team Collaboration", "API Access", "White Label", "Priority Support", "Custom Integration"],
    cta: "Contact Sales",
    popular: false
  }
];

const faqs = [
  {
    question: "What makes iTalkLink different from other digital business card platforms?",
    answer: "iTalkLink is a complete business solution, not just a card creator. You get digital business cards PLUS appointment booking, CRM, AI chatbot, automated notifications, and analytics - all in one platform. It's like having a virtual sales team working 24/7."
  },
  {
    question: "Can I add AI chatbot to my business card?",
    answer: "Yes! Our AI-powered chatbot and RAG Knowledge Base let you train an AI assistant on your documents and website content. It can answer questions, qualify leads, and provide 24/7 customer support directly from your digital card."
  },
  {
    question: "How does appointment booking work?",
    answer: "Add booking elements to your card, connect your calendar (Google/Zoom/Teams), set your availability, and clients can book directly. You'll get automatic reminders, can accept payments via Stripe, and track all bookings in your CRM."
  },
  {
    question: "What builder elements can I add to my cards?",
    answer: "Over 25 elements including: text, images, videos, PDFs, contact forms, AI chatbot, QR codes, social links, testimonials, maps, appointment booking, AR preview, digital wallet passes, and more. Build rich, interactive experiences!"
  },
  {
    question: "Does it include CRM and lead management?",
    answer: "Yes! Every card view and appointment automatically creates a contact in your CRM. Track leads through your pipeline, manage tasks, score contacts, and see complete activity timelines. Perfect for sales teams."
  },
  {
    question: "Can I use it for my team?",
    answer: "Absolutely! Enterprise plans include team scheduling, role-based access, shared pipelines, and collaborative workflows. Perfect for agencies, sales teams, and businesses."
  }
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Marketing Director",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    content: "The AI chatbot on my card has qualified 100+ leads automatically. Game changer!"
  },
  {
    name: "Michael Chen",
    role: "Entrepreneur",
    company: "StartupXYZ",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    content: "Appointment booking + CRM in one platform saved me $200/month in software costs."
  },
  {
    name: "Emily Rodriguez",
    role: "Sales Manager",
    company: "GrowthCo",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    content: "My team's conversion rate increased 300% with the automated follow-up system."
  }
];

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08
    }
  }
};

export default function Landing() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <motion.nav 
        className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-gray-200 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <motion.div 
              className="flex items-center space-x-2 flex-shrink-0"
              whileHover={{ scale: 1.05, transition: { type: "spring", stiffness: 400 } }}
            >
              <AnimatedLandingLogo />
              <span className="text-lg sm:text-xl font-bold text-gray-900 whitespace-nowrap">iTalkLink</span>
            </motion.div>
            
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-6 overflow-x-auto flex-1 justify-center">
              {[
                { label: "Features", hash: "features" },
                { label: "Appointments", hash: "appointments" },
                { label: "Email Sig", hash: "email-signatures" },
                { label: "QR Code", hash: "qr-codes" },
                { label: "Automation", hash: "automation" },
                { label: "Analytics", hash: "analytics" },
                { label: "Integrations", hash: "integrations" },
                { label: "FAQ", hash: "faq" }
              ].map((item) => (
                <a 
                  key={item.hash}
                  href={`#${item.hash}`}
                  className="text-gray-600 hover:text-green-600 transition-colors font-medium whitespace-nowrap text-sm xl:text-base"
                  data-testid={`link-nav-${item.hash}`}
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <Button variant="ghost" asChild className="font-medium text-sm sm:text-base px-2 sm:px-4" data-testid="button-signin">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild className="bg-green-600 hover:bg-green-700 font-medium text-sm sm:text-base px-3 sm:px-6 h-9 sm:h-10" data-testid="button-get-started-nav">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section id="about" className="pt-32 pb-20 bg-gradient-to-br from-green-50 via-white to-blue-50 overflow-hidden relative w-full">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="w-full relative px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-4 py-2 bg-green-100 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-700 font-semibold text-sm">All-in-One Business Platform</span>
            </motion.div>
            
            <motion.h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Digital Cards +<br />
              <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                AI + Booking + CRM
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Create smart business cards with AI chatbot, appointment booking, and built-in CRM.
              <br className="hidden sm:block" />
              <span className="font-semibold text-gray-800">Everything you need to grow your business.</span>
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Button size="lg" className="bg-green-600 hover:bg-green-700 text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto shadow-xl hover:shadow-2xl transition-all w-full sm:w-auto" asChild data-testid="button-create-card-hero">
                <Link href="/register">
                  <Sparkles className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Create Card Free
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto border-2 border-gray-300 hover:border-green-600 hover:text-green-600 transition-all w-full sm:w-auto" asChild data-testid="button-watch-demo">
                <Link href="/dashboard">
                  <PlayCircle className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                  Watch Demo
                </Link>
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-gray-500 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>No credit card</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>Free forever</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                <span>60 sec setup</span>
              </div>
            </motion.div>
          </div>
          
          {/* Hero Card Preview */}
          <motion.div 
            className="w-full max-w-5xl mx-auto px-4 mt-6 sm:mt-10"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 via-green-500 to-blue-500 rounded-2xl sm:rounded-3xl blur-3xl opacity-20"></div>
              
              {/* Main preview card */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-1 border border-gray-200">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl sm:rounded-2xl p-4 sm:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                    {/* Card Preview */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                      <div className="flex items-center justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-2xl flex items-center justify-center">
                          <i className="fas fa-user text-white text-2xl"></i>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 text-center mb-1">Alex Rivera</h3>
                      <p className="text-gray-600 text-center text-sm mb-4">Product Designer</p>
                      
                      {/* Quick Action Buttons */}
                      <div className="flex justify-center gap-3 mb-4">
                        <div className="text-center">
                          <button className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors" data-testid="button-preview-call">
                            <i className="fas fa-phone text-white text-sm"></i>
                          </button>
                          <span className="text-xs text-gray-600 mt-1 block">Call</span>
                        </div>
                        <div className="text-center">
                          <button className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors" data-testid="button-preview-email">
                            <i className="fas fa-envelope text-white text-sm"></i>
                          </button>
                          <span className="text-xs text-gray-600 mt-1 block">Email</span>
                        </div>
                        <div className="text-center">
                          <button className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors" data-testid="button-preview-text">
                            <i className="fas fa-comment text-white text-sm"></i>
                          </button>
                          <span className="text-xs text-gray-600 mt-1 block">Text</span>
                        </div>
                        <div className="text-center">
                          <button className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors" data-testid="button-preview-website">
                            <i className="fas fa-globe text-white text-sm"></i>
                          </button>
                          <span className="text-xs text-gray-600 mt-1 block">Website</span>
                        </div>
                      </div>
                      
                      <button className="w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors mb-2" data-testid="button-preview-save-contact">
                        <i className="fas fa-download mr-2"></i>Save Contact
                      </button>
                      <button className="w-full bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors" data-testid="button-preview-book-meeting">
                        <i className="fas fa-calendar mr-2"></i>Book Meeting
                      </button>
                    </div>
                    
                    {/* Features highlight */}
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-start space-x-3 bg-white rounded-xl p-4 border border-gray-100">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">AI Chatbot Included</h4>
                          <p className="text-gray-600 text-xs">24/7 automated customer support</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white rounded-xl p-4 border border-gray-100">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Appointment Booking</h4>
                          <p className="text-gray-600 text-xs">Clients book directly from your card</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3 bg-white rounded-xl p-4 border border-gray-100">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Database className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">Built-in CRM</h4>
                          <p className="text-gray-600 text-xs">Track leads & manage pipeline</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Digital Business Cards Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
              <Layout className="w-3 h-3 mr-1" />
              25+ Builder Elements
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Build <span className="text-green-600">Anything</span> You Want
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create rich, interactive digital business cards with 25+ powerful elements.
              From AI chatbots to appointment booking, build the perfect experience for your clients.
            </p>
          </motion.div>

          {/* Builder Elements Grid */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {cardBuilderElements.map((element, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group"
              >
                <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 h-full cursor-pointer" data-testid={`card-builder-element-${index}`}>
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <i className={`${element.icon} text-green-600 text-lg`}></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1" data-testid={`text-element-${index}-name`}>{element.name}</h4>
                    <p className="text-gray-600 text-xs" data-testid={`text-element-${index}-desc`}>{element.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Featured Elements Spotlight */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <motion.div
              className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 border-2 border-green-200"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Bot className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Chatbot</h3>
              <p className="text-gray-700 mb-4">
                Add an intelligent chatbot to your card that answers questions, qualifies leads, 
                and provides 24/7 customer support automatically.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  Custom personality & responses
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  Lead qualification automation
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" />
                  24/7 availability
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border-2 border-blue-200"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">RAG Knowledge Base</h3>
              <p className="text-gray-700 mb-4">
                Train AI on your documents and website content to create an intelligent 
                knowledge assistant for your customers.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  Upload PDFs & documents
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  Import website URLs
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                  Accurate AI responses
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 border-2 border-purple-200"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                <Layers className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Multi-Page Cards</h3>
              <p className="text-gray-700 mb-4">
                Create comprehensive digital experiences with multiple pages, custom navigation, 
                and professional templates.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  Unlimited pages
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  Custom menu navigation
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mr-2 flex-shrink-0" />
                  Professional templates
                </li>
              </ul>
            </motion.div>
          </div>

          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button size="lg" className="bg-green-600 hover:bg-green-700 text-lg px-8 py-6 h-auto shadow-lg" asChild>
              <Link href="/register">
                Start Building Your Card
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Appointment Booking Section */}
      <section id="appointments" className="py-24 bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
              <Calendar className="w-3 h-3 mr-1" />
              Appointment Booking
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Let Clients <span className="text-blue-600">Book Instantly</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Add appointment booking to your card. Clients book meetings directly, 
              sync with your calendar, accept payments, and automate everything.
            </p>
          </motion.div>

          {/* Visual Booking Flow */}
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Select Time</h4>
                  <p className="text-sm text-gray-600">Client picks available slot</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Auto Confirm</h4>
                  <p className="text-sm text-gray-600">Calendar syncs instantly</p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="w-6 h-6 text-gray-400" />
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">Reminders</h4>
                  <p className="text-sm text-gray-600">Automated notifications</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {appointmentFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-blue-200 h-full" data-testid={`card-appointment-feature-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg" data-testid={`text-appointment-${index}-title`}>{feature.title}</h3>
                    <p className="text-gray-600 text-sm" data-testid={`text-appointment-${index}-desc`}>{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* HTML Email Signature Generator Section */}
      <section id="email-signatures" className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
              <Mail className="w-3 h-3 mr-1" />
              HTML Email Signature
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Professional <span className="text-green-600">Email Signatures</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Create stunning HTML email signatures with live preview. Choose from multiple templates, 
              customize everything, and export ready-to-use HTML for any email client.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {emailSignatureFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 h-full" data-testid={`card-email-signature-feature-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg" data-testid={`text-email-signature-${index}-title`}>{feature.title}</h3>
                    <p className="text-gray-600 text-sm" data-testid={`text-email-signature-${index}-desc`}>{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* QR Code Feature Section */}
      <section id="qr-codes" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
              <QrCode className="w-3 h-3 mr-1" />
              QR Code Generator
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Dynamic <span className="text-indigo-600">QR Codes</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Generate custom QR codes instantly for your business cards. Add your logo, 
              customize colors, and download in multiple formats for any use case.
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {qrCodeFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-indigo-200 h-full" data-testid={`card-qr-feature-${index}`}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg" data-testid={`text-qr-${index}-title`}>{feature.title}</h3>
                    <p className="text-gray-600 text-sm" data-testid={`text-qr-${index}-desc`}>{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CRM Section */}
      <section id="crm" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-purple-100 text-purple-700 hover:bg-purple-100">
                <Database className="w-3 h-3 mr-1" />
                CRM & Pipeline
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                <span className="text-purple-600">Built-in CRM</span>
                <br />for Every Lead
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Every card view and appointment automatically creates a contact. 
                Track leads through your pipeline, manage tasks, and never miss a follow-up.
              </p>

              <div className="space-y-4">
                {crmFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4 bg-gray-50 rounded-xl p-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* CRM Pipeline Visual */}
              <div className="bg-gradient-to-br from-purple-50 to-white rounded-3xl shadow-2xl p-8 border border-purple-200">
                <h3 className="font-bold text-gray-900 mb-6 text-xl">Sales Pipeline</h3>
                <div className="space-y-4">
                  {["New Leads", "Qualified", "Meeting Set", "Won"].map((stage, index) => (
                    <div key={stage} className="bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-purple-300 transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-900">{stage}</h4>
                        <Badge className="bg-purple-100 text-purple-700">{[12, 8, 5, 3][index]}</Badge>
                      </div>
                      <div className="space-y-2">
                        {Array(2).fill(null).map((_, i) => (
                          <div key={i} className="bg-gray-50 rounded-lg p-3 flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1">
                              <div className="h-2 bg-gray-200 rounded w-3/4 mb-1"></div>
                              <div className="h-2 bg-gray-100 rounded w-1/2"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Automation Section */}
      <section id="automation" className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
              <Zap className="w-3 h-3 mr-1" />
              Automation & Notifications
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Work Smarter with <span className="text-green-600">Automation</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Automate follow-ups, notifications, and customer support. 
              Let AI handle the repetitive tasks while you focus on closing deals.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {automationFeatures.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-green-200 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-2 text-lg">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Analytics Section */}
      <section id="analytics" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              {/* Analytics Dashboard Visual */}
              <div className="bg-gradient-to-br from-green-50 to-white rounded-3xl shadow-2xl p-8 border border-green-200">
                <h3 className="font-bold text-gray-900 mb-6 text-xl">Performance Dashboard</h3>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                      <div className="text-3xl font-black text-gray-900 mb-1">1,247</div>
                      <div className="text-sm text-gray-600">Card Views</div>
                      <div className="text-xs text-green-600 mt-1">↑ 23% this month</div>
                    </div>
                    <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                      <div className="text-3xl font-black text-gray-900 mb-1">89</div>
                      <div className="text-sm text-gray-600">Appointments</div>
                      <div className="text-xs text-green-600 mt-1">↑ 15% this month</div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                    <div className="text-sm text-gray-600 mb-3">Conversion Rate</div>
                    <div className="flex items-end space-x-1 h-32">
                      {[60, 75, 45, 90, 70, 85, 100].map((height, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-green-600 to-green-500 rounded-t" style={{ height: `${height}%` }}></div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                    <div className="text-sm text-gray-600 mb-3">Top Performing Cards</div>
                    <div className="space-y-2">
                      {["Business Card A", "Business Card B"].map((name, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <span className="text-sm text-gray-900">{name}</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-600 rounded-full" style={{ width: `${[85, 72][i]}%` }}></div>
                            </div>
                            <span className="text-xs text-gray-600">{[85, 72][i]}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
                <BarChart3 className="w-3 h-3 mr-1" />
                Analytics & Insights
              </Badge>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
                <span className="text-green-600">Track Everything</span>
                <br />That Matters
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Get real-time insights into card performance, booking trends, and revenue. 
                Make data-driven decisions to grow your business.
              </p>

              <div className="space-y-4">
                {analyticsFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="flex items-start space-x-4 bg-gray-50 rounded-xl p-4"
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                      <p className="text-gray-600 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section id="integrations" className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gray-200 text-gray-700 hover:bg-gray-200">
              <Globe className="w-3 h-3 mr-1" />
              Integrations
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Connects with Your <span className="text-gray-600">Favorite Tools</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Seamlessly integrate with the tools you already use daily.
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {integrations.map((integration, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-gray-300 h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 ${integration.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                      <i className={`${integration.icon} text-white text-2xl`}></i>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm">{integration.name}</h4>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100">
              <Star className="w-3 h-3 mr-1" />
              Customer Stories
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Loved by <span className="text-green-600">Professionals</span> Worldwide
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of professionals growing their business with TalkLink
            </p>
          </motion.div>
          
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border-2 border-gray-200 hover:border-green-200 hover:shadow-xl transition-all h-full" data-testid={`card-testimonial-${index}`}>
                  <CardContent className="p-8">
                    <div className="flex text-yellow-400 mb-4" data-testid={`stars-testimonial-${index}`}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-current" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 mb-6 italic" data-testid={`text-testimonial-${index}-content`}>
                      "{testimonial.content}"
                    </blockquote>
                    <div className="flex items-center">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                      <div>
                        <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                        <p className="text-gray-600 text-sm">{testimonial.role}</p>
                        <p className="text-gray-500 text-sm">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Badge className="mb-4 bg-gray-200 text-gray-700 hover:bg-gray-200">
              Frequently Asked
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-6">
              Got <span className="text-green-600">Questions?</span>
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about TalkLink
            </p>
          </motion.div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Collapsible 
                key={index}
                open={expandedFaq === index}
                onOpenChange={() => setExpandedFaq(expandedFaq === index ? null : index)}
              >
                <Card className="border-2 border-gray-200 hover:border-green-200 transition-all" data-testid={`card-faq-${index}`}>
                  <CollapsibleTrigger asChild>
                    <CardContent className="p-6 cursor-pointer" data-testid={`button-faq-${index}-toggle`}>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-gray-900 text-left pr-8" data-testid={`text-faq-${index}-question`}>
                          {faq.question}
                        </h3>
                        <ChevronDown className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform ${expandedFaq === index ? 'transform rotate-180' : ''}`} />
                      </div>
                    </CardContent>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="px-6 pb-6 pt-0">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-gradient-to-br from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-5xl font-black mb-6">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-10 text-green-100">
              Join thousands of professionals using iTalkLink to grow their business.
              <br />
              Create your first card in 60 seconds. No credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-green-600 hover:bg-gray-100 text-lg px-8 py-6 h-auto shadow-xl font-bold" asChild data-testid="button-cta-get-started">
                <Link href="/register">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-white text-green-400 hover:bg-white/10 text-lg px-8 py-6 h-auto font-bold" asChild data-testid="button-cta-view-pricing">
                <Link href="/pricing">
                  View Pricing
                </Link>
              </Button>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-green-100">
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Free forever plan
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                No credit card needed
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Cancel anytime
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -50px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(50px, 50px) scale(1.05); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}} />
    </div>
  );
}
