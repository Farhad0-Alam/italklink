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
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2,
  Palette
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Icon {
  id: number;
  name: string;
  fontAwesomeIcon: string;
  category: string;
  svg?: string;
  sort: number;
  isActive: boolean;
  createdAt: string;
}

interface IconFormData {
  name: string;
  fontAwesomeIcon: string;
  category: string;
  svg?: string;
  sort: number;
  isActive: boolean;
}

const CATEGORIES = ['contact', 'social', 'business', 'media', 'other'];

export default function IconsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIcon, setEditingIcon] = useState<Icon | null>(null);
  const [formData, setFormData] = useState<IconFormData>({
    name: '',
    fontAwesomeIcon: '',
    category: 'contact',
    svg: '',
    sort: 0,
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: icons = [], isLoading } = useQuery<Icon[]>({
    queryKey: ['/api/admin/icons'],
  });

  const createMutation = useMutation({
    mutationFn: async (data: IconFormData) => {
      return await apiRequest('/api/admin/icons', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/icons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/icons'] });
      toast({ title: 'Icon created successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error creating icon', description: error.message, variant: 'destructive' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: IconFormData }) => {
      return await apiRequest(`/api/admin/icons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/icons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/icons'] });
      toast({ title: 'Icon updated successfully' });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast({ title: 'Error updating icon', description: error.message, variant: 'destructive' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/icons/${id}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/icons'] });
      queryClient.invalidateQueries({ queryKey: ['/api/icons'] });
      toast({ title: 'Icon deleted successfully' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting icon', description: error.message, variant: 'destructive' });
    }
  });

  const handleOpenCreateDialog = () => {
    setEditingIcon(null);
    setFormData({
      name: '',
      fontAwesomeIcon: '',
      category: 'contact',
      svg: '',
      sort: (icons.length + 1) * 10,
      isActive: true
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (icon: Icon) => {
    setEditingIcon(icon);
    setFormData({
      name: icon.name,
      fontAwesomeIcon: icon.fontAwesomeIcon || '',
      category: icon.category || 'contact',
      svg: icon.svg || '',
      sort: icon.sort || 0,
      isActive: icon.isActive
    });
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingIcon(null);
    setFormData({
      name: '',
      fontAwesomeIcon: '',
      category: 'contact',
      svg: '',
      sort: 0,
      isActive: true
    });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.fontAwesomeIcon) {
      toast({ title: 'Name and Font Awesome icon are required', variant: 'destructive' });
      return;
    }

    if (editingIcon) {
      updateMutation.mutate({ id: editingIcon.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (icon: Icon) => {
    if (confirm(`Are you sure you want to delete "${icon.name}"?`)) {
      deleteMutation.mutate(icon.id);
    }
  };

  const filteredIcons = icons.filter(icon =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.fontAwesomeIcon?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedByCategory = filteredIcons.reduce((acc, icon) => {
    const cat = icon.category || 'other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(icon);
    return acc;
  }, {} as Record<string, Icon[]>);

  return (
    <div className="space-y-6" data-testid="admin-icons-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Icons</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage icons for business card elements</p>
        </div>
        <Button onClick={handleOpenCreateDialog} data-testid="btn-add-icon">
          <Plus className="w-4 h-4 mr-2" />
          Add Icon
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              All Icons ({icons.length})
            </CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search icons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search-icons"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading icons...</div>
          ) : filteredIcons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No icons found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Preview</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Icon Class</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-20">Sort</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIcons.map((icon) => (
                  <TableRow key={icon.id} data-testid={`row-icon-${icon.id}`}>
                    <TableCell>
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                        <i className={`${icon.fontAwesomeIcon} text-xl text-gray-700 dark:text-gray-300`}></i>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{icon.name}</TableCell>
                    <TableCell>
                      <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                        {icon.fontAwesomeIcon}
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">{icon.category}</Badge>
                    </TableCell>
                    <TableCell>{icon.sort}</TableCell>
                    <TableCell>
                      <Badge variant={icon.isActive ? 'default' : 'secondary'}>
                        {icon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEditDialog(icon)}
                          data-testid={`btn-edit-icon-${icon.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(icon)}
                          className="text-red-500 hover:text-red-700"
                          data-testid={`btn-delete-icon-${icon.id}`}
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingIcon ? 'Edit Icon' : 'Add Icon'}</DialogTitle>
            <DialogDescription>
              {editingIcon ? 'Update icon details' : 'Create a new icon for business cards'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Phone"
                data-testid="input-icon-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fontAwesomeIcon">Font Awesome Class</Label>
              <Input
                id="fontAwesomeIcon"
                value={formData.fontAwesomeIcon}
                onChange={(e) => setFormData({ ...formData, fontAwesomeIcon: e.target.value })}
                placeholder="e.g., fas fa-phone"
                data-testid="input-icon-class"
              />
              {formData.fontAwesomeIcon && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Preview:</span>
                  <i className={`${formData.fontAwesomeIcon} text-xl`}></i>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger data-testid="select-icon-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort">Sort Order</Label>
              <Input
                id="sort"
                type="number"
                value={formData.sort}
                onChange={(e) => setFormData({ ...formData, sort: parseInt(e.target.value) || 0 })}
                data-testid="input-icon-sort"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                data-testid="switch-icon-active"
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
              data-testid="btn-save-icon"
            >
              {editingIcon ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
