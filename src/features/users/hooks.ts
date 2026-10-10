import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../services/api/employee';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../features/users/types';

export const employeeQueryKeys = {
  all: ['employees'] as const,
  list: () => [...employeeQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...employeeQueryKeys.all, 'detail', id] as const,
};

export function useEmployees() {
  return useQuery({
    queryKey: employeeQueryKeys.list(),
    queryFn: fetchEmployees,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeeQueryKeys.detail(id),
    queryFn: () => fetchEmployee(id),
    enabled: !!id,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.list() });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
      updateEmployee(id, data),
    onSuccess: (_updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.detail(id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.list() });
      queryClient.removeQueries({ queryKey: employeeQueryKeys.detail(id) });
    },
  });
}

export type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest };