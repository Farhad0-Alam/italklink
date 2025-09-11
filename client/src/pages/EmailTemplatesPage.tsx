import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Mail, Edit, Eye, RotateCcw, Send, TrendingUp, Clock, CheckCircle, AlertCircle, Users } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { motion } from 'framer-motion';

interface EmailTemplate {
  id: string;
  ownerUserId: string;
  type: string;
  name: string;
  subject: string;
  htmlContent: string;
  category: string;
  isDefault: boolean;
  isActive: boolean;
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

interface NotificationStats {
  totalSent: number;
  deliveryRate: number;
  recentNotifications: number;
  failedNotifications: number;
}

interface NotificationHistory {
  id: string;
  appointmentId: string;
  type: string;
  method: string;
  recipient: string;
  subject: string;
  status: string;
  sentAt: string;
  scheduledFor: string;
  deliveryAttempts: number;
  errorMessage?: string;
  createdAt: string;
}

const EMAIL_TEMPLATE_TYPES = [
  { key: 'booking_confirmed', label: 'Booking Confirmation', description: 'Sent when appointments are confirmed', category: 'confirmations', icon: CheckCircle, color: 'text-green-600' },
  { key: 'reminder_24h', label: '24-Hour Reminder', description: 'Sent 24 hours before appointment', category: 'reminders', icon: Clock, color: 'text-blue-600' },
  { key: 'reminder_1h', label: '1-Hour Reminder', description: 'Sent 1 hour before appointment', category: 'reminders', icon: AlertCircle, color: 'text-orange-600' },
  { key: 'appointment_cancelled', label: 'Cancellation Notice', description: 'Sent when appointments are cancelled', category: 'updates', icon: AlertCircle, color: 'text-red-600' },
  { key: 'appointment_rescheduled', label: 'Reschedule Notice', description: 'Sent when appointments are rescheduled', category: 'updates', icon: RotateCcw, color: 'text-purple-600' },
  { key: 'follow_up', label: 'Follow-Up Message', description: 'Sent after appointment completion', category: 'follow_ups', icon: Users, color: 'text-cyan-600' }
];

export default function EmailTemplatesPage() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');

  // Fetch email templates
  const { data: templates = [], isLoading: templatesLoading } = useQuery({
    queryKey: ['/api/notifications/templates'],
    queryFn: () => apiRequest('/api/notifications/templates')
  });

  // Fetch notification stats
  const { data: stats } = useQuery<NotificationStats>({
    queryKey: ['/api/notifications/stats'],
    queryFn: () => apiRequest('/api/notifications/stats')
  });

  // Fetch notification history
  const { data: history = [] } = useQuery<NotificationHistory[]>({
    queryKey: ['/api/notifications/history'],
    queryFn: () => apiRequest('/api/notifications/history?limit=20')
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ type, data }: { type: string, data: any }) => 
      apiRequest(`/api/notifications/templates/${type}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/templates'] });
      toast({ title: 'Template updated successfully!' });
      setShowEditor(false);
      setEditingTemplate(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error updating template', description: error.message, variant: 'destructive' });
    }
  });

  // Reset template mutation
  const resetTemplateMutation = useMutation({
    mutationFn: (type: string) => 
      apiRequest(`/api/notifications/templates/${type}/reset`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/templates'] });
      toast({ title: 'Template reset to default!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error resetting template', description: error.message, variant: 'destructive' });
    }
  });

  // Preview template mutation
  const previewMutation = useMutation({
    mutationFn: (type: string) => 
      apiRequest(`/api/notifications/templates/${type}/preview`, { method: 'POST' }),
    onSuccess: (data) => {
      setPreviewTemplate(data);
      setShowPreview(true);
    },
    onError: (error: any) => {
      toast({ title: 'Error loading preview', description: error.message, variant: 'destructive' });
    }
  });

  const handleEditTemplate = (type: string) => {
    const template = templates.find((t: EmailTemplate) => t.type === type);
    if (template) {
      setEditingTemplate(template);
      setShowEditor(true);
    }
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate) return;
    
    updateTemplateMutation.mutate({
      type: editingTemplate.type,
      data: {
        subject: editingTemplate.subject,
        htmlContent: editingTemplate.htmlContent,
        isActive: editingTemplate.isActive
      }
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (templatesLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <Mail className="w-12 h-12 animate-spin mx-auto text-primary" />
            <p className="text-lg font-medium">Loading email templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8" data-testid="email-templates-page">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary" />
            Email Notification System
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage automated email templates and notification settings for appointments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card data-testid="stat-total-sent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Send className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSent.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Email notifications delivered</p>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-delivery-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
              <p className="text-xs text-muted-foreground">Successfully delivered</p>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-recent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent (30d)</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentNotifications}</div>
              <p className="text-xs text-muted-foreground">Notifications this month</p>
            </CardContent>
          </Card>
          
          <Card data-testid="stat-failed">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.failedNotifications}</div>
              <p className="text-xs text-muted-foreground">Failed deliveries</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="templates" data-testid="tab-templates">Email Templates</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">Notification History</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <Card data-testid="templates-section">
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>
                Customize automated email notifications sent to your appointment attendees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {EMAIL_TEMPLATE_TYPES.map((templateType) => {
                  const template = templates.find((t: EmailTemplate) => t.type === templateType.key);
                  const IconComponent = templateType.icon;
                  
                  return (
                    <motion.div
                      key={templateType.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="relative hover:shadow-md transition-shadow" data-testid={`template-${templateType.key}`}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <IconComponent className={`w-5 h-5 ${templateType.color}`} />
                              <div>
                                <CardTitle className="text-base">{templateType.label}</CardTitle>
                                <Badge variant="secondary" className="text-xs mt-1">
                                  {templateType.category}
                                </Badge>
                              </div>
                            </div>
                            {template?.isActive && (
                              <Badge variant="outline" className="text-xs">
                                Active
                              </Badge>
                            )}
                          </div>
                          <CardDescription className="text-sm">
                            {templateType.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditTemplate(templateType.key)}
                              data-testid={`edit-${templateType.key}`}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => previewMutation.mutate(templateType.key)}
                              data-testid={`preview-${templateType.key}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            {template && !template.isDefault && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => resetTemplateMutation.mutate(templateType.key)}
                                data-testid={`reset-${templateType.key}`}
                              >
                                <RotateCcw className="w-4 h-4 mr-1" />
                                Reset
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card data-testid="history-section">
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
              <CardDescription>
                Recent email notifications and their delivery status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length > 0 ? (
                  history.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`notification-${notification.id}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={notification.status === 'sent' ? 'default' : 'destructive'}>
                            {notification.status}
                          </Badge>
                          <span className="font-medium">{notification.type.replace('_', ' ')}</span>
                          <span className="text-sm text-muted-foreground">to {notification.recipient}</span>
                        </div>
                        <p className="text-sm font-medium mb-1">{notification.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {notification.sentAt ? `Sent ${formatDate(notification.sentAt)}` : `Scheduled for ${formatDate(notification.scheduledFor)}`}
                        </p>
                        {notification.errorMessage && (
                          <p className="text-xs text-red-600 mt-1">{notification.errorMessage}</p>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Attempts: {notification.deliveryAttempts}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No notifications sent yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto" data-testid="template-editor">
          <DialogHeader>
            <DialogTitle>Edit Email Template</DialogTitle>
            <DialogDescription>
              Customize the {editingTemplate?.name} template. Use variables like {'{attendeeName}'}, {'{eventTypeName}'}, {'{appointmentDate}'}, etc.
            </DialogDescription>
          </DialogHeader>
          
          {editingTemplate && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editingTemplate.isActive}
                  onCheckedChange={(checked) => setEditingTemplate({ ...editingTemplate, isActive: checked })}
                  data-testid="template-active-switch"
                />
                <Label>Template is active</Label>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={editingTemplate.subject}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                  placeholder="Enter email subject..."
                  data-testid="template-subject-input"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="htmlContent">Email Content (HTML)</Label>
                <Textarea
                  id="htmlContent"
                  value={editingTemplate.htmlContent}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, htmlContent: e.target.value })}
                  placeholder="Enter email HTML content..."
                  className="min-h-[300px] font-mono text-sm"
                  data-testid="template-content-textarea"
                />
              </div>
              
              <div className="text-xs text-muted-foreground">
                <p className="font-medium mb-2">Available Variables:</p>
                <div className="grid grid-cols-2 gap-2">
                  <span>{'{attendeeName}'}</span>
                  <span>{'{hostName}'}</span>
                  <span>{'{eventTypeName}'}</span>
                  <span>{'{appointmentDate}'}</span>
                  <span>{'{appointmentTime}'}</span>
                  <span>{'{appointmentDuration}'}</span>
                  <span>{'{meetingLink}'}</span>
                  <span>{'{rescheduleLink}'}</span>
                  <span>{'{cancelLink}'}</span>
                  <span>{'{location}'}</span>
                  <span>{'{timezone}'}</span>
                  <span>{'{companyName}'}</span>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)} data-testid="cancel-edit">
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={updateTemplateMutation.isPending}
              data-testid="save-template"
            >
              {updateTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh]" data-testid="template-preview">
          <DialogHeader>
            <DialogTitle>Email Template Preview</DialogTitle>
            <DialogDescription>
              Preview of how your email will look with sample data
            </DialogDescription>
          </DialogHeader>
          
          {previewTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Subject Line:</Label>
                <p className="font-medium text-lg mt-1" data-testid="preview-subject">
                  {previewTemplate.subject}
                </p>
              </div>
              
              <div>
                <Label>Email Content:</Label>
                <div 
                  className="border rounded-lg p-4 bg-white max-h-[400px] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: previewTemplate.htmlContent }}
                  data-testid="preview-content"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setShowPreview(false)} data-testid="close-preview">
              Close Preview
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
