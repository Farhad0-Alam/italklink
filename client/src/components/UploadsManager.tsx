import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Upload, 
  FileText, 
  Image, 
  FileImage, 
  File, 
  Trash2, 
  Edit, 
  ExternalLink, 
  Copy, 
  Eye,
  Plus,
  Download,
  RefreshCw
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

interface PublicUpload {
  id: string;
  slug: string;
  originalFileName: string;
  title?: string;
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export function UploadsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for upload dialog
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState<PublicUpload | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    slug: "",
    title: "",
    isPublic: true,
  });

  // Fetch uploads
  const { data: uploadsResponse, isLoading, refetch } = useQuery({
    queryKey: ['/api/uploads'],
    retry: false,
  });

  // Extract uploads array from API response
  const uploads: PublicUpload[] = uploadsResponse?.data || [];

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: { file: File; slug: string; title: string; isPublic: boolean }) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('slug', data.slug);
      formData.append('title', data.title);
      formData.append('isPublic', String(data.isPublic));

      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
      setShowUploadDialog(false);
      setUploadFile(null);
      setUploadData({ slug: "", title: "", isPublic: true });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file.",
        variant: "destructive",
      });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; slug: string; title: string; isPublic: boolean }) =>
      apiRequest('PATCH', `/api/uploads/${data.id}`, {
        slug: data.slug,
        title: data.title,
        isPublic: data.isPublic,
      }),
    onSuccess: () => {
      toast({
        title: "Upload updated",
        description: "Upload details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
      setShowEditDialog(false);
      setSelectedUpload(null);
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message || "Failed to update upload.",
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/uploads/${id}`),
    onSuccess: () => {
      toast({
        title: "Upload deleted",
        description: "Upload has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete failed",
        description: error.message || "Failed to delete upload.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadFile(file);
      // Auto-generate slug from filename
      const slug = file.name
        .toLowerCase()
        .replace(/\.[^/.]+$/, "") // Remove extension
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setUploadData(prev => ({ 
        ...prev, 
        slug, 
        title: file.name 
      }));
    }
  };

  const handleUpload = () => {
    if (!uploadFile || !uploadData.slug) {
      toast({
        title: "Missing information",
        description: "Please select a file and provide a URL slug.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({
      file: uploadFile,
      slug: uploadData.slug,
      title: uploadData.title || uploadFile.name,
      isPublic: uploadData.isPublic,
    });
  };

  const handleEdit = (upload: PublicUpload) => {
    setSelectedUpload(upload);
    setUploadData({
      slug: upload.slug,
      title: upload.title || upload.originalFileName,
      isPublic: upload.isPublic,
    });
    setShowEditDialog(true);
  };

  const handleUpdate = () => {
    if (!selectedUpload || !uploadData.slug) return;

    updateMutation.mutate({
      id: selectedUpload.id,
      slug: uploadData.slug,
      title: uploadData.title,
      isPublic: uploadData.isPublic,
    });
  };

  const handleCopyUrl = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "File URL has been copied to clipboard.",
    });
  };

  const handleOpenFile = (slug: string) => {
    window.open(`/${slug}`, '_blank');
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <Image className="h-4 w-4" />;
    if (mimeType === 'application/pdf') return <FileText className="h-4 w-4" />;
    if (mimeType === 'text/html') return <FileImage className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const acceptedFileTypes = '.html,.pdf,.jpg,.jpeg,.png,.gif,.webp,.avif,.doc,.docx';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">File Uploads</h2>
          <p className="text-muted-foreground">
            Upload and manage your files with custom URLs
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => refetch()}
            disabled={isLoading}
            data-testid="button-refresh"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button data-testid="button-upload">
                <Plus className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Upload File</DialogTitle>
                <DialogDescription>
                  Upload a file and set a custom URL for easy sharing.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="file-upload">File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    accept={acceptedFileTypes}
                    onChange={handleFileSelect}
                    data-testid="input-file"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Supported: HTML, PDF, Images, Documents
                  </p>
                </div>
                
                {uploadFile && (
                  <>
                    <div>
                      <Label htmlFor="slug">Custom URL</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">
                          {window.location.origin}/
                        </span>
                        <Input
                          id="slug"
                          value={uploadData.slug}
                          onChange={(e) => {
                            const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                            setUploadData(prev => ({ ...prev, slug: value }));
                          }}
                          placeholder="my-file"
                          data-testid="input-slug"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="title">Title (optional)</Label>
                      <Input
                        id="title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="File title"
                        data-testid="input-title"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="public"
                        checked={uploadData.isPublic}
                        onCheckedChange={(checked) => setUploadData(prev => ({ ...prev, isPublic: checked }))}
                        data-testid="switch-public"
                      />
                      <Label htmlFor="public">Make public</Label>
                    </div>
                  </>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={handleUpload}
                  disabled={!uploadFile || !uploadData.slug || uploadMutation.isPending}
                  data-testid="button-confirm-upload"
                >
                  {uploadMutation.isPending ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Upload Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-total-uploads">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Uploads</p>
                <p className="text-2xl font-bold">{uploads.length}</p>
              </div>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-total-views">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">
                  {uploads.reduce((sum, upload) => sum + upload.viewCount, 0)}
                </p>
              </div>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card data-testid="card-public-files">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Public Files</p>
                <p className="text-2xl font-bold">
                  {uploads.filter(upload => upload.isPublic).length}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Uploads List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
          <CardDescription>
            Manage your uploaded files and their public URLs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading uploads...
            </div>
          ) : uploads.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No uploads yet</h3>
              <p className="text-muted-foreground mb-4">
                Upload your first file to get started
              </p>
              <Button onClick={() => setShowUploadDialog(true)} data-testid="button-upload-first">
                <Plus className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {uploads.map((upload) => (
                <div
                  key={upload.id}
                  className="p-4 border rounded-lg hover:bg-muted/50"
                  data-testid={`upload-item-${upload.id}`}
                >
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={upload.isPublic ? "default" : "secondary"}>
                      {upload.isPublic ? "Public" : "Private"}
                    </Badge>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleOpenFile(upload.slug)}
                        data-testid={`button-open-${upload.id}`}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Open File
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleCopyUrl(upload.slug)}
                        data-testid={`button-copy-url-${upload.id}`}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy URL
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(upload)}
                        data-testid={`button-edit-${upload.id}`}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => deleteMutation.mutate(upload.id)}
                        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        data-testid={`button-delete-${upload.id}`}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {/* File Info */}
                  <div className="flex items-center space-x-3">
                    {getFileIcon(upload.mimeType)}
                    <div>
                      <p className="font-medium" data-testid={`text-title-${upload.id}`}>
                        {upload.title || upload.originalFileName}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <span>/{upload.slug}</span>
                        <span>•</span>
                        <span>{formatFileSize(upload.fileSize)}</span>
                        <span>•</span>
                        <span>{upload.viewCount} views</span>
                        <span>•</span>
                        <span>{format(new Date(upload.createdAt), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit File</DialogTitle>
            <DialogDescription>
              Update the file details and URL settings.
            </DialogDescription>
          </DialogHeader>
          {selectedUpload && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-slug">Custom URL</Label>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {window.location.origin}/
                  </span>
                  <Input
                    id="edit-slug"
                    value={uploadData.slug}
                    onChange={(e) => {
                      const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
                      setUploadData(prev => ({ ...prev, slug: value }));
                    }}
                    placeholder="my-file"
                    data-testid="input-edit-slug"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="File title"
                  data-testid="input-edit-title"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-public"
                  checked={uploadData.isPublic}
                  onCheckedChange={(checked) => setUploadData(prev => ({ ...prev, isPublic: checked }))}
                  data-testid="switch-edit-public"
                />
                <Label htmlFor="edit-public">Make public</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              onClick={handleUpdate}
              disabled={!uploadData.slug || updateMutation.isPending}
              data-testid="button-update-upload"
            >
              {updateMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}