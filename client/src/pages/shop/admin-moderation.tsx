import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { CheckCircle, XCircle, AlertCircle, Shield, Package, DollarSign, FileText, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import type { DigitalProduct } from "@shared/schema";

export default function AdminShopModeration() {
  const { data: response, isLoading, error } = useQuery<{ success: boolean; data: DigitalProduct[] }>({
    queryKey: ["/shop/admin/products"],
  });

  const products = response?.data;

  const approveMutation = useMutation({
    mutationFn: async (productId: string) =>
      apiRequest("PATCH", `/shop/admin/products/${productId}/status`, { status: 'approved' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/shop/admin/products"] }),
  });

  const rejectMutation = useMutation({
    mutationFn: async (productId: string) =>
      apiRequest("PATCH", `/shop/admin/products/${productId}/status`, { status: 'rejected' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/shop/admin/products"] }),
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-blue-950 dark:to-cyan-950 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Product Moderation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Review and approve digital products for the marketplace
              </p>
            </div>
          </div>
        </div>

        {pendingProducts.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                All products approved!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no pending products to moderate.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingProducts.map((product) => (
              <Card
                key={product.id}
                className="border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur hover:shadow-xl transition-shadow overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <CardTitle className="text-xl text-gray-900 dark:text-white">
                          {product.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="text-base">
                        {product.shortDescription}
                      </CardDescription>
                    </div>
                    <span className="px-3 py-1 bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 text-yellow-700 dark:text-yellow-300 rounded-full text-xs font-semibold whitespace-nowrap">
                      Pending Review
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-4 gap-4">
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{product.category}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Price</p>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <p className="font-semibold text-gray-900 dark:text-white">{(product.price / 100).toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">File Type</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{product.fileType?.toUpperCase()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Size</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {product.fileSize ? `${(product.fileSize / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {product.description}
                  </p>

                  <div className="flex gap-3 justify-end pt-2">
                    <Button
                      variant="outline"
                      onClick={() => rejectMutation.mutate(product.id)}
                      disabled={rejectMutation.isPending}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate(product.id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
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
