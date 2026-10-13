import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuditPage } from './AuditPage';
import authReducer from '../../features/auth/authSlice';
import * as api from '../../services/api/audit';
import type { User } from '../../features/auth/types';
import type { AuditPage as AuditPageData } from '../../features/audit/types';

vi.mock('../../services/api/audit', () => ({ fetchAuditLogs: vi.fn() }));
const mocked = vi.mocked(api);

function makeUser(permissions: string[]): User {
  return {
    _id: 'u1',
    companyId: 'c1',
    name: 'Olivia',
    email: 'o@x.com',
    roleId: {
      _id: 'r',
      companyId: 'c1',
      name: 'Owner',
      slug: 'owner',
      permissions,
      isSystem: true,
      createdBy: null,
      createdAt: '',
      updatedAt: '',
      __v: 0,
    },
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

function renderPage(permissions: string[] = ['audit:read']) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: makeUser(permissions),
        company: null,
        accessToken: 'a',
        refreshToken: 'r',
        isAuthenticated: true,
        isInitializing: false,
        isLoading: false,
        error: null,
      },
    },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <AuditPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

function pageOf(total: number, page = 1): AuditPageData {
  return {
    data: [
      {
        _id: `a${page}`,
        action: 'customer.created',
        entityType: 'Customer',
        entityId: 'cust-1',
        actor: { _id: 'u1', name: 'Olivia Owner', email: 'o@x.com' },
        metadata: { customerName: 'Ada', token: '[redacted]' },
        createdAt: '2025-01-02T10:00:00.000Z',
      },
    ],
    pagination: { page, limit: 25, total, totalPages: Math.max(1, Math.ceil(total / 25)) },
  };
}

const lastQuery = () => mocked.fetchAuditLogs.mock.calls.at(-1)?.[0];

describe('AuditPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.fetchAuditLogs.mockResolvedValue(pageOf(1));
  });

  it('is restricted and makes no request without audit:read', () => {
    renderPage(['customers:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(mocked.fetchAuditLogs).not.toHaveBeenCalled();
  });

  it('renders records with actor, action, record and redacted details', async () => {
    renderPage();
    const table = within(await screen.findByRole('table'));
    expect(table.getByText('Olivia Owner')).toBeInTheDocument();
    expect(table.getByText('customer.created')).toBeInTheDocument();
    expect(table.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText(/1 records/)).toBeInTheDocument();
    expect(lastQuery()).toMatchObject({ page: 1, limit: 25 });
  });

  it('shows loading, error with retry, and the empty state', async () => {
    const user = userEvent.setup();
    mocked.fetchAuditLogs.mockReturnValueOnce(new Promise(() => {}));
    const first = renderPage();
    expect(screen.getByRole('status', { name: /loading audit logs/i })).toBeInTheDocument();
    first.unmount();

    mocked.fetchAuditLogs.mockRejectedValueOnce(new Error('Audit store offline'));
    const second = renderPage();
    expect(await screen.findByText('Audit store offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('table')).toBeInTheDocument();
    second.unmount();

    mocked.fetchAuditLogs.mockResolvedValue({ data: [], pagination: { page: 1, limit: 25, total: 0, totalPages: 1 } });
    renderPage();
    expect(await screen.findByText('No activity recorded yet')).toBeInTheDocument();
  });

  it('paginates with the server-provided page count', async () => {
    const user = userEvent.setup();
    mocked.fetchAuditLogs.mockImplementation(async (q) => pageOf(60, q.page));
    renderPage();
    await screen.findByRole('table');
    expect(screen.getByText(/Page 1 of 3/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();

    await user.click(screen.getByRole('button', { name: /next/i }));
    await waitFor(() => expect(lastQuery()).toMatchObject({ page: 2 }));
    expect(await screen.findByText(/Page 2 of 3/)).toBeInTheDocument();
  });

  it('applies filters, resets to page 1, and clears them', async () => {
    const user = userEvent.setup();
    mocked.fetchAuditLogs.mockImplementation(async (q) => pageOf(60, q.page));
    renderPage();
    await screen.findByRole('table');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await screen.findByText(/Page 2 of 3/);

    await user.type(screen.getByLabelText('Action'), 'customer.created');
    await user.click(screen.getByRole('button', { name: 'Apply' }));
    await waitFor(() => expect(lastQuery()).toMatchObject({ page: 1, action: 'customer.created' }));

    await user.click(screen.getByRole('button', { name: 'Clear' }));
    await waitFor(() => expect(lastQuery()).toMatchObject({ page: 1, action: '' }));
  });

  it('refuses an inverted date range', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByRole('table');
    await user.type(screen.getByLabelText('From'), '2025-03-01');
    await user.type(screen.getByLabelText('To'), '2025-01-01');
    expect(screen.getByRole('alert')).toHaveTextContent(/on or before/i);
    expect(screen.getByRole('button', { name: 'Apply' })).toBeDisabled();
  });
});
