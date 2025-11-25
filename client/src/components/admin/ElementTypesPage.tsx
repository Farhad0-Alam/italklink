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
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Layers
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface PageElementType {
  id: number;
  type: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  isPremium: boolean;
  defaultConfig?: any;
  sort: number;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  type: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  isPremium: boolean;
  defaultConfig?: string;
  sort: number;
  isActive: boolean;
}

export default function ElementTypesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingElement, setEditingElement] = useState<PageElementType | null>(null);
  const [formData, setFormData] = useState<FormData>({
    type: '',
    title: '',
    icon: '',
    color: 'bg-blue-100',
    description: '',
    isPremium: false,
    defaultConfig: '',
    sort: 0,
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: elementTypes = [], isLoading } = useQuery<PageElementType[]>({
    queryKey: ['/api/admin/element-types'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/admin/element-types', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/element-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/element-types'] });
      toast({ title: 'Element type created successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error creating element type', description: error.message, variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest(`/api/admin/element-types/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/element-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/element-types'] });
      toast({ title: 'Element type updated successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error updating element type', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/element-types/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/element-types'] });
      queryClient.invalidateQueries({ queryKey: ['/api/element-types'] });
      toast({ title: 'Element type deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting element type', description: error.message, variant: 'destructive' });
    }
  });

  const handleOpenCreateDialog = () => {
    setEditingElement(null);
    setFormData({
      type: '',
      title: '',
      icon: '',
      color: 'bg-blue-100',
      description: '',
      isPremium: false,
      defaultConfig: '',
      sort: (elementTypes.length + 1) * 10,
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (element: PageElementType) => {
    setEditingElement(element);
    setFormData({
      type: element.type,
      title: element.title,
      icon: element.icon,
      color: element.color,
      description: element.description,
      isPremium: element.isPremium || false,
      defaultConfig: element.defaultConfig ? JSON.stringify(element.defaultConfig, null, 2) : '',
      sort: element.sort || 0,
      isActive: element.isActive
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingElement(null);
    setFormData({
      type: '',
      title: '',
      icon: '',
      color: 'bg-blue-100',
      description: '',
      isPremium: false,
      defaultConfig: '',
      sort: 0,
      isActive: true
    });
  };

  const handleSubmit = () => {
    if (!formData.type || !formData.title) {
      toast({ title: 'Type and title are required', variant: 'destructive' });
      return;
    }

    let defaultConfig = null;
    if (formData.defaultConfig) {
      try {
        defaultConfig = JSON.parse(formData.defaultConfig);
      } catch {
        toast({ title: 'Invalid JSON in default config', variant: 'destructive' });
        return;
      }
    }

    const submitData = {
      ...formData,
      defaultConfig
    };

    if (editingElement) {
      updateMutation.mutate({ id: editingElement.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleDelete = (element: PageElementType) => {
    if (confirm(`Are you sure you want to delete "${element.title}"?`)) {
      deleteMutation.mutate(element.id);
    }
  };

  const filteredElements = elementTypes.filter(el =>
    el.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    el.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    el.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="admin-elements-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Page Element Types</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage element types available in the card builder</p>
        </div>
        <Button onClick={handleOpenCreateDialog} data-testid="btn-add-element">
          <Plus className="w-4 h-4 mr-2" />
          Add Element Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              All Element Types ({elementTypes.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search elements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-elements"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading element types...</div>
          ) : filteredElements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No element types found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Icon</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-20">Sort</TableHead>
                  <TableHead className="w-24">Premium</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredElements.map((element) => (
                  <TableRow key={element.id} data-testid={`row-element-${element.id}`}>
                    <TableCell>
                      <div className={`w-10 h-10 flex items-center justify-center rounded ${element.color}`}>
                        <i className={`${element.icon} text-lg`}></i>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {element.type}
                      </code>
                    </TableCell>
                    <TableCell className="font-medium">{element.title}</TableCell>
                    <TableCell className="max-w-xs truncate text-gray-500">
                      {element.description}
                    </TableCell>
                    <TableCell>{element.sort}</TableCell>
                    <TableCell>
                      {element.isPremium ? (
                        <Badge variant="default" className="bg-amber-500">Premium</Badge>
                      ) : (
                        <Badge variant="secondary">Free</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={element.isActive ? 'default' : 'secondary'}>
                        {element.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(element)}
                          data-testid={`btn-edit-element-${element.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(element)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`btn-delete-element-${element.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingElement ? 'Edit Element Type' : 'Add Element Type'}</DialogTitle>
            <DialogDescription>
              {editingElement ? 'Update element type details' : 'Create a new element type for the card builder'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type (unique identifier)</Label>
                <Input
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., heading"
                  data-testid="input-element-type"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Heading"
                  data-testid="input-element-title"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon Class</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="e.g., fas fa-heading"
                  data-testid="input-element-icon"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Color Class</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  placeholder="e.g., bg-blue-100"
                  data-testid="input-element-color"
                />
              </div>
            </div>

            {(formData.icon || formData.color) && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Preview:</span>
                <div className={`w-10 h-10 flex items-center justify-center rounded ${formData.color}`}>
                  <i className={`${formData.icon} text-lg`}></i>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Short description of this element"
                data-testid="input-element-description"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort Order</Label>
              <Input
                id="sort"
                type="number"
                value={formData.sort}
                onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                data-testid="input-element-sort"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultConfig">Default Config (JSON, optional)</Label>
              <Textarea
                id="defaultConfig"
                value={formData.defaultConfig}
                onChange={(e) => setFormData({ ...formData, defaultConfig: e.target.value })}
                placeholder='{"key": "value"}'
                className="font-mono text-sm"
                rows={4}
                data-testid="input-element-config"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isPremium">Premium Feature</Label>
              <Switch
                id="isPremium"
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
                data-testid="switch-element-premium"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-element-active"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog} data-testid="btn-cancel">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
              data-testid="btn-save-element"
            >
              {editingElement ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
