import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks, useCreateTask, useUpdateTask, useCompleteTask, useContacts, useDeals } from "../hooks/useCRM";
import { Task, TaskCreateInput } from "../types";
import { 
  Plus, 
  CheckSquare, 
  Clock, 
  AlertCircle, 
  User, 
  Target, 
  MoreHorizontal, 
  Edit, 
  Trash2,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  Users,
  Video,
  FileText
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, isPast } from "date-fns";

export function TasksManager() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // API hooks
  const { data: tasksResponse, isLoading: tasksLoading, error: tasksError } = useTasks({
    status: statusFilter === "all" ? undefined : statusFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });
  const { data: contactsResponse } = useContacts();
  const { data: dealsResponse } = useDeals();
  
  // Handle API response structure
  const tasks = tasksResponse?.tasks || tasksResponse || [];
  const contacts = contactsResponse?.contacts || contactsResponse || [];
  const deals = dealsResponse?.deals || dealsResponse || [];
  
  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask(selectedTask?.id || "");
  const completeTaskMutation = useCompleteTask();


  // Use real data from API - no mock fallback to ensure consistency
  const displayTasks = tasks;

  const getTaskIcon = (type: Task['type']) => {
    switch (type) {
      case 'call': return <Phone className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      case 'meeting': return <Calendar className="h-4 w-4" />;
      case 'follow_up': return <MessageSquare className="h-4 w-4" />;
      case 'demo': return <Video className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskUrgency = (dueDate?: string) => {
    if (!dueDate) return null;
    
    const due = new Date(dueDate);
    if (isPast(due)) return 'overdue';
    if (isToday(due)) return 'today';
    if (isTomorrow(due)) return 'tomorrow';
    if (isThisWeek(due)) return 'this-week';
    return 'upcoming';
  };

  const getUrgencyColor = (urgency: string | null) => {
    switch (urgency) {
      case 'overdue': return 'border-red-500 bg-red-50';
      case 'today': return 'border-orange-500 bg-orange-50';
      case 'tomorrow': return 'border-yellow-500 bg-yellow-50';
      case 'this-week': return 'border-blue-500 bg-blue-50';
      default: return '';
    }
  };

  const handleCreateTask = (data: TaskCreateInput) => {
    createTaskMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Task created",
          description: "New task has been added successfully.",
        });
        setShowCreateDialog(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error creating task",
          description: error.message || "Failed to create task.",
          variant: "destructive",
        });
      },
    });
  };

  const handleCompleteTask = (taskId: string, notes?: string) => {
    completeTaskMutation.mutate({ taskId, notes }, {
      onSuccess: () => {
        toast({
          title: "Task completed",
          description: "Task has been marked as completed.",
        });
      },
      onError: (error: any) => {
        toast({
          title: "Error completing task",
          description: error.message || "Failed to complete task.",
          variant: "destructive",
        });
      },
    });
  };

  const getTasksForCalendar = () => {
    const today = new Date();
    const tasksWithDates = displayTasks.filter(task => task.dueDate && task.status !== 'completed');
    
    const grouped = {
      overdue: tasksWithDates.filter(task => isPast(new Date(task.dueDate!)) && task.status !== 'completed'),
      today: tasksWithDates.filter(task => isToday(new Date(task.dueDate!))),
      tomorrow: tasksWithDates.filter(task => isTomorrow(new Date(task.dueDate!))),
      thisWeek: tasksWithDates.filter(task => isThisWeek(new Date(task.dueDate!)) && !isToday(new Date(task.dueDate!)) && !isTomorrow(new Date(task.dueDate!))),
      upcoming: tasksWithDates.filter(task => !isThisWeek(new Date(task.dueDate!)) && !isPast(new Date(task.dueDate!)))
    };

    return grouped;
  };

  const taskStats = {
    total: displayTasks.length,
    pending: displayTasks.filter(t => t.status === 'pending').length,
    inProgress: displayTasks.filter(t => t.status === 'in_progress').length,
    completed: displayTasks.filter(t => t.status === 'completed').length,
    overdue: displayTasks.filter(t => t.dueDate && isPast(new Date(t.dueDate)) && t.status !== 'completed').length,
  };

  if (tasksLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (tasksError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-tasks-header">
              Tasks
            </h2>
            <p className="text-red-600 mt-1">Failed to load tasks. Please try again.</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-retry-tasks">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-tasks-header">
            Tasks ({taskStats.total})
          </h2>
          <p className="text-gray-600 mt-1">Manage your tasks and follow-ups</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-task">
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </DialogTrigger>
          <TaskForm
            contacts={contacts}
            deals={deals}
            onSubmit={handleCreateTask}
            onCancel={() => setShowCreateDialog(false)}
            isLoading={createTaskMutation.isPending}
          />
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <CheckSquare className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{taskStats.completed}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Clock className="h-8 w-8 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{taskStats.pending}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <Users className="h-8 w-8 text-purple-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{taskStats.inProgress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{taskStats.overdue}</p>
              <p className="text-sm text-gray-600">Overdue</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <FileText className="h-8 w-8 text-gray-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{taskStats.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 lg:w-fit">
          <TabsTrigger value="list" data-testid="tab-task-list">List View</TabsTrigger>
          <TabsTrigger value="calendar" data-testid="tab-task-calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-48" data-testid="select-priority-filter">
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tasks List */}
          <div className="space-y-3">
            {displayTasks.map((task) => {
              const urgency = getTaskUrgency(task.dueDate);
              return (
                <Card 
                  key={task.id} 
                  className={`hover:shadow-md transition-shadow ${getUrgencyColor(urgency)}`}
                  data-testid={`task-card-${task.id}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Checkbox
                          checked={task.status === 'completed'}
                          onCheckedChange={(checked) => {
                            if (checked && task.status !== 'completed') {
                              handleCompleteTask(task.id);
                            }
                          }}
                          data-testid={`checkbox-task-${task.id}`}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              {getTaskIcon(task.type)}
                              <h3 className={`font-semibold ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                {task.title}
                              </h3>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                                {task.status.replace('_', ' ')}
                              </Badge>
                              <div className={`flex items-center ${getPriorityColor(task.priority)}`}>
                                <AlertCircle className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className={`text-sm mb-2 ${task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description}
                            </p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            {task.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span className={urgency === 'overdue' ? 'text-red-600 font-medium' : ''}>
                                  Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                                </span>
                              </div>
                            )}
                            
                            {task.contact && (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>{task.contact.firstName} {task.contact.lastName}</span>
                                {task.contact.company && (
                                  <span>• {task.contact.company}</span>
                                )}
                              </div>
                            )}
                            
                            {task.deal && (
                              <div className="flex items-center space-x-1">
                                <Target className="h-4 w-4" />
                                <span>${task.deal.value.toLocaleString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" data-testid={`button-task-menu-${task.id}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedTask(task)}>
                            <CheckSquare className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          {task.status !== 'completed' && (
                            <DropdownMenuItem onClick={() => handleCompleteTask(task.id)}>
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Mark Complete
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {(() => {
            const calendarTasks = getTasksForCalendar();
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Overdue */}
                {calendarTasks.overdue.length > 0 && (
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center text-red-700">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Overdue ({calendarTasks.overdue.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {calendarTasks.overdue.map((task) => (
                        <div key={task.id} className="p-3 bg-white rounded-lg shadow-sm border border-red-200">
                          <div className="flex items-start space-x-2">
                            {getTaskIcon(task.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{task.title}</p>
                              <p className="text-xs text-red-600">
                                Due {format(new Date(task.dueDate!), "MMM dd, h:mm a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Today */}
                <Card className="border-orange-200 bg-orange-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-orange-700">
                      <Clock className="h-5 w-5 mr-2" />
                      Today ({calendarTasks.today.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calendarTasks.today.length > 0 ? (
                      calendarTasks.today.map((task) => (
                        <div key={task.id} className="p-3 bg-white rounded-lg shadow-sm border border-orange-200">
                          <div className="flex items-start space-x-2">
                            {getTaskIcon(task.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{task.title}</p>
                              <p className="text-xs text-orange-600">
                                Due {format(new Date(task.dueDate!), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No tasks due today</p>
                    )}
                  </CardContent>
                </Card>

                {/* Tomorrow */}
                <Card className="border-yellow-200 bg-yellow-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-yellow-700">
                      <Calendar className="h-5 w-5 mr-2" />
                      Tomorrow ({calendarTasks.tomorrow.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calendarTasks.tomorrow.length > 0 ? (
                      calendarTasks.tomorrow.map((task) => (
                        <div key={task.id} className="p-3 bg-white rounded-lg shadow-sm border border-yellow-200">
                          <div className="flex items-start space-x-2">
                            {getTaskIcon(task.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{task.title}</p>
                              <p className="text-xs text-yellow-600">
                                Due {format(new Date(task.dueDate!), "h:mm a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No tasks due tomorrow</p>
                    )}
                  </CardContent>
                </Card>

                {/* This Week */}
                <Card className="border-blue-200 bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-blue-700">
                      <Calendar className="h-5 w-5 mr-2" />
                      This Week ({calendarTasks.thisWeek.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {calendarTasks.thisWeek.length > 0 ? (
                      calendarTasks.thisWeek.map((task) => (
                        <div key={task.id} className="p-3 bg-white rounded-lg shadow-sm border border-blue-200">
                          <div className="flex items-start space-x-2">
                            {getTaskIcon(task.type)}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm text-gray-900">{task.title}</p>
                              <p className="text-xs text-blue-600">
                                Due {format(new Date(task.dueDate!), "MMM dd, h:mm a")}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No tasks due this week</p>
                    )}
                  </CardContent>
                </Card>

                {/* Upcoming */}
                <Card className="border-gray-200 bg-gray-50 lg:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center text-gray-700">
                      <Clock className="h-5 w-5 mr-2" />
                      Upcoming ({calendarTasks.upcoming.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {calendarTasks.upcoming.length > 0 ? (
                        calendarTasks.upcoming.map((task) => (
                          <div key={task.id} className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="flex items-start space-x-2">
                              {getTaskIcon(task.type)}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900">{task.title}</p>
                                <p className="text-xs text-gray-600">
                                  Due {format(new Date(task.dueDate!), "MMM dd, yyyy h:mm a")}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-8 col-span-2">No upcoming tasks</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Task Form Component
interface TaskFormProps {
  task?: Task;
  contacts: any[];
  deals: any[];
  onSubmit: (data: TaskCreateInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function TaskForm({ task, contacts, deals, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState<TaskCreateInput>({
    title: task?.title || "",
    description: task?.description || "",
    type: task?.type || "other",
    priority: task?.priority || "medium",
    dueDate: task?.dueDate || "",
    contactId: task?.contactId || "",
    dealId: task?.dealId || "",
    assignedTo: task?.assignedTo || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-[600px]" data-testid="dialog-task-form">
      <DialogHeader>
        <DialogTitle>
          {task ? "Edit Task" : "Add New Task"}
        </DialogTitle>
        <DialogDescription>
          {task ? "Update the task information below." : "Create a new task to track follow-ups and activities."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Task Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Follow up call with client"
            required
            data-testid="input-task-title"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Detailed description of the task..."
            rows={3}
            data-testid="textarea-task-description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Task Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as any })}>
              <SelectTrigger data-testid="select-task-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="follow_up">Follow Up</SelectItem>
                <SelectItem value="demo">Demo</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as any })}>
              <SelectTrigger data-testid="select-task-priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date & Time</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate ? formData.dueDate.slice(0, 16) : ''}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value ? `${e.target.value}:00Z` : '' })}
            data-testid="input-due-date"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactId">Associated Contact</Label>
            <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
              <SelectTrigger data-testid="select-task-contact">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} {contact.company && `(${contact.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="dealId">Associated Deal</Label>
            <Select value={formData.dealId} onValueChange={(value) => setFormData({ ...formData, dealId: value })}>
              <SelectTrigger data-testid="select-task-deal">
                <SelectValue placeholder="Select deal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {deals.map((deal) => (
                  <SelectItem key={deal.id} value={deal.id}>
                    {deal.title} (${deal.value.toLocaleString()})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-save-task">
            {isLoading ? "Saving..." : task ? "Update Task" : "Create Task"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}