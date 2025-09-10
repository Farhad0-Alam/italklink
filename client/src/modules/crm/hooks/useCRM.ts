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
  return useQuery<Contact[]>({
    queryKey: ['/api/crm/contacts', filters],
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useContact(contactId: string) {
  return useQuery<Contact>({
    queryKey: ['/api/crm/contacts', contactId],
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
      queryClient.invalidateQueries({ queryKey: ['/api/crm/contacts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/contacts', contactId] });
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
  return useQuery<Deal[]>({
    queryKey: ['/api/crm/deals', filters],
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
      queryClient.invalidateQueries({ queryKey: ['/api/crm/deals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/deals', dealId] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/crm/activities'] });
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
  return useQuery<Task[]>({
    queryKey: ['/api/crm/tasks', filters],
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
      queryClient.invalidateQueries({ queryKey: ['/api/crm/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/crm/tasks', taskId] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/crm/activities'] });
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
  return useQuery<Activity[]>({
    queryKey: ['/api/crm/activities', filters],
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useContactActivities(contactId: string) {
  return useQuery<Activity[]>({
    queryKey: ['/api/crm/activities', { contactId }],
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