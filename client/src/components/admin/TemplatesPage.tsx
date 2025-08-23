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
  Upload,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Palette
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Template {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  previewImage?: string;
  createdAt: string;
  updatedAt: string;
  usageCount?: number;
}

export default function TemplatesPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  // Fetch templates data
  const { data: templates = [], isLoading, refetch } = useQuery<Template[]>({
    queryKey: ['/api/admin/templates', { search, category: categoryFilter, published: statusFilter }],
    initialData: []
  });

  const handleCreateTemplate = () => {
    // Navigate to template builder
    window.location.href = '/admin/templates/builder';
  };

  const handleEditTemplate = (templateId: string) => {
    // Navigate to template editor
    window.location.href = `/admin/templates/builder?edit=${templateId}`;
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}/duplicate`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const handleTogglePublish = async (template: Template) => {
    try {
      const response = await fetch(`/api/admin/templates/${template.id}/publish`, {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        refetch();
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/admin/templates/${templateId}`, {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) {
          refetch();
        }
      } catch (error) {
        console.error('Failed to delete template:', error);
      }
    }
  };

  const templateCategories = [
    'business', 'creative', 'minimal', 'corporate', 'modern', 
    'elegant', 'professional', 'classic', 'tech', 'healthcare',
    'education', 'retail', 'finance', 'real-estate', 'consulting'
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(search.toLowerCase()) ||
                         template.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'published' && template.isActive) ||
                         (statusFilter === 'draft' && !template.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Templates ({filteredTemplates.length})
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Create and manage business card templates for your users
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.href = '/admin/templates/import'}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button onClick={handleCreateTemplate} className="bg-green-600 hover:bg-green-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {templateCategories.map(category => (
                    <SelectItem key={category} value={category} className="capitalize">
                      {category.replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          // Loading skeleton
          [...Array(8)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-[3/4] bg-gray-200 animate-pulse"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredTemplates.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Palette className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No templates found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {search || categoryFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first template'
              }
            </p>
            {!search && categoryFilter === 'all' && statusFilter === 'all' && (
              <Button onClick={handleCreateTemplate}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Template
              </Button>
            )}
          </div>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="group overflow-hidden hover:shadow-lg transition-all duration-200">
              {/* Template Preview */}
              <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 relative overflow-hidden">
                {template.previewImage ? (
                  <img 
                    src={template.previewImage} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl text-gray-400">
                      <Palette />
                    </div>
                  </div>
                )}
                
                {/* Status indicator */}
                <div className="absolute top-2 left-2">
                  {template.isActive ? (
                    <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-400 rounded-full border-2 border-white shadow"></div>
                  )}
                </div>

                {/* Actions overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => handleEditTemplate(template.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => setSelectedTemplate(template)}
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleDuplicateTemplate(template.id)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTogglePublish(template)}>
                          {template.isActive ? (
                            <>
                              <XCircle className="mr-2 h-4 w-4" />
                              Unpublish
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              {/* Template Info */}
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {template.category?.replace('-', ' ')}
                    </p>
                    {template.usageCount !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        Used {template.usageCount} times
                      </p>
                    )}
                  </div>
                  <Badge variant={template.isActive ? "default" : "secondary"} className="ml-2">
                    {template.isActive ? "Published" : "Draft"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Template Preview Dialog */}
      {selectedTemplate && (
        <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedTemplate.name}</DialogTitle>
              <DialogDescription className="capitalize">
                {selectedTemplate.category?.replace('-', ' ')} template
                {selectedTemplate.description && ` • ${selectedTemplate.description}`}
              </DialogDescription>
            </DialogHeader>
            <div className="aspect-[3/4] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center">
              {selectedTemplate.previewImage ? (
                <img 
                  src={selectedTemplate.previewImage} 
                  alt={selectedTemplate.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-6xl text-gray-400">
                  <Palette />
                </div>
              )}
            </div>
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">
                Created: {new Date(selectedTemplate.createdAt).toLocaleDateString()}
              </div>
              <div className="space-x-2">
                <Button variant="outline" onClick={() => handleEditTemplate(selectedTemplate.id)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button onClick={() => handleTogglePublish(selectedTemplate)}>
                  {selectedTemplate.isActive ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}