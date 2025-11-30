import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { DollarSign, Users, Building2, Percent, Save, RefreshCw, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface CommissionSettings {
  ownerCommission: number;
  sellerCommission: number;
  platformCommission: number;
}

export default function AdminCommission() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<CommissionSettings>({
    ownerCommission: 50,
    sellerCommission: 30,
    platformCommission: 20,
  });

  const { data: currentSettings, isLoading } = useQuery<{ success: boolean; data: CommissionSettings }>({
    queryKey: ['/api/shop/admin/commission-settings'],
  });

  const updateMutation = useMutation({
    mutationFn: (data: CommissionSettings) => 
      apiRequest('PATCH', '/api/shop/admin/commission-settings', data),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Commission settings updated' });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/admin/commission-settings'] });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update settings', variant: 'destructive' });
    },
  });

  const handleSliderChange = (field: keyof CommissionSettings, value: number[]) => {
    const newValue = value[0];
    const remaining = 100 - newValue;
    
    if (field === 'ownerCommission') {
      const sellerRatio = settings.sellerCommission / (settings.sellerCommission + settings.platformCommission) || 0.6;
      setSettings({
        ownerCommission: newValue,
        sellerCommission: Math.round(remaining * sellerRatio),
        platformCommission: Math.round(remaining * (1 - sellerRatio)),
      });
    } else if (field === 'sellerCommission') {
      setSettings(prev => ({
        ...prev,
        sellerCommission: newValue,
        platformCommission: 100 - prev.ownerCommission - newValue,
      }));
    }
  };

  const total = settings.ownerCommission + settings.sellerCommission + settings.platformCommission;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-950 dark:to-pink-950 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Commission Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure the 3-way commission split for digital product sales
          </p>
        </div>

        <div className="grid gap-6">
          {/* Commission Overview */}
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5 text-purple-600" />
                Commission Split Overview
              </CardTitle>
              <CardDescription>
                Define how revenue is distributed between product owners, sellers/affiliates, and the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Visual Distribution */}
              <div className="flex h-8 rounded-lg overflow-hidden shadow-inner">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-sm font-medium transition-all"
                  style={{ width: `${settings.ownerCommission}%` }}
                >
                  {settings.ownerCommission}%
                </div>
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-medium transition-all"
                  style={{ width: `${settings.sellerCommission}%` }}
                >
                  {settings.sellerCommission}%
                </div>
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-sm font-medium transition-all"
                  style={{ width: `${settings.platformCommission}%` }}
                >
                  {settings.platformCommission}%
                </div>
              </div>

              {/* Legend */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                  <Users className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <p className="font-semibold text-blue-700 dark:text-blue-400">Product Owner</p>
                  <p className="text-2xl font-bold">{settings.ownerCommission}%</p>
                </div>
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30">
                  <DollarSign className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <p className="font-semibold text-green-700 dark:text-green-400">Seller/Affiliate</p>
                  <p className="text-2xl font-bold">{settings.sellerCommission}%</p>
                </div>
                <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                  <Building2 className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <p className="font-semibold text-purple-700 dark:text-purple-400">TalkLink Platform</p>
                  <p className="text-2xl font-bold">{settings.platformCommission}%</p>
                </div>
              </div>

              <Separator />

              {/* Sliders */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Product Owner Commission</Label>
                    <Badge variant="outline">{settings.ownerCommission}%</Badge>
                  </div>
                  <Slider
                    value={[settings.ownerCommission]}
                    onValueChange={(v) => handleSliderChange('ownerCommission', v)}
                    max={80}
                    min={20}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">The creator who uploaded the product</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Seller/Affiliate Commission</Label>
                    <Badge variant="outline">{settings.sellerCommission}%</Badge>
                  </div>
                  <Slider
                    value={[settings.sellerCommission]}
                    onValueChange={(v) => handleSliderChange('sellerCommission', v)}
                    max={100 - settings.ownerCommission - 5}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-sm text-gray-500">The person who referred the sale</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Platform Commission</Label>
                    <Badge variant="outline">{settings.platformCommission}%</Badge>
                  </div>
                  <div className="h-2 w-full bg-purple-200 dark:bg-purple-800 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all"
                      style={{ width: `${(settings.platformCommission / 50) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">Automatically calculated (remaining after owner + seller)</p>
                </div>
              </div>

              {total !== 100 && (
                <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-red-600 dark:text-red-400 font-medium">
                    Warning: Total must equal 100% (currently {total}%)
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={() => updateMutation.mutate(settings)}
                  disabled={total !== 100 || updateMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {updateMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Save Settings
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setSettings({ ownerCommission: 50, sellerCommission: 30, platformCommission: 20 })}
                >
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Example Calculation */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Example Calculation</CardTitle>
              <CardDescription>How a $100 sale would be distributed</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Product Owner</p>
                  <p className="text-2xl font-bold text-blue-600">${settings.ownerCommission}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Seller/Affiliate</p>
                  <p className="text-2xl font-bold text-green-600">${settings.sellerCommission}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Platform</p>
                  <p className="text-2xl font-bold text-purple-600">${settings.platformCommission}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
