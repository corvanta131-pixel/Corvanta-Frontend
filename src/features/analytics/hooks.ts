import { useQuery } from '@tanstack/react-query';
import { fetchAnalytics } from '../../services/api/analytics';

export function useAnalytics(days: number, enabled = true) {
  return useQuery({
    queryKey: ['analytics', days],
    queryFn: () => fetchAnalytics(days),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}
