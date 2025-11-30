import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { Copy, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AffiliateDashboard() {
  const { toast } = useToast();
  
  const { data: dashboard, isLoading } = useQuery({
    queryKey: ['/api/shop/affiliate/dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/shop/affiliate/dashboard');
      if (!res.ok) throw new Error('Failed to fetch dashboard');
      const data = await res.json();
      return data.data || {};
    },
  });

  const { data: breakdown } = useQuery({
    queryKey: ['/api/shop/affiliate/breakdown'],
    queryFn: async () => {
      const res = await fetch('/api/shop/affiliate/breakdown');
      if (!res.ok) throw new Error('Failed to fetch breakdown');
      const data = await res.json();
      return data.data || {};
    },
  });

  const { data: history } = useQuery({
    queryKey: ['/api/shop/affiliate/history'],
    queryFn: async () => {
      const res = await fetch('/api/shop/affiliate/history');
      if (!res.ok) throw new Error('Failed to fetch history');
      const data = await res.json();
      return data.data || [];
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Affiliate link copied to clipboard',
    });
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Earn 30% commission on every sale through your referral link</p>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="w-4 h-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(dashboard?.totalEarnings / 100 || 0).toFixed(2)}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Your commission earnings</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.totalClicks || 0}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Referral link clicks</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversions</CardTitle>
              <Users className="w-4 h-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboard?.totalConversions || 0}</div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Successful sales</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conv. Rate</CardTitle>
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboard?.totalClicks > 0 
                  ? ((dashboard?.totalConversions / dashboard?.totalClicks) * 100).toFixed(1) 
                  : '0'}%
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">Click to sale rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Commission Breakdown */}
        {breakdown && (
          <Card className="border border-slate-200 dark:border-slate-700 mb-8">
            <CardHeader>
              <CardTitle>Commission Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="font-medium">Total Sales Through You</span>
                  <span className="text-lg font-bold">${(breakdown?.totalSalesAmount / 100 || 0).toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Your Commission (30%)</p>
                    <p className="text-2xl font-bold text-green-600">${(breakdown?.affiliateAmount / 100 || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Seller Earns (50%)</p>
                    <p className="text-2xl font-bold text-blue-600">${(breakdown?.sellerAmount / 100 || 0).toFixed(2)}</p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">Platform (20%)</p>
                    <p className="text-2xl font-bold text-amber-600">${(breakdown?.platformAmount / 100 || 0).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Commissions */}
        {history && history.length > 0 && (
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle>Recent Commission Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {history.map((commission: any) => (
                  <div key={commission.id} className="flex items-center justify-between pb-3 border-b dark:border-slate-700 last:border-0">
                    <div>
                      <p className="font-medium">{commission.productTitle}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${(commission.affiliateAmount / 100).toFixed(2)}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{commission.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
