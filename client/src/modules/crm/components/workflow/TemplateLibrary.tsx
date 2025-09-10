import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Search, Star, Users, DollarSign, Mail, Calendar, 
  MessageSquare, Zap, Tag, Clock, UserPlus, AlertTriangle,
  FileText, Webhook, Play
} from "lucide-react";
import type { AutomationTemplate, AutomationWorkflow } from "../../types";
import { nanoid } from "nanoid";

const AUTOMATION_TEMPLATES: AutomationTemplate[] = [
  {
    id: 'welcome-new-contact',
    name: 'Welcome New Contact',
    description: 'Send a welcome email when a new contact is created',
    category: 'lead-nurturing',
    icon: 'UserPlus',
    popular: true,
    workflow: {
      name: 'Welcome New Contact',
      description: 'Automatically welcome new contacts with a personalized email',
      triggers: [
        {
          id: 'trigger-welcome-contact',
          type: 'contact.created',
          label: 'New Contact Created',
          icon: 'UserPlus',
          config: {
            source: ['manual', 'form', 'business_card']
          },
          position: { x: 100, y: 100 }
        }
      ],
      conditions: [],
      actions: [
        {
          id: 'action-welcome-email',
          type: 'send_email',
          label: 'Send Welcome Email',
          icon: 'Mail',
          config: {
            to: '{{contact.email}}',
            subject: 'Welcome {{contact.firstName}}!',
            body: 'Hi {{contact.firstName}},\n\nWelcome to our platform! We\'re excited to have you on board.\n\nBest regards,\nThe Team',
            fromName: 'Your Company'
          },
          position: { x: 100, y: 300 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'trigger-welcome-contact',
          target: 'action-welcome-email'
        }
      ]
    }
  },
  {
    id: 'follow-up-qualified-lead',
    name: 'Follow up Qualified Leads',
    description: 'Create follow-up tasks when leads become qualified',
    category: 'sales-follow-up',
    icon: 'Calendar',
    popular: true,
    workflow: {
      name: 'Follow up Qualified Leads',
      description: 'Automatically create follow-up tasks for qualified leads',
      triggers: [
        {
          id: 'trigger-stage-changed',
          type: 'stage.changed',
          label: 'Stage Changed to Qualified',
          icon: 'Zap',
          config: {
            toStage: 'qualified'
          },
          position: { x: 100, y: 100 }
        }
      ],
      conditions: [
        {
          id: 'condition-lead-score',
          type: 'field_greater_than',
          field: 'leadScore',
          operator: 'greater_than',
          value: 70,
          logicOperator: 'AND',
          position: { x: 100, y: 250 }
        }
      ],
      actions: [
        {
          id: 'action-create-task',
          type: 'create_task',
          label: 'Create Follow-up Call',
          icon: 'Calendar',
          config: {
            title: 'Call {{contact.firstName}} - Qualified Lead',
            description: 'Follow up on qualified lead with score {{contact.leadScore}}',
            type: 'call',
            priority: 'high',
            dueInDays: 1,
            assignedTo: 'contact_owner'
          },
          position: { x: 100, y: 400 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'trigger-1',
          target: 'condition-1'
        },
        {
          id: 'conn-2',
          source: 'condition-1',
          target: 'action-1'
        }
      ]
    }
  },
  {
    id: 'nurture-cold-leads',
    name: 'Nurture Cold Leads',
    description: 'Send nurturing emails to cold leads over time',
    category: 'lead-nurturing',
    icon: 'Mail',
    workflow: {
      name: 'Nurture Cold Leads',
      description: 'Multi-step email sequence for cold leads',
      triggers: [
        {
          id: 'trigger-cold-leads',
          type: 'contact.created',
          label: 'New Contact Created',
          icon: 'UserPlus',
          config: {
            tags: ['cold_lead']
          },
          position: { x: 100, y: 100 }
        }
      ],
      conditions: [
        {
          id: 'condition-lead-score',
          type: 'field_less_than',
          field: 'leadScore',
          operator: 'less_than',
          value: 50,
          logicOperator: 'AND',
          position: { x: 100, y: 250 }
        }
      ],
      actions: [
        {
          id: 'action-wait-delay',
          type: 'wait_delay',
          label: 'Wait 1 Day',
          icon: 'Clock',
          config: {
            duration: 1,
            unit: 'days'
          },
          position: { x: 100, y: 400 }
        },
        {
          id: 'action-nurture-email',
          type: 'send_email',
          label: 'Send Nurture Email 1',
          icon: 'Mail',
          config: {
            to: '{{contact.email}}',
            subject: 'Getting started with {{contact.company}}',
            body: 'Hi {{contact.firstName}},\n\nI wanted to follow up and see how we can help {{contact.company}} achieve its goals...',
            fromName: 'Sales Team'
          },
          position: { x: 100, y: 550 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'trigger-1',
          target: 'condition-1'
        },
        {
          id: 'conn-2',
          source: 'condition-1',
          target: 'action-1'
        },
        {
          id: 'conn-3',
          source: 'action-1',
          target: 'action-2'
        }
      ]
    }
  },
  {
    id: 'deal-won-celebration',
    name: 'Deal Won Celebration',
    description: 'Celebrate and follow up when deals are won',
    category: 'customer-onboarding',
    icon: 'DollarSign',
    workflow: {
      name: 'Deal Won Celebration',
      description: 'Onboard new customers and celebrate wins',
      triggers: [
        {
          id: 'trigger-deal-won',
          type: 'stage.changed',
          label: 'Deal Won',
          icon: 'DollarSign',
          config: {
            toStage: 'won'
          },
          position: { x: 100, y: 100 }
        }
      ],
      conditions: [],
      actions: [
        {
          id: 'action-congratulations-email',
          type: 'send_email',
          label: 'Send Congratulations',
          icon: 'Mail',
          config: {
            to: '{{contact.email}}',
            subject: 'Welcome to the family, {{contact.firstName}}!',
            body: 'Congratulations! We\'re thrilled to welcome {{contact.company}} as our newest customer.\n\nYour deal worth ${{deal.value}} is now confirmed...',
            fromName: 'Customer Success Team'
          },
          position: { x: 100, y: 250 }
        },
        {
          id: 'action-schedule-onboarding',
          type: 'create_task',
          label: 'Schedule Onboarding',
          icon: 'Calendar',
          config: {
            title: 'Schedule onboarding call with {{contact.firstName}}',
            description: 'Customer onboarding for ${{deal.value}} deal',
            type: 'meeting',
            priority: 'high',
            dueInDays: 2,
            assignedTo: 'current_user'
          },
          position: { x: 100, y: 400 }
        },
        {
          id: 'action-tag-customer',
          type: 'add_tag',
          label: 'Tag as Customer',
          icon: 'Tag',
          config: {
            tags: 'customer, onboarding'
          },
          position: { x: 100, y: 550 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'trigger-1',
          target: 'action-1'
        },
        {
          id: 'conn-2',
          source: 'action-1',
          target: 'action-2'
        },
        {
          id: 'conn-3',
          source: 'action-2',
          target: 'action-3'
        }
      ]
    }
  },
  {
    id: 'overdue-task-reminder',
    name: 'Overdue Task Reminder',
    description: 'Send reminders when tasks become overdue',
    category: 'task-management',
    icon: 'AlertTriangle',
    workflow: {
      name: 'Overdue Task Reminder',
      description: 'Remind team members about overdue tasks',
      triggers: [
        {
          id: 'trigger-task-overdue',
          type: 'task.overdue',
          label: 'Task Overdue',
          icon: 'AlertTriangle',
          config: {
            overdueDays: 1
          },
          position: { x: 100, y: 100 }
        }
      ],
      conditions: [],
      actions: [
        {
          id: 'action-reminder-email',
          type: 'send_email',
          label: 'Send Reminder',
          icon: 'Mail',
          config: {
            to: '{{task.assignedTo}}',
            subject: 'Overdue Task: {{task.title}}',
            body: 'Hi there,\n\nThis is a reminder that the following task is overdue:\n\nTask: {{task.title}}\nContact: {{contact.firstName}} {{contact.lastName}}\nDue Date: {{task.dueDate}}\n\nPlease complete it as soon as possible.',
            fromName: 'Task Management System'
          },
          position: { x: 100, y: 250 }
        },
        {
          id: 'action-escalate-task',
          type: 'create_task',
          label: 'Escalate to Manager',
          icon: 'Calendar',
          config: {
            title: 'Review overdue task: {{task.title}}',
            description: 'Task assigned to {{task.assignedTo}} is {{task.overdueDays}} days overdue',
            type: 'review',
            priority: 'high',
            dueInDays: 0,
            assignedTo: 'team_lead'
          },
          position: { x: 100, y: 400 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'trigger-1',
          target: 'action-1'
        },
        {
          id: 'conn-2',
          source: 'action-1',
          target: 'action-2'
        }
      ]
    }
  },
  {
    id: 'high-value-deal-notification',
    name: 'High Value Deal Alert',
    description: 'Notify team when high-value deals are created',
    category: 'notifications',
    icon: 'DollarSign',
    workflow: {
      name: 'High Value Deal Alert',
      description: 'Alert team about high-value deals',
      triggers: [
        {
          id: 'trigger-high-value-deal',
          type: 'deal.created',
          label: 'New Deal Created',
          icon: 'DollarSign',
          config: {
            minValue: 10000
          },
          position: { x: 100, y: 100 }
        }
      ],
      conditions: [
        {
          id: 'condition-deal-value',
          type: 'field_greater_than',
          field: 'dealValue',
          operator: 'greater_than',
          value: 10000,
          logicOperator: 'AND',
          position: { x: 100, y: 250 }
        }
      ],
      actions: [
        {
          id: 'action-slack-notification',
          type: 'send_webhook',
          label: 'Slack Notification',
          icon: 'Webhook',
          config: {
            url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
            method: 'POST',
            payload: '{"text": "🎉 High-value deal alert! {{contact.firstName}} {{contact.lastName}} created a ${{deal.value}} deal: {{deal.title}}"}'
          },
          position: { x: 100, y: 400 }
        },
        {
          id: 'action-assign-senior-rep',
          type: 'create_task',
          label: 'Assign to Senior Rep',
          icon: 'Calendar',
          config: {
            title: 'Review high-value deal: {{deal.title}}',
            description: '${{deal.value}} deal from {{contact.company}} needs senior attention',
            type: 'review',
            priority: 'high',
            dueInDays: 0,
            assignedTo: 'team_lead'
          },
          position: { x: 100, y: 550 }
        }
      ],
      connections: [
        {
          id: 'conn-1',
          source: 'trigger-1',
          target: 'condition-1'
        },
        {
          id: 'conn-2',
          source: 'condition-1',
          target: 'action-1'
        },
        {
          id: 'conn-3',
          source: 'action-1',
          target: 'action-2'
        }
      ]
    }
  }
];

interface TemplateLibraryProps {
  onSelectTemplate: (template: AutomationTemplate) => void;
  onCancel: () => void;
}

export default function TemplateLibrary({ onSelectTemplate, onCancel }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Templates', icon: FileText },
    { id: 'lead-nurturing', label: 'Lead Nurturing', icon: Users },
    { id: 'sales-follow-up', label: 'Sales Follow-up', icon: DollarSign },
    { id: 'customer-onboarding', label: 'Customer Onboarding', icon: UserPlus },
    { id: 'task-management', label: 'Task Management', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: MessageSquare }
  ];

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      UserPlus, DollarSign, Mail, Calendar, AlertTriangle, MessageSquare,
      Zap, Tag, Clock, FileText, Webhook, Play
    };
    return icons[iconName] || FileText;
  };

  const filteredTemplates = AUTOMATION_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const popularTemplates = filteredTemplates.filter(t => t.popular);
  const otherTemplates = filteredTemplates.filter(t => !t.popular);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Automation Templates</h3>
        <p className="text-sm text-muted-foreground">
          Start with a pre-built workflow and customize it to your needs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-templates"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="text-xs"
              data-testid={`button-category-${category.id}`}
            >
              <category.icon className="h-3 w-3 mr-1" />
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <ScrollArea className="h-96">
        <div className="space-y-6">
          {/* Popular Templates */}
          {popularTemplates.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Star className="h-4 w-4 text-amber-500" />
                <h4 className="font-medium">Popular Templates</h4>
              </div>
              <div className="grid gap-3">
                {popularTemplates.map(template => {
                  const IconComponent = getIconComponent(template.icon);
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelectTemplate(template)}
                      data-testid={`card-template-${template.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <div className="flex space-x-1">
                                <Badge variant="secondary" className="text-xs">
                                  <Star className="h-2 w-2 mr-1" />
                                  Popular
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  {template.category.replace('-', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span>{template.workflow.triggers.length} trigger{template.workflow.triggers.length !== 1 ? 's' : ''}</span>
                              <span>{template.workflow.conditions.length} condition{template.workflow.conditions.length !== 1 ? 's' : ''}</span>
                              <span>{template.workflow.actions.length} action{template.workflow.actions.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Other Templates */}
          {otherTemplates.length > 0 && (
            <div>
              {popularTemplates.length > 0 && (
                <h4 className="font-medium mb-3">All Templates</h4>
              )}
              <div className="grid gap-3">
                {otherTemplates.map(template => {
                  const IconComponent = getIconComponent(template.icon);
                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => onSelectTemplate(template)}
                      data-testid={`card-template-${template.id}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
                            <IconComponent className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <Badge variant="outline" className="text-xs">
                                {template.category.replace('-', ' ')}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                            <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                              <span>{template.workflow.triggers.length} trigger{template.workflow.triggers.length !== 1 ? 's' : ''}</span>
                              <span>{template.workflow.conditions.length} condition{template.workflow.conditions.length !== 1 ? 's' : ''}</span>
                              <span>{template.workflow.actions.length} action{template.workflow.actions.length !== 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results */}
          {filteredTemplates.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="font-medium mb-2">No templates found</h4>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or category filters
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="outline">
          Start from Scratch
        </Button>
      </div>
    </div>
  );
}