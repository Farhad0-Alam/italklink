import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye,
  Settings,
  Palette,
  Code,
  Upload,
  Save,
  X
} from 'lucide-react';

interface IconPack {
  id: string;
  name: string;
  description?: string;
  category: string;
  isActive: boolean;
  isPremium: boolean;
  iconCount: number;
  createdAt: string;
  updatedAt: string;
}

interface IconType {
  id: string;
  packId: string;
  name: string;
  slug: string;
  type: 'url' | 'email' | 'phone' | 'text';
  category: 'social' | 'contact' | 'business';
  svgCode: string;
  defaultColor?: string;
  isActive: boolean;
  sortOrder: number;
}

export default function IconPacksPage() {
  const [iconPacks, setIconPacks] = useState<IconPack[]>([]);
  const [iconTypes, setIconTypes] = useState<IconType[]>([]);
  const [selectedPack, setSelectedPack] = useState<IconPack | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('packs');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [showPackModal, setShowPackModal] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [editingPack, setEditingPack] = useState<IconPack | null>(null);
  const [editingIcon, setEditingIcon] = useState<IconType | null>(null);

  // Form states
  const [packForm, setPackForm] = useState({
    name: '',
    description: '',
    category: 'social',
    isActive: true,
    isPremium: false
  });

  const [iconForm, setIconForm] = useState({
    name: '',
    slug: '',
    type: 'url' as const,
    category: 'social' as const,
    svgCode: '',
    defaultColor: '#000000',
    isActive: true,
    sortOrder: 0
  });

  // Load icon packs
  const loadIconPacks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/icon-packs');
      if (response.ok) {
        const data = await response.json();
        setIconPacks(data);
      }
    } catch (error) {
      console.error('Failed to load icon packs:', error);
    }
    setIsLoading(false);
  };

  // Load icon types for a specific pack
  const loadIconTypes = async (packId: string) => {
    try {
      const response = await fetch(`/api/admin/icon-packs/${packId}/icons`);
      if (response.ok) {
        const data = await response.json();
        setIconTypes(data);
      }
    } catch (error) {
      console.error('Failed to load icon types:', error);
    }
  };

  useEffect(() => {
    loadIconPacks();
  }, []);

  // Handle pack operations
  const handleCreatePack = async () => {
    try {
      const response = await fetch('/api/admin/icon-packs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packForm)
      });
      
      if (response.ok) {
        await loadIconPacks();
        setShowPackModal(false);
        resetPackForm();
      }
    } catch (error) {
      console.error('Failed to create pack:', error);
    }
  };

  const handleUpdatePack = async () => {
    if (!editingPack) return;
    
    try {
      const response = await fetch(`/api/admin/icon-packs/${editingPack.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packForm)
      });
      
      if (response.ok) {
        await loadIconPacks();
        setShowPackModal(false);
        setEditingPack(null);
        resetPackForm();
      }
    } catch (error) {
      console.error('Failed to update pack:', error);
    }
  };

  const handleDeletePack = async (packId: string) => {
    if (!confirm('Are you sure you want to delete this icon pack?')) return;
    
    try {
      const response = await fetch(`/api/admin/icon-packs/${packId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await loadIconPacks();
      }
    } catch (error) {
      console.error('Failed to delete pack:', error);
    }
  };

  // Handle icon operations
  const handleCreateIcon = async () => {
    if (!selectedPack) return;
    
    try {
      const response = await fetch(`/api/admin/icon-packs/${selectedPack.id}/icons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...iconForm,
          packId: selectedPack.id
        })
      });
      
      if (response.ok) {
        await loadIconTypes(selectedPack.id);
        await loadIconPacks(); // Refresh pack counts
        setShowIconModal(false);
        resetIconForm();
      }
    } catch (error) {
      console.error('Failed to create icon:', error);
    }
  };

  const handleUpdateIcon = async () => {
    if (!editingIcon) return;
    
    try {
      const response = await fetch(`/api/admin/icon-types/${editingIcon.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(iconForm)
      });
      
      if (response.ok) {
        if (selectedPack) {
          await loadIconTypes(selectedPack.id);
        }
        setShowIconModal(false);
        setEditingIcon(null);
        resetIconForm();
      }
    } catch (error) {
      console.error('Failed to update icon:', error);
    }
  };

  const handleDeleteIcon = async (iconId: string) => {
    if (!confirm('Are you sure you want to delete this icon?')) return;
    
    try {
      const response = await fetch(`/api/admin/icon-types/${iconId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        if (selectedPack) {
          await loadIconTypes(selectedPack.id);
          await loadIconPacks(); // Refresh pack counts
        }
      }
    } catch (error) {
      console.error('Failed to delete icon:', error);
    }
  };

  // Form helpers
  const resetPackForm = () => {
    setPackForm({
      name: '',
      description: '',
      category: 'social',
      isActive: true,
      isPremium: false
    });
  };

  const resetIconForm = () => {
    setIconForm({
      name: '',
      slug: '',
      type: 'url',
      category: 'social',
      svgCode: '',
      defaultColor: '#000000',
      isActive: true,
      sortOrder: 0
    });
  };

  const openEditPackModal = (pack: IconPack) => {
    setEditingPack(pack);
    setPackForm({
      name: pack.name,
      description: pack.description || '',
      category: pack.category,
      isActive: pack.isActive,
      isPremium: pack.isPremium
    });
    setShowPackModal(true);
  };

  const openEditIconModal = (icon: IconType) => {
    setEditingIcon(icon);
    setIconForm({
      name: icon.name,
      slug: icon.slug,
      type: icon.type,
      category: icon.category,
      svgCode: icon.svgCode,
      defaultColor: icon.defaultColor || '#000000',
      isActive: icon.isActive,
      sortOrder: icon.sortOrder
    });
    setShowIconModal(true);
  };

  // Auto-generate slug from name
  const updateSlug = (name: string) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    setIconForm(prev => ({ ...prev, slug }));
  };

  // Filter icon packs based on search
  const filteredPacks = iconPacks.filter(pack =>
    pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter icon types based on search
  const filteredIcons = iconTypes.filter(icon =>
    icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    icon.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Icon Packs</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage custom SVG icon collections for business card templates
          </p>
        </div>
        <Button 
          onClick={() => {
            resetPackForm();
            setEditingPack(null);
            setShowPackModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New Pack
        </Button>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search icon packs or icons..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="packs">Icon Packs ({iconPacks.length})</TabsTrigger>
          <TabsTrigger value="icons">
            Icon Types ({selectedPack ? iconTypes.length : 'Select Pack'})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packs" className="space-y-4">
          {/* Icon Packs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredPacks.map((pack) => (
              <Card 
                key={pack.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPack?.id === pack.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedPack(pack);
                  loadIconTypes(pack.id);
                  setActiveTab('icons');
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={pack.isActive}
                        onClick={(e) => e.stopPropagation()}
                        size="sm"
                      />
                      {pack.isPremium && (
                        <Badge variant="secondary" className="text-xs">Premium</Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditPackModal(pack);
                        }}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePack(pack.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-2">
                    <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="font-semibold">{pack.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {pack.description || 'No description'}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <Badge variant="outline">{pack.category}</Badge>
                      <span>{pack.iconCount} icons</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="icons" className="space-y-4">
          {selectedPack ? (
            <>
              {/* Selected Pack Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="w-5 h-5" />
                        {selectedPack.name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {selectedPack.description}
                      </p>
                    </div>
                    <Button 
                      onClick={() => {
                        resetIconForm();
                        setEditingIcon(null);
                        setShowIconModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Icon
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              {/* Icons Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Icons ({iconTypes.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Icon</th>
                          <th className="text-left p-2">Name</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Category</th>
                          <th className="text-left p-2">Status</th>
                          <th className="text-left p-2">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredIcons.map((icon, index) => (
                          <tr key={icon.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2 text-sm text-gray-500">#{index + 1}</td>
                            <td className="p-2">
                              <div 
                                className="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded"
                                dangerouslySetInnerHTML={{ __html: icon.svgCode }}
                              />
                            </td>
                            <td className="p-2 font-medium">{icon.name}</td>
                            <td className="p-2">
                              <Badge variant="outline">{icon.type}</Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">{icon.category}</Badge>
                            </td>
                            <td className="p-2">
                              <Switch checked={icon.isActive} size="sm" />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditIconModal(icon)}
                                >
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteIcon(icon.id)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Icon Pack</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Choose an icon pack from the Packs tab to view and manage its icons
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Pack Modal */}
      <Dialog open={showPackModal} onOpenChange={setShowPackModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPack ? 'Edit Icon Pack' : 'Create New Icon Pack'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="pack-name">Pack Name</Label>
              <Input
                id="pack-name"
                value={packForm.name}
                onChange={(e) => setPackForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Social Media Icons"
              />
            </div>
            
            <div>
              <Label htmlFor="pack-description">Description</Label>
              <Textarea
                id="pack-description"
                value={packForm.description}
                onChange={(e) => setPackForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="pack-category">Category</Label>
              <Select
                value={packForm.category}
                onValueChange={(value) => setPackForm(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger id="pack-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social Media</SelectItem>
                  <SelectItem value="contact">Contact</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pack-active">Active</Label>
              <Switch
                id="pack-active"
                checked={packForm.isActive}
                onCheckedChange={(checked) => setPackForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="pack-premium">Premium Pack</Label>
              <Switch
                id="pack-premium"
                checked={packForm.isPremium}
                onCheckedChange={(checked) => setPackForm(prev => ({ ...prev, isPremium: checked }))}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowPackModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={editingPack ? handleUpdatePack : handleCreatePack}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingPack ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Icon Modal */}
      <Dialog open={showIconModal} onOpenChange={setShowIconModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingIcon ? 'Edit Icon' : 'Add New Icon'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon-name">Icon Name</Label>
                <Input
                  id="icon-name"
                  value={iconForm.name}
                  onChange={(e) => {
                    setIconForm(prev => ({ ...prev, name: e.target.value }));
                    updateSlug(e.target.value);
                  }}
                  placeholder="e.g., Facebook"
                />
              </div>
              
              <div>
                <Label htmlFor="icon-slug">Slug</Label>
                <Input
                  id="icon-slug"
                  value={iconForm.slug}
                  onChange={(e) => setIconForm(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="facebook"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon-type">Type</Label>
                <Select
                  value={iconForm.type}
                  onValueChange={(value: any) => setIconForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="icon-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">URL</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="icon-category">Category</Label>
                <Select
                  value={iconForm.category}
                  onValueChange={(value: any) => setIconForm(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="icon-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="contact">Contact</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="icon-svg">SVG Code</Label>
              <Textarea
                id="icon-svg"
                value={iconForm.svgCode}
                onChange={(e) => setIconForm(prev => ({ ...prev, svgCode: e.target.value }))}
                placeholder="Paste your SVG code here..."
                rows={6}
                className="font-mono text-sm"
              />
            </div>

            {iconForm.svgCode && (
              <div>
                <Label>Preview</Label>
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div 
                    className="w-12 h-12 mx-auto"
                    dangerouslySetInnerHTML={{ __html: iconForm.svgCode }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon-color">Default Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={iconForm.defaultColor}
                    onChange={(e) => setIconForm(prev => ({ ...prev, defaultColor: e.target.value }))}
                    className="w-12 h-9 p-1"
                  />
                  <Input
                    value={iconForm.defaultColor}
                    onChange={(e) => setIconForm(prev => ({ ...prev, defaultColor: e.target.value }))}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="icon-order">Sort Order</Label>
                <Input
                  id="icon-order"
                  type="number"
                  value={iconForm.sortOrder}
                  onChange={(e) => setIconForm(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="icon-active">Active</Label>
              <Switch
                id="icon-active"
                checked={iconForm.isActive}
                onCheckedChange={(checked) => setIconForm(prev => ({ ...prev, isActive: checked }))}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowIconModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={editingIcon ? handleUpdateIcon : handleCreateIcon}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingIcon ? 'Update' : 'Add'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}