import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { TrendingUp, DollarSign, ShoppingBag, Eye, Menu } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useShopMenu } from '@/context/ShopMenuContext';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'paid';
}

export default function SellerAnalytics() {
  const [, setLocation] = useLocation();
  const { mobileMenuOpen, setMobileMenuOpen } = useShopMenu();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const { data: businessCardsData = [] } = useQuery<any[]>({
    queryKey: ['/api/business-cards'],
    enabled: !!user,
  });

  const { data: affiliate } = useQuery<any>({
    queryKey: ['/api/affiliate/me'],
    enabled: !!user,
    retry: false,
  });

  const { data: analyticsResponse } = useQuery<{ success: boolean; data: any }>({
    queryKey: ['/api/shop/seller/analytics'],
  });

  const analytics = analyticsResponse?.data || {};
  const businessCards = businessCardsData || [];

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
            onNavigate={(href) => {
              if (!href.startsWith('/shop')) {
                setMobileMenuOpen(false);
              }
            }}
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

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3" data-testid="text-page-title">
                Sales Analytics
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Performance and earnings overview</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${((analytics.totalRevenue || 0) / 100).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sales</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.totalSales || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <ShoppingBag className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.totalViews || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Eye className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Products</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {analytics.totalProducts || 0}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Top Performing Products</CardTitle>
                <CardDescription>Your best-selling products</CardDescription>
              </CardHeader>
              <CardContent>
                {!analytics.products || analytics.products.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No products yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.products.slice(0, 5).map((product: any) => (
                      <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{product.title}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{product.purchases || 0} sales</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600 dark:text-green-400">
                            ${((product.price / 100) * (product.purchases || 0) * 0.3).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
