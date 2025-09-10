import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Contact, Deal, Task, Activity, CRMStats, ContactCreateInput, DealCreateInput, TaskCreateInput } from "../types";

// CRM Stats hooks
export function useCRMStats() {
  return useQuery<CRMStats>({
    queryKey: ['/api/crm/stats'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Contact hooks
export function useContacts(filters?: {
  search?: string;
  lifecycleStage?: string;
  priority?: string;
  tags?: string[];
}) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.append('search', filters.search);
  if (filters?.lifecycleStage) queryParams.append('lifecycleStage', filters.lifecycleStage);
  if (filters?.priority) queryParams.append('priority', filters.priority);
  if (filters?.tags?.length) queryParams.append('tags', filters.tags.join(','));
  
  const queryString = queryParams.toString();
  
  return useQuery<Contact[]>({
    queryKey: [`/api/crm/contacts${queryString ? `?${queryString}` : ''}`],
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useContact(contactId: string) {
  return useQuery<Contact>({
    queryKey: [`/api/crm/contacts/${contactId}`],
    enabled: !!contactId,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ContactCreateInput) => 
      apiRequest('POST', '/api/crm/contacts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
    },
  });
}

export function useUpdateContact(contactId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Contact>) => 
      apiRequest('PATCH', `/api/crm/contacts/${contactId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] && typeof query.queryKey[0] === 'string' && 
        query.queryKey[0].startsWith('/api/crm/contacts')
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contactId: string) => 
      apiRequest('DELETE', `/api/crm/contacts/${contactId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
    },
  });
}

// Deal hooks
export function useDeals(filters?: {
  pipelineId?: string;
  stage?: string;
  contactId?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.pipelineId) queryParams.append('pipelineId', filters.pipelineId);
  if (filters?.stage) queryParams.append('stage', filters.stage);
  if (filters?.contactId) queryParams.append('contactId', filters.contactId);
  
  const queryString = queryParams.toString();
  
  return useQuery<Deal[]>({
    queryKey: [`/api/crm/deals${queryString ? `?${queryString}` : ''}`],
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useDeal(dealId: string) {
  return useQuery<Deal>({
    queryKey: ['/api/crm/deals', dealId],
    enabled: !!dealId,
  });
}

export function useCreateDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DealCreateInput) => 
      apiRequest('POST', '/api/crm/deals', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
    },
  });
}

export function useUpdateDeal(dealId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Deal>) => 
      apiRequest('PATCH', `/api/crm/deals/${dealId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] && typeof query.queryKey[0] === 'string' && 
        query.queryKey[0].startsWith('/api/crm/deals')
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
    },
  });
}

export function useMoveDeal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ dealId, stageId, probability }: { dealId: string; stageId: string; probability: number }) => 
      apiRequest('PATCH', `/api/crm/deals/${dealId}/move`, { stageId, probability }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] && typeof query.queryKey[0] === 'string' && 
        query.queryKey[0].startsWith('/api/crm/activities')
      });
    },
  });
}

// Task hooks
export function useTasks(filters?: {
  status?: string;
  priority?: string;
  contactId?: string;
  dealId?: string;
  assignedTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.append('status', filters.status);
  if (filters?.priority) queryParams.append('priority', filters.priority);
  if (filters?.contactId) queryParams.append('contactId', filters.contactId);
  if (filters?.dealId) queryParams.append('dealId', filters.dealId);
  if (filters?.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
  if (filters?.dueDateFrom) queryParams.append('dueDateFrom', filters.dueDateFrom);
  if (filters?.dueDateTo) queryParams.append('dueDateTo', filters.dueDateTo);
  
  const queryString = queryParams.toString();
  
  return useQuery<Task[]>({
    queryKey: [`/api/crm/tasks${queryString ? `?${queryString}` : ''}`],
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useTask(taskId: string) {
  return useQuery<Task>({
    queryKey: ['/api/crm/tasks', taskId],
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: TaskCreateInput) => 
      apiRequest('POST', '/api/crm/tasks', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
    },
  });
}

export function useUpdateTask(taskId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<Task>) => 
      apiRequest('PATCH', `/api/crm/tasks/${taskId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] && typeof query.queryKey[0] === 'string' && 
        query.queryKey[0].startsWith('/api/crm/tasks')
      });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ taskId, notes }: { taskId: string; notes?: string }) => 
      apiRequest('POST', `/api/crm/tasks/${taskId}/complete`, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/crm/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/stats'] });
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] && typeof query.queryKey[0] === 'string' && 
        query.queryKey[0].startsWith('/api/crm/activities')
      });
    },
  });
}

// Activity hooks
export function useActivities(filters?: {
  contactId?: string;
  dealId?: string;
  type?: string;
  limit?: number;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.contactId) queryParams.append('contactId', filters.contactId);
  if (filters?.dealId) queryParams.append('dealId', filters.dealId);
  if (filters?.type) queryParams.append('type', filters.type);
  if (filters?.limit) queryParams.append('limit', filters.limit.toString());
  
  const queryString = queryParams.toString();
  
  return useQuery<Activity[]>({
    queryKey: [`/api/crm/activities${queryString ? `?${queryString}` : ''}`],
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useContactActivities(contactId: string) {
  return useQuery<Activity[]>({
    queryKey: [`/api/crm/activities?contactId=${contactId}`],
    enabled: !!contactId,
    staleTime: 1000 * 30, // 30 seconds
  });
}

// Pipeline hooks
export function usePipelines() {
  return useQuery({
    queryKey: ['/api/crm/pipelines'],
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}