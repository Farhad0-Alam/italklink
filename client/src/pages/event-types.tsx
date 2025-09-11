import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Copy, 
  Edit, 
  Trash2, 
  Eye, 
  Power, 
  PowerOff,
  Calendar,
  Clock,
  DollarSign,
  MapPin,
  Users,
  Settings,
  Download,
  Upload,
  BarChart3
} from "lucide-react";
import { EventTypeEditor } from "@/components/event-type-editor";
import { EventTypeTemplates } from "@/components/event-type-templates";

interface AppointmentEventType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  duration: number;
  price: number;
  currency: string;
  meetingLocation?: string;
  brandColor: string;
  isActive: boolean;
  isPublic: boolean;
  requiresConfirmation: boolean;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
  appointmentCount: number;
  bookingUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface EventTypesResponse {
  eventTypes: AppointmentEventType[];
  pagination: {
    total: number;
    page: number;
    limit: number;
  };
}

interface EventTypeFilters {
  status: 'all' | 'active' | 'inactive';
  search: string;
  sortBy: 'name' | 'created' | 'appointments' | 'duration';
  sortOrder: 'asc' | 'desc';
}

export default function EventTypesManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [filters, setFilters] = useState<EventTypeFilters>({
    status: 'all',
    search: '',
    sortBy: 'created',
    sortOrder: 'desc'
  });
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>([]);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false);
  const [editingEventType, setEditingEventType] = useState<string | null>(null);
  const [eventTypeToDelete, setEventTypeToDelete] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Fetch event types
  const { data: eventTypesData, isLoading, error } = useQuery<EventTypesResponse>({
    queryKey: ['/api/appointment-event-types', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status !== 'all') {
        params.append('isActive', filters.status === 'active' ? 'true' : 'false');
      }
      if (filters.search) {
        params.append('search', filters.search);
      }
      
      const url = `/api/appointment-event-types${params.toString() ? '?' + params.toString() : ''}`;
      const response = await apiRequest('GET', url);
      return response as EventTypesResponse;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Delete event type mutation
  const deleteEventTypeMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/appointment-event-types/${id}`),
    onSuccess: () => {
      toast({
        title: "Event Type Deleted",
        description: "The event type has been successfully deleted.",
      });
      setEventTypeToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete event type.",
        variant: "destructive",
      });
    },
  });

  // Duplicate event type mutation
  const duplicateEventTypeMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name?: string }) => 
      apiRequest('POST', `/api/appointment-event-types/${id}/duplicate`, { name }),
    onSuccess: () => {
      toast({
        title: "Event Type Duplicated",
        description: "The event type has been successfully duplicated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
    },
    onError: (error: any) => {
      toast({
        title: "Duplicate Failed",
        description: error.message || "Failed to duplicate event type.",
        variant: "destructive",
      });
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      apiRequest('PATCH', `/api/appointment-event-types/${id}/status`, { isActive }),
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Event type status has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update event type status.",
        variant: "destructive",
      });
    },
  });

  // Bulk operations mutation
  const bulkOperationMutation = useMutation({
    mutationFn: ({ eventTypeIds, operation, data }: { 
      eventTypeIds: string[]; 
      operation: string; 
      data?: any 
    }) => 
      apiRequest('PATCH', '/api/appointment-event-types/bulk', { eventTypeIds, operation, data }),
    onSuccess: (data: any) => {
      toast({
        title: "Bulk Operation Complete",
        description: `Successfully updated ${data.affectedCount} event types.`,
      });
      setSelectedEventTypes([]);
      setShowBulkActions(false);
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
    },
    onError: (error: any) => {
      toast({
        title: "Bulk Operation Failed",
        description: error.message || "Failed to perform bulk operation.",
        variant: "destructive",
      });
    },
  });

  // Filter and sort event types
  const filteredEventTypes = eventTypesData?.eventTypes || [];

  // Handle search
  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }));
  };

  // Handle filter change
  const handleFilterChange = (key: keyof EventTypeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEventTypes(filteredEventTypes.map(et => et.id));
    } else {
      setSelectedEventTypes([]);
    }
  };

  const handleSelectEventType = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEventTypes(prev => [...prev, id]);
    } else {
      setSelectedEventTypes(prev => prev.filter(etId => etId !== id));
    }
  };

  // Show/hide bulk actions based on selection
  useEffect(() => {
    setShowBulkActions(selectedEventTypes.length > 0);
  }, [selectedEventTypes]);

  // Handle bulk operations
  const handleBulkToggleStatus = (isActive: boolean) => {
    bulkOperationMutation.mutate({
      eventTypeIds: selectedEventTypes,
      operation: 'toggle_status',
      data: { isActive }
    });
  };

  const handleBulkDelete = () => {
    bulkOperationMutation.mutate({
      eventTypeIds: selectedEventTypes,
      operation: 'delete'
    });
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Error Loading Event Types</CardTitle>
              <CardDescription>
                Unable to load your event types. Please try refreshing the page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.location.reload()} data-testid="button-refresh">
                Refresh Page
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white" data-testid="title-event-types">
              Event Types
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your appointment types, configure settings, and track performance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {/* TODO: Handle export */}}
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplatesDialog(true)}
              data-testid="button-templates"
            >
              <Upload className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              data-testid="button-create-event-type"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Event Type
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Event Types</div>
                  <div className="text-xl font-semibold" data-testid="text-total-event-types">
                    {eventTypesData?.pagination.total || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <Power className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Types</div>
                  <div className="text-xl font-semibold" data-testid="text-active-event-types">
                    {filteredEventTypes.filter(et => et.isActive).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Bookings</div>
                  <div className="text-xl font-semibold" data-testid="text-total-bookings">
                    {filteredEventTypes.reduce((sum, et) => sum + (et.appointmentCount || 0), 0)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Paid Types</div>
                  <div className="text-xl font-semibold" data-testid="text-paid-event-types">
                    {filteredEventTypes.filter(et => et.price > 0).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search event types..."
                    value={filters.search}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10"
                    data-testid="input-search"
                  />
                </div>

                {/* Status Filter */}
                <Select 
                  value={filters.status} 
                  onValueChange={(value: any) => handleFilterChange('status', value)}
                >
                  <SelectTrigger className="w-40" data-testid="select-status-filter">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value: any) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger className="w-40" data-testid="select-sort">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="created">Date Created</SelectItem>
                    <SelectItem value="appointments">Bookings</SelectItem>
                    <SelectItem value="duration">Duration</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                {/* Bulk Actions */}
                {showBulkActions && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {selectedEventTypes.length} selected
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkToggleStatus(true)}
                      disabled={bulkOperationMutation.isPending}
                      data-testid="button-bulk-activate"
                    >
                      <Power className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkToggleStatus(false)}
                      disabled={bulkOperationMutation.isPending}
                      data-testid="button-bulk-deactivate"
                    >
                      <PowerOff className="w-4 h-4 mr-1" />
                      Deactivate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={bulkOperationMutation.isPending}
                      data-testid="button-bulk-delete"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="w-8 h-8 p-0"
                    data-testid="button-grid-view"
                  >
                    <div className="grid grid-cols-2 gap-0.5 w-3 h-3">
                      <div className="bg-current w-1 h-1 rounded-sm"></div>
                      <div className="bg-current w-1 h-1 rounded-sm"></div>
                      <div className="bg-current w-1 h-1 rounded-sm"></div>
                      <div className="bg-current w-1 h-1 rounded-sm"></div>
                    </div>
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="w-8 h-8 p-0"
                    data-testid="button-list-view"
                  >
                    <div className="flex flex-col gap-0.5 w-3 h-3">
                      <div className="bg-current w-full h-0.5 rounded-sm"></div>
                      <div className="bg-current w-full h-0.5 rounded-sm"></div>
                      <div className="bg-current w-full h-0.5 rounded-sm"></div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Bulk Selection */}
            {filteredEventTypes.length > 0 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                <Checkbox
                  checked={selectedEventTypes.length === filteredEventTypes.length}
                  onCheckedChange={handleSelectAll}
                  data-testid="checkbox-select-all"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Select all event types
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Types Grid/List */}
        {isLoading ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredEventTypes.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Event Types Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filters.search || filters.status !== 'all' 
                  ? "No event types match your current filters."
                  : "Get started by creating your first event type."
                }
              </p>
              {!filters.search && filters.status === 'all' && (
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  data-testid="button-create-first-event-type"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Event Type
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEventTypes.map((eventType) => (
              <EventTypeCard
                key={eventType.id}
                eventType={eventType}
                isSelected={selectedEventTypes.includes(eventType.id)}
                onSelect={(checked) => handleSelectEventType(eventType.id, checked)}
                onEdit={() => setEditingEventType(eventType.id)}
                onToggleStatus={(isActive) => toggleStatusMutation.mutate({ id: eventType.id, isActive })}
                onDuplicate={() => duplicateEventTypeMutation.mutate({ id: eventType.id })}
                onDelete={() => setEventTypeToDelete(eventType.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEventTypes.map((eventType) => (
              <EventTypeListItem
                key={eventType.id}
                eventType={eventType}
                isSelected={selectedEventTypes.includes(eventType.id)}
                onSelect={(checked) => handleSelectEventType(eventType.id, checked)}
                onEdit={() => setEditingEventType(eventType.id)}
                onToggleStatus={(isActive) => toggleStatusMutation.mutate({ id: eventType.id, isActive })}
                onDuplicate={() => duplicateEventTypeMutation.mutate({ id: eventType.id })}
                onDelete={() => setEventTypeToDelete(eventType.id)}
              />
            ))}
          </div>
        )}

        {/* Event Type Templates */}
        <EventTypeTemplates
          isOpen={showTemplatesDialog}
          onClose={() => setShowTemplatesDialog(false)}
        />

        {/* Event Type Editor */}
        <EventTypeEditor
          eventTypeId={editingEventType || undefined}
          isOpen={showCreateDialog || !!editingEventType}
          onClose={() => {
            setShowCreateDialog(false);
            setEditingEventType(null);
          }}
          onSave={() => {
            setShowCreateDialog(false);
            setEditingEventType(null);
          }}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!eventTypeToDelete} onOpenChange={() => setEventTypeToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Event Type</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this event type? This action cannot be undone.
                All associated settings will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => eventTypeToDelete && deleteEventTypeMutation.mutate(eventTypeToDelete)}
                className="bg-red-600 hover:bg-red-700"
                data-testid="button-confirm-delete"
              >
                Delete Event Type
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// Event Type Card Component for Grid View
interface EventTypeCardProps {
  eventType: AppointmentEventType;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onToggleStatus: (isActive: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function EventTypeCard({ eventType, isSelected, onSelect, onEdit, onToggleStatus, onDuplicate, onDelete }: EventTypeCardProps) {
  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onCheckedChange={onSelect}
              className="mt-1"
              data-testid={`checkbox-select-${eventType.id}`}
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight mb-1 truncate" data-testid={`text-event-type-name-${eventType.id}`}>
                {eventType.name}
              </CardTitle>
              {eventType.description && (
                <CardDescription className="line-clamp-2 text-sm" data-testid={`text-event-type-description-${eventType.id}`}>
                  {eventType.description}
                </CardDescription>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity" data-testid={`button-menu-${eventType.id}`}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => window.open(eventType.bookingUrl, '_blank')}>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(eventType.bookingUrl)}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDuplicate}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onToggleStatus(!eventType.isActive)}>
                {eventType.isActive ? (
                  <>
                    <PowerOff className="w-4 h-4 mr-2" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="w-4 h-4 mr-2" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status and Settings */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={eventType.isActive ? "success" : "secondary"} data-testid={`badge-status-${eventType.id}`}>
            {eventType.isActive ? 'Active' : 'Inactive'}
          </Badge>
          {eventType.price > 0 && (
            <Badge variant="outline">
              {eventType.currency} ${eventType.price / 100}
            </Badge>
          )}
          {eventType.requiresConfirmation && (
            <Badge variant="outline">Requires Approval</Badge>
          )}
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{eventType.duration} min</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4" />
            <span>{eventType.appointmentCount} bookings</span>
          </div>
          {eventType.meetingLocation && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400 col-span-2">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{eventType.meetingLocation}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(eventType.bookingUrl, '_blank')}
            data-testid={`button-preview-${eventType.id}`}
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigator.clipboard.writeText(eventType.bookingUrl)}
            data-testid={`button-copy-link-${eventType.id}`}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onEdit}
            data-testid={`button-settings-${eventType.id}`}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Event Type List Item Component for List View
interface EventTypeListItemProps {
  eventType: AppointmentEventType;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onEdit: () => void;
  onToggleStatus: (isActive: boolean) => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function EventTypeListItem({ eventType, isSelected, onSelect, onEdit, onToggleStatus, onDuplicate, onDelete }: EventTypeListItemProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            data-testid={`checkbox-select-list-${eventType.id}`}
          />
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Name and Description */}
            <div className="md:col-span-2 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate" data-testid={`text-list-name-${eventType.id}`}>
                  {eventType.name}
                </h3>
                <Badge variant={eventType.isActive ? "success" : "secondary"} className="text-xs">
                  {eventType.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {eventType.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                  {eventType.description}
                </p>
              )}
            </div>

            {/* Duration */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>{eventType.duration} min</span>
            </div>

            {/* Bookings */}
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
              <Users className="w-4 h-4" />
              <span>{eventType.appointmentCount} bookings</span>
            </div>

            {/* Price */}
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {eventType.price > 0 ? (
                <span className="font-medium">
                  {eventType.currency} ${eventType.price / 100}
                </span>
              ) : (
                <span>Free</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(eventType.bookingUrl, '_blank')}
              data-testid={`button-list-preview-${eventType.id}`}
            >
              <Eye className="w-4 h-4" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" data-testid={`button-list-menu-${eventType.id}`}>
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(eventType.bookingUrl)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDuplicate}>
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onToggleStatus(!eventType.isActive)}>
                  {eventType.isActive ? (
                    <>
                      <PowerOff className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}