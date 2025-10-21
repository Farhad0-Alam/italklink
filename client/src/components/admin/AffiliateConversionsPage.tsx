import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Filter,
  DollarSign,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface Conversion {
  id: string;
  orderId: string;
  affiliateId: string;
  amount: number;
  currency: string;
  commissionAmount: number;
  commissionRate: string;
  status: 'pending' | 'approved' | 'paid' | 'reversed';
  planId?: number;
  createdAt: string;
  approvedAt?: string;
  reversedAt?: string;
  lockUntil?: string;
  affiliate: {
    code: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  plan?: {
    name: string;
    planType: string;
  };
}

export default function AffiliateConversionsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedConversion, setSelectedConversion] = useState<Conversion | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reverse'>('approve');
  const [reason, setReason] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch conversions
  const { data: conversions = [], isLoading } = useQuery<Conversion[]>({
    queryKey: ['/api/admin/conversions', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const url = `/api/admin/conversions${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin';
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch conversions: ${res.statusText}`);
      }
      
      const result = await res.json();
      return result.data || result;
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Fetch conversion stats
  const { data: stats } = useQuery<{
    totalConversions: number;
    pendingConversions: number;
    approvedConversions: number;
    totalCommissions: number;
    pendingCommissions: number;
    monthlyGrowth: number;
  }>({
    queryKey: ['/api/admin/conversions/stats'],
    staleTime: 1000 * 60 * 5,
  });

  // Filter conversions
  const filteredConversions = conversions.filter(conversion => {
    const matchesSearch = 
      conversion.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversion.affiliate.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conversion.affiliate.user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || conversion.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAction = async () => {
    if (!selectedConversion) return;

    try {
      const endpoint = actionType === 'approve' 
        ? `/api/admin/conversions/${selectedConversion.id}/approve`
        : `/api/admin/conversions/${selectedConversion.id}/reverse`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/conversions'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/conversions/stats'] });
        setActionDialogOpen(false);
        setSelectedConversion(null);
        setReason('');
      } else {
        const error = await response.json();
        alert(`Failed to ${actionType} conversion: ${error.message}`);
      }
    } catch (error) {
      console.error(`Failed to ${actionType} conversion:`, error);
      alert(`Failed to ${actionType} conversion`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reversed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'paid': return <DollarSign className="h-4 w-4" />;
      case 'reversed': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading conversions...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Affiliate Conversions</h1>
          <p className="text-muted-foreground mt-2">Manage and review affiliate conversions</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Conversions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingConversions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approvedConversions}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Commissions</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.totalCommissions / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payout</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(stats.pendingCommissions / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{stats.monthlyGrowth}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by order ID, affiliate code, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-conversions"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Conversions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Conversions ({filteredConversions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Details</TableHead>
                <TableHead>Affiliate</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversions.map((conversion) => (
                <TableRow key={conversion.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium font-mono text-sm">{conversion.orderId}</div>
                      {conversion.lockUntil && new Date(conversion.lockUntil) > new Date() && (
                        <div className="text-xs text-amber-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Locked until {format(new Date(conversion.lockUntil), 'MMM dd')}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{conversion.affiliate.user.firstName} {conversion.affiliate.user.lastName}</div>
                      <div className="text-sm text-muted-foreground">{conversion.affiliate.code}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {conversion.plan ? (
                      <div>
                        <div className="font-medium">{conversion.plan.name}</div>
                        <div className="text-sm text-muted-foreground capitalize">{conversion.plan.planType}</div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${(conversion.amount / 100).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{conversion.currency}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${(conversion.commissionAmount / 100).toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">{conversion.commissionRate}% rate</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(conversion.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(conversion.status)}
                        {conversion.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>{format(new Date(conversion.createdAt), 'MMM dd, yyyy')}</div>
                    <div className="text-muted-foreground">{format(new Date(conversion.createdAt), 'HH:mm')}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedConversion(conversion);
                          // Open detailed view
                        }}
                        data-testid={`view-conversion-${conversion.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {conversion.status === 'pending' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedConversion(conversion);
                              setActionType('approve');
                              setActionDialogOpen(true);
                            }}
                            className="text-green-600 hover:text-green-700"
                            data-testid={`approve-conversion-${conversion.id}`}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedConversion(conversion);
                              setActionType('reverse');
                              setActionDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                            data-testid={`reverse-conversion-${conversion.id}`}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {conversion.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedConversion(conversion);
                            setActionType('reverse');
                            setActionDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`reverse-conversion-${conversion.id}`}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredConversions.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">No conversions found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'No affiliate conversions yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Conversion' : 'Reverse Conversion'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve' 
                ? 'Approve this conversion and release commission for payout.' 
                : 'Reverse this conversion due to refund or chargeback.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedConversion && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Order ID:</strong> {selectedConversion.orderId}</div>
                  <div><strong>Amount:</strong> ${(selectedConversion.amount / 100).toFixed(2)}</div>
                  <div><strong>Commission:</strong> ${(selectedConversion.commissionAmount / 100).toFixed(2)}</div>
                  <div><strong>Affiliate:</strong> {selectedConversion.affiliate.code}</div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="reason">
                  {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Reversal Reason (Required)'}
                </Label>
                <Textarea
                  id="reason"
                  placeholder={actionType === 'approve' 
                    ? 'Add any notes about this approval...' 
                    : 'Explain why this conversion is being reversed...'}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="mt-1"
                  required={actionType === 'reverse'}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction}
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              disabled={actionType === 'reverse' && !reason.trim()}
            >
              {actionType === 'approve' ? 'Approve Conversion' : 'Reverse Conversion'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}