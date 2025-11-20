import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Bot, User, ExternalLink, X, Settings, ChevronDown, ChevronUp, Mic, Square, Plus, Volume2 } from 'lucide-react';
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

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
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

    if (!navigator.mediaDevices?.getUserMedia) {
      toast({
        title: 'Microphone Not Supported',
        description: 'Your browser does not support microphone access.',
        variant: 'destructive',
      });
      return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      toast({
        title: 'Secure Connection Required',
        description: 'Microphone access requires HTTPS.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.current = recorder;
      audioChunks.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        try {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
        } finally {
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
          }
        }
      };

      recorder.start();
      setIsListening(true);
    } catch (error: any) {
      console.error('Microphone access error:', error);
      toast({
        title: 'Microphone Error',
        description: 'Unable to access microphone.',
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
      const base64Audio = await blobToBase64(audioBlob);

      const response = await apiRequest<{
        transcript: string;
        response: string;
        audioUrl?: string;
      }>('POST', '/api/voice/process', {
        audio: base64Audio,
        knowledgeBase: {},
        messages,
      });

      if (response?.transcript) {
        const userText = response.transcript;

        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: userText,
          timestamp: new Date(),
        };

        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.response,
          timestamp: new Date(),
          isStreaming: true,
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);

        if (response.audioUrl) {
          try {
            const audio = new Audio(response.audioUrl);
            await audio.play();
          } catch (playError) {
            console.error('Audio playback error:', playError);
          }
        }
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process audio.',
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
        
        // Add the greeting to messages
        const assistantMessage: ChatMessage = {
          id: (Date.now()).toString(),
          type: 'assistant',
          content: defaultGreeting,
          timestamp: new Date(),
          isStreaming: false,
        };
        setMessages([assistantMessage]);
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

                {/* Cyan Recording Indicator */}
                {isListening && (
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                )}

                {/* Voice Button - Stop when Listening, Mic when not */}
                <button
                  type="button"
                  onClick={isListening ? stopListening : startListening}
                  disabled={isProcessing || isLoading}
                  className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-colors ${
                    isListening
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : isLoading || isProcessing
                      ? 'text-gray-600 opacity-50 cursor-not-allowed'
                      : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                  data-testid="button-voice"
                >
                  {isListening ? (
                    <Square className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </button>

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

            {isListening && (
              <div className="mt-2 text-xs sm:text-sm text-gray-400 text-center animate-pulse">
                🎙️ Recording...
              </div>
            )}
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
              {/* Mic Icon (Decorative) */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 opacity-40">
                <Mic className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>

              {/* Stop Button */}
              <button
                onClick={stopAudio}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-white transition-colors"
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
