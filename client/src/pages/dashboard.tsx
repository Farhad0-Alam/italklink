import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MoreHorizontal, Edit, BarChart3, Trash2, Copy, ExternalLink, DollarSign, Users, TrendingUp, User as UserIcon, CreditCard, Settings, FileText, LogOut, Crown, Shield, HelpCircle, Zap, CalendarDays, QrCode, Mail, Menu, X, Phone } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ContactSupportModal } from "@/components/contact-support-modal";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import NotifyCardButton from "@/components/NotifyCardButton";
import NotifyAllCardsButton from "@/components/NotifyAllCardsButton";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'paid';
  businessCardsCount: number;
  businessCardsLimit: number;
  createdAt: string;
  stats?: {
    totalBusinessCards: number;
    totalViews: number;
    planType: string;
    businessCardsLimit: number;
  };
}

interface BusinessCard {
  id: string;
  fullName: string;
  title: string;
  company?: string;
  shareSlug?: string;
  viewCount: number;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AffiliateProfile {
  id: string;
  code: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  stats: {
    totalEarnings: number;
    pendingEarnings: number;
    totalClicks: number;
    totalConversions: number;
  };
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [showContactModal, setShowContactModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // All hooks must be called unconditionally at the top level
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutes cache for user data
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    refetchOnWindowFocus: false, // Don't refetch user on window focus
  });

  const { data: businessCards = [], isLoading: cardsLoading, refetch: refetchCards } = useQuery<BusinessCard[]>({
    queryKey: ['/api/business-cards'],
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
    gcTime: 1000 * 60 * 10, // 10 minutes garbage collection time
    refetchOnWindowFocus: false, // Don't refetch on window focus for better performance
  });

  // Remove debug logs for production performance

  // Fetch affiliate data - with better cache settings
  const { data: affiliate } = useQuery<AffiliateProfile>({
    queryKey: ['/api/affiliate/me'],
    enabled: !!user,
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutes cache to reduce 404s
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Only fetch once per session
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout', {}),
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      queryClient.clear();
      setLocation('/');
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "Something went wrong while logging out.",
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/business-cards/${id}`),
    onSuccess: () => {
      toast({
        title: "Business card deleted",
        description: "Your business card has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete business card.",
        variant: "destructive",
      });
    },
  });

  const toggleCardStatus = useMutation({
    mutationFn: ({ id, isPublic }: { id: string, isPublic: boolean }) => 
      apiRequest('PATCH', `/api/business-cards/${id}`, { isPublic }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/business-cards'] });
      toast({
        title: "Card updated",
        description: "Card status updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update card status.",
        variant: "destructive",
      });
    },
  });

  // Effects after hooks
  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your dashboard.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, userLoading, userError, setLocation, toast]);

  // Helper functions
  const copyUrl = async (card: BusinessCard) => {
    const slug = card.shareSlug || card.fullName.toLowerCase().replace(/\s+/g, '-');
    const url = `${window.location.origin}/${slug}`;
    await navigator.clipboard.writeText(url);
    toast({
      title: "URL copied!",
      description: "Share URL has been copied to clipboard.",
    });
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'pro': return 'bg-blue-100 text-blue-700';
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanFeatures = (planType: string) => {
    switch (planType) {
      case 'pro': return ['Unlimited Cards', 'Analytics', 'Custom Branding', 'Priority Support'];
      case 'enterprise': return ['Everything in Pro', 'Team Features', 'API Access', 'White-label'];
      default: return ['1 Business Card', 'Basic Templates', 'QR Code Generation'];
    }
  };

  // Conditional rendering after all hooks
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  // Calculate pagination after ensuring we have data
  const itemsPerPage = 10;
  const totalPages = Math.ceil(businessCards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCards = businessCards.slice(startIndex, startIndex + itemsPerPage);

  // Scroll to My Links section
  const scrollToMyLinks = () => {
    const myLinksSection = document.getElementById('my-links-section');
    if (myLinksSection) {
      myLinksSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Navigation menu items
  const navigationItems: Array<{
    href: string;
    label: string;
    icon: any;
    testId?: string;
    onClick?: () => void;
  }> = [
    { href: "/dashboard", label: "Dashboard", icon: null },
    { href: "/my-links", label: "My Links", icon: null },
    { href: "/templates", label: "Templates", icon: null },
    { href: "/qr-codes", label: "QR Codes", icon: QrCode, testId: "link-qr-codes" },
    { href: "/email-signature", label: "Email Signature", icon: Mail, testId: "link-email-signature" },
    { href: "/appointments", label: "Appointments", icon: null },
    { href: "/crm", label: "CRM", icon: Users, testId: "link-crm" },
    { href: "/card-analytics", label: "Analytics", icon: BarChart3, testId: "link-card-analytics" },
    { href: "/voice-test", label: "Voice Agent", icon: Phone, testId: "link-voice-test" },
    { href: "/availability", label: "Availability", icon: CalendarDays, testId: "link-availability" },
    { href: "/uploads", label: "Uploads", icon: FileText, testId: "link-uploads" },
    { href: "/affiliate", label: "Affiliate", icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:block w-64 fixed h-screen">
        <DashboardSidebar 
          user={user}
          businessCardsCount={businessCards.length}
          affiliate={affiliate}
          onLogout={() => setLocation('/')}
        />
      </div>

      {/* Mobile Sidebar in Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 md:hidden">
          <DashboardSidebar 
            user={user}
            businessCardsCount={businessCards.length}
            affiliate={affiliate}
            onLogout={() => setLocation('/')}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 overflow-y-auto">
        {/* Top Bar for Mobile */}
        <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm h-16">
          <div className="flex items-center justify-between h-full px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden" 
              data-testid="button-mobile-menu"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">TL</span>
              </div>
              <div className="text-sm font-bold">
                <span className="text-blue-600">2talk</span>
                <span className="text-orange-500">Link</span>
              </div>
            </Link>
            <div className="w-10" />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <i className="fas fa-mouse-pointer text-green-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Weekly Clicks</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-100 rounded-full">
                  <i className="fas fa-eye text-orange-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-600">Weekly Visitor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-pink-100 rounded-full">
                  <i className="fas fa-users text-pink-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {businessCards.reduce((sum, card) => sum + card.viewCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Monthly Visitor</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <i className="fas fa-link text-purple-600 text-xl"></i>
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    {businessCards.length}
                  </p>
                  <p className="text-sm text-gray-600">Created Links</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affiliate Stats Card */}
          <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-emerald-100 rounded-full">
                  <DollarSign className="text-emerald-600 text-xl h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-3xl font-bold text-gray-900">
                    ${affiliate ? (affiliate.stats.totalEarnings / 100).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-sm text-gray-600">Affiliate Earnings</p>
                </div>
              </div>
              {affiliate && (
                <div className="mt-3 text-xs text-gray-500">
                  +${(affiliate.stats.pendingEarnings / 100).toFixed(2)} pending
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Program Section */}
        {!affiliate ? (
          <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg shadow-sm border border-emerald-200 mb-8">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-full">
                    <Users className="text-emerald-600 h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">Join Our Affiliate Program</h3>
                    <p className="text-gray-600">Earn commissions by promoting our platform. Get up to 30% commission on every referral!</p>
                  </div>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
                  <Link href="/affiliate" data-testid="button-join-affiliate">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Join Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                Affiliate Dashboard
              </h2>
              <Badge className={`${
                affiliate.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                affiliate.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                'bg-red-100 text-red-800 border-red-200'
              }`}>
                {affiliate.status}
              </Badge>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{affiliate.stats.totalClicks}</div>
                  <div className="text-sm text-gray-600">Total Clicks</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{affiliate.stats.totalConversions}</div>
                  <div className="text-sm text-gray-600">Conversions</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-emerald-600">${(affiliate.stats.totalEarnings / 100).toFixed(2)}</div>
                  <div className="text-sm text-gray-600">Total Earnings</div>
                </div>
              </div>
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                <div>
                  <p className="text-sm text-gray-600">Affiliate Code:</p>
                  <code className="font-mono text-sm bg-white px-2 py-1 rounded border">{affiliate.code}</code>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/affiliate" data-testid="button-affiliate-dashboard">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Full Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Newly Created Links Section */}
        <div id="my-links-section" className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Newly Created Links</h2>
            <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="hidden sm:block">
                <NotifyAllCardsButton 
                  totalCards={businessCards.length}
                />
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white flex-1 sm:flex-initial" asChild>
                <Link href="/templates" data-testid="button-create-link">
                  <i className="fas fa-plus mr-2"></i>
                  <span className="hidden sm:inline">Create New Link</span>
                  <span className="sm:hidden">Create Link</span>
                </Link>
              </Button>
            </div>
          </div>

          {cardsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your links...</p>
            </div>
          ) : businessCards.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-link text-gray-400 text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No links created yet</h3>
              <p className="text-gray-600 mb-6">
                Create your first digital business card link to get started.
              </p>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                <Link href="/templates">
                  <i className="fas fa-plus mr-2"></i>
                  Create Your First Link
                </Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {paginatedCards.map((card, index) => (
                <div key={card.id} className="px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Card Info */}
                    <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${card.fullName}`} alt={card.fullName} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {card.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{card.fullName}</h3>
                          <i className="fas fa-edit text-orange-500 text-xs sm:text-sm flex-shrink-0"></i>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 mt-1">
                          <p className="text-xs sm:text-sm text-gray-600 truncate">
                            {window.location.origin}/{card.shareSlug || card.fullName.toLowerCase().replace(/\s+/g, '-')}
                          </p>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <i 
                              className="fas fa-copy text-gray-400 text-xs cursor-pointer hover:text-gray-600 transition-colors" 
                              onClick={() => copyUrl(card)}
                              title="Copy link"
                              data-testid={`icon-copy-${card.id}`}
                            ></i>
                            <i 
                              className="fas fa-external-link-alt text-gray-400 text-xs cursor-pointer hover:text-gray-600 transition-colors"
                              onClick={() => {
                                const slug = card.shareSlug || card.fullName.toLowerCase().replace(/\s+/g, '-');
                                window.open(`${window.location.origin}/${slug}`, '_blank');
                              }}
                              title="Open"
                              data-testid={`icon-external-${card.id}`}
                            ></i>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 sm:gap-6 mt-2">
                          <span className="text-xs sm:text-sm text-gray-500">
                            <i className="fas fa-eye mr-1 text-orange-500"></i>
                            <span className="hidden sm:inline">Visitor </span>({card.viewCount})
                          </span>
                          <span className="text-xs sm:text-sm text-gray-500">
                            <i className="fas fa-mouse-pointer mr-1 text-green-500"></i>
                            <span className="hidden sm:inline">Clicks </span>(0)
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 sm:flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-orange-500 border-orange-200 hover:bg-orange-50 flex-1 sm:flex-initial"
                        asChild
                      >
                        <Link href={`/card-editor/${card.id}`} data-testid={`button-edit-${card.id}`}>
                          <Edit className="h-3 w-3 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Link>
                      </Button>
                      
                      <div className="hidden sm:block">
                        <NotifyCardButton 
                          cardId={card.id}
                          cardTitle={card.fullName}
                        />
                      </div>
                      
                      <Switch 
                        checked={card.isPublic} 
                        onCheckedChange={(checked) => 
                          toggleCardStatus.mutate({ id: card.id, isPublic: checked })
                        }
                        className="data-[state=checked]:bg-green-500"
                        data-testid={`switch-status-${card.id}`}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-orange-600 transition-colors"
                        onClick={() => setLocation(`/card-analytics?cardId=${card.id}`)}
                        data-testid={`button-stats-${card.id}`}
                        title="Analytics"
                      >
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-600"
                        onClick={() => deleteCardMutation.mutate(card.id)}
                        disabled={deleteCardMutation.isPending}
                        data-testid={`button-delete-${card.id}`}
                      >
                        {deleteCardMutation.isPending ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {businessCards.length > 0 && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  data-testid="button-prev-page"
                >
                  <i className="fas fa-chevron-left"></i>
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={currentPage === page ? "bg-orange-500 hover:bg-orange-600" : ""}
                    data-testid={`button-page-${page}`}
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  data-testid="button-next-page"
                >
                  <i className="fas fa-chevron-right"></i>
                </Button>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Contact Support Modal */}
      <ContactSupportModal
        open={showContactModal}
        onOpenChange={setShowContactModal}
      />
    </div>
  );
}