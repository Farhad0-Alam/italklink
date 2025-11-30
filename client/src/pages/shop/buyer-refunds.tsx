import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

export function BuyerRefundsPage() {
  const [, navigate] = useLocation();

  const { data: refunds = [], isLoading } = useQuery({
    queryKey: ['/api/refunds'],
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'requested':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-500" />;
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
      case 'processed':
        return 'bg-green-50 text-green-900 dark:bg-green-900 dark:text-green-100';
      case 'rejected':
        return 'bg-red-50 text-red-900 dark:bg-red-900 dark:text-red-100';
      case 'cancelled':
        return 'bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100';
      default:
        return '';
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading refunds...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">My Refund Requests</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Track the status of your refund requests</p>
      </div>

      {refunds.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No refund requests yet</p>
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

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Amount</p>
                    <p className="font-semibold">${(refund.amount / 100).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Requested</p>
                    <p className="font-semibold">{format(new Date(refund.createdAt), 'MMM dd, yyyy')}</p>
                  </div>
                </div>

                {refund.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                    <p className="text-sm">{refund.notes}</p>
                  </div>
                )}

                {refund.status === 'requested' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/shop/refunds/${refund.id}/cancel`)}
                    data-testid={`button-cancel-refund-${refund.id}`}
                  >
                    Cancel Request
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
