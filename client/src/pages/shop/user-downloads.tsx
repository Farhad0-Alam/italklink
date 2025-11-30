import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Clock, AlertCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';

interface Download {
  id: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt: string;
  filePath: string;
  product?: { title: string };
}

export default function UserDownloads() {
  const { data: downloadsData, isLoading } = useQuery<{ success: boolean; data: Download[] }>({
    queryKey: ['/api/shop/user/downloads'],
  });

  const downloads = downloadsData?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-12">
      <div className="container mx-auto px-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <h1 className="text-3xl font-bold mb-8">My Downloads</h1>

        <div className="grid gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <Card key={i} className="h-24 animate-pulse" />)
          ) : downloads.length > 0 ? (
            downloads.map((d) => (
              <Card key={d.id} className="border-0 shadow-lg" data-testid={`download-item-${d.id}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Download className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{d.product?.title}</p>
                      <p className="text-sm text-gray-500">{d.downloadCount} of {d.maxDownloads} downloads</p>
                    </div>
                  </div>
                  {new Date(d.expiresAt) < new Date() ? (
                    <Badge variant="destructive">Expired</Badge>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <Clock className="h-4 w-4" />
                      Expires {new Date(d.expiresAt).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active downloads</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
