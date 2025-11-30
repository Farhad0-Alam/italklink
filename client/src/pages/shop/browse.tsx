import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Star, Download } from 'lucide-react';
import { useLocation } from 'wouter';

export default function ShopBrowse() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: products, isLoading } = useQuery({
    queryKey: ['/api/shop/browse', { search, category }],
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Digital Product Shop
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Discover premium digital products from talented creators</p>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filter</Button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-slate-800 animate-pulse">
                <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-t-lg" />
                <CardContent className="pt-4 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            products?.map((product: any) => (
              <Card
                key={product.id}
                className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer bg-white dark:bg-slate-800"
                onClick={() => setLocation(`/shop/product/${product.slug}`)}
              >
                {/* Thumbnail */}
                <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 relative overflow-hidden">
                  {product.thumbnailUrl && (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {product.status === 'active' && (
                    <Badge className="absolute top-3 right-3 bg-green-500">Active</Badge>
                  )}
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2 text-lg">{product.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.shortDescription}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({product.reviewCount} reviews)
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${(product.price / 100).toFixed(2)}
                    </span>
                    {product.discountPrice && (
                      <span className="text-sm line-through text-gray-500">
                        ${(product.discountPrice / 100).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Purchase Button */}
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy Now
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {!isLoading && products?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No products found. Try a different search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
