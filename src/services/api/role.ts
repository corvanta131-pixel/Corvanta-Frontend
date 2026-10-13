import api from './client';
import { hasStringField, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { RoleSummary } from '../../features/roles/types';

export async function fetchRoles(): Promise<RoleSummary[]> {
  const res = await api.get<ApiEnvelope<RoleSummary[]>>('/roles/');
  const data = unwrap(res.data, 'loading roles');
  if (!Array.isArray(data)) throw new Error('Received an invalid role list.');
  return data.map((r) => {
    if (!hasStringField(r, '_id') || !hasStringField(r, 'name')) {
      throw new Error('Received an invalid role record while loading roles.');
    }
    return r;
  });
}
