import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchCustomerIdentities,
  createCustomerIdentity,
  deleteCustomerIdentity,
  fetchCustomerConversations,
} from '../../services/api/customer';
import type { Customer, UpdateCustomerRequest } from './types';

export const customerQueryKeys = {
  all: ['customers'] as const,
  list: () => [...customerQueryKeys.all, 'list'] as const,
  identities: (customerId: string) => [...customerQueryKeys.all, 'identities', customerId] as const,
  conversations: (customerId: string) => [...customerQueryKeys.all, 'conversations', customerId] as const,
};

export function useCustomerList(enabled = true) {
  return useQuery({
    queryKey: customerQueryKeys.list(),
    queryFn: () => fetchCustomers(),
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomer,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerQueryKeys.list() }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) => updateCustomer(id, data),
    retry: false,
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData<Customer[]>(customerQueryKeys.list(), (old) =>
        old?.map((c) => (c._id === id ? updated : c))
      );
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.list() });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomer,
    retry: false,
    onSuccess: (_result, id) => {
      queryClient.setQueryData<Customer[]>(customerQueryKeys.list(), (old) => old?.filter((c) => c._id !== id));
      queryClient.removeQueries({ queryKey: customerQueryKeys.identities(id) });
      queryClient.removeQueries({ queryKey: customerQueryKeys.conversations(id) });
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.list() });
    },
  });
}

export function useCustomerIdentities(customerId: string | null, enabled = true) {
  return useQuery({
    queryKey: customerQueryKeys.identities(customerId ?? ''),
    queryFn: () => fetchCustomerIdentities(customerId as string),
    enabled: enabled && !!customerId,
    refetchOnWindowFocus: false,
  });
}

export function useCreateCustomerIdentity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCustomerIdentity,
    retry: false,
    onSuccess: (created) =>
      queryClient.invalidateQueries({ queryKey: customerQueryKeys.identities(created.customerId) }),
  });
}

export function useDeleteCustomerIdentity(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCustomerIdentity,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerQueryKeys.identities(customerId) }),
  });
}

export function useCustomerConversations(customerId: string | null, enabled = true) {
  return useQuery({
    queryKey: customerQueryKeys.conversations(customerId ?? ''),
    queryFn: () => fetchCustomerConversations(customerId as string),
    enabled: enabled && !!customerId,
    refetchOnWindowFocus: false,
  });
}
