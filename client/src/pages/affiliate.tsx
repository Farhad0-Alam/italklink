import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign,
  TrendingUp,
  Users,
  MousePointer,
  Copy,
  ExternalLink,
  Download,
  FileText,
  BarChart3,
  Gift,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  Link as LinkIcon,
  Calendar,
  ArrowLeft,
  Wallet,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface AffiliateProfile {
  id: string;
  code: string;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  kycStatus: string;
  country: string;
  website?: string;
  stats: {
    totalClicks: number;
    totalConversions: number;
    totalEarnings: number;
    pendingEarnings: number;
    pendingConversions: number;
  };
}

interface AffiliateAnalytics {
  clickAnalytics: Array<{ date: string; clicks: number }>;
  conversionAnalytics: Array<{ date: string; conversions: number; revenue: number; commission: number }>;
  topSources: Array<{ source: string; clicks: number; conversions: number }>;
}

interface Conversion {
  id: string;
  orderId: string;
  amount: number;
  currency: string;
  commissionAmount: number;
  commissionRate: string;
  paymentType?: string;
  recurringValue?: string;
  recurringDuration?: number;
  status: string;
  createdAt: string;
  approvedAt?: string;
  lockUntil?: string;
}

interface MarketingAsset {
  id: string;
  name: string;
  description: string;
  category: string;
  assetUrl: string;
  assetType: string;
  dimensions?: string;
}

interface Payout {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: 'draft' | 'maker_approved' | 'checker_approved' | 'paid' | 'cancelled';
  createdAt: string;
  processedAt?: string;
}

export default function Affiliate() {
  const [, setLocation] = useLocation();
  const [applicationForm, setApplicationForm] = useState({
    country: '',
    website: '',
    sourceInfo: ''
  });
  const [copySuccess, setCopySuccess] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch affiliate profile
  const { data: affiliateResponse, isLoading: affiliateLoading } = useQuery({
    queryKey: ['/api/affiliate/me'],
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const affiliate = affiliateResponse?.data || null;

  // Fetch analytics
  const { data: analyticsResponse } = useQuery({
    queryKey: ['/api/affiliate/analytics'],
    enabled: !!affiliate && affiliate.status === 'approved',
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  const analytics = analyticsResponse?.data || null;

  // Fetch conversions
  const { data: conversionsResponse } = useQuery({
    queryKey: ['/api/affiliate/conversions'],
    enabled: !!affiliate && affiliate.status === 'approved',
    staleTime: 1000 * 60 * 2,
  });

  const conversions = conversionsResponse?.data || [];

  // Fetch marketing assets
  const { data: assetsResponse } = useQuery({
    queryKey: ['/api/affiliate/marketing-assets'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  const assets = assetsResponse?.data || [];

  // Fetch payouts
  const { data: payoutsResponse } = useQuery({
    queryKey: ['/api/affiliate/payouts'],
    enabled: !!affiliate && affiliate.status === 'approved',
    staleTime: 1000 * 60 * 2,
  });

  const payouts = payoutsResponse?.data || [];

  // Payout request state
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('');
  const [requestingPayout, setRequestingPayout] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!applicationForm.country) {
      toast({
        title: 'Error',
        description: 'Please select your country',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/affiliate/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(applicationForm)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Application Submitted',
          description: `Your affiliate application has been submitted with code: ${result.code}`,
        });
        queryClient.invalidateQueries({ queryKey: ['/api/affiliate/me'] });
      } else {
        const error = await response.json();
        toast({
          title: 'Application Failed',
          description: error.message,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit application',
        variant: 'destructive'
      });
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      toast({
        title: 'Copied!',
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy to clipboard',
        variant: 'destructive'
      });
    }
  };

  const generateAffiliateLink = (path: string = '/', params: Record<string, string> = {}) => {
    const baseUrl = window.location.origin;
    const url = new URL(path, baseUrl);
    
    // Add affiliate code
    url.searchParams.set('ref', affiliate?.code || '');
    
    // Add custom parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    
    return url.toString();
  };

  const handlePayoutRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!payoutAmount || !payoutMethod) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive'
      });
      return;
    }

    const amount = parseInt(payoutAmount) * 100;
    if (amount <= 0) {
      toast({
        title: 'Error',
        description: 'Payout amount must be greater than 0',
        variant: 'destructive'
      });
      return;
    }

    setRequestingPayout(true);
    try {
      const response = await fetch('/api/affiliate/payout-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount,
          method: payoutMethod
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: 'Success',
          description: 'Payout request submitted successfully',
        });
        setPayoutAmount('');
        setPayoutMethod('');
        queryClient.invalidateQueries({ queryKey: ['/api/affiliate/payouts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/affiliate/me'] });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to request payout',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to request payout',
        variant: 'destructive'
      });
    } finally {
      setRequestingPayout(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'suspended': return <AlertCircle className="h-4 w-4" />;
      case 'rejected': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  // Loading state
  if (affiliateLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading affiliate dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Application form for non-affiliates
  if (!affiliate) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setLocation('/dashboard')}
              className="flex items-center space-x-2 hover:bg-gray-100"
              data-testid="button-back-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-300" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Join Our Affiliate Program</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Earn commissions by promoting our digital business card platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Competitive Commissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Earn up to 30% commission on every successful referral with our tiered commission structure.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-time Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Track your performance with detailed analytics, conversion tracking, and earnings reports.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Marketing Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Access professionally designed banners, landing pages, and promotional materials.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Dedicated Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get help from our affiliate team with optimization tips and promotional strategies.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Apply to Become an Affiliate</CardTitle>
            <p className="text-muted-foreground">
              Fill out the form below to start your affiliate journey
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleApply} className="space-y-6">
              <div>
                <Label htmlFor="country">Country *</Label>
                <Select 
                  value={applicationForm.country} 
                  onValueChange={(value) => setApplicationForm(prev => ({ ...prev, country: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="US">United States</SelectItem>
                    <SelectItem value="CA">Canada</SelectItem>
                    <SelectItem value="GB">United Kingdom</SelectItem>
                    <SelectItem value="AU">Australia</SelectItem>
                    <SelectItem value="DE">Germany</SelectItem>
                    <SelectItem value="FR">France</SelectItem>
                    <SelectItem value="BD">Bangladesh</SelectItem>
                    <SelectItem value="IN">India</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="website">Website/Social Media (Optional)</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://your-website.com"
                  value={applicationForm.website}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="sourceInfo">How did you hear about us? (Optional)</Label>
                <Textarea
                  id="sourceInfo"
                  placeholder="Tell us how you discovered our affiliate program..."
                  value={applicationForm.sourceInfo}
                  onChange={(e) => setApplicationForm(prev => ({ ...prev, sourceInfo: e.target.value }))}
                />
              </div>

              <Button type="submit" className="w-full" size="lg">
                <UserPlus className="h-4 w-4 mr-2" />
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Affiliate dashboard for existing affiliates
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/dashboard')}
            className="flex items-center space-x-2 hover:bg-gray-100"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
          <div className="h-6 w-px bg-gray-300" />
        </div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
          <Badge className={getStatusColor(affiliate.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(affiliate.status)}
              {affiliate.status}
            </div>
          </Badge>
        </div>
        
        <div className="flex items-center gap-4 text-muted-foreground">
          <span>Affiliate Code: <code className="font-mono bg-muted px-2 py-1 rounded">{affiliate.code}</code></span>
          <span>KYC Status: {affiliate.kycStatus}</span>
        </div>
      </div>

      {affiliate.status === 'pending' && (
        <Card className="mb-8 border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <h3 className="font-semibold text-yellow-800">Application Under Review</h3>
                <p className="text-yellow-700">
                  Your affiliate application is being reviewed. We'll notify you once it's approved.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {affiliate.status === 'approved' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(affiliate.stats.totalEarnings / 100).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  +${(affiliate.stats.pendingEarnings / 100).toFixed(2)} pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conversions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{affiliate.stats.totalConversions}</div>
                <p className="text-xs text-muted-foreground">
                  +{affiliate.stats.pendingConversions} pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{affiliate.stats.totalClicks}</div>
                <p className="text-xs text-muted-foreground">
                  {affiliate.stats.totalClicks > 0 
                    ? `${((affiliate.stats.totalConversions / affiliate.stats.totalClicks) * 100).toFixed(2)}% conversion rate`
                    : 'No clicks yet'
                  }
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">15%</div>
                <p className="text-xs text-muted-foreground">
                  Base commission rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="links" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="links">Affiliate Links</TabsTrigger>
              <TabsTrigger value="conversions">Conversions</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="assets">Marketing</TabsTrigger>
            </TabsList>

            <TabsContent value="links" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Affiliate Links</CardTitle>
                  <p className="text-muted-foreground">
                    Create custom affiliate links for different pages and campaigns
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Landing Page</Label>
                      <div className="flex gap-2">
                        <Input value={generateAffiliateLink('/')} readOnly />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(generateAffiliateLink('/'), 'Landing page link')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Pricing Page</Label>
                      <div className="flex gap-2">
                        <Input value={generateAffiliateLink('/pricing')} readOnly />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(generateAffiliateLink('/pricing'), 'Pricing page link')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Templates Page</Label>
                      <div className="flex gap-2">
                        <Input value={generateAffiliateLink('/templates')} readOnly />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(generateAffiliateLink('/templates'), 'Templates page link')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <Label>Builder Page</Label>
                      <div className="flex gap-2">
                        <Input value={generateAffiliateLink('/builder')} readOnly />
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => copyToClipboard(generateAffiliateLink('/builder'), 'Builder page link')}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Label>Custom Campaign Link</Label>
                    <div className="flex gap-2 mt-2">
                      <Input placeholder="Add UTM parameters or custom tracking..." />
                      <Button variant="outline">
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Generate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conversions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Conversions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Commission</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {conversions.length > 0 ? (
                          conversions.slice(0, 10).map((conversion) => (
                            <TableRow key={conversion.id}>
                              <TableCell className="font-mono text-sm">{conversion.orderId}</TableCell>
                              <TableCell>${(conversion.amount / 100).toFixed(2)}</TableCell>
                              <TableCell className="font-medium">${(conversion.commissionAmount / 100).toFixed(2)}</TableCell>
                              <TableCell>
                                <Badge variant={conversion.paymentType === 'recurring' ? 'default' : 'secondary'}>
                                  {conversion.paymentType === 'recurring' ? 'Recurring' : 'One-Time'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {conversion.paymentType === 'recurring' && conversion.recurringDuration ? (
                                  <span className="text-sm">{conversion.recurringDuration}m</span>
                                ) : (
                                  <span className="text-muted-foreground text-sm">-</span>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge className={getStatusColor(conversion.status)}>
                                  {conversion.status}
                                </Badge>
                              </TableCell>
                              <TableCell>{format(new Date(conversion.createdAt), 'MMM dd, yyyy')}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8">
                              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No conversions yet</p>
                              <p className="text-sm text-muted-foreground">Start promoting to see your first conversion!</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Payout Management
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Request payouts for your earned commissions
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Available Balance:</strong> ${(affiliate.stats.totalEarnings / 100).toFixed(2)}
                    </p>
                    <p className="text-sm text-blue-800 mt-1">
                      Pending Earnings: ${(affiliate.stats.pendingEarnings / 100).toFixed(2)} (locked for 30 days after approval)
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-4">Request a Payout</h3>
                    <form onSubmit={handlePayoutRequest} className="space-y-4">
                      <div>
                        <Label htmlFor="payout-amount">Amount (USD) *</Label>
                        <Input
                          id="payout-amount"
                          type="number"
                          placeholder="Enter amount"
                          value={payoutAmount}
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          disabled={requestingPayout}
                          data-testid="input-payout-amount"
                        />
                      </div>

                      <div>
                        <Label htmlFor="payout-method">Payout Method *</Label>
                        <Select value={payoutMethod} onValueChange={setPayoutMethod} disabled={requestingPayout}>
                          <SelectTrigger id="payout-method" data-testid="select-payout-method">
                            <SelectValue placeholder="Select payout method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                            <SelectItem value="paypal">PayPal</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button type="submit" disabled={requestingPayout} className="w-full" data-testid="button-request-payout">
                        <Send className="h-4 w-4 mr-2" />
                        {requestingPayout ? 'Requesting...' : 'Request Payout'}
                      </Button>
                    </form>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-4">Payout History</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payouts.length > 0 ? (
                          payouts.slice(0, 10).map((payout) => (
                            <TableRow key={payout.id}>
                              <TableCell className="font-medium">${(payout.amount / 100).toFixed(2)}</TableCell>
                              <TableCell className="capitalize">{payout.method.replace('_', ' ')}</TableCell>
                              <TableCell>
                                <Badge className={
                                  payout.status === 'paid' ? 'bg-green-100 text-green-800 border-green-200' :
                                  payout.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  payout.status === 'cancelled' ? 'bg-red-100 text-red-800 border-red-200' :
                                  'bg-blue-100 text-blue-800 border-blue-200'
                                }>
                                  {payout.status.replace('_', ' ')}
                                </Badge>
                              </TableCell>
                              <TableCell>{format(new Date(payout.createdAt), 'MMM dd, yyyy')}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8">
                              <Wallet className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                              <p className="text-muted-foreground">No payouts yet</p>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">Analytics coming soon</p>
                    <p className="text-sm text-muted-foreground">Detailed charts and reports will be available here</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="assets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Marketing Assets</CardTitle>
                  <p className="text-muted-foreground">
                    Download promotional materials to boost your affiliate performance
                  </p>
                </CardHeader>
                <CardContent>
                  {assets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {assets.map((asset) => (
                        <Card key={asset.id} className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{asset.name}</h4>
                              <p className="text-sm text-muted-foreground">{asset.description}</p>
                              {asset.dimensions && (
                                <p className="text-xs text-muted-foreground mt-1">{asset.dimensions}</p>
                              )}
                            </div>
                            <Badge variant="outline">{asset.category}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={asset.assetUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Preview
                              </a>
                            </Button>
                            <Button size="sm" asChild>
                              <a href={asset.assetUrl} download>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No marketing assets available</p>
                      <p className="text-sm text-muted-foreground">Check back later for promotional materials</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {affiliate.status === 'suspended' && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Account Suspended</h3>
                <p className="text-red-700">
                  Your affiliate account has been suspended. Please contact support for more information.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {affiliate.status === 'rejected' && (
        <Card className="border-gray-200 bg-gray-50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-gray-600" />
              <div>
                <h3 className="font-semibold text-gray-800">Application Rejected</h3>
                <p className="text-gray-700">
                  Your affiliate application was not approved. You can reapply after addressing the requirements.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}