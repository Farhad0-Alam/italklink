import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  QrCode, Plus, Download, BarChart3, Settings, Trash2, Eye, Copy, 
  ExternalLink, ArrowLeft, Sparkles, Palette, ImageIcon, Layers,
  TrendingUp, Users, Globe, Zap, FolderOpen, Grid3x3, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

// Types
interface QrLink {
  id: string;
  userId: string;
  shortId: string;
  name: string | null;
  targetUrl: string;
  utm: any;
  rules: any;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  analytics?: {
    totalScans: number;
    uniqueScans: number;
    deviceBreakdown: { device: string; count: number }[];
    countryBreakdown: { country: string; count: number }[];
    dailyScans: { date: string; scans: number }[];
  };
}

// Form schemas
const qrLinkSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  targetUrl: z.string().url('Must be a valid URL'),
  utm: z.object({
    utm_source: z.string().optional(),
    utm_medium: z.string().optional(),
    utm_campaign: z.string().optional(),
    utm_term: z.string().optional(),
    utm_content: z.string().optional(),
  }).optional(),
});

const staticQrSchema = z.object({
  data: z.string().min(1, 'Data is required'),
  format: z.enum(['png', 'svg']).default('svg'),
  size: z.enum(['256', '512', '1024']).default('512'),
  margin: z.number().min(0).max(10).default(2),
  dark: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be valid hex color').default('#FF6A00'),
  light: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be valid hex color').default('#ffffff'),
  logo: z.any().optional(),
});

export default function QrCodes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedQr, setSelectedQr] = useState<QrLink | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showStaticGenerator, setShowStaticGenerator] = useState(false);
  const qrPreviewRef = useRef<HTMLDivElement>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation('/login');
    }
  }, [user, setLocation]);

  // Fetch QR links
  const { data: qrLinksData, isLoading: linksLoading } = useQuery({
    queryKey: ['/api/qr/links'],
    enabled: !!user,
  });

  // Create QR link mutation
  const createQrLinkMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/qr/links', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr/links'] });
      setShowCreateDialog(false);
      toast({
        title: '✨ QR Link Created!',
        description: 'Your dynamic QR link is ready to use.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create QR link',
        variant: 'destructive',
      });
    },
  });

  // Delete QR link mutation
  const deleteQrLinkMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/qr/links/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/qr/links'] });
      toast({
        title: 'QR Link Deleted',
        description: 'The QR link has been removed successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete QR link',
        variant: 'destructive',
      });
    },
  });

  // Forms
  const createForm = useForm({
    resolver: zodResolver(qrLinkSchema),
    defaultValues: {
      name: '',
      targetUrl: '',
      utm: {
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_term: '',
        utm_content: '',
      },
    },
  });

  const staticQrForm = useForm({
    resolver: zodResolver(staticQrSchema),
    defaultValues: {
      data: '',
      format: 'svg' as const,
      size: '512' as const,
      margin: 2,
      dark: '#FF6A00',
      light: '#ffffff',
      logo: null,
    },
  });

  const [qrPreview, setQrPreview] = useState<string | null>(null);

  // Handlers
  const handleCreateQrLink = (data: any) => {
    createQrLinkMutation.mutate(data);
  };

  // Watch form data for preview
  const watchedData = staticQrForm.watch();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateQrPreview(watchedData);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [watchedData.data, watchedData.dark, watchedData.light, watchedData.size, watchedData.margin]);

  const [previewAbortController, setPreviewAbortController] = useState<AbortController | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const generateQrPreview = async (data: any) => {
    if (!data.data.trim()) {
      setQrPreview(null);
      return;
    }

    // Cancel any in-flight request
    if (previewAbortController) {
      previewAbortController.abort();
    }

    const controller = new AbortController();
    setPreviewAbortController(controller);
    setIsGeneratingPreview(true);

    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data.data,
          format: 'svg',
          size: data.size || '512',
          margin: Number(data.margin) || 2,
          dark: data.dark || '#FF6A00',
          light: data.light || '#ffffff',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code preview');
      }

      const svgText = await response.text();
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgText)}`;
      setQrPreview(svgDataUrl);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Preview generation error:', error);
      setQrPreview(null);
    } finally {
      setIsGeneratingPreview(false);
      setPreviewAbortController(null);
    }
  };

  const downloadQrCode = async (data: any) => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: data.data,
          format: data.format || 'png',
          size: data.size || '512',
          margin: Number(data.margin) || 2,
          dark: data.dark || '#FF6A00',
          light: data.light || '#ffffff',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code.${data.format || 'png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✨ Downloaded!',
        description: 'Your QR code has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download QR code',
        variant: 'destructive',
      });
    }
  };


  const copyQrUrl = (shortId: string) => {
    const url = `${window.location.origin}/q/${shortId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: '✨ URL Copied!',
      description: 'QR code URL is now in your clipboard.',
    });
  };

  const downloadDynamicQr = async (shortId: string, name: string) => {
    try {
      const qrUrl = `${window.location.origin}/q/${shortId}`;
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: qrUrl,
          format: 'png',
          size: '1024',
          margin: 2,
          dark: '#FF6A00',
          light: '#ffffff',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name || shortId}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: '✨ QR Downloaded!',
        description: 'Your QR code has been saved.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download QR code',
        variant: 'destructive',
      });
    }
  };

  const shareDynamicQr = async (shortId: string) => {
    const qrUrl = `${window.location.origin}/q/${shortId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code Link',
          text: 'Check out this QR code link',
          url: qrUrl,
        });
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error);
        }
      }
    } else {
      navigator.clipboard.writeText(qrUrl);
      toast({
        title: '✨ Link Copied!',
        description: 'QR link copied to clipboard.',
      });
    }
  };

  if (!user) {
    return null;
  }

  const qrLinks = (qrLinksData as any)?.links || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50 dark:from-slate-950 dark:via-slate-900 dark:to-orange-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            className="mb-6 hover:bg-orange-100 dark:hover:bg-orange-950/50"
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Header */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                    QR Code Studio
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Create stunning, trackable QR codes in seconds
                  </p>
                </div>
              </div>
            </div>
            
            {/* Stats Cards */}
            <div className="hidden lg:flex gap-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-orange-200 dark:border-orange-900"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Total Scans</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {qrLinks.reduce((acc: number, qr: QrLink) => acc + (qr.analytics?.totalScans || 0), 0)}
                    </p>
                  </div>
                </div>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-lg border border-orange-200 dark:border-orange-900"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Active QR Codes</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {qrLinks.filter((qr: QrLink) => qr.enabled).length}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="dynamic" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white dark:bg-slate-800 p-1 rounded-2xl shadow-lg border border-orange-200 dark:border-orange-900">
            <TabsTrigger 
              value="dynamic" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              data-testid="tab-dynamic"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Dynamic QR Codes
            </TabsTrigger>
            <TabsTrigger 
              value="static" 
              className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
              data-testid="tab-static"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Generator
            </TabsTrigger>
          </TabsList>

          {/* Dynamic QR Codes Tab */}
          <TabsContent value="dynamic" className="space-y-6">
            <motion.div 
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-orange-200 dark:border-orange-900"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                  Dynamic QR Links
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Trackable QR codes with real-time analytics
                </p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/30"
                    data-testid="button-create-qr"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create QR Link
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="text-2xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                      Create Dynamic QR Link
                    </DialogTitle>
                    <DialogDescription>
                      Create a trackable QR code that you can edit and analyze
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form onSubmit={createForm.handleSubmit(handleCreateQrLink)} className="space-y-4">
                      <FormField
                        control={createForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="My Awesome QR" {...field} data-testid="input-qr-name" className="border-orange-200 focus:border-orange-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name="targetUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Target URL</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com" {...field} data-testid="input-target-url" className="border-orange-200 focus:border-orange-500" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* UTM Parameters */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">UTM Parameters (Optional)</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <FormField
                            control={createForm.control}
                            name="utm.utm_source"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Source" {...field} className="border-orange-200" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={createForm.control}
                            name="utm.utm_medium"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input placeholder="Medium" {...field} className="border-orange-200" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createQrLinkMutation.isPending}
                          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                          data-testid="button-submit-qr"
                        >
                          {createQrLinkMutation.isPending ? 'Creating...' : 'Create QR Link'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </motion.div>

            {/* QR Links Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {linksLoading ? (
                  Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <Card className="animate-pulse border-orange-200 dark:border-orange-900">
                        <CardContent className="p-6">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                          <div className="flex justify-between">
                            <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : qrLinks.length > 0 ? (
                  qrLinks.map((qrLink: QrLink, index: number) => (
                    <motion.div
                      key={qrLink.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                    >
                      <Card 
                        className="group hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 border-orange-200 dark:border-orange-900 bg-white dark:bg-slate-800 overflow-hidden" 
                        data-testid={`card-qr-${qrLink.id}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <CardHeader className="pb-3 relative">
                          <CardTitle className="text-lg flex items-center justify-between">
                            <span className="truncate font-bold" data-testid={`text-qr-name-${qrLink.id}`}>
                              {qrLink.name || 'Unnamed QR'}
                            </span>
                            <Badge 
                              variant={qrLink.enabled ? 'default' : 'secondary'}
                              className={qrLink.enabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : ''}
                              data-testid={`status-qr-${qrLink.id}`}
                            >
                              {qrLink.enabled ? 'Active' : 'Inactive'}
                            </Badge>
                          </CardTitle>
                          <CardDescription className="truncate" data-testid={`text-target-url-${qrLink.id}`}>
                            {qrLink.targetUrl}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 relative">
                          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-4 p-3 bg-orange-50 dark:bg-orange-950/30 rounded-xl">
                            <span className="font-mono font-semibold">/{qrLink.shortId}</span>
                            <div className="flex items-center gap-2">
                              <Eye className="w-3 h-3" />
                              <span className="font-bold">{qrLink.analytics?.totalScans || 0}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => downloadDynamicQr(qrLink.shortId, qrLink.name || '')}
                              className="flex-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                              data-testid={`button-download-${qrLink.id}`}
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => shareDynamicQr(qrLink.shortId)}
                              className="flex-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                              data-testid={`button-share-${qrLink.id}`}
                            >
                              <Share2 className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyQrUrl(qrLink.shortId)}
                              className="flex-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                              data-testid={`button-copy-${qrLink.id}`}
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`/q/${qrLink.shortId}`, '_blank')}
                              className="flex-1 border-orange-200 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                              data-testid={`button-visit-${qrLink.id}`}
                            >
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteQrLinkMutation.mutate(qrLink.id)}
                              disabled={deleteQrLinkMutation.isPending}
                              className="flex-1 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30"
                              data-testid={`button-delete-${qrLink.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    className="col-span-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-orange-300 dark:border-orange-800">
                      <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        No QR codes yet
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Create your first dynamic QR code to get started
                      </p>
                      <Button 
                        onClick={() => setShowCreateDialog(true)} 
                        className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 shadow-lg shadow-orange-500/30"
                        data-testid="button-create-first-qr"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create QR Link
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Static QR Generator Tab */}
          <TabsContent value="static" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-orange-200 dark:border-orange-900 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30">
                  <CardTitle className="text-2xl bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Palette className="w-6 h-6" />
                    Design Your QR Code
                  </CardTitle>
                  <CardDescription>
                    Create custom QR codes with your brand colors and logo
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <Form {...staticQrForm}>
                    <form className="space-y-6">
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Left Column - Settings */}
                        <div className="space-y-6">
                          <FormField
                            control={staticQrForm.control}
                            name="data"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-lg font-semibold">Content</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Enter URL, text, or any data..." 
                                    className="min-h-[120px] border-orange-200 focus:border-orange-500 resize-none"
                                    {...field} 
                                    data-testid="input-qr-data"
                                  />
                                </FormControl>
                                <FormDescription>
                                  Enter any text, URL, or data you want to encode
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={staticQrForm.control}
                              name="dark"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>QR Color</FormLabel>
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input 
                                        type="color" 
                                        {...field} 
                                        className="w-16 h-10 p-1 border-orange-200" 
                                      />
                                      <Input 
                                        type="text" 
                                        {...field} 
                                        className="flex-1 border-orange-200" 
                                        placeholder="#FF6A00"
                                      />
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={staticQrForm.control}
                              name="light"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Background</FormLabel>
                                  <FormControl>
                                    <div className="flex gap-2">
                                      <Input 
                                        type="color" 
                                        {...field} 
                                        className="w-16 h-10 p-1 border-orange-200" 
                                      />
                                      <Input 
                                        type="text" 
                                        {...field} 
                                        className="flex-1 border-orange-200" 
                                        placeholder="#FFFFFF"
                                      />
                                    </div>
                                  </FormControl>
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={staticQrForm.control}
                            name="margin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Margin: {field.value}</FormLabel>
                                <FormControl>
                                  <Slider
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={[field.value]}
                                    onValueChange={(value) => field.onChange(value[0])}
                                    className="py-4"
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          {/* Logo upload temporarily disabled - backend support pending */}

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={staticQrForm.control}
                              name="format"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Format</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="border-orange-200" data-testid="select-format">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="svg">SVG</SelectItem>
                                      <SelectItem value="png">PNG</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={staticQrForm.control}
                              name="size"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Size</FormLabel>
                                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                      <SelectTrigger className="border-orange-200" data-testid="select-size">
                                        <SelectValue />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="256">256px</SelectItem>
                                      <SelectItem value="512">512px</SelectItem>
                                      <SelectItem value="1024">1024px</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Right Column - Preview */}
                        <div className="space-y-4">
                          <Label className="text-lg font-semibold">Live Preview</Label>
                          <div className="relative bg-gradient-to-br from-orange-50 to-pink-50 dark:from-orange-950/30 dark:to-pink-950/30 rounded-2xl p-8 border-2 border-orange-200 dark:border-orange-900 min-h-[400px] flex items-center justify-center">
                            {isGeneratingPreview ? (
                              <div className="text-center">
                                <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600 dark:text-slate-400">Generating preview...</p>
                              </div>
                            ) : qrPreview ? (
                              <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="relative"
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl blur-2xl opacity-20"></div>
                                <img 
                                  src={qrPreview} 
                                  alt="QR Preview" 
                                  className="relative max-w-full h-auto rounded-2xl shadow-2xl"
                                />
                              </motion.div>
                            ) : (
                              <div className="text-center">
                                <QrCode className="w-24 h-24 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                                <p className="text-slate-600 dark:text-slate-400">Enter content to see preview</p>
                              </div>
                            )}
                          </div>

                          <Button
                            type="button"
                            onClick={() => downloadQrCode(staticQrForm.getValues())}
                            disabled={!qrPreview || isGeneratingPreview}
                            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white shadow-lg shadow-orange-500/30 h-12 text-lg"
                            data-testid="button-download-qr"
                          >
                            <Download className="w-5 h-5 mr-2" />
                            Download QR Code
                          </Button>
                        </div>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Upload(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
