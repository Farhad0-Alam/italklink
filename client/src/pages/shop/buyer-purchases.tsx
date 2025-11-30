import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";
import type { ShopOrder } from "@shared/schema";

export default function BuyerPurchases() {
  const { data: orders, isLoading, error } = useQuery<ShopOrder[]>({
    queryKey: ["/api/shop/buyer/orders"],
  });

  if (isLoading) return <LoadingSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load your purchases</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-slate-900 dark:to-purple-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            My Purchases
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage your downloaded digital products
          </p>
        </div>

        {!orders || orders.length === 0 ? (
          <Card className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700">
            <CardContent className="pt-12 pb-12 text-center">
              <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                You haven't purchased any digital products yet
              </p>
              <Button className="mt-4" variant="outline">
                Browse the shop
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {orders.map((order) => (
              <Card
                key={order.id}
                className="bg-white dark:bg-slate-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <div className="flex-1">
                    <CardTitle className="text-lg">
                      Product #{order.id.slice(0, 8)}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Purchased on {formatDate(new Date(order.createdAt))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">
                      ${(order.amount / 100).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        order.paymentStatus === 'completed'
                          ? 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200'
                          : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Buyer Email: {order.buyerEmail}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      disabled={order.paymentStatus !== 'completed'}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
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
