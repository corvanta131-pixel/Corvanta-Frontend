import api from './client';
import { unwrap } from './envelope';
import type {
  ApiEnvelope,
  CreateEmployeeRequest,
  Employee,
  UpdateEmployeeRequest,
} from '../../features/users/types';

function assertEmployee(value: unknown, label: string): Employee {
  if (
    typeof value !== 'object' ||
    value === null ||
    typeof (value as Employee)._id !== 'string' ||
    typeof (value as Employee).name !== 'string' ||
    typeof (value as Employee).email !== 'string'
  ) {
    throw new Error(`Received an invalid employee record while ${label}.`);
  }
  return value as Employee;
}

function employeePath(id: string): string {
  if (!id) throw new Error('Employee id is required.');
  return `/users/${encodeURIComponent(id)}`;
}

export async function fetchEmployees(): Promise<Employee[]> {
  const res = await api.get<ApiEnvelope<Employee[]>>('/users/');
  const data = unwrap(res.data, 'loading employees');
  if (!Array.isArray(data)) throw new Error('Received an invalid employee list.');
  return data.map((e) => assertEmployee(e, 'loading employees'));
}

export async function fetchEmployee(id: string): Promise<Employee> {
  const res = await api.get<ApiEnvelope<Employee>>(employeePath(id));
  return assertEmployee(unwrap(res.data, 'loading the employee'), 'loading the employee');
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<Employee> {
  const res = await api.post<ApiEnvelope<Employee>>('/users/', payload);
  return assertEmployee(unwrap(res.data, 'creating the employee'), 'creating the employee');
}

export async function updateEmployee(id: string, payload: UpdateEmployeeRequest): Promise<Employee> {
  const res = await api.patch<ApiEnvelope<Employee>>(employeePath(id), payload);
  return assertEmployee(unwrap(res.data, 'updating the employee'), 'updating the employee');
}

/** Backend soft-deletes (isDeleted=true, status=disabled) and returns the employee record. */
export async function deleteEmployee(id: string): Promise<Employee> {
  const res = await api.delete<ApiEnvelope<Employee>>(employeePath(id));
  return assertEmployee(unwrap(res.data, 'deleting the employee'), 'deleting the employee');
}

export const employeeApi = {
  list: fetchEmployees,
  get: fetchEmployee,
  create: createEmployee,
  update: updateEmployee,
  remove: deleteEmployee,
};
