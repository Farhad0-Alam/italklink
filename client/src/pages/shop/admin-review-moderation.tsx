import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Star, AlertTriangle, Check, X } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export function AdminReviewModeration() {
  const { toast } = useToast();
  const [selectedReview, setSelectedReview] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['/api/review-moderation/pending'],
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
    return <div className="p-6 text-center">Loading reviews...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Review Moderation</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {reviews.length} review{reviews.length !== 1 ? 's' : ''} pending approval
        </p>
      </div>

      {reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">All reviews have been moderated!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <Card key={review.id} className={review.flagReason ? 'border-red-500' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <CardTitle className="text-lg">{review.title}</CardTitle>
                    </div>
                    <CardDescription className="mt-2">
                      By {review.buyer?.firstName || 'Anonymous'} on {new Date(review.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  {review.flagReason && (
                    <Badge variant="destructive" className="flex gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      Flagged
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{review.comment}</p>

                {review.flagReason && (
                  <div className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800">
                    <p className="text-sm font-semibold text-red-700 dark:text-red-300">Flag Reason:</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{review.flagReason}</p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => approveMutation.mutate(review.id)}
                    disabled={approveMutation.isPending}
                    className="flex gap-1"
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
                    className="flex gap-1"
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

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Review</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason (spam, inappropriate, fake review, etc.)"
              className="w-full p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedReview && rejectionReason) {
                  rejectMutation.mutate({ reviewId: selectedReview.id, reason: rejectionReason });
                }
              }}
              disabled={!rejectionReason || rejectMutation.isPending}
            >
              Reject
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
