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
import * as profileApi from '../../services/api/profile';
import type { Company, User } from '../../features/auth/types';

vi.mock('../../services/api/account', () => ({ requestPasswordReset: vi.fn(), completePasswordReset: vi.fn(), changePassword: vi.fn(), sendEmployeeInvite: vi.fn() }));
vi.mock('../../services/api/profile', () => ({ updateMyName: vi.fn(), updateCompanyProfile: vi.fn() }));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const account = vi.mocked(accountApi);
const profile = vi.mocked(profileApi);

function makeUser(permissions: string[]): User {
  return {
    _id: 'u1',
    companyId: 'c1',
    name: 'Olivia Owner',
    email: 'olivia@x.com',
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

const company: Company = {
  _id: 'c1',
  name: 'Acme Ltd',
  slug: 'acme',
  industry: 'Retail',
  regionId: null,
  countryId: null,
  cityId: null,
  ownerId: 'u1',
  status: 'active',
  isDeleted: false,
  createdAt: '',
  updatedAt: '',
  __v: 0,
};

function renderPage(permissions: string[] = ['*'], withCompany: Company | null = company) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: { user: makeUser(permissions), company: withCompany, accessToken: 'a', refreshToken: 'r', isAuthenticated: true, isInitializing: false, isLoading: false, error: null } },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <SettingsPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
  return { store };
}

async function fillPassword(typist: ReturnType<typeof userEvent.setup>, current: string, next: string, confirm: string) {
  await typist.type(screen.getByLabelText('Current password'), current);
  await typist.type(screen.getByLabelText('New password'), next);
  await typist.type(screen.getByLabelText('Confirm new password'), confirm);
  await typist.click(screen.getByRole('button', { name: 'Change password' }));
}

describe('SettingsPage: your account', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows the name in an editable field and the email and role as read-only', () => {
    renderPage();
    expect(screen.getByLabelText('Your name')).toHaveValue('Olivia Owner');
    expect(screen.getByText('olivia@x.com')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText(/email and role are managed by a workspace owner/i)).toBeInTheDocument();
  });

  it('saves a new name with the exact value and updates the signed-in user', async () => {
    const typist = userEvent.setup();
    profile.updateMyName.mockResolvedValue({ name: 'Olivia Obi', email: 'olivia@x.com' });
    const { store } = renderPage();
    const field = screen.getByLabelText('Your name');
    await typist.clear(field);
    await typist.type(field, '  Olivia Obi ');
    await typist.click(screen.getByRole('button', { name: 'Save name' }));
    await waitFor(() => expect(profile.updateMyName).toHaveBeenCalledTimes(1));
    expect(profile.updateMyName.mock.calls[0]?.[0]).toBe('Olivia Obi');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Your name was updated.'));
    expect(store.getState().auth.user?.name).toBe('Olivia Obi');
  });

  it('refuses a too-short name and shows server errors without changing anything', async () => {
    const typist = userEvent.setup();
    profile.updateMyName.mockRejectedValue(new Error('Name must be 2-120 characters.'));
    const { store } = renderPage();
    const field = screen.getByLabelText('Your name');
    await typist.clear(field);
    await typist.type(field, 'O');
    await typist.click(screen.getByRole('button', { name: 'Save name' }));
    expect(await screen.findByText('Use at least 2 characters')).toBeInTheDocument();
    expect(profile.updateMyName).not.toHaveBeenCalled();

    await typist.type(field, 'k');
    await typist.click(screen.getByRole('button', { name: 'Save name' }));
    expect(await screen.findByText('Name must be 2-120 characters.')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
    expect(store.getState().auth.user?.name).toBe('Olivia Owner');
  });
});

describe('SettingsPage: company', () => {
  beforeEach(() => vi.clearAllMocks());

  it('lets someone with companies:update edit the name and industry, and updates the stored company', async () => {
    const typist = userEvent.setup();
    profile.updateCompanyProfile.mockResolvedValue({ ...company, name: 'Acme Retail', industry: 'Fashion' });
    const { store } = renderPage();
    expect(screen.getByLabelText('Company name')).toHaveValue('Acme Ltd');
    expect(screen.getByLabelText('Industry')).toHaveValue('Retail');
    const name = screen.getByLabelText('Company name');
    const industry = screen.getByLabelText('Industry');
    await typist.clear(name);
    await typist.type(name, 'Acme Retail');
    await typist.clear(industry);
    await typist.type(industry, 'Fashion');
    await typist.click(screen.getByRole('button', { name: 'Save company' }));
    await waitFor(() => expect(profile.updateCompanyProfile).toHaveBeenCalledTimes(1));
    expect(profile.updateCompanyProfile.mock.calls[0]?.[0]).toEqual({ name: 'Acme Retail', industry: 'Fashion' });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Company details were updated.'));
    expect(store.getState().auth.company?.name).toBe('Acme Retail');
  });

  it('checks the fields and shows server errors', async () => {
    const typist = userEvent.setup();
    profile.updateCompanyProfile.mockRejectedValue(new Error('Company not found.'));
    renderPage();
    const name = screen.getByLabelText('Company name');
    await typist.clear(name);
    await typist.type(name, 'A');
    await typist.click(screen.getByRole('button', { name: 'Save company' }));
    expect(await screen.findAllByText('Use at least 2 characters')).not.toHaveLength(0);
    expect(profile.updateCompanyProfile).not.toHaveBeenCalled();
    await typist.type(name, 'cme');
    await typist.click(screen.getByRole('button', { name: 'Save company' }));
    expect(await screen.findByText('Company not found.')).toBeInTheDocument();
  });

  it('shows the company read-only without companies:update', () => {
    renderPage(['settings:read']);
    expect(screen.queryByLabelText('Company name')).not.toBeInTheDocument();
    expect(screen.getByText('Acme Ltd')).toBeInTheDocument();
    expect(screen.getByText(/Only people who can manage the company can edit/)).toBeInTheDocument();
  });

  it('says so when the company details are not available', () => {
    renderPage(['*'], null);
    expect(screen.getByText(/Company details are not available/)).toBeInTheDocument();
  });
});

describe('SettingsPage: change password', () => {
  beforeEach(() => vi.clearAllMocks());

  it('checks the form before calling the server', async () => {
    const typist = userEvent.setup();
    renderPage();
    await fillPassword(typist, 'old-password-1', 'short', 'other');
    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('The passwords do not match')).toBeInTheDocument();
    expect(account.changePassword).not.toHaveBeenCalled();
  });

  it('refuses a new password equal to the current one', async () => {
    const typist = userEvent.setup();
    renderPage();
    await fillPassword(typist, 'same-password-1', 'same-password-1', 'same-password-1');
    expect(await screen.findByText('Choose a password different from your current one')).toBeInTheDocument();
    expect(account.changePassword).not.toHaveBeenCalled();
  });

  it('changes the password with the exact payload, confirms only after success, and clears the form', async () => {
    const typist = userEvent.setup();
    account.changePassword.mockResolvedValue('Your password was changed.');
    renderPage();
    await fillPassword(typist, 'old-password-1', 'brand-new-pass-1', 'brand-new-pass-1');
    await waitFor(() => expect(account.changePassword).toHaveBeenCalledTimes(1));
    expect(account.changePassword.mock.calls[0]).toEqual(['old-password-1', 'brand-new-pass-1']);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Your password was changed.'));
    await waitFor(() => expect(screen.getByLabelText('Current password')).toHaveValue(''));
  });

  it('shows the server reason and keeps what was typed when the current password is wrong', async () => {
    const typist = userEvent.setup();
    account.changePassword.mockRejectedValue(new Error('Your current password is incorrect.'));
    renderPage();
    await fillPassword(typist, 'wrong-password-1', 'brand-new-pass-1', 'brand-new-pass-1');
    expect(await screen.findByText('Your current password is incorrect.')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText('New password')).toHaveValue('brand-new-pass-1');
  });
});
