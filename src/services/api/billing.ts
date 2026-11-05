import api from './client';
import { unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';

export interface PlanUsage {
  key: string;
  label: string;
  used: number;
  limit: number;
  percent: number;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  priceKobo: number;
  limits: { agents: number; teamMembers: number; channels: number; aiRepliesPerMonth: number };
  current?: boolean;
}

export interface SubscriptionSummary {
  planId: string;
  planName: string;
  status: string;
  periodEnd: string | null;
  expired: boolean;
}

export interface BillingOverview {
  currency: string;
  paymentsConfigured: boolean;
  enforcement: boolean;
  subscription: SubscriptionSummary;
  plans: Plan[];
  usage: PlanUsage[];
}

export interface CheckoutRequest {
  planId: string;
}

export interface CheckoutResponse {
  authorizationUrl: string;
  reference: string;
}

export interface VerifyRequest {
  reference: string;
}

export interface VerifyResponse {
  status: string;
  activated: boolean;
  overview: BillingOverview;
}

export async function fetchBillingOverview(): Promise<BillingOverview> {
  const res = await api.get<ApiEnvelope<BillingOverview>>('/billing/');
  const data = unwrap(res.data, 'loading billing overview');
  if (!data || typeof data !== 'object') throw new Error('Received an invalid billing overview.');
  return data;
}

export async function checkout(payload: CheckoutRequest): Promise<CheckoutResponse> {
  const res = await api.post<ApiEnvelope<CheckoutResponse>>('/billing/checkout', payload);
  const data = unwrap(res.data, 'starting checkout');
  if (!data || typeof data.authorizationUrl !== 'string') throw new Error('Received an invalid checkout response.');
  return data;
}

export async function verifyPayment(payload: VerifyRequest): Promise<VerifyResponse> {
  const res = await api.post<ApiEnvelope<VerifyResponse>>('/billing/verify', payload);
  const data = unwrap(res.data, 'verifying payment');
  if (!data) throw new Error('Received an invalid verification response.');
  return data;
}
