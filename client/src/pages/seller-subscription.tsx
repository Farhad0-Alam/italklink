import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function SellerSubscriptionPlans() {
  const { toast } = useToast();

  const { data: plans = [] } = useQuery({
    queryKey: ['/api/seller-subscriptions/plans'],
  });

  const { data: currentSub } = useQuery({
    queryKey: ['/api/seller-subscriptions/my-subscription'],
  });

  const subscribeMutation = useMutation({
    mutationFn: (planId: string) => apiRequest('POST', '/api/seller-subscriptions/subscribe', { planId }),
    onSuccess: () => {
      toast({ title: 'Successfully subscribed!' });
      queryClient.invalidateQueries({ queryKey: ['/api/seller-subscriptions/my-subscription'] });
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: (planId: string) => apiRequest('PATCH', '/api/seller-subscriptions/upgrade', { planId }),
    onSuccess: () => {
      toast({ title: 'Plan upgraded!' });
      queryClient.invalidateQueries({ queryKey: ['/api/seller-subscriptions/my-subscription'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/seller-subscriptions/cancel', {}),
    onSuccess: () => {
      toast({ title: 'Subscription canceled' });
      queryClient.invalidateQueries({ queryKey: ['/api/seller-subscriptions/my-subscription'] });
    },
  });

  const handleSelectPlan = (planId: string) => {
    if (!currentSub) {
      subscribeMutation.mutate(planId);
    } else if (currentSub.planId !== planId) {
      upgradeMutation.mutate(planId);
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Subscription Plans</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Choose the perfect plan to grow your business</p>
      </div>

      {currentSub && (
        <Card className="border-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Plan</p>
                <p className="text-lg font-semibold">{currentSub.plan.name}</p>
                <p className="text-sm text-gray-500 mt-1">Renews on {new Date(currentSub.nextBillingDate!).toLocaleDateString()}</p>
              </div>
              <Badge>Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: any) => (
          <Card key={plan.id} className={currentSub?.planId === plan.id ? 'border-purple-500 border-2' : ''}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-3xl font-bold">
                  ${(plan.monthlyPrice / 100).toFixed(2)}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/month</span>
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{plan.maxProducts} Products</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{plan.maxCategories} Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{plan.maxVariantsPerProduct} Variants/Product</span>
                </div>
                {plan.hasAdvancedAnalytics && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Advanced Analytics</span>
                  </div>
                )}
                {plan.hasEmailMarketing && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Email Marketing</span>
                  </div>
                )}
                {plan.hasAffiliateTool && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Affiliate Tools</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm">{plan.commissionFeePercentage}% Commission</span>
                </div>
              </div>

              <Button
                onClick={() => handleSelectPlan(plan.id)}
                disabled={currentSub?.planId === plan.id}
                variant={currentSub?.planId === plan.id ? 'secondary' : 'default'}
                className="w-full"
                data-testid={`button-select-plan-${plan.id}`}
              >
                {currentSub?.planId === plan.id ? 'Current Plan' : 'Select Plan'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {currentSub && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            data-testid="button-cancel-subscription"
          >
            Cancel Subscription
          </Button>
        </div>
      )}
    </div>
  );
}
