import api from './client';
import { isRecord, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { AnalyticsSummary } from '../../features/analytics/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const dateOnly = (date: Date) => date.toISOString().slice(0, 10);

/** The last `days` days including today (days are counted in UTC). */
export async function fetchAnalytics(days: number): Promise<AnalyticsSummary> {
  const to = new Date();
  const from = new Date(to.getTime() - (days - 1) * DAY_MS);
  const res = await api.get<ApiEnvelope<AnalyticsSummary>>('/analytics/summary', { params: { from: dateOnly(from), to: dateOnly(to) } });
  const data = unwrap(res.data, 'loading analytics');
  if (!isRecord(data) || !isRecord(data['conversations']) || !isRecord(data['messages']) || !isRecord(data['responseTime'])) {
    throw new Error('Received invalid analytics.');
  }
  return data;
}
