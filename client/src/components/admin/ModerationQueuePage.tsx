import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  sellerName: string;
  sellerId: string;
  status: 'pending' | 'approved' | 'rejected';
  moderationNotes?: string;
  createdAt: string;
  image?: string;
}

export function ModerationQueuePage() {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { toast } = useToast();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['/api/shop/moderation/all', filter],
    queryFn: async () => {
      const res = await fetch(`/api/shop/moderation/all?status=${filter}`);
      if (!res.ok) return [];
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: stats } = useQuery({
    queryKey: ['/api/shop/moderation/stats'],
    queryFn: async () => {
      const res = await fetch('/api/shop/moderation/stats');
      if (!res.ok) return null;
      const data = await res.json();
      return data.data;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest('POST', `/api/shop/moderation/${productId}/approve`, {});
    },
    onSuccess: () => {
      toast({ title: 'Product approved' });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/moderation/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/moderation/stats'] });
      setSelectedProduct(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (productId: string) => {
      return apiRequest('POST', `/api/shop/moderation/${productId}/reject`, {
        reason: rejectReason,
      });
    },
    onSuccess: () => {
      toast({ title: 'Product rejected' });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/moderation/all'] });
      queryClient.invalidateQueries({ queryKey: ['/api/shop/moderation/stats'] });
      setSelectedProduct(null);
      setRejectReason('');
    },
    onError: (error: any) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="bg-green-600">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Pending Review</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Approved</p>
                <p className="text-2xl font-bold">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Rejected</p>
                <p className="text-2xl font-bold">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
            data-testid={`button-filter-${f}`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            No products to display
          </div>
        ) : (
          products.map((product: Product) => (
            <Card
              key={product.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedProduct(product)}
              data-testid={`card-product-moderation-${product.id}`}
            >
              <div className="flex gap-4 items-start">
                {product.image && (
                  <div className="w-20 h-20 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden">
                    <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-grow">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{product.title}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-2">
                        {product.description}
                      </p>
                      <div className="text-xs text-slate-500 space-y-1">
                        <p>By: {product.sellerName}</p>
                        <p>Price: ${(product.price / 100).toFixed(2)}</p>
                        <p>Submitted: {new Date(product.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {getStatusBadge(product.status)}
                      {product.moderationNotes && (
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 max-w-xs text-left">
                          {product.moderationNotes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Moderation Modal */}
      {selectedProduct && selectedProduct.status === 'pending' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold">Review Product</h2>
            
            <div className="space-y-2 max-h-48 overflow-y-auto">
              <p className="font-semibold">{selectedProduct.title}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{selectedProduct.description}</p>
              <p className="text-sm">By: {selectedProduct.sellerName}</p>
              <p className="text-sm">Price: ${(selectedProduct.price / 100).toFixed(2)}</p>
            </div>

            {selectedProduct.status === 'rejected' && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <p className="text-sm font-medium text-red-900 dark:text-red-100">Rejection reason:</p>
                <p className="text-sm text-red-800 dark:text-red-200">{selectedProduct.moderationNotes}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason (if applicable):</label>
              <Textarea
                placeholder="Explain why this product is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                data-testid="textarea-reject-reason"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => setSelectedProduct(null)}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel-moderation"
              >
                Cancel
              </Button>
              <Button
                onClick={() => rejectMutation.mutate(selectedProduct.id)}
                disabled={rejectMutation.isPending}
                variant="destructive"
                className="flex-1"
                data-testid="button-reject-product"
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button
                onClick={() => approveMutation.mutate(selectedProduct.id)}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-600 hover:bg-green-700"
                data-testid="button-approve-product"
              >
                {approveMutation.isPending ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
