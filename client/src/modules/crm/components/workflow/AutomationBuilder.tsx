import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Save, Play, AlertTriangle, CheckCircle, Zap, Plus, 
  Settings, Template, FileText, TestTube, Clock, Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

import WorkflowCanvas from "./WorkflowCanvas";
import TriggerSelector from "./TriggerSelector";
import ConditionBuilder from "./ConditionBuilder";
import ActionConfigurationPanel from "./ActionConfigurationPanel";
import TemplateLibrary from "./TemplateLibrary";

import type { 
  AutomationWorkflow, 
  AutomationTrigger, 
  AutomationAction, 
  AutomationCondition,
  AutomationTemplate,
  WorkflowConnection 
} from "../../types";

interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
}

interface AutomationBuilderProps {
  initialWorkflow?: AutomationWorkflow;
  onSave: (workflow: AutomationWorkflow) => void;
  onCancel: () => void;
  onTest?: (workflow: AutomationWorkflow) => void;
  isEditing?: boolean;
}

export default function AutomationBuilder({
  initialWorkflow,
  onSave,
  onCancel,
  onTest,
  isEditing = false
}: AutomationBuilderProps) {
  const [workflow, setWorkflow] = useState<AutomationWorkflow>(() => ({
    name: initialWorkflow?.name || '',
    description: initialWorkflow?.description || '',
    triggers: initialWorkflow?.triggers || [],
    conditions: initialWorkflow?.conditions || [],
    actions: initialWorkflow?.actions || [],
    connections: initialWorkflow?.connections || [],
    enabled: initialWorkflow?.enabled ?? true
  }));

  const [activePanel, setActivePanel] = useState<string>('canvas');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { toast } = useToast();

  // Auto-validate workflow when it changes
  useEffect(() => {
    const validateWorkflow = () => {
      setIsValidating(true);
      const errors: ValidationError[] = [];

      // Check if workflow has a name
      if (!workflow.name.trim()) {
        errors.push({
          type: 'error',
          message: 'Workflow must have a name'
        });
      }

      // Check if workflow has at least one trigger
      if (workflow.triggers.length === 0) {
        errors.push({
          type: 'error',
          message: 'Workflow must have at least one trigger'
        });
      }

      // Check if workflow has at least one action
      if (workflow.actions.length === 0) {
        errors.push({
          type: 'error',
          message: 'Workflow must have at least one action'
        });
      }

      // Validate trigger configurations
      workflow.triggers.forEach(trigger => {
        if (!trigger.type) {
          errors.push({
            type: 'error',
            message: 'Trigger must have a type configured',
            nodeId: trigger.id
          });
        }
      });

      // Validate condition configurations
      workflow.conditions.forEach(condition => {
        if (!condition.field || !condition.operator) {
          errors.push({
            type: 'error',
            message: 'Condition must have field and operator configured',
            nodeId: condition.id
          });
        }
      });

      // Validate action configurations
      workflow.actions.forEach(action => {
        if (!action.type) {
          errors.push({
            type: 'error',
            message: 'Action must have a type configured',
            nodeId: action.id
          });
        }

        // Validate specific action configurations
        if (action.type === 'send_email') {
          if (!action.config?.to || !action.config?.subject || !action.config?.body) {
            errors.push({
              type: 'error',
              message: 'Email action must have recipient, subject, and body',
              nodeId: action.id
            });
          }
        }

        if (action.type === 'create_task') {
          if (!action.config?.title || !action.config?.type) {
            errors.push({
              type: 'error',
              message: 'Task action must have title and type',
              nodeId: action.id
            });
          }
        }
      });

      // Check for orphaned nodes (nodes without connections)
      const connectedNodeIds = new Set(
        workflow.connections.flatMap(conn => [conn.source, conn.target])
      );
      
      const allNodeIds = [
        ...workflow.triggers.map(t => t.id),
        ...workflow.conditions.map(c => c.id),
        ...workflow.actions.map(a => a.id)
      ];

      if (workflow.triggers.length > 0 && workflow.actions.length > 0 && allNodeIds.length > 1) {
        allNodeIds.forEach(nodeId => {
          if (!connectedNodeIds.has(nodeId)) {
            errors.push({
              type: 'warning',
              message: 'Node is not connected to the workflow',
              nodeId
            });
          }
        });
      }

      setValidationErrors(errors);
      setIsValidating(false);
    };

    const timeoutId = setTimeout(validateWorkflow, 300);
    return () => clearTimeout(timeoutId);
  }, [workflow]);

  const generateNodeId = useCallback(() => nanoid(8), []);

  const addTrigger = useCallback((trigger: Omit<AutomationTrigger, 'id' | 'position'>) => {
    const newTrigger: AutomationTrigger = {
      ...trigger,
      id: generateNodeId(),
      position: { x: 100 + workflow.triggers.length * 50, y: 100 }
    };

    setWorkflow(prev => ({
      ...prev,
      triggers: [...prev.triggers, newTrigger]
    }));

    toast({
      title: "Trigger Added",
      description: `${trigger.label} trigger has been added to your workflow`,
    });
  }, [workflow.triggers.length, generateNodeId, toast]);

  const addCondition = useCallback((conditions: Omit<AutomationCondition, 'id' | 'position'>[]) => {
    const newConditions: AutomationCondition[] = conditions.map((condition, index) => ({
      ...condition,
      id: generateNodeId(),
      position: { x: 100 + (workflow.conditions.length + index) * 50, y: 300 }
    }));

    setWorkflow(prev => ({
      ...prev,
      conditions: [...prev.conditions, ...newConditions]
    }));

    toast({
      title: "Conditions Added",
      description: `${conditions.length} condition${conditions.length > 1 ? 's' : ''} added to your workflow`,
    });
  }, [workflow.conditions.length, generateNodeId, toast]);

  const addAction = useCallback((action: Omit<AutomationAction, 'id' | 'position'>) => {
    const newAction: AutomationAction = {
      ...action,
      id: generateNodeId(),
      position: { x: 100 + workflow.actions.length * 50, y: 500 }
    };

    setWorkflow(prev => ({
      ...prev,
      actions: [...prev.actions, newAction]
    }));

    toast({
      title: "Action Added",
      description: `${action.label} action has been added to your workflow`,
    });
  }, [workflow.actions.length, generateNodeId, toast]);

  const applyTemplate = useCallback((template: AutomationTemplate) => {
    // Generate new IDs for all nodes
    const triggerIdMap = new Map<string, string>();
    const conditionIdMap = new Map<string, string>();
    const actionIdMap = new Map<string, string>();

    const triggers: AutomationTrigger[] = template.workflow.triggers.map(trigger => {
      const newId = generateNodeId();
      triggerIdMap.set(`trigger-${template.workflow.triggers.indexOf(trigger) + 1}`, newId);
      return {
        ...trigger,
        id: newId
      };
    });

    const conditions: AutomationCondition[] = template.workflow.conditions.map(condition => {
      const newId = generateNodeId();
      conditionIdMap.set(`condition-${template.workflow.conditions.indexOf(condition) + 1}`, newId);
      return {
        ...condition,
        id: newId
      };
    });

    const actions: AutomationAction[] = template.workflow.actions.map(action => {
      const newId = generateNodeId();
      actionIdMap.set(`action-${template.workflow.actions.indexOf(action) + 1}`, newId);
      return {
        ...action,
        id: newId
      };
    });

    // Update connections with new IDs
    const connections: WorkflowConnection[] = template.workflow.connections.map(conn => {
      const newSourceId = triggerIdMap.get(conn.source) || 
                         conditionIdMap.get(conn.source) || 
                         actionIdMap.get(conn.source) || 
                         conn.source;
      const newTargetId = triggerIdMap.get(conn.target) || 
                         conditionIdMap.get(conn.target) || 
                         actionIdMap.get(conn.target) || 
                         conn.target;
      
      return {
        ...conn,
        id: generateNodeId(),
        source: newSourceId,
        target: newTargetId
      };
    });

    setWorkflow({
      ...template.workflow,
      triggers,
      conditions,
      actions,
      connections
    });

    setActivePanel('canvas');
    
    toast({
      title: "Template Applied",
      description: `${template.name} template has been loaded. You can now customize it.`,
    });
  }, [generateNodeId, toast]);

  const handleSave = useCallback(() => {
    const errors = validationErrors.filter(e => e.type === 'error');
    if (errors.length > 0) {
      toast({
        title: "Validation Errors",
        description: "Please fix all errors before saving the workflow",
        variant: "destructive",
      });
      return;
    }

    onSave(workflow);
  }, [workflow, validationErrors, onSave, toast]);

  const handleTest = useCallback(async () => {
    const errors = validationErrors.filter(e => e.type === 'error');
    if (errors.length > 0) {
      toast({
        title: "Cannot Test",
        description: "Please fix all errors before testing the workflow",
        variant: "destructive",
      });
      return;
    }

    setIsTesting(true);
    try {
      await onTest?.(workflow);
      toast({
        title: "Test Started",
        description: "Workflow test has been initiated with sample data",
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to start workflow test",
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  }, [workflow, validationErrors, onTest, toast]);

  const hasErrors = validationErrors.some(e => e.type === 'error');
  const hasWarnings = validationErrors.some(e => e.type === 'warning');

  return (
    <div className="flex h-[600px] w-full">
      {/* Left Sidebar - Controls */}
      <div className="w-80 border-r bg-background">
        <Tabs value={activePanel} onValueChange={setActivePanel} className="h-full">
          <div className="p-4 border-b">
            <TabsList className="grid w-full grid-cols-4 text-xs">
              <TabsTrigger value="canvas" data-testid="tab-canvas">
                <Settings className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="triggers" data-testid="tab-triggers">
                <Zap className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="actions" data-testid="tab-actions">
                <Plus className="h-3 w-3" />
              </TabsTrigger>
              <TabsTrigger value="templates" data-testid="tab-templates">
                <Template className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="canvas" className="p-4 h-full overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">Workflow Settings</h3>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="workflow-name">Name</Label>
                      <Input
                        id="workflow-name"
                        value={workflow.name}
                        onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter workflow name..."
                        data-testid="input-workflow-name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="workflow-description">Description</Label>
                      <Textarea
                        id="workflow-description"
                        value={workflow.description}
                        onChange={(e) => setWorkflow(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what this workflow does..."
                        rows={3}
                        data-testid="textarea-workflow-description"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Validation Status */}
                <div>
                  <h4 className="font-medium mb-2 flex items-center space-x-2">
                    <CheckCircle className={`h-4 w-4 ${hasErrors ? 'text-destructive' : hasWarnings ? 'text-amber-500' : 'text-green-500'}`} />
                    <span>Validation</span>
                  </h4>
                  
                  {isValidating ? (
                    <div className="text-sm text-muted-foreground">Validating...</div>
                  ) : validationErrors.length === 0 ? (
                    <div className="text-sm text-green-600">No issues found</div>
                  ) : (
                    <div className="space-y-2">
                      {validationErrors.map((error, index) => (
                        <Alert 
                          key={index} 
                          variant={error.type === 'error' ? 'destructive' : 'default'}
                          className="py-2"
                        >
                          <AlertTriangle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {error.message}
                          </AlertDescription>
                        </Alert>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Workflow Stats */}
                <div>
                  <h4 className="font-medium mb-2">Workflow Summary</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>{workflow.triggers.length} Trigger{workflow.triggers.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                      <span>{workflow.conditions.length} Condition{workflow.conditions.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{workflow.actions.length} Action{workflow.actions.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span>{workflow.connections.length} Connection{workflow.connections.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="triggers" className="h-full overflow-hidden">
              <TriggerSelector
                onSelect={addTrigger}
                onCancel={() => setActivePanel('canvas')}
              />
            </TabsContent>

            <TabsContent value="actions" className="h-full overflow-hidden">
              <ActionConfigurationPanel
                onSelect={addAction}
                onCancel={() => setActivePanel('canvas')}
              />
            </TabsContent>

            <TabsContent value="templates" className="h-full overflow-hidden">
              <TemplateLibrary
                onSelectTemplate={applyTemplate}
                onCancel={() => setActivePanel('canvas')}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Canvas Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {isEditing ? 'Edit Automation' : 'Create New Automation'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {workflow.name || 'Untitled Workflow'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTest}
                  disabled={hasErrors || isTesting}
                  data-testid="button-test-workflow"
                >
                  {isTesting ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test
                </Button>
              )}
              <Button
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel-workflow"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={hasErrors}
                data-testid="button-save-workflow"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Automation
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1">
          <WorkflowCanvas
            workflow={workflow}
            onUpdateWorkflow={setWorkflow}
            onNodeSelect={setSelectedNodeId}
            onConnectionSelect={setSelectedConnectionId}
            selectedNodeId={selectedNodeId}
            selectedConnectionId={selectedConnectionId}
            onAddTrigger={() => setActivePanel('triggers')}
            onAddCondition={() => setActivePanel('canvas')}
            onAddAction={() => setActivePanel('actions')}
          />
        </div>
      </div>
    </div>
  );
}