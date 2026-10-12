import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from './client';
import { fetchEmployees, fetchEmployee, createEmployee, updateEmployee, deleteEmployee } from './employee';

const mocked = vi.mocked(api);

const record = {
  _id: 'e1',
  companyId: 'c1',
  name: 'Ada',
  email: 'ada@x.com',
  roleId: null,
  employeeCode: '',
  department: '',
  title: '',
  managerId: null,
  status: 'active',
  isEmailVerified: false,
  isDeleted: false,
  lastLoginAt: null,
  createdAt: '',
  updatedAt: '',
  __v: 0,
};

describe('employee API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses explicit HTTP methods and paths', async () => {
    mocked.get.mockResolvedValue({ data: { success: true, data: [record] } });
    mocked.post.mockResolvedValue({ data: { success: true, data: record } });
    mocked.patch.mockResolvedValue({ data: { success: true, data: record } });
    mocked.delete.mockResolvedValue({ data: { success: true, data: record } });

    await fetchEmployees();
    expect(mocked.get).toHaveBeenCalledWith('/users/');

    await fetchEmployee('e1');
    expect(mocked.get).toHaveBeenLastCalledWith('/users/e1');

    const create = { name: 'Ada', email: 'ada@x.com' };
    await createEmployee(create);
    expect(mocked.post).toHaveBeenCalledWith('/users/', create);

    const update = { name: 'Ada L', email: 'ada@x.com' };
    await updateEmployee('e1', update);
    expect(mocked.patch).toHaveBeenCalledWith('/users/e1', update);

    await deleteEmployee('e1');
    expect(mocked.delete).toHaveBeenCalledWith('/users/e1');
  });

  it('encodes ids and rejects empty ids before any request', async () => {
    mocked.get.mockResolvedValue({ data: { success: true, data: record } });
    await fetchEmployee('a/b');
    expect(mocked.get).toHaveBeenCalledWith('/users/a%2Fb');
    await expect(fetchEmployee('')).rejects.toThrow('Employee id is required.');
    expect(mocked.get).toHaveBeenCalledTimes(1);
  });

  it('rejects unsuccessful or malformed responses instead of returning them', async () => {
    mocked.get.mockResolvedValueOnce({ data: { success: false, message: 'Nope', data: [] } });
    await expect(fetchEmployees()).rejects.toThrow('Nope');

    mocked.get.mockResolvedValueOnce({ data: { success: true, data: { not: 'a list' } } });
    await expect(fetchEmployees()).rejects.toThrow('invalid employee list');

    mocked.get.mockResolvedValueOnce({ data: { success: true, data: [{ foo: 1 }] } });
    await expect(fetchEmployees()).rejects.toThrow('invalid employee record');

    mocked.post.mockResolvedValueOnce({ data: undefined });
    await expect(createEmployee({ name: 'Ada', email: 'a@x.com' })).rejects.toThrow();
  });
});
