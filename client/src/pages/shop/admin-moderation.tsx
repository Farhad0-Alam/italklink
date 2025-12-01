import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { CheckCircle, XCircle, AlertCircle, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { DigitalProduct } from "@shared/schema";

export default function AdminShopModeration() {
  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: DigitalProduct[] }>({
    queryKey: ["/api/shop/admin/products"],
  });

  const products = response?.data;

  const approveMutation = useMutation({
    mutationFn: async (productId: string) =>
      apiRequest("POST", `/api/shop/admin/products/${productId}/approve`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shop/admin/products"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (productId: string) =>
      apiRequest("POST", `/api/shop/admin/products/${productId}/reject`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/shop/admin/products"] }),
  });

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load products for moderation</AlertDescription>
      </Alert>
    );
  }

  const pendingProducts = products?.filter(p => p.status === 'draft') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Shop Moderation
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Review and approve digital products for the marketplace
            </p>
          </div>
        </div>

        {pendingProducts.length === 0 ? (
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                All products are approved! Nothing to moderate.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pendingProducts.map((product) => (
              <Card
                key={product.id}
                className="bg-white dark:bg-slate-800 border-yellow-200 dark:border-yellow-900 border-2"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{product.title}</CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {product.shortDescription}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 rounded-full text-xs font-medium">
                      Pending Review
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category: {product.category}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Price: ${(product.price / 100).toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        File Type: {product.fileType?.toUpperCase()}
                      </p>
                      {product.fileSize && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Size: {(product.fileSize / 1024 / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex gap-3 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => rejectMutation.mutate(product.id)}
                      disabled={rejectMutation.isPending}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => approveMutation.mutate(product.id)}
                      disabled={approveMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
