import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, CreditCard, Download, Eye, Calendar, Crown, Shield, DollarSign, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  brand?: string;
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  createdAt: string;
}

export default function Billing() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    name: '',
    type: 'card',
    address: {
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  });

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

  // Query for payment methods
  const { data: paymentMethods = [] } = useQuery<PaymentMethod[]>({
    queryKey: ['/api/billing/payment-methods'],
    queryFn: () => [], // Will be empty initially - ready for real integration
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  // Mutation to add payment method
  const addPaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodData: any) => {
      // For demo purposes, show a helpful message about Stripe setup
      throw new Error('Payment integration is not yet configured. Please contact your administrator to set up Stripe payment processing.');
    },
    onSuccess: () => {
      toast({
        title: "Payment method added",
        description: "Your payment method has been added successfully.",
      });
      setIsAddingPaymentMethod(false);
      setNewPaymentMethod({
        cardNumber: '',
        expiryMonth: '',
        expiryYear: '',
        cvc: '',
        name: '',
        type: 'card',
        address: {
          line1: '',
          line2: '',
          city: '',
          state: '',
          postalCode: '',
          country: 'US'
        }
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/payment-methods'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to add payment method",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutation to remove payment method
  const removePaymentMethodMutation = useMutation({
    mutationFn: async (paymentMethodId: string) => {
      const response = await fetch(`/api/billing/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment method removed",
        description: "Your payment method has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/payment-methods'] });
    },
    onError: () => {
      toast({
        title: "Failed to remove payment method",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
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
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Methods</span>
              </div>
              <Dialog open={isAddingPaymentMethod} onOpenChange={setIsAddingPaymentMethod}>
                <DialogTrigger asChild>
                  <Button size="sm" className="flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Add Payment Method</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Payment Method</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="type">Payment Type</Label>
                      <Select value={newPaymentMethod.type} onValueChange={(value) => 
                        setNewPaymentMethod(prev => ({ ...prev, type: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="bank_account">Bank Account</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {newPaymentMethod.type === 'card' && (
                      <>
                        <div className="grid gap-2">
                          <Label htmlFor="cardNumber">Card Number</Label>
                          <Input
                            id="cardNumber"
                            placeholder="1234 5678 9012 3456"
                            value={newPaymentMethod.cardNumber}
                            onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label htmlFor="expiryMonth">Month</Label>
                            <Input
                              id="expiryMonth"
                              placeholder="MM"
                              value={newPaymentMethod.expiryMonth}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="expiryYear">Year</Label>
                            <Input
                              id="expiryYear"
                              placeholder="YY"
                              value={newPaymentMethod.expiryYear}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="cvc">CVC</Label>
                            <Input
                              id="cvc"
                              placeholder="123"
                              value={newPaymentMethod.cvc}
                              onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, cvc: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="name">Cardholder Name</Label>
                          <Input
                            id="name"
                            placeholder="John Doe"
                            value={newPaymentMethod.name}
                            onChange={(e) => setNewPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                          />
                        </div>
                        
                        {/* Billing Address */}
                        <div className="grid gap-4 pt-4 border-t">
                          <h4 className="font-medium">Billing Address</h4>
                          <div className="grid gap-2">
                            <Label htmlFor="line1">Address Line 1</Label>
                            <Input
                              id="line1"
                              placeholder="123 Main Street"
                              value={newPaymentMethod.address.line1}
                              onChange={(e) => setNewPaymentMethod(prev => ({ 
                                ...prev, 
                                address: { ...prev.address, line1: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="line2">Address Line 2 (Optional)</Label>
                            <Input
                              id="line2"
                              placeholder="Apartment, suite, etc."
                              value={newPaymentMethod.address.line2}
                              onChange={(e) => setNewPaymentMethod(prev => ({ 
                                ...prev, 
                                address: { ...prev.address, line2: e.target.value }
                              }))}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                placeholder="New York"
                                value={newPaymentMethod.address.city}
                                onChange={(e) => setNewPaymentMethod(prev => ({ 
                                  ...prev, 
                                  address: { ...prev.address, city: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="state">State</Label>
                              <Input
                                id="state"
                                placeholder="NY"
                                value={newPaymentMethod.address.state}
                                onChange={(e) => setNewPaymentMethod(prev => ({ 
                                  ...prev, 
                                  address: { ...prev.address, state: e.target.value }
                                }))}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="postalCode">ZIP/Postal Code</Label>
                              <Input
                                id="postalCode"
                                placeholder="10001"
                                value={newPaymentMethod.address.postalCode}
                                onChange={(e) => setNewPaymentMethod(prev => ({ 
                                  ...prev, 
                                  address: { ...prev.address, postalCode: e.target.value }
                                }))}
                              />
                            </div>
                            <div>
                              <Label htmlFor="country">Country</Label>
                              <Select 
                                value={newPaymentMethod.address.country} 
                                onValueChange={(value) => setNewPaymentMethod(prev => ({ 
                                  ...prev, 
                                  address: { ...prev.address, country: value }
                                }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="US">United States</SelectItem>
                                  <SelectItem value="CA">Canada</SelectItem>
                                  <SelectItem value="GB">United Kingdom</SelectItem>
                                  <SelectItem value="AU">Australia</SelectItem>
                                  <SelectItem value="DE">Germany</SelectItem>
                                  <SelectItem value="FR">France</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button variant="outline" onClick={() => setIsAddingPaymentMethod(false)}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={() => addPaymentMethodMutation.mutate(newPaymentMethod)}
                        disabled={addPaymentMethodMutation.isPending}
                      >
                        {addPaymentMethodMutation.isPending ? 'Adding...' : 'Add Payment Method'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethods.length > 0 ? (
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <div className="font-medium">
                          {method.brand ? `${method.brand} ` : ''}**** {method.last4}
                        </div>
                        {method.expiryMonth && method.expiryYear && (
                          <div className="text-sm text-gray-500">
                            Expires {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear}
                          </div>
                        )}
                        {method.isDefault && (
                          <Badge variant="secondary" className="text-xs">Default</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePaymentMethodMutation.mutate(method.id)}
                      disabled={removePaymentMethodMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                <p className="text-gray-600 mb-4">
                  Add a payment method to manage your subscription and enable automatic billing.
                </p>
                <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <strong>Note:</strong> Payment processing requires Stripe integration. Contact support to enable payments.
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}