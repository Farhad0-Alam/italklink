import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Download, Package, ArrowLeft, Menu } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { useShopMenu } from '@/context/ShopMenuContext';

interface Purchase {
  id: string;
  productId: string;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  product?: {
    title: string;
    price: number;
    category: string;
  };
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'paid';
}

export default function UserPurchases() {
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

  const { data: purchasesData, isLoading } = useQuery<{ success: boolean; data: Purchase[] }>({
    queryKey: ['/api/shop/user/purchases'],
  });

  const purchases = purchasesData?.data || [];
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
              if (!href.startsWith('/shop') && !href.startsWith('/user')) {
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

        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">My Purchases</h1>
          <p className="text-gray-600 dark:text-gray-400">Download your purchased digital products</p>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 space-y-3">
                  <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3" />
                </CardContent>
              </Card>
            ))
          ) : purchases.length > 0 ? (
            purchases.map((purchase) => (
              <Card key={purchase.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow" data-testid={`purchase-card-${purchase.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {purchase.product?.title || 'Digital Product'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${(purchase.amount / 100).toFixed(2)}
                        </p>
                        <Badge variant={purchase.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                          {purchase.paymentStatus}
                        </Badge>
                      </div>
                      <Button
                        className="gap-2"
                        data-testid={`download-button-${purchase.id}`}
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Purchases Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">Start shopping for digital products</p>
                <Link href="/shop">
                  <Button>Browse Shop</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}
