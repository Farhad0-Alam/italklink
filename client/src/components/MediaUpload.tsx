import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Upload, 
  Image as ImageIcon, 
  FileImage, 
  Check,
  AlertCircle,
  Loader2
} from "lucide-react";

interface MediaVariant {
  id: string;
  variantType: string;
  publicUrl: string;
  width?: number;
  height?: number;
  fileSize: number;
  format: string;
  quality?: number;
}

interface MediaUploadResponse {
  ok: boolean;
  type: 'image' | 'pdf';
  storagePath: string;
  variants: {
    thumb_200_webp?: string;
    card_430_webp?: string;
    large_1200_webp?: string;
    original?: string;
  };
  width?: number;
  height?: number;
}

interface MediaUploadProps {
  onUploadComplete?: (response: MediaUploadResponse) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function MediaUpload({
  onUploadComplete,
  maxSizeMB = 2,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = ""
}: MediaUploadProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<MediaUploadResponse | null>(null);

  // File validation
  const validateFile = (file: File): string | null => {
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size must be less than ${maxSizeMB}MB`;
    }

    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast({
        title: "Invalid file",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
  };

  // Upload mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      setUploadProgress(0);
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 100);

      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setUploadProgress(100);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload failed');
        }

        return response.json();
      } catch (error) {
        clearInterval(progressInterval);
        setUploadProgress(0);
        throw error;
      }
    },
    onSuccess: (data: MediaUploadResponse) => {
      toast({
        title: "Upload successful",
        description: `Image uploaded with ${Object.keys(data.variants).length} variants generated.`,
      });
      
      setUploadResult(data);
      onUploadComplete?.(data);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['/api/media/uploads'] });
    },
    onError: (error: any) => {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
      setUploadProgress(0);
    },
  });

  // Handle upload
  const handleUpload = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(selectedFile);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Media Upload
        </CardTitle>
        <CardDescription>
          Upload images for automatic WebP optimization. Max size: {maxSizeMB}MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="media-upload">Choose Image</Label>
          <Input
            id="media-upload"
            ref={fileInputRef}
            type="file"
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            disabled={uploadMutation.isPending}
            data-testid="input-media-upload"
          />
        </div>

        {/* Selected File Info */}
        {selectedFile && (
          <Card className="p-4 bg-muted">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileImage className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium" data-testid="text-filename">
                    {selectedFile.name}
                  </p>
                  <p className="text-sm text-muted-foreground" data-testid="text-filesize">
                    {formatFileSize(selectedFile.size)} • {selectedFile.type}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
                disabled={uploadMutation.isPending}
                data-testid="button-clear-selection"
              >
                Clear
              </Button>
            </div>
          </Card>
        )}

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading and optimizing...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="w-full" data-testid="progress-upload" />
          </div>
        )}

        {/* Upload Button */}
        <div className="flex gap-2">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || uploadMutation.isPending}
            className="flex-1"
            data-testid="button-upload"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload & Optimize
              </>
            )}
          </Button>
        </div>

        {/* Upload Result */}
        {uploadResult && (
          <Card className="p-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="space-y-3 flex-1">
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Upload Complete
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    {uploadResult.width && uploadResult.height && (
                      `Original: ${uploadResult.width}×${uploadResult.height}px • `
                    )}
                    Generated {Object.keys(uploadResult.variants).length} variants
                  </p>
                </div>

                {/* Variant Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(uploadResult.variants).map(([key, url]) => {
                    const variantName = key.replace('_webp', '').replace('_', ' ');
                    const dimensions = key === 'thumb_200_webp' ? '200px' :
                                     key === 'card_430_webp' ? '430px' :
                                     key === 'large_1200_webp' ? '1200px' : 'Original';
                    
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {variantName}
                        </Badge>
                        <span className="text-muted-foreground">{dimensions}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Usage */}
                <div className="text-xs text-green-700 dark:text-green-300">
                  <p className="font-medium mb-1">Usage:</p>
                  <ul className="space-y-1">
                    <li>• <code>thumb_200_webp</code> - thumbnails & lists</li>
                    <li>• <code>card_430_webp</code> - business cards & previews</li>
                    <li>• <code>large_1200_webp</code> - full-size displays</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {uploadMutation.isError && (
          <Card className="p-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-800 dark:text-red-200">
                  Upload Failed
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  {uploadMutation.error?.message || 'An error occurred during upload'}
                </p>
              </div>
            </div>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}