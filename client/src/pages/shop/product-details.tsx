import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Download, ShoppingCart, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { DigitalProduct } from "@shared/schema";

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();

  const { data: product, isLoading, error } = useQuery<DigitalProduct>({
    queryKey: ["/api/shop/product", slug],
  });

  if (isLoading) return <LoadingSkeleton />;

  if (error || !product) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Product not found</AlertDescription>
      </Alert>
    );
  }

  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  // Safe numeric values with defaults
  const price = product.price || 0;
  const discountPrice = product.discountPrice || 0;
  const purchases = product.purchases || 0;
  const views = product.views || 0;
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-purple-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="w-full h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl shadow-lg flex items-center justify-center overflow-hidden">
              {product.thumbnailUrl ? (
                <img
                  src={product.thumbnailUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white text-center">
                  <Package className="h-16 w-16 mx-auto mb-2" />
                  <p className="text-sm">{product.title}</p>
                </div>
              )}
            </div>
            {product.previewImages && Array.isArray(product.previewImages) && product.previewImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {(product.previewImages as string[]).slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-full text-sm font-medium mb-3">
                {product.category}
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
                {product.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{product.shortDescription}</p>
            </div>

            {/* Pricing */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Price</p>
                  {discountPrice ? (
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-bold text-emerald-600">
                        ${(discountPrice / 100).toFixed(2)}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        ${(price / 100).toFixed(2)}
                      </span>
                      <span className="text-sm font-bold bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 px-2 py-1 rounded">
                        Save {discountPercent}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-4xl font-bold text-emerald-600">
                      ${(price / 100).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-blue-600">{purchases}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Purchases</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-purple-600">{views}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Views</p>
                </CardContent>
              </Card>
              <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <p className="text-3xl font-bold text-amber-600">⭐ {(rating / 100).toFixed(1)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{reviewCount} reviews</p>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="font-bold text-lg mb-3">About this product</h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                {product.description}
              </p>
            </div>

            {/* File Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <Download className="w-5 h-5 text-blue-600" />
                <span className="font-semibold">File Information</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Type: <span className="font-medium">{product.fileType?.toUpperCase() || "Digital"}</span>
              </p>
              {product.fileSize && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Size: <span className="font-medium">{(product.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3">
              <Button
                size="lg"
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Buy Now
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 mr-2" />
                Report
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
