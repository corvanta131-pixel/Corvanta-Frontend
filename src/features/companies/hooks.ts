import { useQuery } from '@tanstack/react-query';
import { fetchCompany, fetchCurrentUser } from '../../services/api/company';
import type { Company, User } from '../../features/auth/types';

export function useCompany() {
  return useQuery({
    queryKey: ['company'],
    queryFn: fetchCompany,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: fetchCurrentUser,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

export function useCompanyData() {
  return useQuery({
    queryKey: ['company', 'detailed'],
    queryFn: fetchCompany,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}

export type { Company, User };