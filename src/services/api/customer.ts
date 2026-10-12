import api from './client';
import { isRecord, pathId, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type {
  CreateCustomerIdentityRequest,
  CreateCustomerRequest,
  Customer,
  CustomerIdentity,
  CustomerListParams,
  UpdateCustomerRequest,
} from '../../features/customers/types';
import type { Conversation } from '../../features/conversations/types';

function assertHasId<T extends { _id: string }>(value: unknown, noun: string, label: string): T {
  if (!isRecord(value) || typeof value._id !== 'string') {
    throw new Error(`Received an invalid ${noun} record while ${label}.`);
  }
  return value as unknown as T;
}

function assertCustomer(value: unknown, label: string): Customer {
  const c = assertHasId<Customer>(value, 'customer', label);
  if (typeof c.name !== 'string') throw new Error(`Received an invalid customer record while ${label}.`);
  return c;
}

export async function fetchCustomers(params?: CustomerListParams): Promise<Customer[]> {
  const res = await api.get<ApiEnvelope<Customer[]>>('/customers/', { params });
  const data = unwrap(res.data, 'loading customers');
  if (!Array.isArray(data)) throw new Error('Received an invalid customer list.');
  return data.map((c) => assertCustomer(c, 'loading customers'));
}

export async function fetchCustomer(id: string): Promise<Customer> {
  const res = await api.get<ApiEnvelope<Customer>>(pathId('/customers', id, 'Customer'));
  return assertCustomer(unwrap(res.data, 'loading the customer'), 'loading the customer');
}

export async function createCustomer(payload: CreateCustomerRequest): Promise<Customer> {
  const res = await api.post<ApiEnvelope<Customer>>('/customers/', payload);
  return assertCustomer(unwrap(res.data, 'creating the customer'), 'creating the customer');
}

export async function updateCustomer(id: string, payload: UpdateCustomerRequest): Promise<Customer> {
  const res = await api.patch<ApiEnvelope<Customer>>(pathId('/customers', id, 'Customer'), payload);
  return assertCustomer(unwrap(res.data, 'updating the customer'), 'updating the customer');
}

/** Backend soft-deletes (isDeleted=true) and returns the record. */
export async function deleteCustomer(id: string): Promise<Customer> {
  const res = await api.delete<ApiEnvelope<Customer>>(pathId('/customers', id, 'Customer'));
  return assertCustomer(unwrap(res.data, 'deleting the customer'), 'deleting the customer');
}

export async function fetchCustomerIdentities(customerId: string): Promise<CustomerIdentity[]> {
  if (!customerId) throw new Error('Customer id is required.');
  const res = await api.get<ApiEnvelope<CustomerIdentity[]>>('/customer-identities/', {
    params: { customerId },
  });
  const data = unwrap(res.data, 'loading customer identities');
  if (!Array.isArray(data)) throw new Error('Received an invalid identity list.');
  return data.map((i) => assertHasId<CustomerIdentity>(i, 'identity', 'loading customer identities'));
}

export async function createCustomerIdentity(payload: CreateCustomerIdentityRequest): Promise<CustomerIdentity> {
  const res = await api.post<ApiEnvelope<CustomerIdentity>>('/customer-identities/', payload);
  return assertHasId<CustomerIdentity>(unwrap(res.data, 'linking the identity'), 'identity', 'linking the identity');
}

export async function deleteCustomerIdentity(id: string): Promise<CustomerIdentity> {
  const res = await api.delete<ApiEnvelope<CustomerIdentity>>(pathId('/customer-identities', id, 'Identity'));
  return assertHasId<CustomerIdentity>(unwrap(res.data, 'removing the identity'), 'identity', 'removing the identity');
}

/** Read-only conversation history for one customer (backend honours the `customerId` filter). */
export async function fetchCustomerConversations(customerId: string): Promise<Conversation[]> {
  if (!customerId) throw new Error('Customer id is required.');
  const res = await api.get<ApiEnvelope<Conversation[]>>('/conversations/', { params: { customerId } });
  const data = unwrap(res.data, 'loading conversations');
  if (!Array.isArray(data)) throw new Error('Received an invalid conversation list.');
  return data.map((c) => assertHasId<Conversation>(c, 'conversation', 'loading conversations'));
}
