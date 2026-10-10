import api from './client';
import type { Company, User } from '../../features/auth/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function getCompanyInternal<T>(url: string): Promise<T> {
  const response = await api.get<ApiResponse<T>>(url);
  if (!response.data.success) {
    throw new Error(response.data.message || 'API request failed');
  }
  return response.data.data;
}

export const companyApi = {
  getCompany: () => getCompanyInternal<Company>('/companies/'),
};

export async function fetchCompany(): Promise<Company> {
  return companyApi.getCompany();
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get<ApiResponse<User>>('/users/me');
  if (!response.data.success) {
    throw new Error(response.data.message || 'API request failed');
  }
  return response.data.data;
}

export type { Company };