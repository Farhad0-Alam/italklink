import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useLocation } from 'wouter';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function Checkout() {
  const { items, total, clearCart } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({ title: 'Cart is empty', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('/api/shop/checkout', {
        method: 'POST',
        body: {
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          total,
        },
      });

      if (response.data?.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        toast({ title: 'Checkout initiated', description: 'Redirecting to payment...' });
      }
    } catch (error) {
      toast({ title: 'Checkout failed', variant: 'destructive' });
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => setLocation('/shop')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Checkout</h1>

        <div className="grid gap-8">
          {/* Order Review */}
          <Card className="p-6 border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between">
                  <div>
                    <p className="font-semibold">{item.product.title}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold">${(item.subtotal / 100).toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between mb-4">
                <span className="text-lg font-bold">Total</span>
                <span className="text-lg font-bold text-blue-600">
                  ${(total / 100).toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleCheckout}
                disabled={isLoading}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="button-pay-now"
              >
                {isLoading ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </Card>

          {/* Security Info */}
          <Card className="p-6 border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
              💳 Payments are processed securely through Stripe. Your card information is never stored on our servers.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
