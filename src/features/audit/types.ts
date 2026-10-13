/** Audit record as returned by GET /audit-logs (metadata is redacted server-side). */
export interface AuditLogEntry {
  _id: string;
  action: string;
  entityType: string;
  entityId: string;
  actor: { _id: string; name: string; email: string } | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Only filters the backend honours. Dates are ISO strings. */
export interface AuditQuery {
  page: number;
  limit: number;
  action?: string | undefined;
  entityType?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
}

export interface AuditPage {
  data: AuditLogEntry[];
  pagination: Pagination;
}
