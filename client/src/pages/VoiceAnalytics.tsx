import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Calendar,
  FileText,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface VoiceAnalyticsProps {
  className?: string;
}

interface AnalyticsData {
  overview: {
    totalCalls: number;
    completedCalls: number;
    totalDuration: number;
    avgDuration: number;
    appointmentsBooked: number;
    leadsQualified: number;
  };
  callTypes: {
    inbound: number;
    outbound: number;
    missed: number;
  };
  conversionRates: {
    appointmentConversionRate: number;
    qualificationRate: number;
    answerRate: number;
  };
  recentCalls: Array<{
    id: string;
    callSid: string;
    direction: string;
    status: string;
    callerNumber: string;
    duration: number;
    outcome: string | null;
    createdAt: string;
  }>;
}

interface CallData {
  id: string;
  callSid: string;
  direction: string;
  status: string;
  callerNumber: string;
  duration: number;
  outcome: string | null;
  transcript: string | null;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
}

const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

const formatTotalDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'in_progress':
      return 'secondary';
    case 'failed':
    case 'no_answer':
      return 'destructive';
    case 'busy':
      return 'outline';
    default:
      return 'secondary';
  }
};

const getOutcomeColor = (outcome: string | null): string => {
  switch (outcome) {
    case 'qualified':
    case 'appointment_booked':
      return 'default';
    case 'follow_up':
      return 'secondary';
    case 'not_qualified':
    case 'not_interested':
      return 'destructive';
    default:
      return 'outline';
  }
};

export default function VoiceAnalytics({ className }: VoiceAnalyticsProps) {
  const [selectedCard, setSelectedCard] = useState<string>('');
  
  // Fetch user's business cards
  const { data: businessCards = [], isLoading: cardsLoading } = useQuery({
    queryKey: ['/api/business-cards'],
    queryFn: async () => {
      const response = await fetch('/api/business-cards');
      if (!response.ok) throw new Error('Failed to fetch business cards');
      return response.json();
    },
  });

  // Auto-select first card if none selected
  useEffect(() => {
    if (!selectedCard && businessCards.length > 0 && !cardsLoading) {
      setSelectedCard(businessCards[0].id);
    }
  }, [businessCards, cardsLoading, selectedCard]);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery<AnalyticsData>({
    queryKey: ['/api/voice/analytics', selectedCard],
    queryFn: async () => {
      if (!selectedCard) return null;
      const response = await fetch(`/api/voice/analytics/${selectedCard}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch analytics');
      }
      const result = await response.json();
      return result.data;
    },
    enabled: !!selectedCard,
    refetchInterval: 60000,
  });

  // Fetch call history
  const { data: calls = [], isLoading: callsLoading } = useQuery<CallData[]>({
    queryKey: ['/api/voice/calls/card', selectedCard],
    queryFn: async () => {
      if (!selectedCard) return [];
      const response = await fetch(`/api/voice/calls/card/${selectedCard}?limit=50`);
      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to fetch calls');
      }
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!selectedCard,
    refetchInterval: 30000,
  });

  const isLoading = analyticsLoading || callsLoading;

  // Loading skeleton
  if (cardsLoading) {
    return (
      <div className={cn("container mx-auto py-6 space-y-6", className)}>
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  // Empty state - no cards
  if (businessCards.length === 0) {
    return (
      <div className={cn("container mx-auto py-6", className)}>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <Phone className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold mb-2">No Business Cards Found</h2>
            <p className="text-muted-foreground">
              Create a business card to get started with voice analytics.
            </p>
          </div>
          <Button data-testid="button-create-card">Create Business Card</Button>
        </div>
      </div>
    );
  }

  // Empty state - no voice agent
  if (!isLoading && !analytics) {
    return (
      <div className={cn("container mx-auto py-6 space-y-6", className)}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-voice-analytics-title">
              Voice Analytics
            </h1>
            <p className="text-muted-foreground">
              AI-powered call analytics and insights
            </p>
          </div>
          
          <Select value={selectedCard} onValueChange={setSelectedCard} data-testid="select-card">
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a card" />
            </SelectTrigger>
            <SelectContent>
              {businessCards.map((card: any) => (
                <SelectItem key={card.id} value={card.id}>
                  {card.fullName || 'Untitled Card'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
          <Phone className="h-16 w-16 text-muted-foreground" />
          <div>
            <h2 className="text-2xl font-bold mb-2">No Voice Agent Configured</h2>
            <p className="text-muted-foreground mb-4">
              Set up a voice agent for this card to start tracking call analytics.
            </p>
            <Button data-testid="button-setup-voice-agent">Setup Voice Agent</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("container mx-auto py-6 space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-voice-analytics-title">
            Voice Analytics
          </h1>
          <p className="text-muted-foreground">
            AI-powered call analytics and insights
          </p>
        </div>
        
        <Select value={selectedCard} onValueChange={setSelectedCard} data-testid="select-card">
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Select a card" />
          </SelectTrigger>
          <SelectContent>
            {businessCards.map((card: any) => (
              <SelectItem key={card.id} value={card.id}>
                {card.fullName || 'Untitled Card'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overview Statistics Cards */}
      {analytics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card data-testid="card-total-calls">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
                <Phone className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-calls">
                  {analytics.overview.totalCalls.toLocaleString()}
                </div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                  <span>{analytics.overview.completedCalls} completed</span>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="card-total-duration">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-duration">
                  {formatTotalDuration(analytics.overview.totalDuration)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total talk time
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-avg-duration">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-avg-duration">
                  {formatDuration(analytics.overview.avgDuration)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per call average
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-appointments-booked">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Appointments Booked</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-appointments-booked">
                  {analytics.overview.appointmentsBooked}
                </div>
                <p className="text-xs text-muted-foreground">
                  Scheduled appointments
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-leads-qualified">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Leads Qualified</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-leads-qualified">
                  {analytics.overview.leadsQualified}
                </div>
                <p className="text-xs text-muted-foreground">
                  Qualified prospects
                </p>
              </CardContent>
            </Card>

            <Card data-testid="card-answer-rate">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Answer Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-answer-rate">
                  {analytics.conversionRates.answerRate}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Calls answered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Rates Section */}
          <Card data-testid="card-conversion-rates">
            <CardHeader>
              <CardTitle>Conversion Rates</CardTitle>
              <CardDescription>Performance metrics and conversion analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Appointment Conversion Rate</span>
                  <span className="text-sm font-bold" data-testid="text-appointment-conversion">
                    {analytics.conversionRates.appointmentConversionRate}%
                  </span>
                </div>
                <Progress 
                  value={analytics.conversionRates.appointmentConversionRate} 
                  className="h-2" 
                  data-testid="progress-appointment-conversion"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Qualification Rate</span>
                  <span className="text-sm font-bold" data-testid="text-qualification-rate">
                    {analytics.conversionRates.qualificationRate}%
                  </span>
                </div>
                <Progress 
                  value={analytics.conversionRates.qualificationRate} 
                  className="h-2"
                  data-testid="progress-qualification-rate"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Answer Rate</span>
                  <span className="text-sm font-bold" data-testid="text-answer-rate-progress">
                    {analytics.conversionRates.answerRate}%
                  </span>
                </div>
                <Progress 
                  value={analytics.conversionRates.answerRate} 
                  className="h-2"
                  data-testid="progress-answer-rate"
                />
              </div>
            </CardContent>
          </Card>

          {/* Call History Table */}
          <Card data-testid="card-call-history">
            <CardHeader>
              <CardTitle>Call History</CardTitle>
              <CardDescription>Complete call log with details</CardDescription>
            </CardHeader>
            <CardContent>
              {callsLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : calls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Phone className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No calls recorded yet</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead data-testid="header-datetime">Date/Time</TableHead>
                        <TableHead data-testid="header-direction">Direction</TableHead>
                        <TableHead data-testid="header-caller">Caller Number</TableHead>
                        <TableHead data-testid="header-status">Status</TableHead>
                        <TableHead data-testid="header-duration">Duration</TableHead>
                        <TableHead data-testid="header-outcome">Outcome</TableHead>
                        <TableHead data-testid="header-actions">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {calls.map((call) => (
                        <TableRow key={call.id} data-testid={`row-call-${call.id}`}>
                          <TableCell data-testid={`cell-datetime-${call.id}`}>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">
                                {format(new Date(call.createdAt), 'MMM dd, yyyy')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(call.createdAt), 'h:mm a')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`cell-direction-${call.id}`}>
                            <div className="flex items-center gap-2">
                              {call.direction === 'inbound' ? (
                                <PhoneIncoming className="h-4 w-4 text-green-500" />
                              ) : (
                                <PhoneOutgoing className="h-4 w-4 text-blue-500" />
                              )}
                              <span className="text-sm capitalize">{call.direction}</span>
                            </div>
                          </TableCell>
                          <TableCell data-testid={`cell-caller-${call.id}`}>
                            <span className="text-sm font-mono">
                              {call.callerNumber || 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell data-testid={`cell-status-${call.id}`}>
                            <Badge variant={getStatusColor(call.status) as any}>
                              {call.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell data-testid={`cell-duration-${call.id}`}>
                            <span className="text-sm font-medium">
                              {formatDuration(call.duration)}
                            </span>
                          </TableCell>
                          <TableCell data-testid={`cell-outcome-${call.id}`}>
                            {call.outcome ? (
                              <Badge variant={getOutcomeColor(call.outcome) as any}>
                                {call.outcome.replace('_', ' ')}
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">N/A</span>
                            )}
                          </TableCell>
                          <TableCell data-testid={`cell-actions-${call.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!call.transcript}
                              data-testid={`button-view-transcript-${call.id}`}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Calls Summary */}
          <Card data-testid="card-recent-calls">
            <CardHeader>
              <CardTitle>Recent Calls</CardTitle>
              <CardDescription>Last 10 call activities</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.recentCalls.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No recent calls</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.recentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                      data-testid={`recent-call-${call.id}`}
                    >
                      <div className="flex items-center gap-3">
                        {call.direction === 'inbound' ? (
                          <PhoneIncoming className="h-5 w-5 text-green-500" />
                        ) : (
                          <PhoneOutgoing className="h-5 w-5 text-blue-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {call.callerNumber || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(call.createdAt), 'MMM dd, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(call.status) as any}>
                          {call.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatDuration(call.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
