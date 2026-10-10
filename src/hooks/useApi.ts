import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ping, get, post, put, del } from '../services/api';

export const queryKeys = {
  health: ['health'] as const,
};

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: ping,
  });
}

export function useGet<T>(key: readonly unknown[], url: string) {
  return useQuery({
    queryKey: key,
    queryFn: () => get<T>(url),
  });
}

export function usePost<T>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ url, data }: { url: string; data?: unknown }) =>
      post<T>(url, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function usePut<T>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ url, data }: { url: string; data?: unknown }) =>
      put<T>(url, data),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useDel<T>() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (url: string) => del<T>(url),
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}