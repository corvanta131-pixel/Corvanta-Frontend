import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { SettingsPage } from './SettingsPage';
import authReducer from '../../features/auth/authSlice';
import * as accountApi from '../../services/api/account';
import type { User } from '../../features/auth/types';

vi.mock('../../services/api/account', () => ({
  requestPasswordReset: vi.fn(),
  completePasswordReset: vi.fn(),
  changePassword: vi.fn(),
  sendEmployeeInvite: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const account = vi.mocked(accountApi);

const user: User = {
  _id: 'u1',
  companyId: 'c1',
  name: 'Olivia Owner',
  email: 'olivia@x.com',
  roleId: { _id: 'r', companyId: 'c1', name: 'Owner', slug: 'owner', permissions: ['*'], isSystem: true, createdBy: null, createdAt: '', updatedAt: '', __v: 0 },
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

function renderPage() {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user, company: null, accessToken: 'a', refreshToken: 'r', isAuthenticated: true, isInitializing: false, isLoading: false, error: null } },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

async function fill(typist: ReturnType<typeof userEvent.setup>, current: string, next: string, confirm: string) {
  await typist.type(screen.getByLabelText('Current password'), current);
  await typist.type(screen.getByLabelText('New password'), next);
  await typist.type(screen.getByLabelText('Confirm new password'), confirm);
  await typist.click(screen.getByRole('button', { name: 'Change password' }));
}

describe('SettingsPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the signed-in account and says what cannot be edited yet', () => {
    renderPage();
    expect(screen.getByText('Olivia Owner')).toBeInTheDocument();
    expect(screen.getByText('olivia@x.com')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText(/cannot be edited here yet/i)).toBeInTheDocument();
  });

  it('checks the form before calling the server', async () => {
    const typist = userEvent.setup();
    renderPage();
    await fill(typist, 'old-password-1', 'short', 'other');
    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('The passwords do not match')).toBeInTheDocument();
    expect(account.changePassword).not.toHaveBeenCalled();
  });

  it('refuses a new password equal to the current one', async () => {
    const typist = userEvent.setup();
    renderPage();
    await fill(typist, 'same-password-1', 'same-password-1', 'same-password-1');
    expect(await screen.findByText('Choose a password different from your current one')).toBeInTheDocument();
    expect(account.changePassword).not.toHaveBeenCalled();
  });

  it('changes the password with the exact payload, confirms only after success, and clears the form', async () => {
    const typist = userEvent.setup();
    account.changePassword.mockResolvedValue('Your password was changed.');
    renderPage();
    await fill(typist, 'old-password-1', 'brand-new-pass-1', 'brand-new-pass-1');
    await waitFor(() => expect(account.changePassword).toHaveBeenCalledTimes(1));
    expect(account.changePassword.mock.calls[0]).toEqual(['old-password-1', 'brand-new-pass-1']);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Your password was changed.'));
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveValue(''));
  });

  it('shows the server reason and keeps what was typed when the current password is wrong', async () => {
    const typist = userEvent.setup();
    account.changePassword.mockRejectedValue(new Error('Your current password is incorrect.'));
    renderPage();
    await fill(typist, 'wrong-password-1', 'brand-new-pass-1', 'brand-new-pass-1');
    expect(await screen.findByText('Your current password is incorrect.')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText('New password')).toHaveValue('brand-new-pass-1');
  });
});
