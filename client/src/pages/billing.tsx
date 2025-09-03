import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, Download, Eye, Calendar, Crown, Shield, DollarSign } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  planType: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

export default function Billing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  useEffect(() => {
    if (!userLoading && (userError || !user)) {
      toast({
        title: "Authentication required",
        description: "Please log in to access billing information.",
        variant: "destructive",
      });
      setLocation('/login');
    }
  }, [user, userLoading, userError, setLocation, toast]);

  const getPlanIcon = (planType: string) => {
    switch (planType) {
      case 'enterprise':
        return <Crown className="w-5 h-5 text-purple-600" />;
      case 'pro':
        return <Shield className="w-5 h-5 text-blue-600" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-600" />;
    }
  };

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

  if (userLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing & Invoices</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your subscription and billing information</p>
        </div>

        {/* Current Plan Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {getPlanIcon(user.planType)}
                <span>Current Plan</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className={`text-sm ${getPlanColor(user.planType)}`}>
                  {user.planType.charAt(0).toUpperCase() + user.planType.slice(1)} Plan
                </Badge>
              </div>

              {user.planType === 'free' ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    You're currently on the free plan. Upgrade to unlock more features!
                  </p>
                  <Button className="w-full" onClick={() => setLocation('/pricing')}>
                    Upgrade Plan
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Enjoying your {user.planType} plan benefits.
                  </p>
                  <Button variant="outline" className="w-full">
                    Manage Subscription
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <CreditCard className="w-6 h-6" />
                  <span>Payment Methods</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Download className="w-6 h-6" />
                  <span>Download Invoices</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2">
                  <Calendar className="w-6 h-6" />
                  <span>Billing History</span>
                </Button>
                <Button variant="outline" className="h-24 flex flex-col items-center justify-center space-y-2" asChild>
                  <Link href="/pricing">
                    <Crown className="w-6 h-6" />
                    <span>Upgrade Plan</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Methods</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                <p className="text-gray-600 mb-4">
                  Add a payment method to manage your subscription and enable automatic billing.
                </p>
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <strong>Note:</strong> Payment processing requires Stripe integration. Contact support to enable payments.
                </div>
                <Button variant="outline">
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Invoices</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
                <p className="text-gray-600">
                  {user.planType === 'free' 
                    ? "Upgrade to a paid plan to see your billing history."
                    : "Your billing history will appear here once you have invoices."
                  }
                </p>
                {user.planType === 'free' && (
                  <Button className="mt-4" onClick={() => setLocation('/pricing')}>
                    Upgrade Now
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}