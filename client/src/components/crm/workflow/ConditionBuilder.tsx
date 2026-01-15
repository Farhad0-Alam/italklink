import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Filter, Plus, Trash2, Users, Tag, Star, Calendar, 
  Mail, Phone, Building, MapPin, DollarSign, Percent
} from "lucide-react";
import type { AutomationCondition } from "../../types";

interface ConditionField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  icon: React.ComponentType<{ className?: string }>;
  category: 'contact' | 'deal' | 'task' | 'engagement';
  options?: string[];
}

const CONDITION_FIELDS: ConditionField[] = [
  // Contact fields
  { key: 'firstName', label: 'First Name', type: 'string', icon: Users, category: 'contact' },
  { key: 'lastName', label: 'Last Name', type: 'string', icon: Users, category: 'contact' },
  { key: 'email', label: 'Email', type: 'string', icon: Mail, category: 'contact' },
  { key: 'phone', label: 'Phone', type: 'string', icon: Phone, category: 'contact' },
  { key: 'company', label: 'Company', type: 'string', icon: Building, category: 'contact' },
  { key: 'title', label: 'Job Title', type: 'string', icon: Users, category: 'contact' },
  { key: 'location', label: 'Location', type: 'string', icon: MapPin, category: 'contact' },
  { key: 'leadScore', label: 'Lead Score', type: 'number', icon: Star, category: 'contact' },
  { key: 'lifecycleStage', label: 'Lifecycle Stage', type: 'select', icon: Users, category: 'contact',
    options: ['subscriber', 'lead', 'marketing_qualified_lead', 'sales_qualified_lead', 'opportunity', 'customer'] },
  { key: 'priority', label: 'Priority', type: 'select', icon: Star, category: 'contact',
    options: ['low', 'medium', 'high'] },
  { key: 'tags', label: 'Tags', type: 'string', icon: Tag, category: 'contact' },
  { key: 'createdAt', label: 'Created Date', type: 'date', icon: Calendar, category: 'contact' },
  
  // Deal fields
  { key: 'dealTitle', label: 'Deal Title', type: 'string', icon: DollarSign, category: 'deal' },
  { key: 'dealValue', label: 'Deal Value', type: 'number', icon: DollarSign, category: 'deal' },
  { key: 'dealStage', label: 'Deal Stage', type: 'select', icon: DollarSign, category: 'deal',
    options: ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] },
  { key: 'dealProbability', label: 'Deal Probability', type: 'number', icon: Percent, category: 'deal' },
  { key: 'expectedCloseDate', label: 'Expected Close Date', type: 'date', icon: Calendar, category: 'deal' },
  
  // Task fields
  { key: 'taskStatus', label: 'Task Status', type: 'select', icon: Calendar, category: 'task',
    options: ['pending', 'in_progress', 'completed', 'cancelled'] },
  { key: 'taskPriority', label: 'Task Priority', type: 'select', icon: Star, category: 'task',
    options: ['low', 'medium', 'high'] },
  { key: 'dueDate', label: 'Due Date', type: 'date', icon: Calendar, category: 'task' }
];

const OPERATORS = {
  string: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'contains', label: 'contains' },
    { value: 'not_contains', label: 'does not contain' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' }
  ],
  number: [
    { value: 'equals', label: 'equals' },
    { value: 'not_equals', label: 'does not equal' },
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
    { value: 'greater_than_or_equal', label: 'greater than or equal' },
    { value: 'less_than_or_equal', label: 'less than or equal' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' }
  ],
  date: [
    { value: 'equals', label: 'is on' },
    { value: 'not_equals', label: 'is not on' },
    { value: 'before', label: 'is before' },
    { value: 'after', label: 'is after' },
    { value: 'within_days', label: 'is within days' },
    { value: 'older_than_days', label: 'is older than days' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' }
  ],
  select: [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' },
    { value: 'is_empty', label: 'is empty' },
    { value: 'is_not_empty', label: 'is not empty' }
  ],
  boolean: [
    { value: 'equals', label: 'is' },
    { value: 'not_equals', label: 'is not' }
  ]
};

interface ConditionGroup {
  id: string;
  conditions: ConditionItem[];
  logicOperator: 'AND' | 'OR';
}

interface ConditionItem {
  id: string;
  field: string;
  operator: string;
  value: any;
}

interface ConditionBuilderProps {
  onSelect: (conditions: Omit<AutomationCondition, 'id' | 'position'>[]) => void;
  onCancel: () => void;
  initialConditions?: Omit<AutomationCondition, 'id' | 'position'>[];
}

export default function ConditionBuilder({ onSelect, onCancel, initialConditions = [] }: ConditionBuilderProps) {
  const [conditionGroups, setConditionGroups] = useState<ConditionGroup[]>([
    {
      id: '1',
      conditions: [{ id: '1', field: '', operator: '', value: '' }],
      logicOperator: 'AND'
    }
  ]);

  const addConditionGroup = () => {
    const newGroup: ConditionGroup = {
      id: Date.now().toString(),
      conditions: [{ id: Date.now().toString(), field: '', operator: '', value: '' }],
      logicOperator: 'AND'
    };
    setConditionGroups([...conditionGroups, newGroup]);
  };

  const removeConditionGroup = (groupId: string) => {
    setConditionGroups(conditionGroups.filter(group => group.id !== groupId));
  };

  const addCondition = (groupId: string) => {
    setConditionGroups(conditionGroups.map(group => {
      if (group.id === groupId) {
        const newCondition: ConditionItem = {
          id: Date.now().toString(),
          field: '',
          operator: '',
          value: ''
        };
        return { ...group, conditions: [...group.conditions, newCondition] };
      }
      return group;
    }));
  };

  const removeCondition = (groupId: string, conditionId: string) => {
    setConditionGroups(conditionGroups.map(group => {
      if (group.id === groupId) {
        return { ...group, conditions: group.conditions.filter(c => c.id !== conditionId) };
      }
      return group;
    }));
  };

  const updateCondition = (groupId: string, conditionId: string, field: string, value: any) => {
    setConditionGroups(conditionGroups.map(group => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: group.conditions.map(condition => {
            if (condition.id === conditionId) {
              return { ...condition, [field]: value };
            }
            return condition;
          })
        };
      }
      return group;
    }));
  };

  const updateGroupLogic = (groupId: string, logicOperator: 'AND' | 'OR') => {
    setConditionGroups(conditionGroups.map(group => {
      if (group.id === groupId) {
        return { ...group, logicOperator };
      }
      return group;
    }));
  };

  const getFieldConfig = (fieldKey: string) => {
    return CONDITION_FIELDS.find(field => field.key === fieldKey);
  };

  const getOperators = (fieldType: string) => {
    return OPERATORS[fieldType as keyof typeof OPERATORS] || OPERATORS.string;
  };

  const handleSave = () => {
    const conditions = conditionGroups.flatMap(group => 
      group.conditions
        .filter(condition => condition.field && condition.operator)
        .map(condition => ({
          type: 'field_equals' as const,
          field: condition.field,
          operator: condition.operator as 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty',
          value: condition.value,
          logicOperator: group.logicOperator
        }))
    );
    
    onSelect(conditions);
  };

  const renderValueInput = (condition: ConditionItem, fieldConfig?: ConditionField) => {
    if (!fieldConfig) return null;

    const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator);
    if (!needsValue) return null;

    switch (fieldConfig.type) {
      case 'select':
        return (
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(condition.id, condition.id, 'value', value)}
          >
            <SelectTrigger data-testid={`select-value-${condition.id}`}>
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {fieldConfig.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'number':
        return (
          <Input
            type="number"
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, condition.id, 'value', Number(e.target.value))}
            placeholder="Enter number..."
            data-testid={`input-value-${condition.id}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, condition.id, 'value', e.target.value)}
            data-testid={`input-value-${condition.id}`}
          />
        );
      case 'boolean':
        return (
          <Select
            value={condition.value}
            onValueChange={(value) => updateCondition(condition.id, condition.id, 'value', value === 'true')}
          >
            <SelectTrigger data-testid={`select-value-${condition.id}`}>
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            value={condition.value}
            onChange={(e) => updateCondition(condition.id, condition.id, 'value', e.target.value)}
            placeholder="Enter value..."
            data-testid={`input-value-${condition.id}`}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Add Conditions</h3>
        <p className="text-sm text-muted-foreground">
          Define when this automation should run based on contact, deal, or task properties
        </p>
      </div>

      <ScrollArea className="h-96">
        <div className="space-y-4">
          {conditionGroups.map((group, groupIndex) => (
            <Card key={group.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Condition Group {groupIndex + 1}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={group.logicOperator}
                      onValueChange={(value: 'AND' | 'OR') => updateGroupLogic(group.id, value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AND">AND</SelectItem>
                        <SelectItem value="OR">OR</SelectItem>
                      </SelectContent>
                    </Select>
                    {conditionGroups.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeConditionGroup(group.id)}
                        data-testid={`button-remove-group-${group.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.conditions.map((condition, conditionIndex) => {
                  const fieldConfig = getFieldConfig(condition.field);
                  const operators = fieldConfig ? getOperators(fieldConfig.type) : [];

                  return (
                    <div key={condition.id} className="flex items-center space-x-2">
                      {conditionIndex > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {group.logicOperator}
                        </Badge>
                      )}
                      
                      {/* Field selector */}
                      <Select
                        value={condition.field}
                        onValueChange={(value) => updateCondition(group.id, condition.id, 'field', value)}
                      >
                        <SelectTrigger className="flex-1" data-testid={`select-field-${condition.id}`}>
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          {CONDITION_FIELDS.map(field => (
                            <SelectItem key={field.key} value={field.key}>
                              <div className="flex items-center space-x-2">
                                <field.icon className="h-3 w-3" />
                                <span>{field.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Operator selector */}
                      <Select
                        value={condition.operator}
                        onValueChange={(value) => updateCondition(group.id, condition.id, 'operator', value)}
                        disabled={!condition.field}
                      >
                        <SelectTrigger className="flex-1" data-testid={`select-operator-${condition.id}`}>
                          <SelectValue placeholder="Select operator..." />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map(operator => (
                            <SelectItem key={operator.value} value={operator.value}>
                              {operator.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Value input */}
                      <div className="flex-1">
                        {renderValueInput(condition, fieldConfig)}
                      </div>

                      {/* Remove condition */}
                      {group.conditions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCondition(group.id, condition.id)}
                          data-testid={`button-remove-condition-${condition.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addCondition(group.id)}
                  className="w-full"
                  data-testid={`button-add-condition-${group.id}`}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Condition
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={addConditionGroup}
          data-testid="button-add-condition-group"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Group
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} data-testid="button-save-conditions">
            Add Conditions
          </Button>
        </div>
      </div>
    </div>
  );
}