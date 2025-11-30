import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { Star, ShoppingCart, MapPin, Globe, Mail } from 'lucide-react';
import { useState } from 'react';

interface SellerInfo {
  id: string;
  email: string;
  fullName: string;
  profileImage?: string;
  bio?: string;
  company?: string;
  website?: string;
  location?: string;
}

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  views: number;
  purchases: number;
  averageRating: number;
  reviewCount: number;
}

export default function SellerStore() {
  const { sellerId } = useParams<{ sellerId: string }>();
  const [sortBy, setSortBy] = useState('newest');

  const { data: seller, isLoading: sellerLoading } = useQuery({
    queryKey: ['/api/shop/seller', sellerId],
    queryFn: async () => {
      const res = await fetch(`/api/shop/seller/${sellerId}`);
      if (!res.ok) throw new Error('Seller not found');
      const data = await res.json();
      return data.data as SellerInfo;
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ['/api/shop/seller-products', sellerId, sortBy],
    queryFn: async () => {
      const res = await fetch(`/api/shop/seller/${sellerId}/products?sort=${sortBy}`);
      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []) as Product[];
    },
    enabled: !!sellerId,
  });

  if (sellerLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-96"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
        <div className="max-w-6xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Seller Store Not Found</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-8">This seller's store is no longer available.</p>
          <Link href="/shop">
            <Button>Back to Shop</Button>
          </Link>
        </div>
      </div>
    );
  }

  const totalSales = products.reduce((sum, p) => sum + p.purchases, 0);
  const averageRating = products.length > 0
    ? (products.reduce((sum, p) => sum + p.averageRating, 0) / products.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Store Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-6 items-start">
            <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-700 flex-shrink-0 overflow-hidden border-4 border-white">
              {seller.profileImage ? (
                <img src={seller.profileImage} alt={seller.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                  {seller.fullName?.charAt(0) || 'S'}
                </div>
              )}
            </div>
            
            <div className="flex-grow text-white">
              <h1 className="text-4xl font-bold mb-2">{seller.fullName || 'Seller Store'}</h1>
              {seller.company && <p className="text-blue-100 mb-2">{seller.company}</p>}
              {seller.bio && <p className="text-blue-100 max-w-2xl mb-4">{seller.bio}</p>}
              
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-300 text-yellow-300" />
                  <span className="font-semibold">{averageRating} ({products.length} products)</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  <span className="font-semibold">{totalSales} Sales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="flex flex-wrap gap-4 mt-6">
            {seller.location && (
              <div className="flex items-center gap-2 text-blue-100 bg-blue-600/30 px-3 py-1 rounded-full">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">{seller.location}</span>
              </div>
            )}
            {seller.website && (
              <a
                href={seller.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-100 bg-blue-600/30 px-3 py-1 rounded-full hover:bg-blue-600/50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">Website</span>
              </a>
            )}
            <a
              href={`mailto:${seller.email}`}
              className="flex items-center gap-2 text-blue-100 bg-blue-600/30 px-3 py-1 rounded-full hover:bg-blue-600/50 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">Contact</span>
            </a>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Store Products</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            data-testid="select-sort"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
          </select>
        </div>

        {productsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400 text-lg">This store has no products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  data-testid={`card-product-${product.id}`}
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 overflow-hidden">
                    {product.image ? (
                      <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex justify-between items-end mb-4">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">${(product.price / 100).toFixed(2)}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.averageRating.toFixed(1)}</span>
                          <span className="text-xs text-slate-500">({product.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-700 pt-3">
                      <span>{product.views} views</span>
                      <span>•</span>
                      <span>{product.purchases} sold</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
