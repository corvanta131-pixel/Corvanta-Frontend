import { useMutation } from '@tanstack/react-query';
import { changePassword, completePasswordReset, requestPasswordReset, sendEmployeeInvite } from '../../services/api/account';

export function useRequestPasswordReset() {
  return useMutation({ mutationFn: requestPasswordReset, retry: false });
}

export function useCompletePasswordReset() {
  return useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) => completePasswordReset(token, password),
    retry: false,
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      changePassword(currentPassword, newPassword),
    retry: false,
  });
}

export function useSendInvite() {
  return useMutation({ mutationFn: sendEmployeeInvite, retry: false });
}
