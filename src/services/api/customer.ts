import { apiClient } from './client';

export interface Customer {
  _id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'prospect' | 'archived';
  notes?: string;
  metadata?: Record<string, unknown>;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'prospect' | 'archived';
  notes?: string;
}

export interface UpdateCustomerRequest {
  name: string;
  email?: string;
  phone?: string;
  status?: 'active' | 'inactive' | 'prospect' | 'archived';
  notes?: string;
}

export async function listCustomers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: Customer['status'];
}): Promise<{ data: Customer[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.page) query.append('page', String(params.page));
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.search) query.append('search', params.search);
  if (params?.status) query.append('status', params.status);

  return apiClient.get(`/customers?${query.toString()}`);
}

export async function getCustomer(id: string): Promise<Customer> {
  return apiClient.get(`/customers/${id}`);
}

export async function createCustomer(data: CreateCustomerRequest): Promise<Customer> {
  return apiClient.post('/customers', data);
}

export async function updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
  return apiClient.put(`/customers/${id}`, data);
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}