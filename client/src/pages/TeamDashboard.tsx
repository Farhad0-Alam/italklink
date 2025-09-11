import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Users, Calendar, BarChart3, Settings, UserPlus, Shield, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface TeamMember {
  id: string;
  userId: string;
  role: string;
  status: string;
  joinedAt: string;
  skills?: string[];
  currentCapacity?: number;
  maxCapacity?: number;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Team {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  maxMembers: number;
  createdAt: string;
  members?: TeamMember[];
}

interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  averageUtilization: number;
  roundRobinBalance: number;
  routingEfficiency: number;
  memberCapacities: Record<string, { current: number; maximum: number }>;
}

export default function TeamDashboard() {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user teams
  const { data: teams = [], isLoading: teamsLoading } = useQuery({
    queryKey: ['/api/teams'],
    enabled: true
  });

  // Fetch team members for selected team
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery({
    queryKey: ['/api/teams', selectedTeam, 'members'],
    enabled: !!selectedTeam
  });

  // Fetch team scheduling stats
  const { data: teamStats, isLoading: statsLoading } = useQuery<TeamStats>({
    queryKey: ['/api/teams', selectedTeam, 'stats', 'scheduling'],
    enabled: !!selectedTeam
  });

  // Fetch team assignments for activity feed
  const { data: recentAssignments = [], isLoading: assignmentsLoading } = useQuery({
    queryKey: ['/api/teams', selectedTeam, 'assignments'],
    enabled: !!selectedTeam
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; maxMembers: number }) => {
      return await apiRequest('/api/teams', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      setShowCreateDialog(false);
      toast({
        title: 'Team Created',
        description: 'Team has been created successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  // Invite team member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: async (data: { email: string; role: string }) => {
      return await apiRequest(`/api/teams/${selectedTeam}/members`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams', selectedTeam, 'members'] });
      setShowInviteDialog(false);
      toast({
        title: 'Invitation Sent',
        description: 'Team member invitation has been sent.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
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

  const handleCreateTeam = (formData: FormData) => {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const maxMembers = parseInt(formData.get('maxMembers') as string) || 10;

    createTeamMutation.mutate({ name, description, maxMembers });
  };

  const handleInviteMember = (formData: FormData) => {
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    inviteMemberMutation.mutate({ email, role });
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'member': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on_leave': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
    <div className="container mx-auto p-6 space-y-6" data-testid="team-dashboard">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="dashboard-title">
            Team Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Manage team scheduling, assignments, and performance
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-team">
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Create a new team for managing appointments and scheduling.
              </DialogDescription>
            </DialogHeader>
            <form action={handleCreateTeam} className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Sales Team"
                  required
                  data-testid="input-team-name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Team handling sales appointments..."
                  data-testid="input-team-description"
                />
              </div>
              <div>
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Input
                  id="maxMembers"
                  name="maxMembers"
                  type="number"
                  placeholder="10"
                  min="1"
                  max="100"
                  defaultValue="10"
                  data-testid="input-max-members"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  data-testid="button-cancel-create"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createTeamMutation.isPending}
                  data-testid="button-submit-create"
                >
                  {createTeamMutation.isPending ? 'Creating...' : 'Create Team'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team Selection */}
      {teams.length > 0 && (
        <div className="flex items-center space-x-4">
          <Label htmlFor="team-select">Select Team:</Label>
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-64" data-testid="select-team">
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

      {/* Team Overview Cards */}
      {selectedTeam && teamStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="card-total-members">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-total-members">
                {teamStats.totalMembers}
              </div>
              <p className="text-xs text-muted-foreground">
                {teamStats.activeMembers} active
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-utilization">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-utilization">
                {Math.round(teamStats.averageUtilization)}%
              </div>
              <Progress value={teamStats.averageUtilization} className="mt-2" />
            </CardContent>
          </Card>

          <Card data-testid="card-round-robin">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Round Robin Balance</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-round-robin-balance">
                {Math.round(teamStats.roundRobinBalance)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Distribution fairness
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-routing-efficiency">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Routing Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="text-routing-efficiency">
                {Math.round(teamStats.routingEfficiency)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Smart assignment success
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      {selectedTeam && (
        <Tabs defaultValue="members" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="members" data-testid="tab-members">Members</TabsTrigger>
            <TabsTrigger value="assignments" data-testid="tab-assignments">Assignments</TabsTrigger>
            <TabsTrigger value="scheduling" data-testid="tab-scheduling">Scheduling</TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Team Members</h3>
              <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                <DialogTrigger asChild>
                  <Button data-testid="button-invite-member">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Invite Team Member</DialogTitle>
                    <DialogDescription>
                      Send an invitation to join this team.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={handleInviteMember} className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="colleague@company.com"
                        required
                        data-testid="input-invite-email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Role</Label>
                      <Select name="role" defaultValue="member">
                        <SelectTrigger data-testid="select-invite-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="viewer">Viewer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowInviteDialog(false)}
                        data-testid="button-cancel-invite"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={inviteMemberMutation.isPending}
                        data-testid="button-submit-invite"
                      >
                        {inviteMemberMutation.isPending ? 'Inviting...' : 'Send Invitation'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-0">
                {membersLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Loading members...</p>
                  </div>
                ) : teamMembers.length === 0 ? (
                  <div className="p-6 text-center text-gray-600 dark:text-gray-300">
                    No team members found. Invite some members to get started.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Member</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Capacity</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member: TeamMember) => (
                        <TableRow key={member.id} data-testid={`row-member-${member.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium">
                                  {member.user?.name?.charAt(0) || 'U'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium" data-testid={`text-member-name-${member.id}`}>
                                  {member.user?.name || 'Unknown User'}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                  {member.user?.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getRoleColor(member.role)} data-testid={`badge-role-${member.id}`}>
                              <Shield className="h-3 w-3 mr-1" />
                              {member.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(member.status)} data-testid={`badge-status-${member.id}`}>
                              {member.status.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {teamStats?.memberCapacities?.[member.userId] ? (
                              <div className="space-y-1">
                                <div className="text-sm" data-testid={`text-capacity-${member.id}`}>
                                  {teamStats.memberCapacities[member.userId].current}/
                                  {teamStats.memberCapacities[member.userId].maximum}
                                </div>
                                <Progress 
                                  value={(teamStats.memberCapacities[member.userId].current / 
                                          teamStats.memberCapacities[member.userId].maximum) * 100}
                                  className="h-1"
                                />
                              </div>
                            ) : (
                              <span className="text-sm text-gray-500">Not set</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" data-testid={`button-settings-${member.id}`}>
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Assignments Tab */}
          <TabsContent value="assignments" className="space-y-4">
            <h3 className="text-lg font-semibold">Recent Assignments</h3>
            <Card>
              <CardContent className="p-0">
                {assignmentsLoading ? (
                  <div className="p-6 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600 dark:text-gray-300">Loading assignments...</p>
                  </div>
                ) : recentAssignments.length === 0 ? (
                  <div className="p-6 text-center text-gray-600 dark:text-gray-300">
                    No recent assignments found.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Assignment ID</TableHead>
                        <TableHead>Member</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assigned</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentAssignments.slice(0, 10).map((assignment: any) => (
                        <TableRow key={assignment.id} data-testid={`row-assignment-${assignment.id}`}>
                          <TableCell className="font-mono text-sm">
                            {assignment.id.slice(0, 8)}...
                          </TableCell>
                          <TableCell data-testid={`text-assigned-member-${assignment.id}`}>
                            {assignment.assignedMemberId}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" data-testid={`badge-type-${assignment.id}`}>
                              {assignment.assignmentType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              className={assignment.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                              data-testid={`badge-assignment-status-${assignment.id}`}
                            >
                              {assignment.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600 dark:text-gray-300">
                            {new Date(assignment.assignedAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduling Tab */}
          <TabsContent value="scheduling" className="space-y-4">
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Scheduling Interface
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Advanced scheduling features coming soon
              </p>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-4">
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Team Analytics Dashboard
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Performance analytics and insights coming soon
              </p>
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {teams.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            No teams yet
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Create your first team to start managing appointments and scheduling
          </p>
          <Button onClick={() => setShowCreateDialog(true)} data-testid="button-create-first-team">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Team
          </Button>
        </div>
      )}
    </div>
  );
}