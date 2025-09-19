import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QrCode, Plus, Download, BarChart3, Settings, Trash2, Eye, Copy, ExternalLink } from 'lucide-react';

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
  dark: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be valid hex color').default('#000000'),
  light: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be valid hex color').default('#ffffff'),
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
        title: 'QR Link Created',
        description: 'Your dynamic QR link has been created successfully.',
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
        description: 'The QR link has been deleted successfully.',
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
      dark: '#000000',
      light: '#ffffff',
    },
  });

  // Handlers
  const handleCreateQrLink = (data: any) => {
    createQrLinkMutation.mutate(data);
  };

  const generateStaticQr = async (data: any) => {
    try {
      const response = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-code.${data.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'QR Code Generated',
        description: 'Your static QR code has been generated and downloaded.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate QR code',
        variant: 'destructive',
      });
    }
  };

  const copyQrUrl = (shortId: string) => {
    const url = `${window.location.origin}/q/${shortId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'URL Copied',
      description: 'QR code URL has been copied to clipboard.',
    });
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            QR Code Manager
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Create dynamic QR codes with tracking and analytics, or generate static QR codes instantly.
          </p>
        </div>

        <Tabs defaultValue="dynamic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dynamic" data-testid="tab-dynamic">Dynamic QR Codes</TabsTrigger>
            <TabsTrigger value="static" data-testid="tab-static">Static Generator</TabsTrigger>
          </TabsList>

          {/* Dynamic QR Codes Tab */}
          <TabsContent value="dynamic" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold">Dynamic QR Links</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Trackable QR codes that you can edit and analyze
                </p>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-create-qr">
                    <Plus className="w-4 h-4 mr-2" />
                    Create QR Link
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Dynamic QR Link</DialogTitle>
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
                              <Input placeholder="My QR Link" {...field} data-testid="input-qr-name" />
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
                              <Input placeholder="https://example.com" {...field} data-testid="input-target-url" />
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
                                  <Input placeholder="Source" {...field} />
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
                                  <Input placeholder="Medium" {...field} />
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
                          data-testid="button-submit-qr"
                        >
                          {createQrLinkMutation.isPending ? 'Creating...' : 'Create QR Link'}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* QR Links List */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {linksLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4"></div>
                      <div className="flex justify-between">
                        <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : qrLinksData?.links?.length > 0 ? (
                qrLinksData.links.map((qrLink: QrLink) => (
                  <Card key={qrLink.id} className="hover:shadow-md transition-shadow" data-testid={`card-qr-${qrLink.id}`}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center justify-between">
                        <span className="truncate" data-testid={`text-qr-name-${qrLink.id}`}>
                          {qrLink.name || 'Unnamed QR'}
                        </span>
                        <Badge variant={qrLink.enabled ? 'default' : 'secondary'} data-testid={`status-qr-${qrLink.id}`}>
                          {qrLink.enabled ? 'Active' : 'Inactive'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="truncate" data-testid={`text-target-url-${qrLink.id}`}>
                        {qrLink.targetUrl}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mb-3">
                        <span>/{qrLink.shortId}</span>
                        <span>{qrLink.analytics?.totalScans || 0} scans</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => copyQrUrl(qrLink.shortId)}
                          data-testid={`button-copy-${qrLink.id}`}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          data-testid={`button-analytics-${qrLink.id}`}
                        >
                          <BarChart3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/q/${qrLink.shortId}`, '_blank')}
                          data-testid={`button-visit-${qrLink.id}`}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteQrLinkMutation.mutate(qrLink.id)}
                          disabled={deleteQrLinkMutation.isPending}
                          data-testid={`button-delete-${qrLink.id}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <QrCode className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                    No QR codes yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Create your first dynamic QR code to get started
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-qr">
                    <Plus className="w-4 h-4 mr-2" />
                    Create QR Link
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Static QR Generator Tab */}
          <TabsContent value="static" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Static QR Code Generator</CardTitle>
                <CardDescription>
                  Generate QR codes instantly without tracking. Perfect for URLs, text, or contact information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...staticQrForm}>
                  <form onSubmit={staticQrForm.handleSubmit(generateStaticQr)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <FormField
                          control={staticQrForm.control}
                          name="data"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Enter URL, text, or any data..." 
                                  className="min-h-[100px]"
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
                            name="format"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Format</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-format">
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
                                    <SelectTrigger data-testid="select-size">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="256">256x256</SelectItem>
                                    <SelectItem value="512">512x512</SelectItem>
                                    <SelectItem value="1024">1024x1024</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={staticQrForm.control}
                            name="dark"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Dark Color</FormLabel>
                                <FormControl>
                                  <Input type="color" {...field} data-testid="input-dark-color" />
                                </FormControl>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={staticQrForm.control}
                            name="light"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Light Color</FormLabel>
                                <FormControl>
                                  <Input type="color" {...field} data-testid="input-light-color" />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label>Preview</Label>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 flex items-center justify-center min-h-[200px]">
                          <div ref={qrPreviewRef} className="flex flex-col items-center text-slate-400">
                            <QrCode className="w-16 h-16 mb-2" />
                            <p className="text-sm">Preview will appear here</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" data-testid="button-generate-static">
                        <Download className="w-4 h-4 mr-2" />
                        Generate & Download
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}