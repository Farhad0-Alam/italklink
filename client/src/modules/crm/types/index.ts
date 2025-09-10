export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  leadScore: number;
  lifecycleStage: 'subscriber' | 'lead' | 'marketing_qualified_lead' | 'sales_qualified_lead' | 'opportunity' | 'customer';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  notes?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  businessCardId?: string;
  createdAt: string;
  updatedAt: string;
  lastContact?: string;
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: string;
  pipelineId: string;
  contactId: string;
  contact?: Contact;
  probability: number;
  expectedCloseDate?: string;
  actualCloseDate?: string;
  wonReason?: string;
  lostReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  type: 'call' | 'email' | 'meeting' | 'follow_up' | 'demo' | 'other';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completedAt?: string;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  assignedTo?: string;
  assignedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  type: 'contact_created' | 'deal_created' | 'deal_moved' | 'deal_won' | 'deal_lost' | 'task_created' | 'task_completed' | 'note_added' | 'email_sent' | 'call_logged' | 'meeting_scheduled';
  description: string;
  contactId?: string;
  contact?: Contact;
  dealId?: string;
  deal?: Deal;
  taskId?: string;
  task?: Task;
  metadata?: Record<string, any>;
  createdAt: string;
  createdBy?: string;
}

export interface CRMStats {
  totalContacts: number;
  totalDeals: number;
  totalDealValue: number;
  wonDeals: number;
  wonDealValue: number;
  lostDeals: number;
  lostDealValue: number;
  averageDealSize: number;
  conversionRate: number;
  activeTasks: number;
  overdueTasks: number;
  recentActivities: Activity[];
  leadScoreDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  dealsByStage: {
    stageName: string;
    count: number;
    value: number;
  }[];
  monthlyMetrics: {
    month: string;
    newContacts: number;
    newDeals: number;
    wonDeals: number;
    revenue: number;
  }[];
}

// Form schemas
export interface ContactCreateInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  lifecycleStage: Contact['lifecycleStage'];
  priority: Contact['priority'];
  tags: string[];
  notes?: string;
  socialLinks?: Contact['socialLinks'];
  businessCardId?: string;
}

export interface DealCreateInput {
  title: string;
  value: number;
  currency: string;
  stage: string;
  pipelineId: string;
  contactId: string;
  probability: number;
  expectedCloseDate?: string;
  notes?: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string;
  type: Task['type'];
  priority: Task['priority'];
  dueDate?: string;
  contactId?: string;
  dealId?: string;
  assignedTo?: string;
}