import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Package, Download, FileText } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function BuyerPurchases() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['/api/orders/buyer'],
    queryFn: async () => {
      const res = await fetch('/api/orders/buyer');
      if (!res.ok) throw new Error('Failed to fetch orders');
      const data = await res.json();
      return data.data || {};
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  const orders = ordersData?.orders || [];

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Package className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h1 className="text-3xl font-bold mb-2">No purchases yet</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Start shopping to see your purchases here</p>
          <Link href="/shop">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">My Purchases</h1>

        <div className="space-y-4">
          {orders.map((order: any) => (
            <Card key={order.id} className="p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-1">{order.product?.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    Order ID: {order.id}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Purchased: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${(order.amount / 100).toFixed(2)}</p>
                  <span className="inline-block mt-2 px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs font-semibold rounded-full">
                    {order.paymentStatus === 'completed' ? 'Paid' : 'Pending'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link href={`/user/downloads`}>
                  <Button variant="outline" size="sm" data-testid="button-download">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </Link>
                <Button variant="outline" size="sm" data-testid="button-invoice">
                  <FileText className="w-4 h-4 mr-2" />
                  Invoice
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
