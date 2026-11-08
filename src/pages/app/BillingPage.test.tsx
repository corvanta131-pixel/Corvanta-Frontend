import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { BillingPage } from './BillingPage';
import authReducer from '../../features/auth/authSlice';
import * as billingApi from '../../services/api/billing';
import * as redirect from '../../utils/redirect';
import type { BillingOverview } from '../../services/api/billing';
import type { User } from '../../features/auth/types';

vi.mock('../../services/api/billing', () => ({ fetchBillingOverview: vi.fn(), checkout: vi.fn(), verifyPayment: vi.fn() }));
vi.mock('../../utils/redirect', () => ({ redirectTo: vi.fn() }));

const api = vi.mocked(billingApi);
const go = vi.mocked(redirect);

function makeUser(permissions: string[]): User {
  return {
    _id: 'u1',
    companyId: 'c1',
    name: 'Olivia',
    email: 'o@x.com',
    roleId: { _id: 'r', companyId: 'c1', name: 'Owner', slug: 'owner', permissions, isSystem: true, createdBy: null, createdAt: '', updatedAt: '', __v: 0 },
    employeeCode: '',
    department: '',
    title: '',
    managerId: null,
    status: 'active',
    isEmailVerified: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '',
    updatedAt: '',
    __v: 0,
  };
}

function overview(over: Partial<BillingOverview> = {}): BillingOverview {
  return {
    currency: 'NGN',
    paymentsConfigured: true,
    enforcement: false,
    subscription: { planId: 'free', planName: 'Free', status: 'free', periodEnd: null, expired: false },
    plans: [
      { id: 'free', name: 'Free', description: 'Try it', priceKobo: 0, limits: { agents: 1, teamMembers: 2, channels: 1, aiRepliesPerMonth: 200 }, current: true },
      { id: 'starter', name: 'Starter', description: 'Small teams', priceKobo: 1500000, limits: { agents: 2, teamMembers: 5, channels: 2, aiRepliesPerMonth: 2000 } },
      { id: 'growth', name: 'Growth', description: 'Growing teams', priceKobo: 4500000, limits: { agents: 5, teamMembers: 15, channels: 5, aiRepliesPerMonth: 10000 } },
    ],
    usage: [
      { key: 'agents', label: 'AI agents', used: 1, limit: 1, percent: 100 },
      { key: 'aiRepliesPerMonth', label: 'AI replies per month', used: 150, limit: 200, percent: 75 },
    ],
    ...over,
  };
}

const paid = (over: Partial<BillingOverview['subscription']> = {}) =>
  overview({
    subscription: { planId: 'starter', planName: 'Starter', status: 'active', periodEnd: '2030-05-20T12:00:00.000Z', expired: false, ...over },
    plans: overview().plans.map((p) => ({ ...p, current: p.id === 'starter' })),
  });

const REF = 'cv_abc123_1700000000_ab12cd34';

function renderPage(permissions: string[] = ['billing:read', 'billing:manage'], url = '/billing') {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: makeUser(permissions), company: null, accessToken: 'a', refreshToken: 'r', isAuthenticated: true, isInitializing: false, isLoading: false, error: null } },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[url]}>
          <BillingPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

const plans = async () => within(await screen.findByRole('list', { name: 'Plans' }));

describe('BillingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchBillingOverview.mockResolvedValue(overview());
  });

  it('is restricted and makes no request without billing:read', () => {
    renderPage([]);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(api.fetchBillingOverview).not.toHaveBeenCalled();
  });

  it('shows the Free plan without any made-up expiry date, with usage and the plan list', async () => {
    renderPage();
    expect(await screen.findByText('Your plan')).toBeInTheDocument();
    expect(screen.getByText('Free plan')).toBeInTheDocument();
    expect(screen.queryByText(/1970|Paid until|ended/)).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: 'AI replies per month used' })).toHaveAttribute('aria-valuenow', '150');
    expect(screen.getByText('Plan limits are shown but not enforced yet.')).toBeInTheDocument();
    const list = await plans();
    expect(list.getByText('Starter')).toBeInTheDocument();
    expect(list.getByText(/15,000/)).toBeInTheDocument();
    expect(list.getByText('Current plan')).toBeInTheDocument();
  });

  it('shows an active paid plan with its end date and says it does not renew by itself', async () => {
    api.fetchBillingOverview.mockResolvedValue(paid());
    renderPage();
    expect(await screen.findByText(/Paid until .*2030/)).toBeInTheDocument();
    expect(screen.getByText(/not renewed automatically/)).toBeInTheDocument();
    expect((await plans()).getByRole('button', { name: 'Choose Starter' })).toHaveTextContent('Add 30 days');
  });

  it('explains an expired plan', async () => {
    api.fetchBillingOverview.mockResolvedValue(
      overview({ subscription: { planId: 'free', planName: 'Free', status: 'expired', periodEnd: '2024-01-10T12:00:00.000Z', expired: true } })
    );
    renderPage();
    expect(await screen.findByText(/Your paid plan ended on .*2024. You are back on the Free plan/)).toBeInTheDocument();
  });

  it('says payments are not set up and disables buying, instead of letting a click fail', async () => {
    api.fetchBillingOverview.mockResolvedValue(overview({ paymentsConfigured: false }));
    renderPage();
    expect(await screen.findByText(/Payments are not set up on this server yet/)).toBeInTheDocument();
    expect((await plans()).getByRole('button', { name: 'Choose Starter' })).toBeDisabled();
  });

  it('starts checkout for the chosen plan and sends the browser to the payment page', async () => {
    const user = userEvent.setup();
    api.checkout.mockResolvedValue({ authorizationUrl: 'https://checkout.paystack.com/abc', reference: REF });
    renderPage();
    await user.click((await plans()).getByRole('button', { name: 'Choose Growth' }));
    await waitFor(() => expect(api.checkout).toHaveBeenCalledTimes(1));
    expect(api.checkout.mock.calls[0]?.[0]).toEqual({ planId: 'growth' });
    await waitFor(() => expect(go.redirectTo).toHaveBeenCalledWith('https://checkout.paystack.com/abc'));
  });

  it('shows a checkout failure on screen and does not navigate', async () => {
    const user = userEvent.setup();
    api.checkout.mockRejectedValue(new Error('Payments are not set up on the server yet (PAYSTACK_SECRET_KEY), so a plan cannot be bought.'));
    renderPage();
    await user.click((await plans()).getByRole('button', { name: 'Choose Starter' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/PAYSTACK_SECRET_KEY/);
    expect(go.redirectTo).not.toHaveBeenCalled();
  });

  it('shows an error if the payment page address is refused', async () => {
    const user = userEvent.setup();
    api.checkout.mockResolvedValue({ authorizationUrl: 'http://insecure.example', reference: REF });
    go.redirectTo.mockImplementation(() => {
      throw new Error('The payment page address was not valid.');
    });
    renderPage();
    await user.click((await plans()).getByRole('button', { name: 'Choose Starter' }));
    expect(await screen.findByText('The payment page address was not valid.')).toBeInTheDocument();
  });

  it('confirms the payment once when Paystack sends the customer back, then shows the new plan', async () => {
    api.verifyPayment.mockResolvedValue({ status: 'success', activated: true, overview: paid() });
    renderPage(['billing:read', 'billing:manage'], `/billing?reference=${REF}`);
    await waitFor(() => expect(api.verifyPayment).toHaveBeenCalledTimes(1));
    expect(api.verifyPayment.mock.calls[0]?.[0]).toEqual({ reference: REF });
    expect(await screen.findByText('Payment received. Your plan is now Starter.')).toBeInTheDocument();
    expect(await screen.findByText(/Paid until/)).toBeInTheDocument();
    expect(api.verifyPayment).toHaveBeenCalledTimes(1);
  });

  it('says honestly when a payment is still being confirmed, and lets you check again', async () => {
    const user = userEvent.setup();
    api.verifyPayment.mockResolvedValueOnce({ status: 'pending', activated: false, overview: overview() });
    renderPage(['billing:read', 'billing:manage'], `/billing?reference=${REF}`);
    expect(await screen.findByText(/still being confirmed/)).toBeInTheDocument();
    api.verifyPayment.mockResolvedValueOnce({ status: 'success', activated: true, overview: paid() });
    await user.click(screen.getByRole('button', { name: 'Check again' }));
    await waitFor(() => expect(api.verifyPayment).toHaveBeenCalledTimes(2));
    expect(await screen.findByText(/Payment received/)).toBeInTheDocument();
  });

  it('reports a payment that did not go through without changing the plan', async () => {
    api.verifyPayment.mockResolvedValue({ status: 'failed', activated: false, overview: overview() });
    renderPage(['billing:read', 'billing:manage'], `/billing?reference=${REF}`);
    expect(await screen.findByText(/did not go through, so your plan was not changed/)).toBeInTheDocument();
    expect(screen.getByText('Free plan')).toBeInTheDocument();
  });

  it('shows the server reason when confirmation itself fails, with a retry', async () => {
    const user = userEvent.setup();
    api.verifyPayment.mockRejectedValueOnce(new Error('The payment provider could not confirm this payment yet.'));
    renderPage(['billing:read', 'billing:manage'], `/billing?reference=${REF}`);
    expect(await screen.findByText('The payment provider could not confirm this payment yet.')).toBeInTheDocument();
    api.verifyPayment.mockResolvedValueOnce({ status: 'success', activated: true, overview: paid() });
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText(/Payment received/)).toBeInTheDocument();
  });

  it('ignores a reference that is not one of ours', async () => {
    renderPage(['billing:read', 'billing:manage'], '/billing?reference=not-ours');
    await screen.findByText('Your plan');
    expect(api.verifyPayment).not.toHaveBeenCalled();
  });

  it('lets someone with only billing:read look but not buy', async () => {
    renderPage(['billing:read']);
    expect(await screen.findByText(/Only people who can manage billing can change the plan/)).toBeInTheDocument();
    expect((await plans()).queryByRole('button', { name: /Choose/ })).not.toBeInTheDocument();
  });

  it('shows a loading error with retry', async () => {
    const user = userEvent.setup();
    api.fetchBillingOverview.mockRejectedValueOnce(new Error('Billing offline'));
    renderPage();
    expect(await screen.findByText('Billing offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Your plan')).toBeInTheDocument();
  });
});
