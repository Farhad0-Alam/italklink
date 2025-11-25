import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Crown, Users, Calendar, Check, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UserSubscription {
  id: string;
  planId: number;
  planName?: string;
  userCount: number;
  pricePaid: number;
  features: any;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  status: string;
}

interface User {
  id: string;
  planType?: string;
  createdAt?: string;
  subscriptionEndsAt?: string | null;
}

export function SubscriptionCard() {
  const { toast } = useToast();

  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      const res = await fetch('/api/auth/user', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch user');
      const json = await res.json();
      return json.data || null;
    },
  });

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<UserSubscription | null>({
    queryKey: ['/api/billing/subscription'],
    queryFn: async () => {
      const res = await fetch('/api/billing/subscription', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch subscription');
      const json = await res.json();
      return json.data || null;
    },
  });

  const isLoading = userLoading || subscriptionLoading;

  const cancelMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/billing/subscription/cancel', {});
    },
    onSuccess: (response: any) => {
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/subscription'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel subscription",
        variant: "destructive"
      });
    }
  });

  if (isLoading) {
    return (
      <Card data-testid="card-subscription-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-500" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If user has a paid plan assigned by admin, don't show this card (handled in Billing page)
  if (!subscription && user && user.planType === 'paid') {
    return null;
  }

  // Show Free Plan only if truly on free plan (no subscription and no admin plan)
  if (!subscription && (!user || user.planType === 'free')) {
    return (
      <Card data-testid="card-subscription-free">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-gray-400" />
            Free Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            You're currently on the free plan. Upgrade to unlock more features and capabilities.
          </p>
          
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>1 Digital Business Card</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>Basic Templates</span>
          </div>
          
          <div className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-green-500 mt-0.5" />
            <span>QR Code Generation</span>
          </div>
          
          <Button 
            className="w-full bg-orange-500 hover:bg-orange-600 mt-4" 
            asChild
            data-testid="button-upgrade"
          >
            <Link href="/pricing">
              Upgrade to Pro
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const featureList = subscription.features?.featureList || [];
  const startDate = new Date(subscription.startDate).toLocaleDateString();
  const endDate = subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'Ongoing';

  return (
    <Card data-testid="card-subscription-active">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-500" />
            {subscription.planName || 'Subscription'}
          </CardTitle>
          <Badge 
            className={subscription.isActive ? 'bg-green-500' : 'bg-gray-500'}
            data-testid="badge-subscription-status"
          >
            {subscription.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Users</p>
            <p className="text-lg font-semibold flex items-center gap-1" data-testid="text-user-count">
              <Users className="h-4 w-4 text-orange-500" />
              {subscription.userCount}
            </p>
          </div>
          
          <div className="space-y-1">
            <p className="text-xs text-gray-500">Price Paid</p>
            <p className="text-lg font-semibold" data-testid="text-price-paid">
              ${(subscription.pricePaid / 100).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Subscription Period
          </p>
          <p className="text-sm" data-testid="text-subscription-period">
            {startDate} - {endDate}
          </p>
        </div>

        {featureList.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-medium">Included Features</p>
            <div className="space-y-1">
              {featureList.slice(0, 3).map((featureId: number, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 mt-0.5" />
                  <span>Feature {featureId}</span>
                </div>
              ))}
              {featureList.length > 3 && (
                <p className="text-xs text-gray-500 ml-6">
                  +{featureList.length - 3} more features
                </p>
              )}
            </div>
          </div>
        )}

        {subscription.isActive && (
          <div className="pt-4 border-t">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                  data-testid="button-cancel-subscription"
                >
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to cancel your subscription? You will lose access to premium features.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel data-testid="button-cancel-dialog-dismiss">Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => cancelMutation.mutate()}
                    disabled={cancelMutation.isPending}
                    className="bg-red-600 hover:bg-red-700"
                    data-testid="button-cancel-dialog-confirm"
                  >
                    {cancelMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Cancelling...
                      </>
                    ) : (
                      'Yes, Cancel'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
