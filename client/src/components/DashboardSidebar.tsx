import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, Users, FileText, LogOut, Settings, HelpCircle, Zap, 
  CalendarDays, QrCode, Mail, Phone, DollarSign, ChevronDown,
  Home, ChevronRight, Sparkles, Workflow, ShoppingBag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DashboardSidebarProps {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    planType: 'free' | 'paid';
  };
  businessCardsCount: number;
  affiliate?: { status: string };
  onLogout?: () => void;
}

export function DashboardSidebar({ user, businessCardsCount, affiliate, onLogout }: DashboardSidebarProps) {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [expandedSection, setExpandedSection] = useState<string | null>('core');

  // Fetch subscription to get plan name
  const { data: subscriptionData } = useQuery({
    queryKey: ['/api/billing/subscription'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout', {}),
    onSuccess: () => {
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      queryClient.clear();
      onLogout?.();
      setLocation('/');
    },
  });

  const isActive = (href: string) => location === href || location.startsWith(href + '/');

  const menuSections = [
    {
      id: 'core',
      label: 'Core',
      items: [
        { href: '/dashboard', label: 'Dashboard', icon: Home, testId: 'link-dashboard' },
        { href: '/my-links', label: 'Talk Links', icon: FileText, testId: 'link-my-links' },
        { href: '/templates', label: 'Templates', icon: Sparkles, testId: 'link-templates' },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { href: '/qr-codes', label: 'QR Codes', icon: QrCode, testId: 'link-qr-codes' },
        { href: '/nfc-management', label: 'NFC Tags', icon: QrCode, testId: 'link-nfc-management', description: 'Smart NFC cards' },
        { href: '/email-signature', label: 'Email Signature', icon: Mail, testId: 'link-email-signature' },
        { href: '/appointments', label: 'Appointments', icon: CalendarDays, testId: 'link-appointments' },
        { href: '/voice-test', label: 'Voice Agent', icon: Phone, testId: 'link-voice-test' },
        { href: '/availability', label: 'Availability', icon: CalendarDays, testId: 'link-availability' },
      ],
    },
    {
      id: 'business',
      label: 'Business',
      items: [
        { href: '/crm', label: 'CRM', icon: Users, testId: 'link-crm' },
        { href: '/card-analytics', label: 'Analytics', icon: BarChart3, testId: 'link-card-analytics' },
        { href: '/affiliate', label: 'Affiliate', icon: DollarSign, testId: 'link-affiliate' },
        { href: '/uploads', label: 'Uploads', icon: FileText, testId: 'link-uploads' },
      ],
    },
    {
      id: 'shop',
      label: 'Shop',
      items: [
        { href: '/shop', label: 'Browse Shop', icon: ShoppingBag, testId: 'link-shop-browse' },
        { href: '/shop/seller/products', label: 'My Products', icon: ShoppingBag, testId: 'link-seller-products' },
        { href: '/shop/seller/orders', label: 'Orders', icon: BarChart3, testId: 'link-seller-orders' },
        { href: '/shop/seller/analytics', label: 'Sales', icon: DollarSign, testId: 'link-seller-analytics' },
        { href: '/user/purchases', label: 'Purchases', icon: ShoppingBag, testId: 'link-user-purchases' },
        { href: '/user/downloads', label: 'Downloads', icon: FileText, testId: 'link-user-downloads' },
      ],
    },
    {
      id: 'account',
      label: 'Account',
      items: [
        { href: '/profile', label: 'Profile', icon: Users, testId: 'link-profile' },
        { href: '/account-settings', label: 'Settings', icon: Settings, testId: 'link-account-settings' },
        { href: '/automation', label: 'Automation', icon: Workflow, testId: 'link-automation', description: 'CRM & lead tracking' },
        { href: '/billing', label: 'Billing', icon: DollarSign, testId: 'link-billing' },
        { href: '/help', label: 'Help', icon: HelpCircle, testId: 'link-help' },
      ],
    },
  ];

  const getPlanColor = (planType: string) => {
    return planType === 'paid' 
      ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
      : 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getSectionIcon = (id: string) => {
    switch (id) {
      case 'tools':
        return <Zap className="w-4 h-4" />;
      case 'business':
        return <BarChart3 className="w-4 h-4" />;
      case 'account':
        return <Settings className="w-4 h-4" />;
      case 'shop':
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const getSectionGradient = (id: string, isExpanded: boolean) => {
    switch (id) {
      case 'core':
        return isExpanded 
          ? 'bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-700 dark:text-emerald-300' 
          : 'bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 text-emerald-600 dark:text-emerald-400 hover:from-emerald-100 hover:to-teal-100 dark:hover:from-emerald-950/30 dark:hover:to-teal-950/30';
      case 'tools':
        return isExpanded 
          ? 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/40 dark:to-cyan-950/40 text-blue-700 dark:text-blue-300' 
          : 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 text-blue-600 dark:text-blue-400 hover:from-blue-100 hover:to-cyan-100 dark:hover:from-blue-950/30 dark:hover:to-cyan-950/30';
      case 'business':
        return isExpanded 
          ? 'bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/40 dark:to-pink-950/40 text-purple-700 dark:text-purple-300' 
          : 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 text-purple-600 dark:text-purple-400 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-950/30 dark:hover:to-pink-950/30';
      case 'account':
        return isExpanded 
          ? 'bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-950/40 dark:to-amber-950/40 text-orange-700 dark:text-orange-300' 
          : 'bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 text-orange-600 dark:text-orange-400 hover:from-orange-100 hover:to-amber-100 dark:hover:from-orange-950/30 dark:hover:to-amber-950/30';
      case 'shop':
        return isExpanded 
          ? 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-950/40 dark:to-emerald-950/40 text-green-700 dark:text-green-300' 
          : 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 text-green-600 dark:text-green-400 hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-950/30 dark:hover:to-emerald-950/30';
      default:
        return '';
    }
  };

  const getChevronColor = (id: string, isExpanded: boolean) => {
    switch (id) {
      case 'core':
        return isExpanded ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500 dark:text-emerald-500';
      case 'tools':
        return isExpanded ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-500';
      case 'business':
        return isExpanded ? 'text-purple-600 dark:text-purple-400' : 'text-purple-500 dark:text-purple-500';
      case 'account':
        return isExpanded ? 'text-orange-600 dark:text-orange-400' : 'text-orange-500 dark:text-orange-500';
      case 'shop':
        return isExpanded ? 'text-green-600 dark:text-green-400' : 'text-green-500 dark:text-green-500';
      default:
        return 'text-gray-400 dark:text-gray-600';
    }
  };

  return (
    <aside className="h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto scrollbar-hide">
      {/* Header - User Profile Card with Modern Gradient Design */}
      <div className="relative p-6 pb-4 bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-blue-950/40 border-b-2 border-gradient-to-r from-emerald-200 to-blue-200 dark:border-emerald-800/50 dark:to-blue-800/50 overflow-hidden">
        {/* Gradient background accent */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full blur-2xl"></div>
        </div>

        {/* Content */}
        <div className="relative">
          <Link href="/profile" className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <Avatar className="h-14 w-14 ring-3 ring-emerald-200 dark:ring-emerald-700 group-hover:ring-emerald-300 dark:group-hover:ring-emerald-600 transition-all shadow-lg">
                <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 via-teal-500 to-blue-500 text-white font-bold text-sm">
                  {user.firstName?.[0]}{user.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white dark:border-gray-800 shadow-md" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-emerald-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">{user.email}</p>
            </div>
          </Link>

          {/* Plan Badge with Modern Design */}
          <div className="mt-4 flex items-center gap-2">
            <Badge className={`${getPlanColor(user.planType)} text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105`}>
              {subscriptionData?.data?.plan?.name || (user.planType === 'paid' ? '⭐ Premium' : '🎯 Free')}
            </Badge>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-2.5 py-1 rounded-full">{businessCardsCount} Cards</span>
          </div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {menuSections.map((section) => (
          <div key={section.id} className="mb-2">
            {/* Section Header */}
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 group ${getSectionGradient(section.id, expandedSection === section.id)}`}
            >
              <div className="flex items-center gap-2">
                {getSectionIcon(section.id)}
                {section.label}
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-all duration-200 ${
                  expandedSection === section.id ? 'rotate-180' : ''
                } ${getChevronColor(section.id, expandedSection === section.id)}`}
              />
            </button>

            {/* Section Items */}
            {expandedSection === section.id && (
              <div className="mt-1 space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                      data-testid={item.testId}
                    >
                      <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 mt-0.5 flex-shrink-0 ${
                        active ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{item.label}</div>
                        {item.description && (
                          <div className={`text-xs mt-0.5 ${
                            active ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {item.description}
                          </div>
                        )}
                      </div>
                      {active && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer - Logout & Upgrade */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {user.planType === 'free' && (
          <Link href="/pricing" className="block">
            <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold shadow-lg" size="sm">
              <Sparkles className="w-4 h-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        )}

        <Button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 border-red-200 dark:border-red-900"
          size="sm"
        >
          {logoutMutation.isPending ? (
            <>
              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-2" />
              Signing out...
            </>
          ) : (
            <>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
