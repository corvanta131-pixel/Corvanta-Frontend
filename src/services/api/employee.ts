import api from '../api/client';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../features/users/types';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

async function unwrap<T>(response: { data: ApiResponse<T> }): Promise<T> {
  if (!response.data.success) {
    throw new Error(response.data.message || 'API request failed');
  }
  return response.data.data;
}

export const employeeApi = {
  list: () => unwrap<Employee[]>(api.get<ApiResponse<Employee[]>>('/users/')),

  get: (id: string) => unwrap<Employee>(api.get<ApiResponse<Employee>>(`/users/${id}`)),

  create: (data: CreateEmployeeRequest) =>
    unwrap<Employee>(api.post<ApiResponse<Employee>>('/users/', data)),

  update: (id: string, data: UpdateEmployeeRequest) =>
    unwrap<Employee>(api.patch<ApiResponse<Employee>>(`/users/${id}`, data)),

  remove: (id: string) =>
    unwrap<{ _id: string; isDeleted: boolean }>(api.delete<ApiResponse<{ _id: string; isDeleted: boolean }>>(`/users/${id}`)),
};

export async function fetchEmployees(): Promise<Employee[]> {
  return employeeApi.list();
}

export async function fetchEmployee(id: string): Promise<Employee> {
  return employeeApi.get(id);
}

export async function createEmployee(data: CreateEmployeeRequest): Promise<Employee> {
  return employeeApi.create(data);
}

export async function updateEmployee(id: string, data: UpdateEmployeeRequest): Promise<Employee> {
  return employeeApi.update(id, data);
}

export async function deleteEmployee(id: string): Promise<{ _id: string; isDeleted: boolean }> {
  return employeeApi.remove(id);
}

export type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest };