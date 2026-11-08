import { useMutation } from '@tanstack/react-query';
import { updateCompanyProfile, updateMyName } from '../../services/api/profile';

export function useUpdateMyName() {
  return useMutation({ mutationFn: updateMyName, retry: false });
}

export function useUpdateCompany() {
  return useMutation({ mutationFn: updateCompanyProfile, retry: false });
}
