import { useState, useCallback } from "react";
import { useAutomations, useDeleteAutomation, useToggleAutomation, useTestAutomation, useAutomationRuns } from "../hooks/useCRM";
import { useCreateAutomation, useUpdateAutomation } from "../hooks/useAutomation";
import AutomationBuilder from "./workflow/AutomationBuilder";
import type { AutomationWorkflow } from "../types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Play, Pause, Edit, Trash2, Plus, Activity, Clock, 
  CheckCircle, XCircle, AlertCircle, Eye, TestTube
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function AutomationManager() {
  const [selectedTab, setSelectedTab] = useState("list");
  const [selectedAutomation, setSelectedAutomation] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const { data: automations = [], isLoading } = useAutomations();
  const { data: automationRuns = [] } = useAutomationRuns(undefined, 50);
  const deleteAutomation = useDeleteAutomation();
  const toggleAutomation = useToggleAutomation();
  const testAutomation = useTestAutomation();
  const createAutomation = useCreateAutomation();
  const updateAutomation = useUpdateAutomation(editingAutomation?.id || '');
  const { toast } = useToast();

  const handleToggleAutomation = async (automationId: string, currentState: boolean) => {
    try {
      await toggleAutomation.mutateAsync(automationId);
      toast({
        title: "Success",
        description: `Automation ${currentState ? 'disabled' : 'enabled'} successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${currentState ? 'disable' : 'enable'} automation`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      await deleteAutomation.mutateAsync(automationId);
      toast({
        title: "Success",
        description: "Automation deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    }
  };

  const handleTestAutomation = async (automationId: string) => {
    try {
      await testAutomation.mutateAsync({ 
        automationId, 
        testData: { test: true, timestamp: new Date() } 
      });
      toast({
        title: "Test Started",
        description: "Automation test has been triggered",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test automation",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTriggerLabel = (trigger: any) => {
    const triggerLabels: Record<string, string> = {
      'lead.created': 'New Lead',
      'contact.created': 'New Contact',
      'deal.created': 'New Deal',
      'stage.changed': 'Stage Change',
      'task.overdue': 'Task Overdue'
    };
    return triggerLabels[trigger.type] || trigger.type;
  };

  const getActionSummary = (actions: any[]) => {
    if (!actions || actions.length === 0) return "No actions";
    
    const actionCounts = actions.reduce((acc: Record<string, number>, action) => {
      const type = action.type.split('.')[0];
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(actionCounts)
      .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
      .join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automation Workflows</h2>
          <p className="text-muted-foreground">
            Automate your sales processes with smart triggers and actions
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingAutomation(null);
            setShowBuilder(true);
          }} 
          data-testid="button-create-automation"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Automation
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="list" data-testid="tab-automation-list">
            Automations
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-automation-logs">
            Execution Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {automations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No automations yet</h3>
                <p className="text-muted-foreground text-center mb-6 max-w-md">
                  Create your first automation to streamline your sales process and save time
                </p>
                <Button onClick={() => setShowBuilder(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Automation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {automations.map((automation: any) => (
                <Card key={automation.id} data-testid={`card-automation-${automation.id}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div>
                          <CardTitle className="text-lg">{automation.name}</CardTitle>
                          <CardDescription>{automation.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={automation.enabled ? "default" : "secondary"}>
                          {automation.enabled ? "Active" : "Disabled"}
                        </Badge>
                        <Switch
                          checked={automation.enabled}
                          onCheckedChange={(checked) => handleToggleAutomation(automation.id, automation.enabled)}
                          data-testid={`switch-automation-${automation.id}`}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Triggers</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(automation.triggers || []).map((trigger: any, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {getTriggerLabel(trigger)}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Actions</p>
                        <p className="text-sm text-foreground mt-1">
                          {getActionSummary(automation.actions)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Statistics</p>
                        <div className="text-sm text-foreground mt-1">
                          <div>Runs: {automation.totalRuns || 0}</div>
                          <div>Success Rate: {automation.totalRuns > 0 
                            ? Math.round((automation.successfulRuns / automation.totalRuns) * 100) 
                            : 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="text-sm text-muted-foreground">
                        {automation.lastTriggered ? (
                          <>Last run: {formatDistanceToNow(new Date(automation.lastTriggered))} ago</>
                        ) : (
                          'Never run'
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTestAutomation(automation.id)}
                          disabled={testAutomation.isPending}
                          data-testid={`button-test-${automation.id}`}
                        >
                          <TestTube className="h-4 w-4 mr-1" />
                          Test
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAutomation(automation.id);
                            setShowLogs(true);
                          }}
                          data-testid={`button-view-logs-${automation.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Logs
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingAutomation(automation);
                            setSelectedAutomation(automation.id);
                            setShowBuilder(true);
                          }}
                          data-testid={`button-edit-${automation.id}`}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-delete-${automation.id}`}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Automation</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{automation.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteAutomation(automation.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Automation Runs</CardTitle>
              <CardDescription>
                View the execution history and results of your automations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {automationRuns.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No automation runs yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {automationRuns.map((run: any) => (
                    <div 
                      key={run.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`automation-run-${run.id}`}
                    >
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(run.status)}
                        <div>
                          <p className="font-medium">{run.automationName}</p>
                          <p className="text-sm text-muted-foreground">
                            Triggered by: {run.triggerEvent}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {run.actionsExecuted}/{run.actionsExecuted + run.actionsFailed} actions completed
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(run.createdAt))} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Automation Builder Dialog */}
      <Dialog open={showBuilder} onOpenChange={setShowBuilder}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
          <AutomationBuilder
            initialWorkflow={editingAutomation ? {
              id: editingAutomation.id,
              name: editingAutomation.name,
              description: editingAutomation.description,
              triggers: editingAutomation.triggers || [],
              conditions: editingAutomation.conditions || [],
              actions: editingAutomation.actions || [],
              connections: editingAutomation.connections || [],
              enabled: editingAutomation.enabled
            } : undefined}
            isEditing={!!editingAutomation}
            isSaving={isSaving}
            onSave={useCallback(async (workflow: AutomationWorkflow) => {
              if (isSaving) return; // Prevent multiple submissions
              
              setIsSaving(true);
              try {
                if (editingAutomation) {
                  await updateAutomation.mutateAsync(workflow);
                  toast({
                    title: "Success",
                    description: "Automation updated successfully",
                  });
                } else {
                  await createAutomation.mutateAsync(workflow);
                  toast({
                    title: "Success",
                    description: "Automation created successfully",
                  });
                }
                setShowBuilder(false);
                setEditingAutomation(null);
                setSelectedAutomation(null);
              } catch (error) {
                toast({
                  title: "Error",
                  description: editingAutomation 
                    ? "Failed to update automation" 
                    : "Failed to create automation",
                  variant: "destructive",
                });
              } finally {
                setIsSaving(false);
              }
            }, [isSaving, editingAutomation, updateAutomation, createAutomation, toast, setShowBuilder, setEditingAutomation, setSelectedAutomation])}
            onCancel={() => {
              setShowBuilder(false);
              setEditingAutomation(null);
              setSelectedAutomation(null);
            }}
            onTest={async (workflow: AutomationWorkflow) => {
              if (editingAutomation) {
                await handleTestAutomation(editingAutomation.id);
              } else {
                toast({
                  title: "Test Unavailable",
                  description: "Please save the automation first to test it",
                  variant: "destructive",
                });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}