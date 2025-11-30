import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Search, ShoppingCart, Star, Download, Filter, Package, TrendingUp, Menu } from 'lucide-react';
import { useLocation } from 'wouter';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useShopMenu } from '@/context/ShopMenuContext';

interface DigitalProduct {
  id: string;
  sellerId: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  description: string;
  price: number;
  discountPrice: number | null;
  category: string | null;
  thumbnailUrl: string | null;
  status: string;
  views: number;
  purchases: number;
  rating: number;
  reviewCount: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'paid';
}

export default function ShopBrowse() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const { mobileMenuOpen, setMobileMenuOpen } = useShopMenu();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const { data: businessCards = [] } = useQuery<any[]>({
    queryKey: ['/api/business-cards'],
    enabled: !!user,
  });

  const { data: affiliate } = useQuery<any>({
    queryKey: ['/api/affiliate/me'],
    enabled: !!user,
    retry: false,
  });

  // Build query string
  const queryString = new URLSearchParams();
  if (search) queryString.set('search', search);
  if (category && category !== 'all') queryString.set('category', category);

  const { data: productsData, isLoading } = useQuery<{ success: boolean; data: DigitalProduct[] }>({
    queryKey: ['/api/shop/browse', search, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category && category !== 'all') params.set('category', category);
      const response = await fetch(`/api/shop/browse?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: categoriesData } = useQuery<{ success: boolean; data: Category[] }>({
    queryKey: ['/api/shop/categories'],
    queryFn: async () => {
      const response = await fetch('/api/shop/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const products = productsData?.data || [];
  const categories = (categoriesData?.data && Array.isArray(categoriesData.data)) ? categoriesData.data : [];

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 fixed h-screen">
        <DashboardSidebar 
          user={user}
          businessCardsCount={businessCards.length}
          affiliate={affiliate}
          onLogout={() => setLocation('/')}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-64 p-0 md:hidden">
          <DashboardSidebar 
            user={user}
            businessCardsCount={businessCards.length}
            affiliate={affiliate}
            onLogout={() => setLocation('/')}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 overflow-y-auto">
        {/* Top Bar for Mobile */}
        <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm h-16">
          <div className="flex items-center h-full px-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Digital Product Shop
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Discover premium digital products from talented creators</p>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{products.length}</p>
                <p className="text-sm text-gray-500">Products</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {products.reduce((acc, p) => acc + (p.purchases || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Total Sales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-slate-800"
                data-testid="search-products"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full md:w-[200px] bg-white dark:bg-slate-800" data-testid="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.slug}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          ) : products.length > 0 ? (
            products.map((product) => (
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
          ) : (
            <div className="col-span-full text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No products found. Try a different search.</p>
            </div>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
