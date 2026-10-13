import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ default: { get: vi.fn() } }));

import api from './client';
import { cleanAuditParams, fetchAuditLogs } from './audit';

const mocked = vi.mocked(api);

describe('audit API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends only real filters, trimmed', () => {
    expect(cleanAuditParams({ page: 2, limit: 25, action: '  ', entityType: ' Customer ' })).toEqual({
      page: 2,
      limit: 25,
      entityType: 'Customer',
    });
    expect(
      cleanAuditParams({ page: 1, limit: 25, from: '2025-01-01T00:00:00.000Z', to: '2025-01-02T00:00:00.000Z' })
    ).toEqual({ page: 1, limit: 25, from: '2025-01-01T00:00:00.000Z', to: '2025-01-02T00:00:00.000Z' });
  });

  it('calls GET /audit-logs/ and returns data with pagination', async () => {
    const pagination = { page: 1, limit: 25, total: 1, totalPages: 1 };
    mocked.get.mockResolvedValue({ data: { success: true, data: [{ _id: 'a1' }], pagination } });
    const result = await fetchAuditLogs({ page: 1, limit: 25 });
    expect(mocked.get).toHaveBeenCalledWith('/audit-logs/', { params: { page: 1, limit: 25 } });
    expect(result.pagination).toEqual(pagination);
    expect(result.data).toHaveLength(1);
  });

  it('rejects malformed responses instead of rendering them', async () => {
    mocked.get.mockResolvedValueOnce({ data: { success: true, data: [] } });
    await expect(fetchAuditLogs({ page: 1, limit: 25 })).rejects.toThrow('Unexpected response');
    mocked.get.mockResolvedValueOnce({ data: { success: false, message: 'Denied' } });
    await expect(fetchAuditLogs({ page: 1, limit: 25 })).rejects.toThrow('Denied');
  });
});
