import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchEmployees,
  fetchEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from '../../services/api/employee';
import type { Employee, UpdateEmployeeRequest } from './types';

export const employeeQueryKeys = {
  all: ['employees'] as const,
  list: () => [...employeeQueryKeys.all, 'list'] as const,
  detail: (id: string) => [...employeeQueryKeys.all, 'detail', id] as const,
};

export function useEmployees(enabled = true) {
  return useQuery({
    queryKey: employeeQueryKeys.list(),
    queryFn: fetchEmployees,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useEmployee(id: string | null | undefined) {
  return useQuery({
    queryKey: employeeQueryKeys.detail(id ?? ''),
    queryFn: () => fetchEmployee(id as string),
    enabled: !!id,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeQueryKeys.list() }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) => updateEmployee(id, data),
    retry: false,
    onSuccess: (updated, { id }) => {
      // Update/create responses carry an unpopulated roleId; keep the populated one from cache.
      queryClient.setQueryData<Employee[]>(employeeQueryKeys.list(), (old) =>
        old?.map((e) => (e._id === id ? { ...updated, roleId: e.roleId } : e))
      );
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.list() });
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.detail(id) });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmployee,
    retry: false,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Employee[]>(employeeQueryKeys.list(), (old) =>
        old?.filter((e) => e._id !== id)
      );
      queryClient.removeQueries({ queryKey: employeeQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: employeeQueryKeys.list() });
    },
  });
}

export type { Employee };
