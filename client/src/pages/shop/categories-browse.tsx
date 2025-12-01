import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { Folder } from 'lucide-react';

export function CategoriesBrowse() {
  const [, params] = useLocation();
  const sellerId = new URLSearchParams(window.location.search).get('seller');

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['/api/categories/seller', sellerId],
    queryFn: async () => {
      const response = await fetch(`/api/categories/seller/${sellerId}`);
      if (!response.ok) return [];
      return response.json().then(r => r.data);
    },
    enabled: !!sellerId,
  });

  if (isLoading) return <div className="p-6">Loading categories...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Product Categories</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Browse our organized product categories</p>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="pt-12 text-center">
            <Folder className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No categories available</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: any) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start gap-3">
                  {category.icon && (
                    <span className="text-3xl">{category.icon}</span>
                  )}
                  <div>
                    <CardTitle>{category.name}</CardTitle>
                    {category.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {category.description.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Link href={`/shop/categories/${category.slug}`}>
                  <Button variant="outline" className="w-full" data-testid={`button-view-category-${category.id}`}>
                    Browse Products
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
