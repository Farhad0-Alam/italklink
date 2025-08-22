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
  X
} from 'lucide-react';
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
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [voiceMode, setVoiceMode] = useState(false); // Toggle for voice conversation mode
  const [lastInputWasVoice, setLastInputWasVoice] = useState(false); // Track if last input was voice
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

    try {
      const response = await apiRequest('POST', '/api/ai/chat', {
        message,
        knowledgeBase,
        conversationHistory: messages.slice(-10) // Send last 10 messages for context
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: (response as any).response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Auto-speak response if in voice mode or last input was voice
      if (voiceMode || fromVoice) {
        setTimeout(() => {
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
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        console.log('Created audio blob:', { type: audioBlob.type, size: audioBlob.size });
        await transcribeAudio(audioBlob, true); // Pass true to indicate voice input
        setAudioChunks([]);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
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
      
      if (!text || text.trim().length === 0) {
        toast({
          title: 'Speech Error',
          description: 'No text to speak',
          variant: 'destructive'
        });
        return;
      }
      
      setIsSpeaking(true);
      const response = await fetch('/api/ai/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
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
        URL.revokeObjectURL(audioUrl);
      };

      await audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
      setIsSpeaking(false);
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

        {/* Voice Mode Indicator */}
        {voiceMode && (
          <div className="px-6 py-2 border-b" style={{ backgroundColor: primaryColor + '10' }}>
            <div className="flex items-center space-x-2">
              <Mic className="h-4 w-4" style={{ color: primaryColor }} />
              <span className="text-sm font-medium" style={{ color: primaryColor }}>
                Voice Mode Active
              </span>
              <span className="text-xs text-gray-600">
                Speak into microphone for automatic voice conversations
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

          {voiceMode && !isRecording && (
            <div className="mt-2 flex items-center space-x-2" style={{ color: primaryColor }}>
              <Volume2 className="h-4 w-4" />
              <span className="text-sm">Voice mode: Speak to start conversation, responses will be spoken automatically</span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}