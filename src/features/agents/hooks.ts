import { useQuery } from '@tanstack/react-query';
import { fetchAgents } from '../../services/api/agent';

export const agentQueryKeys = { all: ['agents'] as const };

export function useAgents(enabled = true) {
  return useQuery({
    queryKey: agentQueryKeys.all,
    queryFn: fetchAgents,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
