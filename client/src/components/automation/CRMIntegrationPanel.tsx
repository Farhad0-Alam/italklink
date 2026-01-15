import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Settings,
  ArrowRight,
  Shield,
  Zap
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
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [newConnection, setNewConnection] = useState<Partial<CRMConnection>>({
    provider: 'google_sheets',
    status: 'inactive',
    config: {}
  });
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const { toast } = useToast();

  const providers = [
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'Complete CRM & marketing platform',
      logo: '🔶',
      color: 'bg-orange-500',
      textColor: 'text-white',
      popular: true,
      fields: [
        { key: 'apiKey', label: 'HubSpot API Key', type: 'password', placeholder: 'pat-na1-...' }
      ]
    },
    {
      id: 'google_sheets',
      name: 'Google Sheets',
      description: 'Simple spreadsheet integration',
      logo: '📊',
      color: 'bg-green-500',
      textColor: 'text-white',
      popular: true,
      fields: [
        { key: 'spreadsheetId', label: 'Spreadsheet ID', type: 'text', placeholder: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms' }
      ]
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Enterprise CRM solution',
      logo: '☁️',
      color: 'bg-blue-500',
      textColor: 'text-white',
      comingSoon: true,
      fields: []
    },
    {
      id: 'custom_webhook',
      name: 'Custom Webhook',
      description: 'Connect any system via webhook',
      logo: '🔗',
      color: 'bg-purple-500',
      textColor: 'text-white',
      fields: [
        { key: 'webhookUrl', label: 'Webhook URL', type: 'url', placeholder: 'https://your-server.com/webhook' },
        { key: 'apiKey', label: 'API Key (Optional)', type: 'password', placeholder: 'Bearer token or API key' }
      ]
    },
    {
      id: 'zoho',
      name: 'Zoho CRM',
      description: 'Business productivity suite',
      logo: '🟡',
      color: 'bg-yellow-500',
      textColor: 'text-white',
      comingSoon: true,
      fields: []
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      description: 'Sales-focused CRM platform',
      logo: '📈',
      color: 'bg-teal-500',
      textColor: 'text-white',
      comingSoon: true,
      fields: []
    }
  ];

  const handleProviderSelect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider?.comingSoon) return;
    
    setSelectedProvider(providerId);
    setNewConnection({
      provider: providerId as any,
      status: 'inactive',
      config: {},
      apiKey: ''
    });
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
    setSelectedProvider(null);
    setShowAddForm(false);
    
    toast({
      title: 'CRM Connection Added',
      description: `${providers.find(p => p.id === connection.provider)?.name} connection has been added. Test it to activate.`
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
        const updatedConnections = [...connections];
        updatedConnections[index] = {
          ...connection,
          status: 'active',
          lastSyncAt: new Date().toISOString()
        };
        onConnectionsUpdate(updatedConnections);
        
        toast({
          title: 'Connection Successful',
          description: `${providers.find(p => p.id === connection.provider)?.name} is now active and ready to sync leads.`
        });
      } else {
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
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Connected</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Setup Required</Badge>;
    }
  };

  const selectedProviderData = providers.find(p => p.id === selectedProvider);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-blue-100 rounded-full">
            <Zap className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Connect your CRM</h2>
        <p className="text-lg text-gray-600 mb-1">Sync leads automatically. No manual work needed.</p>
        <p className="text-sm text-gray-500">100% secure. Your data stays protected.</p>
      </div>

      {/* Existing Connections */}
      {connections.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Active Connections
          </h3>
          <div className="grid gap-4">
            {connections.map((connection, index) => {
              const provider = providers.find(p => p.id === connection.provider);
              return (
                <Card key={index} className="border-2">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-xl ${provider?.color || 'bg-gray-500'}`}>
                          <span className="text-2xl">{provider?.logo || '🔗'}</span>
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{provider?.name || connection.provider}</div>
                          <div className="text-sm text-gray-600">
                            {connection.lastSyncAt 
                              ? `Last sync: ${new Date(connection.lastSyncAt).toLocaleDateString()}`
                              : 'Ready to sync'
                            }
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(connection.status)}
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => testConnection(connection, index)}
                          disabled={testingConnection === connection.provider}
                          className="border-2"
                        >
                          <TestTube className="h-4 w-4 mr-2" />
                          {testingConnection === connection.provider ? 'Testing...' : 'Test'}
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeConnection(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Connection Flow */}
      {!showAddForm && !selectedProvider && (
        <div className="text-center">
          <Button 
            onClick={() => setShowAddForm(true)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            <Plus className="h-5 w-5 mr-2" />
            {connections.length === 0 ? 'Connect Your First CRM' : 'Add Another CRM'}
          </Button>
        </div>
      )}

      {/* Provider Selection */}
      {showAddForm && !selectedProvider && (
        <Card className="border-2">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl">Choose your CRM platform</CardTitle>
            <CardDescription className="text-lg">
              Select the platform where you want to sync your leads
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {providers.map((provider) => (
                <Card 
                  key={provider.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
                    provider.comingSoon 
                      ? 'opacity-60 cursor-not-allowed' 
                      : 'hover:border-blue-300 hover:scale-[1.02]'
                  }`}
                  onClick={() => handleProviderSelect(provider.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <div className={`p-4 rounded-xl ${provider.color}`}>
                        <span className="text-3xl">{provider.logo}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg">{provider.name}</h3>
                          {provider.popular && (
                            <Badge className="bg-blue-100 text-blue-700 text-xs">Popular</Badge>
                          )}
                          {provider.comingSoon && (
                            <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 text-sm">{provider.description}</p>
                      </div>
                      {!provider.comingSoon && (
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={() => setShowAddForm(false)}
                className="border-2"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Provider Configuration */}
      {selectedProvider && selectedProviderData && (
        <Card className="border-2">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-xl ${selectedProviderData.color}`}>
                <span className="text-4xl">{selectedProviderData.logo}</span>
              </div>
            </div>
            <CardTitle className="text-2xl">Connect {selectedProviderData.name}</CardTitle>
            <CardDescription className="text-lg">
              {selectedProviderData.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-md mx-auto">
            <div className="space-y-6">
              {selectedProviderData.fields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key} className="font-medium">{field.label}</Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.placeholder}
                    value={
                      field.key === 'apiKey' 
                        ? newConnection.apiKey || ''
                        : newConnection.config?.[field.key] || ''
                    }
                    onChange={(e) => {
                      if (field.key === 'apiKey') {
                        setNewConnection(prev => ({ ...prev, apiKey: e.target.value }));
                      } else {
                        setNewConnection(prev => ({
                          ...prev,
                          config: { ...prev.config, [field.key]: e.target.value }
                        }));
                      }
                    }}
                    className="h-12 text-lg"
                  />
                  {field.key === 'spreadsheetId' && (
                    <p className="text-sm text-gray-500">
                      Find this in your Google Sheets URL between /d/ and /edit
                    </p>
                  )}
                </div>
              ))}

              <div className="pt-4 space-y-3">
                <Button
                  onClick={handleAddConnection}
                  disabled={
                    !newConnection.provider || 
                    (selectedProviderData.fields.some(f => 
                      f.key === 'apiKey' ? false : // API key is optional
                      f.key === 'spreadsheetId' ? !newConnection.config?.spreadsheetId :
                      f.key === 'webhookUrl' ? !newConnection.config?.webhookUrl :
                      false
                    ))
                  }
                  className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Connect {selectedProviderData.name}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedProvider(null);
                    setNewConnection({
                      provider: 'google_sheets',
                      status: 'inactive',
                      config: {}
                    });
                  }}
                  className="w-full h-12 border-2"
                >
                  Back to providers
                </Button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t text-center">
              <p className="text-sm text-gray-500 leading-relaxed">
                By connecting, your lead data will be automatically synced to {selectedProviderData.name}. 
                We use industry-standard encryption to keep your data secure. 
                You can disconnect at any time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {connections.length === 0 && !showAddForm && !selectedProvider && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gray-100 rounded-full">
                <Database className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-medium mb-3 text-gray-900">Ready to automate your leads?</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Connect your CRM and we'll automatically send every business card interaction 
              straight to your system. No manual work, no missed opportunities.
            </p>
            <Button 
              onClick={() => setShowAddForm(true)}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              <Plus className="h-5 w-5 mr-2" />
              Get Started
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}