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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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
  Filter,
  DollarSign,
  Users,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SubscriptionPlan {
  id: number;
  name: string;
  planType: 'free' | 'pro' | 'enterprise';
  price: number;
  currency: string;
  frequency?: 'monthly' | 'yearly' | 'weekly' | 'daily' | 'custom';
  interval: string;
  businessCardsLimit: number;
  features: any; // Can contain both legacy array and new object structure
  stripePriceId?: string;
  isActive: boolean;
  cardLabel?: string;
  trialDays: number;
  customDurationDays?: number;
  createdAt: string;
}

interface Feature {
  id: number;
  key: string;
  label: string;
  description?: string;
  category: string;
}

interface Template {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  previewImage?: string;
}

interface ExtraCardOption {
  cards: number;
  price: number;
  label: string;
}

interface PlanFormData {
  name: string;
  planType: 'free' | 'pro' | 'enterprise';
  price: number;
  currency: string;
  frequency: 'monthly' | 'yearly' | 'weekly' | 'daily' | 'custom';
  discount: number; // Discount percentage for yearly plans
  businessCardsLimit: number;
  cardLabel: string;
  trialDays: number;
  customDurationDays?: number;
  features: number[];
  templates: string[];
  isActive: boolean;
  stripePriceId: string;
  // Extra card pricing
  extraCardOptions: ExtraCardOption[];
  hasUnlimitedOption: boolean;
  unlimitedPrice: number;
  templateLimit: number;
  // Stripe billing fields
  description: string;
  baseUsers: number;
  pricePerUser: number;
  setupFee: number;
  allowUserSelection: boolean;
  minUsers: number;
  maxUsers: number | null;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'BDT'];
const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'daily', label: 'Daily' },
  { value: 'custom', label: 'Custom' }
];

const AVAILABLE_FEATURES = [
  // Page Elements - Basic
  { key: 'heading', label: 'Heading', category: 'Page Elements' },
  { key: 'paragraph', label: 'Paragraph', category: 'Page Elements' },
  { key: 'link', label: 'Link', category: 'Page Elements' },
  { key: 'image', label: 'Image', category: 'Page Elements' },
  { key: 'video', label: 'Video', category: 'Page Elements' },
  { key: 'html', label: 'Custom HTML', category: 'Page Elements' },
  
  // Forms
  { key: 'contactForm', label: 'Contact Form', category: 'Forms' },
  { key: 'subscribeForm', label: 'Subscribe Form', category: 'Forms' },
  
  // Interactive Elements
  { key: 'accordion', label: 'Accordion', category: 'Interactive' },
  { key: 'imageSlider', label: 'Image Slider', category: 'Interactive' },
  { key: 'testimonials', label: 'Testimonials', category: 'Interactive' },
  { key: 'pdfViewer', label: 'PDF Viewer', category: 'Interactive' },
  { key: 'navigationMenu', label: 'Navigation Menu', category: 'Interactive' },
  
  // Advanced Features
  { key: 'googleMaps', label: 'Google Maps', category: 'Advanced' },
  { key: 'digitalWallet', label: 'Digital Wallet (Apple/Google)', category: 'Advanced' },
  { key: 'arPreview', label: 'AR Preview', category: 'Advanced' },
  { key: 'qrcode', label: 'QR Code Generator', category: 'Advanced' },
  
  // AI Features
  { key: 'aiChatbot', label: 'AI Chatbot', category: 'AI Features' },
  { key: 'ragKnowledge', label: 'RAG Knowledge Base', category: 'AI Features' },
  
  // Appointment & Booking
  { key: 'bookAppointment', label: 'Book Appointment', category: 'Appointments' },
  { key: 'scheduleCall', label: 'Schedule Call', category: 'Appointments' },
  { key: 'meetingRequest', label: 'Meeting Request', category: 'Appointments' },
  { key: 'availabilityDisplay', label: 'Availability Display', category: 'Appointments' },
  
  // Tools & Features
  { key: 'crm', label: 'CRM (Customer Management)', category: 'Tools' },
  { key: 'analytics', label: 'Analytics Dashboard', category: 'Tools' },
  { key: 'qrCodes', label: 'QR Codes Management', category: 'Tools' },
  { key: 'emailSignature', label: 'Email Signature Generator', category: 'Tools' },
  { key: 'automation', label: 'Automation & Workflows', category: 'Tools' },
  { key: 'teamFeatures', label: 'Team Collaboration', category: 'Tools' },
  { key: 'affiliateSystem', label: 'Affiliate System', category: 'Tools' },
  { key: 'bulkGeneration', label: 'Bulk Card Generation', category: 'Tools' },
  { key: 'customDomain', label: 'Custom Domain', category: 'Tools' },
  { key: 'apiAccess', label: 'API Access', category: 'Tools' },
];

export default function PlansPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [addPlanOpen, setAddPlanOpen] = useState(false);
  const [editPlanOpen, setEditPlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form state
  const [formData, setFormData] = useState<PlanFormData>({
    name: '',
    planType: 'free',
    price: 0,
    currency: 'USD',
    frequency: 'monthly',
    discount: 0,
    businessCardsLimit: 1,
    cardLabel: '',
    trialDays: 0,
    customDurationDays: undefined,
    features: [],
    templates: [],
    isActive: true,
    stripePriceId: '',
    extraCardOptions: [],
    hasUnlimitedOption: false,
    unlimitedPrice: 0,
    templateLimit: -1,
    description: '',
    baseUsers: 1,
    pricePerUser: 0,
    setupFee: 0,
    allowUserSelection: false,
    minUsers: 1,
    maxUsers: null
  });

  const queryClient = useQueryClient();

  // Fetch plans data
  const { data: plans = [], isLoading: plansLoading } = useQuery<SubscriptionPlan[]>({
    queryKey: ['/api/admin/plans', search, statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      
      const url = `/api/admin/plans${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin';
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch plans: ${res.statusText}`);
      }
      
      return res.json();
    },
    retry: false,
    initialData: []
  });

  // Fetch available features
  const { data: features = [] } = useQuery<Feature[]>({
    queryKey: ['/api/admin/features'],
    queryFn: () => fetch('/api/admin/features', { credentials: 'include' }).then(res => res.json()),
    initialData: []
  });

  // Fetch available templates
  const { data: templates = [], isLoading: templatesLoading, error: templatesError, refetch: refetchTemplates } = useQuery<any[]>({
    queryKey: ['admin-templates'], // Stable query key
    queryFn: async () => {
      try {
        const response = await fetch('/api/admin/templates', { 
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Templates SUCCESS:', data?.length, 'templates loaded');
        
        if (!Array.isArray(data)) {
          console.warn('Templates response is not an array:', data);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error('Templates fetch error:', error);
        throw error;
      }
    },
    staleTime: 30000, // 30 seconds
    retry: 2
  });

  console.log('Templates FINAL state:', { 
    templatesCount: templates?.length, 
    templatesLoading, 
    hasError: !!templatesError,
    firstTemplate: templates?.[0]?.name 
  });

  const resetForm = () => {
    setFormData({
      name: '',
      planType: 'free',
      price: 0,
      currency: 'USD',
      frequency: 'monthly',
      discount: 0,
      businessCardsLimit: 1,
      cardLabel: '',
      trialDays: 0,
      customDurationDays: undefined,
      features: [],
      templates: [],
      isActive: true,
      stripePriceId: '',
      extraCardOptions: [],
      hasUnlimitedOption: false,
      unlimitedPrice: 0,
      templateLimit: -1,
      description: '',
      baseUsers: 1,
      pricePerUser: 0,
      setupFee: 0,
      allowUserSelection: false,
      minUsers: 1,
      maxUsers: null
    });
  };

  // Calculate yearly price with discount
  const calculateDisplayPrice = () => {
    if (formData.frequency === 'yearly') {
      const monthlyPrice = formData.price;
      const yearlyPrice = monthlyPrice * 12 * (1 - formData.discount / 100);
      return Math.round(yearlyPrice);
    }
    return formData.price;
  };

  const handleAddPlan = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a plan name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        resetForm();
        setAddPlanOpen(false);
        queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
        queryClient.invalidateQueries({ queryKey: ['/api/plans'] }); // Also refresh public plans
        console.log('Plan created successfully');
      } else {
        const error = await response.json();
        alert(`Failed to create plan: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      alert('Failed to create plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlan = async () => {
    if (!selectedPlan || !formData.name.trim()) {
      alert('Please enter a plan name');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/plans/${selectedPlan.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        resetForm();
        setEditPlanOpen(false);
        setSelectedPlan(null);
        queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
        queryClient.invalidateQueries({ queryKey: ['/api/plans'] }); // Also refresh public plans
        console.log('Plan updated successfully');
      } else {
        const error = await response.json();
        alert(`Failed to update plan: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Failed to update plan. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlan = async (planId: number) => {
    if (!confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/plans/${planId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/plans'] });
        queryClient.invalidateQueries({ queryKey: ['/api/plans'] }); // Also refresh public plans
        console.log('Plan deleted successfully');
      } else {
        const error = await response.json();
        alert(`Failed to delete plan: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan. Please try again.');
    }
  };

  const handleDuplicatePlan = (plan: SubscriptionPlan) => {
    setFormData({
      name: `${plan.name} (Copy)`,
      planType: plan.planType,
      price: plan.price,
      currency: plan.currency,
      frequency: plan.frequency || 'monthly',
      businessCardsLimit: plan.businessCardsLimit,
      cardLabel: plan.cardLabel || '',
      trialDays: plan.trialDays,
      customDurationDays: plan.customDurationDays,
      features: [], // Will be populated from API
      templates: [], // Will be populated from API
      isActive: true,
      stripePriceId: '',
      extraCardOptions: plan.features?.extraCardOptions || [],
      hasUnlimitedOption: plan.features?.hasUnlimitedOption || false,
      unlimitedPrice: plan.features?.unlimitedPrice || 0,
      templateLimit: plan.features?.templateLimit || -1
    });
    setAddPlanOpen(true);
  };

  const openEditModal = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      planType: plan.planType,
      price: plan.price,
      currency: plan.currency,
      frequency: plan.frequency || 'monthly',
      discount: (plan as any).discount || 0,
      businessCardsLimit: plan.businessCardsLimit,
      cardLabel: plan.cardLabel || '',
      trialDays: plan.trialDays,
      customDurationDays: plan.customDurationDays,
      features: [], // Will be populated from API
      templates: [], // Will be populated from API
      isActive: plan.isActive,
      stripePriceId: plan.stripePriceId || '',
      extraCardOptions: plan.features?.extraCardOptions || [],
      hasUnlimitedOption: plan.features?.hasUnlimitedOption || false,
      unlimitedPrice: plan.features?.unlimitedPrice || 0,
      templateLimit: plan.features?.templateLimit || -1,
      description: (plan as any).description || '',
      baseUsers: (plan as any).baseUsers || 1,
      pricePerUser: (plan as any).pricePerUser || 0,
      setupFee: (plan as any).setupFee || 0,
      allowUserSelection: (plan as any).allowUserSelection || false,
      minUsers: (plan as any).minUsers || 1,
      maxUsers: (plan as any).maxUsers || null
    });
    setEditPlanOpen(true);
  };

  const toggleFeature = (featureId: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(id => id !== featureId)
        : [...prev.features, featureId]
    }));
  };

  const toggleAllFeatures = () => {
    const allFeatureIds = AVAILABLE_FEATURES.map((_, index) => index + 1);
    setFormData(prev => ({
      ...prev,
      features: prev.features.length === allFeatureIds.length ? [] : allFeatureIds
    }));
  };

  const renderPlanCard = (plan: SubscriptionPlan) => (
    <Card key={plan.id} className="relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{plan.name}</CardTitle>
          <Badge variant={plan.isActive ? 'default' : 'secondary'}>
            {plan.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          <DollarSign className="h-4 w-4 text-gray-500" />
          <span className="text-2xl font-bold">
            ${(plan.price / 100).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/{plan.frequency}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {plan.businessCardsLimit === -1 ? 'Unlimited' : plan.businessCardsLimit} cards
          </span>
        </div>
        
        {plan.features?.extraCardOptions && plan.features.extraCardOptions.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500">Extra Options:</div>
            {plan.features.extraCardOptions.map((option: any, index: number) => (
              <div key={index} className="text-xs text-gray-600">
                {option.label}
              </div>
            ))}
          </div>
        )}
        
        {plan.features?.hasUnlimitedOption && (
          <div className="text-xs text-gray-600">
            Unlimited: ${(plan.features.unlimitedPrice / 100).toFixed(2)}
          </div>
        )}
        
        {plan.trialDays > 0 && (
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{plan.trialDays} day trial</span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {plan.planType.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {plan.features.length} features
          </Badge>
        </div>

        <div className="flex justify-end space-x-1 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => openEditModal(plan)}
            className="p-2"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDuplicatePlan(plan)}
            className="p-2"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeletePlan(plan.id)}
            className="p-2 text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPlanFormFields = () => (
    <div className="grid gap-4 py-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name*</Label>
          <Input
            id="name"
            placeholder="Pro Plan"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="planType">Plan Type*</Label>
          <Select value={formData.planType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, planType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency*</Label>
          <Select value={formData.frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {FREQUENCIES.map(freq => (
                <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency*</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(curr => (
                <SelectItem key={curr} value={curr}>{curr}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Price*</Label>
          <Input
            id="price"
            type="number"
            placeholder="12"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-500">Monthly price or auto-calculated annual price (based on discount %).</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discount">Discount (%)</Label>
          <Input
            id="discount"
            type="number"
            placeholder="20"
            value={formData.discount}
            onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-500">Optional — used for yearly plans to calculate discounted annual pricing.</p>
        </div>
      </div>

      {/* Display Calculated Price */}
      {formData.frequency === 'yearly' && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-900 dark:text-blue-100">
            <strong>Calculated Yearly Price:</strong> ${(calculateDisplayPrice() / 100).toFixed(2)} 
            <span className="text-xs ml-2">
              (Monthly: ${(formData.price / 100).toFixed(2)} × 12 months × {100 - formData.discount}% = ${(formData.price * 12 * (1 - formData.discount / 100) / 100).toFixed(2)})
            </span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="cardNumber">Card Limit*</Label>
          <Input
            id="cardNumber"
            type="number"
            placeholder="3"
            value={formData.businessCardsLimit}
            onChange={(e) => setFormData(prev => ({ ...prev, businessCardsLimit: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-500">Number of digital cards included in this plan.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="trialDays">Trial Days*</Label>
          <Input
            id="trialDays"
            type="number"
            placeholder="7"
            value={formData.trialDays}
            onChange={(e) => setFormData(prev => ({ ...prev, trialDays: Number(e.target.value) }))}
          />
          <p className="text-xs text-gray-500">Number of free trial days before billing starts.</p>
        </div>
      </div>

      {/* Plan Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Description*</Label>
        <Textarea
          id="description"
          placeholder="For creators and solopreneurs looking to grow and monetize"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
        <p className="text-xs text-gray-500">Short description of plan benefits.</p>
      </div>

      {/* Per-User Pricing Section */}
      <div className="space-y-3 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <h3 className="font-semibold text-sm">Per-User/Per-Card Pricing</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="baseUsers">Base Users Included</Label>
            <Input
              id="baseUsers"
              type="number"
              placeholder="1"
              value={formData.baseUsers}
              onChange={(e) => setFormData(prev => ({ ...prev, baseUsers: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-500">Number of users/cards included in base price.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pricePerUser">Price Per Additional User</Label>
            <Input
              id="pricePerUser"
              type="number"
              placeholder="0"
              value={formData.pricePerUser}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerUser: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-500">Extra charge (USD) per additional user/card.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="setupFee">Setup Fee</Label>
            <Input
              id="setupFee"
              type="number"
              placeholder="0"
              value={formData.setupFee}
              onChange={(e) => setFormData(prev => ({ ...prev, setupFee: Number(e.target.value) }))}
            />
            <p className="text-xs text-gray-500">One-time setup cost (optional).</p>
          </div>
        </div>
      </div>

      {/* User Selection Controls */}
      <div className="space-y-3 border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center space-x-2">
          <Switch
            id="allowUserSelection"
            checked={formData.allowUserSelection}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowUserSelection: checked }))}
          />
          <Label htmlFor="allowUserSelection" className="font-semibold text-sm">
            Allow User Count Selection on Pricing Page
          </Label>
        </div>
        
        {formData.allowUserSelection && (
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="minUsers">Minimum Users</Label>
              <Input
                id="minUsers"
                type="number"
                placeholder="1"
                value={formData.minUsers}
                onChange={(e) => setFormData(prev => ({ ...prev, minUsers: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Maximum Users</Label>
              <Input
                id="maxUsers"
                type="number"
                placeholder="Unlimited"
                value={formData.maxUsers || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maxUsers: e.target.value ? Number(e.target.value) : null }))}
              />
              <p className="text-xs text-gray-500">Maximum number of users or cards allowed (leave empty for unlimited).</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Duration for Custom Frequency */}
      {formData.frequency === 'custom' && (
        <div className="space-y-2">
          <Label htmlFor="customDuration">Custom Duration (days)</Label>
          <Input
            id="customDuration"
            type="number"
            placeholder="Enter custom duration in days"
            value={formData.customDurationDays || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, customDurationDays: Number(e.target.value) || undefined }))}
          />
        </div>
      )}



      {/* Features Selection with Accordion */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Features & Elements*</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={toggleAllFeatures}
          >
            {formData.features.length === AVAILABLE_FEATURES.length ? 'Deselect All' : 'Select All'} ({formData.features.length})
          </Button>
        </div>
        
        <Accordion type="multiple" className="border rounded-lg">
          {Object.entries(
            AVAILABLE_FEATURES.reduce((acc, feature) => {
              if (!acc[feature.category]) acc[feature.category] = [];
              acc[feature.category].push(feature);
              return acc;
            }, {} as Record<string, typeof AVAILABLE_FEATURES>)
          ).map(([category, categoryFeatures]) => (
            <AccordionItem key={category} value={category}>
              <AccordionTrigger className="px-4">
                <div className="flex items-center justify-between w-full pr-4">
                  <span className="font-medium">{category}</span>
                  <span className="text-sm text-gray-500">
                    {categoryFeatures.filter(f => {
                      const idx = AVAILABLE_FEATURES.findIndex(feat => feat.key === f.key);
                      return formData.features.includes(idx + 1);
                    }).length} / {categoryFeatures.length}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-2 gap-3">
                  {categoryFeatures.map((feature) => {
                    const featureIndex = AVAILABLE_FEATURES.findIndex(f => f.key === feature.key);
                    return (
                      <div key={feature.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${category}-${feature.key}`}
                          checked={formData.features.includes(featureIndex + 1)}
                          onCheckedChange={() => toggleFeature(featureIndex + 1)}
                        />
                        <Label htmlFor={`${category}-${feature.key}`} className="text-sm cursor-pointer">
                          {feature.label}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Extra Card Pricing Options */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Extra Card Pricing Options</Label>
        
        <div className="space-y-2">
          {formData.extraCardOptions.map((option, index) => (
            <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
              <Input
                type="number"
                placeholder="Cards"
                value={option.cards}
                onChange={(e) => {
                  const newOptions = [...formData.extraCardOptions];
                  newOptions[index] = { ...option, cards: Number(e.target.value) };
                  setFormData(prev => ({ ...prev, extraCardOptions: newOptions }));
                }}
                className="w-20"
              />
              <span className="text-sm">cards for</span>
              <Input
                type="number"
                placeholder="Price in cents"
                value={option.price}
                onChange={(e) => {
                  const newOptions = [...formData.extraCardOptions];
                  newOptions[index] = { ...option, price: Number(e.target.value) };
                  setFormData(prev => ({ ...prev, extraCardOptions: newOptions }));
                }}
                className="w-32"
              />
              <Input
                placeholder="Display label"
                value={option.label}
                onChange={(e) => {
                  const newOptions = [...formData.extraCardOptions];
                  newOptions[index] = { ...option, label: e.target.value };
                  setFormData(prev => ({ ...prev, extraCardOptions: newOptions }));
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newOptions = formData.extraCardOptions.filter((_, i) => i !== index);
                  setFormData(prev => ({ ...prev, extraCardOptions: newOptions }));
                }}
              >
                Remove
              </Button>
            </div>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                extraCardOptions: [...prev.extraCardOptions, { cards: 5, price: 4500, label: '5 cards for $45' }]
              }));
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Extra Card Option
          </Button>
        </div>
      </div>


      {/* Templates Selection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium">Available Templates</Label>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Select templates available to this plan:</span>
          <Button
            type="button"
            variant="outline" 
            size="sm"
            onClick={() => {
              const allTemplateIds = templates.map(t => t.id);
              setFormData(prev => ({
                ...prev,
                templates: prev.templates.length === allTemplateIds.length ? [] : allTemplateIds
              }));
            }}
          >
            {formData.templates.length === templates.length ? 'Deselect All' : 'Select All'} ({formData.templates.length})
          </Button>
        </div>
        
        {templatesLoading ? (
          <div className="border rounded-lg p-6 text-center text-gray-500">
            <p>Loading templates...</p>
          </div>
        ) : templatesError ? (
          <div className="border rounded-lg p-6 text-center text-red-500">
            <p>Error loading templates: {templatesError.message}</p>
          </div>
        ) : templates.length > 0 ? (
          <div className="max-h-80 overflow-y-auto border rounded-lg p-3">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="flex items-center space-x-2 mb-2">
                    <Checkbox
                      id={`template-${template.id}`}
                      checked={formData.templates.includes(template.id)}
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          templates: prev.templates.includes(template.id)
                            ? prev.templates.filter(id => id !== template.id)
                            : [...prev.templates, template.id]
                        }));
                      }}
                    />
                    <Label htmlFor={`template-${template.id}`} className="text-sm font-medium">
                      {template.name}
                    </Label>
                  </div>
                  {template.previewImage && (
                    <img 
                      src={template.previewImage} 
                      alt={template.name}
                      className="w-full h-20 object-cover rounded border"
                    />
                  )}
                  {template.description && (
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="border rounded-lg p-6 text-center text-gray-500">
            <p>No templates available. Create templates first to assign them to plans.</p>
            <p className="text-xs mt-2">Debug: {JSON.stringify({ templatesLoading, templatesError: templatesError?.message, templatesCount: templates.length })}</p>
            <Button 
              onClick={() => refetchTemplates()} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Retry Loading Templates
            </Button>
          </div>
        )}
      </div>

      {/* Active Status */}
      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Plans ({plans.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage subscription plans and pricing
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'table' : 'grid')}
          >
            {viewMode === 'grid' ? 'Table View' : 'Grid View'}
          </Button>
          
          <Dialog open={addPlanOpen} onOpenChange={setAddPlanOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add New Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Plan</DialogTitle>
                <DialogDescription>
                  Create a new subscription plan with features and pricing.
                </DialogDescription>
              </DialogHeader>
              {renderPlanFormFields()}
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddPlanOpen(false)}>
                  Discard
                </Button>
                <Button onClick={handleAddPlan} disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Submit'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plansLoading ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : plans.length === 0 ? (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500">No plans found</p>
            </div>
          ) : (
            plans.map(renderPlanCard)
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Cards</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plansLoading ? (
                  [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-8 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <p className="text-gray-500">No plans found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="font-medium">{plan.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{plan.planType.toUpperCase()}</Badge>
                      </TableCell>
                      <TableCell>${(plan.price / 100).toFixed(2)}</TableCell>
                      <TableCell>{plan.frequency}</TableCell>
                      <TableCell>
                        {plan.businessCardsLimit === -1 ? 'Unlimited' : plan.businessCardsLimit}
                      </TableCell>
                      <TableCell>{plan.features.length}</TableCell>
                      <TableCell>
                        <Badge variant={plan.isActive ? 'default' : 'secondary'}>
                          {plan.isActive ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Active</>
                          ) : (
                            <><XCircle className="h-3 w-3 mr-1" />Inactive</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditModal(plan)}
                            className="p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicatePlan(plan)}
                            className="p-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                            className="p-2 text-red-600 hover:text-red-700"
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
      )}

      {/* Edit Plan Dialog */}
      <Dialog open={editPlanOpen} onOpenChange={setEditPlanOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>
              Update the subscription plan details and features.
            </DialogDescription>
          </DialogHeader>
          {renderPlanFormFields()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditPlanOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPlan} disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}