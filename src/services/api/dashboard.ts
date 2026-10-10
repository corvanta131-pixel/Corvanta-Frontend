import api from '../api/client';
import type { AxiosRequestConfig } from 'axios';
import type {
  Customer,
  Conversation,
  Agent,
  Channel,
  KnowledgeBase,
  Workflow,
  Employee,
} from '../../types/dashboard';
import type { DashboardStats } from '../../features/dashboard/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function getData<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url, config);
  if (!response.data.success) {
    throw new Error(response.data.message || 'API request failed');
  }
  return response.data.data;
}

export const dashboardApi = {
  customers: {
    list: (params?: { limit?: number; page?: number }) =>
      getData<Customer[]>('/customers', { params }),
  },

  conversations: {
    list: (params?: { limit?: number; page?: number; status?: string }) =>
      getData<Conversation[]>('/conversations', { params }),
  },

  agents: {
    list: () => getData<Agent[]>('/agents'),
  },

  channels: {
    list: () => getData<Channel[]>('/channels'),
  },

  knowledgeBases: {
    list: () => getData<KnowledgeBase[]>('/knowledge-bases'),
  },

  workflows: {
    list: () => getData<Workflow[]>('/workflows'),
  },

  employees: {
    list: () => getData<Employee[]>('/users'),
  },
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [customers, conversations, agents, channels, knowledgeBases, workflows, employees] = await Promise.allSettled([
    dashboardApi.customers.list({ limit: 1 }),
    dashboardApi.conversations.list({ limit: 1, status: 'open' }),
    dashboardApi.agents.list(),
    dashboardApi.channels.list(),
    dashboardApi.knowledgeBases.list(),
    dashboardApi.workflows.list(),
    dashboardApi.employees.list(),
  ]);

  return {
    customers: customers.status === 'fulfilled' ? customers.value : [],
    conversations: conversations.status === 'fulfilled' ? conversations.value : [],
    agents: agents.status === 'fulfilled' ? agents.value : [],
    channels: channels.status === 'fulfilled' ? channels.value : [],
    knowledgeBases: knowledgeBases.status === 'fulfilled' ? knowledgeBases.value : [],
    workflows: workflows.status === 'fulfilled' ? workflows.value : [],
    employees: employees.status === 'fulfilled' ? employees.value : [],
  };
}