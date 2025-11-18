import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Phone, PhoneCall, Bot, CheckCircle2, X, Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface VoiceAgentElementProps {
  phoneNumber: string;
  agentName?: string;
  description?: string;
  buttonText?: string;
  primaryColor?: string;
  showAgentInfo?: boolean;
  isEditing?: boolean;
  knowledgeBase?: any;
  cardId?: string;
}

export function VoiceAgentElement({
  phoneNumber,
  agentName = 'AI Assistant',
  description = 'Call us anytime to speak with our AI assistant',
  buttonText = 'Call Now',
  primaryColor = '#22c55e',
  showAgentInfo = true,
  isEditing = false,
  knowledgeBase,
  cardId
}: VoiceAgentElementProps) {
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const handleCallClick = () => {
    if (isEditing) {
      toast({
        title: 'Preview Mode',
        description: 'Phone calling is disabled in preview mode.',
        variant: 'default',
      });
      return;
    }

    setShowCallDialog(true);
  };

  const handleInitiateCall = () => {
    window.location.href = `tel:${phoneNumber}`;
    setShowCallDialog(false);
    
    toast({
      title: 'Initiating Call',
      description: `Calling ${phoneNumber}...`,
    });
  };

  const formatPhoneNumber = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 ${cleaned.slice(1, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
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
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
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
    <div className="w-full">
      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="card">Call Card</TabsTrigger>
          <TabsTrigger value="chat">Voice Chat</TabsTrigger>
        </TabsList>

        {/* Call Card Tab */}
        <TabsContent value="card" className="mt-0">
          <div 
            className="rounded-lg border border-gray-200 bg-white dark:bg-gray-800 p-6 shadow-sm"
            style={{ borderColor: `${primaryColor}20` }}
          >
            {showAgentInfo && (
              <div className="flex items-start gap-4 mb-4">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Bot className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {agentName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {description}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <Phone className="w-5 h-5 text-gray-500" />
              <a 
                href={`tel:${phoneNumber}`}
                className="text-lg font-medium hover:underline"
                style={{ color: primaryColor }}
                onClick={(e) => {
                  if (isEditing) {
                    e.preventDefault();
                    toast({
                      title: 'Preview Mode',
                      description: 'Phone calling is disabled in preview mode.',
                      variant: 'default',
                    });
                  }
                }}
              >
                {formatPhoneNumber(phoneNumber)}
              </a>
            </div>

            <Button
              onClick={handleCallClick}
              className="w-full text-white font-semibold shadow-md hover:shadow-lg transition-all"
              style={{ 
                backgroundColor: primaryColor,
                borderColor: primaryColor,
              }}
              data-testid="button-call-now"
            >
              <PhoneCall className="w-5 h-5 mr-2" />
              {buttonText}
            </Button>

            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
                <span>24/7 AI-powered support</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
                <span>Instant answers to your questions</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="w-4 h-4" style={{ color: primaryColor }} />
                <span>Book appointments over the phone</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Voice Chat Tab */}
        <TabsContent value="chat" className="mt-0">
          <div className="w-full px-4 py-12 bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-lg">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}20` }}
                >
                  <Mic className="w-6 h-6" style={{ color: primaryColor }} />
                </div>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Talk to our voice assistant
              </h2>
              <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto">
                Click 'Start' and speak directly with our AI agent
              </p>
            </div>

            {/* Microphone Button */}
            <div className="flex flex-col items-center gap-6 mb-8">
              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className="w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl"
                style={{
                  background: isListening 
                    ? 'linear-gradient(135deg, #ef4444, #dc2626)' 
                    : `linear-gradient(135deg, ${primaryColor}, #a78bfa)`,
                }}
              >
                <svg
                  className="w-14 h-14 text-white"
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

              {/* Control Buttons */}
              {!isListening ? (
                <Button
                  onClick={startListening}
                  disabled={isProcessing}
                  className="px-6 py-2 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}, #a78bfa)`,
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <svg className="w-4 h-4 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                  Start Voice
                </Button>
              ) : (
                <Button
                  onClick={stopListening}
                  className="px-6 py-2 text-base font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                    color: 'white',
                    border: 'none'
                  }}
                >
                  <svg className="w-4 h-4 mr-2 inline-block" fill="currentColor" viewBox="0 0 20 20">
                    <rect x="6" y="6" width="8" height="8" rx="1" />
                  </svg>
                  Stop
                </Button>
              )}

              {isProcessing && (
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing your message...
                </div>
              )}
            </div>

            {/* Transcript Section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Transcript:
              </h3>
              <div 
                className="bg-white rounded-lg p-5 min-h-[180px] border border-gray-200 shadow-sm"
                style={{
                  maxHeight: '350px',
                  overflowY: 'auto'
                }}
              >
                {transcript ? (
                  <div className="space-y-3">
                    {transcript.split('\n\n').map((line, idx) => {
                      if (!line.trim()) return null;
                      const isUser = line.startsWith('You:');
                      const isAI = line.startsWith('AI:');
                      
                      return (
                        <p 
                          key={idx} 
                          className={`text-sm leading-relaxed ${
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
                  <p className="text-gray-400 text-sm italic">
                    [Awaiting...]
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Call Confirmation Dialog */}
      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" style={{ color: primaryColor }} />
              Call {agentName}
            </DialogTitle>
            <DialogDescription>
              You're about to call our AI assistant at {formatPhoneNumber(phoneNumber)}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                Our AI assistant will help you with:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-blue-800 dark:text-blue-200">
                <li>• Answering questions about our services</li>
                <li>• Scheduling appointments</li>
                <li>• Providing information from our knowledge base</li>
                <li>• Connecting you with the right person</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleInitiateCall}
                className="flex-1 text-white font-semibold"
                style={{ 
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
                data-testid="button-confirm-call"
              >
                <PhoneCall className="w-4 h-4 mr-2" />
                Call Now
              </Button>
              <Button
                onClick={() => setShowCallDialog(false)}
                variant="outline"
                className="flex-1"
                data-testid="button-cancel-call"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
