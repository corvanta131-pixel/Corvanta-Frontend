import { useQuery } from '@tanstack/react-query';
import { fetchRoles } from '../../services/api/role';

export const roleQueryKeys = { all: ['roles'] as const };

export function useRoles(enabled = true) {
  return useQuery({
    queryKey: roleQueryKeys.all,
    queryFn: fetchRoles,
    enabled,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}
