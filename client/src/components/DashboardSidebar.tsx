import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { 
  BarChart3, Users, FileText, LogOut, Settings, HelpCircle, Zap, 
  CalendarDays, QrCode, Mail, Phone, DollarSign, ChevronDown,
  Home, ChevronRight, Sparkles, Workflow
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
  const [expandedSection, setExpandedSection] = useState<string | null>('tools');

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
        { href: '/my-links', label: 'My Links', icon: FileText, testId: 'link-my-links' },
        { href: '/templates', label: 'Templates', icon: Sparkles, testId: 'link-templates' },
      ],
    },
    {
      id: 'tools',
      label: 'Tools',
      items: [
        { href: '/qr-codes', label: 'QR Codes', icon: QrCode, testId: 'link-qr-codes' },
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
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  return (
    <aside className="h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-y-auto scrollbar-hide">
      {/* Header - User Profile Card */}
      <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/profile" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <Avatar className="h-12 w-12 ring-2 ring-orange-100 dark:ring-orange-900 group-hover:ring-orange-200 transition-all">
              <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-orange-500 text-white">
                {user.firstName?.[0]}{user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
          </div>
        </Link>

        {/* Plan Badge */}
        <div className="mt-3 flex items-center gap-2">
          <Badge className={`${getPlanColor(user.planType)} text-white text-xs font-semibold`}>
            {subscriptionData?.data?.plan?.name || (user.planType === 'paid' ? '⭐ Premium' : '🎯 Free')}
          </Badge>
          <span className="text-xs text-gray-600 dark:text-gray-400">{businessCardsCount} Cards</span>
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
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider hover:text-gray-900 dark:hover:text-gray-300 transition-colors group"
            >
              <div className="flex items-center gap-2">
                {getSectionIcon(section.id)}
                {section.label}
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  expandedSection === section.id ? 'rotate-180' : ''
                }`}
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
