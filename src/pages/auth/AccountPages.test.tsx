import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ForgotPasswordPage } from './ForgotPasswordPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import * as accountApi from '../../services/api/account';

vi.mock('../../services/api/account', () => ({
  requestPasswordReset: vi.fn(),
  completePasswordReset: vi.fn(),
  changePassword: vi.fn(),
  sendEmployeeInvite: vi.fn(),
}));
const account = vi.mocked(accountApi);

const TOKEN = 'a'.repeat(64);

function renderAt(ui: React.ReactElement, url: string) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[url]}>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('validates the email before asking the server', async () => {
    const user = userEvent.setup();
    renderAt(<ForgotPasswordPage />, '/forgot-password');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(account.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('sends the address and shows the same cautious confirmation either way', async () => {
    const user = userEvent.setup();
    account.requestPasswordReset.mockResolvedValue('If an account exists for that email, a reset link is on its way.');
    renderAt(<ForgotPasswordPage />, '/forgot-password');
    await user.type(screen.getByLabelText('Email'), 'ada@x.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    await waitFor(() => expect(account.requestPasswordReset).toHaveBeenCalledTimes(1));
    expect(account.requestPasswordReset.mock.calls[0]?.[0]).toBe('ada@x.com');
    expect(await screen.findByRole('status')).toHaveTextContent(/If an account exists/);
    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login');
  });

  it('shows the server problem (for example email not set up) and keeps the address', async () => {
    const user = userEvent.setup();
    account.requestPasswordReset.mockRejectedValue(new Error('Password reset emails are not set up on the server yet. Please contact support.'));
    renderAt(<ForgotPasswordPage />, '/forgot-password');
    await user.type(screen.getByLabelText('Email'), 'ada@x.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText(/not set up on the server yet/)).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toHaveValue('ada@x.com');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});

describe('ResetPasswordPage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('explains a missing or damaged link without showing the form', () => {
    renderAt(<ResetPasswordPage />, '/reset-password');
    expect(screen.getByText(/incomplete or damaged/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new one' })).toHaveAttribute('href', '/forgot-password');
    expect(screen.queryByLabelText('New password')).not.toBeInTheDocument();
  });

  it('rejects a token that does not look like ours', () => {
    renderAt(<ResetPasswordPage />, '/reset-password?token=short');
    expect(screen.getByText(/incomplete or damaged/i)).toBeInTheDocument();
  });

  it('checks the new password locally', async () => {
    const user = userEvent.setup();
    renderAt(<ResetPasswordPage />, `/reset-password?token=${TOKEN}`);
    await user.type(screen.getByLabelText('New password'), 'short');
    await user.type(screen.getByLabelText('Confirm new password'), 'different');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));
    expect(await screen.findByText('Use at least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('The passwords do not match')).toBeInTheDocument();
    expect(account.completePasswordReset).not.toHaveBeenCalled();
  });

  it('sends the token and password, then offers sign in', async () => {
    const user = userEvent.setup();
    account.completePasswordReset.mockResolvedValue('Your password was updated.');
    renderAt(<ResetPasswordPage />, `/reset-password?token=${TOKEN}`);
    await user.type(screen.getByLabelText('New password'), 'BrandNewPass1');
    await user.type(screen.getByLabelText('Confirm new password'), 'BrandNewPass1');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));
    await waitFor(() => expect(account.completePasswordReset).toHaveBeenCalledTimes(1));
    expect(account.completePasswordReset.mock.calls[0]).toEqual([TOKEN, 'BrandNewPass1']);
    expect(await screen.findByRole('status')).toHaveTextContent('Your password was updated.');
    expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
  });

  it('shows the server reason and a way to get a new link when the link has expired', async () => {
    const user = userEvent.setup();
    account.completePasswordReset.mockRejectedValue(new Error('This link is invalid or has expired. Please request a new one.'));
    renderAt(<ResetPasswordPage />, `/reset-password?token=${TOKEN}`);
    await user.type(screen.getByLabelText('New password'), 'BrandNewPass1');
    await user.type(screen.getByLabelText('Confirm new password'), 'BrandNewPass1');
    await user.click(screen.getByRole('button', { name: 'Save new password' }));
    expect(await screen.findByText(/invalid or has expired/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute('href', '/forgot-password');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
