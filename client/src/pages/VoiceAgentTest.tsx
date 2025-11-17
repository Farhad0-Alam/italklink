import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Calendar, Mail, Plug, Globe, Users, Check, Shield, Mic, Square, Send } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const features = [
  {
    icon: <Phone className="w-6 h-6 text-blue-600" />,
    title: "Automatically answers incoming calls",
    description: "The voice agent responds professionally to all your calls 24/7 in a perfectly adapted language.",
    color: "border-blue-200"
  },
  {
    icon: <Calendar className="w-6 h-6 text-green-600" />,
    title: "Schedules appointments directly",
    description: "The agent automatically syncs with your calendar to avoid double-bookings and errors.",
    color: "border-green-200"
  },
  {
    icon: <Check className="w-6 h-6 text-purple-600" />,
    title: "Qualifies leads based on your criteria",
    description: "The agent asks your qualification questions to filter calls and prioritize the best prospects.",
    color: "border-purple-200"
  },
  {
    icon: <Mail className="w-6 h-6 text-blue-600" />,
    title: "Sends confirmations and follow-ups",
    description: "The agent automates post-call communications via email or text for a flawless customer experience.",
    color: "border-blue-200"
  },
  {
    icon: <Plug className="w-6 h-6 text-orange-600" />,
    title: "Integrates with your existing CRM",
    description: "The agent is compatible with Zoho, HubSpot, Pipedrive, and others to centralize your customer data.",
    color: "border-orange-200"
  },
  {
    icon: <Globe className="w-6 h-6 text-pink-600" />,
    title: "100% multilingual",
    description: "The agent automatically switches between French and English based on the caller's preference.",
    color: "border-pink-200"
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Can transfer calls on client or prospect request",
    description: "The agent can transfer calls to your team when requested by the client or based on your predefined criteria.",
    color: "border-blue-200"
  },
  {
    icon: <Phone className="w-6 h-6 text-green-600" />,
    title: "Speaks exactly like a human",
    description: "Natural and fluid conversation with intonation, pauses, and authentic reactions for an experience indistinguishable from a real human.",
    color: "border-green-200"
  },
  {
    icon: <Shield className="w-6 h-6 text-purple-600" />,
    title: "Verifies prospect identity and collects more info during the call",
    description: "The agent confirms the caller's identity and automatically enriches their profile with relevant information during the conversation.",
    color: "border-purple-200"
  }
];

const useCases = [
  {
    icon: "📈",
    title: "Lead Follow-up",
    description: "Automatic qualified lead follow-up",
    color: "bg-blue-50 border-blue-200"
  },
  {
    icon: "📅",
    title: "Appointment Reminder",
    description: "Automatic appointment confirmation",
    color: "bg-orange-50 border-orange-200"
  },
  {
    icon: "❤️",
    title: "Customer Satisfaction",
    description: "Post-service feedback collection",
    color: "bg-pink-50 border-pink-200"
  },
  {
    icon: "📢",
    title: "Promotions & Events",
    description: "Special offer announcements",
    color: "bg-orange-50 border-orange-200"
  }
];

export default function VoiceAgentTest() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [selectedUseCase, setSelectedUseCase] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const { toast } = useToast();

  const handleStartVoice = async () => {
    try {
      setIsRecording(true);
      setIsLoading(true);
      setTranscript("Connecting to AI voice agent...\n\n");
      
      const response = await apiRequest<{ success: boolean; transcript: string; status: string }>(
        'POST', 
        '/api/voice/test/simulate', 
        { action: 'start' }
      );
      
      if (response.success) {
        setTranscript((prev) => `${prev}AI: ${response.transcript}`);
      }
    } catch (error: any) {
      toast({
        title: "Connection Error",
        description: error.message || "Failed to connect to voice agent",
        variant: "destructive",
      });
      setIsRecording(false);
      setTranscript("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim() || !isRecording || isLoading) return;

    const message = userMessage.trim();
    
    try {
      setIsLoading(true);
      setUserMessage("");
      
      setTranscript((prev) => `${prev}\n\nYou: ${message}\n\n`);
      
      const response = await apiRequest<{ success: boolean; transcript: string; status: string }>(
        'POST',
        '/api/voice/test/simulate',
        { action: 'speak', message }
      );
      
      if (response.success) {
        // Extract just the AI response part (the backend returns "You: X\n\nAI: Y")
        const aiResponse = response.transcript.split('\n\nAI: ')[1] || response.transcript;
        setTranscript((prev) => `${prev}AI: ${aiResponse}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
      // Restore message on error so user can retry
      setUserMessage(message);
      setTranscript((prev) => prev + `AI: Sorry, I encountered an error. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopVoice = async () => {
    try {
      setIsLoading(true);
      
      const response = await apiRequest<{ success: boolean; transcript: string; status: string }>(
        'POST',
        '/api/voice/test/simulate',
        { action: 'stop' }
      );
      
      if (response.success) {
        setTranscript((prev) => prev + `\n\n${response.transcript}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to end call",
        variant: "destructive",
      });
      // Still add a message to transcript on error
      setTranscript((prev) => prev + `\n\nCall ended (with error)`);
    } finally {
      // Always reset states in finally block
      setIsRecording(false);
      setIsLoading(false);
      setUserMessage("");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-200">
            <Phone className="w-3 h-3 mr-1" />
            Incoming calls
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            Automate your calls with a 100% AI voice agent
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            An AI agent that responds 24/7 in a perfectly adapted language to automate your incoming calls
          </p>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              What our AI Voice Agent Does
            </h2>
            <Badge className="bg-blue-600 text-white hover:bg-blue-700">
              <Phone className="w-3 h-3 mr-1" />
              Inbound and Outbound Calls
              <span className="ml-2">📞</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className={`border-l-4 ${feature.color} hover:shadow-lg transition-shadow`}
                data-testid={`feature-card-${index}`}
              >
                <CardHeader>
                  <div className="mb-3">{feature.icon}</div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600 dark:text-slate-300">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="border-2 border-slate-200 dark:border-slate-700">
            <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-slate-800 dark:to-slate-700">
              <CardTitle className="text-2xl">Talk to our voice assistant</CardTitle>
              <CardDescription>
                Click 'Start' and speak directly with our AI agent for your dental office
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center animate-pulse">
                  <Mic className="w-12 h-12 text-white" />
                </div>

                <div className="flex gap-4">
                  {!isRecording ? (
                    <Button
                      onClick={handleStartVoice}
                      disabled={isLoading}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-6 text-lg rounded-full shadow-lg disabled:opacity-50"
                      data-testid="button-start-voice"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      {isLoading ? "Connecting..." : "Start Voice"}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStopVoice}
                      disabled={isLoading}
                      variant="destructive"
                      className="px-8 py-6 text-lg rounded-full shadow-lg disabled:opacity-50"
                      data-testid="button-stop-voice"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      {isLoading ? "Stopping..." : "Stop"}
                    </Button>
                  )}
                </div>

                {transcript && (
                  <div className="w-full">
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Transcript:</h4>
                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap" data-testid="text-transcript">
                        {transcript}
                      </p>
                    </div>
                  </div>
                )}

                {isRecording && (
                  <div className="w-full">
                    <h4 className="font-semibold mb-2 text-slate-900 dark:text-white">Send Message:</h4>
                    <div className="flex gap-2">
                      <Input
                        value={userMessage}
                        onChange={(e) => setUserMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isLoading) {
                            handleSendMessage();
                          }
                        }}
                        placeholder="Type your message..."
                        disabled={isLoading || !isRecording}
                        className="flex-1"
                        data-testid="input-user-message"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={isLoading || !userMessage.trim()}
                        className="bg-blue-600 hover:bg-blue-700"
                        data-testid="button-send-message"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <span className="text-blue-600">ℹ️</span>
                  Try asking about appointments, dental procedures, or emergency care
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Outbound Calls Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-orange-100 text-orange-700 hover:bg-orange-200">
              <Phone className="w-3 h-3 mr-1" />
              Outbound calls
            </Badge>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Test our outbound calls
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-300">
              Discover how our AI agent can make outbound calls for prospect follow-up and lead generation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Use Case Selector */}
            <div className="space-y-3">
              {useCases.map((useCase, index) => (
                <Card
                  key={index}
                  className={`cursor-pointer transition-all ${
                    selectedUseCase === index 
                      ? 'border-2 border-blue-500 shadow-lg' 
                      : 'border hover:border-slate-300'
                  } ${useCase.color}`}
                  onClick={() => setSelectedUseCase(index)}
                  data-testid={`usecase-card-${index}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{useCase.icon}</span>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white">{useCase.title}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{useCase.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Simulation Panel */}
            <div className="lg:col-span-2">
              <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 h-full">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="text-center space-y-6">
                    <div className="inline-block px-4 py-2 bg-orange-500/20 rounded-full">
                      <Badge className="bg-orange-500 text-white">
                        🎯 OUTBOUND CALL SIMULATION
                      </Badge>
                    </div>
                    
                    <h3 className="text-2xl font-bold">Ready to test an outbound call?</h3>
                    <p className="text-slate-300 max-w-md">
                      Discover how the AI agent contacts and qualifies your prospects automatically
                    </p>

                    <Button
                      className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-8 py-6 text-lg rounded-full shadow-lg"
                      data-testid="button-start-outbound"
                    >
                      <Phone className="w-5 h-5 mr-2" />
                      Start outbound call
                      <span className="ml-2">•••</span>
                    </Button>

                    <p className="text-sm text-slate-400">
                      <span className="font-semibold">Agent calls a qualified prospect</span>
                      <br />
                      A prospect showed interest in your services a few days ago. The AI agent calls them for 
                      personalized follow-up, to qualify their specific needs and schedule a demo appointment 
                      with your sales team.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
            <CardContent className="p-12">
              <h2 className="text-3xl font-bold mb-4">Get Started Now!</h2>
              <p className="text-xl mb-6 text-blue-100">
                Transform your business with AI-powered voice automation
              </p>
              <Button
                size="lg"
                className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg rounded-full shadow-lg"
                data-testid="button-live-demo"
              >
                <Phone className="w-5 h-5 mr-2" />
                Request Live Demo
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
