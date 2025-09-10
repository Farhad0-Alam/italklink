import fetch from 'node-fetch';

export interface OneSignalNotification {
  headings: { [lang: string]: string };
  contents: { [lang: string]: string };
  url?: string;
  filters: OneSignalFilter[];
  send_after?: string;
}

export interface OneSignalFilter {
  field: 'tag' | 'country' | 'language';
  key?: string;
  relation: '=' | '!=' | '>' | '<' | 'exists' | 'not_exists' | 'in';
  value?: string | string[];
}

export interface OneSignalResponse {
  id: string;
  recipients: number;
  external_id?: string;
  errors?: any;
}

export class OneSignalService {
  private readonly appId: string;
  private readonly apiKey: string;
  private readonly baseUrl = 'https://onesignal.com/api/v1';

  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID!;
    this.apiKey = process.env.ONESIGNAL_API_KEY!;
    
    if (!this.appId || !this.apiKey) {
      throw new Error('OneSignal configuration missing: ONESIGNAL_APP_ID and ONESIGNAL_API_KEY required');
    }
  }

  /**
   * Send notification by tags with advanced filtering
   */
  async sendByTags(notification: OneSignalNotification): Promise<OneSignalResponse> {
    const payload = {
      app_id: this.appId,
      headings: notification.headings,
      contents: notification.contents,
      url: notification.url,
      filters: notification.filters,
      send_after: notification.send_after,
      // Additional OneSignal options
      web_push_topic: 'default',
      priority: 5,
      ttl: 259200, // 3 days
    };

    try {
      const response = await fetch(`${this.baseUrl}/notifications`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json() as any;

      if (!response.ok) {
        const errorMessage = this.parseOneSignalError(data);
        throw new Error(`OneSignal API error (${response.status}): ${errorMessage}`);
      }

      return {
        id: data.id,
        recipients: data.recipients || 0,
        external_id: data.external_id,
        errors: data.errors,
      };
    } catch (error: any) {
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('OneSignal service unavailable. Please try again later.');
      }
      throw error;
    }
  }

  /**
   * Send notification to card subscribers
   */
  async sendToCardSubscribers(cardId: string, title: string, message: string, url?: string): Promise<OneSignalResponse> {
    const notification: OneSignalNotification = {
      headings: { en: title },
      contents: { en: message },
      url,
      filters: [
        { field: 'tag', key: 'card_id', relation: '=', value: cardId }
      ],
    };

    return this.sendByTags(notification);
  }

  /**
   * Send admin broadcast to users
   */
  async sendAdminBroadcast(
    title: string,
    message: string,
    options: {
      url?: string;
      segment?: 'all' | 'free' | 'paid';
      locales?: string[];
      countries?: string[];
    } = {}
  ): Promise<OneSignalResponse> {
    const filters: OneSignalFilter[] = [
      // Base filter: only users (not visitors)
      { field: 'tag', key: 'role', relation: '=', value: 'user' }
    ];

    // Add segment filter
    if (options.segment === 'paid') {
      filters.push({
        field: 'tag',
        key: 'plan',
        relation: 'in',
        value: ['pro', 'premium', 'enterprise']
      });
    } else if (options.segment === 'free') {
      filters.push({
        field: 'tag',
        key: 'plan',
        relation: '=',
        value: 'free'
      });
    }

    // Add locale filter
    if (options.locales && options.locales.length > 0) {
      filters.push({
        field: 'tag',
        key: 'locale',
        relation: 'in',
        value: options.locales
      });
    }

    // Add country filter
    if (options.countries && options.countries.length > 0) {
      filters.push({
        field: 'tag',
        key: 'country',
        relation: 'in',
        value: options.countries
      });
    }

    const notification: OneSignalNotification = {
      headings: { en: title },
      contents: { en: message },
      url: options.url,
      filters,
    };

    return this.sendByTags(notification);
  }

  /**
   * Parse OneSignal error responses into user-friendly messages
   */
  private parseOneSignalError(errorData: any): string {
    if (errorData.errors) {
      if (Array.isArray(errorData.errors)) {
        return errorData.errors.join(', ');
      }
      if (typeof errorData.errors === 'object') {
        return Object.values(errorData.errors).flat().join(', ');
      }
    }
    
    return errorData.message || 'Unknown OneSignal error';
  }

  /**
   * Test OneSignal connection
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/apps/${this.appId}`, {
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}