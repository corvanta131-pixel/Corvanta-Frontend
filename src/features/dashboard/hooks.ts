import { useQuery } from '@tanstack/react-query';
import { dashboardApi, fetchDashboardStats } from '../../services/api/dashboard';
import type {
  Customer,
  Conversation,
  Agent,
  Channel,
  KnowledgeBase,
  Workflow,
  Employee,
} from '../../types/dashboard';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useCustomers(params?: { limit?: number; page?: number }) {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => dashboardApi.customers.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useConversations(params?: { limit?: number; page?: number; status?: string }) {
  return useQuery({
    queryKey: ['conversations', params],
    queryFn: () => dashboardApi.conversations.list(params),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useAgents() {
  return useQuery({
    queryKey: ['agents'],
    queryFn: dashboardApi.agents.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: dashboardApi.channels.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useKnowledgeBases() {
  return useQuery({
    queryKey: ['knowledgeBases'],
    queryFn: dashboardApi.knowledgeBases.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useWorkflows() {
  return useQuery({
    queryKey: ['workflows'],
    queryFn: dashboardApi.workflows.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: dashboardApi.employees.list,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useRecentCustomers(limit = 5) {
  return useQuery({
    queryKey: ['customers', 'recent', limit],
    queryFn: () => dashboardApi.customers.list({ limit }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export function useRecentConversations(limit = 5) {
  return useQuery({
    queryKey: ['conversations', 'recent', limit],
    queryFn: () => dashboardApi.conversations.list({ limit, status: 'open' }),
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
}

export type {
  Customer,
  Conversation,
  Agent,
  Channel,
  KnowledgeBase,
  Workflow,
  Employee,
};