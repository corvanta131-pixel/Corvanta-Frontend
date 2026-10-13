import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchAuditLogs } from '../../services/api/audit';
import type { AuditQuery } from './types';

export function useAuditLogs(query: AuditQuery, enabled = true) {
  return useQuery({
    queryKey: ['audit-logs', query],
    queryFn: () => fetchAuditLogs(query),
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}
