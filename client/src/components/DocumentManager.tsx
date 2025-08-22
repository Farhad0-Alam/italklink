import React, { useState } from 'react';
import { Plus, X, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface DocumentItem {
  id: string;
  name: string;
  content: string;
  size: number;
  status: 'pending' | 'processing' | 'success' | 'error';
  error?: string;
}

interface DocumentManagerProps {
  title?: string;
  description?: string;
  onDocumentsChange?: (documents: DocumentItem[]) => void;
  maxDocuments?: number;
  maxFileSize?: number; // in bytes
  acceptedTypes?: string[];
  className?: string;
  documents?: DocumentItem[];
}

export function DocumentManager({ 
  title = "PDF Documents", 
  description = "Upload documents one by one for knowledge extraction",
  onDocumentsChange,
  maxDocuments = 20,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.md'],
  className = "",
  documents: externalDocuments = []
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(externalDocuments);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addDocument = (file: File) => {
    if (documents.length >= maxDocuments) {
      toast({
        title: 'Limit Reached',
        description: `Maximum ${maxDocuments} documents allowed`,
        variant: 'destructive',
      });
      return;
    }

    if (file.size > maxFileSize) {
      toast({
        title: 'File Too Large',
        description: `File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`,
        variant: 'destructive',
      });
      return;
    }

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      toast({
        title: 'Invalid File Type',
        description: `Accepted types: ${acceptedTypes.join(', ')}`,
        variant: 'destructive',
      });
      return;
    }

    if (documents.some(doc => doc.name === file.name)) {
      toast({
        title: 'Duplicate File',
        description: 'This document has already been added',
        variant: 'destructive',
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const newDocument: DocumentItem = {
        id: generateId(),
        name: file.name,
        content: event.target?.result as string,
        size: file.size,
        status: 'success'
      };

      const updatedDocuments = [...documents, newDocument];
      setDocuments(updatedDocuments);
      onDocumentsChange?.(updatedDocuments);
      
      toast({
        title: 'Document Added',
        description: `${file.name} has been added successfully`,
      });
    };

    reader.onerror = () => {
      toast({
        title: 'Upload Error',
        description: 'Failed to read the file',
        variant: 'destructive',
      });
    };

    reader.readAsDataURL(file);
  };

  const removeDocument = (id: string) => {
    const updatedDocuments = documents.filter(doc => doc.id !== id);
    setDocuments(updatedDocuments);
    onDocumentsChange?.(updatedDocuments);
    
    toast({
      title: 'Document Removed',
      description: 'Document has been removed from knowledge base',
    });
  };

  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    files.forEach(file => addDocument(file));
    // Reset input value so same file can be selected again
    event.target.value = '';
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    files.forEach(file => addDocument(file));
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const getStatusIcon = (status: DocumentItem['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-gray-400" />;
      case 'processing':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (item: DocumentItem) => {
    switch (item.status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <FileText className="h-5 w-5 text-blue-400" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-slate-400">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div 
          className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center hover:border-slate-500 transition-colors cursor-pointer bg-slate-700/50"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => document.getElementById('file-input')?.click()}
        >
          <FileText className="h-12 w-12 mx-auto mb-3 text-slate-400" />
          <p className="text-sm text-slate-300 mb-2">
            <strong>Click to upload</strong> or drag and drop documents
          </p>
          <p className="text-xs text-slate-500">
            {acceptedTypes.join(', ')} up to {Math.round(maxFileSize / (1024 * 1024))}MB
          </p>
          
          <Button className="mt-3 flex items-center gap-1" size="sm">
            <Plus className="h-4 w-4" />
            + Add Document
          </Button>
        </div>

        <input
          id="file-input"
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInput}
          className="hidden"
          multiple={false} // One by one upload
        />

        {/* Document Limit Info */}
        {documents.length > 0 && (
          <div className="text-sm text-slate-400">
            {documents.length}/{maxDocuments} documents added
          </div>
        )}

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {documents.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-700 hover:bg-slate-650 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-white">
                      {item.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      {formatFileSize(item.size)}
                    </div>
                    {item.error && (
                      <div className="text-xs text-red-400 truncate">
                        {item.error}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {getStatusBadge(item)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(item.id)}
                    disabled={item.status === 'processing'}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {documents.length > 0 && (
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-sm text-slate-400">
              {documents.filter(d => d.status === 'success').length} ready, {documents.filter(d => d.status === 'error').length} failed
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setDocuments([]);
                onDocumentsChange?.([]);
              }}
              disabled={isProcessing}
              size="sm"
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Empty State */}
        {documents.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm">No documents added yet</p>
            <p className="text-xs">Upload documents one by one to build your knowledge base</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}