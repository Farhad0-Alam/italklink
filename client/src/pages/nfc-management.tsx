import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Smartphone, Plus, Download, BarChart3, Trash2, Copy, 
  ExternalLink, Sparkles, TrendingUp, Users, Globe, Grid3x3,
  Check, AlertCircle, Loader, Zap, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

interface NfcTag {
  id: string;
  cardId: string;
  tagName: string;
  tagId?: string;
  tagType: string;
  targetUrl: string;
  totalTaps: number;
  lastTappedAt?: string;
  isActive: boolean;
  isProgrammed: boolean;
  createdAt: string;
}

interface NfcAnalytics {
  id: string;
  totalTaps: number;
  uniqueDevices: number;
  mobileTaps: number;
  desktopTaps: number;
  tabletTaps: number;
  viewCount: number;
  contactSaveCount: number;
  lastTappedAt?: string;
}

const nfcTagSchema = z.object({
  tagName: z.string().min(1, 'Tag name is required').max(100),
  tagId: z.string().optional(),
  tagType: z.enum(['NTAG215', 'NTAG216', 'NTAG424', 'ICODE', 'Other']).default('NTAG216'),
  targetUrl: z.string().url('Must be a valid URL'),
  cardId: z.string().optional(),
});

export default function NfcManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Fetch user's business cards for selection
  const { data: cards = [] } = useQuery({
    queryKey: ['/api/business-cards'],
  });

  // Fetch NFC tags for user
  const { data: nfcTags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['/api/nfc/user', user?.id],
    enabled: !!user?.id,
  });

  // Fetch analytics for selected tag
  const { data: analytics } = useQuery({
    queryKey: selectedTag ? ['/api/nfc/analytics', selectedTag.id] : null,
  });

  const form = useForm({
    resolver: zodResolver(nfcTagSchema),
    defaultValues: {
      tagName: '',
      tagType: 'NTAG216',
      targetUrl: '',
      cardId: cards[0]?.id || '',
    },
  });

  // Create NFC tag mutation
  const createTagMutation = useMutation({
    mutationFn: (data: z.infer<typeof nfcTagSchema>) =>
      apiRequest('POST', '/api/nfc/create', data),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'NFC tag created successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/nfc/user'] });
      form.reset();
      setShowCreateDialog(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create NFC tag',
        variant: 'destructive',
      });
    },
  });

  // Delete NFC tag mutation
  const deleteTagMutation = useMutation({
    mutationFn: (tagId: string) =>
      apiRequest('DELETE', `/api/nfc/${tagId}`, {}),
    onSuccess: () => {
      toast({
        title: 'Deleted',
        description: 'NFC tag deleted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/nfc/user'] });
      setSelectedTag(null);
    },
  });

  // Download NDEF payload
  const downloadNdef = async (tagId: string) => {
    try {
      const response = await fetch(`/api/nfc/ndef/${tagId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfc-payload-${tagId}.bin`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download NDEF payload',
        variant: 'destructive',
      });
    }
  };

  // Export NFC config
  const exportConfig = async (tagId: string) => {
    try {
      const response = await fetch(`/api/nfc/export/${tagId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nfc-config-${tagId}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export configuration',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-950 dark:to-purple-950">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                NFC Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Create and manage NFC tags for your digital business cards
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-5 h-5 mr-2" />
                  Create NFC Tag
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New NFC Tag</DialogTitle>
                  <DialogDescription>
                    Configure a new NFC tag for your business card
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createTagMutation.mutate(data))} className="space-y-4">
                    <FormField control={form.control} name="tagName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tag Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Business Card NFC" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="cardId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Card</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cards.map((card: any) => (
                              <SelectItem key={card.id} value={card.id}>
                                {card.name || card.cardName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="tagType" render={({ field }) => (
                      <FormItem>
                        <FormLabel>NFC Chip Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NTAG215">NTAG215</SelectItem>
                            <SelectItem value="NTAG216">NTAG216</SelectItem>
                            <SelectItem value="NTAG424">NTAG424</SelectItem>
                            <SelectItem value="ICODE">ICODE</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="targetUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://talkl.ink/yourcard" {...field} />
                        </FormControl>
                        <FormDescription>Where the NFC tap will redirect</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full" disabled={createTagMutation.isPending}>
                      {createTagMutation.isPending ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Tag'
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="tags" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <TabsTrigger value="tags" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
              <Radio className="w-4 h-4 mr-2" />
              My NFC Tags
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="tools" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900">
              <Sparkles className="w-4 h-4 mr-2" />
              Tools
            </TabsTrigger>
          </TabsList>

          {/* NFC Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            {tagsLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : nfcTags.length === 0 ? (
              <Card className="border-dashed text-center py-12 bg-white/50 dark:bg-gray-800/50">
                <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No NFC tags yet</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  Create your first NFC tag
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {nfcTags.map((tag: NfcTag) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedTag(tag)}
                    >
                      <Card className="cursor-pointer hover:shadow-lg transition-shadow bg-white dark:bg-gray-800 border-2 border-transparent hover:border-blue-500">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg">{tag.tagName}</CardTitle>
                              <CardDescription className="text-xs mt-1">{tag.tagType}</CardDescription>
                            </div>
                            <Badge variant={tag.isActive ? 'default' : 'secondary'} className="ml-2">
                              {tag.isProgrammed ? 'Programmed' : 'Pending'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="text-sm">
                            <p className="text-gray-500 dark:text-gray-400">Target URL</p>
                            <p className="text-blue-600 dark:text-blue-400 truncate text-xs">{tag.targetUrl}</p>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Taps: {tag.totalTaps}</span>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="flex-1" onClick={() => downloadNdef(tag.id)}>
                              <Download className="w-3 h-3 mr-1" />
                              NDEF
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                              onClick={() => deleteTagMutation.mutate(tag.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            {!selectedTag ? (
              <Card className="border-dashed text-center py-12 bg-white/50 dark:bg-gray-800/50">
                <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Select an NFC tag to view analytics</p>
              </Card>
            ) : (
              <div className="space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-900">
                  <CardHeader>
                    <CardTitle>{selectedTag.tagName} Analytics</CardTitle>
                    <CardDescription>Real-time tap and engagement data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Taps</p>
                          <p className="text-3xl font-bold text-blue-600">{analytics[0]?.totalTaps || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Unique Devices</p>
                          <p className="text-3xl font-bold text-purple-600">{analytics[0]?.uniqueDevices || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Mobile Taps</p>
                          <p className="text-3xl font-bold text-green-600">{analytics[0]?.mobileTaps || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Desktop Taps</p>
                          <p className="text-3xl font-bold text-orange-600">{analytics[0]?.desktopTaps || 0}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No tap data yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle>Device Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm">Mobile</span>
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded mx-4">
                        <div
                          className="h-full bg-green-500 rounded"
                          style={{
                            width: `${
                              ((analytics?.[0]?.mobileTaps || 0) /
                                (analytics?.[0]?.totalTaps || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{analytics?.[0]?.mobileTaps || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm">Desktop</span>
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded mx-4">
                        <div
                          className="h-full bg-orange-500 rounded"
                          style={{
                            width: `${
                              ((analytics?.[0]?.desktopTaps || 0) /
                                (analytics?.[0]?.totalTaps || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{analytics?.[0]?.desktopTaps || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <span className="text-sm">Tablet</span>
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded mx-4">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{
                            width: `${
                              ((analytics?.[0]?.tabletTaps || 0) /
                                (analytics?.[0]?.totalTaps || 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold">{analytics?.[0]?.tabletTaps || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-4">
            {!selectedTag ? (
              <Card className="border-dashed text-center py-12 bg-white/50 dark:bg-gray-800/50">
                <Zap className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Select an NFC tag to access tools</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Download className="w-5 h-5 mr-2 text-blue-600" />
                      NDEF Payload
                    </CardTitle>
                    <CardDescription>Download NDEF data for NFC chip programming</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Export the NDEF-encoded data to program physical NFC chips using NFC writing tools.
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => downloadNdef(selectedTag.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download NDEF
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-purple-600" />
                      Export Configuration
                    </CardTitle>
                    <CardDescription>Get JSON configuration for integration</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Export complete NFC configuration as JSON for backup or third-party tools.
                    </p>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={() => exportConfig(selectedTag.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 md:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
                      Affiliate Tracking
                    </CardTitle>
                    <CardDescription>Track NFC taps for affiliate commissions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      Each NFC tap is automatically tracked as a platform event for affiliate program attribution.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded text-sm">
                      <p className="font-mono text-blue-600 dark:text-blue-400">platform: "nfc"</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Affiliate conversions via NFC are tracked and attributed automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
