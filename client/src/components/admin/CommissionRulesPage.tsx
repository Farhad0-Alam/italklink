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
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Percent,
  DollarSign,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

interface CommissionRule {
  id: string;
  name: string;
  scope: 'global' | 'plan' | 'tier';
  scopeValue?: string;
  type: 'percentage' | 'flat';
  value: string;
  paymentType: 'onetime' | 'recurring';
  recurringValue?: string;
  recurringDuration?: number;
  priority: number;
  isActive: boolean;
  createdAt: string;
}

interface CommissionRuleFormData {
  name: string;
  scope: 'global' | 'plan' | 'tier';
  scopeValue: string;
  type: 'percentage' | 'flat';
  value: string;
  paymentType: 'onetime' | 'recurring';
  recurringValue: string;
  recurringDuration: number;
  priority: number;
  isActive: boolean;
}

export default function CommissionRulesPage() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [addRuleOpen, setAddRuleOpen] = useState(false);
  const [editRuleOpen, setEditRuleOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<CommissionRule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CommissionRuleFormData>({
    name: '',
    scope: 'global',
    scopeValue: '',
    type: 'percentage',
    value: '0.15',
    paymentType: 'onetime',
    recurringValue: '',
    recurringDuration: 12,
    priority: 0,
    isActive: true,
  });

  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery<CommissionRule[]>({
    queryKey: ['/api/admin/commission-rules', search],
    queryFn: async () => {
      const res = await fetch('/api/admin/commission-rules', {
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin';
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch rules: ${res.statusText}`);
      }

      const result = await res.json();
      return result.data || result;
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(search.toLowerCase()) ||
      rule.scope.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddRule = async () => {
    if (!formData.name || !formData.value) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/commission-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Commission rule created successfully',
        });
        queryClient.invalidateQueries({
          queryKey: ['/api/admin/commission-rules'],
        });
        setAddRuleOpen(false);
        setFormData({
          name: '',
          scope: 'global',
          scopeValue: '',
          type: 'percentage',
          value: '0.15',
          paymentType: 'onetime',
          recurringValue: '',
          recurringDuration: 12,
          priority: 0,
          isActive: true,
        });
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to create rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to create commission rule',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRule = async () => {
    if (!selectedRule) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/admin/commission-rules/${selectedRule.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(formData),
        }
      );

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Commission rule updated successfully',
        });
        queryClient.invalidateQueries({
          queryKey: ['/api/admin/commission-rules'],
        });
        setEditRuleOpen(false);
        setSelectedRule(null);
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to update rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to update commission rule',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      const res = await fetch(`/api/admin/commission-rules/${ruleId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (res.ok) {
        toast({
          title: 'Success',
          description: 'Commission rule deleted successfully',
        });
        queryClient.invalidateQueries({
          queryKey: ['/api/admin/commission-rules'],
        });
      } else {
        const error = await res.json();
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete rule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete commission rule',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (rule: CommissionRule) => {
    setSelectedRule(rule);
    setFormData({
      name: rule.name,
      scope: rule.scope,
      scopeValue: rule.scopeValue || '',
      type: rule.type,
      value: rule.value,
      paymentType: rule.paymentType,
      recurringValue: rule.recurringValue || '',
      recurringDuration: rule.recurringDuration || 12,
      priority: rule.priority,
      isActive: rule.isActive,
    });
    setEditRuleOpen(true);
  };

  const openAddDialog = () => {
    setSelectedRule(null);
    setFormData({
      name: '',
      scope: 'global',
      scopeValue: '',
      type: 'percentage',
      value: '0.15',
      paymentType: 'onetime',
      recurringValue: '',
      recurringDuration: 12,
      priority: 0,
      isActive: true,
    });
    setAddRuleOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading commission rules...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Commission Rules
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage affiliate commission structures with flexible payment models
          </p>
        </div>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Rule
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commission rules..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
            data-testid="input-search-rules"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission Rules ({filteredRules.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Payment Model</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.length > 0 ? (
                filteredRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">{rule.name}</TableCell>
                    <TableCell>{rule.scope}</TableCell>
                    <TableCell>
                      {rule.type === 'percentage' ? (
                        <div className="flex items-center gap-1">
                          <Percent className="h-4 w-4" />
                          <span>{rule.value}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${rule.value}</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          rule.paymentType === 'recurring'
                            ? 'default'
                            : 'secondary'
                        }
                      >
                        {rule.paymentType}
                        {rule.paymentType === 'recurring' &&
                          rule.recurringDuration && (
                            <span className="ml-1">
                              ({rule.recurringDuration}mo)
                            </span>
                          )}
                      </Badge>
                    </TableCell>
                    <TableCell>{rule.priority}</TableCell>
                    <TableCell>
                      {rule.isActive ? (
                        <Badge className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(rule)}
                          data-testid={`edit-rule-${rule.id}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRule(rule.id)}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`delete-rule-${rule.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <p className="text-muted-foreground">No commission rules found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Rule Dialog */}
      <Dialog
        open={addRuleOpen || editRuleOpen}
        onOpenChange={(open) => {
          if (!open) {
            setAddRuleOpen(false);
            setEditRuleOpen(false);
            setSelectedRule(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedRule ? 'Edit Commission Rule' : 'Create Commission Rule'}
            </DialogTitle>
            <DialogDescription>
              {selectedRule
                ? 'Update the commission rule details'
                : 'Add a new commission rule with flexible payment models'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Rule Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Standard Commission"
                className="mt-1"
                data-testid="input-rule-name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scope">Scope</Label>
                <Select
                  value={formData.scope}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, scope: value })
                  }
                >
                  <SelectTrigger id="scope" data-testid="select-scope">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="plan">Plan</SelectItem>
                    <SelectItem value="tier">Tier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.scope !== 'global' && (
                <div>
                  <Label htmlFor="scopeValue">Scope Value</Label>
                  <Input
                    id="scopeValue"
                    value={formData.scopeValue}
                    onChange={(e) =>
                      setFormData({ ...formData, scopeValue: e.target.value })
                    }
                    placeholder="Plan ID or Tier name"
                    className="mt-1"
                    data-testid="input-scope-value"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Commission Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger id="type" data-testid="select-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="flat">Flat Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="value">
                  Commission Value{' '}
                  {formData.type === 'percentage' && '(%)'}
                </Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  value={formData.value}
                  onChange={(e) =>
                    setFormData({ ...formData, value: e.target.value })
                  }
                  placeholder={formData.type === 'percentage' ? '15' : '1500'}
                  className="mt-1"
                  data-testid="input-commission-value"
                />
              </div>
            </div>

            {/* Payment Type Control Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Payment Model</h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="paymentType">Payment Type</Label>
                  <Select
                    value={formData.paymentType}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, paymentType: value })
                    }
                  >
                    <SelectTrigger
                      id="paymentType"
                      data-testid="select-payment-type"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onetime">
                        One-Time (One-time commission on conversion)
                      </SelectItem>
                      <SelectItem value="recurring">
                        Recurring (Commission on recurring revenue)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.paymentType === 'onetime'
                      ? 'Affiliate earns commission only on initial conversion'
                      : 'Affiliate earns commission on recurring revenue for specified duration'}
                  </p>
                </div>

                {formData.paymentType === 'recurring' && (
                  <>
                    <div>
                      <Label htmlFor="recurringValue">
                        Recurring Commission Value (% or $){' '}
                        <span className="text-xs text-muted-foreground">
                          (leave blank to use base value)
                        </span>
                      </Label>
                      <Input
                        id="recurringValue"
                        type="number"
                        step="0.01"
                        value={formData.recurringValue}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            recurringValue: e.target.value,
                          })
                        }
                        placeholder="Optional: different rate for recurring"
                        className="mt-1"
                        data-testid="input-recurring-value"
                      />
                    </div>

                    <div>
                      <Label htmlFor="recurringDuration">
                        Recurring Duration (Months)
                      </Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          id="recurringDuration"
                          type="number"
                          min="1"
                          max="60"
                          value={formData.recurringDuration}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              recurringDuration: parseInt(e.target.value) || 12,
                            })
                          }
                          className="flex-1"
                          data-testid="input-recurring-duration"
                        />
                        <div className="text-sm text-muted-foreground pt-2">
                          months
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Maximum months to track recurring revenue (1-60 months)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      priority: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                  className="mt-1"
                  data-testid="input-priority"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher number = higher priority
                </p>
              </div>

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Label htmlFor="isActive">Active</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isActive: checked })
                      }
                      data-testid="switch-is-active"
                    />
                    <span className="text-sm">
                      {formData.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddRuleOpen(false);
                setEditRuleOpen(false);
                setSelectedRule(null);
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={selectedRule ? handleEditRule : handleAddRule}
              disabled={isSubmitting}
              data-testid="button-save-rule"
            >
              {isSubmitting
                ? 'Saving...'
                : selectedRule
                  ? 'Update Rule'
                  : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
