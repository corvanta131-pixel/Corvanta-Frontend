import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkout, fetchBillingOverview, verifyPayment } from '../../services/api/billing';

export const billingQueryKeys = { overview: ['billing', 'overview'] as const };

export function useBillingOverview(enabled = true) {
  return useQuery({
    queryKey: billingQueryKeys.overview,
    queryFn: fetchBillingOverview,
    enabled,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  });
}

export function useCheckout() {
  return useMutation({ mutationFn: checkout, retry: false });
}

/** Confirming a payment returns the refreshed overview, so the screen updates without another request. */
export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyPayment,
    retry: false,
    onSuccess: (result) => {
      queryClient.setQueryData(billingQueryKeys.overview, result.overview);
    },
  });
}
