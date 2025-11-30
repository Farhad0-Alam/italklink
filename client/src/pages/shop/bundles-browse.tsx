import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Package } from 'lucide-react';

export function BundlesBrowse() {
  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ['/api/bundles'],
  });

  if (isLoading) {
    return <div className="p-6">Loading bundles...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Product Bundles</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Save more with our curated product bundles</p>
      </div>

      {bundles.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No bundles available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bundles.map((bundle: any) => (
            <Card key={bundle.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="line-clamp-2">{bundle.title}</CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {bundle.items?.length || 0} items included
                    </p>
                  </div>
                  <Badge variant="secondary" className="flex-shrink-0">
                    {bundle.discountPercentage}% OFF
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bundle Price</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">${(bundle.bundlePrice / 100).toFixed(2)}</span>
                    <span className="text-sm line-through text-gray-500">
                      ${(bundle.originalPrice / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {bundle.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                    {bundle.description}
                  </p>
                )}

                <Link href={`/shop/bundles/${bundle.id}`}>
                  <Button className="w-full" data-testid={`button-view-bundle-${bundle.id}`}>
                    View Bundle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
