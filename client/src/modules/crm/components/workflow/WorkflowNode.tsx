import { forwardRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Settings, Trash2, Play, Mail, MessageSquare, UserPlus, 
  Tag, Clock, Webhook, CheckCircle, XCircle, AlertTriangle,
  Users, DollarSign, Calendar, FileText, Zap, Filter
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AutomationTrigger, AutomationAction, AutomationCondition } from "../../types";

interface WorkflowNodeProps {
  id: string;
  type: 'trigger' | 'condition' | 'action';
  data: AutomationTrigger | AutomationAction | AutomationCondition;
  selected?: boolean;
  position: { x: number; y: number };
  onSelect?: (id: string) => void;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  className?: string;
  dragDisabled?: boolean;
}

const ICON_MAP = {
  // Trigger icons
  'contact.created': UserPlus,
  'deal.created': DollarSign,
  'stage.changed': Zap,
  'task.overdue': AlertTriangle,
  'email.opened': Mail,
  'page.viewed': FileText,
  
  // Action icons
  'send_email': Mail,
  'send_sms': MessageSquare,
  'create_task': Calendar,
  'update_contact': Users,
  'add_tag': Tag,
  'change_lifecycle_stage': Zap,
  'create_deal': DollarSign,
  'send_webhook': Webhook,
  'wait_delay': Clock,
  'add_to_sequence': Play,
  
  // Condition icons
  'field_equals': Filter,
  'field_contains': Filter,
  'field_greater_than': Filter,
  'field_less_than': Filter,
  'tag_has': Tag,
  'lifecycle_stage': Users,
  'lead_score': CheckCircle,
};

const TYPE_COLORS = {
  trigger: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300',
  condition: 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950 dark:border-amber-800 dark:text-amber-300',
  action: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
};

const WorkflowNode = forwardRef<HTMLDivElement, WorkflowNodeProps>(({
  id,
  type,
  data,
  selected,
  position,
  onSelect,
  onDelete,
  onEdit,
  className,
  dragDisabled = false
}, ref) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id,
    disabled: dragDisabled,
    data: { type, data }
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    left: position.x,
    top: position.y,
    position: 'absolute' as const,
    zIndex: isDragging ? 1000 : selected ? 100 : 10
  };

  const IconComponent = ICON_MAP[data.type as keyof typeof ICON_MAP] || Settings;
  const typeColor = TYPE_COLORS[type];

  const getNodeTitle = () => {
    if ('label' in data && data.label) {
      return data.label;
    }
    
    const titleMap: Record<string, string> = {
      'contact.created': 'New Contact',
      'deal.created': 'New Deal',
      'stage.changed': 'Stage Changed',
      'task.overdue': 'Task Overdue',
      'email.opened': 'Email Opened',
      'page.viewed': 'Page Viewed',
      'send_email': 'Send Email',
      'send_sms': 'Send SMS',
      'create_task': 'Create Task',
      'update_contact': 'Update Contact',
      'add_tag': 'Add Tag',
      'change_lifecycle_stage': 'Change Stage',
      'create_deal': 'Create Deal',
      'send_webhook': 'Send Webhook',
      'wait_delay': 'Wait',
      'add_to_sequence': 'Add to Sequence',
      'field_equals': 'Field Equals',
      'field_contains': 'Field Contains',
      'field_greater_than': 'Field Greater Than',
      'field_less_than': 'Field Less Than',
      'tag_has': 'Has Tag',
      'lifecycle_stage': 'Lifecycle Stage',
      'lead_score': 'Lead Score'
    };
    
    return titleMap[data.type] || data.type;
  };

  const getNodeDescription = () => {
    if (type === 'condition' && 'field' in data && 'operator' in data && 'value' in data) {
      return `${data.field} ${data.operator} ${data.value}`;
    }
    if (type === 'action' && 'config' in data && data.config) {
      const config = data.config;
      if (data.type === 'send_email' && config.subject) {
        return config.subject;
      }
      if (data.type === 'create_task' && config.title) {
        return config.title;
      }
      if (data.type === 'wait_delay' && config.duration) {
        return `Wait ${config.duration} ${config.unit || 'minutes'}`;
      }
    }
    return 'Click to configure';
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(id);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  return (
    <div
      ref={ref}
      style={style}
      className={cn(
        "cursor-pointer transition-all duration-200",
        isDragging && "opacity-50 scale-95",
        className
      )}
      onClick={handleClick}
      data-testid={`workflow-node-${id}`}
    >
      <Card 
        ref={setNodeRef}
        className={cn(
          "w-64 transition-all duration-200 hover:shadow-md",
          typeColor,
          selected && "ring-2 ring-primary ring-offset-2",
          isDragging && "shadow-lg"
        )}
        {...attributes}
        {...listeners}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "p-2 rounded-lg",
                type === 'trigger' && "bg-blue-100 dark:bg-blue-900",
                type === 'condition' && "bg-amber-100 dark:bg-amber-900",
                type === 'action' && "bg-green-100 dark:bg-green-900"
              )}>
                <IconComponent className="h-4 w-4" />
              </div>
              <div>
                <Badge variant="outline" className="text-xs">
                  {type.toUpperCase()}
                </Badge>
              </div>
            </div>
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleEdit}
                data-testid={`button-edit-node-${id}`}
              >
                <Settings className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-destructive"
                onClick={handleDelete}
                data-testid={`button-delete-node-${id}`}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-sm leading-tight">
              {getNodeTitle()}
            </h4>
            <p className="text-xs text-muted-foreground">
              {getNodeDescription()}
            </p>
          </div>

          {/* Connection handles */}
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <div className="w-3 h-3 bg-background border-2 border-border rounded-full" />
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-3 h-3 bg-background border-2 border-border rounded-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
});

WorkflowNode.displayName = "WorkflowNode";

export default WorkflowNode;