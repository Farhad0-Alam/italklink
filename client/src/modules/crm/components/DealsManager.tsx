import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useDeals, useCreateDeal, useUpdateDeal, useMoveDeal, usePipelines, useContacts } from "../hooks/useCRM";
import { Deal, DealCreateInput, Pipeline } from "../types";
import { Plus, Target, DollarSign, Calendar, MoreHorizontal, Edit, Trash2, User, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow } from "date-fns";

export function DealsManager() {
  const { toast } = useToast();
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);

  // API hooks
  const { data: deals = [], isLoading: dealsLoading, error: dealsError } = useDeals({ 
    pipelineId: selectedPipelineId || undefined 
  });
  const { data: pipelines = [], isLoading: pipelinesLoading, error: pipelinesError } = usePipelines();
  const { data: contacts = [] } = useContacts();
  
  const createDealMutation = useCreateDeal();
  const updateDealMutation = useUpdateDeal(selectedDeal?.id || "");
  const moveDealMutation = useMoveDeal();


  // Use real data from API - no mock fallback to ensure consistency
  const displayPipelines = pipelines;
  const displayDeals = deals;
  const currentPipeline = displayPipelines.find(p => p.id === selectedPipelineId) || displayPipelines[0];

  const getDealsByStage = (stageId: string) => {
    return displayDeals.filter(deal => deal.stage === stageId);
  };

  const getStageColor = (stageId: string) => {
    const stage = currentPipeline?.stages.find(s => s.id === stageId);
    return stage?.color || "#6B7280";
  };

  const handleCreateDeal = (data: DealCreateInput) => {
    createDealMutation.mutate(data, {
      onSuccess: () => {
        toast({
          title: "Deal created",
          description: "New deal has been added to your pipeline.",
        });
        setShowCreateDialog(false);
      },
      onError: (error: any) => {
        toast({
          title: "Error creating deal",
          description: error.message || "Failed to create deal.",
          variant: "destructive",
        });
      },
    });
  };

  const handleMoveDeal = (dealId: string, newStageId: string) => {
    const newStage = currentPipeline?.stages.find(s => s.id === newStageId);
    if (!newStage) return;

    moveDealMutation.mutate(
      { dealId, stageId: newStageId, probability: newStage.probability },
      {
        onSuccess: () => {
          toast({
            title: "Deal moved",
            description: `Deal moved to ${newStage.name} stage.`,
          });
        },
        onError: (error: any) => {
          toast({
            title: "Error moving deal",
            description: error.message || "Failed to move deal.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDragStart = (deal: Deal) => {
    setDraggedDeal(deal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== stageId) {
      handleMoveDeal(draggedDeal.id, stageId);
    }
    setDraggedDeal(null);
  };

  const getTotalPipelineValue = () => {
    return displayDeals.reduce((sum, deal) => sum + deal.value, 0);
  };

  const getWeightedPipelineValue = () => {
    return displayDeals.reduce((sum, deal) => {
      const stage = currentPipeline?.stages.find(s => s.id === deal.stage);
      return sum + (deal.value * (stage?.probability || 0) / 100);
    }, 0);
  };

  if (dealsLoading || pipelinesLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-96 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Error states
  if (dealsError || pipelinesError) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-deals-header">
              Sales Pipeline
            </h2>
            <p className="text-red-600 mt-1">Failed to load pipeline data. Please try again.</p>
          </div>
          <Button onClick={() => window.location.reload()} variant="outline" data-testid="button-retry-deals">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  // Empty state when no pipelines exist
  if (displayPipelines.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900" data-testid="text-deals-header">
              Sales Pipeline
            </h2>
            <p className="text-gray-600 mt-1">No pipeline found. Create your first pipeline to start tracking deals.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900" data-testid="text-deals-header">
            Sales Pipeline
          </h2>
          <p className="text-gray-600 mt-1">
            Total: ${getTotalPipelineValue().toLocaleString()} | 
            Weighted: ${getWeightedPipelineValue().toLocaleString()} | 
            {displayDeals.length} deals
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Select 
            value={selectedPipelineId || currentPipeline?.id} 
            onValueChange={setSelectedPipelineId}
          >
            <SelectTrigger className="w-48" data-testid="select-pipeline">
              <SelectValue placeholder="Select Pipeline" />
            </SelectTrigger>
            <SelectContent>
              {displayPipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-deal">
                <Plus className="h-4 w-4 mr-2" />
                Add Deal
              </Button>
            </DialogTrigger>
            <DealForm
              pipeline={currentPipeline}
              contacts={contacts}
              onSubmit={handleCreateDeal}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createDealMutation.isPending}
            />
          </Dialog>
        </div>
      </div>

      {/* Pipeline Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${getTotalPipelineValue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Weighted Value</p>
                <p className="text-2xl font-bold">${getWeightedPipelineValue().toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold">{displayDeals.length}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold">
                  ${displayDeals.length > 0 ? Math.round(getTotalPipelineValue() / displayDeals.length).toLocaleString() : 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      {currentPipeline && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" data-testid="kanban-board">
          {currentPipeline.stages.map((stage) => (
            <div
              key={stage.id}
              className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              data-testid={`stage-column-${stage.id}`}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  ></div>
                  <h3 className="font-semibold text-gray-900">
                    {stage.name}
                  </h3>
                  <Badge variant="secondary" className="text-xs">
                    {getDealsByStage(stage.id).length}
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">{stage.probability}%</span>
              </div>

              {/* Stage Value */}
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  ${getDealsByStage(stage.id).reduce((sum, deal) => sum + deal.value, 0).toLocaleString()}
                </p>
              </div>

              {/* Deals in Stage */}
              <div className="space-y-3">
                {getDealsByStage(stage.id).map((deal) => (
                  <Card
                    key={deal.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    draggable
                    onDragStart={() => handleDragStart(deal)}
                    onClick={() => setSelectedDeal(deal)}
                    data-testid={`deal-card-${deal.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {deal.title}
                          </h4>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedDeal(deal)}>
                                <Target className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Deal
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-green-600">
                            ${deal.value.toLocaleString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {deal.probability}%
                          </Badge>
                        </div>

                        {deal.contact && (
                          <div className="flex items-center space-x-2 text-xs text-gray-600">
                            <User className="h-3 w-3" />
                            <span>{deal.contact.firstName} {deal.contact.lastName}</span>
                            {deal.contact.company && (
                              <span>• {deal.contact.company}</span>
                            )}
                          </div>
                        )}

                        {deal.expectedCloseDate && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>Expected: {format(new Date(deal.expectedCloseDate), "MMM dd")}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Updated {formatDistanceToNow(new Date(deal.updatedAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="max-w-2xl" data-testid="dialog-deal-detail">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>{selectedDeal.title}</span>
              </DialogTitle>
              <DialogDescription>
                Deal details and activity timeline
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Value</Label>
                    <p className="text-2xl font-bold text-green-600">
                      ${selectedDeal.value.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Probability</Label>
                    <p className="text-lg">{selectedDeal.probability}%</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Stage</Label>
                    <Badge style={{ backgroundColor: getStageColor(selectedDeal.stage) }} className="text-white">
                      {currentPipeline?.stages.find(s => s.id === selectedDeal.stage)?.name}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-4">
                  {selectedDeal.contact && (
                    <div>
                      <Label className="text-sm font-medium">Contact</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <User className="h-4 w-4 text-gray-500" />
                        <span>{selectedDeal.contact.firstName} {selectedDeal.contact.lastName}</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {selectedDeal.contact.title} at {selectedDeal.contact.company}
                      </p>
                    </div>
                  )}

                  {selectedDeal.expectedCloseDate && (
                    <div>
                      <Label className="text-sm font-medium">Expected Close Date</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(selectedDeal.expectedCloseDate), "MMMM dd, yyyy")}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(selectedDeal.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>

              {selectedDeal.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg mt-2">
                    {selectedDeal.notes}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedDeal(null)}>
                Close
              </Button>
              <Button>
                <Edit className="h-4 w-4 mr-2" />
                Edit Deal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Deal Form Component
interface DealFormProps {
  deal?: Deal;
  pipeline?: Pipeline;
  contacts: any[];
  onSubmit: (data: DealCreateInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

function DealForm({ deal, pipeline, contacts, onSubmit, onCancel, isLoading }: DealFormProps) {
  const [formData, setFormData] = useState<DealCreateInput>({
    title: deal?.title || "",
    value: deal?.value || 0,
    currency: deal?.currency || "USD",
    stage: deal?.stage || pipeline?.stages[0]?.id || "",
    pipelineId: deal?.pipelineId || pipeline?.id || "",
    contactId: deal?.contactId || "",
    probability: deal?.probability || pipeline?.stages[0]?.probability || 20,
    expectedCloseDate: deal?.expectedCloseDate || "",
    notes: deal?.notes || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <DialogContent className="sm:max-w-[600px]" data-testid="dialog-deal-form">
      <DialogHeader>
        <DialogTitle>
          {deal ? "Edit Deal" : "Add New Deal"}
        </DialogTitle>
        <DialogDescription>
          {deal ? "Update the deal information below." : "Create a new deal for your pipeline."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title">Deal Title *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="TechCorp Premium Package"
            required
            data-testid="input-deal-title"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="value">Deal Value *</Label>
            <Input
              id="value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
              placeholder="25000"
              required
              data-testid="input-deal-value"
            />
          </div>
          <div>
            <Label htmlFor="stage">Pipeline Stage</Label>
            <Select value={formData.stage} onValueChange={(value) => {
              const stage = pipeline?.stages.find(s => s.id === value);
              setFormData({ 
                ...formData, 
                stage: value,
                probability: stage?.probability || formData.probability 
              });
            }}>
              <SelectTrigger data-testid="select-deal-stage">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pipeline?.stages.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.name} ({stage.probability}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contactId">Associated Contact</Label>
            <Select value={formData.contactId} onValueChange={(value) => setFormData({ ...formData, contactId: value })}>
              <SelectTrigger data-testid="select-contact">
                <SelectValue placeholder="Select contact" />
              </SelectTrigger>
              <SelectContent>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.firstName} {contact.lastName} {contact.company && `(${contact.company})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expectedCloseDate">Expected Close Date</Label>
            <Input
              id="expectedCloseDate"
              type="date"
              value={formData.expectedCloseDate ? formData.expectedCloseDate.split('T')[0] : ''}
              onChange={(e) => setFormData({ ...formData, expectedCloseDate: e.target.value ? `${e.target.value}T00:00:00Z` : '' })}
              data-testid="input-close-date"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes about this deal..."
            rows={3}
            data-testid="textarea-deal-notes"
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} data-testid="button-cancel">
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading} data-testid="button-save-deal">
            {isLoading ? "Saving..." : deal ? "Update Deal" : "Create Deal"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}