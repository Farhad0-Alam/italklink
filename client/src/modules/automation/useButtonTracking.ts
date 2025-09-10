import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface TrackButtonInteractionParams {
  cardId: string;
  elementId: string;
  interactionType: 'click' | 'view' | 'download';
  buttonLabel: string;
  buttonAction: 'call' | 'email' | 'link' | 'download' | 'whatsapp';
  targetValue?: string;
}

interface TrackingResult {
  success: boolean;
  interactionId?: string;
  leadScore?: number;
  isRepeatVisitor?: boolean;
  error?: string;
}

export function useButtonTracking() {
  const { toast } = useToast();

  const trackInteraction = useCallback(async (params: TrackButtonInteractionParams): Promise<TrackingResult> => {
    try {
      const response = await fetch('/api/automation/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Tracking API error:', data);
        return {
          success: false,
          error: data.error || 'Failed to track interaction'
        };
      }

      // Optional: Show success feedback for high-value interactions
      if (data.leadScore >= 50) {
        toast({
          title: 'High-value interaction detected!',
          description: `Lead score: ${data.leadScore}${data.isRepeatVisitor ? ' (returning visitor)' : ''}`,
          duration: 3000,
        });
      }

      return {
        success: true,
        interactionId: data.interactionId,
        leadScore: data.leadScore,
        isRepeatVisitor: data.isRepeatVisitor
      };

    } catch (error: any) {
      console.error('Button tracking error:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }, [toast]);

  // Helper function to track button clicks
  const trackButtonClick = useCallback(async (
    cardId: string,
    elementId: string,
    buttonLabel: string,
    buttonAction: 'call' | 'email' | 'link' | 'download' | 'whatsapp',
    targetValue?: string
  ) => {
    return trackInteraction({
      cardId,
      elementId,
      interactionType: 'click',
      buttonLabel,
      buttonAction,
      targetValue
    });
  }, [trackInteraction]);

  // Helper function to track page views
  const trackPageView = useCallback(async (
    cardId: string,
    elementId: string = 'page',
    targetValue?: string
  ) => {
    return trackInteraction({
      cardId,
      elementId,
      interactionType: 'view',
      buttonLabel: 'Page View',
      buttonAction: 'link',
      targetValue
    });
  }, [trackInteraction]);

  // Helper function to track downloads
  const trackDownload = useCallback(async (
    cardId: string,
    elementId: string,
    fileName: string,
    downloadUrl?: string
  ) => {
    return trackInteraction({
      cardId,
      elementId,
      interactionType: 'download',
      buttonLabel: fileName,
      buttonAction: 'download',
      targetValue: downloadUrl
    });
  }, [trackInteraction]);

  return {
    trackInteraction,
    trackButtonClick,
    trackPageView,
    trackDownload
  };
}