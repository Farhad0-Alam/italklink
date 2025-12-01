import { useQuery, useMutation } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export function ProductVariations() {
  const { productId } = useParams<{ productId: string }>();
  const { toast } = useToast();

  const { data: variations = [], isLoading: variationsLoading } = useQuery({
    queryKey: ['/api/variations/product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/variations/product/${productId}`);
      if (!response.ok) return [];
      return response.json().then(r => r.data);
    },
    enabled: !!productId,
  });

  const { data: options = [], isLoading: optionsLoading } = useQuery({
    queryKey: ['/api/variations/options/product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/variations/options/product/${productId}`);
      if (!response.ok) return [];
      return response.json().then(r => r.data);
    },
    enabled: !!productId,
  });

  const deleteVariationMutation = useMutation({
    mutationFn: (variationId: string) => apiRequest('DELETE', `/api/variations/${variationId}`, {}),
    onSuccess: () => {
      toast({ title: 'Variation deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/variations/product', productId] });
    },
  });

  const deleteOptionMutation = useMutation({
    mutationFn: (optionId: string) => apiRequest('DELETE', `/api/variations/options/${optionId}`, {}),
    onSuccess: () => {
      toast({ title: 'Option deleted' });
      queryClient.invalidateQueries({ queryKey: ['/api/variations/options/product', productId] });
    },
  });

  if (variationsLoading || optionsLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Product Variations</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Manage product variants, options, and pricing</p>
      </div>

      <Tabs defaultValue="options" className="w-full">
        <TabsList>
          <TabsTrigger value="options">Variant Options</TabsTrigger>
          <TabsTrigger value="variations">Variations</TabsTrigger>
        </TabsList>

        {/* Variant Options Tab */}
        <TabsContent value="options" className="space-y-4">
          <Button className="gap-2" data-testid="button-add-option">
            <Plus className="w-4 h-4" />
            Add Option
          </Button>

          {options.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No variant options yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {options.map((option: any) => (
                <Card key={option.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-semibold">{option.name}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {option.values?.map((val: string) => (
                            <Badge key={val} variant="secondary">{val}</Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteOptionMutation.mutate(option.id)}
                        data-testid={`button-delete-option-${option.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Variations Tab */}
        <TabsContent value="variations" className="space-y-4">
          <Button className="gap-2" data-testid="button-add-variation">
            <Plus className="w-4 h-4" />
            Add Variation
          </Button>

          {variations.length === 0 ? (
            <Card>
              <CardContent className="pt-12 text-center">
                <p className="text-gray-600 dark:text-gray-400">No variations yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {variations.map((variation: any) => (
                <Card key={variation.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-semibold">{variation.title}</p>
                        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 mt-2">
                          <span>SKU: {variation.sku}</span>
                          <span>${(variation.price / 100).toFixed(2)}</span>
                          <span>Stock: {variation.stock}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteVariationMutation.mutate(variation.id)}
                        data-testid={`button-delete-variation-${variation.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
