import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { AutomationWorkflow, AutomationRun } from "../types";

// Automation hooks that extend the existing CRM hooks
export function useAutomations() {
  return useQuery<any[]>({
    queryKey: ['/api/automations'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useAutomation(automationId: string) {
  return useQuery<any>({
    queryKey: ['/api/automations', automationId],
    enabled: !!automationId,
  });
}

export function useCreateAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Omit<AutomationWorkflow, 'id'>) => 
      apiRequest('POST', '/api/automations', {
        name: data.name,
        description: data.description,
        triggers: data.triggers,
        conditions: data.conditions,
        actions: data.actions,
        enabled: data.enabled
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
    },
  });
}

export function useUpdateAutomation(automationId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: Partial<AutomationWorkflow>) => 
      apiRequest('PUT', `/api/automations/${automationId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ predicate: (query) => 
        query.queryKey[0] && typeof query.queryKey[0] === 'string' && 
        query.queryKey[0].startsWith('/api/automations')
      });
    },
  });
}

export function useDeleteAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (automationId: string) => 
      apiRequest('DELETE', `/api/automations/${automationId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
    },
  });
}

export function useToggleAutomation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (automationId: string) => 
      apiRequest('POST', `/api/automations/${automationId}/toggle`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/automations'] });
    },
  });
}

export function useTestAutomation() {
  return useMutation({
    mutationFn: ({ automationId, testData }: { automationId: string; testData: Record<string, any> }) => 
      apiRequest('POST', `/api/automations/${automationId}/test`, testData),
  });
}

export function useAutomationRuns(automationId?: string, limit?: number) {
  const queryParams = new URLSearchParams();
  if (automationId) queryParams.append('automationId', automationId);
  if (limit) queryParams.append('limit', limit.toString());
  
  const queryString = queryParams.toString();
  
  return useQuery<AutomationRun[]>({
    queryKey: [`/api/automation-runs${queryString ? `?${queryString}` : ''}`],
    staleTime: 1000 * 30, // 30 seconds
  });
}