import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ShoppingCart, Star } from 'lucide-react';

export function CategoryProducts() {
  const { categorySlug } = useParams<{ categorySlug: string }>();

  const { data: category, isLoading } = useQuery({
    queryKey: ['/api/categories', categorySlug],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${categorySlug}`);
      if (!response.ok) throw new Error('Category not found');
      return response.json().then(r => r.data);
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['/api/shop/search', { category: categorySlug }],
    queryFn: async () => {
      const response = await fetch(`/api/shop/search?category=${categorySlug}`);
      if (!response.ok) return [];
      return response.json().then(r => r.data);
    },
    enabled: !!categorySlug,
  });

  if (isLoading) return <div className="p-6">Loading category...</div>;

  if (!category) return <div className="p-6">Category not found</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          {category.icon && <span className="text-4xl">{category.icon}</span>}
          {category.name}
        </h1>
        {category.description && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">{category.description}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">{products.length} products</p>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-gray-600 dark:text-gray-400">No products in this category yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product: any) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-2">{product.title}</CardTitle>
                {product.rating > 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating.toFixed(1)} ({product.reviewCount})</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold">${(product.price / 100).toFixed(2)}</span>
                  {product.discountPercentage > 0 && (
                    <Badge variant="secondary">{product.discountPercentage}% OFF</Badge>
                  )}
                </div>
                <Link href={`/product/${product.slug}`}>
                  <Button className="w-full gap-2" data-testid={`button-view-product-${product.id}`}>
                    <ShoppingCart className="w-4 h-4" />
                    View Product
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
