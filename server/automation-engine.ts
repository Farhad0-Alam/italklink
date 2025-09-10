import { storage } from './storage';
import type { Automation, InsertAutomationRun } from '@shared/schema';
import { EventEmitter } from 'events';

// Types for automation triggers, conditions, and actions
export interface AutomationTrigger {
  type: 'lead.created' | 'task.overdue' | 'stage.changed' | 'deal.created' | 'contact.created';
  conditions?: Record<string, any>;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'not_equals';
  value: any;
}

export interface AutomationAction {
  type: 'email.send' | 'sms.send' | 'whatsapp.send' | 'call.voice' | 'push.send' | 'task.create' | 'delay';
  config: Record<string, any>;
}

export interface EventPayload {
  userId: string;
  entityId: string;
  entityType: string;
  data: Record<string, any>;
  timestamp: Date;
}

class AutomationEngine extends EventEmitter {
  private eventQueue: Array<{ eventType: string; payload: EventPayload }> = [];
  private isProcessing = false;
  private processingTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  // Main method to trigger automation based on events
  async triggerAutomations(eventType: string, payload: EventPayload): Promise<void> {
    // Always enqueue the event to prevent data loss
    this.eventQueue.push({ eventType, payload });
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  // Process events from the queue sequentially
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    
    try {
      while (this.eventQueue.length > 0) {
        const event = this.eventQueue.shift();
        if (!event) continue;

        const { eventType, payload } = event;
        
        try {
          console.log(`🔄 Processing automation trigger: ${eventType}`, { userId: payload.userId });
          
          // Get all enabled automations for the user
          const automations = await storage.getEnabledAutomations(payload.userId);
          
          // Filter automations that match this trigger
          const matchingAutomations = automations.filter(automation => {
            const triggers = automation.triggers as AutomationTrigger[];
            return triggers.some(trigger => trigger.type === eventType);
          });

          console.log(`Found ${matchingAutomations.length} matching automations for ${eventType}`);

          // Execute each matching automation
          for (const automation of matchingAutomations) {
            await this.executeAutomation(automation, eventType, payload);
          }
        } catch (eventError) {
          console.error(`Error processing event ${eventType}:`, eventError);
          // Continue processing other events even if one fails
        }
      }
    } catch (error) {
      console.error('Error in automation engine queue processing:', error);
    } finally {
      this.isProcessing = false;
      
      // Schedule next processing cycle if queue has new items
      if (this.eventQueue.length > 0) {
        this.processingTimeout = setTimeout(() => this.processQueue(), 100);
      }
    }
  }

  // Execute a single automation
  private async executeAutomation(automation: Automation, triggerEvent: string, payload: EventPayload): Promise<void> {
    const runId = await this.startAutomationRun(automation.id, triggerEvent, payload);
    const executionLog: any[] = [];

    try {
      console.log(`🚀 Executing automation: ${automation.name} (${automation.id})`);

      // Evaluate conditions
      const conditions = automation.conditions as AutomationCondition[];
      if (conditions && conditions.length > 0) {
        const conditionsPass = this.evaluateConditions(conditions, payload);
        
        executionLog.push({
          step: 'conditions',
          status: conditionsPass ? 'success' : 'skipped',
          message: conditionsPass ? 'All conditions passed' : 'Conditions not met',
          timestamp: new Date()
        });

        if (!conditionsPass) {
          await storage.completeAutomationRun(runId, 'skipped', executionLog);
          await storage.incrementAutomationRuns(automation.id, true);
          return;
        }
      }

      // Execute actions
      const actions = automation.actions as AutomationAction[];
      let allActionsPassed = true;

      for (let i = 0; i < actions.length; i++) {
        const action = actions[i];
        
        try {
          await this.executeAction(action, payload, executionLog);
        } catch (actionError) {
          console.error(`Action ${i + 1} failed:`, actionError);
          allActionsPassed = false;
          
          executionLog.push({
            step: `action_${i + 1}`,
            action: action.type,
            status: 'failed',
            error: actionError instanceof Error ? actionError.message : 'Unknown error',
            timestamp: new Date()
          });
        }
      }

      // Complete the automation run
      const finalStatus = allActionsPassed ? 'success' : 'partial';
      await storage.completeAutomationRun(runId, finalStatus, executionLog);
      await storage.incrementAutomationRuns(automation.id, allActionsPassed);

      console.log(`✅ Automation completed: ${automation.name} - Status: ${finalStatus}`);

    } catch (error) {
      console.error(`❌ Automation failed: ${automation.name}`, error);
      
      executionLog.push({
        step: 'execution',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      });

      await storage.completeAutomationRun(runId, 'failed', executionLog, error instanceof Error ? error.message : 'Unknown error');
      await storage.incrementAutomationRuns(automation.id, false);
    }
  }

  // Start an automation run record
  private async startAutomationRun(automationId: string, triggerEvent: string, payload: EventPayload): Promise<string> {
    const runData: InsertAutomationRun = {
      automationId,
      triggerEvent,
      triggerPayload: payload as any,
      status: 'pending'
    };

    const run = await storage.createAutomationRun(runData);
    return run.id;
  }

  // Evaluate conditions against the payload
  private evaluateConditions(conditions: AutomationCondition[], payload: EventPayload): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(condition.field, payload);
      return this.evaluateCondition(fieldValue, condition.operator, condition.value);
    });
  }

  // Get field value from payload using dot notation
  private getFieldValue(field: string, payload: EventPayload): any {
    const keys = field.split('.');
    let value: any = payload;
    
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }
    
    return value;
  }

  // Evaluate a single condition
  private evaluateCondition(fieldValue: any, operator: string, targetValue: any): boolean {
    switch (operator) {
      case 'equals':
        return fieldValue === targetValue;
      case 'not_equals':
        return fieldValue !== targetValue;
      case 'contains':
        return String(fieldValue).toLowerCase().includes(String(targetValue).toLowerCase());
      case 'gt':
        return Number(fieldValue) > Number(targetValue);
      case 'gte':
        return Number(fieldValue) >= Number(targetValue);
      case 'lt':
        return Number(fieldValue) < Number(targetValue);
      case 'lte':
        return Number(fieldValue) <= Number(targetValue);
      default:
        console.warn(`Unknown condition operator: ${operator}`);
        return false;
    }
  }

  // Execute an individual action
  private async executeAction(action: AutomationAction, payload: EventPayload, executionLog: any[]): Promise<void> {
    console.log(`🔧 Executing action: ${action.type}`);

    const actionStart = Date.now();

    try {
      switch (action.type) {
        case 'email.send':
          await this.sendEmail(action.config, payload);
          break;
        case 'sms.send':
          await this.sendSMS(action.config, payload);
          break;
        case 'whatsapp.send':
          await this.sendWhatsApp(action.config, payload);
          break;
        case 'call.voice':
          await this.makeVoiceCall(action.config, payload);
          break;
        case 'push.send':
          await this.sendPushNotification(action.config, payload);
          break;
        case 'task.create':
          await this.createTask(action.config, payload);
          break;
        case 'delay':
          await this.delay(action.config.ms || 1000);
          break;
        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      executionLog.push({
        step: `action_${action.type}`,
        action: action.type,
        status: 'success',
        duration: Date.now() - actionStart,
        timestamp: new Date()
      });

    } catch (error) {
      executionLog.push({
        step: `action_${action.type}`,
        action: action.type,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - actionStart,
        timestamp: new Date()
      });
      throw error;
    }
  }

  // Action implementations
  private async sendEmail(config: any, payload: EventPayload): Promise<void> {
    console.log('📧 Sending email...', { to: config.to, subject: config.subject });
    
    // Replace template variables
    const subject = this.replaceTemplateVariables(config.subject, payload);
    const body = this.replaceTemplateVariables(config.body || config.text, payload);
    const to = this.replaceTemplateVariables(config.to, payload);

    // TODO: Implement Resend API integration
    if (!process.env.RESEND_API_KEY) {
      console.warn('RESEND_API_KEY not configured, email simulation only');
      return;
    }

    // Simulate email sending for now
    console.log(`Email sent to ${to}: ${subject}`);
  }

  private async sendSMS(config: any, payload: EventPayload): Promise<void> {
    console.log('📱 Sending SMS...', { to: config.to });
    
    const to = this.replaceTemplateVariables(config.to, payload);
    const text = this.replaceTemplateVariables(config.text, payload);

    // TODO: Implement Twilio SMS API integration
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.warn('Twilio credentials not configured, SMS simulation only');
      return;
    }

    console.log(`SMS sent to ${to}: ${text}`);
  }

  private async sendWhatsApp(config: any, payload: EventPayload): Promise<void> {
    console.log('💬 Sending WhatsApp...', { to: config.to });
    
    const to = this.replaceTemplateVariables(config.to, payload);
    const text = this.replaceTemplateVariables(config.text, payload);

    // TODO: Implement Twilio WhatsApp API integration
    console.log(`WhatsApp sent to ${to}: ${text}`);
  }

  private async makeVoiceCall(config: any, payload: EventPayload): Promise<void> {
    console.log('📞 Making voice call...', { to: config.to });
    
    const to = this.replaceTemplateVariables(config.to, payload);
    const message = this.replaceTemplateVariables(config.message, payload);

    // TODO: Implement Twilio Voice API integration
    console.log(`Voice call to ${to}: ${message}`);
  }

  private async sendPushNotification(config: any, payload: EventPayload): Promise<void> {
    console.log('🔔 Sending push notification...');
    
    const title = this.replaceTemplateVariables(config.title, payload);
    const body = this.replaceTemplateVariables(config.body, payload);

    // TODO: Implement OneSignal API integration
    if (!process.env.ONESIGNAL_API_KEY || !process.env.ONESIGNAL_APP_ID) {
      console.warn('OneSignal credentials not configured, push notification simulation only');
      return;
    }

    console.log(`Push notification sent: ${title} - ${body}`);
  }

  private async createTask(config: any, payload: EventPayload): Promise<void> {
    console.log('✅ Creating task...');
    
    const title = this.replaceTemplateVariables(config.title, payload);
    const description = this.replaceTemplateVariables(config.description || '', payload);
    
    // Create CRM task
    await storage.createTask({
      contactId: config.contactId || payload.entityId,
      title,
      description,
      type: config.type || 'follow_up',
      priority: config.priority || 'medium',
      status: 'open',
      assignedTo: payload.userId,
      createdBy: payload.userId,
      dueAt: config.dueDate ? new Date(config.dueDate) : new Date(Date.now() + 24 * 60 * 60 * 1000) // Default: 24 hours
    });

    console.log(`Task created: ${title}`);
  }

  private async delay(ms: number): Promise<void> {
    console.log(`⏰ Waiting ${ms}ms...`);
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Replace template variables in strings
  private replaceTemplateVariables(template: string, payload: EventPayload): string {
    if (!template) return '';
    
    return template.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
      const value = this.getFieldValue(path.trim(), payload);
      return value !== undefined ? String(value) : match;
    });
  }
}

// Global automation engine instance
export const automationEngine = new AutomationEngine();

// Helper function to emit events
export function emitAutomationEvent(eventType: string, payload: EventPayload): void {
  automationEngine.triggerAutomations(eventType, payload).catch(error => {
    console.error('Failed to trigger automations:', error);
  });
}