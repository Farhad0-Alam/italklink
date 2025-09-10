import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, MessageSquare, Calendar, Users, Tag, Zap, DollarSign, 
  Webhook, Clock, Play, Search, Settings, Plus, FileText
} from "lucide-react";
import type { AutomationAction, WorkflowVariable } from "../../types";

interface ActionOption {
  type: AutomationAction['type'];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'communication' | 'crm' | 'automation' | 'integrations';
  popular?: boolean;
  config: {
    fields: Array<{
      key: string;
      label: string;
      type: 'text' | 'textarea' | 'select' | 'number' | 'email' | 'url' | 'variable';
      options?: string[];
      required?: boolean;
      placeholder?: string;
      description?: string;
    }>;
  };
}

const ACTION_OPTIONS: ActionOption[] = [
  {
    type: 'send_email',
    label: 'Send Email',
    description: 'Send a personalized email to the contact',
    icon: Mail,
    category: 'communication',
    popular: true,
    config: {
      fields: [
        {
          key: 'to',
          label: 'To Email',
          type: 'variable',
          required: true,
          placeholder: 'contact.email',
          description: 'Email address to send to'
        },
        {
          key: 'subject',
          label: 'Subject',
          type: 'variable',
          required: true,
          placeholder: 'Welcome {{contact.firstName}}!',
          description: 'Email subject line'
        },
        {
          key: 'body',
          label: 'Email Body',
          type: 'textarea',
          required: true,
          placeholder: 'Hi {{contact.firstName}},\n\nWelcome to our platform!',
          description: 'Email content with variable support'
        },
        {
          key: 'fromName',
          label: 'From Name',
          type: 'text',
          placeholder: 'Your Company',
          description: 'Sender name'
        },
        {
          key: 'replyTo',
          label: 'Reply To',
          type: 'email',
          placeholder: 'noreply@yourcompany.com',
          description: 'Reply-to email address'
        }
      ]
    }
  },
  {
    type: 'send_sms',
    label: 'Send SMS',
    description: 'Send a text message to the contact',
    icon: MessageSquare,
    category: 'communication',
    popular: true,
    config: {
      fields: [
        {
          key: 'to',
          label: 'Phone Number',
          type: 'variable',
          required: true,
          placeholder: 'contact.phone',
          description: 'Phone number to send SMS to'
        },
        {
          key: 'message',
          label: 'Message',
          type: 'textarea',
          required: true,
          placeholder: 'Hi {{contact.firstName}}, thanks for signing up!',
          description: 'SMS message content'
        }
      ]
    }
  },
  {
    type: 'create_task',
    label: 'Create Task',
    description: 'Create a task for follow-up',
    icon: Calendar,
    category: 'crm',
    popular: true,
    config: {
      fields: [
        {
          key: 'title',
          label: 'Task Title',
          type: 'variable',
          required: true,
          placeholder: 'Follow up with {{contact.firstName}}',
          description: 'Task title'
        },
        {
          key: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Contact details...',
          description: 'Task description'
        },
        {
          key: 'type',
          label: 'Task Type',
          type: 'select',
          options: ['call', 'email', 'meeting', 'follow_up', 'demo'],
          required: true,
          description: 'Type of task to create'
        },
        {
          key: 'priority',
          label: 'Priority',
          type: 'select',
          options: ['low', 'medium', 'high'],
          description: 'Task priority level'
        },
        {
          key: 'dueInDays',
          label: 'Due in Days',
          type: 'number',
          placeholder: '1',
          description: 'Number of days from now'
        },
        {
          key: 'assignedTo',
          label: 'Assigned To',
          type: 'select',
          options: ['current_user', 'contact_owner', 'team_lead'],
          description: 'Who to assign the task to'
        }
      ]
    }
  },
  {
    type: 'update_contact',
    label: 'Update Contact',
    description: 'Update contact properties or fields',
    icon: Users,
    category: 'crm',
    config: {
      fields: [
        {
          key: 'fieldsToUpdate',
          label: 'Fields to Update',
          type: 'select',
          options: ['leadScore', 'lifecycleStage', 'priority', 'tags', 'notes'],
          description: 'Which contact fields to update'
        },
        {
          key: 'leadScore',
          label: 'New Lead Score',
          type: 'number',
          placeholder: '100',
          description: 'Updated lead score value'
        },
        {
          key: 'lifecycleStage',
          label: 'Lifecycle Stage',
          type: 'select',
          options: ['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer'],
          description: 'New lifecycle stage'
        },
        {
          key: 'priority',
          label: 'Priority',
          type: 'select',
          options: ['low', 'medium', 'high'],
          description: 'Contact priority level'
        }
      ]
    }
  },
  {
    type: 'add_tag',
    label: 'Add Tag',
    description: 'Add tags to categorize the contact',
    icon: Tag,
    category: 'crm',
    config: {
      fields: [
        {
          key: 'tags',
          label: 'Tags to Add',
          type: 'text',
          required: true,
          placeholder: 'vip, newsletter-subscriber',
          description: 'Comma-separated list of tags'
        }
      ]
    }
  },
  {
    type: 'change_lifecycle_stage',
    label: 'Change Lifecycle Stage',
    description: 'Move contact to a different lifecycle stage',
    icon: Zap,
    category: 'crm',
    config: {
      fields: [
        {
          key: 'stage',
          label: 'New Stage',
          type: 'select',
          options: ['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer'],
          required: true,
          description: 'Target lifecycle stage'
        }
      ]
    }
  },
  {
    type: 'create_deal',
    label: 'Create Deal',
    description: 'Create a new deal for the contact',
    icon: DollarSign,
    category: 'crm',
    config: {
      fields: [
        {
          key: 'title',
          label: 'Deal Title',
          type: 'variable',
          required: true,
          placeholder: 'Deal with {{contact.company}}',
          description: 'Deal title'
        },
        {
          key: 'value',
          label: 'Deal Value',
          type: 'number',
          required: true,
          placeholder: '5000',
          description: 'Expected deal value'
        },
        {
          key: 'currency',
          label: 'Currency',
          type: 'select',
          options: ['USD', 'EUR', 'GBP', 'CAD'],
          description: 'Deal currency'
        },
        {
          key: 'stage',
          label: 'Initial Stage',
          type: 'select',
          options: ['lead', 'qualified', 'proposal', 'negotiation'],
          required: true,
          description: 'Starting deal stage'
        },
        {
          key: 'probability',
          label: 'Probability (%)',
          type: 'number',
          placeholder: '25',
          description: 'Win probability percentage'
        }
      ]
    }
  },
  {
    type: 'send_webhook',
    label: 'Send Webhook',
    description: 'Send data to an external webhook URL',
    icon: Webhook,
    category: 'integrations',
    config: {
      fields: [
        {
          key: 'url',
          label: 'Webhook URL',
          type: 'url',
          required: true,
          placeholder: 'https://api.example.com/webhook',
          description: 'Target webhook endpoint'
        },
        {
          key: 'method',
          label: 'HTTP Method',
          type: 'select',
          options: ['POST', 'PUT', 'PATCH'],
          description: 'HTTP method to use'
        },
        {
          key: 'headers',
          label: 'Headers',
          type: 'textarea',
          placeholder: 'Authorization: Bearer token\nContent-Type: application/json',
          description: 'HTTP headers (one per line)'
        },
        {
          key: 'payload',
          label: 'Payload',
          type: 'textarea',
          placeholder: '{"contact": "{{contact.email}}", "event": "contact_created"}',
          description: 'JSON payload to send'
        }
      ]
    }
  },
  {
    type: 'wait_delay',
    label: 'Wait/Delay',
    description: 'Add a delay before the next action',
    icon: Clock,
    category: 'automation',
    config: {
      fields: [
        {
          key: 'duration',
          label: 'Duration',
          type: 'number',
          required: true,
          placeholder: '5',
          description: 'Wait duration'
        },
        {
          key: 'unit',
          label: 'Time Unit',
          type: 'select',
          options: ['minutes', 'hours', 'days', 'weeks'],
          required: true,
          description: 'Duration unit'
        }
      ]
    }
  },
  {
    type: 'add_to_sequence',
    label: 'Add to Sequence',
    description: 'Add contact to an email sequence',
    icon: Play,
    category: 'communication',
    config: {
      fields: [
        {
          key: 'sequenceId',
          label: 'Email Sequence',
          type: 'select',
          options: ['welcome', 'nurture', 'onboarding', 'sales'],
          required: true,
          description: 'Target email sequence'
        },
        {
          key: 'startDelay',
          label: 'Start Delay (hours)',
          type: 'number',
          placeholder: '0',
          description: 'Delay before starting sequence'
        }
      ]
    }
  }
];

// Available workflow variables for dynamic content
const WORKFLOW_VARIABLES: WorkflowVariable[] = [
  { key: 'contact.firstName', label: 'Contact First Name', type: 'string', source: 'contact', path: 'firstName' },
  { key: 'contact.lastName', label: 'Contact Last Name', type: 'string', source: 'contact', path: 'lastName' },
  { key: 'contact.email', label: 'Contact Email', type: 'string', source: 'contact', path: 'email' },
  { key: 'contact.phone', label: 'Contact Phone', type: 'string', source: 'contact', path: 'phone' },
  { key: 'contact.company', label: 'Contact Company', type: 'string', source: 'contact', path: 'company' },
  { key: 'contact.title', label: 'Contact Title', type: 'string', source: 'contact', path: 'title' },
  { key: 'deal.title', label: 'Deal Title', type: 'string', source: 'deal', path: 'title' },
  { key: 'deal.value', label: 'Deal Value', type: 'number', source: 'deal', path: 'value' },
  { key: 'deal.stage', label: 'Deal Stage', type: 'string', source: 'deal', path: 'stage' },
  { key: 'trigger.timestamp', label: 'Trigger Timestamp', type: 'date', source: 'trigger', path: 'timestamp' },
  { key: 'current.date', label: 'Current Date', type: 'date', source: 'custom', path: 'date' },
  { key: 'current.time', label: 'Current Time', type: 'string', source: 'custom', path: 'time' }
];

interface ActionConfigurationPanelProps {
  onSelect: (action: Omit<AutomationAction, 'id' | 'position'>) => void;
  onCancel: () => void;
}

export default function ActionConfigurationPanel({ onSelect, onCancel }: ActionConfigurationPanelProps) {
  const [selectedAction, setSelectedAction] = useState<ActionOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [config, setConfig] = useState<Record<string, any>>({});
  const [showVariables, setShowVariables] = useState(false);

  const categories = [
    { id: 'all', label: 'All Actions', icon: Settings },
    { id: 'communication', label: 'Communication', icon: Mail },
    { id: 'crm', label: 'CRM', icon: Users },
    { id: 'automation', label: 'Automation', icon: Zap },
    { id: 'integrations', label: 'Integrations', icon: Webhook }
  ];

  const filteredActions = ACTION_OPTIONS.filter(action => {
    const matchesSearch = action.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || action.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectAction = () => {
    if (!selectedAction) return;

    const action: Omit<AutomationAction, 'id' | 'position'> = {
      type: selectedAction.type,
      label: selectedAction.label,
      icon: selectedAction.icon.name || 'action',
      config
    };

    onSelect(action);
  };

  const insertVariable = (variable: WorkflowVariable, fieldKey: string) => {
    const currentValue = config[fieldKey] || '';
    const newValue = currentValue + `{{${variable.key}}}`;
    handleConfigChange(fieldKey, newValue);
  };

  const renderConfigField = (field: ActionOption['config']['fields'][0]) => {
    const value = config[field.key] || '';

    const baseInput = (() => {
      switch (field.type) {
        case 'textarea':
          return (
            <Textarea
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              data-testid={`textarea-${field.key}`}
            />
          );
        case 'number':
          return (
            <Input
              type="number"
              value={value}
              onChange={(e) => handleConfigChange(field.key, Number(e.target.value))}
              placeholder={field.placeholder}
              data-testid={`input-${field.key}`}
            />
          );
        case 'email':
          return (
            <Input
              type="email"
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              data-testid={`input-${field.key}`}
            />
          );
        case 'url':
          return (
            <Input
              type="url"
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              data-testid={`input-${field.key}`}
            />
          );
        case 'select':
          return (
            <Select
              value={value}
              onValueChange={(value) => handleConfigChange(field.key, value)}
            >
              <SelectTrigger data-testid={`select-${field.key}`}>
                <SelectValue placeholder={field.placeholder || 'Select option...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(option => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'variable':
        case 'text':
        default:
          return (
            <Input
              value={value}
              onChange={(e) => handleConfigChange(field.key, e.target.value)}
              placeholder={field.placeholder}
              data-testid={`input-${field.key}`}
            />
          );
      }
    })();

    return (
      <div className="space-y-2">
        {baseInput}
        {(field.type === 'variable' || field.type === 'textarea') && (
          <div className="flex flex-wrap gap-1">
            {WORKFLOW_VARIABLES.slice(0, 6).map(variable => (
              <Button
                key={variable.key}
                variant="outline"
                size="sm"
                className="text-xs h-6"
                onClick={() => insertVariable(variable, field.key)}
                data-testid={`button-variable-${variable.key}-${field.key}`}
              >
                {variable.label}
              </Button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6"
              onClick={() => setShowVariables(!showVariables)}
              data-testid="button-show-all-variables"
            >
              {showVariables ? 'Less' : 'More...'}
            </Button>
          </div>
        )}
        {showVariables && (field.type === 'variable' || field.type === 'textarea') && (
          <div className="grid grid-cols-2 gap-1 p-2 bg-muted rounded-md">
            {WORKFLOW_VARIABLES.map(variable => (
              <Button
                key={variable.key}
                variant="ghost"
                size="sm"
                className="text-xs h-6 justify-start"
                onClick={() => insertVariable(variable, field.key)}
                data-testid={`button-all-variables-${variable.key}-${field.key}`}
              >
                {variable.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (selectedAction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Configure Action</h3>
            <p className="text-sm text-muted-foreground">{selectedAction.description}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedAction(null)}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <selectedAction.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-base">{selectedAction.label}</CardTitle>
                <CardDescription>{selectedAction.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedAction.config.fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderConfigField(field)}
                {field.description && (
                  <p className="text-xs text-muted-foreground">{field.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSelectAction} data-testid="button-add-action">
            Add Action
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Choose an Action</h3>
        <p className="text-sm text-muted-foreground">
          Select what should happen when your automation runs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-actions"
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

      {/* Action Options */}
      <ScrollArea className="h-96">
        <div className="grid gap-3">
          {filteredActions.map(action => (
            <Card
              key={action.type}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedAction(action)}
              data-testid={`card-action-${action.type}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900 flex-shrink-0">
                    <action.icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{action.label}</h4>
                      <div className="flex space-x-1">
                        {action.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {action.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}