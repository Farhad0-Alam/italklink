import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Send, Bot, User, ExternalLink, MessageCircle, X, Settings, ChevronDown, ChevronUp, Mic, Square } from 'lucide-react';
import { URLManager } from '@/components/URLManager';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

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
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
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
        description: 'Microphone access requires HTTPS. Please use a secure connection.',
        variant: 'destructive',
      });
      return;
    }

    if (typeof (window as any).MediaRecorder === 'undefined') {
      toast({
        title: 'Recording Not Supported',
        description: 'Your browser does not support audio recording.',
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

      recorder.onerror = (event: any) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: 'Recording Error',
          description: 'There was a problem recording audio. Please try again.',
          variant: 'destructive',
        });
        setIsListening(false);
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
      setTranscript('Listening...');
    } catch (error: any) {
      console.error('Microphone access error:', error);
      toast({
        title: 'Microphone Error',
        description: 'Unable to access microphone. Please check permissions.',
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

        // Add user message
        const userMessage: ChatMessage = {
          id: Date.now().toString(),
          type: 'user',
          content: userText,
          timestamp: new Date(),
        };

        // Add assistant message
        const assistantMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response.response,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage, assistantMessage]);
        setTranscript('');

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
          description: 'Failed to process voice. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Audio processing error:', error);
      toast({
        title: 'Processing Error',
        description: 'Failed to process audio. Please try again.',
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
    <div
      key={message.id}
      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      {message.type === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4" />
        </div>
      )}
      
      <div className={`max-w-[85%] space-y-2 ${message.type === 'user' ? 'order-1' : ''}`}>
        <div
          className={`p-3 rounded-lg ${
            message.type === 'user'
              ? 'text-white'
              : 'bg-muted'
          }`}
          style={{ backgroundColor: message.type === 'user' ? '#22c55e' : undefined }}
          data-testid={`message-${message.type}`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>
        
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Sources:</p>
            <div className="flex flex-wrap gap-2">
              {message.sources.map((source) => (
                <Badge
                  key={source.id}
                  variant="secondary"
                  className="text-xs cursor-pointer hover:bg-secondary/80"
                  onClick={() => window.open(source.url, '_blank')}
                  data-testid={`source-${source.id}`}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  {source.id} {source.title} ({Math.round(source.score * 100)}%)
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {message.type === 'user' && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl sm:max-w-xl md:max-w-2xl lg:max-w-4xl h-[85vh] sm:h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b" style={{ borderColor: primaryColor + '20' }}>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5" style={{ color: primaryColor }} />
              <span className="text-sm sm:text-base">Knowledge Assistant</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-chat">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {/* URL Knowledge Configuration - Only show in editing mode */}
        {isEditing && (
          <Collapsible open={showKnowledgeConfig} onOpenChange={setShowKnowledgeConfig}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full justify-between px-4 sm:px-6 py-3 h-auto border-b hover:bg-gray-50"
                data-testid="button-toggle-url-config"
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" style={{ color: primaryColor }} />
                  <span className="font-medium text-xs sm:text-sm">+ Add Website URLs</span>
                  <Badge variant="outline" className="text-xs">Unlimited</Badge>
                </div>
                {showKnowledgeConfig ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 sm:px-6 py-4 border-b bg-gray-50/50">
              <URLManager
                title="RAG Knowledge Base URLs"
                description="Add unlimited website URLs to build comprehensive knowledge base for intelligent Q&A"
                onIngest={async (urls) => {
                  toast({
                    title: 'URLs Added',
                    description: `Successfully added ${urls.length} URLs to RAG knowledge base`,
                  });
                  setMessages([]);
                }}
                maxUrls={100}
                className="border-none shadow-none bg-transparent"
              />
            </CollapsibleContent>
          </Collapsible>
        )}

        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 px-3 sm:px-6">
            <div className="space-y-3 sm:space-y-4 py-3 sm:py-4" data-testid="chat-messages">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 sm:py-12">
                  <Bot className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 sm:mb-4 opacity-30" style={{ color: primaryColor }} />
                  <p className="text-base sm:text-lg font-medium mb-1 sm:mb-2">Knowledge Assistant</p>
                  <p className="text-xs sm:text-sm px-4">Ask me anything about the ingested content!</p>
                  <p className="text-xs mt-1 sm:mt-2 opacity-75 px-4">You can use text or voice input.</p>
                </div>
              ) : (
                messages.map(renderMessage)
              )}
              
              {isLoading && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: primaryColor + '20' }}
                  >
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="bg-muted p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" style={{ color: primaryColor }} />
                      <span className="text-xs sm:text-sm">Searching knowledge base...</span>
                    </div>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="flex gap-2 sm:gap-3 justify-start">
                  <div 
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: primaryColor + '20' }}
                  >
                    <Mic className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: primaryColor }} />
                  </div>
                  <div className="bg-muted p-2 sm:p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" style={{ color: primaryColor }} />
                      <span className="text-xs sm:text-sm">Processing voice...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Section - ChatGPT Style */}
          <div className="border-t px-3 sm:px-6 py-3 sm:py-4 bg-white">
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-3">
              <Button
                variant={inputMode === 'text' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('text')}
                className="text-xs"
                data-testid="button-text-mode"
              >
                Text
              </Button>
              <Button
                variant={inputMode === 'voice' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setInputMode('voice')}
                className="text-xs"
                data-testid="button-voice-mode"
              >
                Voice
              </Button>
            </div>

            {/* Text Input Mode */}
            {inputMode === 'text' && (
              <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="flex-1 text-sm sm:text-base"
                  data-testid="input-chat"
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  style={{ backgroundColor: primaryColor }}
                  className="text-white hover:opacity-90 flex-shrink-0"
                  data-testid="button-send"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            )}

            {/* Voice Input Mode */}
            {inputMode === 'voice' && (
              <div className="flex flex-col gap-3">
                {/* Voice Transcript Display */}
                {transcript && (
                  <div className="bg-muted p-3 rounded-lg min-h-[50px]">
                    <p className="text-sm text-muted-foreground italic">{transcript}</p>
                  </div>
                )}

                {/* Voice Controls */}
                <div className="flex gap-2 items-center justify-center">
                  {!isListening ? (
                    <Button 
                      onClick={startListening}
                      disabled={isProcessing || isLoading}
                      className="flex-1 flex items-center justify-center gap-2"
                      style={{ backgroundColor: primaryColor }}
                      data-testid="button-start-voice"
                    >
                      <Mic className="h-4 w-4" />
                      Click to speak
                    </Button>
                  ) : (
                    <Button 
                      onClick={stopListening}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600"
                      data-testid="button-stop-voice"
                    >
                      <Square className="h-4 w-4" />
                      Stop listening
                    </Button>
                  )}
                </div>

                {isListening && (
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    Recording...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
