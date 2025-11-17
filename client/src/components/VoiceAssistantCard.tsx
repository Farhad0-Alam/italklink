import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, MicOff, Volume2, Bot, Send, Loader2, X } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [textInput, setTextInput] = useState('');
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioContext = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const animationFrame = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Set up audio context for visualization
      audioContext.current = new AudioContext();
      analyser.current = audioContext.current.createAnalyser();
      const source = audioContext.current.createMediaStreamSource(stream);
      source.connect(analyser.current);
      analyser.current.fftSize = 256;
      
      // Start visualization
      visualizeAudio();
      
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
      
      // Stop visualization
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      if (audioContext.current) {
        audioContext.current.close();
      }
    }
  };

  const visualizeAudio = () => {
    if (!canvasRef.current || !analyser.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const bufferLength = analyser.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      animationFrame.current = requestAnimationFrame(draw);
      
      analyser.current!.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, primaryColor);
        gradient.addColorStop(1, `${primaryColor}80`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
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
          setMessages(prev => [
            ...prev,
            { role: 'user', content: response.transcript },
            { role: 'assistant', content: response.response }
          ]);
          
          // Play audio response if available
          if (response.audioUrl) {
            playAudioResponse(response.audioUrl);
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

  const playAudioResponse = async (audioUrl: string) => {
    setIsSpeaking(true);
    const audio = new Audio(audioUrl);
    
    audio.onended = () => {
      setIsSpeaking(false);
    };
    
    await audio.play();
  };

  const sendTextMessage = async () => {
    if (!textInput.trim()) return;
    
    setIsProcessing(true);
    const userMessage = textInput.trim();
    setTextInput('');
    
    try {
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
      
      const response = await apiRequest<{
        response: string;
        audioUrl?: string;
      }>('POST', '/api/voice/chat', {
        message: userMessage,
        cardId,
        knowledgeBase,
        messages
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.response }]);
      
      if (response.audioUrl) {
        playAudioResponse(response.audioUrl);
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Chat Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full shadow-2xl hover:scale-110 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`,
            border: 'none'
          }}
        >
          {isOpen ? (
            <X className="w-8 h-8 text-white" />
          ) : (
            <div className="relative">
              <Bot className="w-8 h-8 text-white" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
          )}
        </Button>
      </div>

      {/* Voice Assistant Interface */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Card className="w-96 h-[600px] overflow-hidden shadow-2xl border-0">
            {/* Header */}
            <div 
              className="h-32 p-6 text-white relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
              }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white via-transparent to-transparent" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{agentName}</h3>
                    <p className="text-white/80 text-sm">{businessName} Assistant</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-3 text-xs">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-white/90">Ready to help</span>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="h-[340px] overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <Bot className="w-16 h-16 mb-3 text-gray-300" />
                  <p className="text-center text-sm">
                    Hi! I'm your AI assistant.<br />
                    Ask me anything about {businessName}.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-br text-white'
                            : 'bg-white shadow-sm'
                        }`}
                        style={{
                          background: msg.role === 'user' 
                            ? `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)`
                            : undefined
                        }}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Audio Visualization */}
            {isListening && (
              <div className="h-16 bg-gray-100 flex items-center justify-center">
                <canvas
                  ref={canvasRef}
                  width={350}
                  height={60}
                  className="rounded"
                />
              </div>
            )}

            {/* Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendTextMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:ring-2"
                  style={{ focusRingColor: primaryColor }}
                  disabled={isProcessing || isListening}
                />
                
                <Button
                  onClick={sendTextMessage}
                  size="sm"
                  className="rounded-full w-10 h-10 p-0"
                  style={{ backgroundColor: primaryColor }}
                  disabled={!textInput.trim() || isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                  ) : (
                    <Send className="w-5 h-5 text-white" />
                  )}
                </Button>
                
                <Button
                  onClick={isListening ? stopListening : startListening}
                  size="sm"
                  className="rounded-full w-10 h-10 p-0"
                  style={{ backgroundColor: isListening ? '#ef4444' : primaryColor }}
                  disabled={isProcessing}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5 text-white" />
                  ) : (
                    <Mic className="w-5 h-5 text-white" />
                  )}
                </Button>
              </div>
              
              {isSpeaking && (
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Volume2 className="w-3 h-3 animate-pulse" />
                  <span>Speaking...</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </>
  );
}