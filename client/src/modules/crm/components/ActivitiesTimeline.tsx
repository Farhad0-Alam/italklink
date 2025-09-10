import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useActivities } from "../hooks/useCRM";
import { Activity } from "../types";
import { 
  Activity as ActivityIcon, 
  User, 
  Target, 
  CheckSquare, 
  Mail, 
  Phone, 
  Calendar, 
  MessageSquare,
  DollarSign,
  Plus,
  Minus,
  Search,
  Filter
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";

export function ActivitiesTimeline() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");

  // API hook
  const { data: activities = [], isLoading: activitiesLoading, error: activitiesError } = useActivities({
    type: typeFilter || undefined,
    limit: 100,
  });


  // Use real data from API - no mock fallback to ensure consistency
  const displayActivities = activities;

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'contact_created': return <User className="h-4 w-4 text-blue-500" />;
      case 'deal_created': return <Target className="h-4 w-4 text-green-500" />;
      case 'deal_moved': return <Target className="h-4 w-4 text-orange-500" />;
      case 'deal_won': return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'deal_lost': return <Minus className="h-4 w-4 text-red-500" />;
      case 'task_created': return <Plus className="h-4 w-4 text-purple-500" />;
      case 'task_completed': return <CheckSquare className="h-4 w-4 text-green-500" />;
      case 'email_sent': return <Mail className="h-4 w-4 text-blue-500" />;
      case 'call_logged': return <Phone className="h-4 w-4 text-indigo-500" />;
      case 'meeting_scheduled': return <Calendar className="h-4 w-4 text-purple-500" />;
      case 'note_added': return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default: return <ActivityIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'contact_created': return 'border-blue-200 bg-blue-50';
      case 'deal_created': return 'border-green-200 bg-green-50';
      case 'deal_moved': return 'border-orange-200 bg-orange-50';
      case 'deal_won': return 'border-green-200 bg-green-50';
      case 'deal_lost': return 'border-red-200 bg-red-50';
      case 'task_created': return 'border-purple-200 bg-purple-50';
      case 'task_completed': return 'border-green-200 bg-green-50';
      case 'email_sent': return 'border-blue-200 bg-blue-50';
      case 'call_logged': return 'border-indigo-200 bg-indigo-50';
      case 'meeting_scheduled': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    }
    
    if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    }
    
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };

  const groupActivitiesByDate = (activities: Activity[]) => {
    const groups: { [key: string]: Activity[] } = {};
    
    activities.forEach((activity) => {
      const date = new Date(activity.createdAt);
      let dateKey: string;
      
      if (isToday(date)) {
        dateKey = "Today";
      } else if (isYesterday(date)) {
        dateKey = "Yesterday";
      } else {
        dateKey = format(date, "MMMM dd, yyyy");
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(activity);
    });
    
    return groups;
  };

  const filteredActivities = displayActivities.filter((activity) => {
    const matchesSearch = !searchTerm || 
      activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.contact?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.contact?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.contact?.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = !typeFilter || activity.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  if (activitiesLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4 animate-pulse">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (activitiesError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-activities-header">
              Activity Timeline
            </h2>
            <p className="text-red-600 mt-1">Failed to load activities. Please try again.</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-retry-activities">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-activities-header">
            Activity Timeline ({filteredActivities.length})
          </h2>
          <p className="text-gray-600 mt-1">Track all CRM interactions and updates</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-activities"
          />
        </div>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48" data-testid="select-activity-type">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="contact_created">Contact Created</SelectItem>
            <SelectItem value="deal_created">Deal Created</SelectItem>
            <SelectItem value="deal_moved">Deal Moved</SelectItem>
            <SelectItem value="deal_won">Deal Won</SelectItem>
            <SelectItem value="deal_lost">Deal Lost</SelectItem>
            <SelectItem value="task_created">Task Created</SelectItem>
            <SelectItem value="task_completed">Task Completed</SelectItem>
            <SelectItem value="email_sent">Email Sent</SelectItem>
            <SelectItem value="call_logged">Call Logged</SelectItem>
            <SelectItem value="meeting_scheduled">Meeting Scheduled</SelectItem>
          </SelectContent>
        </Select>

        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48" data-testid="select-date-range">
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { type: "contact_created", label: "Contacts", icon: User, color: "text-blue-600 bg-blue-100" },
          { type: "deal_created", label: "Deals", icon: Target, color: "text-green-600 bg-green-100" },
          { type: "task_completed", label: "Tasks", icon: CheckSquare, color: "text-purple-600 bg-purple-100" },
          { type: "email_sent", label: "Emails", icon: Mail, color: "text-indigo-600 bg-indigo-100" },
          { type: "call_logged", label: "Calls", icon: Phone, color: "text-orange-600 bg-orange-100" },
          { type: "meeting_scheduled", label: "Meetings", icon: Calendar, color: "text-pink-600 bg-pink-100" }
        ].map(({ type, label, icon: Icon, color }) => {
          const count = displayActivities.filter(a => a.type === type).length;
          return (
            <Card key={type} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-2 rounded-full ${color} mb-2`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-600">{label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Activities Timeline */}
      <div className="space-y-8">
        {Object.entries(groupedActivities).map(([date, dateActivities]) => (
          <div key={date} className="space-y-4">
            <div className="flex items-center space-x-4">
              <h3 className="text-lg font-semibold text-gray-900">{date}</h3>
              <div className="flex-1 h-px bg-gray-200"></div>
              <Badge variant="outline" className="text-xs">
                {dateActivities.length} activities
              </Badge>
            </div>

            <div className="space-y-4 ml-4">
              {dateActivities.map((activity, index) => (
                <div key={activity.id} className="flex space-x-4" data-testid={`activity-${activity.id}`}>
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-200 shadow-sm">
                      {getActivityIcon(activity.type)}
                    </div>
                    {index < dateActivities.length - 1 && (
                      <div className="w-px h-8 bg-gray-200 mt-2"></div>
                    )}
                  </div>

                  {/* Activity content */}
                  <div className="flex-1 pb-8">
                    <Card className={`border-l-4 ${getActivityColor(activity.type)}`}>
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Activity description */}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {activity.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getFormattedDate(activity.createdAt)}
                            </p>
                          </div>

                          {/* Associated entities */}
                          <div className="flex flex-wrap items-center gap-4 text-xs">
                            {activity.contact && (
                              <div className="flex items-center space-x-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                                    {activity.contact.firstName[0]}{activity.contact.lastName[0]}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {activity.contact.firstName} {activity.contact.lastName}
                                  </p>
                                  <p className="text-gray-500">
                                    {activity.contact.title && activity.contact.company
                                      ? `${activity.contact.title} at ${activity.contact.company}`
                                      : activity.contact.company || activity.contact.email
                                    }
                                  </p>
                                </div>
                              </div>
                            )}

                            {activity.deal && (
                              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-lg border border-green-200">
                                <Target className="h-3 w-3 text-green-600" />
                                <div>
                                  <p className="font-medium text-green-900">
                                    {activity.deal.title}
                                  </p>
                                  <p className="text-green-600">
                                    ${activity.deal.value.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}

                            {activity.task && (
                              <div className="flex items-center space-x-2 px-3 py-1 bg-purple-50 rounded-lg border border-purple-200">
                                <CheckSquare className="h-3 w-3 text-purple-600" />
                                <div>
                                  <p className="font-medium text-purple-900">
                                    {activity.task.title}
                                  </p>
                                  <p className="text-purple-600 capitalize">
                                    {activity.task.priority} priority
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Metadata */}
                          {activity.metadata && (
                            <div className="pt-2 border-t border-gray-100">
                              <div className="grid grid-cols-2 gap-4 text-xs">
                                {Object.entries(activity.metadata).map(([key, value]) => (
                                  <div key={key}>
                                    <span className="font-medium text-gray-600 capitalize">
                                      {key.replace(/_/g, ' ')}: 
                                    </span>
                                    <span className="ml-1 text-gray-900">
                                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Empty state */}
        {filteredActivities.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <ActivityIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No activities found</p>
              <p className="text-sm text-gray-400">
                Activities will appear here as you interact with contacts, deals, and tasks.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}