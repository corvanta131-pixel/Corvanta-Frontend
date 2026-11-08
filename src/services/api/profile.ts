import api from './client';
import { hasStringField, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { Company } from '../../features/auth/types';

export interface MyProfile {
  name: string;
  email: string;
}

/** Changes the signed-in person's own display name. */
export async function updateMyName(name: string): Promise<MyProfile> {
  const res = await api.patch<ApiEnvelope<MyProfile>>('/users/me', { name });
  const data = unwrap(res.data, 'updating your name');
  if (!hasStringField(data, 'name')) throw new Error('Received an invalid profile while updating your name.');
  return data;
}

/** Changes the company name and/or industry (needs companies:update). */
export async function updateCompanyProfile(input: { name?: string; industry?: string }): Promise<Company> {
  const res = await api.patch<ApiEnvelope<Company>>('/companies/current', input);
  const data = unwrap(res.data, 'updating the company');
  if (!hasStringField(data, '_id') || !hasStringField(data, 'name')) throw new Error('Received an invalid company while updating it.');
  return data;
}
