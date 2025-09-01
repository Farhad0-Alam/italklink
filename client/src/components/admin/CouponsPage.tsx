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
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Percent,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit: number;
  startsAt: string;
  expiresAt?: string;
  applicablePlans?: number[];
  minimumOrderAmount?: number;
  status: 'active' | 'inactive' | 'expired';
  isActive: boolean;
  createdAt: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  planType: string;
  price: number;
  interval: string;
}

interface CouponFormData {
  code: string;
  name: string;
  description: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  maxDiscountAmount: number;
  usageLimit: number;
  userUsageLimit: number;
  startsAt: string;
  expiresAt: string;
  applicablePlans: number[];
  minimumOrderAmount: number;
  status: 'active' | 'inactive' | 'expired';
  isActive: boolean;
}

export default function CouponsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [addCouponOpen, setAddCouponOpen] = useState(false);
  const [editCouponOpen, setEditCouponOpen] = useState(false);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: 0,
    maxDiscountAmount: 0,
    usageLimit: 0,
    userUsageLimit: 1,
    startsAt: new Date().toISOString().split('T')[0],
    expiresAt: '',
    applicablePlans: [],
    minimumOrderAmount: 0,
    status: 'active',
    isActive: true
  });

  const queryClient = useQueryClient();

  // Fetch coupons data
  const { data: coupons = [], isLoading: couponsLoading } = useQuery<Coupon[]>({
    queryKey: ['/api/admin/coupons', search, statusFilter, typeFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const url = `/api/admin/coupons${params.toString() ? '?' + params.toString() : ''}`;
      return fetch(url, { credentials: 'include' }).then(res => res.json());
    },
    initialData: []
  });

  // Fetch available plans for restrictions
  const { data: availablePlans = [] } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/admin/plans'],
    queryFn: () => fetch('/api/admin/plans', { credentials: 'include' }).then(res => res.json()),
    initialData: []
  });

  // Fetch usage statistics for selected coupon
  const { data: usageData } = useQuery({
    queryKey: [`/api/admin/coupons/${selectedCoupon?.id}/usage`],
    queryFn: () => fetch(`/api/admin/coupons/${selectedCoupon!.id}/usage`, { credentials: 'include' }).then(res => res.json()),
    enabled: !!selectedCoupon && usageModalOpen
  });

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: 0,
      maxDiscountAmount: 0,
      usageLimit: 0,
      userUsageLimit: 1,
      startsAt: new Date().toISOString().split('T')[0],
      expiresAt: '',
      applicablePlans: [],
      minimumOrderAmount: 0,
      status: 'active',
      isActive: true
    });
  };

  const handleAddCoupon = async () => {
    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Please enter coupon code and name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          usageLimit: formData.usageLimit || null,
          expiresAt: formData.expiresAt || null,
          maxDiscountAmount: formData.maxDiscountAmount || null,
          minimumOrderAmount: formData.minimumOrderAmount || null,
          applicablePlans: formData.applicablePlans.length > 0 ? formData.applicablePlans : null
        })
      });

      if (response.ok) {
        resetForm();
        setAddCouponOpen(false);
        queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
        console.log('Coupon created successfully');
      } else {
        const error = await response.json();
        alert(`Failed to create coupon: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert('Failed to create coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCoupon = async () => {
    if (!selectedCoupon || !formData.code.trim() || !formData.name.trim()) {
      alert('Please enter coupon code and name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/coupons/${selectedCoupon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          code: formData.code.toUpperCase(),
          usageLimit: formData.usageLimit || null,
          expiresAt: formData.expiresAt || null,
          maxDiscountAmount: formData.maxDiscountAmount || null,
          minimumOrderAmount: formData.minimumOrderAmount || null,
          applicablePlans: formData.applicablePlans.length > 0 ? formData.applicablePlans : null
        })
      });

      if (response.ok) {
        resetForm();
        setEditCouponOpen(false);
        setSelectedCoupon(null);
        queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
        console.log('Coupon updated successfully');
      } else {
        const error = await response.json();
        alert(`Failed to update coupon: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating coupon:', error);
      alert('Failed to update coupon. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Are you sure you want to delete this coupon? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/coupons'] });
        console.log('Coupon deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete coupon: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Failed to delete coupon. Please try again.');
    }
  };

  const handleDuplicateCoupon = (coupon: Coupon) => {
    setFormData({
      code: `${coupon.code}_COPY`,
      name: `${coupon.name} (Copy)`,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      userUsageLimit: coupon.userUsageLimit,
      startsAt: new Date().toISOString().split('T')[0],
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      applicablePlans: coupon.applicablePlans || [],
      minimumOrderAmount: coupon.minimumOrderAmount || 0,
      status: 'active',
      isActive: true
    });
    setAddCouponOpen(true);
  };

  const openEditModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxDiscountAmount: coupon.maxDiscountAmount || 0,
      usageLimit: coupon.usageLimit || 0,
      userUsageLimit: coupon.userUsageLimit,
      startsAt: new Date(coupon.startsAt).toISOString().split('T')[0],
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      applicablePlans: coupon.applicablePlans || [],
      minimumOrderAmount: coupon.minimumOrderAmount || 0,
      status: coupon.status,
      isActive: coupon.isActive
    });
    setEditCouponOpen(true);
  };

  const openUsageModal = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setUsageModalOpen(true);
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else {
      return `$${(coupon.discountValue / 100).toFixed(2)}`;
    }
  };

  const getStatusIcon = (coupon: Coupon) => {
    if (!coupon.isActive || coupon.status === 'inactive') {
      return <XCircle className="h-4 w-4 text-gray-500" />;
    }
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (coupon: Coupon) => {
    if (!coupon.isActive || coupon.status === 'inactive') return 'Inactive';
    if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) return 'Expired';
    return 'Active';
  };

  const togglePlanRestriction = (planId: number) => {
    setFormData(prev => ({
      ...prev,
      applicablePlans: prev.applicablePlans.includes(planId)
        ? prev.applicablePlans.filter(id => id !== planId)
        : [...prev.applicablePlans, planId]
    }));
  };

  const renderCouponFormFields = () => (
    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Coupon Code*</Label>
          <Input
            id="code"
            placeholder="SAVE20"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Display Name*</Label>
          <Input
            id="name"
            placeholder="20% Off Sale"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Special discount for new customers"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      {/* Discount Configuration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount Type*</Label>
          <Select value={formData.discountType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, discountType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage</SelectItem>
              <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountValue">
            {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}*
          </Label>
          <Input
            id="discountValue"
            type="number"
            placeholder={formData.discountType === 'percentage' ? '20' : '10.00'}
            value={formData.discountValue}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              discountValue: formData.discountType === 'percentage' 
                ? Number(e.target.value) 
                : Number(e.target.value) * 100 
            }))}
          />
        </div>
      </div>

      {formData.discountType === 'percentage' && (
        <div className="space-y-2">
          <Label htmlFor="maxDiscount">Maximum Discount Amount ($)</Label>
          <Input
            id="maxDiscount"
            type="number"
            placeholder="50.00"
            value={formData.maxDiscountAmount / 100}
            onChange={(e) => setFormData(prev => ({ ...prev, maxDiscountAmount: Number(e.target.value) * 100 }))}
          />
          <p className="text-xs text-gray-500">Leave empty for no limit</p>
        </div>
      )}

      {/* Validity Period */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Start Date*</Label>
          <Input
            id="startsAt"
            type="date"
            value={formData.startsAt}
            onChange={(e) => setFormData(prev => ({ ...prev, startsAt: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expiry Date</Label>
          <Input
            id="expiresAt"
            type="date"
            value={formData.expiresAt}
            onChange={(e) => setFormData(prev => ({ ...prev, expiresAt: e.target.value }))}
          />
          <p className="text-xs text-gray-500">Leave empty for no expiry</p>
        </div>
      </div>

      {/* Usage Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Total Usage Limit</Label>
          <Input
            id="usageLimit"
            type="number"
            placeholder="100"
            value={formData.usageLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, usageLimit: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-500">Leave empty for unlimited</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="userUsageLimit">Uses Per User*</Label>
          <Input
            id="userUsageLimit"
            type="number"
            placeholder="1"
            value={formData.userUsageLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, userUsageLimit: Number(e.target.value) }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="minimumOrder">Minimum Order Amount ($)</Label>
        <Input
          id="minimumOrder"
          type="number"
          placeholder="25.00"
          value={formData.minimumOrderAmount / 100}
          onChange={(e) => setFormData(prev => ({ ...prev, minimumOrderAmount: Number(e.target.value) * 100 }))}
        />
        <p className="text-xs text-gray-500">Leave empty for no minimum</p>
      </div>

      {/* Plan Restrictions */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Applicable Plans</Label>
        <p className="text-sm text-gray-500">Leave none selected to apply to all plans</p>
        
        <div className="max-h-40 overflow-y-auto border rounded-lg p-3">
          <div className="space-y-2">
            {availablePlans.map((plan) => (
              <div key={plan.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`plan-${plan.id}`}
                  checked={formData.applicablePlans.includes(plan.id)}
                  onCheckedChange={() => togglePlanRestriction(plan.id)}
                />
                <Label htmlFor={`plan-${plan.id}`} className="text-sm">
                  {plan.name} - {plan.planType.charAt(0).toUpperCase() + plan.planType.slice(1)}
                  {plan.price > 0 && ` ($${(plan.price / 100).toFixed(2)}/${plan.interval})`}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status*</Label>
          <Select value={formData.status} onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2 pt-6">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coupons</h1>
          <p className="text-gray-600 mt-1">Manage discount coupons and promotional codes</p>
        </div>
        <Button onClick={() => setAddCouponOpen(true)} data-testid="button-add-coupon">
          <Plus className="h-4 w-4 mr-2" />
          Add Coupon
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search coupons..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-coupons"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percentage">Percentage</SelectItem>
                <SelectItem value="fixed_amount">Fixed Amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons ({coupons.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {couponsLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading coupons...
                  </TableCell>
                </TableRow>
              ) : coupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No coupons found
                  </TableCell>
                </TableRow>
              ) : (
                coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="font-mono font-bold text-blue-600">
                        {coupon.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{coupon.name}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500 mt-1">
                          {coupon.description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {coupon.discountType === 'percentage' ? (
                          <Percent className="h-4 w-4 text-green-600" />
                        ) : (
                          <DollarSign className="h-4 w-4 text-green-600" />
                        )}
                        <span className="font-medium">{formatDiscount(coupon)}</span>
                      </div>
                      {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                        <div className="text-xs text-gray-500">
                          Max: ${(coupon.maxDiscountAmount / 100).toFixed(2)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {coupon.userUsageLimit} per user
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(coupon.startsAt).toLocaleDateString()}
                        {coupon.expiresAt && (
                          <>
                            <br />
                            <span className="text-gray-500">
                              to {new Date(coupon.expiresAt).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(coupon)}
                        <span className="text-sm">{getStatusText(coupon)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openUsageModal(coupon)}
                          className="p-2"
                          title="View Usage"
                          data-testid={`button-view-usage-${coupon.code}`}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditModal(coupon)}
                          className="p-2"
                          title="Edit Coupon"
                          data-testid={`button-edit-coupon-${coupon.code}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicateCoupon(coupon)}
                          className="p-2"
                          title="Duplicate Coupon"
                          data-testid={`button-duplicate-coupon-${coupon.code}`}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="p-2 text-red-600 hover:text-red-700"
                          title="Delete Coupon"
                          data-testid={`button-delete-coupon-${coupon.code}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Coupon Dialog */}
      <Dialog open={addCouponOpen} onOpenChange={setAddCouponOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Coupon</DialogTitle>
            <DialogDescription>
              Create a new discount coupon for your plans.
            </DialogDescription>
          </DialogHeader>
          {renderCouponFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCouponOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCoupon}
              disabled={isSubmitting}
              data-testid="button-save-coupon"
            >
              {isSubmitting ? 'Creating...' : 'Create Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Coupon Dialog */}
      <Dialog open={editCouponOpen} onOpenChange={setEditCouponOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Coupon</DialogTitle>
            <DialogDescription>
              Update coupon details for {selectedCoupon?.code}.
            </DialogDescription>
          </DialogHeader>
          {renderCouponFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCouponOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleEditCoupon}
              disabled={isSubmitting}
              data-testid="button-update-coupon"
            >
              {isSubmitting ? 'Updating...' : 'Update Coupon'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Usage Statistics Dialog */}
      <Dialog open={usageModalOpen} onOpenChange={setUsageModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Coupon Usage Statistics</DialogTitle>
            <DialogDescription>
              Usage details for coupon {selectedCoupon?.code}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Statistics Overview */}
            {usageData && (
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{usageData.stats.totalUsages}</div>
                        <div className="text-sm text-gray-500">Total Uses</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          ${(usageData.stats.totalDiscount / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Total Discount</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">
                          ${(usageData.stats.totalRevenue / 100).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">Revenue</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Usage Table */}
            {usageData?.recentUsages && (
              <div>
                <h3 className="text-lg font-medium mb-3">Recent Usage</h3>
                <div className="max-h-60 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Original</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Final</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usageData.recentUsages.map((usage: any) => (
                        <TableRow key={usage.id}>
                          <TableCell>
                            <div className="text-sm">
                              {usage.userName || 'Unknown User'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {usage.userEmail}
                            </div>
                          </TableCell>
                          <TableCell>${(usage.originalAmount / 100).toFixed(2)}</TableCell>
                          <TableCell className="text-green-600">
                            -${(usage.discountAmount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell className="font-medium">
                            ${(usage.finalAmount / 100).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {new Date(usage.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUsageModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}