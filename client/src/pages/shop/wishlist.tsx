import { useQuery, useMutation } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { queryClient } from '@/lib/queryClient';

export default function Wishlist() {
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['/api/wishlist'],
    queryFn: async () => {
      const res = await fetch('/api/wishlist');
      if (!res.ok) throw new Error('Failed to fetch wishlist');
      const data = await res.json();
      return data.data || [];
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch(`/api/wishlist/${productId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to remove from wishlist');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wishlist'] });
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: string) => {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });
      if (!res.ok) throw new Error('Failed to add to cart');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
  });

  if (isLoading) return <LoadingSkeleton />;

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-4xl mx-auto text-center py-16">
          <Heart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
          <h1 className="text-3xl font-bold mb-2">Your Wishlist is Empty</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Save products you love for later</p>
          <Link href="/search">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wishlist</h1>
          <p className="text-slate-600 dark:text-slate-400">{wishlist.length} product{wishlist.length !== 1 ? 's' : ''} saved</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item: any) => (
            <Card key={item.productId} className="border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition">
              {item.product?.thumbnailUrl && (
                <img
                  src={item.product.thumbnailUrl}
                  alt={item.product.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="font-semibold mb-2 line-clamp-2">{item.product?.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
                  {item.product?.shortDescription}
                </p>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-lg font-bold">
                    ${((item.product?.discountPrice || item.product?.price) / 100).toFixed(2)}
                  </span>
                  {item.product?.discountPrice && item.product?.price && (
                    <span className="text-sm line-through text-slate-500">
                      ${(item.product.price / 100).toFixed(2)}
                    </span>
                  )}
                </div>

                {item.notes && (
                  <p className="text-xs text-slate-500 mb-3 italic">Notes: {item.notes}</p>
                )}

                <div className="flex gap-2">
                  <Link href={`/product/${item.product?.slug}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full" data-testid="button-view">
                      View
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addToCartMutation.mutate(item.productId)}
                    disabled={addToCartMutation.isPending}
                    data-testid="button-add-cart"
                  >
                    <ShoppingCart className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromWishlistMutation.mutate(item.productId)}
                    disabled={removeFromWishlistMutation.isPending}
                    data-testid="button-remove"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
