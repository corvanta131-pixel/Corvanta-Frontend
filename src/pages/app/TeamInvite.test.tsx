import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { TeamPage } from './TeamPage';
import authReducer from '../../features/auth/authSlice';
import * as employeeApi from '../../services/api/employee';
import * as accountApi from '../../services/api/account';
import type { User } from '../../features/auth/types';
import type { Employee } from '../../features/users/types';

vi.mock('../../services/api/employee', () => ({
  fetchEmployees: vi.fn(),
  fetchEmployee: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}));
vi.mock('../../services/api/role', () => ({ fetchRoles: vi.fn() }));
vi.mock('../../services/api/account', () => ({
  requestPasswordReset: vi.fn(),
  completePasswordReset: vi.fn(),
  changePassword: vi.fn(),
  sendEmployeeInvite: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const employees = vi.mocked(employeeApi);
const account = vi.mocked(accountApi);

function makeUser(permissions: string[]): User {
  return {
    _id: 'user-1',
    companyId: 'company-1',
    name: 'Olivia Owner',
    email: 'olivia@x.com',
    roleId: { _id: 'role-1', companyId: 'company-1', name: 'Owner', slug: 'owner', permissions, isSystem: true, createdBy: null, createdAt: '', updatedAt: '', __v: 0 },
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

function person(over: Partial<Employee>): Employee {
  return {
    _id: 'x',
    companyId: 'company-1',
    name: 'Name',
    email: 'n@x.com',
    roleId: null,
    employeeCode: '',
    department: '',
    title: '',
    managerId: null,
    status: 'active',
    isEmailVerified: false,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    __v: 0,
    ...over,
  };
}

const ada = person({ _id: 'emp-2', name: 'Ada Lovelace', email: 'ada@x.com' });
const ben = person({ _id: 'emp-3', name: 'Ben Carter', email: 'ben@x.com', status: 'invited' });

function renderPage(permissions: string[]) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: makeUser(permissions), company: null, accessToken: 'a', refreshToken: 'r', isAuthenticated: true, isInitializing: false, isLoading: false, error: null } },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TeamPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

/** Waits for the table (the page shows a loading skeleton first). */
const findTable = async () => within(await screen.findByRole('table'));

describe('Team invitations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    employees.fetchEmployees.mockResolvedValue([ada, ben]);
  });

  it('offers an invite only to people who have not set a password yet', async () => {
    renderPage(['employees:read', 'employees:update']);
    const table = await findTable();
    await table.findByText('Ada Lovelace');
    expect(table.getByRole('button', { name: 'Send invite to Ben Carter' })).toBeInTheDocument();
    expect(table.queryByRole('button', { name: 'Send invite to Ada Lovelace' })).not.toBeInTheDocument();
  });

  it('sends the invite for the right person and reports the outcome honestly', async () => {
    const user = userEvent.setup();
    account.sendEmployeeInvite.mockResolvedValueOnce('Invitation sent.');
    renderPage(['employees:read', 'employees:update']);
    const table = await findTable();
    await user.click(await table.findByRole('button', { name: 'Send invite to Ben Carter' }));
    await waitFor(() => expect(account.sendEmployeeInvite).toHaveBeenCalledTimes(1));
    expect(account.sendEmployeeInvite.mock.calls[0]?.[0]).toBe('emp-3');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('An invitation was sent to ben@x.com.'));

    account.sendEmployeeInvite.mockRejectedValueOnce(new Error('Invitation emails are not set up on the server yet.'));
    await user.click(table.getByRole('button', { name: 'Send invite to Ben Carter' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Invitation emails are not set up on the server yet.'));
  });

  it('hides invite buttons without employees:update', async () => {
    renderPage(['employees:read']);
    const table = await findTable();
    await table.findByText('Ben Carter');
    expect(table.queryByRole('button', { name: /send invite/i })).not.toBeInTheDocument();
  });
});
