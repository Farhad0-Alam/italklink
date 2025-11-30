import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Link } from 'wouter';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Cart() {
  const { items, total, itemCount, removeFromCart, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId);
      toast({ title: 'Item removed from cart' });
    } catch (error) {
      toast({ title: 'Failed to remove item', variant: 'destructive' });
    }
  };

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateQuantity(productId, newQuantity);
    } catch (error) {
      toast({ title: 'Failed to update quantity', variant: 'destructive' });
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Start shopping to add items to your cart</p>
          <Link href="/shop">
            <Button size="lg">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Shopping Cart ({itemCount} items)</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.productId} className="p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex gap-6">
                  {/* Product Image */}
                  {item.product.thumbnailUrl && (
                    <img
                      src={item.product.thumbnailUrl}
                      alt={item.product.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  )}

                  {/* Product Info */}
                  <div className="flex-1">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="text-lg font-semibold hover:text-blue-600 cursor-pointer">
                        {item.product.title}
                      </h3>
                    </Link>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      {item.product.shortDescription}
                    </p>

                    {/* Price */}
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        ${(item.product.price / 100).toFixed(2)}
                      </span>
                      {item.product.discountPrice && (
                        <span className="text-sm line-through text-slate-500">
                          ${(item.product.discountPrice / 100).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        data-testid="button-decrease-quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                        data-testid="button-increase-quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="mt-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      data-testid="button-remove-item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-right">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal:</span>
                  <span className="ml-2 text-lg font-bold">
                    ${(item.subtotal / 100).toFixed(2)}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 border border-slate-200 dark:border-slate-700 sticky top-8">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Subtotal</span>
                  <span className="font-semibold">${(total / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Shipping</span>
                  <span className="font-semibold">Free</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-blue-600">${(total / 100).toFixed(2)}</span>
                </div>
              </div>

              <Button className="w-full mb-3 bg-blue-600 hover:bg-blue-700" size="lg" data-testid="button-checkout">
                Proceed to Checkout
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => clearCart()}
                data-testid="button-clear-cart"
              >
                Clear Cart
              </Button>

              <Link href="/shop">
                <button className="w-full mt-4 text-blue-600 hover:text-blue-700 font-semibold py-2">
                  Continue Shopping
                </button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
