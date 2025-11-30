import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Smartphone, Plus, Download, BarChart3, Trash2, Copy, 
  ExternalLink, Sparkles, TrendingUp, Users, Globe, Grid3x3,
  Check, AlertCircle, Loader, Zap, Radio, Menu, Scan, Upload,
  Smartphone as PhoneIcon, Chrome, Info, BookOpen, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { readNFCTag, writeNFCTag, getNFCSupportInfo, formatNFCData } from '@/lib/nfc-utils';

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

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
  planType: 'free' | 'paid';
}

export default function NfcManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [selectedTag, setSelectedTag] = useState<NfcTag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nfcReading, setNfcReading] = useState(false);
  const [nfcWriting, setNfcWriting] = useState(false);
  const [nfcReadResult, setNfcReadResult] = useState<string | null>(null);

  // Fetch user data
  const { data: user, isLoading: userLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  // Fetch user's business cards for selection
  const { data: cards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/business-cards'],
  });

  // Fetch NFC tags for user
  const { data: nfcTags = [], isLoading: tagsLoading } = useQuery({
    queryKey: ['/api/nfc/user', user?.id],
    enabled: !!user?.id,
    select: (response: any) => response?.data || [],
  });

  // Fetch analytics for selected tag
  const { data: analytics } = useQuery({
    queryKey: selectedTag ? ['/api/nfc/analytics', selectedTag.id] : null,
    select: (response: any) => response?.data || null,
  });

  const form = useForm({
    resolver: zodResolver(nfcTagSchema),
    defaultValues: {
      tagName: '',
      tagType: 'NTAG216',
      targetUrl: '',
      cardId: '',
    },
  });

  const editForm = useForm({
    resolver: zodResolver(nfcTagSchema),
    defaultValues: {
      tagName: '',
      tagType: 'NTAG216',
      targetUrl: '',
      cardId: '',
    },
  });

  // Watch the selected card and auto-populate fields
  const selectedCardId = useWatch({
    control: form.control,
    name: 'cardId',
  });

  const selectedCard = cards.find((card: any) => card.id === selectedCardId);

  // Reset form when dialog opens
  useEffect(() => {
    if (showCreateDialog && cards.length > 0) {
      form.reset({
        tagName: '',
        tagType: 'NTAG216',
        targetUrl: '',
        cardId: cards[0]?.id || '',
      });
    }
  }, [showCreateDialog, cards, form]);

  // Auto-populate target URL and tag name when card is selected
  useEffect(() => {
    if (selectedCard && selectedCardId) {
      const cardUrl = `https://talkl.ink/${selectedCard.customUrl || selectedCard.shareSlug || selectedCard.id}`;
      form.setValue('targetUrl', cardUrl);
      form.setValue('tagName', `${selectedCard.name || selectedCard.cardName} - NFC Tag`);
    }
  }, [selectedCard, selectedCardId, form]);

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

  // Update NFC tag mutation
  const updateTagMutation = useMutation({
    mutationFn: (data: { tagId: string; updates: Partial<z.infer<typeof nfcTagSchema>> }) =>
      apiRequest('PATCH', `/api/nfc/${data.tagId}`, data.updates),
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'NFC tag updated successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/nfc/user'] });
      setShowEditDialog(false);
      setSelectedTag(null);
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update NFC tag',
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

  // Handle NFC Read
  const handleReadNFC = async () => {
    setNfcReading(true);
    try {
      const data = await readNFCTag();
      setNfcReadResult(formatNFCData(data));
      toast({
        title: 'Success',
        description: 'NFC tag read successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to read NFC tag',
        variant: 'destructive',
      });
    } finally {
      setNfcReading(false);
    }
  };

  // Handle NFC Write
  const handleWriteNFC = async () => {
    if (!selectedTag) return;
    setNfcWriting(true);
    try {
      await writeNFCTag(selectedTag.targetUrl);
      toast({
        title: 'Success',
        description: 'NFC tag written successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to write NFC tag',
        variant: 'destructive',
      });
    } finally {
      setNfcWriting(false);
    }
  };

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Hidden on mobile */}
      {user && (
        <div className="hidden md:block w-64 fixed h-screen">
          <DashboardSidebar 
            user={user}
            businessCardsCount={0}
            onLogout={() => setLocation('/')}
          />
        </div>
      )}

      {/* Mobile Sidebar in Sheet */}
      {user && (
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-64 p-0 md:hidden">
            <DashboardSidebar 
              user={user}
              businessCardsCount={0}
              onLogout={() => setLocation('/')}
            />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex-1 md:ml-64 overflow-y-auto">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">NFC Management</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
          </Sheet>
        </div>

        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                NFC Management
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
                Create and manage NFC tags for your business cards
              </p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button size="sm" sm:size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto flex-shrink-0">
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-sm sm:text-base">Create NFC Tag</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl">Create New NFC Tag</DialogTitle>
                  <DialogDescription className="text-sm">
                    Configure a new NFC tag for your business card
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit((data) => createTagMutation.mutate(data))} className="space-y-3 sm:space-y-4 mt-4">
                    <FormField control={form.control} name="tagName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Tag Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Business Card NFC" {...field} className="text-sm h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="cardId" render={({ field }) => {
                      const selectedCardValue = cards.find((c: any) => c.id === field.value);
                      const selectedCardUrl = selectedCardValue ? `https://talkl.ink/${selectedCardValue.customUrl || selectedCardValue.shareSlug || selectedCardValue.id}` : '';
                      return (
                        <FormItem>
                          <FormLabel className="text-sm">Business Card</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value} disabled={cardsLoading || cards.length === 0}>
                            <FormControl>
                              <SelectTrigger className="text-sm h-9">
                                <SelectValue placeholder={cardsLoading ? 'Loading cards...' : cards.length === 0 ? 'No cards available' : 'Select a card'}>
                                  {field.value && selectedCardValue ? `${selectedCardValue.name || selectedCardValue.cardName}` : ''}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {cards.length === 0 ? (
                                <div className="text-sm p-2 text-gray-500">No business cards found. Create one first.</div>
                              ) : (
                                cards.map((card: any) => {
                                  const cardUrl = `https://talkl.ink/${card.customUrl || card.shareSlug || card.id}`;
                                  return (
                                    <SelectItem key={card.id} value={card.id} className="text-sm">
                                      <div className="flex flex-col">
                                        <span className="font-semibold">{card.name || card.cardName}</span>
                                        <span className="text-xs text-gray-500">{cardUrl}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })
                              )}
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">Select a card - Target URL will auto-populate with its link</FormDescription>
                          {selectedCardUrl && (
                            <div className="text-xs bg-blue-50 dark:bg-blue-950/30 p-2 rounded mt-2 text-blue-700 dark:text-blue-300 break-all">
                              Card URL: {selectedCardUrl}
                            </div>
                          )}
                          <FormMessage className="text-xs" />
                        </FormItem>
                      );
                    }} />

                    <FormField control={form.control} name="tagType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">NFC Chip Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-sm h-9">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NTAG215" className="text-sm">NTAG215</SelectItem>
                            <SelectItem value="NTAG216" className="text-sm">NTAG216</SelectItem>
                            <SelectItem value="NTAG424" className="text-sm">NTAG424</SelectItem>
                            <SelectItem value="ICODE" className="text-sm">ICODE</SelectItem>
                            <SelectItem value="Other" className="text-sm">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="targetUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Target URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://talkl.ink/yourcard" {...field} className="text-sm h-9" />
                        </FormControl>
                        <FormDescription className="text-xs">Where the NFC tap will redirect (optional - can override the Business Card URL)</FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full h-9 text-sm" disabled={createTagMutation.isPending}>
                      {createTagMutation.isPending ? (
                        <>
                          <Loader className="w-3 h-3 mr-2 animate-spin" />
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

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-left">
                  <DialogTitle className="text-xl">Edit NFC Tag</DialogTitle>
                  <DialogDescription className="text-sm">
                    Update your NFC tag details
                  </DialogDescription>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit((data) => { if (selectedTag) updateTagMutation.mutate({ tagId: selectedTag.id, updates: data }); })} className="space-y-3 sm:space-y-4 mt-4">
                    <FormField control={editForm.control} name="tagName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Tag Name</FormLabel>
                        <FormControl>
                          <Input placeholder="My Business Card NFC" {...field} className="text-sm h-9" />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="tagType" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">NFC Chip Type</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="text-sm h-9">
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
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <FormField control={editForm.control} name="targetUrl" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Target URL</FormLabel>
                        <FormControl>
                          <Input type="url" placeholder="https://example.com" {...field} className="text-sm h-9" />
                        </FormControl>
                        <FormDescription className="text-xs">The URL that NFC taps redirect to (can be different from Business Card URL)</FormDescription>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-sm h-9" disabled={updateTagMutation.isPending}>
                      {updateTagMutation.isPending ? (
                        <>
                          <Loader className="w-3 h-3 mr-2 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Tag'
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Device Compatibility & Getting Started Guide */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          {/* Device Requirements Banner */}
          <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 border-0 shadow-lg">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 flex-shrink-0">
                  <Info className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-sm sm:text-base mb-2">✅ Works Best On:</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-white/30 text-white hover:bg-white/40 border-white/50">
                      <PhoneIcon className="w-3 h-3 mr-1" />
                      Android
                    </Badge>
                    <Badge className="bg-white/30 text-white hover:bg-white/40 border-white/50">
                      <Chrome className="w-3 h-3 mr-1" />
                      Chrome/Edge
                    </Badge>
                  </div>
                  <p className="text-white/80 text-xs sm:text-sm mt-3">Web NFC API works best on Android devices with Chrome or Edge browsers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Getting Started Guide */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Step 1: Create */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-200 dark:border-emerald-800 h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg p-2 flex-shrink-0">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                    <Badge className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs">Step 1</Badge>
                  </div>
                  <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Create NFC Tag</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Click "Create NFC Tag" button, select your business card, and choose chip type</p>
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    Get Started <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 2: Write */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-2 border-blue-200 dark:border-blue-800 h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-2 flex-shrink-0">
                      <Upload className="w-4 h-4 text-white" />
                    </div>
                    <Badge className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs">Step 2</Badge>
                  </div>
                  <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Write to Chip</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Click "Write Tag" and hold your Android phone near a blank NFC chip</p>
                  <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 text-xs font-semibold">
                    Write Data <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Step 3: Use */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-2 border-purple-200 dark:border-purple-800 h-full hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-2 flex-shrink-0">
                      <Scan className="w-4 h-4 text-white" />
                    </div>
                    <Badge className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 text-xs">Step 3</Badge>
                  </div>
                  <h4 className="font-bold text-sm mb-2 text-gray-900 dark:text-white">Share & Track</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Distribute tags to customers. Taps are auto-tracked for analytics & affiliates</p>
                  <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 text-xs font-semibold">
                    Track Taps <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>


        {/* Tabs */}
        <Tabs defaultValue="tags" className="w-full">
          <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 h-auto">
            <TabsTrigger value="tags" className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:shadow-md transition-all text-xs sm:text-sm py-3 px-2 sm:px-3 data-[state=active]:shadow-lg data-[state=active]:from-emerald-100 dark:data-[state=active]:from-emerald-900/60">
              <Radio className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">My NFC Tags</span>
              <span className="sm:hidden">Tags</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-2 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:shadow-md transition-all text-xs sm:text-sm py-3 px-2 sm:px-3 data-[state=active]:shadow-lg data-[state=active]:from-blue-100 dark:data-[state=active]:from-blue-900/60">
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="tools" className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-2 border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:shadow-md transition-all text-xs sm:text-sm py-3 px-2 sm:px-3 data-[state=active]:shadow-lg data-[state=active]:from-purple-100 dark:data-[state=active]:from-purple-900/60">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Tools</span>
              <span className="sm:hidden">Tools</span>
            </TabsTrigger>
          </TabsList>

          {/* NFC Tags Tab */}
          <TabsContent value="tags" className="space-y-4">
            {tagsLoading ? (
              <div className="flex justify-center py-12">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : nfcTags.length === 0 ? (
              <Card className="border-dashed text-center py-8 sm:py-12 bg-white/50 dark:bg-gray-800/50">
                <Smartphone className="w-8 sm:w-12 h-8 sm:h-12 mx-auto text-gray-400 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">No NFC tags yet</p>
                <Button variant="outline" className="mt-4 text-sm" onClick={() => setShowCreateDialog(true)}>
                  Create your first NFC tag
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                <AnimatePresence>
                  {nfcTags.map((tag: NfcTag) => (
                    <motion.div
                      key={tag.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      onClick={() => setSelectedTag(tag)}
                    >
                      <Card className={`cursor-pointer hover:shadow-lg transition-all h-full bg-white dark:bg-gray-800 border-2 ${selectedTag?.id === tag.id ? 'border-blue-500 shadow-lg bg-blue-50 dark:bg-blue-950/30' : 'border-transparent hover:border-blue-500'}`}>
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-base sm:text-lg truncate">{tag.tagName}</CardTitle>
                              <CardDescription className="text-xs mt-0.5 sm:mt-1">{tag.tagType}</CardDescription>
                            </div>
                            <Badge variant={tag.isActive ? 'default' : 'secondary'} className="text-xs flex-shrink-0">
                              {tag.isProgrammed ? 'Prog' : 'Pend'}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2 sm:space-y-3">
                          <div className="text-xs sm:text-sm">
                            <p className="text-gray-500 dark:text-gray-400 text-xs">Target URL</p>
                            <p className="text-blue-600 dark:text-blue-400 truncate text-xs">{tag.targetUrl}</p>
                          </div>
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Taps: {tag.totalTaps}</span>
                            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
                          </div>
                          <div className="flex gap-1.5 sm:gap-2">
                            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); editForm.reset({ tagName: tag.tagName, tagType: tag.tagType as any, targetUrl: tag.targetUrl, cardId: tag.cardId }); setSelectedTag(tag); setShowEditDialog(true); }}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" className="flex-1 h-8 text-xs" onClick={(e) => { e.stopPropagation(); downloadNdef(tag.id); }}>
                              <Download className="w-3 h-3 mr-0.5 sm:mr-1" />
                              <span className="hidden sm:inline">NDEF</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="flex-1 h-8 text-xs"
                              onClick={(e) => { e.stopPropagation(); deleteTagMutation.mutate(tag.id); }}
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
          <TabsContent value="analytics" className="space-y-3 sm:space-y-4">
            {!selectedTag ? (
              <Card className="border-dashed text-center py-8 sm:py-12 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800">
                <BarChart3 className="w-8 sm:w-12 h-8 sm:h-12 mx-auto text-blue-400 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">View NFC Analytics</p>
                <div className="max-w-md mx-auto space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Select an NFC tag from the "My NFC Tags" tab to view real-time analytics including:
                  </p>
                  <div className="text-xs text-left space-y-1 bg-white dark:bg-gray-800 rounded p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300">Total number of taps on your NFC tag</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300">Unique devices that scanned the tag</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300">Device breakdown (mobile, desktop, tablet)</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    👉 Go to "My NFC Tags" tab and click on any tag to see its analytics
                  </p>
                </div>
              </Card>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-900">
                  <CardHeader className="pb-2 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl truncate">{selectedTag.tagName}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">Real-time tap and engagement data</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {analytics ? (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
                        <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Taps</p>
                          <p className="text-2xl sm:text-3xl font-bold text-blue-600">{analytics[0]?.totalTaps || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Unique</p>
                          <p className="text-2xl sm:text-3xl font-bold text-purple-600">{analytics[0]?.uniqueDevices || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Mobile</p>
                          <p className="text-2xl sm:text-3xl font-bold text-green-600">{analytics[0]?.mobileTaps || 0}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-2 sm:p-4 rounded-lg">
                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Desktop</p>
                          <p className="text-2xl sm:text-3xl font-bold text-orange-600">{analytics[0]?.desktopTaps || 0}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">No tap data yet</p>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="text-lg sm:text-xl">Device Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded gap-2">
                      <span className="text-xs sm:text-sm flex-shrink-0">Mobile</span>
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded min-w-[60px]">
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
                      <span className="text-xs sm:text-sm font-semibold flex-shrink-0">{analytics?.[0]?.mobileTaps || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded gap-2">
                      <span className="text-xs sm:text-sm flex-shrink-0">Desktop</span>
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded min-w-[60px]">
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
                      <span className="text-xs sm:text-sm font-semibold flex-shrink-0">{analytics?.[0]?.desktopTaps || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded gap-2">
                      <span className="text-xs sm:text-sm flex-shrink-0">Tablet</span>
                      <div className="h-2 flex-1 bg-gray-200 dark:bg-gray-600 rounded min-w-[60px]">
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
                      <span className="text-xs sm:text-sm font-semibold flex-shrink-0">{analytics?.[0]?.tabletTaps || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-3 sm:space-y-4">
            {!selectedTag ? (
              <Card className="border-dashed text-center py-8 sm:py-12 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border-2 border-purple-200 dark:border-purple-800">
                <Zap className="w-8 sm:w-12 h-8 sm:h-12 mx-auto text-purple-400 mb-3 sm:mb-4" />
                <p className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">NFC Tools & Utilities</p>
                <div className="max-w-md mx-auto space-y-3">
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    Select an NFC tag from the "My NFC Tags" tab to access powerful tools:
                  </p>
                  <div className="text-xs text-left space-y-1 bg-white dark:bg-gray-800 rounded p-3">
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Scan Tag:</strong> Read existing NFC tags to verify content</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Write to Chip:</strong> Write your card link to blank NFC chips</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Download NDEF:</strong> Export NDEF payload for chip programming</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-purple-600 dark:text-purple-400 font-bold flex-shrink-0">•</span>
                      <span className="text-gray-700 dark:text-gray-300"><strong>Export Config:</strong> Download tag configuration as JSON</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    👉 Go to "My NFC Tags" tab and click on any tag to unlock these tools
                  </p>
                </div>
              </Card>
            ) : (
              <>
                {/* NFC Read/Write Tools - Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <Scan className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600 flex-shrink-0" />
                        <span>Read NFC Tag</span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Scan existing NFC tags</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Hold your phone near an NFC tag to read its contents.
                      </p>
                      {nfcReadResult && (
                        <div className="bg-white dark:bg-gray-800 border border-green-200 dark:border-green-800 rounded p-2 sm:p-3">
                          <p className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-mono break-all">{nfcReadResult}</p>
                        </div>
                      )}
                      <Button
                        className="w-full text-sm h-9 bg-blue-600 hover:bg-blue-700"
                        onClick={handleReadNFC}
                        disabled={nfcReading}
                      >
                        {nfcReading ? (
                          <>
                            <Loader className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Scan className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Scan Tag
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-200 dark:border-emerald-800">
                    <CardHeader className="pb-2 sm:pb-3">
                      <CardTitle className="flex items-center text-base sm:text-lg">
                        <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-emerald-600 flex-shrink-0" />
                        <span>Write to Tag</span>
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Write card link to NFC chip</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                        Hold your phone near a blank NFC chip to write your card link: {selectedTag.targetUrl}
                      </p>
                      <Button
                        className="w-full text-sm h-9 bg-emerald-600 hover:bg-emerald-700"
                        onClick={handleWriteNFC}
                        disabled={nfcWriting}
                      >
                        {nfcWriting ? (
                          <>
                            <Loader className="w-3 h-3 sm:w-4 sm:h-4 mr-2 animate-spin" />
                            Writing...
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Write Tag
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Existing Tools - Bottom Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-blue-600 flex-shrink-0" />
                      <span>NDEF Payload</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">NDEF data for NFC programming</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Export NDEF-encoded data to program physical NFC chips.
                    </p>
                    <Button
                      className="w-full text-sm h-9"
                      onClick={() => downloadNdef(selectedTag.id)}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Download NDEF
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-purple-600 flex-shrink-0" />
                      <span>Export Config</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">JSON configuration</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Export NFC config as JSON for integrations.
                    </p>
                    <Button
                      className="w-full text-sm h-9"
                      variant="outline"
                      onClick={() => exportConfig(selectedTag.id)}
                    >
                      <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      Export JSON
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800 col-span-1 md:col-span-2">
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center text-base sm:text-lg">
                      <Globe className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-green-600 flex-shrink-0" />
                      <span>Affiliate Tracking</span>
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm">NFC tap attribution</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      NFC taps are automatically tracked for affiliate attribution.
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-2 sm:p-3 rounded text-xs sm:text-sm">
                      <p className="font-mono text-blue-600 dark:text-blue-400 text-xs break-all">platform: "nfc"</p>
                      <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs">
                        Conversions are tracked and attributed automatically.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Complete NFC Setup Guide - Collapsible FAQ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8">
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <BookOpen className="w-5 h-5 text-orange-600" />
                Complete NFC Setup Guide & FAQ
              </CardTitle>
              <CardDescription>Click on any section to expand and learn more</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {/* What is NFC? */}
                <AccordionItem value="what-is-nfc">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">📱 What is NFC?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>
                      NFC (Near Field Communication) is a wireless technology that lets your phone read data from NFC chips by tapping them together. Think of it like a digital business card that someone can tap with their phone to instantly open your profile, contact info, or website.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                {/* Where to Buy */}
                <AccordionItem value="where-to-buy">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">🛒 Where to Buy NFC Chips?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Popular NFC Chip Types:</p>
                      <ul className="space-y-1 ml-3">
                        <li>• <strong>NTAG215/216:</strong> Most common, affordable ($0.10-0.50 each). Great for beginners</li>
                        <li>• <strong>NTAG424:</strong> Larger storage, better security ($0.30-0.80 each)</li>
                        <li>• <strong>ISO15693:</strong> Longer read distance, premium option</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Where to Buy:</p>
                      <ul className="space-y-1 ml-3">
                        <li>• Amazon: Search "NTAG215 NFC chips" or "NFC tag stickers"</li>
                        <li>• eBay: Bulk options available at wholesale prices</li>
                        <li>• AliExpress: Budget-friendly for bulk orders</li>
                        <li>• Local electronics suppliers: Digi-Key, Mouser Electronics</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Step-by-Step Setup */}
                <AccordionItem value="setup-steps">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">⚙️ Step-by-Step Setup Instructions</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <div className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full w-7 h-7 flex items-center justify-center font-bold flex-shrink-0 text-xs">1</div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Create a Business Card</p>
                          <p className="text-xs mt-1">Go to your Business Card Builder and create or select a card you want to link to the NFC tag</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full w-7 h-7 flex items-center justify-center font-bold flex-shrink-0 text-xs">2</div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Create an NFC Tag</p>
                          <p className="text-xs mt-1">Click "Create NFC Tag" above, give it a name, select your business card, choose chip type, and set the target URL</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full w-7 h-7 flex items-center justify-center font-bold flex-shrink-0 text-xs">3</div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Download NDEF Data (Optional)</p>
                          <p className="text-xs mt-1">You can download the NDEF payload to program your chips using specialized NFC programming apps or devices</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full w-7 h-7 flex items-center justify-center font-bold flex-shrink-0 text-xs">4</div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Write to NFC Chip (Android Only)</p>
                          <p className="text-xs mt-1">On Android with Chrome/Edge, click "Write Tag" in the Tools tab and hold your phone near a blank NFC chip. The app will write your tag data to it</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full w-7 h-7 flex items-center justify-center font-bold flex-shrink-0 text-xs">5</div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Share & Track</p>
                          <p className="text-xs mt-1">Hand out your NFC tags to customers, partners, or place them in physical locations. Every tap is automatically tracked in Analytics!</p>
                        </div>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* How to Program */}
                <AccordionItem value="how-to-program">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">💻 How to Program Physical NFC Chips?</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Option 1: Using This App (Android Only)</p>
                      <ul className="space-y-1 ml-3">
                        <li>✓ Select a tag in "My NFC Tags"</li>
                        <li>✓ Go to "Tools" tab</li>
                        <li>✓ Click "Write Tag" button</li>
                        <li>✓ Hold Android phone near blank chip</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Option 2: Using NDEF Data</p>
                      <ul className="space-y-1 ml-3">
                        <li>• Download NDEF payload from "Tools" tab</li>
                        <li>• Use NFC Pro app, TagWriter by NXP, or similar tools</li>
                        <li>• Import NDEF file and write to chips</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Option 3: Manual Programming with Mobile Apps</p>
                      <ul className="space-y-1 ml-3">
                        <li>• Download "TagWriter by NXP" (free)</li>
                        <li>• Enter your target URL manually</li>
                        <li>• Follow app instructions to write to chips</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Analytics */}
                <AccordionItem value="analytics">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">📊 Understanding Your Analytics</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p className="font-semibold text-gray-900 dark:text-white">Metrics Explained:</p>
                    <ul className="space-y-1 ml-3">
                      <li>• <strong>Total Taps:</strong> How many times your NFC tag was scanned</li>
                      <li>• <strong>Unique Devices:</strong> How many different phones tapped your tag</li>
                      <li>• <strong>Device Breakdown:</strong> Taps on mobile, desktop, and tablets</li>
                      <li>• <strong>Affiliate Attribution:</strong> Conversions are automatically tagged as "nfc" platform</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                {/* Troubleshooting */}
                <AccordionItem value="troubleshooting">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">🔧 Troubleshooting</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Write Tag not working?</p>
                      <ul className="space-y-1 ml-3">
                        <li>✓ Ensure you're on Android with Chrome or Edge</li>
                        <li>✓ Make sure your chip is blank and compatible</li>
                        <li>✓ Hold phone steady against the chip for 2-3 seconds</li>
                        <li>✓ Try a different NFC chip if one fails</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">Tag not being scanned?</p>
                      <ul className="space-y-1 ml-3">
                        <li>✓ Check that NFC is enabled on the phone</li>
                        <li>✓ Make sure chip was written successfully</li>
                        <li>✓ Try scanning with different phones</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white mb-2">No analytics data?</p>
                      <ul className="space-y-1 ml-3">
                        <li>✓ Analytics update every time someone taps the tag</li>
                        <li>✓ Make sure you've distributed the physical chip first</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Pro Tips */}
                <AccordionItem value="pro-tips">
                  <AccordionTrigger className="text-base font-semibold hover:no-underline">💡 Pro Tips & Best Practices</AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <ul className="space-y-2 ml-3">
                      <li>✨ <strong>Test First:</strong> Always test writing to a chip before mass ordering</li>
                      <li>✨ <strong>Use Stickers:</strong> NFC sticker chips are easier to distribute than bare chips</li>
                      <li>✨ <strong>Embed in Products:</strong> Place chips inside product packaging for unboxing experiences</li>
                      <li>✨ <strong>Business Cards:</strong> Include chips in physical business cards for a premium touch</li>
                      <li>✨ <strong>Multiple Tags:</strong> Create different tags for different campaigns to track which performs best</li>
                      <li>✨ <strong>Target URLs:</strong> Point tags to different landing pages to measure campaign effectiveness</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </motion.div>
        </div>
        </div>
      </div>
    </div>
  );
}
