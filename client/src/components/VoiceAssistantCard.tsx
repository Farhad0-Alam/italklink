'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface VoiceAssistantCardProps {
  businessName?: string;
  agentName?: string;
  primaryColor?: string;
  knowledgeBase?: any;
  isEditing?: boolean;
  cardId?: string;
}

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export function VoiceAssistantCard({
  businessName = 'Our Business',
  agentName = 'AI Assistant',
  primaryColor = '#8b5cf6',
  knowledgeBase,
  isEditing = false,
  cardId
}: VoiceAssistantCardProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [hasMicSupport, setHasMicSupport] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  const { toast } = useToast();

  // Check browser support & handle unmount
  useEffect(() => {
    isMountedRef.current = true;

    if (typeof window === 'undefined') return;

    const hasMediaDevices =
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      !!navigator.mediaDevices.getUserMedia;

    const hasMediaRecorder =
      typeof window !== 'undefined' &&
      typeof (window as any).MediaRecorder !== 'undefined';

    if (!hasMediaDevices || !hasMediaRecorder) {
      setHasMicSupport(false);
      toast({
        title: 'Not Supported',
        description:
          'Your browser does not support microphone recording. Please use the latest Chrome, Edge, or Firefox over HTTPS.',
        variant: 'destructive'
      });
    }

    return () => {
      isMountedRef.current = false;

      // Stop recording if component unmounts
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: convert Blob → base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (!reader.result) {
          reject(new Error('Failed to read audio data.'));
        } else {
          resolve(reader.result as string);
        }
      };
      reader.onerror = () => reject(reader.error || new Error('FileReader error'));
      reader.readAsDataURL(blob);
    });
  };

  const startListening = async () => {
    if (!hasMicSupport) return;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      toast({
        title: 'Microphone Not Available',
        description: 'Navigator media devices are not available in this environment.',
        variant: 'destructive'
      });
      return;
    }

    try {
      // This will trigger the browser permission popup (top-left) on first use
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const options: MediaRecorderOptions = { mimeType: 'audio/webm' };
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: 'Recording Error',
          description: 'There was a problem recording audio. Please try again.',
          variant: 'destructive'
        });
        setIsListening(false);
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
        } finally {
          // Always stop tracks
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      };

      recorder.start();
      setIsListening(true);
      setTranscript('Connecting to AI voice agent...');
    } catch (error: any) {
      console.error('Microphone access error:', error);

      let description = 'Unable to access microphone. Please check permissions and HTTPS.';
      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        description = 'Microphone permission was denied. Please allow access in your browser settings and try again.';
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        description = 'No microphone device was found. Please connect a microphone and try again.';
      }

      toast({
        title: 'Microphone Error',
        description,
        variant: 'destructive'
      });
    }
  };

  const stopListening = () => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    if (!isMountedRef.current) return;

    setIsProcessing(true);

    try {
      const base64Audio = await blobToBase64(audioBlob);

      const response = await apiRequest<{
        transcript: string;
        response: string;
        audioUrl?: string;
      }>('POST', '/api/voice/process', {
        audio: base64Audio,
        cardId,
        knowledgeBase,
        messages
      });

      if (response?.transcript) {
        const userMsgText = response.transcript;
        const aiMsgText = response.response;

        setMessages((prev) => [
          ...prev,
          { role: 'user', content: userMsgText },
          { role: 'assistant', content: aiMsgText }
        ]);

        setTranscript((prev) => {
          const isInitial = prev === 'Connecting to AI voice agent...';
          const base = isInitial ? '' : prev;
          const userMsg = `You: ${userMsgText}`;
          const aiMsg = `AI: ${aiMsgText}`;
          const combined = [base, userMsg, aiMsg].filter(Boolean).join('\n\n');
          return combined.trim();
        });

        // Play TTS audio if backend sends URL
        if (response.audioUrl) {
          try {
            const audio = new Audio(response.audioUrl);
            await audio.play();
          } catch (playError) {
            console.error('Audio playback error:', playError);
          }
        }
      } else {
        toast({
          title: 'No Response',
          description: 'The AI did not return a response. Please try again.',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process audio. Please try again.',
        variant: 'destructive'
      });
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-12 bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Talk to our voice assistant
        </h2>
        <p className="text-gray-600 text-base md:text-lg max-w-2xl mx-auto">
          Click &apos;Start&apos; and speak directly with our AI agent for {businessName}
        </p>
        <p className="text-xs text-gray-400 mt-2">
          Make sure you&apos;re on HTTPS and allow microphone access in your browser.
        </p>
      </div>

      {/* Microphone Button */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing || !hasMicSupport}
          className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
          style={{
            background: isListening
              ? 'linear-gradient(135deg, #ef4444, #dc2626)'
              : `linear-gradient(135deg, ${primaryColor}, #a78bfa)`
          }}
        >
          <svg
            className="w-16 h-16 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        </button>

        {/* Stop Button */}
        {isListening && (
          <Button
            onClick={stopListening}
            className="px-8 py-3 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              border: 'none'
            }}
          >
            <svg
              className="w-5 h-5 mr-2 inline-block"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <rect x="6" y="6" width="8" height="8" rx="1" />
            </svg>
            Stop
          </Button>
        )}

        {isProcessing && (
          <div className="text-gray-600 text-sm animate-pulse">
            Processing your message...
          </div>
        )}

        {!hasMicSupport && (
          <div className="text-red-500 text-xs text-center max-w-xs">
            Your browser or current context does not support microphone recording. Please
            try using the latest Chrome/Edge/Firefox on HTTPS.
          </div>
        )}
      </div>

      {/* Transcript Section */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Transcript:</h3>
        <div
          className="bg-white rounded-lg p-6 min-h-[200px] border border-gray-200 shadow-sm"
          style={{
            maxHeight: '400px',
            overflowY: 'auto'
          }}
        >
          {transcript ? (
            <div className="space-y-4 whitespace-pre-line">
              {transcript.split('\n\n').map((line, idx) => {
                if (!line.trim()) return null;
                const isUser = line.startsWith('You:');
                const isAI = line.startsWith('AI:');

                return (
                  <p
                    key={idx}
                    className={`text-base leading-relaxed ${
                      isUser
                        ? 'text-gray-900 font-medium'
                        : isAI
                        ? 'text-gray-700'
                        : 'text-gray-600'
                    }`}
                  >
                    {line}
                  </p>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-base italic">
              Your conversation will appear here...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
