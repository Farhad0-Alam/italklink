import { useState, useCallback, useRef, useEffect } from "react";
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, ZoomOut, Maximize, Grid, Trash2, Plus, 
  Play, Zap, Filter, Settings, Move
} from "lucide-react";
import { cn } from "@/lib/utils";
import WorkflowNode from "./WorkflowNode";
import type { AutomationWorkflow, AutomationTrigger, AutomationAction, AutomationCondition, WorkflowConnection } from "../../types";

// SVG connection line component
function ConnectionLine({ 
  start, 
  end, 
  selected = false,
  onSelect,
  onDelete 
}: { 
  start: { x: number; y: number };
  end: { x: number; y: number };
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}) {
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;
  
  // Create a curved path for the connection
  const pathData = `M ${start.x} ${start.y} Q ${midX} ${start.y + 50} ${end.x} ${end.y}`;
  
  return (
    <g onClick={onSelect} className="cursor-pointer">
      {/* Invisible wider path for easier clicking */}
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth="20"
        fill="none"
      />
      {/* Visible path */}
      <path
        d={pathData}
        stroke={selected ? "#3b82f6" : "#94a3b8"}
        strokeWidth={selected ? "3" : "2"}
        fill="none"
        className="transition-all duration-200"
        markerEnd="url(#arrowhead)"
      />
      {/* Connection point for deletion */}
      {selected && (
        <g>
          <circle
            cx={midX}
            cy={midY}
            r="8"
            fill="#ef4444"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          />
          <line
            x1={midX - 3}
            y1={midY - 3}
            x2={midX + 3}
            y2={midY + 3}
            stroke="white"
            strokeWidth="1.5"
          />
          <line
            x1={midX + 3}
            y1={midY - 3}
            x2={midX - 3}
            y2={midY + 3}
            stroke="white"
            strokeWidth="1.5"
          />
        </g>
      )}
    </g>
  );
}

interface WorkflowCanvasProps {
  workflow: AutomationWorkflow;
  onUpdateWorkflow: (workflow: AutomationWorkflow) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onConnectionSelect: (connectionId: string | null) => void;
  selectedNodeId?: string | null;
  selectedConnectionId?: string | null;
  onAddTrigger: () => void;
  onAddCondition: () => void;
  onAddAction: () => void;
  readOnly?: boolean;
}

export default function WorkflowCanvas({
  workflow,
  onUpdateWorkflow,
  onNodeSelect,
  onConnectionSelect,
  selectedNodeId,
  selectedConnectionId,
  onAddTrigger,
  onAddCondition,
  onAddAction,
  readOnly = false
}: WorkflowCanvasProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [showGrid, setShowGrid] = useState(true);

  // Get all nodes (triggers, conditions, actions)
  const allNodes = [
    ...workflow.triggers.map(trigger => ({ ...trigger, nodeType: 'trigger' as const })),
    ...workflow.conditions.map(condition => ({ ...condition, nodeType: 'condition' as const })),
    ...workflow.actions.map(action => ({ ...action, nodeType: 'action' as const }))
  ];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleNodeDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const nodeId = active.id as string;
    
    setDraggedNode(null);
    
    // Update node position
    const updatedWorkflow = { ...workflow };
    
    // Find and update the node position
    const triggerIndex = updatedWorkflow.triggers.findIndex(t => t.id === nodeId);
    if (triggerIndex !== -1) {
      updatedWorkflow.triggers[triggerIndex] = {
        ...updatedWorkflow.triggers[triggerIndex],
        position: {
          x: updatedWorkflow.triggers[triggerIndex].position.x + delta.x,
          y: updatedWorkflow.triggers[triggerIndex].position.y + delta.y
        }
      };
    }
    
    const conditionIndex = updatedWorkflow.conditions.findIndex(c => c.id === nodeId);
    if (conditionIndex !== -1) {
      updatedWorkflow.conditions[conditionIndex] = {
        ...updatedWorkflow.conditions[conditionIndex],
        position: {
          x: updatedWorkflow.conditions[conditionIndex].position.x + delta.x,
          y: updatedWorkflow.conditions[conditionIndex].position.y + delta.y
        }
      };
    }
    
    const actionIndex = updatedWorkflow.actions.findIndex(a => a.id === nodeId);
    if (actionIndex !== -1) {
      updatedWorkflow.actions[actionIndex] = {
        ...updatedWorkflow.actions[actionIndex],
        position: {
          x: updatedWorkflow.actions[actionIndex].position.x + delta.x,
          y: updatedWorkflow.actions[actionIndex].position.y + delta.y
        }
      };
    }
    
    onUpdateWorkflow(updatedWorkflow);
  }, [workflow, onUpdateWorkflow]);

  const handleNodeDragStart = useCallback((event: DragStartEvent) => {
    setDraggedNode(event.active.id as string);
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    const updatedWorkflow = { ...workflow };
    
    // Remove node
    updatedWorkflow.triggers = updatedWorkflow.triggers.filter(t => t.id !== nodeId);
    updatedWorkflow.conditions = updatedWorkflow.conditions.filter(c => c.id !== nodeId);
    updatedWorkflow.actions = updatedWorkflow.actions.filter(a => a.id !== nodeId);
    
    // Remove related connections
    updatedWorkflow.connections = updatedWorkflow.connections.filter(
      conn => conn.source !== nodeId && conn.target !== nodeId
    );
    
    onUpdateWorkflow(updatedWorkflow);
    onNodeSelect(null);
  }, [workflow, onUpdateWorkflow, onNodeSelect]);

  const handleEditNode = useCallback((nodeId: string) => {
    onNodeSelect(nodeId);
  }, [onNodeSelect]);

  const handleDeleteConnection = useCallback((connectionId: string) => {
    const updatedWorkflow = {
      ...workflow,
      connections: workflow.connections.filter(conn => conn.id !== connectionId)
    };
    onUpdateWorkflow(updatedWorkflow);
    onConnectionSelect(null);
  }, [workflow, onUpdateWorkflow, onConnectionSelect]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    // If clicking on canvas background, deselect everything
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
      onConnectionSelect(null);
    }
  };

  // Calculate connection line positions
  const getConnectionLines = () => {
    return workflow.connections.map(connection => {
      const sourceNode = allNodes.find(node => node.id === connection.source);
      const targetNode = allNodes.find(node => node.id === connection.target);
      
      if (!sourceNode || !targetNode) return null;
      
      return {
        id: connection.id,
        start: {
          x: sourceNode.position.x + 128, // Half of node width
          y: sourceNode.position.y + 120  // Bottom of node
        },
        end: {
          x: targetNode.position.x + 128,
          y: targetNode.position.y - 8    // Top of node
        }
      };
    }).filter(Boolean);
  };

  const connectionLines = getConnectionLines();

  return (
    <div className="relative w-full h-full bg-muted/30 overflow-hidden">
      {/* Canvas Controls */}
      <div className="absolute top-4 left-4 z-10 flex items-center space-x-2">
        <Card className="p-2">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              data-testid="button-zoom-out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs font-mono w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 2}
              data-testid="button-zoom-in"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomReset}
              data-testid="button-zoom-reset"
            >
              <Maximize className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
              className={cn(showGrid && "bg-accent")}
              data-testid="button-toggle-grid"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Add Node Controls */}
      {!readOnly && (
        <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
          <Button
            onClick={onAddTrigger}
            size="sm"
            className="bg-blue-500 hover:bg-blue-600"
            data-testid="button-add-trigger"
          >
            <Zap className="h-4 w-4 mr-2" />
            Add Trigger
          </Button>
          <Button
            onClick={onAddCondition}
            size="sm"
            variant="outline"
            className="bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
            data-testid="button-add-condition"
          >
            <Filter className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
          <Button
            onClick={onAddAction}
            size="sm"
            className="bg-green-500 hover:bg-green-600"
            data-testid="button-add-action"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>
      )}

      {/* Workflow Stats */}
      <div className="absolute bottom-4 left-4 z-10">
        <Card className="p-3">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>{workflow.triggers.length} Triggers</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span>{workflow.conditions.length} Conditions</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>{workflow.actions.length} Actions</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Canvas */}
      <div
        ref={canvasRef}
        className="relative w-full h-full cursor-move"
        style={{ 
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          transformOrigin: '0 0'
        }}
        onClick={handleCanvasClick}
        data-testid="workflow-canvas"
      >
        {/* Grid Background */}
        {showGrid && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />
        )}

        {/* Connection Lines SVG */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#94a3b8"
              />
            </marker>
          </defs>
          {connectionLines.map(line => line && (
            <ConnectionLine
              key={line.id}
              start={line.start}
              end={line.end}
              selected={selectedConnectionId === line.id}
              onSelect={() => onConnectionSelect(line.id)}
              onDelete={() => handleDeleteConnection(line.id)}
            />
          ))}
        </svg>

        {/* Workflow Nodes */}
        <DndContext
          onDragStart={handleNodeDragStart}
          onDragEnd={handleNodeDragEnd}
        >
          <div className="relative" style={{ zIndex: 10 }}>
            {/* Trigger Nodes */}
            {workflow.triggers.map(trigger => (
              <WorkflowNode
                key={trigger.id}
                id={trigger.id}
                type="trigger"
                data={trigger}
                position={trigger.position}
                selected={selectedNodeId === trigger.id}
                onSelect={onNodeSelect}
                onDelete={handleDeleteNode}
                onEdit={handleEditNode}
                dragDisabled={readOnly}
              />
            ))}

            {/* Condition Nodes */}
            {workflow.conditions.map(condition => (
              <WorkflowNode
                key={condition.id}
                id={condition.id}
                type="condition"
                data={condition}
                position={condition.position}
                selected={selectedNodeId === condition.id}
                onSelect={onNodeSelect}
                onDelete={handleDeleteNode}
                onEdit={handleEditNode}
                dragDisabled={readOnly}
              />
            ))}

            {/* Action Nodes */}
            {workflow.actions.map(action => (
              <WorkflowNode
                key={action.id}
                id={action.id}
                type="action"
                data={action}
                position={action.position}
                selected={selectedNodeId === action.id}
                onSelect={onNodeSelect}
                onDelete={handleDeleteNode}
                onEdit={handleEditNode}
                dragDisabled={readOnly}
              />
            ))}
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {draggedNode && (() => {
              const node = allNodes.find(n => n.id === draggedNode);
              if (!node) return null;
              
              return (
                <WorkflowNode
                  id={node.id}
                  type={node.nodeType}
                  data={node}
                  position={{ x: 0, y: 0 }}
                  className="opacity-50"
                />
              );
            })()}
          </DragOverlay>
        </DndContext>

        {/* Empty State */}
        {allNodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Card className="p-8 text-center">
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Start Building Your Workflow</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Add triggers, conditions, and actions to create your automation
                  </p>
                </div>
                {!readOnly && (
                  <div className="flex justify-center space-x-2">
                    <Button onClick={onAddTrigger} size="sm" variant="outline">
                      <Zap className="h-4 w-4 mr-2" />
                      Add Trigger
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}