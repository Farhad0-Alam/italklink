// CRM Integration Module for Multiple Providers
import fetch from 'node-fetch';

export interface CRMContact {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  source?: string;
  leadScore?: number;
  customFields?: Record<string, any>;
}

export interface CRMConfig {
  provider: 'hubspot' | 'salesforce' | 'zoho' | 'google_sheets' | 'pipedrive' | 'custom_webhook';
  status: 'active' | 'inactive' | 'error';
  apiKey?: string;
  config: Record<string, any>;
  lastSyncAt?: string;
}

// Base CRM Provider class
abstract class CRMProvider {
  protected config: CRMConfig;
  
  constructor(config: CRMConfig) {
    this.config = config;
  }
  
  abstract createContact(contact: CRMContact): Promise<{ success: boolean; contactId?: string; error?: string }>;
  abstract updateContact(contactId: string, contact: Partial<CRMContact>): Promise<{ success: boolean; error?: string }>;
  abstract testConnection(): Promise<{ success: boolean; error?: string }>;
}

// HubSpot Provider
class HubSpotProvider extends CRMProvider {
  async createContact(contact: CRMContact) {
    try {
      const properties: Record<string, string> = {};
      
      if (contact.email) properties.email = contact.email;
      if (contact.firstName) properties.firstname = contact.firstName;
      if (contact.lastName) properties.lastname = contact.lastName;
      if (contact.phone) properties.phone = contact.phone;
      if (contact.company) properties.company = contact.company;
      if (contact.source) properties.hs_lead_source = contact.source;
      if (contact.leadScore) properties.hubspotscore = contact.leadScore.toString();
      
      // Add custom fields
      if (contact.customFields) {
        Object.entries(contact.customFields).forEach(([key, value]) => {
          properties[key] = String(value);
        });
      }
      
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties })
      });
      
      const data = await response.json() as any;
      
      if (!response.ok) {
        return { 
          success: false, 
          error: data.message || 'Failed to create HubSpot contact' 
        };
      }
      
      return { 
        success: true, 
        contactId: data.id 
      };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'HubSpot API error' 
      };
    }
  }
  
  async updateContact(contactId: string, contact: Partial<CRMContact>) {
    try {
      const properties: Record<string, string> = {};
      
      if (contact.email) properties.email = contact.email;
      if (contact.firstName) properties.firstname = contact.firstName;
      if (contact.lastName) properties.lastname = contact.lastName;
      if (contact.phone) properties.phone = contact.phone;
      if (contact.company) properties.company = contact.company;
      if (contact.leadScore) properties.hubspotscore = contact.leadScore.toString();
      
      const response = await fetch(`https://api.hubapi.com/crm/v3/objects/contacts/${contactId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ properties })
      });
      
      if (!response.ok) {
        const data = await response.json() as any;
        return { 
          success: false, 
          error: data.message || 'Failed to update HubSpot contact' 
        };
      }
      
      return { success: true };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'HubSpot API error' 
      };
    }
  }
  
  async testConnection() {
    try {
      const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts?limit=1', {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });
      
      return { 
        success: response.ok,
        error: response.ok ? undefined : 'Invalid HubSpot API key or permissions'
      };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'HubSpot connection failed' 
      };
    }
  }
}

// Google Sheets Provider
class GoogleSheetsProvider extends CRMProvider {
  async createContact(contact: CRMContact) {
    try {
      const spreadsheetId = this.config.config.spreadsheetId;
      const sheetName = this.config.config.sheetName || 'Leads';
      
      // Format row data
      const row = [
        new Date().toISOString(),
        contact.firstName || '',
        contact.lastName || '',
        contact.email || '',
        contact.phone || '',
        contact.company || '',
        contact.source || 'Digital Business Card',
        contact.leadScore?.toString() || '0'
      ];
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}:append?valueInputOption=RAW`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            values: [row]
          })
        }
      );
      
      if (!response.ok) {
        const data = await response.json() as any;
        return { 
          success: false, 
          error: data.error?.message || 'Failed to add to Google Sheets' 
        };
      }
      
      return { 
        success: true, 
        contactId: `sheet_${Date.now()}` 
      };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Google Sheets API error' 
      };
    }
  }
  
  async updateContact(contactId: string, contact: Partial<CRMContact>) {
    // Google Sheets doesn't have easy update by ID, would need to search and update
    // For now, just create a new entry
    return this.createContact(contact as CRMContact);
  }
  
  async testConnection() {
    try {
      const spreadsheetId = this.config.config.spreadsheetId;
      
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`
          }
        }
      );
      
      return { 
        success: response.ok,
        error: response.ok ? undefined : 'Invalid Google Sheets access or spreadsheet ID'
      };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Google Sheets connection failed' 
      };
    }
  }
}

// Custom Webhook Provider
class WebhookProvider extends CRMProvider {
  async createContact(contact: CRMContact) {
    try {
      const webhookUrl = this.config.config.webhookUrl;
      
      const payload = {
        event: 'contact_created',
        timestamp: new Date().toISOString(),
        source: 'digital_business_card',
        contact
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(payload)
      });
      
      return { 
        success: response.ok,
        contactId: `webhook_${Date.now()}`,
        error: response.ok ? undefined : `Webhook failed with status ${response.status}`
      };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Webhook delivery failed' 
      };
    }
  }
  
  async updateContact(contactId: string, contact: Partial<CRMContact>) {
    // Send update webhook
    const webhookUrl = this.config.config.webhookUrl;
    
    const payload = {
      event: 'contact_updated',
      timestamp: new Date().toISOString(),
      source: 'digital_business_card',
      contactId,
      updates: contact
    };
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(payload)
      });
      
      return { 
        success: response.ok,
        error: response.ok ? undefined : `Webhook failed with status ${response.status}`
      };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Webhook delivery failed' 
      };
    }
  }
  
  async testConnection() {
    try {
      const webhookUrl = this.config.config.webhookUrl;
      
      const testPayload = {
        event: 'connection_test',
        timestamp: new Date().toISOString(),
        source: 'digital_business_card'
      };
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` })
        },
        body: JSON.stringify(testPayload)
      });
      
      return { 
        success: response.ok,
        error: response.ok ? undefined : `Webhook test failed with status ${response.status}`
      };
      
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Webhook connection test failed' 
      };
    }
  }
}

// Factory function to create CRM providers
export function createCRMProvider(config: CRMConfig): CRMProvider {
  switch (config.provider) {
    case 'hubspot':
      return new HubSpotProvider(config);
    case 'google_sheets':
      return new GoogleSheetsProvider(config);
    case 'custom_webhook':
      return new WebhookProvider(config);
    // Add more providers as needed
    default:
      throw new Error(`Unsupported CRM provider: ${config.provider}`);
  }
}

// Sync contact to multiple CRM systems
export async function syncContactToCRMs(
  crmConfigs: CRMConfig[], 
  contact: CRMContact
): Promise<Array<{ provider: string; success: boolean; contactId?: string; error?: string }>> {
  const results = [];
  
  for (const config of crmConfigs) {
    if (config.status !== 'active') {
      continue;
    }
    
    try {
      const provider = createCRMProvider(config);
      const result = await provider.createContact(contact);
      
      results.push({
        provider: config.provider,
        success: result.success,
        contactId: result.contactId,
        error: result.error
      });
      
    } catch (error: any) {
      results.push({
        provider: config.provider,
        success: false,
        error: error.message
      });
    }
  }
  
  return results;
}

// Test CRM connection
export async function testCRMConnection(config: CRMConfig) {
  try {
    const provider = createCRMProvider(config);
    return await provider.testConnection();
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}