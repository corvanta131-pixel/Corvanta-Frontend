import api from './client';
import { pathId } from './envelope';

interface OkBody {
  success?: boolean;
  message?: string;
}

/** These endpoints answer `{ success, message }` with no data, so they are checked here rather than unwrapped. */
function assertOk(body: OkBody | undefined, label: string): string {
  if (!body || body.success !== true) throw new Error(body?.message || `Unexpected response while ${label}.`);
  return body.message ?? '';
}

export async function requestPasswordReset(email: string): Promise<string> {
  const res = await api.post<OkBody>('/auth/forgot-password', { email });
  return assertOk(res.data, 'requesting a password reset');
}

export async function completePasswordReset(token: string, password: string): Promise<string> {
  const res = await api.post<OkBody>('/auth/reset-password', { token, password });
  return assertOk(res.data, 'resetting the password');
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<string> {
  const res = await api.post<OkBody>('/auth/change-password', { currentPassword, newPassword });
  return assertOk(res.data, 'changing the password');
}

/** Emails a team member who has not set a password yet a link to choose one. */
export async function sendEmployeeInvite(employeeId: string): Promise<string> {
  const res = await api.post<OkBody>(`${pathId('/users', employeeId, 'Employee')}/invite`);
  return assertOk(res.data, 'sending the invitation');
}
