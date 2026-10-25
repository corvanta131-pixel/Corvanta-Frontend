import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAgents, listAgents, createAgent, updateAgent, deleteAgent, fetchAgentOptions } from '../../services/api/agent';
import type { Agent, AgentInput } from './types';

export const agentQueryKeys = {
  all: ['agents'] as const,
  full: () => [...agentQueryKeys.all, 'full'] as const,
  options: () => [...agentQueryKeys.all, 'options'] as const,
};

/** Names and status only (used by the Channels page). */
export function useAgents(enabled = true) {
  return useQuery({
    queryKey: agentQueryKeys.all,
    queryFn: fetchAgents,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useAgentList(enabled = true) {
  return useQuery({
    queryKey: agentQueryKeys.full(),
    queryFn: listAgents,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useAgentOptions(enabled = true) {
  return useQuery({
    queryKey: agentQueryKeys.options(),
    queryFn: fetchAgentOptions,
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

/** Any agent change refreshes both the light and the full agent lists. */
function useRefreshAgents() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: agentQueryKeys.all });
}

export function useCreateAgent() {
  const refresh = useRefreshAgents();
  return useMutation({ mutationFn: createAgent, retry: false, onSuccess: refresh });
}

export function useUpdateAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AgentInput }) => updateAgent(id, data),
    retry: false,
    onSuccess: (updated: Agent, { id }) => {
      queryClient.setQueryData<Agent[]>(agentQueryKeys.full(), (old) => old?.map((a) => (a._id === id ? updated : a)));
      queryClient.invalidateQueries({ queryKey: agentQueryKeys.all });
    },
  });
}

export function useDeleteAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAgent,
    retry: false,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Agent[]>(agentQueryKeys.full(), (old) => old?.filter((a) => a._id !== id));
      queryClient.invalidateQueries({ queryKey: agentQueryKeys.all });
    },
  });
}
