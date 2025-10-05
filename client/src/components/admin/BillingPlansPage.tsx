import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  Users,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface BillingPlan {
  id: number;
  name: string;
  type: string;
  price: number;
  baseUsers: number;
  pricePerUser: number;
  setupFee: number;
  features: Record<string, any>;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface PlanFormData {
  name: string;
  type: string;
  price: number;
  baseUsers: number;
  pricePerUser: number;
  setupFee: number;
  description: string;
  isActive: boolean;
  analytics: boolean;
  crm: boolean;
  appointments: boolean;
  emailSignature: boolean;
  bulkGeneration: boolean;
  customDomain: boolean;
}

export default function BillingPlansPage() {
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BillingPlan | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    type: 'monthly',
    price: 0,
    baseUsers: 1,
    pricePerUser: 0,
    setupFee: 0,
    description: '',
    isActive: true,
    analytics: false,
    crm: false,
    appointments: false,
    emailSignature: false,
    bulkGeneration: false,
    customDomain: false,
  });

  const { data: plans = [], isLoading } = useQuery<BillingPlan[]>({
    queryKey: ['/api/billing/admin/plans'],
    queryFn: async () => {
      const res = await fetch('/api/billing/admin/plans', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch plans');
      const response = await res.json();
      return response.data || [];
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'monthly',
      price: 0,
      baseUsers: 1,
      pricePerUser: 0,
      setupFee: 0,
      description: '',
      isActive: true,
      analytics: false,
      crm: false,
      appointments: false,
      emailSignature: false,
      bulkGeneration: false,
      customDomain: false,
    });
  };

  const handleAddPlan = async () => {
    if (!formData.name.trim()) {
      toast({ title: 'Error', description: 'Plan name is required', variant: 'destructive' });
      return;
    }

    try {
      const features = {
        analytics: formData.analytics,
        crm: formData.crm,
        appointments: formData.appointments,
        emailSignature: formData.emailSignature,
        bulkGeneration: formData.bulkGeneration,
        customDomain: formData.customDomain,
      };

      await apiRequest('POST', '/api/billing/admin/plans', {
        ...formData,
        features,
      });

      toast({ title: 'Success', description: 'Plan created successfully' });
      resetForm();
      setAddPlanOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/plans'] });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to create plan', 
        variant: 'destructive' 
      });
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan || !formData.name.trim()) {
      toast({ title: 'Error', description: 'Plan name is required', variant: 'destructive' });
      return;
    }

    try {
      const features = {
        analytics: formData.analytics,
        crm: formData.crm,
        appointments: formData.appointments,
        emailSignature: formData.emailSignature,
        bulkGeneration: formData.bulkGeneration,
        customDomain: formData.customDomain,
      };

      await apiRequest('PUT', `/api/billing/admin/plans/${selectedPlan.id}`, {
        ...formData,
        features,
      });

      toast({ title: 'Success', description: 'Plan updated successfully' });
      resetForm();
      setEditPlanOpen(false);
      setSelectedPlan(null);
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/plans'] });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to update plan', 
        variant: 'destructive' 
      });
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }

    try {
      await apiRequest('DELETE', `/api/billing/admin/plans/${planId}`);
      toast({ title: 'Success', description: 'Plan deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/admin/plans'] });
      queryClient.invalidateQueries({ queryKey: ['/api/billing/plans'] });
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to delete plan', 
        variant: 'destructive' 
      });
    }
  };

  const openEditDialog = (plan: BillingPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      price: plan.price,
      baseUsers: plan.baseUsers || 1,
      pricePerUser: plan.pricePerUser || 0,
      setupFee: plan.setupFee || 0,
      description: plan.description || '',
      isActive: plan.isActive,
      analytics: plan.features?.analytics || false,
      crm: plan.features?.crm || false,
      appointments: plan.features?.appointments || false,
      emailSignature: plan.features?.emailSignature || false,
      bulkGeneration: plan.features?.bulkGeneration || false,
      customDomain: plan.features?.customDomain || false,
    });
    setEditPlanOpen(true);
  };

  const formatPrice = (cents: number) => {
    return `$${(cents / 100).toFixed(2)}`;
  };

  const PlanFormDialog = ({ open, onOpenChange, onSubmit, title }: any) => (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-plan-form">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Configure the plan pricing and features
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name*</Label>
              <Input
                id="name"
                data-testid="input-plan-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Professional"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input
                id="type"
                data-testid="input-plan-type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., monthly, yearly"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              data-testid="input-plan-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this plan"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Base Price (cents)*</Label>
              <Input
                id="price"
                type="number"
                data-testid="input-plan-price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
                placeholder="2999"
              />
              <p className="text-xs text-gray-500">
                {formatPrice(formData.price)}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="baseUsers">Base Users*</Label>
              <Input
                id="baseUsers"
                type="number"
                data-testid="input-plan-base-users"
                min="1"
                value={formData.baseUsers}
                onChange={(e) => setFormData({ ...formData, baseUsers: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
              <p className="text-xs text-gray-500">
                Included users
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pricePerUser">Price Per User (cents)</Label>
              <Input
                id="pricePerUser"
                type="number"
                data-testid="input-plan-price-per-user"
                value={formData.pricePerUser}
                onChange={(e) => setFormData({ ...formData, pricePerUser: parseInt(e.target.value) || 0 })}
                placeholder="999"
              />
              <p className="text-xs text-gray-500">
                {formatPrice(formData.pricePerUser)}/user
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="setupFee">Setup Fee (cents)</Label>
            <Input
              id="setupFee"
              type="number"
              data-testid="input-plan-setup-fee"
              value={formData.setupFee}
              onChange={(e) => setFormData({ ...formData, setupFee: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
            <p className="text-xs text-gray-500">
              One-time: {formatPrice(formData.setupFee)}
            </p>
          </div>

          <div className="space-y-3">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'analytics', label: 'Analytics Dashboard' },
                { key: 'crm', label: 'CRM' },
                { key: 'appointments', label: 'Appointment Booking' },
                { key: 'emailSignature', label: 'Email Signature Generator' },
                { key: 'bulkGeneration', label: 'Bulk Card Generation' },
                { key: 'customDomain', label: 'Custom Domain' },
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    id={key}
                    data-testid={`switch-feature-${key}`}
                    checked={formData[key as keyof typeof formData] as boolean}
                    onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })}
                  />
                  <Label htmlFor={key} className="cursor-pointer">{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              data-testid="switch-plan-active"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive" className="cursor-pointer">Active</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} data-testid="button-cancel">
            Cancel
          </Button>
          <Button onClick={onSubmit} data-testid="button-submit">
            {title.includes('Add') ? 'Create Plan' : 'Update Plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return <div className="p-6">Loading plans...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing Plans</h1>
          <p className="text-gray-500 mt-1">Manage subscription plans with per-user pricing</p>
        </div>
        <Button onClick={() => { resetForm(); setAddPlanOpen(true); }} data-testid="button-add-plan">
          <Plus className="mr-2 h-4 w-4" />
          Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Card key={plan.id} className="relative" data-testid={`card-plan-${plan.id}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {plan.isActive ? (
                      <Badge variant="default" className="bg-green-500" data-testid={`badge-status-${plan.id}`}>
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" data-testid={`badge-status-${plan.id}`}>
                        <XCircle className="mr-1 h-3 w-3" />
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-1">{plan.type}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Base Price:</span>
                  <span className="font-semibold text-lg" data-testid={`text-price-${plan.id}`}>
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Base Users:</span>
                  <span className="font-medium" data-testid={`text-base-users-${plan.id}`}>
                    {plan.baseUsers || 1}
                  </span>
                </div>
                {plan.pricePerUser > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Per User:</span>
                    <span className="font-medium" data-testid={`text-per-user-${plan.id}`}>
                      {formatPrice(plan.pricePerUser)}
                    </span>
                  </div>
                )}
                {plan.setupFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Setup Fee:</span>
                    <span className="font-medium" data-testid={`text-setup-fee-${plan.id}`}>
                      {formatPrice(plan.setupFee)}
                    </span>
                  </div>
                )}
              </div>

              {plan.description && (
                <p className="text-sm text-gray-600">{plan.description}</p>
              )}

              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase">Features:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(plan.features || {}).map(([key, value]) => 
                    value ? (
                      <Badge key={key} variant="outline" className="text-xs" data-testid={`badge-feature-${key}-${plan.id}`}>
                        {key}
                      </Badge>
                    ) : null
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openEditDialog(plan)}
                  data-testid={`button-edit-${plan.id}`}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeletePlan(plan.id)}
                  data-testid={`button-delete-${plan.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {plans.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No plans yet</h3>
            <p className="text-gray-500 mb-4">Create your first subscription plan to get started.</p>
            <Button onClick={() => { resetForm(); setAddPlanOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </CardContent>
        </Card>
      )}

      <PlanFormDialog
        open={addPlanOpen}
        onOpenChange={setAddPlanOpen}
        onSubmit={handleAddPlan}
        title="Add New Plan"
      />

      <PlanFormDialog
        open={editPlanOpen}
        onOpenChange={setEditPlanOpen}
        onSubmit={handleEditPlan}
        title="Edit Plan"
      />
    </div>
  );
}
