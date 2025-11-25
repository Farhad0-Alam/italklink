import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Bot, User, ExternalLink, X, Settings, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { URLManager } from '@/components/URLManager';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Typing animation component for loading state
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-400">Thinking</span>
      <span className="flex items-center gap-0.5">
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </span>
    </div>
  );
}

// Streaming text component - types out text character by character
interface StreamingTextProps {
  content: string;
  speed?: number;
}

function StreamingText({ content, speed = 20 }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < content.length) {
        setDisplayedText(content.substring(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [content, speed]);

  return <>{displayedText}</>;
}

interface Source {
  id: string;
  url: string;
  title: string;
  score: number;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  timestamp: Date;
  isStreaming?: boolean;
}

interface RAGResponse {
  answer: string;
  sources: Source[];
}

interface RAGChatBoxProps {
  isOpen: boolean;
  onClose: () => void;
  primaryColor?: string;
  isEditing?: boolean;
}

export function RAGChatBox({ isOpen, onClose, primaryColor = '#22c55e', isEditing = false }: RAGChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showKnowledgeConfig, setShowKnowledgeConfig] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isTTSLoading, setIsTTSLoading] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [autoMicrophoneEnabled, setAutoMicrophoneEnabled] = useState(() => {
    // Load from localStorage on mount
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('voiceAutoMicrophoneEnabled');
      return saved !== null ? saved === 'true' : true; // Default to true
    }
    return true;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Save auto-microphone preference to localStorage
  useEffect(() => {
    localStorage.setItem('voiceAutoMicrophoneEnabled', String(autoMicrophoneEnabled));
    console.log('[Voice Modal] Auto-microphone setting saved:', autoMicrophoneEnabled);
  }, [autoMicrophoneEnabled]);

  // Auto-start microphone after 2 seconds when Voice Modal opens (ChatGPT-style)
  useEffect(() => {
    if (!isVoiceModalOpen || !autoMicrophoneEnabled) return;

    console.log('[Voice Modal] Opening - will auto-start microphone in 2 seconds...');
    
    const timeoutId = setTimeout(() => {
      if (isMountedRef.current && isVoiceModalOpen && autoMicrophoneEnabled) {
        console.log('[Voice Modal] Auto-starting microphone after 2 second delay...');
        startListening();
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [isVoiceModalOpen, autoMicrophoneEnabled]);

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      console.log('[blobToBase64] Starting conversion:', {
        blobSize: blob.size,
        blobType: blob.type,
      });
      
      const reader = new FileReader();
      
      reader.onloadstart = () => {
        console.log('[blobToBase64] FileReader loading started');
      };
      
      reader.onprogress = (event) => {
        console.log('[blobToBase64] Progress:', {
          loaded: event.loaded,
          total: event.total,
          percent: ((event.loaded / event.total) * 100).toFixed(2) + '%',
        });
      };
      
      reader.onloadend = () => {
        if (!reader.result) {
          console.error('[blobToBase64] Result is empty!');
          reject(new Error('Failed to read audio data.'));
        } else {
          const dataUrl = reader.result as string;
          console.log('[blobToBase64] Conversion success:', {
            resultLength: dataUrl.length,
            resultPrefix: dataUrl.substring(0, 50),
            isDataUrl: dataUrl.startsWith('data:'),
          });
          resolve(dataUrl);
        }
      };
      
      reader.onerror = () => {
        console.error('[blobToBase64] FileReader error:', reader.error);
        reject(reader.error || new Error('FileReader error'));
      };
      
      reader.onabort = () => {
        console.error('[blobToBase64] FileReader aborted');
        reject(new Error('FileReader aborted'));
      };
      
      console.log('[blobToBase64] Calling readAsDataURL');
      reader.readAsDataURL(blob);
    });

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userMessage.content,
          topK: 5,
        }),
      });

      const result: RAGResponse = await response.json();

      if (response.ok) {
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: result.answer,
          sources: result.sources,
          timestamp: new Date(),
          isStreaming: true,
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(result.answer || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: 'Failed to get AI response. Please try again.',
        variant: 'destructive',
      });
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startListening = async () => {
    if (typeof window === 'undefined') return;

    console.log('[startListening] Starting microphone request...');
    console.log('[startListening] Window location:', {
      protocol: window.location.protocol,
      hostname: window.location.hostname,
      href: window.location.href,
    });
    console.log('[startListening] isSecureContext:', window.isSecureContext);

    // Check if browser supports mediaDevices
    if (!navigator.mediaDevices?.getUserMedia) {
      console.error('[startListening] getUserMedia not supported');
      toast({
        title: 'Microphone Not Supported',
        description: 'Your browser does not support microphone access.',
        variant: 'destructive',
      });
      return;
    }

    // Check if running on insecure context (not HTTPS)
    if ('isSecureContext' in window && !window.isSecureContext) {
      console.error('[startListening] Not secure context');
      toast({
        title: 'Secure Connection Required',
        description: 'Microphone access requires HTTPS. Please access via a secure connection.',
        variant: 'destructive',
      });
      return;
    }

    // Additional check for non-HTTPS in non-localhost
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      console.error('[startListening] Not HTTPS connection');
      toast({
        title: 'Secure Connection Required',
        description: 'Microphone access requires HTTPS. Please use a secure connection.',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('[startListening] Calling navigator.mediaDevices.getUserMedia...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      console.log('[startListening] ✅ Stream obtained successfully:', {
        audioTracks: stream.getAudioTracks().length,
        videoTracks: stream.getVideoTracks().length,
      });
      
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      console.log('[startListening] MediaRecorder created:', { mimeType: 'audio/webm' });

      recorder.ondataavailable = (event) => {
        console.log('[MediaRecorder] ondataavailable:', { dataSize: event.data.size });
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        console.log('[MediaRecorder] onstop - processing audio chunks');
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          console.log('[MediaRecorder] Audio blob created:', { size: audioBlob.size, type: audioBlob.type });
          await processAudio(audioBlob);
        } finally {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => {
              console.log('[MediaRecorder] Stopping track:', t.kind);
              t.stop();
            });
            streamRef.current = null;
          }
        }
      };

      console.log('[startListening] Starting recorder...');
      recorder.start();
      setIsListening(true);
      console.log('[startListening] ✅ Recording started');
    } catch (error: any) {
      console.error('[startListening] ❌ DETAILED ERROR INFO:', {
        errorType: typeof error,
        errorString: String(error),
        errorName: error?.name,
        errorMessage: error?.message,
        errorCode: error?.code,
        errorStack: error?.stack,
        errorKeys: error ? Object.keys(error) : [],
        fullError: error,
      });
      
      // Detailed error handling
      let errorTitle = 'Microphone Error';
      let errorDescription = 'Unable to access microphone.';

      if (error?.name === 'NotAllowedError' || error?.name === 'PermissionDeniedError') {
        errorTitle = 'Microphone Permission Denied';
        errorDescription = 'Permission was denied. Please check browser permissions or reload the page and try again.';
      } else if (error?.name === 'NotFoundError' || error?.name === 'DevicesNotFoundError') {
        errorTitle = 'No Microphone Found';
        errorDescription = 'No microphone device was detected. Please check your hardware.';
      } else if (error?.name === 'NotSupportedError') {
        errorTitle = 'Not Supported';
        errorDescription = 'Your browser does not support microphone access.';
      } else if (error?.name === 'SecurityError') {
        errorTitle = 'Security Error - Permissions Policy';
        errorDescription = 'Microphone access is blocked by browser security policy. This may require HTTPS or site permissions.';
      } else {
        errorTitle = 'Microphone Error: ' + (error?.name || 'Unknown');
        errorDescription = error?.message || 'Unable to access microphone. Please try reloading the page.';
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
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
    if (!isMountedRef.current) return;

    setIsProcessing(true);

    try {
      // Validate audio blob
      if (!audioBlob) {
        throw new Error('No audio data. Please try recording again.');
      }
      
      if (audioBlob.size === 0) {
        throw new Error('Audio recording is empty. Please try recording for a few seconds.');
      }

      console.log('[Audio Processing] Starting with blob:', {
        size: audioBlob.size,
        type: audioBlob.type,
        bytes: audioBlob.size,
      });

      const base64Audio = await blobToBase64(audioBlob);
      
      if (!base64Audio) {
        throw new Error('Failed to convert audio to base64. Please try again.');
      }

      if (base64Audio.length < 100) {
        throw new Error('Audio data too small. Please try recording again.');
      }

      console.log('[Audio Processing] Base64 conversion successful', {
        dataSize: base64Audio.length,
        hasDataUrl: base64Audio.startsWith('data:'),
      });

      console.log('[Audio Processing] Preparing API request...', {
        endpoint: '/api/voice/process',
        method: 'POST',
        audioLength: base64Audio.length,
        messagesCount: messages.length,
      });

      try {
        console.log('[Audio Processing] Sending to backend /api/voice/process...');
        
        const requestPayload = {
          audio: base64Audio,
          knowledgeBase: {},
          messages,
        };
        
        console.log('[Audio Processing] Request payload size:', JSON.stringify(requestPayload).length, 'bytes');
        
        const response = await apiRequest<{
          transcript: string;
          response: string;
          audioUrl?: string;
        }>('POST', '/api/voice/process', requestPayload);

        console.log('[Audio Processing] Backend response received:', {
          hasTranscript: !!response?.transcript,
          hasResponse: !!response?.response,
          transcriptLength: response?.transcript?.length || 0,
          responseLength: response?.response?.length || 0,
        });
      } catch (apiError: any) {
        console.error('[Audio Processing] API Request failed:', {
          name: apiError?.name,
          message: apiError?.message,
          details: apiError?.details,
          error: apiError?.error,
          status: apiError?.status,
          code: apiError?.code,
          requestId: apiError?.requestId,
          stack: apiError?.stack?.substring(0, 200),
        });
        
        // Create a more helpful error message from API response
        const errorMessage = apiError?.details || apiError?.error || apiError?.message || 'Unknown error occurred';
        const enhancedError = new Error(errorMessage);
        (enhancedError as any).requestId = apiError?.requestId;
        throw enhancedError;
      }

      if (response?.transcript) {
        const userText = response.transcript;
        console.log('[Audio Processing] Transcript:', userText);

        // Add user transcript message with label
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: `Transcript: ${userText}`,
          timestamp: new Date(),
        };

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.response || 'No response received.',
          timestamp: new Date(),
          isStreaming: true,
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);

        // Auto-convert AI response to speech
        try {
          const ttsResponse = await apiRequest<{ audioUrl: string }>('POST', '/api/voice/tts', {
            text: response.response,
          });

          if (ttsResponse?.audioUrl && isMountedRef.current) {
            setIsPlayingAudio(true);
            setIsVoiceModalOpen(true);
            if (audioRef.current) {
              audioRef.current.src = ttsResponse.audioUrl;
              audioRef.current.onended = () => {
                if (isMountedRef.current) {
                  setIsPlayingAudio(false);
                  setIsVoiceModalOpen(false);
                }
              };
              await audioRef.current.play();
            }
          }
        } catch (ttsError) {
          console.error('[TTS Error]:', ttsError);
        }
      } else {
        throw new Error('No transcript received from server. Please try again.');
      }
    } catch (error: any) {
      console.error('[Audio Processing Error] Complete Error:', {
        name: error?.name,
        message: error?.message,
        details: error?.details,
        requestId: error?.requestId,
        stack: error?.stack,
      });
      
      let errorTitle = 'Processing Error';
      let errorDescription = 'Failed to process audio. Please try again.';
      
      if (error?.message) {
        errorDescription = error.message;
        
        // Customize title based on error type
        if (error.message.includes('transcription') || error.message.includes('transcribe')) {
          errorTitle = 'Audio Transcription Failed';
        } else if (error.message.includes('response generation') || error.message.includes('AI response')) {
          errorTitle = 'AI Response Failed';
        } else if (error.message.includes('TTS') || error.message.includes('text-to-speech')) {
          errorTitle = 'Text-to-Speech Failed';
        }
      }

      toast({
        title: errorTitle,
        description: errorDescription,
        variant: 'destructive',
      });
    } finally {
      if (isMountedRef.current) {
        setIsProcessing(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const convertToSpeech = async () => {
    // Open the modal immediately
    setIsVoiceModalOpen(true);
    setIsTTSLoading(true);
    
    try {
      let textToConvert: string = '';
      let lastAssistantMessage = [...messages].reverse().find(msg => msg.type === 'assistant');
      
      // If no assistant message exists, use a default greeting
      if (!lastAssistantMessage) {
        const defaultGreeting = 'Hello! Welcome to the Knowledge Assistant. I\'m here to help answer your questions. Feel free to ask me anything about our services and products.';
        
        textToConvert = defaultGreeting;
        
        // Add the greeting to messages (preserving existing messages)
        const assistantMessage: ChatMessage = {
          id: (Date.now()).toString(),
          type: 'assistant',
          content: defaultGreeting,
          timestamp: new Date(),
          isStreaming: false,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        textToConvert = lastAssistantMessage.content;
      }

      const response = await apiRequest<{ audioUrl: string }>('POST', '/api/voice/tts', {
        text: textToConvert,
      });

      if (response?.audioUrl) {
        setIsPlayingAudio(true);
        if (audioRef.current) {
          audioRef.current.src = response.audioUrl;
          audioRef.current.onended = () => {
            if (isMountedRef.current) {
              setIsPlayingAudio(false);
            }
          };
          await audioRef.current.play();
        }
      }
    } catch (error) {
      console.error('TTS error:', error);
      toast({
        title: 'Speech Error',
        description: error instanceof Error ? error.message : 'Failed to convert text to speech.',
        variant: 'destructive',
      });
      setIsVoiceModalOpen(false);
    } finally {
      if (isMountedRef.current) {
        setIsTTSLoading(false);
        setIsLoading(false);
      }
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlayingAudio(false);
    setIsVoiceModalOpen(false);
  };

  const renderMessage = (message: ChatMessage) => (
    <div key={message.id} className={`flex gap-3 py-4 w-full ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
      {message.type === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`flex items-end gap-2 ${message.type === 'user' ? 'max-w-[80%]' : ''}`}>
        <div className={`${message.type === 'user' ? 'rounded-lg px-4 py-3' : ''}`} style={message.type === 'user' ? { backgroundColor: '#1f2937' } : {}}>
          <p className="text-white text-sm leading-relaxed text-left">
            {message.isStreaming ? (
              <StreamingText content={message.content} speed={20} />
            ) : (
              message.content
            )}
          </p>
        </div>
        
        {message.type === 'user' && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
            <User className="h-4 w-4 text-white" />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'hidden'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 flex items-center justify-center p-2 sm:p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full h-full sm:max-w-4xl lg:max-w-5xl bg-gray-900 rounded-lg sm:rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-700">
            <h2 className="text-white font-semibold text-lg sm:text-xl">Knowledge Assistant</h2>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-chat">
              <X className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </Button>
          </div>

          {/* URL Configuration - Editing only */}
          {isEditing && (
            <Collapsible open={showKnowledgeConfig} onOpenChange={setShowKnowledgeConfig}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between px-4 sm:px-6 py-3 h-auto border-b border-gray-700 hover:bg-gray-800 text-gray-300 text-sm sm:text-base"
                  data-testid="button-toggle-url-config"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>+ Add Website URLs</span>
                  </div>
                  {showKnowledgeConfig ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-4 sm:px-6 py-4 border-b border-gray-700 bg-gray-800/50">
                <URLManager
                  title="RAG Knowledge Base URLs"
                  description="Add website URLs to build knowledge base"
                  onIngest={async (urls) => {
                    toast({
                      title: 'URLs Added',
                      description: `Successfully added ${urls.length} URLs`,
                    });
                    setMessages([]);
                  }}
                  maxUrls={100}
                  className="border-none shadow-none bg-transparent"
                />
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="px-3 sm:px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12 sm:py-16 text-center px-4">
                  <h3 className="text-2xl sm:text-3xl lg:text-4xl font-light text-white mb-4 sm:mb-8">What are you working on?</h3>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map(renderMessage)}
                  {(isLoading || isProcessing) && (
                    <div className="flex gap-3 py-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex items-center text-gray-400 text-sm">
                        <TypingIndicator />
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area - ChatGPT Style */}
          <div className="border-t border-gray-700 px-3 sm:px-6 py-3 sm:py-4 bg-gray-900">
            <TooltipProvider>
              <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 items-end">
                {/* Add Button */}
                <button
                  type="button"
                  disabled={isLoading || isProcessing}
                  className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                    isLoading || isProcessing
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                  data-testid="button-add"
                >
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                {/* Input Field */}
                <div className={`flex-1 bg-gray-800 rounded-full px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 ${
                  isLoading || isProcessing ? 'opacity-60' : ''
                }`}>
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for presentation tips"
                    disabled={isLoading || isProcessing || isListening}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm sm:text-base disabled:cursor-not-allowed"
                    data-testid="input-chat"
                  />
                </div>

                {/* Waveform Button - TTS Mode */}
                <button
                  type="button"
                  onClick={convertToSpeech}
                  disabled={isLoading || isProcessing || isTTSLoading}
                  className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                    isPlayingAudio
                      ? 'bg-gray-700 text-cyan-400'
                      : isLoading || isProcessing || isTTSLoading
                      ? 'text-gray-600 opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                  data-testid="button-waveform"
                >
                  <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="3" y="13" width="2" height="8" />
                    <rect x="7" y="9" width="2" height="12" />
                    <rect x="11" y="5" width="2" height="16" />
                    <rect x="15" y="9" width="2" height="12" />
                    <rect x="19" y="13" width="2" height="8" />
                  </svg>
                </button>
              </form>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Audio Playback Modal - Voice Conversation Mode */}
      {isVoiceModalOpen && (
        <div className="fixed inset-0 z-[51] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-96 max-w-[90vw] bg-gray-950 rounded-lg p-6 sm:p-8 shadow-2xl flex flex-col items-center gap-6">
            {/* Title */}
            <div className="absolute top-4 right-4">
              <button
                onClick={stopAudio}
                className="text-gray-400 hover:text-white transition-colors"
                data-testid="button-close-voice"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <h2 className="text-white text-lg sm:text-xl font-semibold text-center mt-2">Voice Conversation Mode</h2>

            {/* Blue Circular Waveform Animation */}
            <div className="relative w-48 h-48 sm:w-64 sm:h-64">
              <div className="absolute inset-0 rounded-full animate-waveform-gradient bg-gradient-to-b from-blue-300 to-blue-600"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-blue-200/30 to-blue-500/50 animate-waveform-pulse"></div>
              
              {/* Waveform Lines */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-60">
                <div className="w-2 bg-white/80 rounded-full animate-wave" style={{ height: '60%', animationDelay: '0s' }}></div>
                <div className="w-2 bg-white/80 rounded-full animate-wave" style={{ height: '40%', animationDelay: '0.1s' }}></div>
                <div className="w-2 bg-white/80 rounded-full animate-wave" style={{ height: '80%', animationDelay: '0.2s' }}></div>
                <div className="w-2 bg-white/80 rounded-full animate-wave" style={{ height: '50%', animationDelay: '0.3s' }}></div>
                <div className="w-2 bg-white/80 rounded-full animate-wave" style={{ height: '70%', animationDelay: '0.4s' }}></div>
              </div>
            </div>

            {/* Loading or Playing Indicator */}
            {isTTSLoading && (
              <div className="text-gray-400 text-sm">Loading audio...</div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-6">
              {/* Stop/Close Button */}
              <button
                onClick={stopAudio}
                disabled={isTTSLoading}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                data-testid="button-stop-audio"
              >
                <X className="h-7 w-7 sm:h-8 sm:w-8" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />
    </div>
  );
}
