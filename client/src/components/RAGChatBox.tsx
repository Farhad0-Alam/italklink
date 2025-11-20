import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Bot, User, ExternalLink, X, Settings, ChevronDown, ChevronUp, Mic, Square, Plus } from 'lucide-react';
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);
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

  const renderMessage = (message: ChatMessage) => (
    <div key={message.id} className={`flex gap-3 py-4 w-full ${message.type === 'user' ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
      {message.type === 'assistant' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}
      
      <div className={`${message.type === 'user' ? 'max-w-[80%] ml-auto' : ''} ${message.type === 'user' ? 'rounded-lg px-4 py-3' : ''}`} style={message.type === 'user' ? { backgroundColor: '#1f2937' } : {}}>
        <p className="text-white text-sm leading-relaxed text-left">
          {message.isStreaming ? (
            <StreamingText content={message.content} speed={20} />
          ) : (
            message.content
          )}
        </p>
        
        {message.sources && message.sources.length > 0 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-gray-400">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <button
                  key={source.id}
                  onClick={() => window.open(source.url, '_blank')}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded cursor-pointer transition-colors flex items-center gap-1"
                  data-testid={`source-${source.id}`}
                >
                  <ExternalLink className="h-3 w-3" />
                  {source.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {message.type === 'user' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? '' : 'hidden'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-2xl h-[85vh] bg-gray-900 rounded-lg shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
            <h2 className="text-white font-semibold">Knowledge Assistant</h2>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-chat">
              <X className="h-4 w-4 text-gray-400" />
            </Button>
          </div>

          {/* URL Configuration - Editing only */}
          {isEditing && (
            <Collapsible open={showKnowledgeConfig} onOpenChange={setShowKnowledgeConfig}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between px-6 py-3 h-auto border-b border-gray-700 hover:bg-gray-800 text-gray-300"
                  data-testid="button-toggle-url-config"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="text-sm">+ Add Website URLs</span>
                  </div>
                  {showKnowledgeConfig ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
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
            <div className="px-6 py-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                  <h3 className="text-4xl font-light text-white mb-8">What are you working on?</h3>
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
          <div className="border-t border-gray-700 px-6 py-4 bg-gray-900">
            <TooltipProvider>
              <form onSubmit={handleSubmit} className="flex gap-3 items-end">
                {/* Add Button */}
                <button
                  type="button"
                  className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  data-testid="button-add"
                >
                  <Plus className="h-5 w-5" />
                </button>

                {/* Input Field */}
                <div className="flex-1 bg-gray-800 rounded-full px-4 py-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask for presentation tips"
                    disabled={isLoading || isProcessing || isListening}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
                    data-testid="input-chat"
                  />
                </div>

                {/* Voice Button with Tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={isListening ? stopListening : startListening}
                      disabled={isProcessing || isLoading}
                      className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isListening
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                      data-testid="button-voice"
                    >
                      {isListening ? (
                        <Square className="h-5 w-5" />
                      ) : (
                        <Mic className="h-5 w-5" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-gray-800 text-white text-xs px-2 py-1 rounded">
                    Use voice mode
                  </TooltipContent>
                </Tooltip>

                {/* Waveform Button */}
                <button
                  type="button"
                  className="flex-shrink-0 w-10 h-10 rounded-full hover:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  data-testid="button-waveform"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
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
              <div className="mt-2 text-xs text-gray-400 text-center animate-pulse">
                🎙️ Recording...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
