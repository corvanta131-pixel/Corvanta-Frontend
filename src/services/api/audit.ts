import api from './client';
import { isRecord } from './envelope';
import type { AuditPage, AuditQuery } from '../../features/audit/types';

/** Drops empty filters so only real parameters reach the server. */
export function cleanAuditParams(query: AuditQuery): Record<string, string | number> {
  const action = query.action?.trim();
  const entityType = query.entityType?.trim();
  return {
    page: query.page,
    limit: query.limit,
    ...(action ? { action } : {}),
    ...(entityType ? { entityType } : {}),
    ...(query.from ? { from: query.from } : {}),
    ...(query.to ? { to: query.to } : {}),
  };
}

function isAuditPage(body: unknown): body is { success: true; data: AuditPage['data']; pagination: AuditPage['pagination'] } {
  if (!isRecord(body) || body['success'] !== true || !Array.isArray(body['data'])) return false;
  const pagination = body['pagination'];
  return isRecord(pagination) && typeof pagination['total'] === 'number';
}

export async function fetchAuditLogs(query: AuditQuery): Promise<AuditPage> {
  const res = await api.get<unknown>('/audit-logs/', { params: cleanAuditParams(query) });
  const body = res.data;
  if (!isAuditPage(body)) {
    const message = isRecord(body) ? body['message'] : undefined;
    throw new Error(typeof message === 'string' && message ? message : 'Unexpected response while loading audit logs.');
  }
  return { data: body.data, pagination: body.pagination };
}
