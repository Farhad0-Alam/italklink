import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Menu, DollarSign, ShoppingBag, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
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

export default function SellerOrders() {
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

  const { data: ordersResponse, isLoading: ordersLoading } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/shop/seller/orders'],
  });

  const orders = (ordersResponse?.data && Array.isArray(ordersResponse.data)) ? ordersResponse.data : [];
  const businessCards = businessCardsData || [];

  // Calculate stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o: any) => o.paymentStatus === 'completed').length;
  const totalRevenue = orders.reduce((sum: number, o: any) => sum + (o.sellerAmount || 0), 0);
  const totalCommission = orders.reduce((sum: number, o: any) => sum + (o.commissionAmount || 0), 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3" data-testid="text-page-title">
                Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Track all customer orders and payments</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalOrders}</p>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Your Earnings</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">${(totalRevenue / 100).toFixed(2)}</p>
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
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Order Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">${(averageOrderValue / 100).toFixed(2)}</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Completed</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{completedOrders}/{totalOrders}</p>
                      <p className="text-xs text-gray-500 mt-1">{totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(0) : 0}%</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Orders</CardTitle>
                <CardDescription>All purchases of your products</CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
                    <p className="text-gray-500">Loading orders...</p>
                  </div>
                ) : orders?.length === 0 ? (
                  <div className="text-center py-12">
                    <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-2">No orders yet</p>
                    <p className="text-gray-400 text-sm">Your customer orders will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders?.map((order: any) => (
                      <div key={order.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Order ID</p>
                            <p className="font-mono text-sm font-semibold">{order.id?.slice(0, 12)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Buyer</p>
                            <p className="text-sm font-medium">{order.buyerEmail || order.buyerName || 'Unknown'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Amount</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">${((order.amount || 0) / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Earnings</p>
                            <p className="text-sm font-semibold text-green-600 dark:text-green-400">${((order.sellerAmount || 0) / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</p>
                            <Badge className={`${
                              order.paymentStatus === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                                : order.paymentStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200'
                            }`}>
                              {order.paymentStatus || 'pending'}
                            </Badge>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Commission Amount</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">${((order.commissionAmount || 0) / 100).toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Commission %</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">20%</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Order Date</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Buyer Name</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{order.buyerName || '-'}</p>
                          </div>
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
