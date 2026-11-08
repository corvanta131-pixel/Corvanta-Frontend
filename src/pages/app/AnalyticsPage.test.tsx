import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AnalyticsPage, formatDuration } from './AnalyticsPage';
import authReducer from '../../features/auth/authSlice';
import * as analyticsApi from '../../services/api/analytics';
import type { User } from '../../features/auth/types';
import type { AnalyticsSummary } from '../../features/analytics/types';

vi.mock('../../services/api/analytics', () => ({ fetchAnalytics: vi.fn() }));
const api = vi.mocked(analyticsApi);

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

function summary(over: Partial<AnalyticsSummary> = {}): AnalyticsSummary {
  return {
    range: { from: '2026-03-01T00:00:00.000Z', to: '2026-03-03T23:59:59.999Z' },
    conversations: {
      total: 12,
      byStatus: { open: 7, resolved: 5 },
      byChannel: { whatsapp: 8, webchat: 3, email: 1 },
      byHandling: { AI: 9, HUMAN: 3 },
      perDay: [
        { date: '2026-03-01', count: 2 },
        { date: '2026-03-02', count: 7 },
        { date: '2026-03-03', count: 3 },
      ],
    },
    messages: {
      total: 40,
      fromCustomers: 20,
      fromAI: 15,
      fromTeam: 5,
      perDay: [
        { date: '2026-03-01', customers: 4, ai: 3, team: 1 },
        { date: '2026-03-02', customers: 10, ai: 8, team: 3 },
        { date: '2026-03-03', customers: 6, ai: 4, team: 1 },
      ],
    },
    responseTime: { averageSeconds: 260, conversationsMeasured: 9 },
    customers: { new: 5, total: 120 },
    ...over,
  };
}

function renderPage(permissions: string[] = ['analytics:read']) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: makeUser(permissions), company: null, accessToken: 'a', refreshToken: 'r', isAuthenticated: true, isInitializing: false, isLoading: false, error: null } },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AnalyticsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

describe('formatDuration', () => {
  it('reads naturally', () => {
    expect(formatDuration(43)).toBe('43s');
    expect(formatDuration(260)).toBe('4m 20s');
    expect(formatDuration(7500)).toBe('2h 5m');
  });
});

describe('AnalyticsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchAnalytics.mockResolvedValue(summary());
  });

  it('is restricted and makes no request without analytics:read', () => {
    renderPage([]);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(api.fetchAnalytics).not.toHaveBeenCalled();
  });

  it('shows the key numbers from the server', async () => {
    renderPage();
    const kpis = within(await screen.findByRole('region', { name: 'Key numbers' }));
    expect(kpis.getByText('12')).toBeInTheDocument();
    expect(kpis.getByText('40')).toBeInTheDocument();
    expect(kpis.getByText('4m 20s')).toBeInTheDocument();
    expect(kpis.getByText(/Across 9 conversations/)).toBeInTheDocument();
    expect(kpis.getByText('5')).toBeInTheDocument();
    expect(kpis.getByText('120 in total')).toBeInTheDocument();
    expect(api.fetchAnalytics.mock.calls[0]?.[0]).toBe(30);
  });

  it('shows readable breakdowns by channel, status, who answered and handling', async () => {
    renderPage();
    const channels = within(await screen.findByRole('list', { name: 'Conversations by channel' }));
    expect(channels.getByText('WhatsApp')).toBeInTheDocument();
    expect(channels.getByText('Website chat')).toBeInTheDocument();
    expect(channels.getByText('8')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Who answered' })).getByText('AI replies')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'Conversations by status' })).getByText('Resolved')).toBeInTheDocument();
    expect(within(screen.getByRole('list', { name: 'How conversations are handled' })).getByText('AI answers')).toBeInTheDocument();
  });

  it('describes each chart in words for people who cannot see it', async () => {
    renderPage();
    expect(await screen.findByRole('img', { name: /Conversations per day: 12 in total, busiest day 2026-03-02 with 7/ })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /20 from customers, 15 from the AI, 5 from your team/ })).toBeInTheDocument();
    expect(screen.getAllByText(/Days are counted in UTC/).length).toBeGreaterThan(0);
  });

  it('does not invent a response time when there is none', async () => {
    api.fetchAnalytics.mockResolvedValue(summary({ responseTime: { averageSeconds: null, conversationsMeasured: 0 } }));
    renderPage();
    expect(await screen.findByText('—')).toBeInTheDocument();
    expect(screen.getByText(/No conversation had both a customer message and a reply/)).toBeInTheDocument();
  });

  it('shows a friendly empty state for a quiet period', async () => {
    api.fetchAnalytics.mockResolvedValue(
      summary({
        conversations: { total: 0, byStatus: {}, byChannel: {}, byHandling: {}, perDay: [{ date: '2026-03-01', count: 0 }] },
        messages: { total: 0, fromCustomers: 0, fromAI: 0, fromTeam: 0, perDay: [{ date: '2026-03-01', customers: 0, ai: 0, team: 0 }] },
        responseTime: { averageSeconds: null, conversationsMeasured: 0 },
        customers: { new: 0, total: 3 },
      })
    );
    renderPage();
    expect(await screen.findByText('No conversations in this period yet')).toBeInTheDocument();
  });

  it('asks the server again when the time range changes', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('region', { name: 'Key numbers' });
    await user.selectOptions(screen.getByLabelText('Time range'), '7');
    await screen.findByRole('region', { name: 'Key numbers' });
    expect(api.fetchAnalytics.mock.calls.map((c) => c[0])).toContain(7);
  });

  it('shows an error with retry', async () => {
    const user = userEvent.setup();
    api.fetchAnalytics.mockRejectedValueOnce(new Error('Analytics offline'));
    renderPage();
    expect(await screen.findByText('Analytics offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('region', { name: 'Key numbers' })).toBeInTheDocument();
  });
});
