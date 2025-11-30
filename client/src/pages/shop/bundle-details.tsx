import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function BundleDetails() {
  const { bundleId } = useParams<{ bundleId: string }>();
  const { toast } = useToast();

  const { data: bundle, isLoading } = useQuery({
    queryKey: ['/api/bundles', bundleId],
    queryFn: async () => {
      const response = await fetch(`/api/bundles/${bundleId}`);
      if (!response.ok) throw new Error('Bundle not found');
      return response.json().then(r => r.data);
    },
    enabled: !!bundleId,
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      // Add bundle as a special cart item
      return apiRequest('POST', '/api/cart', {
        bundleId,
        quantity: 1,
      });
    },
    onSuccess: () => {
      toast({ title: 'Bundle added to cart!' });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({ title: 'Error adding bundle to cart', variant: 'destructive' });
    },
  });

  if (isLoading) {
    return <div className="p-6">Loading bundle...</div>;
  }

  if (!bundle) {
    return <div className="p-6">Bundle not found</div>;
  }

  const savings = bundle.originalPrice - bundle.bundlePrice;

  return (
    <div className="space-y-6 p-6 max-w-4xl">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Left side - Bundle info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{bundle.title}</h1>
            <Badge variant="secondary" className="text-lg py-1 px-3">
              {bundle.discountPercentage}% OFF
            </Badge>
          </div>

          {bundle.description && (
            <p className="text-gray-600 dark:text-gray-400">{bundle.description}</p>
          )}

          <div className="space-y-2 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">Bundle Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">${(bundle.bundlePrice / 100).toFixed(2)}</span>
              <span className="text-lg line-through text-gray-500">
                ${(bundle.originalPrice / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-sm font-semibold text-green-600 dark:text-green-400">
              Save ${(savings / 100).toFixed(2)}
            </p>
          </div>

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending}
            data-testid={`button-add-bundle-to-cart-${bundle.id}`}
          >
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </Button>
        </div>

        {/* Right side - Bundle items */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5" />
            Included Items ({bundle.items?.length || 0})
          </h2>

          <div className="space-y-3">
            {bundle.items?.map((item: any) => (
              <Card key={item.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <p className="font-semibold">{item.product?.title || 'Product'}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Qty: {item.quantity}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold">
                      ${((item.product?.price || 0) * (item.quantity || 1) / 100).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {bundle.items && bundle.items.length > 0 && (
            <Card className="bg-gray-50 dark:bg-gray-900">
              <CardContent className="pt-4">
                <div className="flex justify-between items-center text-sm">
                  <p className="text-gray-600 dark:text-gray-400">Original Value</p>
                  <p className="font-semibold">${(bundle.originalPrice / 100).toFixed(2)}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
