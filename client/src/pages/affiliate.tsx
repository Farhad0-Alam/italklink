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
  Send,
  Settings,
  Eye,
  EyeOff
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
  payoutMethod?: string;
  stripeConnectAccountId?: string;
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
    sourceInfo: '',
    paymentType: 'onetime',
    recurringDuration: 12
  });
  const [copySuccess, setCopySuccess] = useState('');
  const [savingPayoutDetails, setSavingPayoutDetails] = useState(false);
  
  // Payout details form states
  const [paypalEmail, setPaypalEmail] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankRoutingNumber, setBankRoutingNumber] = useState('');
  const [bankAccountType, setBankAccountType] = useState('checking');
  const [showBankDetails, setShowBankDetails] = useState(false);
  
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

  const handleSavePayoutDetails = async () => {
    setSavingPayoutDetails(true);
    try {
      let payoutDetails: any = {};

      if (affiliate?.payoutMethod === 'paypal') {
        if (!paypalEmail) {
          toast({
            title: 'Error',
            description: 'PayPal email is required',
            variant: 'destructive'
          });
          setSavingPayoutDetails(false);
          return;
        }
        payoutDetails = { paypalEmail };
      } else if (affiliate?.payoutMethod === 'bank_transfer') {
        if (!bankAccountHolder || !bankAccountNumber || !bankRoutingNumber) {
          toast({
            title: 'Error',
            description: 'All bank details are required',
            variant: 'destructive'
          });
          setSavingPayoutDetails(false);
          return;
        }
        payoutDetails = {
          accountHolder: bankAccountHolder,
          accountNumber: bankAccountNumber,
          routingNumber: bankRoutingNumber,
          accountType: bankAccountType
        };
      }

      const response = await fetch('/api/affiliate/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payoutDetails })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Payout details saved successfully',
        });
        queryClient.invalidateQueries({ queryKey: ['/api/affiliate/me'] });
      } else {
        const error = await response.json();
        toast({
          title: 'Error',
          description: error.message || 'Failed to save payout details',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save payout details',
        variant: 'destructive'
      });
    } finally {
      setSavingPayoutDetails(false);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        {/* Back Navigation */}
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/dashboard')}
            className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </div>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Modern Header Section */}
        <div className="mb-12">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 p-12 text-white shadow-lg">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
            </div>
            <div className="relative text-center">
              <h1 className="text-4xl font-bold mb-3">Join Our Affiliate Program 🚀</h1>
              <p className="text-lg text-emerald-50">Earn up to 30% commission on every referral and build passive income</p>
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Competitive Commissions */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900 p-2.5">
                  <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <CardTitle className="text-emerald-700 dark:text-emerald-300">Competitive Commissions</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Earn up to 30% commission on every successful referral with our tiered commission structure.</p>
            </CardContent>
          </Card>

          {/* Real-time Analytics */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2.5">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle className="text-blue-700 dark:text-blue-300">Real-time Analytics</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Track your performance with detailed analytics, conversion tracking, and earnings reports.</p>
            </CardContent>
          </Card>

          {/* Marketing Materials */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-purple-100 dark:bg-purple-900 p-2.5">
                  <Gift className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle className="text-purple-700 dark:text-purple-300">Marketing Materials</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Access professionally designed banners, landing pages, and promotional materials.</p>
            </CardContent>
          </Card>

          {/* Dedicated Support */}
          <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-lg bg-orange-100 dark:bg-orange-900 p-2.5">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle className="text-orange-700 dark:text-orange-300">Dedicated Support</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Get help from our affiliate team with optimization tips and promotional strategies.</p>
            </CardContent>
          </Card>
        </div>

        {/* Modern Application Form Card */}
        <Card className="max-w-2xl mx-auto border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-xl">
            <CardTitle className="text-2xl">Apply to Become an Affiliate</CardTitle>
            <p className="text-blue-50 mt-2">
              Fill out the form below to start your affiliate journey
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleApply} className="space-y-6">
              {/* Basic Information Section */}
              <div className="space-y-5">
                <div>
                  <Label htmlFor="country" className="font-semibold text-base">Country *</Label>
                  <Select 
                    value={applicationForm.country} 
                    onValueChange={(value) => setApplicationForm(prev => ({ ...prev, country: value }))}
                    required
                  >
                    <SelectTrigger className="mt-2 h-11 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors">
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
                  <Label htmlFor="website" className="font-semibold text-base">Website/Social Media (Optional)</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://your-website.com"
                    value={applicationForm.website}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, website: e.target.value }))}
                    className="mt-2 h-11 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="sourceInfo" className="font-semibold text-base">How did you hear about us? (Optional)</Label>
                  <Textarea
                    id="sourceInfo"
                    placeholder="Tell us how you discovered our affiliate program..."
                    value={applicationForm.sourceInfo}
                    onChange={(e) => setApplicationForm(prev => ({ ...prev, sourceInfo: e.target.value }))}
                    className="mt-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-blue-500 transition-colors"
                    rows={4}
                  />
                </div>
              </div>

              {/* Commission Preferences Section */}
              <div className="border-t-2 border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="rounded-lg bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 p-2.5">
                    <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Commission Preferences</h3>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="paymentType" className="font-semibold">Commission Type *</Label>
                    <Select 
                      value={applicationForm.paymentType} 
                      onValueChange={(value) => setApplicationForm(prev => ({ ...prev, paymentType: value }))}
                    >
                      <SelectTrigger className="mt-2 h-11 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 transition-colors">
                        <SelectValue placeholder="Select commission type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onetime">One-Time Commissions</SelectItem>
                        <SelectItem value="recurring">Recurring Commissions (Track Lifetime Value)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground mt-2">
                      {applicationForm.paymentType === 'recurring' 
                        ? '💰 Earn commissions from recurring subscriptions for the specified duration'
                        : '💳 Earn commissions only on first-time purchases'}
                    </p>
                  </div>

                  {applicationForm.paymentType === 'recurring' && (
                    <div>
                      <Label htmlFor="recurringDuration" className="font-semibold">Recurring Commission Duration *</Label>
                      <Select 
                        value={applicationForm.recurringDuration.toString()} 
                        onValueChange={(value) => setApplicationForm(prev => ({ ...prev, recurringDuration: parseInt(value) }))}
                      >
                        <SelectTrigger className="mt-2 h-11 border-2 border-gray-200 dark:border-gray-700 rounded-lg focus:border-purple-500 transition-colors">
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3 Months</SelectItem>
                          <SelectItem value="6">6 Months</SelectItem>
                          <SelectItem value="12">12 Months</SelectItem>
                          <SelectItem value="24">24 Months</SelectItem>
                          <SelectItem value="36">36 Months (Lifetime)</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-2">
                        How long you'll earn commissions from each recurring customer
                      </p>
                    </div>
                  )}
                </div>

                {/* Modern Payout Info Box */}
                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2 border-blue-200 dark:border-blue-800 rounded-xl">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2 flex-shrink-0 mt-0.5">
                      <CreditCard className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                        Payout Method: Stripe Connect
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        All affiliates receive commissions via Stripe Connect for secure, automated payouts. You'll link your Stripe account during dashboard setup.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Submit Button */}
              <Button type="submit" size="lg" className="w-full mt-8 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
                <UserPlus className="h-5 w-5 mr-2" />
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
          {/* Modern Header Section */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 p-8 text-white shadow-lg">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent"></div>
              </div>
              <div className="relative">
                <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
                <p className="text-blue-100">Your affiliate performance is growing strong</p>
              </div>
            </div>
          </div>

          {/* Payout Settings Alert Card - PROMINENT */}
          {!affiliate?.stripeConnectAccountId && affiliate?.payoutMethod === 'stripe_connect' && (
            <Card className="mb-8 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-amber-100 dark:bg-amber-900 p-3 flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 dark:text-amber-100">Complete Your Payout Setup</h3>
                      <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                        Connect your Stripe account to start receiving affiliate commissions
                      </p>
                    </div>
                  </div>
                  <Button 
                    className="bg-amber-600 hover:bg-amber-700 text-white flex-shrink-0"
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/affiliate/stripe-connect/link', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          credentials: 'include',
                          body: JSON.stringify({ returnUrl: window.location.href })
                        });
                        if (response.ok) {
                          const data = await response.json();
                          window.location.href = data.data.url;
                        }
                      } catch (error) {
                        console.error('Failed to connect', error);
                      }
                    }}
                  >
                    Setup Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Modern Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            {/* Total Earnings Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-lg bg-emerald-100 dark:bg-emerald-900 p-2.5">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900 px-2.5 py-1 rounded-full">+12% this month</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Earnings</p>
                <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 mb-1">
                  ${(affiliate.stats.totalEarnings / 100).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">+${(affiliate.stats.pendingEarnings / 100).toFixed(2)}</span> pending
                </p>
              </CardContent>
            </Card>

            {/* Conversions Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-lg bg-blue-100 dark:bg-blue-900 p-2.5">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2.5 py-1 rounded-full">+5 this week</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Conversions</p>
                <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-1">
                  {affiliate.stats.totalConversions}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600 dark:text-blue-400 font-medium">+{affiliate.stats.pendingConversions}</span> pending
                </p>
              </CardContent>
            </Card>

            {/* Clicks Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-lg bg-purple-100 dark:bg-purple-900 p-2.5">
                    <MousePointer className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2.5 py-1 rounded-full">This month</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Clicks</p>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-300 mb-1">
                  {affiliate.stats.totalClicks}
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-purple-600 dark:text-purple-400 font-medium">
                    {affiliate.stats.totalClicks > 0 
                      ? `${((affiliate.stats.totalConversions / affiliate.stats.totalClicks) * 100).toFixed(2)}%`
                      : '0%'
                    }
                  </span> conversion rate
                </p>
              </CardContent>
            </Card>

            {/* Commission Rate Card */}
            <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="rounded-lg bg-orange-100 dark:bg-orange-900 p-2.5">
                    <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-xs font-medium text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900 px-2.5 py-1 rounded-full">Base rate</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Commission Rate</p>
                <div className="text-3xl font-bold text-orange-700 dark:text-orange-300 mb-1">
                  15%
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-orange-600 dark:text-orange-400 font-medium">Tier 1</span> commissions
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="links" className="space-y-6">
            <div className="bg-white dark:bg-slate-950 rounded-lg border border-gray-200 dark:border-gray-800 p-1 inline-flex gap-1">
              <TabsList className="grid grid-cols-6 gap-1 bg-transparent">
                <TabsTrigger value="links" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md transition-all">Links</TabsTrigger>
                <TabsTrigger value="conversions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md transition-all">Conversions</TabsTrigger>
                <TabsTrigger value="payouts" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md transition-all">Payouts</TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md transition-all">Analytics</TabsTrigger>
                <TabsTrigger value="assets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md transition-all">Marketing</TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white rounded-md transition-all">Settings</TabsTrigger>
              </TabsList>
            </div>

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

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Payout Settings
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    Configure your payout method and details
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Payout Method */}
                  <div>
                    <Label className="font-semibold">Current Payout Method</Label>
                    <div className="mt-2 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium capitalize">
                        {affiliate?.payoutMethod === 'stripe_connect' ? 'Stripe Connect' : 
                         affiliate?.payoutMethod === 'paypal' ? 'PayPal' :
                         affiliate?.payoutMethod === 'bank_transfer' ? 'Bank Transfer' : 'Not Set'}
                      </p>
                    </div>
                  </div>

                  {/* Stripe Connect Section */}
                  {affiliate?.payoutMethod === 'stripe_connect' && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          Stripe Connect Setup
                        </h3>
                        {affiliate?.stripeConnectAccountId ? (
                          <div className="p-3 bg-green-50 border border-green-200 rounded">
                            <div className="flex items-center gap-2 text-green-900">
                              <CheckCircle className="h-4 w-4" />
                              <div>
                                <p className="text-sm font-semibold">Connected</p>
                                <p className="text-xs text-green-800">Account ID: {affiliate.stripeConnectAccountId.substring(0, 15)}...</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                            <div className="flex items-start gap-2">
                              <Clock className="h-4 w-4 text-yellow-600 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold text-yellow-900">Not Connected</p>
                                <p className="text-xs text-yellow-800">Click below to link your Stripe account</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <Button 
                        className="w-full"
                        onClick={async () => {
                          try {
                            const response = await fetch('/api/affiliate/stripe-connect/link', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ returnUrl: window.location.href })
                            });
                            if (response.ok) {
                              const data = await response.json();
                              window.location.href = data.data.url;
                            } else {
                              const error = await response.json();
                              toast({
                                title: 'Error',
                                description: error.message || 'Failed to generate Stripe link',
                                variant: 'destructive'
                              });
                            }
                          } catch (error) {
                            toast({
                              title: 'Error',
                              description: 'Failed to connect Stripe account',
                              variant: 'destructive'
                            });
                          }
                        }}
                      >
                        {affiliate?.stripeConnectAccountId ? 'Update Stripe Account' : 'Connect Stripe Account'}
                      </Button>
                    </div>
                  )}

                  {/* PayPal Section */}
                  {affiliate?.payoutMethod === 'paypal' && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">PayPal Account</h3>
                        <div className="space-y-2">
                          <Label htmlFor="paypal-email">PayPal Email Address</Label>
                          <Input
                            id="paypal-email"
                            type="email"
                            placeholder="your-email@paypal.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            disabled={savingPayoutDetails}
                          />
                          <p className="text-xs text-muted-foreground">
                            Payouts will be sent to this PayPal account
                          </p>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        disabled={savingPayoutDetails}
                        onClick={handleSavePayoutDetails}
                      >
                        {savingPayoutDetails ? 'Saving...' : 'Save PayPal Details'}
                      </Button>
                    </div>
                  )}

                  {/* Bank Transfer Section */}
                  {affiliate?.payoutMethod === 'bank_transfer' && (
                    <div className="border rounded-lg p-4 space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3">Bank Account Details</h3>
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="account-holder">Account Holder Name</Label>
                            <Input
                              id="account-holder"
                              placeholder="John Doe"
                              value={bankAccountHolder}
                              onChange={(e) => setBankAccountHolder(e.target.value)}
                              disabled={savingPayoutDetails}
                            />
                          </div>

                          <div>
                            <Label htmlFor="account-type">Account Type</Label>
                            <Select value={bankAccountType} onValueChange={setBankAccountType} disabled={savingPayoutDetails}>
                              <SelectTrigger id="account-type">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="checking">Checking</SelectItem>
                                <SelectItem value="savings">Savings</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="routing-number">Routing Number</Label>
                            <Input
                              id="routing-number"
                              placeholder="123456789"
                              value={bankRoutingNumber}
                              onChange={(e) => setBankRoutingNumber(e.target.value)}
                              disabled={savingPayoutDetails}
                              type={showBankDetails ? 'text' : 'password'}
                            />
                          </div>

                          <div>
                            <Label htmlFor="account-number">Account Number</Label>
                            <div className="flex gap-2">
                              <Input
                                id="account-number"
                                placeholder="1234567890"
                                value={bankAccountNumber}
                                onChange={(e) => setBankAccountNumber(e.target.value)}
                                disabled={savingPayoutDetails}
                                type={showBankDetails ? 'text' : 'password'}
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowBankDetails(!showBankDetails)}
                                disabled={savingPayoutDetails}
                              >
                                {showBankDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              Bank details are encrypted and secure
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        disabled={savingPayoutDetails}
                        onClick={handleSavePayoutDetails}
                      >
                        {savingPayoutDetails ? 'Saving...' : 'Save Bank Details'}
                      </Button>
                    </div>
                  )}

                  {/* No payout method set */}
                  {!affiliate?.payoutMethod && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        No payout method configured. Please contact support to set up your preferred payout method.
                      </p>
                    </div>
                  )}
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