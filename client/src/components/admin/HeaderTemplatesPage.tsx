import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { 
  Search, 
  Plus, 
  MoreVertical, 
  Eye, 
  Edit, 
  Copy,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Palette,
  Shapes,
  Layout
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

interface HeaderTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  previewImage?: string;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
  elements: any[];
  globalStyles: any;
  layoutType: string;
  advancedLayout: any;
}

export default function HeaderTemplatesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<HeaderTemplate | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch header templates data
  const { data: templates = [], isLoading, refetch } = useQuery<HeaderTemplate[]>({
    queryKey: ['/api/admin/header-templates', search, categoryFilter, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (categoryFilter !== 'all') params.append('category', categoryFilter);
      if (statusFilter !== 'all') params.append('isActive', statusFilter === 'active' ? 'true' : 'false');
      
      const url = `/api/admin/header-templates${params.toString() ? '?' + params.toString() : ''}`;
      const res = await fetch(url, { credentials: 'include' });
      
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = '/admin';
          throw new Error('Unauthorized');
        }
        throw new Error(`Failed to fetch header templates: ${res.statusText}`);
      }
      
      const result = await res.json();
      return result.data || result;
    },
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true
  });

  // Delete template mutation
  const deleteMutation = useMutation({
    mutationFn: async (templateId: string) => {
      const response = await fetch(`/api/admin/header-templates/${templateId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/header-templates'] });
      toast({ title: 'Template deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete template', variant: 'destructive' });
    }
  });

  // Toggle template status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ templateId, isActive }: { templateId: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/header-templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Failed to update template');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/header-templates'] });
      toast({ title: 'Template status updated' });
    },
    onError: () => {
      toast({ title: 'Failed to update template', variant: 'destructive' });
    }
  });

  const handleCreateTemplate = () => {
    setLocation('/admin/templates/header-builder');
  };

  const handleEditTemplate = (templateId: string) => {
    setLocation(`/admin/templates/header-builder?edit=${templateId}`);
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/header-templates/${templateId}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (!response.ok) throw new Error('Failed to duplicate template');
      refetch();
      toast({ title: 'Template duplicated successfully' });
    } catch (error) {
      toast({ title: 'Failed to duplicate template', variant: 'destructive' });
    }
  };

  const handleToggleStatus = (templateId: string, currentStatus: boolean) => {
    toggleStatusMutation.mutate({ templateId, isActive: !currentStatus });
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this header template?')) {
      deleteMutation.mutate(templateId);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = !search || 
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && template.isActive) ||
      (statusFilter === 'inactive' && !template.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique categories for filter
  const categories = Array.from(new Set(templates.map(t => t.category)));

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading header templates...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Header Templates</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage advanced header designs with SVG shapes and layouts
          </p>
        </div>
        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Header Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="relative group hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Layout className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {template.description || 'No description'}
                    </CardDescription>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEditTemplate(template.id)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleToggleStatus(template.id, template.isActive)}
                    >
                      {template.isActive ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Activate
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 h-32 flex items-center justify-center">
                {template.previewImage ? (
                  <img 
                    src={template.previewImage} 
                    alt={`${template.name} preview`}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-center text-gray-500">
                    <Shapes className="w-8 h-8 mx-auto mb-2" />
                    <span className="text-sm">No Preview</span>
                  </div>
                )}
              </div>

              {/* Stats and Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant={template.isActive ? 'default' : 'secondary'}>
                    {template.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Badge variant="outline">{template.category}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Elements: {template.elements?.length || 0}</span>
                  <span>Layout: {template.layoutType}</span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Used: {template.usageCount || 0} times</span>
                  <span>
                    Updated: {new Date(template.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditTemplate(template.id)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDuplicateTemplate(template.id)}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-8 text-center">
                <Shapes className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No header templates found
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {search || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms.'
                    : 'Get started by creating your first header template.'
                  }
                </p>
                {(!search && categoryFilter === 'all' && statusFilter === 'all') && (
                  <Button onClick={handleCreateTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Header Template
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}