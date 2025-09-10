import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Zap, 
  Settings, 
  BarChart3, 
  Users, 
  Bell,
  Database,
  Globe,
  TestTube,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface AutomationConfig {
  defaultLeadScore: number;
  autoLeadCapture: boolean;
  smartNotifications: boolean;
  crmConnections: CRMConnection[];
  buttonAutomations: Record<string, any>;
  analyticsEnabled: boolean;
  weeklyReports: boolean;
}

interface CRMConnection {
  provider: 'hubspot' | 'salesforce' | 'zoho' | 'google_sheets' | 'pipedrive' | 'custom_webhook';
  status: 'active' | 'inactive' | 'error';
  apiKey?: string;
  config: Record<string, any>;
  lastSyncAt?: string;
}

interface InteractionData {
  id: string;
  cardId: string;
  elementId: string;
  interactionType: string;
  buttonLabel: string;
  buttonAction: string;
  visitorLocation: any;
  visitorDevice: string;
  leadScore: number;
  leadPriority: string;
  createdAt: string;
}

interface LeadProfile {
  id: string;
  visitorFingerprint: string;
  totalInteractions: number;
  leadScore: number;
  leadPriority: string;
  engagementLevel: string;
  location: any;
  devicePreference: string;
  behaviorTags: string[];
  lastSeenAt: string;
}

export function AutomationManager() {
  const [config, setConfig] = useState<AutomationConfig | null>(null);
  const [interactions, setInteractions] = useState<InteractionData[]>([]);
  const [leads, setLeads] = useState<LeadProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [testingCRM, setTestingCRM] = useState<string | null>(null);
  const { toast } = useToast();

  // Load automation config
  useEffect(() => {
    loadAutomationConfig();
    loadAnalytics();
  }, []);

  const loadAutomationConfig = async () => {
    try {
      const response = await fetch('/api/automation/config');
      const data = await response.json();
      
      if (data.success) {
        setConfig(data.config);
      } else {
        throw new Error(data.error || 'Failed to load config');
      }
    } catch (error: any) {
      console.error('Failed to load automation config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load automation settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Load recent interactions and leads
      const [interactionsRes, leadsRes] = await Promise.all([
        fetch('/api/automation/analytics/leads'),
        fetch('/api/automation/analytics/leads')
      ]);
      
      const interactionsData = await interactionsRes.json();
      const leadsData = await leadsRes.json();
      
      if (interactionsData.success) setInteractions([]);
      if (leadsData.success) setLeads(leadsData.leads || []);
      
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const updateConfig = async (updates: Partial<AutomationConfig>) => {
    try {
      const response = await fetch('/api/automation/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConfig(prev => prev ? { ...prev, ...updates } : null);
        toast({
          title: 'Success',
          description: 'Automation settings updated'
        });
      } else {
        throw new Error(data.error || 'Failed to update config');
      }
    } catch (error: any) {
      console.error('Failed to update config:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const testCRMConnection = async (connection: CRMConnection) => {
    setTestingCRM(connection.provider);
    
    try {
      const response = await fetch('/api/automation/test-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection)
      });
      
      const data = await response.json();
      
      if (data.success && data.connectionResult.success) {
        toast({
          title: 'Connection Test Successful',
          description: `${connection.provider} is properly configured`,
        });
      } else {
        toast({
          title: 'Connection Test Failed',
          description: data.connectionResult?.error || 'Failed to test connection',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Test Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setTestingCRM(null);
    }
  };

  if (loading || !config) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading automation settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Automation Manager</h2>
        <p className="text-muted-foreground">
          Configure intelligent automations for your digital business cards
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="crm">
            <Database className="h-4 w-4 mr-2" />
            CRM & Leads
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <Users className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Interactions
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{leads.reduce((sum, lead) => sum + (lead.totalInteractions || 0), 0)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all your cards
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Hot Leads
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {leads.filter(lead => lead.leadPriority === 'hot').length}
                </div>
                <p className="text-xs text-muted-foreground">
                  High-value prospects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  CRM Connections
                </CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config.crmConnections?.filter(c => c.status === 'active').length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Active integrations
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Automations
                </CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {config.autoLeadCapture ? 'Active' : 'Inactive'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Smart lead capture
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Settings</CardTitle>
              <CardDescription>
                Manage your automation preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto Lead Capture</Label>
                  <div className="text-sm text-muted-foreground">
                    Automatically capture visitor information
                  </div>
                </div>
                <Switch
                  checked={config.autoLeadCapture}
                  onCheckedChange={(checked) =>
                    updateConfig({ autoLeadCapture: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Smart Notifications</Label>
                  <div className="text-sm text-muted-foreground">
                    Get notified about high-value interactions
                  </div>
                </div>
                <Switch
                  checked={config.smartNotifications}
                  onCheckedChange={(checked) =>
                    updateConfig({ smartNotifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Analytics Tracking</Label>
                  <div className="text-sm text-muted-foreground">
                    Track visitor behavior and interactions
                  </div>
                </div>
                <Switch
                  checked={config.analyticsEnabled}
                  onCheckedChange={(checked) =>
                    updateConfig({ analyticsEnabled: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Lead Activity</CardTitle>
              <CardDescription>
                Latest visitor interactions and lead scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No lead data available yet</p>
                  <p className="text-sm text-muted-foreground">
                    Share your digital business cards to start collecting leads
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.slice(0, 10).map(lead => (
                    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            lead.leadPriority === 'hot' ? 'destructive' :
                            lead.leadPriority === 'high' ? 'default' :
                            lead.leadPriority === 'medium' ? 'secondary' : 'outline'
                          }>
                            {lead.leadPriority}
                          </Badge>
                          <span className="font-medium">Score: {lead.leadScore}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {lead.totalInteractions} interaction{lead.totalInteractions !== 1 ? 's' : ''} • 
                          {lead.devicePreference} • 
                          {lead.location?.country || 'Unknown location'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Last seen: {new Date(lead.lastSeenAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{lead.engagementLevel}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {lead.behaviorTags?.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Settings</CardTitle>
              <CardDescription>
                Configure how automations work for your business cards
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="lead-score">Default Lead Score</Label>
                <Input
                  id="lead-score"
                  type="number"
                  min={1}
                  max={100}
                  value={config.defaultLeadScore}
                  onChange={(e) =>
                    updateConfig({ defaultLeadScore: parseInt(e.target.value) || 10 })
                  }
                />
                <p className="text-sm text-muted-foreground">
                  Starting score for new visitors (1-100)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Weekly Reports</Label>
                  <div className="text-sm text-muted-foreground">
                    Receive weekly analytics reports via email
                  </div>
                </div>
                <Switch
                  checked={config.weeklyReports}
                  onCheckedChange={(checked) =>
                    updateConfig({ weeklyReports: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}