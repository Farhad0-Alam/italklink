import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, Download, Eye, Calendar, Crown, Shield, DollarSign } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  planType: 'free' | 'pro' | 'enterprise';
  createdAt: string;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  planName: string;
  period: string;
  downloadUrl?: string;
}

interface Subscription {
  id: string;
  planType: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  amount: number;
  interval: 'monthly' | 'annual';
}

export default function Billing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: user, isLoading: userLoading, error: userError } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Mock data for subscription and invoices (replace with real API calls)
  const { data: subscription } = useQuery<Subscription>({
    queryKey: ['/api/billing/subscription'],
    queryFn: () => ({
      id: 'sub_mock',
      planType: user?.planType || 'free',
      status: 'active',
      currentPeriodStart: '2024-01-01',
      currentPeriodEnd: '2024-02-01',
      cancelAtPeriodEnd: false,
      amount: user?.planType === 'pro' ? 29 : user?.planType === 'enterprise' ? 99 : 0,
      interval: 'monthly',
    }),
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ['/api/billing/invoices'],
    queryFn: () => [
      {
        id: 'inv_1',
        date: '2024-01-01',
        amount: 29.00,
        status: 'paid',
        planName: 'Pro Plan',
        period: 'January 2024',
      },
      {
        id: 'inv_2',
        date: '2023-12-01',
        amount: 29.00,
        status: 'paid',
        planName: 'Pro Plan',
        period: 'December 2023',
      },
      {
        id: 'inv_3',
        date: '2023-11-01',
        amount: 29.00,
        status: 'paid',
        planName: 'Pro Plan',
        period: 'November 2023',
      },
    ],
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
              <h1 className="text-xl font-semibold text-gray-900">Billing & Invoices</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Subscription */}
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

              {subscription && subscription.planType !== 'free' && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-medium">{formatCurrency(subscription.amount)}/{subscription.interval === 'monthly' ? 'month' : 'year'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status</span>
                      <Badge className={getStatusColor(subscription.status)}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Next billing</span>
                      <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full mb-2">
                      Manage Subscription
                    </Button>
                    <Button variant="outline" className="w-full" onClick={() => setLocation('/pricing')}>
                      Change Plan
                    </Button>
                  </div>
                </>
              )}

              {user.planType === 'free' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    You're currently on the free plan. Upgrade to unlock more features.
                  </p>
                  <Button className="w-full" onClick={() => setLocation('/pricing')}>
                    Upgrade Plan
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Billing History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length > 0 ? (
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{invoice.planName}</h4>
                          <p className="text-sm text-gray-600">
                            {invoice.period} • {formatDate(invoice.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                          <Badge className={`text-xs ${getStatusColor(invoice.status)}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No billing history</h3>
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Payment Methods */}
        <Card className="mt-8">
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
                Add a payment method to manage your subscription.
              </p>
              <Button variant="outline">
                Add Payment Method
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}