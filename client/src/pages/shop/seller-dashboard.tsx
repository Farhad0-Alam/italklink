import { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Upload, FileText, Image, Archive, Loader2 } from 'lucide-react';
import { useLocation } from 'wouter';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ProductFormData {
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: string;
  discountPrice: string;
  category: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  thumbnailUrl: string;
}

const initialFormData: ProductFormData = {
  title: '',
  slug: '',
  description: '',
  shortDescription: '',
  price: '',
  discountPrice: '',
  category: 'templates',
  filePath: '',
  fileSize: 0,
  fileType: '',
  thumbnailUrl: '',
};

const categories = [
  { value: 'templates', label: 'Templates' },
  { value: 'ebooks', label: 'E-Books' },
  { value: 'graphics', label: 'Graphics & Icons' },
  { value: 'guides', label: 'Guides & Courses' },
  { value: 'tools', label: 'Tools & Utilities' },
  { value: 'other', label: 'Other' },
];

export default function SellerDashboard() {
  const [, setLocation] = useLocation();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: products, isLoading: productsLoading } = useQuery<any[]>({
    queryKey: ['/api/shop/seller/products'],
  });

  const { data: orders } = useQuery<any[]>({
    queryKey: ['/api/shop/seller/orders'],
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/shop/seller/analytics'],
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch('/api/shop/upload', {
        method: 'POST',
        body: formDataUpload,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData(prev => ({
        ...prev,
        filePath: data.filePath,
        fileSize: data.fileSize,
        fileType: data.fileType,
      }));

      toast({
        title: 'File uploaded',
        description: `${file.name} uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const productData = {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description: data.description,
        shortDescription: data.shortDescription,
        price: Math.round(parseFloat(data.price) * 100),
        discountPrice: data.discountPrice ? Math.round(parseFloat(data.discountPrice) * 100) : null,
        category: data.category,
        filePath: data.filePath,
        fileSize: data.fileSize,
        fileType: data.fileType,
        thumbnailUrl: data.thumbnailUrl || null,
      };
      return apiRequest('POST', '/api/shop/products', productData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shop/seller/products'] });
      setShowCreateDialog(false);
      setFormData(initialFormData);
      toast({
        title: 'Product created',
        description: 'Your product is now pending review',
      });
    },
    onError: () => {
      toast({
        title: 'Failed to create product',
        description: 'Please try again',
        variant: 'destructive',
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (productId: string) => apiRequest('DELETE', `/api/shop/seller/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/shop/seller/products'] });
      toast({
        title: 'Product deleted',
        description: 'Your product has been removed',
      });
    },
  });

  const getFileIcon = (fileType: string) => {
    if (fileType?.includes('image')) return <Image className="h-5 w-5" />;
    if (fileType?.includes('zip') || fileType?.includes('archive')) return <Archive className="h-5 w-5" />;
    return <FileText className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isFormValid = formData.title && formData.price && formData.filePath;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-purple-600 bg-clip-text text-transparent" data-testid="text-page-title">
              Seller Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your digital products and sales</p>
          </div>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600" data-testid="button-create-product">
                <Plus className="h-4 w-4 mr-2" />
                Create Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Product</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Product File *</Label>
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      formData.filePath 
                        ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                        : 'border-gray-300 hover:border-orange-500'
                    }`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.zip,.rar,.png,.jpg,.jpeg,.gif,.mp3,.mp4,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                      data-testid="input-file-upload"
                    />
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-2" />
                        <p className="text-sm text-gray-500">Uploading...</p>
                      </div>
                    ) : formData.filePath ? (
                      <div className="flex flex-col items-center">
                        {getFileIcon(formData.fileType)}
                        <p className="text-sm font-medium text-green-600 mt-2">File uploaded</p>
                        <p className="text-xs text-gray-500">{formatFileSize(formData.fileSize)}</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to upload your product file</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, ZIP, images, documents</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Professional Business Card Template"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    data-testid="input-product-title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="professional-business-card (auto-generated if empty)"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    data-testid="input-product-slug"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger data-testid="select-category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    placeholder="Brief description for listings"
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    data-testid="input-short-description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Detailed product description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    data-testid="input-description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USD) *</Label>
                    <Input
                      id="price"
                      placeholder="9.99"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      data-testid="input-price"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountPrice">Sale Price (optional)</Label>
                    <Input
                      id="discountPrice"
                      placeholder="7.99"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.discountPrice}
                      onChange={(e) => setFormData({ ...formData, discountPrice: e.target.value })}
                      data-testid="input-discount-price"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="thumbnailUrl">Thumbnail URL (optional)</Label>
                  <Input
                    id="thumbnailUrl"
                    placeholder="https://example.com/image.jpg"
                    value={formData.thumbnailUrl}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    data-testid="input-thumbnail-url"
                  />
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500 mb-4">
                    Products are subject to review before going live. Commission split: 50% product owner, 30% seller/affiliate, 20% platform.
                  </p>
                  <Button
                    onClick={() => createProductMutation.mutate(formData)}
                    disabled={createProductMutation.isPending || !isFormValid}
                    className="w-full bg-gradient-to-r from-orange-500 to-purple-500 hover:from-orange-600 hover:to-purple-600"
                    data-testid="button-submit-product"
                  >
                    {createProductMutation.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Product'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-total-sales">
                {analytics?.totalPurchases || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-revenue">
                ${((analytics?.totalRevenue || 0) / 100).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-products-count">
                {products?.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-white dark:bg-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="text-total-views">
                {products?.reduce((sum: number, p: any) => sum + (p.views || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Products</CardTitle>
            <CardDescription>Manage and track your digital products</CardDescription>
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            ) : products?.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">You haven't created any products yet</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-gradient-to-r from-orange-500 to-purple-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Product
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Title</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Price</th>
                      <th className="text-left py-3 px-4 font-semibold">Sales</th>
                      <th className="text-left py-3 px-4 font-semibold">Views</th>
                      <th className="text-right py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.map((product: any) => (
                      <tr key={product.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700/50" data-testid={`row-product-${product.id}`}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {getFileIcon(product.fileType)}
                            <span>{product.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            product.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : product.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {product.discountPrice ? (
                            <div>
                              <span className="line-through text-gray-400 mr-2">${(product.price / 100).toFixed(2)}</span>
                              <span className="text-green-600 font-semibold">${(product.discountPrice / 100).toFixed(2)}</span>
                            </div>
                          ) : (
                            <span>${(product.price / 100).toFixed(2)}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">{product.purchases || 0}</td>
                        <td className="py-3 px-4">{product.views || 0}</td>
                        <td className="py-3 px-4 text-right space-x-2">
                          <Button size="sm" variant="outline" data-testid={`button-edit-${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-red-500 hover:text-red-700"
                            onClick={() => deleteProductMutation.mutate(product.id)}
                            data-testid={`button-delete-${product.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest purchases of your products</CardDescription>
          </CardHeader>
          <CardContent>
            {orders?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders yet
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Buyer</th>
                      <th className="text-left py-3 px-4 font-semibold">Product</th>
                      <th className="text-left py-3 px-4 font-semibold">Your Earnings</th>
                      <th className="text-left py-3 px-4 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders?.map((order: any) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50 dark:hover:bg-slate-700/50" data-testid={`row-order-${order.id}`}>
                        <td className="py-3 px-4">{order.buyerEmail || 'Unknown'}</td>
                        <td className="py-3 px-4">{order.productTitle || 'Product'}</td>
                        <td className="py-3 px-4 font-semibold text-green-600">
                          ${((order.sellerAmount || 0) / 100).toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
