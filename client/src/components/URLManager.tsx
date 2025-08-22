import React, { useState } from 'react';
import { Plus, X, Globe, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export interface URLItem {
  id: string;
  url: string;
  status: 'pending' | 'ingesting' | 'success' | 'error';
  title?: string;
  chunks?: number;
  error?: string;
}

interface URLManagerProps {
  title?: string;
  description?: string;
  onIngest?: (urls: string[]) => Promise<void>;
  maxUrls?: number;
  className?: string;
}

export function URLManager({ 
  title = "Website URLs", 
  description = "Add unlimited website URLs for knowledge extraction",
  onIngest,
  maxUrls = 50,
  className = ""
}: URLManagerProps) {
  const [urls, setUrls] = useState<URLItem[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return url.startsWith('http://') || url.startsWith('https://');
    } catch {
      return false;
    }
  };

  const addUrl = () => {
    const trimmedUrl = newUrl.trim();
    
    if (!trimmedUrl) {
      toast({
        title: 'URL Required',
        description: 'Please enter a website URL',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidUrl(trimmedUrl)) {
      toast({
        title: 'Invalid URL',
        description: 'Please enter a valid URL starting with http:// or https://',
        variant: 'destructive',
      });
      return;
    }

    if (urls.some(item => item.url === trimmedUrl)) {
      toast({
        title: 'Duplicate URL',
        description: 'This URL has already been added',
        variant: 'destructive',
      });
      return;
    }

    if (urls.length >= maxUrls) {
      toast({
        title: 'Limit Reached',
        description: `Maximum ${maxUrls} URLs allowed`,
        variant: 'destructive',
      });
      return;
    }

    const newUrlItem: URLItem = {
      id: generateId(),
      url: trimmedUrl,
      status: 'pending'
    };

    setUrls(prev => [...prev, newUrlItem]);
    setNewUrl('');
    
    toast({
      title: 'URL Added',
      description: 'Website URL added to knowledge base',
    });
  };

  const removeUrl = (id: string) => {
    setUrls(prev => prev.filter(item => item.id !== id));
    toast({
      title: 'URL Removed',
      description: 'Website URL removed from knowledge base',
    });
  };

  const ingestUrls = async () => {
    if (urls.length === 0) {
      toast({
        title: 'No URLs',
        description: 'Add at least one URL to ingest',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Update all URLs to ingesting status
      setUrls(prev => prev.map(item => ({ ...item, status: 'ingesting' as const })));

      // Process URLs one by one for better UX
      for (const urlItem of urls) {
        try {
          const response = await fetch('/api/ingest', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: urlItem.url }),
          });

          const result = await response.json();

          if (response.ok && result.ok) {
            setUrls(prev => prev.map(item => 
              item.id === urlItem.id 
                ? { 
                    ...item, 
                    status: 'success', 
                    title: result.title,
                    chunks: result.chunks 
                  }
                : item
            ));
          } else {
            setUrls(prev => prev.map(item => 
              item.id === urlItem.id 
                ? { 
                    ...item, 
                    status: 'error',
                    error: result.error || 'Failed to ingest URL'
                  }
                : item
            ));
          }
        } catch (error) {
          setUrls(prev => prev.map(item => 
            item.id === urlItem.id 
              ? { 
                  ...item, 
                  status: 'error',
                  error: 'Network error'
                }
              : item
          ));
        }
      }

      if (onIngest) {
        await onIngest(urls.map(u => u.url));
      }

      const successCount = urls.filter(u => u.status === 'success').length;
      toast({
        title: 'Ingestion Complete',
        description: `Successfully ingested ${successCount} of ${urls.length} URLs`,
      });

    } catch (error) {
      toast({
        title: 'Ingestion Failed',
        description: 'Failed to process URLs',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addUrl();
    }
  };

  const getStatusIcon = (status: URLItem['status']) => {
    switch (status) {
      case 'pending':
        return <Globe className="h-4 w-4 text-gray-400" />;
      case 'ingesting':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusBadge = (item: URLItem) => {
    switch (item.status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'ingesting':
        return <Badge className="bg-blue-100 text-blue-800">Processing...</Badge>;
      case 'success':
        return <Badge className="bg-green-100 text-green-800">{item.chunks} chunks</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg text-white">
          <Globe className="h-5 w-5 text-blue-400" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-slate-400">{description}</p>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Add URL Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="https://example.com"
              className="pl-8 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              disabled={isProcessing || urls.length >= maxUrls}
            />
            <Globe className="h-4 w-4 absolute left-2.5 top-3 text-slate-400" />
          </div>
          <Button
            onClick={addUrl}
            disabled={isProcessing || urls.length >= maxUrls}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add URL
          </Button>
        </div>

        {/* URL Limit Info */}
        {urls.length > 0 && (
          <div className="text-sm text-slate-400">
            {urls.length}/{maxUrls} URLs added
          </div>
        )}

        {/* URL List */}
        {urls.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {urls.map((item) => (
              <div 
                key={item.id}
                className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-700 hover:bg-slate-650 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {getStatusIcon(item.status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate text-white">
                      {item.title || new URL(item.url).hostname}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {item.url}
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
                    onClick={() => removeUrl(item.id)}
                    disabled={item.status === 'ingesting'}
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
        {urls.length > 0 && (
          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-sm text-slate-400">
              {urls.filter(u => u.status === 'success').length} ingested, {urls.filter(u => u.status === 'error').length} failed
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setUrls([])}
                disabled={isProcessing}
                size="sm"
              >
                Clear All
              </Button>
              <Button
                onClick={ingestUrls}
                disabled={isProcessing || urls.length === 0}
                className="flex items-center gap-1"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4" />
                    Ingest URLs
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {urls.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <Globe className="h-12 w-12 mx-auto mb-3 text-slate-400" />
            <p className="text-sm">No URLs added yet</p>
            <p className="text-xs">Add website URLs to build your knowledge base</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}