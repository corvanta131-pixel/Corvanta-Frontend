import api from './client';
import { hasStringField, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { AgentSummary } from '../../features/agents/types';

export async function fetchAgents(): Promise<AgentSummary[]> {
  const res = await api.get<ApiEnvelope<AgentSummary[]>>('/agents/');
  const data = unwrap(res.data, 'loading agents');
  if (!Array.isArray(data)) throw new Error('Received an invalid agent list.');
  return data.map((a) => {
    if (!hasStringField(a, '_id') || !hasStringField(a, 'name')) {
      throw new Error('Received an invalid agent record while loading agents.');
    }
    return a;
  });
}
