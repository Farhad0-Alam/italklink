import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, BarChart3, CreditCard, Eye, Users, Crown, TrendingUp, Zap } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
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

interface UsageStats {
  currentPeriod: {
    start: string;
    end: string;
  };
  businessCards: {
    used: number;
    limit: number;
    unlimited: boolean;
  };
  views: {
    total: number;
    thisMonth: number;
  };
  features: {
    customBranding: boolean;
    analytics: boolean;
    teamFeatures: boolean;
    apiAccess: boolean;
    prioritySupport: boolean;
  };
}

export default function Usage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Mock usage data (replace with real API call)
  const { data: usageStats } = useQuery<UsageStats>({
    queryKey: ['/api/usage/stats'],
    queryFn: () => ({
      currentPeriod: {
        start: '2024-01-01',
        end: '2024-02-01',
      },
      businessCards: {
        used: user?.businessCardsCount || 0,
        limit: user?.businessCardsLimit || 1,
        unlimited: user?.planType === 'enterprise',
      },
      views: {
        total: user?.stats?.totalViews || 0,
        thisMonth: Math.floor((user?.stats?.totalViews || 0) * 0.3),
      },
      features: {
        customBranding: user?.planType !== 'free',
        analytics: user?.planType !== 'free',
        teamFeatures: user?.planType === 'enterprise',
        apiAccess: user?.planType === 'enterprise',
        prioritySupport: user?.planType !== 'free',
      },
    }),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to view usage information.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, userLoading, userError, setLocation, toast]);

  const getPlanColor = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-700';
      case 'pro':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getPlanFeatures = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return ['Unlimited Cards', 'Team Features', 'Custom Branding', 'Advanced Analytics', 'API Access', 'Priority Support'];
      case 'pro':
        return ['Unlimited Cards', 'Custom Branding', 'Advanced Analytics', 'Priority Support'];
      default:
        return ['1 Business Card', 'Basic Templates', 'QR Code Generation'];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getUsagePercentage = () => {
    if (!usageStats || usageStats.businessCards.unlimited) return 0;
    return Math.round((usageStats.businessCards.used / usageStats.businessCards.limit) * 100);
  };

  const getUsageColor = () => {
    const percentage = getUsagePercentage();
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading usage information...</p>
        </div>
      </div>
    );
  }

  if (!user || !usageStats) {
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
              <h1 className="text-xl font-semibold text-gray-900">Usage & Limits</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Plan Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Crown className="w-5 h-5" />
                <span>Current Plan</span>
              </div>
              <Badge className={`text-sm ${getPlanColor(user.planType)}`}>
                {user.planType.charAt(0).toUpperCase() + user.planType.slice(1)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Plan Features</h4>
                <ul className="space-y-2">
                  {getPlanFeatures(user.planType).map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Billing Period</h4>
                <p className="text-sm text-gray-600">
                  {formatDate(usageStats.currentPeriod.start)} - {formatDate(usageStats.currentPeriod.end)}
                </p>
                
                {user.planType === 'free' && (
                  <Button className="mt-4" onClick={() => setLocation('/pricing')}>
                    Upgrade Plan
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Business Cards Usage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Business Cards</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Used</span>
                  <span className="font-medium">
                    {usageStats.businessCards.used} / {usageStats.businessCards.unlimited ? '∞' : usageStats.businessCards.limit}
                  </span>
                </div>
                
                {!usageStats.businessCards.unlimited && (
                  <div>
                    <Progress 
                      value={getUsagePercentage()}
                      className="h-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {getUsagePercentage()}% of limit used
                    </p>
                  </div>
                )}

                {usageStats.businessCards.unlimited && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium">Unlimited</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Views Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Eye className="w-5 h-5" />
                <span>Card Views</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Views</span>
                  <span className="font-medium">{usageStats.views.total.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="font-medium">{usageStats.views.thisMonth.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+12% from last month</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Features</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(usageStats.features).map(([key, enabled]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Usage Recommendations */}
        {user.planType === 'free' && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <TrendingUp className="w-5 h-5" />
                <span>Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-orange-700">
                  You're on the free plan with limited features. Upgrade to unlock:
                </p>
                <ul className="space-y-2 text-sm text-orange-600">
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Unlimited business cards</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Advanced analytics and insights</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Custom branding options</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Priority customer support</span>
                  </li>
                </ul>
                <Button className="mt-4" onClick={() => setLocation('/pricing')}>
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {getUsagePercentage() >= 80 && user.planType !== 'enterprise' && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <TrendingUp className="w-5 h-5" />
                <span>Usage Warning</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-yellow-700 mb-4">
                You're approaching your business card limit. Consider upgrading to avoid interruptions.
              </p>
              <Button variant="outline" onClick={() => setLocation('/pricing')}>
                View Upgrade Options
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}