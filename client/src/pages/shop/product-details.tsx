import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Download, ShoppingCart, AlertCircle, Package, Star, Heart, Share2, Shield, Truck, RotateCcw, MessageCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import type { DigitalProduct } from "@shared/schema";

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  // Fetch product
  const { data: product, isLoading, error } = useQuery<DigitalProduct>({
    queryKey: ["/api/shop/product", slug],
  });

  // Fetch seller profile
  const { data: sellerResponse } = useQuery({
    queryKey: ["/api/shop/seller", product?.sellerId],
    enabled: !!product?.sellerId,
  });
  const seller = sellerResponse?.data;

  // Fetch reviews
  const { data: reviewsResponse } = useQuery({
    queryKey: ["/api/shop/product", slug, "reviews"],
    enabled: !!slug,
  });
  const reviews = reviewsResponse?.data || [];

  // Fetch related products
  const { data: relatedResponse } = useQuery({
    queryKey: ["/api/shop/product", slug, "related"],
    enabled: !!slug,
  });
  const relatedProducts = relatedResponse?.data || [];

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

  // Safe numeric values
  const price = product.price || 0;
  const discountPrice = product.discountPrice || 0;
  const purchases = product.purchases || 0;
  const views = product.views || 0;
  const rating = product.rating || 0;
  const reviewCount = product.reviewCount || 0;

  // Image gallery
  const images = [
    product.thumbnailUrl || "",
    ...(Array.isArray(product.previewImages) ? product.previewImages : [])
  ].filter(Boolean);

  const currentImage = images[mainImage] || (
    <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
      <Package className="h-24 w-24 text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-1">
            {/* Main Image */}
            <div className="mb-4 bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-square flex items-center justify-center">
              {typeof currentImage === "string" ? (
                <img src={currentImage} alt={product.title} className="w-full h-full object-cover" />
              ) : (
                currentImage
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setMainImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      mainImage === idx
                        ? "border-blue-600"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Center: Product Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="inline-block px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-sm font-medium mb-3">
                {product.category}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {product.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">{product.shortDescription}</p>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round((rating / 100) * 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {(rating / 100).toFixed(1)}
                  </span>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {reviewCount} reviews • {purchases} sold
                </span>
              </div>
            </div>

            {/* Pricing Section */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Price */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Price</p>
                    {discountPrice ? (
                      <div className="flex items-center gap-4">
                        <span className="text-5xl font-bold text-emerald-600">
                          ${(discountPrice / 100).toFixed(2)}
                        </span>
                        <div>
                          <span className="text-2xl text-gray-400 line-through block">
                            ${(price / 100).toFixed(2)}
                          </span>
                          <span className="text-sm font-bold bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-200 px-2 py-1 rounded inline-block mt-1">
                            Save {discountPercent}%
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-5xl font-bold text-emerald-600">
                        ${(price / 100).toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Quantity */}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Quantity</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-slate-700 dark:text-white"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-3 pt-4">
                    <Button size="lg" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg h-12">
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </Button>
                    <div className="flex gap-3">
                      <Button variant="outline" size="lg" className="flex-1 rounded-lg h-12">
                        <Heart className="w-5 h-5 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="lg" className="flex-1 rounded-lg h-12">
                        <Share2 className="w-5 h-5 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Guarantees */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">Buyer Protection</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Money back guarantee</p>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">Instant Delivery</p>
                  <p className="text-gray-600 dark:text-gray-400 text-xs">Digital files available</p>
                </div>
              </div>
            </div>

            {/* File Information */}
            <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Download className="w-5 h-5" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Format: <span className="font-medium text-gray-900 dark:text-white">{product.fileType?.toUpperCase() || "Digital"}</span>
                  </p>
                </div>
                {product.fileSize && (
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Size: <span className="font-medium text-gray-900 dark:text-white">{(product.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Description Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About this product</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                {product.description}
              </p>
            </div>

            {/* Seller Profile - Dynamic from DB */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 h-fit">
              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Seller</h3>
              {seller ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    {seller.avatar ? (
                      <img src={seller.avatar} alt={seller.name} className="w-12 h-12 rounded-full" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
                    )}
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{seller.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.round(seller.rating) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        ))}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">{seller.rating} ({reviewCount} reviews)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Positive reviews</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{seller.positiveReviews}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Response time</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{seller.responseTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Products sold</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{seller.productsSold}+</span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Seller
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">Loading seller info...</p>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section - Dynamic from DB */}
        <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl p-8 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews ({reviewCount})</h2>
          
          {reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review: any, idx: number) => (
                <div key={idx} className="pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0">
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900 dark:text-white">{review.buyerName}</p>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 dark:text-gray-400">No reviews yet. Be the first to review this product!</p>
          )}
        </div>

        {/* Related Products - Dynamic from DB */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">You may also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((prod: DigitalProduct) => (
                <div
                  key={prod.id}
                  onClick={() => setLocation(`/shop/product/${prod.slug}`)}
                  className="bg-white dark:bg-slate-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition cursor-pointer"
                >
                  <div className="h-48 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                    {prod.thumbnailUrl ? (
                      <img src={prod.thumbnailUrl} alt={prod.title} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-12 h-12 text-white" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 mb-2">{prod.title}</h3>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.round((prod.rating || 0) / 100 * 5) ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400">({prod.reviewCount})</span>
                    </div>
                    <p className="font-bold text-emerald-600">
                      ${(((prod.discountPrice || prod.price) || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
