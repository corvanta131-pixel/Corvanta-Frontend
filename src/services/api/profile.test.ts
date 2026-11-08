import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

vi.mock('./client', () => ({ default: { patch: vi.fn() } }));

import api from './client';
import { updateMyName, updateCompanyProfile } from './profile';

const mocked = api as unknown as Record<'patch', Mock>;

describe('profile API functions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('use explicit paths and payloads', async () => {
    mocked.patch.mockResolvedValue({ data: { success: true, data: { name: 'Ada', email: 'a@b.com', _id: 'c1' } } });
    await updateMyName('Ada');
    expect(mocked.patch).toHaveBeenLastCalledWith('/users/me', { name: 'Ada' });
    await updateCompanyProfile({ name: 'Acme', industry: 'Retail' });
    expect(mocked.patch).toHaveBeenLastCalledWith('/companies/current', { name: 'Acme', industry: 'Retail' });
  });

  it('reject empty or invalid answers', async () => {
    mocked.patch.mockResolvedValueOnce({ data: { success: true, data: {} } });
    await expect(updateMyName('Ada')).rejects.toThrow('invalid profile');
    mocked.patch.mockResolvedValueOnce({ data: { success: true, data: { name: 'x' } } });
    await expect(updateCompanyProfile({ name: 'x' })).rejects.toThrow('invalid company');
    mocked.patch.mockResolvedValueOnce({ data: { success: false, message: 'Nope', data: null } });
    await expect(updateMyName('Ada')).rejects.toThrow('Nope');
  });
});
