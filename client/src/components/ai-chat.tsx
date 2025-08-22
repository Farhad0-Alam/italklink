import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Bot, 
  User, 
  Upload,
  X,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { URLManager } from '@/components/URLManager';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface KnowledgeBase {
  textContent?: string;
  websiteUrl?: string;
  pdfFiles?: Array<{ name: string; content: string }>;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  knowledgeBase?: KnowledgeBase;
  welcomeMessage?: string;
  primaryColor?: string;
}

export function AIChat({ isOpen, onClose, knowledgeBase, welcomeMessage, primaryColor = '#22c55e' }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [voiceMode, setVoiceMode] = useState(false); // Toggle for voice conversation mode
  const [lastInputWasVoice, setLastInputWasVoice] = useState(false); // Track if last input was voice
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle'); // ChatGPT-like voice states
  const [showKnowledgeConfig, setShowKnowledgeConfig] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0 && welcomeMessage) {
      setMessages([{
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, welcomeMessage, messages.length]);

  const sendMessage = async (message: string, fromVoice = false) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setLastInputWasVoice(fromVoice);
    
    // Set voice state to thinking for voice conversations
    if (voiceMode || fromVoice) {
      setVoiceState('thinking');
    }

    try {
      console.log('Sending AI request with knowledge base:', knowledgeBase);
      const response = await apiRequest('POST', '/api/ai/chat', {
        message,
        knowledgeBase,
        conversationHistory: messages.slice(-10) // Send last 10 messages for context
      });

      const data = await response.json();
      console.log('AI Response received:', data);
      const responseContent = data?.response || data?.message;
      const assistantMessage: Message = {
        role: 'assistant',
        content: responseContent || 'I apologize, but I encountered an error processing your request.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response if in voice mode or last input was voice
      if ((voiceMode || fromVoice) && assistantMessage.content) {
        setTimeout(() => {
          setVoiceState('speaking');
          speakText(assistantMessage.content);
        }, 500); // Small delay to ensure message is rendered
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
      setVoiceState('idle');
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Try formats that work better with OpenAI Whisper
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
        mimeType = 'audio/ogg;codecs=opus';
      }
      
      console.log('Recording with mimetype:', mimeType);
      const recorder = new MediaRecorder(stream, { mimeType });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType });
          console.log('Created audio blob:', { type: audioBlob.type, size: audioBlob.size });
          if (audioBlob.size > 0) {
            await transcribeAudio(audioBlob, true); // Pass true to indicate voice input
          } else {
            console.warn('Audio blob is empty, skipping transcription');
            toast({
              title: 'Recording Error',
              description: 'No audio was captured. Please try again.',
              variant: 'destructive'
            });
          }
        }
        chunks.length = 0;
      };

      // Record in chunks for better compatibility
      recorder.start(1000); // Record in 1-second chunks
      setMediaRecorder(recorder);
      setIsRecording(true);
      setVoiceState('listening');
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: 'Recording Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setMediaRecorder(null);
      setIsRecording(false);
      setVoiceState('idle');
    }
  };

  const transcribeAudio = async (audioBlob: Blob, isVoiceInput = false) => {
    try {
      const formData = new FormData();
      // Force to mp3 format for better compatibility with OpenAI
      let filename = 'audio.mp3';
      if (audioBlob.type.includes('mp4')) filename = 'audio.mp4';
      else if (audioBlob.type.includes('ogg')) filename = 'audio.ogg';
      
      console.log('Sending audio file:', { filename, type: audioBlob.type, size: audioBlob.size });
      formData.append('audio', audioBlob, filename);

      const response = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      const transcribedText = result.text;
      setInputMessage(transcribedText);
      
      // Auto-send if in voice mode
      if (voiceMode && transcribedText.trim()) {
        setTimeout(() => {
          sendMessage(transcribedText, true);
        }, 1000); // Give user 1 second to review transcribed text
      }
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Error',
        description: 'Failed to transcribe audio. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const speakText = async (text: string) => {
    try {
      console.log('Speaking text:', { text, length: text?.length });
      
      // Better text validation
      const cleanText = typeof text === 'string' ? text.trim() : '';
      if (!cleanText || cleanText.length === 0) {
        console.warn('No text provided to speak:', text);
        return; // Fail silently instead of showing error toast
      }
      
      setIsSpeaking(true);
      const response = await fetch('/api/ai/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Text-to-speech failed');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        setVoiceState('idle'); // Reset voice state when done speaking
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
      setVoiceState('idle');
      toast({
        title: 'Speech Error',
        description: 'Failed to generate speech. Please try again.',
        variant: 'destructive'
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage, false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b" style={{ borderColor: primaryColor + '20' }}>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bot className="h-5 w-5" style={{ color: primaryColor }} />
              <span>AI Assistant</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Voice Mode</label>
                <Button
                  variant={voiceMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => setVoiceMode(!voiceMode)}
                  className={voiceMode ? "text-white" : ""}
                  style={{ backgroundColor: voiceMode ? primaryColor : 'transparent' }}
                  data-testid="button-voice-mode-toggle"
                >
                  {voiceMode ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-chat">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Voice Mode Indicator with ChatGPT-style animations */}
        {voiceMode && (
          <div className="px-6 py-3 border-b" style={{ backgroundColor: primaryColor + '10' }}>
            <div className="flex items-center space-x-4">
              {/* Voice State Animation */}
              <div className="relative">
                {voiceState === 'listening' && (
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Mic className="h-5 w-5 animate-pulse" style={{ color: primaryColor }} />
                      <div 
                        className="absolute -inset-1 rounded-full animate-ping opacity-75"
                        style={{ backgroundColor: primaryColor }}
                      />
                    </div>
                    <span className="text-sm font-medium animate-pulse" style={{ color: primaryColor }}>
                      Listening...
                    </span>
                  </div>
                )}
                
                {voiceState === 'thinking' && (
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: primaryColor, animationDelay: '0s' }}
                      />
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: primaryColor, animationDelay: '0.2s' }}
                      />
                      <div 
                        className="w-2 h-2 rounded-full animate-bounce"
                        style={{ backgroundColor: primaryColor, animationDelay: '0.4s' }}
                      />
                    </div>
                    <span className="text-sm font-medium" style={{ color: primaryColor }}>
                      Thinking...
                    </span>
                  </div>
                )}
                
                {voiceState === 'speaking' && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-0.5">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-current animate-pulse"
                          style={{
                            color: primaryColor,
                            height: `${12 + Math.sin(i * 0.7) * 8}px`,
                            animationDelay: `${i * 0.1}s`,
                            animationDuration: '0.8s'
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium animate-pulse" style={{ color: primaryColor }}>
                      Speaking...
                    </span>
                  </div>
                )}
                
                {voiceState === 'idle' && (
                  <div className="flex items-center space-x-2">
                    <Volume2 className="h-5 w-5" style={{ color: primaryColor }} />
                    <span className="text-sm font-medium" style={{ color: primaryColor }}>
                      Voice Mode Ready
                    </span>
                  </div>
                )}
              </div>
              
              <span className="text-xs text-gray-600">
                {voiceState === 'idle' && 'Click microphone to start conversation'}
                {voiceState === 'listening' && 'Speak now, release when done'}
                {voiceState === 'thinking' && 'Processing your request...'}
                {voiceState === 'speaking' && 'AI is responding...'}
              </span>
            </div>
          </div>
        )}

        {/* Knowledge Base Info */}
        {knowledgeBase && (
          <div className="px-6 py-2 bg-gray-50 dark:bg-gray-800 border-b">
            <div className="flex flex-wrap gap-2">
              {knowledgeBase.textContent && (
                <Badge variant="secondary">Text Knowledge</Badge>
              )}
              {knowledgeBase.websiteUrl && (
                <Badge variant="secondary">Website Data</Badge>
              )}
              {knowledgeBase.pdfFiles && knowledgeBase.pdfFiles.length > 0 && (
                <Badge variant="secondary">{knowledgeBase.pdfFiles.length} PDF(s)</Badge>
              )}
            </div>
          </div>
        )}

        {/* URL Knowledge Configuration */}
        <Collapsible open={showKnowledgeConfig} onOpenChange={setShowKnowledgeConfig}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between px-6 py-3 h-auto border-b hover:bg-gray-50"
              data-testid="button-toggle-url-config"
            >
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4" style={{ color: primaryColor }} />
                <span className="font-medium text-sm">+ Add Website URLs</span>
                <Badge variant="outline" className="text-xs">Unlimited</Badge>
              </div>
              {showKnowledgeConfig ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="px-6 py-4 border-b bg-gray-50/50">
            <URLManager
              title="AI Knowledge Base URLs"
              description="Add unlimited website URLs to enhance the AI's knowledge for more accurate responses"
              onIngest={async (urls) => {
                toast({
                  title: 'URLs Added',
                  description: `Successfully added ${urls.length} URLs to AI knowledge base`,
                });
                // URLs are automatically available to the AI chat through the RAG system
              }}
              maxUrls={100}
              className="border-none shadow-none bg-transparent"
            />
          </CollapsibleContent>
        </Collapsible>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}
                  style={{
                    backgroundColor: message.role === 'user' ? primaryColor : undefined
                  }}
                  data-testid={`message-${message.role}-${index}`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: primaryColor }} />
                    )}
                    {message.role === 'user' && (
                      <User className="h-4 w-4 mt-0.5 flex-shrink-0 text-white" />
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <span className="text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => speakText(message.content)}
                        disabled={isSpeaking}
                        className="h-6 w-6 p-0"
                        data-testid={`button-speak-${index}`}
                      >
                        {isSpeaking ? (
                          <VolumeX className="h-3 w-3" />
                        ) : (
                          <Volume2 className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4" style={{ color: primaryColor }} />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-6 py-4 border-t">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message or use voice..."
                className="resize-none pr-12"
                rows={2}
                data-testid="input-chat-message"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
                data-testid="button-voice-toggle"
              >
                {isRecording ? (
                  <MicOff className="h-4 w-4 text-red-500" />
                ) : (
                  <Mic className="h-4 w-4" style={{ color: primaryColor }} />
                )}
              </Button>
            </div>
            <Button
              onClick={() => sendMessage(inputMessage, false)}
              disabled={!inputMessage.trim() || isLoading}
              style={{ backgroundColor: primaryColor }}
              className="text-white"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {isRecording && (
            <div className="mt-2 flex items-center space-x-2 text-red-500">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm">
                {voiceMode ? "Recording... (will auto-send & speak response)" : "Recording... Click mic to stop"}
              </span>
            </div>
          )}

          {voiceMode && !isRecording && voiceState === 'idle' && (
            <div className="mt-2 flex items-center justify-center p-4 rounded-lg border-2 border-dashed" style={{ borderColor: primaryColor + '40', backgroundColor: primaryColor + '05' }}>
              <div className="text-center">
                <Mic className="h-8 w-8 mx-auto mb-2 opacity-70" style={{ color: primaryColor }} />
                <span className="text-sm font-medium block" style={{ color: primaryColor }}>
                  Ready for voice conversation
                </span>
                <span className="text-xs text-gray-600">
                  Click microphone above to start speaking
                </span>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}