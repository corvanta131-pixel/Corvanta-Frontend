import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from './client';
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchCustomerIdentities,
  createCustomerIdentity,
  deleteCustomerIdentity,
  fetchCustomerConversations,
} from './customer';

const mocked = vi.mocked(api);
const rec = { _id: 'c1', name: 'Ada', status: 'active' };
const ok = (data: unknown) => ({ data: { success: true, data } });

describe('customer API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses explicit methods and paths', async () => {
    mocked.get.mockResolvedValue(ok([rec]));
    await fetchCustomers({ status: 'prospect' });
    expect(mocked.get).toHaveBeenCalledWith('/customers/', { params: { status: 'prospect' } });

    mocked.get.mockResolvedValue(ok(rec));
    await fetchCustomer('c1');
    expect(mocked.get).toHaveBeenLastCalledWith('/customers/c1');

    mocked.post.mockResolvedValue(ok(rec));
    await createCustomer({ name: 'Ada', email: 'a@x.com' });
    expect(mocked.post).toHaveBeenCalledWith('/customers/', { name: 'Ada', email: 'a@x.com' });

    mocked.patch.mockResolvedValue(ok(rec));
    await updateCustomer('c1', { name: 'Ada L' });
    expect(mocked.patch).toHaveBeenCalledWith('/customers/c1', { name: 'Ada L' });

    mocked.delete.mockResolvedValue(ok(rec));
    await deleteCustomer('c1');
    expect(mocked.delete).toHaveBeenCalledWith('/customers/c1');
  });

  it('scopes identity and conversation lookups by customerId and encodes ids', async () => {
    mocked.get.mockResolvedValue(ok([{ _id: 'i1' }]));
    await fetchCustomerIdentities('c1');
    expect(mocked.get).toHaveBeenCalledWith('/customer-identities/', { params: { customerId: 'c1' } });

    mocked.get.mockResolvedValue(ok([{ _id: 'v1' }]));
    await fetchCustomerConversations('c1');
    expect(mocked.get).toHaveBeenLastCalledWith('/conversations/', { params: { customerId: 'c1' } });

    mocked.post.mockResolvedValue(ok({ _id: 'i2' }));
    const body = { customerId: 'c1', channelType: 'sms' as const, externalId: '+234' };
    await createCustomerIdentity(body);
    expect(mocked.post).toHaveBeenCalledWith('/customer-identities/', body);

    mocked.delete.mockResolvedValue(ok({ _id: 'i2' }));
    await deleteCustomerIdentity('a/b');
    expect(mocked.delete).toHaveBeenCalledWith('/customer-identities/a%2Fb');
  });

  it('rejects empty ids before any request and malformed responses afterwards', async () => {
    await expect(fetchCustomer('')).rejects.toThrow('Customer id is required.');
    await expect(fetchCustomerIdentities('')).rejects.toThrow('Customer id is required.');
    expect(mocked.get).not.toHaveBeenCalled();

    mocked.get.mockResolvedValueOnce({ data: { success: false, message: 'Denied', data: [] } });
    await expect(fetchCustomers()).rejects.toThrow('Denied');
    mocked.get.mockResolvedValueOnce(ok({ not: 'list' }));
    await expect(fetchCustomers()).rejects.toThrow('invalid customer list');
    mocked.get.mockResolvedValueOnce(ok([{ foo: 1 }]));
    await expect(fetchCustomers()).rejects.toThrow('invalid customer record');
  });
});
