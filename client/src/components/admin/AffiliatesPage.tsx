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
  DialogTrigger,
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
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserPlus,
  Eye,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Percent
} from 'lucide-react';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import CommissionRulesPage from './CommissionRulesPage';

interface Affiliate {
  id: string;
  userId: string;
  code: string;
  country: string;
  website?: string;
  cookieDurationDays?: number;
  status: 'pending' | 'approved' | 'suspended' | 'rejected';
  kycStatus: 'pending' | 'submitted' | 'approved' | 'rejected' | 'expired';
  totalEarnings: number;
  totalConversions: number;
  totalClicks: number;
  createdAt: string;
  approvedAt?: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState('affiliates');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [editCookieDialogOpen, setEditCookieDialogOpen] = useState(false);
  const [editingCookieDays, setEditingCookieDays] = useState<number>(30);
  const [notes, setNotes] = useState('');
  
  const queryClient = useQueryClient();

  // Fetch affiliates
  const { data: affiliates = [], isLoading } = useQuery<Affiliate[]>({
    queryKey: ['/api/admin/affiliates', statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      
      const url = `/api/admin/affiliates${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin';
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch affiliates: ${res.statusText}`);
      }
      
      const result = await res.json();
      return result.data || result;
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Fetch affiliate stats
  const { data: stats } = useQuery<{
    totalAffiliates: number;
    pendingAffiliates: number;
    activeAffiliates: number;
    totalCommissions: number;
    monthlyGrowth: number;
  }>({
    queryKey: ['/api/admin/affiliates/stats'],
    staleTime: 1000 * 60 * 5,
  });

  // Filter affiliates
  const filteredAffiliates = affiliates.filter(affiliate => {
    const matchesSearch = 
      affiliate.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      affiliate.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${affiliate.user.firstName} ${affiliate.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || affiliate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (affiliateId: string) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates/stats'] });
        setApproveDialogOpen(false);
        setSelectedAffiliate(null);
        setNotes('');
      } else {
        const error = await response.json();
        alert(`Failed to approve affiliate: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to approve affiliate:', error);
      alert('Failed to approve affiliate');
    }
  };

  const handleSuspend = async (affiliateId: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/affiliates/${affiliateId}/suspend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates/stats'] });
      } else {
        const error = await response.json();
        alert(`Failed to suspend affiliate: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to suspend affiliate:', error);
      alert('Failed to suspend affiliate');
    }
  };

  const handleUpdateCookieDuration = async () => {
    if (!selectedAffiliate) return;
    
    try {
      const response = await fetch(`/api/affiliate/me`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cookieDurationDays: editingCookieDays })
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates'] });
        setEditCookieDialogOpen(false);
        alert(`Cookie duration updated to ${editingCookieDays} days`);
      } else {
        const error = await response.json();
        alert(`Failed to update: ${error.message}`);
      }
    } catch (error) {
      console.error('Failed to update cookie duration:', error);
      alert('Failed to update cookie duration');
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

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading affiliates...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Affiliate Management</h1>
          <p className="text-muted-foreground mt-2">Manage affiliate partners, commission rules, and performance</p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="affiliates">Affiliates</TabsTrigger>
          <TabsTrigger value="commission-rules" className="flex items-center gap-2">
            <Percent className="h-4 w-4" />
            Commission Rules
          </TabsTrigger>
        </TabsList>

        {/* Affiliates Tab */}
        <TabsContent value="affiliates" className="space-y-6">

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Affiliates</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAffiliates}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingAffiliates}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Affiliates</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeAffiliates}</div>
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
                  placeholder="Search by code, email, or name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-affiliates"
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
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      {/* Affiliates Table */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliates ({filteredAffiliates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>KYC Status</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffiliates.map((affiliate) => (
                <TableRow key={affiliate.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{affiliate.user.firstName} {affiliate.user.lastName}</div>
                      <div className="text-sm text-muted-foreground">{affiliate.user.email}</div>
                      {affiliate.website && (
                        <div className="text-xs text-blue-600">{affiliate.website}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">
                      {affiliate.code}
                    </Badge>
                  </TableCell>
                  <TableCell>{affiliate.country}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(affiliate.status)}>
                      {affiliate.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getKYCStatusColor(affiliate.kycStatus)}>
                      {affiliate.kycStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>${(affiliate.totalEarnings / 100).toFixed(2)} earned</div>
                      <div className="text-muted-foreground">
                        {affiliate.totalConversions} conversions • {affiliate.totalClicks} clicks
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(affiliate.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedAffiliate(affiliate);
                          setViewDetailsOpen(true);
                        }}
                        data-testid={`view-affiliate-${affiliate.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {affiliate.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAffiliate(affiliate);
                            setApproveDialogOpen(true);
                          }}
                          className="text-green-600 hover:text-green-700"
                          data-testid={`approve-affiliate-${affiliate.id}`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {affiliate.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const reason = prompt('Reason for suspension:');
                            if (reason) {
                              handleSuspend(affiliate.id, reason);
                            }
                          }}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`suspend-affiliate-${affiliate.id}`}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredAffiliates.length === 0 && (
            <div className="text-center py-8">
              <UserPlus className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold text-foreground">No affiliates found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters.' 
                  : 'No affiliate applications yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Affiliate</DialogTitle>
            <DialogDescription>
              Approve {selectedAffiliate?.user.firstName} {selectedAffiliate?.user.lastName} as an affiliate partner.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="notes">Approval Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this approval..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => selectedAffiliate && handleApprove(selectedAffiliate.id)}>
              Approve Affiliate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Cookie Duration Dialog */}
      <Dialog open={editCookieDialogOpen} onOpenChange={setEditCookieDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Cookie Duration</DialogTitle>
            <DialogDescription>
              Set the attribution window for tracking affiliate commissions (7-90 days)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="cookie-days">Cookie Duration (Days)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="cookie-days"
                  type="number"
                  min="7"
                  max="90"
                  value={editingCookieDays}
                  onChange={(e) => setEditingCookieDays(Math.max(7, Math.min(90, parseInt(e.target.value) || 7)))}
                  className="flex-1"
                />
                <div className="text-sm text-muted-foreground pt-2">days</div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Minimum 7 days, maximum 90 days. Default is 30 days.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCookieDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCookieDuration}>
              Update Duration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

        {/* View Details Dialog */}
        <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Affiliate Details</DialogTitle>
          </DialogHeader>
          
          {selectedAffiliate && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Name:</strong> {selectedAffiliate.user.firstName} {selectedAffiliate.user.lastName}</div>
                    <div><strong>Email:</strong> {selectedAffiliate.user.email}</div>
                    <div><strong>Code:</strong> {selectedAffiliate.code}</div>
                    <div><strong>Country:</strong> {selectedAffiliate.country}</div>
                    {selectedAffiliate.website && (
                      <div><strong>Website:</strong> {selectedAffiliate.website}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Performance Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Total Earnings:</strong> ${(selectedAffiliate.totalEarnings / 100).toFixed(2)}</div>
                    <div><strong>Total Conversions:</strong> {selectedAffiliate.totalConversions}</div>
                    <div><strong>Total Clicks:</strong> {selectedAffiliate.totalClicks}</div>
                    <div><strong>Conversion Rate:</strong> {selectedAffiliate.totalClicks > 0 ? ((selectedAffiliate.totalConversions / selectedAffiliate.totalClicks) * 100).toFixed(2) : 0}%</div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Status Information</h3>
                  <div className="space-y-2 text-sm">
                    <div><strong>Status:</strong> <Badge className={getStatusColor(selectedAffiliate.status)}>{selectedAffiliate.status}</Badge></div>
                    <div><strong>KYC Status:</strong> <Badge className={getKYCStatusColor(selectedAffiliate.kycStatus)}>{selectedAffiliate.kycStatus}</Badge></div>
                    <div><strong>Joined:</strong> {format(new Date(selectedAffiliate.createdAt), 'PPP')}</div>
                    {selectedAffiliate.approvedAt && (
                      <div><strong>Approved:</strong> {format(new Date(selectedAffiliate.approvedAt), 'PPP')}</div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Attribution Settings</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <div><strong>Cookie Duration:</strong> {selectedAffiliate.cookieDurationDays || 30} days</div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCookieDays(selectedAffiliate.cookieDurationDays || 30);
                          setEditCookieDialogOpen(true);
                        }}
                        className="text-blue-600"
                      >
                        Edit
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Controls how long affiliate clicks are tracked for commission attribution (7-90 days)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        </Dialog>
        </TabsContent>

        {/* Commission Rules Tab */}
        <TabsContent value="commission-rules">
          <CommissionRulesPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}