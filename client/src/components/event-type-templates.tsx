import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, 
  Clock, 
  DollarSign, 
  MapPin, 
  Users,
  Video,
  Phone,
  MapPinned,
  Building,
  Plus,
  Check,
  ArrowRight,
  Sparkles
} from "lucide-react";

interface EventTypeTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  duration: number;
  price: number;
  currency: string;
  meetingLocation: string;
  brandColor: string;
  isActive: boolean;
  isPublic: boolean;
  requiresConfirmation: boolean;
  bufferTimeBefore: number;
  bufferTimeAfter: number;
  customQuestions?: Array<{
    id: string;
    question: string;
    required: boolean;
    type: string;
  }>;
  instructionsBeforeEvent?: string;
  instructionsAfterEvent?: string;
  allowCancellation: boolean;
  allowRescheduling: boolean;
}

interface EventTypeTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate?: (template: EventTypeTemplate) => void;
}

const TEMPLATE_CATEGORIES = [
  { id: 'all', label: 'All Templates', icon: '🗂️' },
  { id: 'consultation', label: 'Consultation', icon: '💬' },
  { id: 'sales', label: 'Sales & Business', icon: '📈' },
  { id: 'support', label: 'Support', icon: '🛠️' },
  { id: 'coaching', label: 'Coaching', icon: '🎯' },
  { id: 'professional', label: 'Professional Services', icon: '⚖️' },
  { id: 'quick', label: 'Quick Meetings', icon: '⚡' }
];

const MEETING_LOCATION_ICONS = {
  video: <Video className="w-4 h-4" />,
  phone: <Phone className="w-4 h-4" />,
  in_person: <Building className="w-4 h-4" />,
  custom: <MapPinned className="w-4 h-4" />
};

// Categorize templates based on their characteristics
const categorizeTemplate = (template: EventTypeTemplate): string => {
  const name = template.name.toLowerCase();
  const description = template.description.toLowerCase();
  
  if (name.includes('consultation') || name.includes('discovery')) {
    return 'consultation';
  }
  if (name.includes('sales') || name.includes('demo')) {
    return 'sales';
  }
  if (name.includes('support') || name.includes('help')) {
    return 'support';
  }
  if (name.includes('coaching') || name.includes('training')) {
    return 'coaching';
  }
  if (name.includes('legal') || name.includes('professional')) {
    return 'professional';
  }
  if (template.duration <= 30 || name.includes('quick') || name.includes('office hours')) {
    return 'quick';
  }
  
  return 'consultation'; // default category
};

export function EventTypeTemplates({ isOpen, onClose, onSelectTemplate }: EventTypeTemplatesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<EventTypeTemplate | null>(null);

  // Fetch templates
  const { data: templates, isLoading, error } = useQuery<EventTypeTemplate[]>({
    queryKey: ['/api/appointment-event-types/templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/appointment-event-types/templates');
      return response.templates || [];
    },
    enabled: isOpen,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Create event type from template
  const createFromTemplateMutation = useMutation({
    mutationFn: async (template: EventTypeTemplate) => {
      // Strip template-specific fields and generate new slug
      const templateData = {
        name: template.name,
        slug: template.slug + '-' + Date.now().toString().slice(-4),
        description: template.description,
        duration: template.duration,
        price: template.price,
        currency: template.currency,
        meetingLocation: template.meetingLocation,
        brandColor: template.brandColor,
        isActive: true,
        isPublic: template.isPublic,
        requiresConfirmation: template.requiresConfirmation,
        bufferTimeBefore: template.bufferTimeBefore,
        bufferTimeAfter: template.bufferTimeAfter,
        collectAttendeeEmail: true,
        collectAttendeePhone: template.meetingLocation === 'phone',
        collectAttendeeMessage: true,
        customQuestions: template.customQuestions || [],
        instructionsBeforeEvent: template.instructionsBeforeEvent,
        instructionsAfterEvent: template.instructionsAfterEvent,
        allowCancellation: template.allowCancellation,
        allowRescheduling: template.allowRescheduling
      };
      
      return await apiRequest('POST', '/api/appointment-event-types', templateData);
    },
    onSuccess: (data) => {
      toast({
        title: "Event Type Created",
        description: `"${data.name}" has been created from the template.`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/appointment-event-types'] });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create event type from template.",
        variant: "destructive",
      });
    },
  });

  // Filter templates based on search and category
  const filteredTemplates = templates?.filter(template => {
    const matchesSearch = !searchQuery || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      categorizeTemplate(template) === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }) || [];

  // Group templates by category for display
  const templatesByCategory = TEMPLATE_CATEGORIES.reduce((acc, category) => {
    if (category.id === 'all') return acc;
    
    acc[category.id] = templates?.filter(template => 
      categorizeTemplate(template) === category.id
    ) || [];
    
    return acc;
  }, {} as Record<string, EventTypeTemplate[]>);

  const handleSelectTemplate = (template: EventTypeTemplate) => {
    setSelectedTemplate(template);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      if (onSelectTemplate) {
        onSelectTemplate(selectedTemplate);
        onClose();
      } else {
        createFromTemplateMutation.mutate(selectedTemplate);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div>
              <DialogTitle className="text-2xl font-semibold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-blue-600" />
                Event Type Templates
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose from professionally designed templates to get started quickly
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} available
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Sidebar */}
            <div className="w-64 border-r bg-gray-50 dark:bg-gray-800/50 p-4">
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-templates"
                />
              </div>

              {/* Categories */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-2 py-1">
                  Categories
                </div>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    data-testid={`button-category-${category.id}`}
                  >
                    <span className="text-base">{category.icon}</span>
                    <span>{category.label}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {category.id === 'all' 
                        ? templates?.length || 0
                        : templatesByCategory[category.id]?.length || 0
                      }
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden">
              <div className="flex h-full">
                {/* Templates Grid */}
                <div className="flex-1 overflow-auto p-6">
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  ) : error ? (
                    <div className="text-center py-12">
                      <div className="text-red-500 mb-2">Failed to load templates</div>
                      <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                        Retry
                      </Button>
                    </div>
                  ) : filteredTemplates.length === 0 ? (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium mb-2">No templates found</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Try adjusting your search or selecting a different category.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredTemplates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          isSelected={selectedTemplate?.id === template.id}
                          onSelect={() => handleSelectTemplate(template)}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Template Preview */}
                {selectedTemplate && (
                  <div className="w-96 border-l bg-white dark:bg-gray-900 overflow-auto">
                    <div className="p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold mb-2" data-testid="preview-template-name">
                            {selectedTemplate.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {selectedTemplate.description}
                          </p>
                        </div>
                        <div 
                          className="w-4 h-4 rounded-full border-2 border-gray-300"
                          style={{ backgroundColor: selectedTemplate.brandColor }}
                        />
                      </div>

                      {/* Template Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{selectedTemplate.duration} min</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            {MEETING_LOCATION_ICONS[selectedTemplate.meetingLocation as keyof typeof MEETING_LOCATION_ICONS]}
                            <span className="capitalize">{selectedTemplate.meetingLocation.replace('_', ' ')}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span>
                            {selectedTemplate.price > 0 
                              ? `${selectedTemplate.currency} $${(selectedTemplate.price / 100).toFixed(2)}`
                              : 'Free'
                            }
                          </span>
                        </div>

                        {/* Features */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-sm">Features Included:</h4>
                          <div className="space-y-2 text-sm">
                            {selectedTemplate.bufferTimeBefore > 0 && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="w-4 h-4" />
                                <span>{selectedTemplate.bufferTimeBefore}min buffer before</span>
                              </div>
                            )}
                            {selectedTemplate.bufferTimeAfter > 0 && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="w-4 h-4" />
                                <span>{selectedTemplate.bufferTimeAfter}min buffer after</span>
                              </div>
                            )}
                            {selectedTemplate.requiresConfirmation && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="w-4 h-4" />
                                <span>Requires confirmation</span>
                              </div>
                            )}
                            {selectedTemplate.customQuestions && selectedTemplate.customQuestions.length > 0 && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="w-4 h-4" />
                                <span>{selectedTemplate.customQuestions.length} custom questions</span>
                              </div>
                            )}
                            {selectedTemplate.instructionsBeforeEvent && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="w-4 h-4" />
                                <span>Pre-event instructions</span>
                              </div>
                            )}
                            {selectedTemplate.instructionsAfterEvent && (
                              <div className="flex items-center gap-2 text-green-600">
                                <Check className="w-4 h-4" />
                                <span>Post-event instructions</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Custom Questions Preview */}
                        {selectedTemplate.customQuestions && selectedTemplate.customQuestions.length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Custom Questions:</h4>
                            <div className="space-y-2">
                              {selectedTemplate.customQuestions.map((question, index) => (
                                <div key={question.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                  <div className="flex items-start gap-2">
                                    <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                                      Q{index + 1}
                                    </span>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">{question.question}</p>
                                      <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                        <Badge variant="outline" className="text-xs">
                                          {question.type}
                                        </Badge>
                                        {question.required && (
                                          <Badge variant="destructive" className="text-xs">
                                            Required
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Instructions */}
                        {(selectedTemplate.instructionsBeforeEvent || selectedTemplate.instructionsAfterEvent) && (
                          <div className="space-y-3">
                            <h4 className="font-medium text-sm">Instructions:</h4>
                            {selectedTemplate.instructionsBeforeEvent && (
                              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Before Event:</div>
                                <p className="text-sm text-blue-800 dark:text-blue-300">
                                  {selectedTemplate.instructionsBeforeEvent}
                                </p>
                              </div>
                            )}
                            {selectedTemplate.instructionsAfterEvent && (
                              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-1">After Event:</div>
                                <p className="text-sm text-green-800 dark:text-green-300">
                                  {selectedTemplate.instructionsAfterEvent}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        onClick={handleUseTemplate}
                        disabled={createFromTemplateMutation.isPending}
                        className="w-full"
                        data-testid="button-use-template"
                      >
                        {createFromTemplateMutation.isPending ? (
                          'Creating...'
                        ) : onSelectTemplate ? (
                          <>
                            Select Template
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Create from Template
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: EventTypeTemplate;
  isSelected: boolean;
  onSelect: () => void;
}

function TemplateCard({ template, isSelected, onSelect }: TemplateCardProps) {
  const category = categorizeTemplate(template);
  const categoryInfo = TEMPLATE_CATEGORIES.find(cat => cat.id === category);

  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
        isSelected 
          ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' 
          : 'hover:shadow-md'
      }`}
      onClick={onSelect}
      data-testid={`template-card-${template.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg leading-tight mb-1 truncate">
              {template.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-sm">
              {template.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {categoryInfo && (
              <span className="text-lg" title={categoryInfo.label}>
                {categoryInfo.icon}
              </span>
            )}
            <div 
              className="w-4 h-4 rounded-full border border-gray-300"
              style={{ backgroundColor: template.brandColor }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Key Details */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{template.duration} min</span>
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
            {MEETING_LOCATION_ICONS[template.meetingLocation as keyof typeof MEETING_LOCATION_ICONS]}
            <span className="capitalize truncate">{template.meetingLocation.replace('_', ' ')}</span>
          </div>
        </div>

        {/* Pricing and Features */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm font-medium">
            <DollarSign className="w-4 h-4 text-gray-500" />
            <span>
              {template.price > 0 
                ? `$${(template.price / 100).toFixed(0)}`
                : 'Free'
              }
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {template.requiresConfirmation && (
              <Badge variant="secondary" className="text-xs">Approval</Badge>
            )}
            {template.customQuestions && template.customQuestions.length > 0 && (
              <Badge variant="outline" className="text-xs">
                {template.customQuestions.length}Q
              </Badge>
            )}
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && (
          <div className="flex items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-sm">
              <Check className="w-4 h-4" />
              Selected
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}