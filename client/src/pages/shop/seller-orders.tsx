import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { BarChart3, Menu } from 'lucide-react';
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

  const { data: ordersResponse } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/shop/seller/orders'],
  });

  const orders = (ordersResponse?.data && Array.isArray(ordersResponse.data)) ? ordersResponse.data : [];
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3" data-testid="text-page-title">
                Orders
              </h1>
              <p className="text-gray-600 dark:text-gray-400">Track all customer orders and payments</p>
            </div>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Customer Orders</CardTitle>
                <CardDescription>All purchases of your products</CardDescription>
              </CardHeader>
              <CardContent>
                {orders?.length === 0 ? (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">No orders yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 font-semibold">Order ID</th>
                          <th className="text-left py-3 px-4 font-semibold">Buyer</th>
                          <th className="text-left py-3 px-4 font-semibold">Amount</th>
                          <th className="text-left py-3 px-4 font-semibold">Your Earnings</th>
                          <th className="text-left py-3 px-4 font-semibold">Status</th>
                          <th className="text-left py-3 px-4 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders?.map((order: any) => (
                          <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700/50" data-testid={`row-order-${order.id}`}>
                            <td className="py-3 px-4 font-mono text-xs">{order.id?.slice(0, 8)}</td>
                            <td className="py-3 px-4">{order.buyerEmail || 'Unknown'}</td>
                            <td className="py-3 px-4">${((order.amount || 0) / 100).toFixed(2)}</td>
                            <td className="py-3 px-4 font-semibold text-green-600">
                              ${((order.sellerAmount || 0) / 100).toFixed(2)}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                order.paymentStatus === 'completed'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                  : order.paymentStatus === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
