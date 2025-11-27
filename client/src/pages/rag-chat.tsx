import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Send, Loader2, Volume2, VolumeX } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
  timestamp: Date;
}

export default function RAGChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant powered by our knowledge base. Ask me anything or use voice to chat naturally.',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceState, setVoiceState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const { toast } = useToast();

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const streamTypewriterEffect = async (text: string, messageIndex: number) => {
    const words = text.split(' ');
    let currentText = '';

    for (let i = 0; i < words.length; i++) {
      currentText += (i === 0 ? '' : ' ') + words[i];
      
      setMessages(prev => {
        const newMessages = [...prev];
        if (newMessages[messageIndex]) {
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: currentText
          };
        }
        return newMessages;
      });

      // Vary speed based on word length
      await new Promise(resolve => 
        setTimeout(resolve, Math.random() * 30 + 10)
      );
    }

    // Remove streaming indicator
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages[messageIndex]) {
        newMessages[messageIndex] = {
          ...newMessages[messageIndex],
          isStreaming: false
        };
      }
      return newMessages;
    });
  };

  const sendMessage = async (message: string, fromVoice = false) => {
    if (!message.trim()) return;

    // Add user message
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setVoiceTranscript('');
    setIsLoading(true);

    if (fromVoice) {
      setVoiceState('thinking');
    }

    try {
      // Call RAG chat endpoint
      const response = await apiRequest('POST', '/api/rag/chat', {
        query: message,
        topK: 5
      });

      const data = await response.json();
      const botResponse = data.answer || 'I could not generate a response. Please try again.';

      // Add assistant message with streaming indicator
      const messageIndex = messages.length + 1;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '',
        isStreaming: true,
        timestamp: new Date()
      }]);

      // Apply typewriter effect
      await streamTypewriterEffect(botResponse, messageIndex);

      // Auto-speak if voice input
      if (fromVoice) {
        setVoiceState('speaking');
        await speakText(botResponse);
        setVoiceState('idle');
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get response. Please try again.',
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
      
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const recorder = new MediaRecorder(stream, { mimeType });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recorder.onstop = async () => {
        if (chunks.length > 0) {
          const audioBlob = new Blob(chunks, { type: mimeType });
          
          try {
            // Transcribe audio using Whisper
            const formData = new FormData();
            formData.append('file', audioBlob, `audio.${mimeType.split('/')[1]}`);
            
            const transcribeResponse = await fetch('/api/voice/transcribe', {
              method: 'POST',
              body: formData
            });

            if (transcribeResponse.ok) {
              const { transcript } = await transcribeResponse.json();
              setVoiceTranscript(transcript);
              setInputValue(transcript);
              
              // Auto-send after brief delay
              setTimeout(() => {
                sendMessage(transcript, true);
              }, 300);
            }
          } catch (err) {
            console.error('Transcription error:', err);
            toast({
              title: 'Transcription Error',
              description: 'Could not transcribe audio',
              variant: 'destructive'
            });
          }
        }
        
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      setVoiceState('listening');
    } catch (error) {
      console.error('Recording error:', error);
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone',
        variant: 'destructive'
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setVoiceState('idle');
    }
  };

  const speakText = (text: string) => {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = resolve;
        window.speechSynthesis.speak(utterance);
      } else {
        resolve(undefined);
      }
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Base Chat</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Powered by RAG & Voice AI</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {voiceState === 'listening' && '🎤 Listening...'}
            {voiceState === 'thinking' && '🤔 Thinking...'}
            {voiceState === 'speaking' && '🔊 Speaking...'}
            {voiceState === 'idle' && '✓ Ready'}
          </Badge>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-6 py-6">
        <div className="space-y-6 max-w-2xl mx-auto">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-bl-none shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.isStreaming && (
                  <span className="inline-block ml-1 w-2 h-4 bg-current animate-pulse" />
                )}
                <p className="text-xs mt-2 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-slate-700 px-4 py-3 rounded-lg rounded-bl-none shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-800 border-t dark:border-slate-700 px-6 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto">
          {/* Voice Transcript Display */}
          {voiceTranscript && (
            <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold">Voice Input:</p>
              <p className="text-sm text-slate-900 dark:text-white mt-1">{voiceTranscript}</p>
            </div>
          )}

          {/* Input Form */}
          <div className="flex gap-3">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  sendMessage(inputValue);
                }
              }}
              placeholder="Type or use voice to chat..."
              disabled={isLoading || isRecording}
              className="flex-1 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            />

            {/* Voice Button */}
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? 'destructive' : 'outline'}
              size="sm"
              className="gap-2"
              disabled={isLoading}
              data-testid="button-voice-record"
            >
              {isRecording ? (
                <>
                  <MicOff className="h-4 w-4" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  Voice
                </>
              )}
            </Button>

            {/* Send Button */}
            <Button
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
              className="gap-2 bg-blue-500 hover:bg-blue-600"
              data-testid="button-send-message"
            >
              <Send className="h-4 w-4" />
              Send
            </Button>
          </div>

          {/* Hint */}
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            💡 Tip: Click the mic button to talk, or type and press Enter
          </p>
        </div>
      </div>
    </div>
  );
}
