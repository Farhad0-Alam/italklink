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
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  
  const { toast } = useToast();

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up media recorder
      mediaRecorder.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      audioChunks.current = [];
      
      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };
      
      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.current.start();
      setIsListening(true);
      setTranscript('Connecting to AI voice agent...');
    } catch (error) {
      console.error('Microphone access error:', error);
      toast({
        title: 'Microphone Error',
        description: 'Unable to access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopListening = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
      mediaRecorder.current.stop();
      setIsListening(false);
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Send to backend for processing
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
        
        if (response.transcript) {
          const userMsg = `You: ${response.transcript}`;
          const aiMsg = `AI: ${response.response}`;
          
          setMessages(prev => [
            ...prev,
            { role: 'user', content: response.transcript },
            { role: 'assistant', content: response.response }
          ]);
          
          setTranscript(prev => {
            const current = prev === 'Connecting to AI voice agent...' ? '' : prev;
            return `${current}\n\n${userMsg}\n\n${aiMsg}`.trim();
          });
          
          // Play audio response if available
          if (response.audioUrl) {
            const audio = new Audio(response.audioUrl);
            await audio.play();
          }
        }
      };
    } catch (error) {
      console.error('Audio processing error:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process audio. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
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
          Click 'Start' and speak directly with our AI agent for {businessName}
        </p>
      </div>

      {/* Microphone Button */}
      <div className="flex flex-col items-center gap-6 mb-12">
        <button
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
          className="w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
          style={{
            background: isListening 
              ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
              : `linear-gradient(135deg, ${primaryColor}, #a78bfa)`,
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
            <div className="space-y-4">
              {transcript.split('\n\n').map((line, idx) => {
                if (!line.trim()) return null;
                const isUser = line.startsWith('You:');
                const isAI = line.startsWith('AI:');
                
                return (
                  <p 
                    key={idx} 
                    className={`text-base leading-relaxed ${
                      isUser ? 'text-gray-900 font-medium' : 
                      isAI ? 'text-gray-700' : 
                      'text-gray-600'
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
