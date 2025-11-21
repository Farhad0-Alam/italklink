import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface Payout {
  id: string;
  affiliateId: string;
  amount: number;
  currency: string;
  method: string;
  status: 'draft' | 'maker_approved' | 'checker_approved' | 'paid' | 'cancelled';
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  transactionRef?: string;
  affiliate: {
    code: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

interface PayoutResponse {
  success: boolean;
  data: {
    payouts: Payout[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export default function AffiliatePayoutsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [actionDialog, setActionDialog] = useState<{ type: 'approve' | 'verify' | 'process' | 'cancel'; payout: Payout } | null>(null);
  const [notes, setNotes] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [page, setPage] = useState(1);

  const { data: response, isLoading } = useQuery<PayoutResponse>({
    queryKey: ['/api/admin/affiliates/payouts', statusFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', '50');
      
      const res = await fetch(`/api/admin/affiliates/payouts?${params.toString()}`, { credentials: 'include' });
      
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin';
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch payouts: ${res.statusText}`);
      }
      
      return res.json();
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  const payouts = response?.data?.payouts || [];
  const pagination = response?.data?.pagination;

  const handleApprove = async (payoutId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/payouts/${payoutId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes })
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Payout approved by maker' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates/payouts'] });
        setActionDialog(null);
        setNotes('');
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to approve payout', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (payoutId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/payouts/${payoutId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ notes })
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Payout verified by checker' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates/payouts'] });
        setActionDialog(null);
        setNotes('');
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to verify payout', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcess = async (payoutId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/payouts/${payoutId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ transactionRef, notes })
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Payout processed successfully' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates/payouts'] });
        setActionDialog(null);
        setTransactionRef('');
        setNotes('');
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to process payout', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (payoutId: string, reason: string) => {
    if (!reason) {
      toast({ title: 'Error', description: 'Please provide a cancellation reason', variant: 'destructive' });
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/affiliates/payouts/${payoutId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason })
      });

      if (res.ok) {
        toast({ title: 'Success', description: 'Payout cancelled successfully' });
        queryClient.invalidateQueries({ queryKey: ['/api/admin/affiliates/payouts'] });
        setActionDialog(null);
        setNotes('');
      } else {
        const error = await res.json();
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to cancel payout', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredPayouts = payouts.filter(payout => {
    const matchesSearch = 
      payout.affiliate.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.affiliate.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      `${payout.affiliate.user.firstName} ${payout.affiliate.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading payouts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Affiliate Payout Management</h1>
          <p className="text-muted-foreground mt-2">Review and process affiliate payouts with maker/checker approval workflow</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by affiliate code, email, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-payouts"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48" data-testid="select-status-filter">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="maker_approved">Maker Approved</SelectItem>
            <SelectItem value="checker_approved">Checker Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Affiliate</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payout.affiliate.code}</p>
                        <p className="text-sm text-muted-foreground">{payout.affiliate.user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">${(payout.amount / 100).toFixed(2)}</TableCell>
                    <TableCell className="capitalize">{payout.method.replace('_', ' ')}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(payout.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(payout.status)}
                          {payout.status.replace('_', ' ')}
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(payout.createdAt), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Dialog open={actionDialog?.payout.id === payout.id} onOpenChange={(open) => !open && setActionDialog(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedPayout(payout)}
                            data-testid={`button-action-${payout.id}`}
                          >
                            Action
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Payout Actions</DialogTitle>
                            <DialogDescription>
                              {payout.affiliate.code} - ${(payout.amount / 100).toFixed(2)}
                            </DialogDescription>
                          </DialogHeader>

                          {payout.status === 'draft' && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Approval Notes (Optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add notes..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  disabled={actionLoading}
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  disabled={actionLoading}
                                  onClick={() => handleCancel(payout.id, 'Rejected by maker')}
                                  data-testid="button-cancel-payout"
                                >
                                  Reject
                                </Button>
                                <Button
                                  disabled={actionLoading}
                                  onClick={() => handleApprove(payout.id)}
                                  data-testid="button-approve-payout"
                                >
                                  Approve (Maker)
                                </Button>
                              </DialogFooter>
                            </div>
                          )}

                          {payout.status === 'maker_approved' && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="notes">Verification Notes (Optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add verification notes..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  disabled={actionLoading}
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  disabled={actionLoading}
                                  onClick={() => handleCancel(payout.id, 'Rejected by checker')}
                                  data-testid="button-reject-verification"
                                >
                                  Reject
                                </Button>
                                <Button
                                  disabled={actionLoading}
                                  onClick={() => handleVerify(payout.id)}
                                  data-testid="button-verify-payout"
                                >
                                  Verify (Checker)
                                </Button>
                              </DialogFooter>
                            </div>
                          )}

                          {payout.status === 'checker_approved' && (
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="transactionRef">Transaction Reference</Label>
                                <Input
                                  id="transactionRef"
                                  placeholder="e.g., TXN-123456789"
                                  value={transactionRef}
                                  onChange={(e) => setTransactionRef(e.target.value)}
                                  disabled={actionLoading}
                                />
                              </div>
                              <div>
                                <Label htmlFor="notes">Processing Notes (Optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Add processing notes..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  disabled={actionLoading}
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  disabled={actionLoading || !transactionRef}
                                  onClick={() => handleProcess(payout.id)}
                                  data-testid="button-process-payout"
                                >
                                  Process Payment
                                </Button>
                              </DialogFooter>
                            </div>
                          )}

                          {(payout.status === 'paid' || payout.status === 'cancelled') && (
                            <div className="space-y-4">
                              <div className="bg-muted p-4 rounded-lg">
                                <p className="text-sm font-medium mb-2">Status: {payout.status.replace('_', ' ')}</p>
                                {payout.transactionRef && (
                                  <p className="text-sm text-muted-foreground">Transaction: {payout.transactionRef}</p>
                                )}
                                {payout.failureReason && (
                                  <p className="text-sm text-red-600">Reason: {payout.failureReason}</p>
                                )}
                                {payout.processedAt && (
                                  <p className="text-sm text-muted-foreground">Processed: {format(new Date(payout.processedAt), 'MMM dd, yyyy HH:mm')}</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No payouts found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            data-testid="button-prev-page"
          >
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm">
            Page {page} of {pagination.pages}
          </span>
          <Button
            variant="outline"
            disabled={page === pagination.pages}
            onClick={() => setPage(page + 1)}
            data-testid="button-next-page"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
