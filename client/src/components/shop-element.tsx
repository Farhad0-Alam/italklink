import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Search } from 'lucide-react';
import { useLocation } from 'wouter';

interface ShopElementProps {
  sellerId: string;
  title?: string;
  description?: string;
  maxItems?: number;
}

interface Product {
  id: string;
  title: string;
  price: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  status: string;
  purchases: number;
  rating: number;
}

export function ShopElement({ sellerId, title = 'Digital Products', description, maxItems = 6 }: ShopElementProps) {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');

  const { data: productsData, isLoading } = useQuery<{ success: boolean; data: Product[] }>({
    queryKey: ['/api/shop/browse', sellerId],
    queryFn: async () => {
      const response = await fetch(`/api/shop/browse?limit=${maxItems}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const products = (productsData?.data || []).slice(0, maxItems);

  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-blue-200 dark:border-slate-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          {title}
        </h2>
        {description && <p className="text-gray-600 dark:text-gray-400">{description}</p>}
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="shop-element-search"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded-t" />
              <CardContent className="pt-3 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded" />
              </CardContent>
            </Card>
          ))
        ) : products.length > 0 ? (
          products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setLocation(`/shop/product/${product.id}`)}
              data-testid={`shop-product-card-${product.id}`}
            >
              <div className="h-32 bg-gradient-to-br from-blue-400 to-purple-500">
                {product.thumbnailUrl && (
                  <img src={product.thumbnailUrl} alt={product.title} className="w-full h-full object-cover" />
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-sm line-clamp-2 mb-2">{product.title}</h3>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold">${(product.price / 100).toFixed(2)}</span>
                  {product.purchases > 0 && <Badge variant="secondary">{product.purchases} sold</Badge>}
                </div>
                <Button size="sm" className="w-full" data-testid={`buy-button-${product.id}`}>
                  <ShoppingCart className="h-3 w-3 mr-1" /> Buy
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">No products available</div>
        )}
      </div>
    </div>
  );
}
