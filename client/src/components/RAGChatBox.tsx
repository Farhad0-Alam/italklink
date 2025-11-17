import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Loader2, Send, Bot, User, ExternalLink, MessageCircle, X, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { URLManager } from '@/components/URLManager';
import { useToast } from '@/hooks/use-toast';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
                  // Clear messages to encourage users to ask new questions
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
                  <p className="text-xs mt-1 sm:mt-2 opacity-75 px-4">I can help you find information from the knowledge base.</p>
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
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t px-3 sm:px-6 py-3 sm:py-4">
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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}