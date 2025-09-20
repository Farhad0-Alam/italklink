import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MoreHorizontal, FileText, Users, TrendingUp, User as UserIcon, CreditCard, Settings, LogOut, Crown, Shield, HelpCircle, Zap, CalendarDays, Upload, ArrowLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ContactSupportModal } from "@/components/contact-support-modal";
import { UploadsManager } from "@/components/UploadsManager";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'pro' | 'enterprise';
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

export default function UploadsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showContactModal, setShowContactModal] = useState(false);

  // All hooks must be called unconditionally at the top level
  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/auth/logout'),
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

  // Effects after hooks
  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to access your uploads.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [userLoading, userError, user, toast, setLocation]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'pro': return 'bg-blue-100 text-blue-700';
      case 'enterprise': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Conditional rendering after all hooks
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your uploads...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="text-2xl font-bold">
                  <span className="text-blue-600">2talk</span>
                  <span className="text-orange-500">Link</span>
                </div>
              </Link>
              
              <div className="hidden md:flex items-center space-x-8">
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  Dashboard
                </Link>
                <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                  My Links
                </Link>
                <Link href="/templates" className="text-gray-500 hover:text-gray-700">
                  Templates
                </Link>
                <Link href="/appointments" className="text-gray-500 hover:text-gray-700">
                  Appointments
                </Link>
                <Link href="/crm" className="text-gray-500 hover:text-gray-700 flex items-center space-x-1" data-testid="link-crm">
                  <Users className="w-4 h-4" />
                  <span>CRM</span>
                </Link>
                <Link href="/availability" className="text-gray-500 hover:text-gray-700 flex items-center space-x-1" data-testid="link-availability">
                  <CalendarDays className="w-4 h-4" />
                  <span>Availability</span>
                </Link>
                <Link href="/uploads" className="text-gray-900 font-medium hover:text-blue-600 flex items-center space-x-1" data-testid="link-uploads">
                  <Upload className="w-4 h-4" />
                  <span>Uploads</span>
                </Link>
                <Link href="/affiliate" className="text-gray-500 hover:text-gray-700">
                  Affiliate
                </Link>
                <Link href="/pricing" className="text-gray-500 hover:text-gray-700">
                  Pricing
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-3 h-10 px-3 rounded-lg hover:bg-gray-50">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-orange-500 text-white text-sm font-medium">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-gray-500">{user.email}</span>
                    </div>
                    <i className="fas fa-chevron-down text-xs text-gray-400"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2" sideOffset={8}>
                  {/* User Info Header */}
                  <div className="flex items-center space-x-3 p-3 mb-2 bg-gradient-to-r from-blue-50 to-orange-50 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImageUrl} alt={user.firstName} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-orange-500 text-white">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      <div className="flex items-center mt-1">
                        <Badge className={`text-xs ${getPlanBadgeColor(user.planType)}`}>
                          {user.planType === 'enterprise' && <Crown className="w-3 h-3 mr-1" />}
                          {user.planType === 'pro' && <Shield className="w-3 h-3 mr-1" />}
                          {user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  {/* Profile Section */}
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                    Account
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem 
                    className="flex items-center space-x-3 px-3 py-2 cursor-pointer"
                    onClick={() => setLocation('/profile')}
                  >
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Edit Profile</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="flex items-center space-x-3 px-3 py-2 cursor-pointer"
                    onClick={() => setLocation('/account-settings')}
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Account Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem 
                    className="flex items-center space-x-3 px-3 py-2 cursor-pointer"
                    onClick={() => setLocation('/billing')}
                  >
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Billing</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Support Section */}
                  <DropdownMenuLabel className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2">
                    Support
                  </DropdownMenuLabel>

                  <DropdownMenuItem 
                    className="flex items-center space-x-3 px-3 py-2 cursor-pointer"
                    onClick={() => setShowContactModal(true)}
                  >
                    <HelpCircle className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Contact Support</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem 
                    className="flex items-center space-x-3 px-3 py-2 cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
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
        <UploadsManager />
      </main>

      {/* Contact Support Modal */}
      <ContactSupportModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </div>
  );
}