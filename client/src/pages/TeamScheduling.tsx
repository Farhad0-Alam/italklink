import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Clock, Users, RotateCcw, Zap, ArrowRight, CheckCircle, AlertCircle, User, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface Team {
  id: string;
  name: string;
  description: string;
}

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  status: string;
  user?: {
    name: string;
    email: string;
  };
}

interface CollectiveAvailabilitySlot {
  timeSlot: string;
  availableMembers: string[];
  minimumMet: boolean;
  preferredMet: boolean;
}

interface RoundRobinState {
  id: string;
  teamId: string;
  currentIndex: number;
  rotationOrder: string[];
  memberAssignmentCounts: Record<string, number>;
  totalAssignments: number;
  lastAssignedMemberId?: string;
}

interface OptimalAssignment {
  recommendedMemberId: string;
  score: number;
  reasoning: string;
  alternatives: Array<{ memberId: string; score: number }>;
}

export default function TeamScheduling() {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [appointmentDuration, setAppointmentDuration] = useState<number>(60);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [showOptimalAssignmentDialog, setShowOptimalAssignmentDialog] = useState(false);
  const [showRoundRobinDialog, setShowRoundRobinDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user teams
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['/api/teams'],
    enabled: true
  });

  // Fetch team members
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/teams', selectedTeam, 'members'],
    enabled: !!selectedTeam
  });

  // Fetch collective availability
  const { data: collectiveAvailability = [], isLoading: availabilityLoading } = useQuery<CollectiveAvailabilitySlot[]>({
    queryKey: ['/api/teams', selectedTeam, 'availability', 'collective'],
    queryFn: async () => {
      if (!selectedTeam || !selectedDate) return [];
      
      return await apiRequest(`/api/teams/${selectedTeam}/availability/collective`, {
        method: 'POST',
        body: JSON.stringify({
          date: selectedDate,
          duration: appointmentDuration
        })
      });
    },
    enabled: !!selectedTeam && !!selectedDate
  });

  // Fetch round-robin state
  const { data: roundRobinState, isLoading: rrStateLoading } = useQuery<RoundRobinState>({
    queryKey: ['/api/teams', selectedTeam, 'round-robin', 'state'],
    enabled: !!selectedTeam
  });

  // Get next round-robin assignment mutation
  const getNextRoundRobinMutation = useMutation({
    mutationFn: async (data: { eventTypeId?: string; requiredSkills?: string[]; excludeMembers?: string[] }) => {
      return await apiRequest(`/api/teams/${selectedTeam}/round-robin/next`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      toast({
        title: 'Round-Robin Assignment',
        description: `Next assignment: ${getMemberName(data.memberId)}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeam, 'round-robin', 'state'] });
    },
    onError: (error) => {
      toast({
        title: 'Assignment Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Find optimal assignment mutation
  const findOptimalAssignmentMutation = useMutation({
    mutationFn: async (appointmentContext: {
      eventTypeId: string;
      duration: number;
      scheduledTime: string;
      requiredSkills?: string[];
      preferredMembers?: string[];
    }) => {
      return await apiRequest(`/api/teams/${selectedTeam}/assignment/optimal`, {
        method: 'POST',
        body: JSON.stringify(appointmentContext)
      });
    },
    onSuccess: (data: OptimalAssignment) => {
      toast({
        title: 'Optimal Assignment Found',
        description: `Recommended: ${getMemberName(data.recommendedMemberId)} (Score: ${Math.round(data.score)})`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Assignment Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Reset round-robin mutation
  const resetRoundRobinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/teams/${selectedTeam}/round-robin/reset`, {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: () => {
      toast({
        title: 'Round-Robin Reset',
        description: 'Assignment rotation has been reset successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeam, 'round-robin', 'state'] });
    },
    onError: (error) => {
      toast({
        title: 'Reset Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Rebalance round-robin mutation
  const rebalanceRoundRobinMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/teams/${selectedTeam}/round-robin/rebalance`, {
        method: 'POST',
        body: JSON.stringify({})
      });
    },
    onSuccess: () => {
      toast({
        title: 'Round-Robin Rebalanced',
        description: 'Assignment distribution has been rebalanced.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeam, 'round-robin', 'state'] });
    },
    onError: (error) => {
      toast({
        title: 'Rebalance Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Set default selected team
  useEffect(() => {
    if (teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, selectedTeam]);

  const getMemberName = (userId: string) => {
    const member = teamMembers.find(m => m.userId === userId);
    return member?.user?.name || 'Unknown Member';
  };

  const getAvailabilityStatus = (slot: CollectiveAvailabilitySlot) => {
    if (slot.preferredMet) return { status: 'optimal', color: 'bg-green-100 text-green-800' };
    if (slot.minimumMet) return { status: 'good', color: 'bg-blue-100 text-blue-800' };
    return { status: 'limited', color: 'bg-yellow-100 text-yellow-800' };
  };

  const handleOptimalAssignment = () => {
    if (!selectedTimeSlot) {
      toast({
        title: 'Time Required',
        description: 'Please select a time slot for the assignment.',
        variant: 'destructive'
      });
      return;
    }

    const scheduledTime = `${selectedDate}T${selectedTimeSlot}:00.000Z`;
    
    findOptimalAssignmentMutation.mutate({
      eventTypeId: 'default',
      duration: appointmentDuration,
      scheduledTime,
      requiredSkills: [],
      preferredMembers: []
    });
  };

  if (teamsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading teams...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="team-scheduling">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="scheduling-title">
            Team Scheduling
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced team scheduling with collective availability and intelligent assignment
          </p>
        </div>
      </div>

      {/* Team Selection */}
      {teams.length > 0 && (
        <div className="flex items-center space-x-4">
          <Label htmlFor="team-select">Team:</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-64" data-testid="select-scheduling-team">
              <SelectValue placeholder="Choose a team" />
            </SelectTrigger>
            <SelectContent>
              {teams.map((team: Team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Scheduling Controls */}
      {selectedTeam && (
        <Card data-testid="card-scheduling-controls">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Scheduling Parameters
            </CardTitle>
            <CardDescription>
              Configure date, duration, and scheduling preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="date-picker">Date</Label>
                <Input
                  id="date-picker"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  data-testid="input-scheduling-date"
                />
              </div>
              
              <div>
                <Label htmlFor="duration-select">Duration (minutes)</Label>
                <Select value={appointmentDuration.toString()} onValueChange={(value) => setAppointmentDuration(parseInt(value))}>
                  <SelectTrigger data-testid="select-appointment-duration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="time-slot">Selected Time</Label>
                <Input
                  id="time-slot"
                  type="time"
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  data-testid="input-time-slot"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      {selectedTeam && (
        <Tabs defaultValue="collective" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="collective" data-testid="tab-collective">Collective Availability</TabsTrigger>
            <TabsTrigger value="round-robin" data-testid="tab-round-robin">Round-Robin</TabsTrigger>
            <TabsTrigger value="optimal" data-testid="tab-optimal">Optimal Assignment</TabsTrigger>
          </TabsList>

          {/* Collective Availability Tab */}
          <TabsContent value="collective" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Collective Team Availability
                </CardTitle>
                <CardDescription>
                  View time slots when multiple team members are available
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-3">Loading availability...</span>
                  </div>
                ) : collectiveAvailability.length === 0 ? (
                  <div className="text-center py-8 text-gray-600 dark:text-gray-300">
                    No availability data found for selected date and duration.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {collectiveAvailability.map((slot, index) => {
                        const { status, color } = getAvailabilityStatus(slot);
                        return (
                          <div
                            key={index}
                            className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                            onClick={() => setSelectedTimeSlot(slot.timeSlot)}
                            data-testid={`slot-${slot.timeSlot}`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-lg">
                                {slot.timeSlot}
                              </span>
                              <Badge className={color}>
                                {status}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {slot.availableMembers.length} member{slot.availableMembers.length !== 1 ? 's' : ''} available
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {slot.availableMembers.slice(0, 3).map(memberId => (
                                <Badge key={memberId} variant="outline" className="text-xs">
                                  {getMemberName(memberId)}
                                </Badge>
                              ))}
                              {slot.availableMembers.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{slot.availableMembers.length - 3} more
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center mt-2 space-x-2">
                              {slot.minimumMet && (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              )}
                              {!slot.minimumMet && (
                                <AlertCircle className="h-4 w-4 text-yellow-500" />
                              )}
                              <span className="text-xs text-gray-500">
                                {slot.preferredMet ? 'Preferred coverage' : slot.minimumMet ? 'Minimum coverage' : 'Limited coverage'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Round-Robin Tab */}
          <TabsContent value="round-robin" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Round-Robin State */}
              <Card data-testid="card-round-robin-state">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <RotateCcw className="h-5 w-5 mr-2" />
                    Round-Robin State
                  </CardTitle>
                  <CardDescription>
                    Current rotation status and assignment distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {rrStateLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">Loading state...</span>
                    </div>
                  ) : roundRobinState ? (
                    <>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Total Assignments:</span>
                          <span className="font-bold" data-testid="text-total-assignments">
                            {roundRobinState.totalAssignments}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Current Index:</span>
                          <span className="font-bold" data-testid="text-current-index">
                            {roundRobinState.currentIndex}
                          </span>
                        </div>
                        
                        {roundRobinState.lastAssignedMemberId && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Last Assigned:</span>
                            <span className="font-bold" data-testid="text-last-assigned">
                              {getMemberName(roundRobinState.lastAssignedMemberId)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-medium mb-3">Assignment Distribution:</h4>
                        <div className="space-y-2">
                          {Object.entries(roundRobinState.memberAssignmentCounts).map(([userId, count]) => (
                            <div key={userId} className="flex items-center justify-between">
                              <span className="text-sm" data-testid={`member-${userId}`}>
                                {getMemberName(userId)}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="font-medium" data-testid={`count-${userId}`}>
                                  {count}
                                </span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full"
                                    style={{ 
                                      width: roundRobinState.totalAssignments > 0 
                                        ? `${(count / roundRobinState.totalAssignments) * 100}%`
                                        : '0%'
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-gray-600 dark:text-gray-300">
                      No round-robin state found. The system will initialize when first assignment is made.
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Round-Robin Actions */}
              <Card data-testid="card-round-robin-actions">
                <CardHeader>
                  <CardTitle>Round-Robin Actions</CardTitle>
                  <CardDescription>
                    Manage round-robin assignments and distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => getNextRoundRobinMutation.mutate({})}
                    disabled={getNextRoundRobinMutation.isPending}
                    className="w-full"
                    data-testid="button-next-assignment"
                  >
                    <User className="h-4 w-4 mr-2" />
                    {getNextRoundRobinMutation.isPending ? 'Getting Assignment...' : 'Get Next Assignment'}
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => rebalanceRoundRobinMutation.mutate()}
                      disabled={rebalanceRoundRobinMutation.isPending}
                      className="flex-1"
                      data-testid="button-rebalance"
                    >
                      {rebalanceRoundRobinMutation.isPending ? 'Rebalancing...' : 'Rebalance'}
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => resetRoundRobinMutation.mutate()}
                      disabled={resetRoundRobinMutation.isPending}
                      className="flex-1"
                      data-testid="button-reset"
                    >
                      {resetRoundRobinMutation.isPending ? 'Resetting...' : 'Reset'}
                    </Button>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Rotation Order:</h4>
                    <div className="flex flex-wrap gap-2">
                      {roundRobinState?.rotationOrder.map((userId, index) => (
                        <Badge
                          key={userId}
                          variant={index === roundRobinState.currentIndex ? "default" : "outline"}
                          data-testid={`rotation-${userId}`}
                        >
                          {index === roundRobinState.currentIndex && (
                            <ArrowRight className="h-3 w-3 mr-1" />
                          )}
                          {getMemberName(userId)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Optimal Assignment Tab */}
          <TabsContent value="optimal" className="space-y-4">
            <Card data-testid="card-optimal-assignment">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2" />
                  Optimal Assignment Engine
                </CardTitle>
                <CardDescription>
                  Find the best team member for specific appointment requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button
                    onClick={handleOptimalAssignment}
                    disabled={findOptimalAssignmentMutation.isPending || !selectedTimeSlot}
                    size="lg"
                    data-testid="button-find-optimal"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {findOptimalAssignmentMutation.isPending ? 'Finding Optimal Assignment...' : 'Find Optimal Assignment'}
                  </Button>
                  
                  {!selectedTimeSlot && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                      Please select a time slot first
                    </p>
                  )}
                </div>

                {findOptimalAssignmentMutation.data && (
                  <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                    <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                      Optimal Assignment Found
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span>Recommended Member:</span>
                        <span className="font-medium" data-testid="text-recommended-member">
                          {getMemberName(findOptimalAssignmentMutation.data.recommendedMemberId)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Assignment Score:</span>
                        <span className="font-medium" data-testid="text-assignment-score">
                          {Math.round(findOptimalAssignmentMutation.data.score)}/100
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {findOptimalAssignmentMutation.data.reasoning}
                        </span>
                      </div>
                      
                      {findOptimalAssignmentMutation.data.alternatives.length > 0 && (
                        <div className="pt-2 border-t">
                          <span className="text-sm font-medium">Alternative Options:</span>
                          <div className="mt-1 space-y-1">
                            {findOptimalAssignmentMutation.data.alternatives.slice(0, 3).map((alt, index) => (
                              <div key={index} className="flex items-center justify-between text-sm">
                                <span data-testid={`alt-member-${index}`}>
                                  {getMemberName(alt.memberId)}
                                </span>
                                <span data-testid={`alt-score-${index}`}>
                                  {Math.round(alt.score)}/100
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No teams available
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Create a team first to access advanced scheduling features
          </p>
        </div>
      )}
    </div>
  );
}