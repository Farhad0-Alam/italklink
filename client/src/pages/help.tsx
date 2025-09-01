import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  Search, 
  HelpCircle, 
  Book, 
  MessageCircle, 
  FileText, 
  Video,
  ChevronRight,
  ChevronDown,
  ExternalLink
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  planType: 'free' | 'pro' | 'enterprise';
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

interface HelpArticle {
  id: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  url: string;
}

export default function Help() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openFAQs, setOpenFAQs] = useState<Set<string>>(new Set());

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Mock FAQ data
  const faqs: FAQItem[] = [
    {
      id: '1',
      question: 'How do I create my first business card?',
      answer: 'To create your first business card, go to your dashboard and click "Create New Card". Choose a template, fill in your information, and customize the design. You can preview your card before saving it.',
      category: 'Getting Started',
      tags: ['create', 'card', 'template']
    },
    {
      id: '2',
      question: 'Can I customize my business card design?',
      answer: 'Yes! You can customize colors, fonts, layouts, add your logo, and choose from various templates. Pro and Enterprise users have access to advanced customization options including custom branding.',
      category: 'Customization',
      tags: ['design', 'customize', 'branding']
    },
    {
      id: '3',
      question: 'How do I share my business card?',
      answer: 'You can share your business card through a QR code, direct link, or by downloading it as an image. Each card gets a unique shareable URL that you can send to anyone.',
      category: 'Sharing',
      tags: ['share', 'qr', 'link']
    },
    {
      id: '4',
      question: 'What are the differences between plans?',
      answer: 'Free plan includes 1 business card with basic features. Pro plan offers unlimited cards, analytics, and custom branding. Enterprise plan adds team features, API access, and priority support.',
      category: 'Plans & Billing',
      tags: ['plans', 'pricing', 'features']
    },
    {
      id: '5',
      question: 'How do I upgrade my plan?',
      answer: 'Go to the Pricing page from your dashboard or click "Upgrade Plan" in your profile dropdown. Choose your preferred plan and complete the payment process.',
      category: 'Plans & Billing',
      tags: ['upgrade', 'payment', 'billing']
    },
    {
      id: '6',
      question: 'Can I add team members to my account?',
      answer: 'Team features are available with Enterprise plans. You can invite team members, manage their access, and collaborate on business card creation and management.',
      category: 'Team Features',
      tags: ['team', 'collaboration', 'enterprise']
    },
    {
      id: '7',
      question: 'How do I track card views and analytics?',
      answer: 'Analytics are available for Pro and Enterprise users. Go to your dashboard to see detailed views, engagement metrics, and performance insights for your business cards.',
      category: 'Analytics',
      tags: ['analytics', 'views', 'insights']
    },
    {
      id: '8',
      question: 'What if I forget my password?',
      answer: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a reset link to create a new password. If you continue having issues, contact our support team.',
      category: 'Account',
      tags: ['password', 'login', 'reset']
    }
  ];

  // Mock help articles
  const articles: HelpArticle[] = [
    {
      id: '1',
      title: 'Getting Started Guide',
      summary: 'Complete guide to creating your first business card and setting up your account.',
      category: 'Getting Started',
      readTime: '5 min read',
      url: '#'
    },
    {
      id: '2',
      title: 'Design Best Practices',
      summary: 'Tips and guidelines for creating professional and effective business cards.',
      category: 'Design',
      readTime: '8 min read',
      url: '#'
    },
    {
      id: '3',
      title: 'Advanced Customization',
      summary: 'Learn how to use advanced features to create unique and branded business cards.',
      category: 'Customization',
      readTime: '12 min read',
      url: '#'
    },
    {
      id: '4',
      title: 'Sharing & QR Codes',
      summary: 'Everything you need to know about sharing your business cards effectively.',
      category: 'Sharing',
      readTime: '6 min read',
      url: '#'
    }
  ];

  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to access the help center.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, userLoading, userError, setLocation, toast]);

  const categories = ["All", ...Array.from(new Set(faqs.map(faq => faq.category)))];

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = searchQuery === "" || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (id: string) => {
    const newOpenFAQs = new Set(openFAQs);
    if (newOpenFAQs.has(id)) {
      newOpenFAQs.delete(id);
    } else {
      newOpenFAQs.add(id);
    }
    setOpenFAQs(newOpenFAQs);
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading help center...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="flex items-center space-x-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Dashboard</span>
                </Button>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Help Center</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How can we help you?</h2>
          <p className="text-gray-600 mb-8">Search our knowledge base or browse frequently asked questions</p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for answers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Book className="w-8 h-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Getting Started</h3>
              <p className="text-sm text-gray-600">Learn the basics</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <Video className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Video Tutorials</h3>
              <p className="text-sm text-gray-600">Watch and learn</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <MessageCircle className="w-8 h-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Contact Support</h3>
              <p className="text-sm text-gray-600">Get direct help</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <FileText className="w-8 h-8 text-orange-600 mx-auto mb-3" />
              <h3 className="font-medium mb-2">Documentation</h3>
              <p className="text-sm text-gray-600">Detailed guides</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* FAQ Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Frequently Asked Questions</span>
                </CardTitle>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFAQs.length > 0 ? (
                    filteredFAQs.map((faq) => (
                      <Collapsible
                        key={faq.id}
                        open={openFAQs.has(faq.id)}
                        onOpenChange={() => toggleFAQ(faq.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-4 h-auto text-left border border-gray-200 hover:bg-gray-50"
                          >
                            <span className="font-medium">{faq.question}</span>
                            {openFAQs.has(faq.id) ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <div className="pt-2 border-l-2 border-gray-200 pl-4 ml-2">
                            <p className="text-gray-700 mb-3">{faq.answer}</p>
                            <div className="flex flex-wrap gap-1">
                              {faq.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">
                        Try adjusting your search or browse different categories.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Help Articles */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5" />
                  <span>Help Articles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {articles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <h4 className="font-medium mb-2">{article.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{article.summary}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {article.category}
                        </Badge>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{article.readTime}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  View All Articles
                </Button>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageCircle className="w-5 h-5" />
                  <span>Still Need Help?</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <Button className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}