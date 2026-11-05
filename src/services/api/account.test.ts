import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('./client', () => ({ default: { post: vi.fn() } }));

import api from './client';
import { requestPasswordReset, completePasswordReset, changePassword, sendEmployeeInvite } from './account';

const mocked = api as unknown as Record<'post', Mock>;

describe('account API functions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('use explicit paths and payloads', async () => {
    mocked.post.mockResolvedValue({ data: { success: true, message: 'ok' } });
    await requestPasswordReset('ada@x.com');
    expect(mocked.post).toHaveBeenLastCalledWith('/auth/forgot-password', { email: 'ada@x.com' });
    await completePasswordReset('t'.repeat(64), 'NewPassword1');
    expect(mocked.post).toHaveBeenLastCalledWith('/auth/reset-password', { token: 't'.repeat(64), password: 'NewPassword1' });
    await changePassword('old-password', 'new-password-1');
    expect(mocked.post).toHaveBeenLastCalledWith('/auth/change-password', { currentPassword: 'old-password', newPassword: 'new-password-1' });
    await sendEmployeeInvite('emp-1');
    expect(mocked.post).toHaveBeenLastCalledWith('/users/emp-1/invite');
  });

  it('returns the server message and rejects empty ids and unexpected answers', async () => {
    mocked.post.mockResolvedValueOnce({ data: { success: true, message: 'Reset link on its way' } });
    await expect(requestPasswordReset('a@b.com')).resolves.toBe('Reset link on its way');
    await expect(sendEmployeeInvite('')).rejects.toThrow('Employee id is required.');
    mocked.post.mockResolvedValueOnce({ data: { success: false, message: 'Nope' } });
    await expect(changePassword('a', 'b')).rejects.toThrow('Nope');
    mocked.post.mockResolvedValueOnce({ data: undefined });
    await expect(completePasswordReset('x', 'y')).rejects.toThrow('Unexpected response');
  });
});
