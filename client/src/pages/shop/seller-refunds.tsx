import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

export function SellerRefundsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [selectedRefund, setSelectedRefund] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ['/api/refunds'],
  });

  const approveMutation = useMutation({
    mutationFn: async (refundId: string) =>
      apiRequest('POST', `/api/refunds/${refundId}/approve`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refunds'] });
      toast({ title: 'Refund approved successfully' });
    },
    onError: () => toast({ title: 'Error approving refund', variant: 'destructive' }),
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ refundId, reason }: { refundId: string; reason: string }) =>
      apiRequest('POST', `/api/refunds/${refundId}/reject`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/refunds'] });
      toast({ title: 'Refund rejected' });
      setSelectedRefund(null);
      setRejectionReason('');
    },
    onError: () => toast({ title: 'Error rejecting refund', variant: 'destructive' }),
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-blue-50 text-blue-900 dark:bg-blue-900 dark:text-blue-100';
      case 'approved':
        return 'bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-100';
      case 'rejected':
        return 'bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-100';
      default:
        return '';
    }
  };

  const pendingRefunds = refunds.filter((r: any) => r.status === 'requested');

  if (isLoading) {
    return <div className="p-6">Loading refunds...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Refund Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage buyer refund requests for your products</p>
      </div>

      {pendingRefunds.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-900/20">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                  {pendingRefunds.length} pending refund request{pendingRefunds.length !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">Review and respond to requests below</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {refunds.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No refund requests</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {refunds.map((refund: any) => (
            <Card key={refund.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(refund.status)}
                    <div>
                      <h3 className="font-semibold">Order {refund.orderId.slice(0, 8)}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{refund.reason}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(refund.status)}>
                    {refund.status.charAt(0).toUpperCase() + refund.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-semibold">${(refund.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Requested</p>
                    <p className="font-semibold">{format(new Date(refund.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Buyer</p>
                    <p className="font-semibold text-sm truncate">{refund.buyerEmail}</p>
                  </div>
                </div>

                {refund.status === 'requested' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(refund.id)}
                      disabled={approveMutation.isPending}
                      data-testid={`button-approve-refund-${refund.id}`}
                    >
                      Approve
                    </Button>
                    <Dialog open={selectedRefund?.id === refund.id} onOpenChange={(open) => !open && setSelectedRefund(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setSelectedRefund(refund)}
                          data-testid={`button-reject-refund-${refund.id}`}
                        >
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Refund Request</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <Textarea
                            placeholder="Provide a reason for rejection (optional)"
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedRefund(null);
                                setRejectionReason('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                rejectMutation.mutate({
                                  refundId: refund.id,
                                  reason: rejectionReason,
                                })
                              }
                              disabled={rejectMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
