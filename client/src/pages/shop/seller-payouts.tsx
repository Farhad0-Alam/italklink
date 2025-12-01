import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function SellerPayouts() {
  const { toast } = useToast();

  const { data: methods = [], isLoading: methodsLoading } = useQuery({
    queryKey: ['/api/payouts/methods'],
  });

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ['/api/payouts'],
  });

  const { data: earnings } = useQuery({
    queryKey: ['/api/payouts/earnings/summary'],
    queryFn: async () => {
      const response = await fetch('/api/payouts/earnings/summary');
      if (!response.ok) return { earnings: 0 };
      return response.json().then(r => r.data);
    },
  });

  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/payouts', {
        minAmount: 5000, // $50 minimum
      });
    },
    onSuccess: () => {
      toast({ title: 'Payout request submitted!' });
      queryClient.invalidateQueries({ queryKey: ['/api/payouts'] });
    },
    onError: () => {
      toast({ title: 'Error requesting payout', variant: 'destructive' });
    },
  });

  const deleteMethodMutation = useMutation({
    mutationFn: (methodId: string) => apiRequest('DELETE', `/api/payouts/methods/${methodId}`, {}),
    onSuccess: () => {
      toast({ title: 'Payout method deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/payouts/methods'] });
    },
  });

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (methodsLoading || payoutsLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Seller Payouts</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your payout methods and earnings</p>
      </div>

      {/* Earnings Summary */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Available Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold">{earnings?.formattedAmount || '$0.00'}</div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Minimum payout: $50.00</p>
          <Button
            className="mt-4"
            onClick={() => requestPayoutMutation.mutate()}
            disabled={!earnings || earnings.earnings < 5000 || requestPayoutMutation.isPending}
            data-testid="button-request-payout"
          >
            Request Payout
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="methods" className="w-full">
        <TabsList>
          <TabsTrigger value="methods">Payout Methods</TabsTrigger>
          <TabsTrigger value="history">Payout History</TabsTrigger>
        </TabsList>

        {/* Payout Methods Tab */}
        <TabsContent value="methods" className="space-y-4">
          {methods.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">No payout methods connected</p>
                <Button variant="outline" data-testid="button-add-payout-method">
                  Connect Stripe Account
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {methods.map((method: any) => (
                <Card key={method.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{method.accountHolderName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {method.payoutMethod === 'bank_transfer' ? 'Bank Transfer' : 'Debit Card'} · {method.bankCountry}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">ID: {method.stripeConnectAccountId}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {method.isVerified ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMethodMutation.mutate(method.id)}
                          data-testid={`button-delete-method-${method.id}`}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Payout History Tab */}
        <TabsContent value="history" className="space-y-4">
          {payouts.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <DollarSign className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No payouts yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {payouts.map((payout: any) => (
                <Card key={payout.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">${(payout.amount / 100).toFixed(2)}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusBadgeColor(payout.status)}>
                          {payout.status.charAt(0).toUpperCase() + payout.status.slice(1)}
                        </Badge>
                        {payout.failureReason && (
                          <p className="text-xs text-red-600 dark:text-red-400">{payout.failureReason}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
