import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Plus, X, Search, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

const createCollectionSchema = z.object({
  name: z.string().min(1, 'Collection name is required').max(100, 'Name too long'),
  description: z.string().max(500, 'Description too long').optional(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  templateIds: z.array(z.string()).min(1, 'At least one template is required'),
});

type CreateCollectionForm = z.infer<typeof createCollectionSchema>;

interface Template {
  id: string;
  name: string;
  description?: string;
  previewImage?: string;
  templateData: any;
}

interface CreateCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateCollectionModal({ open, onOpenChange, onSuccess }: CreateCollectionModalProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newTag, setNewTag] = useState('');
  const { toast } = useToast();

  const form = useForm<CreateCollectionForm>({
    resolver: zodResolver(createCollectionSchema),
    defaultValues: {
      name: '',
      description: '',
      isPublic: false,
      tags: [],
      templateIds: [],
    },
  });

  // Fetch available templates
  const { data: templates, isLoading: templatesLoading } = useQuery<Template[]>({
    queryKey: ['/api/admin/templates'],
    enabled: open,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCollectionForm) => {
      const response = await fetch('/api/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create collection');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Template collection created successfully",
      });
      form.reset();
      setSelectedTemplates([]);
      setNewTag('');
      onOpenChange(false);
      onSuccess();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create collection",
        variant: "destructive",
      });
    },
  });

  const handleTemplateToggle = (templateId: string) => {
    const newSelection = selectedTemplates.includes(templateId)
      ? selectedTemplates.filter(id => id !== templateId)
      : [...selectedTemplates, templateId];
    
    setSelectedTemplates(newSelection);
    form.setValue('templateIds', newSelection);
  };

  const handleAddTag = () => {
    if (newTag && !form.getValues('tags').includes(newTag)) {
      const currentTags = form.getValues('tags');
      const newTags = [...currentTags, newTag];
      form.setValue('tags', newTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags');
    const newTags = currentTags.filter(tag => tag !== tagToRemove);
    form.setValue('tags', newTags);
  };

  const onSubmit = (data: CreateCollectionForm) => {
    createMutation.mutate({
      ...data,
      templateIds: selectedTemplates,
    });
  };

  const filteredTemplates = (templates as Template[] || []).filter((template: Template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create Template Collection</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Collection Details */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Collection Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter collection name..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe your collection..." 
                          rows={3}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Public Collection</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Make this collection visible to everyone
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    />
                    <Button type="button" variant="outline" onClick={handleAddTag} disabled={!newTag}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {form.watch('tags').length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {form.watch('tags').map((tag) => (
                        <Badge key={tag} variant="secondary" className="flex items-center space-x-1">
                          <span>{tag}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Template Selection */}
              <div className="space-y-4">
                <div>
                  <Label>Select Templates</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose templates to include in your collection
                  </p>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <ScrollArea className="h-80 border rounded-md">
                  <div className="p-4 space-y-2">
                    {templatesLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-16 bg-muted rounded-md"></div>
                          </div>
                        ))}
                      </div>
                    ) : filteredTemplates.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        No templates found
                      </p>
                    ) : (
                      filteredTemplates.map((template: Template) => (
                        <Card 
                          key={template.id}
                          className={`cursor-pointer transition-colors ${
                            selectedTemplates.includes(template.id) 
                              ? 'ring-2 ring-primary bg-primary/5' 
                              : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleTemplateToggle(template.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-center space-x-3">
                              <div className={`flex items-center justify-center w-5 h-5 rounded border-2 ${
                                selectedTemplates.includes(template.id)
                                  ? 'bg-primary border-primary text-primary-foreground'
                                  : 'border-muted-foreground'
                              }`}>
                                {selectedTemplates.includes(template.id) && (
                                  <Check className="h-3 w-3" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{template.name}</h4>
                                {template.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1">
                                    {template.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </ScrollArea>

                {selectedTemplates.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedTemplates.length} template{selectedTemplates.length !== 1 ? 's' : ''} selected
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || selectedTemplates.length === 0}
              >
                {createMutation.isPending ? 'Creating...' : 'Create Collection'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}