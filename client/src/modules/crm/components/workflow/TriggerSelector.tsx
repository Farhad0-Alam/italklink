import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  UserPlus, DollarSign, Zap, AlertTriangle, Mail, FileText, 
  Search, Filter, Calendar, MessageSquare, Users, Tag
} from "lucide-react";
import type { AutomationTrigger } from "../../types";

interface TriggerOption {
  type: AutomationTrigger['type'];
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: 'contact' | 'deal' | 'task' | 'engagement';
  popular?: boolean;
  config: {
    fields: Array<{
      key: string;
      label: string;
      type: 'text' | 'select' | 'number' | 'multiselect';
      options?: string[];
      required?: boolean;
      placeholder?: string;
    }>;
  };
}

const TRIGGER_OPTIONS: TriggerOption[] = [
  {
    type: 'contact.created',
    label: 'New Contact Created',
    description: 'Triggers when a new contact is added to your CRM',
    icon: UserPlus,
    category: 'contact',
    popular: true,
    config: {
      fields: [
        {
          key: 'source',
          label: 'Contact Source',
          type: 'multiselect',
          options: ['manual', 'import', 'form', 'business_card', 'api'],
          placeholder: 'All sources'
        },
        {
          key: 'tags',
          label: 'Must have tags',
          type: 'multiselect',
          options: ['lead', 'customer', 'prospect', 'vip'],
          placeholder: 'Any tags'
        }
      ]
    }
  },
  {
    type: 'deal.created',
    label: 'New Deal Created',
    description: 'Triggers when a new deal is created in your pipeline',
    icon: DollarSign,
    category: 'deal',
    popular: true,
    config: {
      fields: [
        {
          key: 'pipelineId',
          label: 'Pipeline',
          type: 'select',
          options: ['sales', 'support', 'custom'],
          placeholder: 'Any pipeline'
        },
        {
          key: 'minValue',
          label: 'Minimum Deal Value',
          type: 'number',
          placeholder: '0'
        }
      ]
    }
  },
  {
    type: 'stage.changed',
    label: 'Deal Stage Changed',
    description: 'Triggers when a deal moves to a different stage',
    icon: Zap,
    category: 'deal',
    popular: true,
    config: {
      fields: [
        {
          key: 'fromStage',
          label: 'From Stage',
          type: 'select',
          options: ['lead', 'qualified', 'proposal', 'negotiation'],
          placeholder: 'Any stage'
        },
        {
          key: 'toStage',
          label: 'To Stage',
          type: 'select',
          options: ['qualified', 'proposal', 'negotiation', 'won', 'lost'],
          required: true
        }
      ]
    }
  },
  {
    type: 'task.overdue',
    label: 'Task Overdue',
    description: 'Triggers when a task becomes overdue',
    icon: AlertTriangle,
    category: 'task',
    config: {
      fields: [
        {
          key: 'taskType',
          label: 'Task Type',
          type: 'multiselect',
          options: ['call', 'email', 'meeting', 'follow_up', 'demo'],
          placeholder: 'All task types'
        },
        {
          key: 'overdueDays',
          label: 'Days Overdue',
          type: 'number',
          placeholder: '1'
        }
      ]
    }
  },
  {
    type: 'email.opened',
    label: 'Email Opened',
    description: 'Triggers when a contact opens an email',
    icon: Mail,
    category: 'engagement',
    config: {
      fields: [
        {
          key: 'campaignId',
          label: 'Email Campaign',
          type: 'select',
          options: ['welcome', 'follow_up', 'newsletter'],
          placeholder: 'Any campaign'
        },
        {
          key: 'minOpens',
          label: 'Minimum Opens',
          type: 'number',
          placeholder: '1'
        }
      ]
    }
  },
  {
    type: 'page.viewed',
    label: 'Page Viewed',
    description: 'Triggers when a contact views a specific page',
    icon: FileText,
    category: 'engagement',
    config: {
      fields: [
        {
          key: 'pageUrl',
          label: 'Page URL',
          type: 'text',
          required: true,
          placeholder: 'https://example.com/page'
        },
        {
          key: 'minViews',
          label: 'Minimum Views',
          type: 'number',
          placeholder: '1'
        }
      ]
    }
  }
];

interface TriggerSelectorProps {
  onSelect: (trigger: Omit<AutomationTrigger, 'id' | 'position'>) => void;
  onCancel: () => void;
}

export default function TriggerSelector({ onSelect, onCancel }: TriggerSelectorProps) {
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerOption | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [config, setConfig] = useState<Record<string, any>>({});

  const categories = [
    { id: 'all', label: 'All Triggers', icon: Filter },
    { id: 'contact', label: 'Contact', icon: Users },
    { id: 'deal', label: 'Deals', icon: DollarSign },
    { id: 'task', label: 'Tasks', icon: Calendar },
    { id: 'engagement', label: 'Engagement', icon: MessageSquare }
  ];

  const filteredTriggers = TRIGGER_OPTIONS.filter(trigger => {
    const matchesSearch = trigger.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         trigger.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || trigger.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleSelectTrigger = () => {
    if (!selectedTrigger) return;

    const trigger: Omit<AutomationTrigger, 'id' | 'position'> = {
      type: selectedTrigger.type,
      label: selectedTrigger.label,
      icon: selectedTrigger.icon.name || 'trigger',
      config
    };

    onSelect(trigger);
  };

  const renderConfigField = (field: TriggerOption['config']['fields'][0]) => {
    const value = config[field.key] || '';

    switch (field.type) {
      case 'text':
        return (
          <Input
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            data-testid={`input-${field.key}`}
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
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleConfigChange(field.key, e.target.value)}
            className="w-full p-2 border rounded-md"
            data-testid={`select-${field.key}`}
          >
            <option value="">{field.placeholder}</option>
            {field.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
      case 'multiselect':
        return (
          <div className="space-y-2">
            {field.options?.map(option => (
              <label key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={(value as string[])?.includes(option) || false}
                  onChange={(e) => {
                    const currentValue = (value as string[]) || [];
                    if (e.target.checked) {
                      handleConfigChange(field.key, [...currentValue, option]);
                    } else {
                      handleConfigChange(field.key, currentValue.filter(v => v !== option));
                    }
                  }}
                  data-testid={`checkbox-${field.key}-${option}`}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  if (selectedTrigger) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Configure Trigger</h3>
            <p className="text-sm text-muted-foreground">{selectedTrigger.description}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedTrigger(null)}>
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <selectedTrigger.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-base">{selectedTrigger.label}</CardTitle>
                <CardDescription>{selectedTrigger.description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTrigger.config.fields.map(field => (
              <div key={field.key} className="space-y-2">
                <Label htmlFor={field.key}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {renderConfigField(field)}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSelectTrigger} data-testid="button-add-trigger">
            Add Trigger
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Choose a Trigger</h3>
        <p className="text-sm text-muted-foreground">
          Select what event should start this automation workflow
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search triggers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-triggers"
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

      {/* Trigger Options */}
      <ScrollArea className="h-96">
        <div className="grid gap-3">
          {filteredTriggers.map(trigger => (
            <Card
              key={trigger.type}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setSelectedTrigger(trigger)}
              data-testid={`card-trigger-${trigger.type}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900 flex-shrink-0">
                    <trigger.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-sm">{trigger.label}</h4>
                      <div className="flex space-x-1">
                        {trigger.popular && (
                          <Badge variant="secondary" className="text-xs">
                            Popular
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {trigger.category}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{trigger.description}</p>
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