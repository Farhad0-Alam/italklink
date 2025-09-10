import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Trash2,
  Database,
  Webhook,
  Globe,
  Settings
} from 'lucide-react';

interface CRMConnection {
  provider: 'hubspot' | 'salesforce' | 'zoho' | 'google_sheets' | 'pipedrive' | 'custom_webhook';
  status: 'active' | 'inactive' | 'error';
  apiKey?: string;
  config: Record<string, any>;
  lastSyncAt?: string;
}

interface CRMIntegrationPanelProps {
  connections: CRMConnection[];
  onConnectionsUpdate: (connections: CRMConnection[]) => void;
}

export function CRMIntegrationPanel({ connections, onConnectionsUpdate }: CRMIntegrationPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newConnection, setNewConnection] = useState<Partial<CRMConnection>>({
    provider: 'google_sheets',
    status: 'inactive',
    config: {}
  });
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const { toast } = useToast();

  const providerLabels = {
    hubspot: 'HubSpot',
    salesforce: 'Salesforce',
    zoho: 'Zoho CRM',
    google_sheets: 'Google Sheets',
    pipedrive: 'Pipedrive',
    custom_webhook: 'Custom Webhook'
  };

  const providerIcons = {
    hubspot: <Database className="h-4 w-4" />,
    salesforce: <Database className="h-4 w-4" />,
    zoho: <Database className="h-4 w-4" />,
    google_sheets: <Globe className="h-4 w-4" />,
    pipedrive: <Database className="h-4 w-4" />,
    custom_webhook: <Webhook className="h-4 w-4" />
  };

  const handleAddConnection = () => {
    if (!newConnection.provider) return;

    const connection: CRMConnection = {
      provider: newConnection.provider,
      status: 'inactive',
      apiKey: newConnection.apiKey,
      config: newConnection.config || {},
      lastSyncAt: undefined
    };

    const updatedConnections = [...connections, connection];
    onConnectionsUpdate(updatedConnections);
    
    setNewConnection({
      provider: 'google_sheets',
      status: 'inactive',
      config: {}
    });
    setShowAddForm(false);
    
    toast({
      title: 'CRM Connection Added',
      description: `${providerLabels[connection.provider]} connection has been added. Test it to activate.`
    });
  };

  const testConnection = async (connection: CRMConnection, index: number) => {
    setTestingConnection(connection.provider);
    
    try {
      const response = await fetch('/api/automation/test-crm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(connection)
      });
      
      const data = await response.json();
      
      if (data.success && data.connectionResult.success) {
        // Update connection status to active
        const updatedConnections = [...connections];
        updatedConnections[index] = {
          ...connection,
          status: 'active',
          lastSyncAt: new Date().toISOString()
        };
        onConnectionsUpdate(updatedConnections);
        
        toast({
          title: 'Connection Successful',
          description: `${providerLabels[connection.provider]} is now active and ready to sync leads.`
        });
      } else {
        // Update connection status to error
        const updatedConnections = [...connections];
        updatedConnections[index] = {
          ...connection,
          status: 'error'
        };
        onConnectionsUpdate(updatedConnections);
        
        toast({
          title: 'Connection Failed',
          description: data.connectionResult?.error || 'Unable to connect to this CRM.',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Test Failed',
        description: error.message || 'Network error during connection test.',
        variant: 'destructive'
      });
    } finally {
      setTestingConnection(null);
    }
  };

  const removeConnection = (index: number) => {
    const updatedConnections = connections.filter((_, i) => i !== index);
    onConnectionsUpdate(updatedConnections);
    
    toast({
      title: 'Connection Removed',
      description: 'CRM connection has been removed from your automation.'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Inactive</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">CRM Integrations</h3>
          <p className="text-sm text-muted-foreground">
            Connect your CRM systems to automatically sync leads
          </p>
        </div>
        {!showAddForm && (
          <Button onClick={() => setShowAddForm(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add CRM
          </Button>
        )}
      </div>

      {/* Existing Connections */}
      <div className="space-y-4">
        {connections.map((connection, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {providerIcons[connection.provider]}
                  <div>
                    <div className="font-medium">{providerLabels[connection.provider]}</div>
                    <div className="text-sm text-muted-foreground">
                      {connection.lastSyncAt 
                        ? `Last sync: ${new Date(connection.lastSyncAt).toLocaleString()}`
                        : 'Never synced'
                      }
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(connection.status)}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testConnection(connection, index)}
                    disabled={testingConnection === connection.provider}
                  >
                    <TestTube className="h-4 w-4 mr-1" />
                    {testingConnection === connection.provider ? 'Testing...' : 'Test'}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeConnection(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Connection Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add CRM Connection</CardTitle>
            <CardDescription>
              Connect a new CRM system to automatically sync your leads
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider">CRM Provider</Label>
              <Select
                value={newConnection.provider}
                onValueChange={(value: any) => setNewConnection(prev => ({ ...prev, provider: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose CRM provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_sheets">Google Sheets</SelectItem>
                  <SelectItem value="hubspot">HubSpot</SelectItem>
                  <SelectItem value="custom_webhook">Custom Webhook</SelectItem>
                  <SelectItem value="salesforce">Salesforce (Coming Soon)</SelectItem>
                  <SelectItem value="zoho">Zoho CRM (Coming Soon)</SelectItem>
                  <SelectItem value="pipedrive">Pipedrive (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newConnection.provider === 'google_sheets' && (
              <div className="space-y-2">
                <Label htmlFor="spreadsheet-id">Google Sheets Spreadsheet ID</Label>
                <Input
                  id="spreadsheet-id"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={newConnection.config?.spreadsheetId || ''}
                  onChange={(e) => setNewConnection(prev => ({
                    ...prev,
                    config: { ...prev.config, spreadsheetId: e.target.value }
                  }))}
                />
                <p className="text-xs text-muted-foreground">
                  Find this in your Google Sheets URL
                </p>
              </div>
            )}

            {newConnection.provider === 'custom_webhook' && (
              <div className="space-y-2">
                <Label htmlFor="webhook-url">Webhook URL</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://your-server.com/webhook"
                  value={newConnection.config?.webhookUrl || ''}
                  onChange={(e) => setNewConnection(prev => ({
                    ...prev,
                    config: { ...prev.config, webhookUrl: e.target.value }
                  }))}
                />
              </div>
            )}

            {(newConnection.provider === 'hubspot' || newConnection.provider === 'custom_webhook') && (
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key (Optional)</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="Enter API key or access token"
                  value={newConnection.apiKey || ''}
                  onChange={(e) => setNewConnection(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false);
                  setNewConnection({
                    provider: 'google_sheets',
                    status: 'inactive',
                    config: {}
                  });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddConnection}
                disabled={!newConnection.provider || 
                  (newConnection.provider === 'google_sheets' && !newConnection.config?.spreadsheetId) ||
                  (newConnection.provider === 'custom_webhook' && !newConnection.config?.webhookUrl)
                }
              >
                Add Connection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {connections.length === 0 && !showAddForm && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No CRM Connections</h3>
            <p className="text-muted-foreground mb-4">
              Connect your CRM systems to automatically sync leads from your business cards
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First CRM
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}