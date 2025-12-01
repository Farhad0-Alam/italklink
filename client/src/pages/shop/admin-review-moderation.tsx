import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Star, AlertTriangle, Check, X, MessageSquare, ArrowLeft, User } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'wouter';

export function AdminReviewModeration() {
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/review-moderation/pending'],
    select: (response: any) => Array.isArray(response) ? response : (response?.data || []),
  });

  const approveMutation = useMutation({
    mutationFn: (reviewId: string) => apiRequest('POST', `/api/review-moderation/${reviewId}/approve`, {}),
    onSuccess: () => {
      toast({ title: 'Review approved!' });
      queryClient.invalidateQueries({ queryKey: ['/api/review-moderation/pending'] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      apiRequest('POST', `/api/review-moderation/${reviewId}/reject`, { reason }),
    onSuccess: () => {
      toast({ title: 'Review rejected!' });
      setShowRejectDialog(false);
      setRejectionReason('');
      queryClient.invalidateQueries({ queryKey: ['/api/review-moderation/pending'] });
    },
  });

  const flagMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) =>
      apiRequest('POST', `/api/review-moderation/${reviewId}/flag`, { reason }),
    onSuccess: () => {
      toast({ title: 'Review flagged for review!' });
      queryClient.invalidateQueries({ queryKey: ['/api/review-moderation/pending'] });
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-amber-950 dark:to-orange-950 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-12 h-12 text-amber-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600 dark:text-gray-400">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-orange-50 dark:from-slate-900 dark:via-amber-950 dark:to-orange-950 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <Link href="/admin" className="flex items-center gap-2 text-amber-600 hover:text-amber-700 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Star className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Review Moderation
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {reviews.length} review{reviews.length !== 1 ? 's' : ''} pending approval
              </p>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <Card className="border-0 shadow-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur">
            <CardContent className="pt-12 pb-12 text-center">
              <Check className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                All reviews moderated!
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                There are no pending reviews to moderate.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <Card 
                key={review.id}
                className={`border-0 shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur hover:shadow-xl transition-shadow overflow-hidden ${
                  review.flagReason ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className={`absolute top-0 left-0 w-1 h-full ${
                  review.flagReason ? 'bg-gradient-to-b from-red-400 to-red-600' : 'bg-gradient-to-b from-amber-400 to-amber-600'
                }`}></div>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                            />
                          ))}
                        </div>
                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                          {review.title}
                        </CardTitle>
                      </div>
                      <CardDescription className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {review.buyer?.firstName || 'Anonymous'} • {new Date(review.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {review.flagReason && (
                      <Badge variant="destructive" className="flex gap-1 whitespace-nowrap">
                        <AlertTriangle className="w-3 h-3" />
                        Flagged
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    {review.comment}
                  </p>

                  {review.flagReason && (
                    <div className="bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/40 dark:to-red-950/20 p-4 rounded-lg border-l-4 border-red-500">
                      <p className="text-sm font-semibold text-red-700 dark:text-red-300 mb-1">⚠️ Flag Reason:</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{review.flagReason}</p>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => approveMutation.mutate(review.id)}
                      disabled={approveMutation.isPending}
                      className="flex items-center gap-2 flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                      data-testid={`button-approve-review-${review.id}`}
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedReview(review);
                        setShowRejectDialog(true);
                      }}
                      className="flex items-center gap-2 flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
                      data-testid={`button-reject-review-${review.id}`}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent className="border-0 shadow-xl bg-white/95 dark:bg-slate-800/95 backdrop-blur">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-white">
              Reject Review
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Provide a reason for rejecting this review. This helps sellers understand why their review was rejected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rejection Reason</label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (spam, inappropriate, fake review, offensive language, etc.)"
              className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel className="border-gray-200 dark:border-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedReview && rejectionReason) {
                  rejectMutation.mutate({ reviewId: selectedReview.id, reason: rejectionReason });
                }
              }}
              disabled={!rejectionReason || rejectMutation.isPending}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              Reject Review
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
