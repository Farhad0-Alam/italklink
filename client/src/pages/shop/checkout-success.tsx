import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { CheckCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutSuccess() {
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear cart on success
    clearCart().catch(() => {});
  }, [clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
      <Card className="p-8 max-w-md w-full border border-slate-200 dark:border-slate-700 text-center">
        <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
        
        <h1 className="text-3xl font-bold mb-2">Order Complete!</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Thank you for your purchase. A confirmation email has been sent to you with your download links.
        </p>

        <div className="space-y-3">
          <Link href="/user/downloads">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
              View My Downloads
            </Button>
          </Link>

          <Link href="/shop">
            <Button variant="outline" className="w-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 mt-6">
          Download links are valid for 48 hours and can be downloaded up to 5 times.
        </p>
      </Card>
    </div>
  );
}
