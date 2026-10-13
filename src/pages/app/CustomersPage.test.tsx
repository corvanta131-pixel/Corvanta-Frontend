import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { CustomersPage } from './CustomersPage';
import authReducer from '../../features/auth/authSlice';
import * as api from '../../services/api/customer';
import type { User } from '../../features/auth/types';
import type { Customer } from '../../features/customers/types';

vi.mock('../../services/api/customer', () => ({
  fetchCustomers: vi.fn(),
  fetchCustomer: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
  fetchCustomerIdentities: vi.fn(),
  createCustomerIdentity: vi.fn(),
  deleteCustomerIdentity: vi.fn(),
  fetchCustomerConversations: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mocked = vi.mocked(api);

function makeUser(permissions: string[]): User {
  return {
    _id: 'user-1',
    companyId: 'company-1',
    name: 'Olivia',
    email: 'o@x.com',
    roleId: {
      _id: 'r',
      companyId: 'company-1',
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

function cust(o: Partial<Customer>): Customer {
  return {
    _id: 'x',
    companyId: 'company-1',
    name: 'Name',
    email: '',
    phone: '',
    status: 'active',
    isDeleted: false,
    deletedAt: null,
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
    ...o,
  };
}

const ada = cust({ _id: 'c-1', name: 'Ada Lovelace', email: 'ada@x.com', phone: '+2348011111111', notes: 'VIP client' });
const ben = cust({ _id: 'c-2', name: 'Ben Carter', email: 'ben@x.com', status: 'prospect' });
const all = [ada, ben];

const ALL = [
  'customers:read',
  'customers:create',
  'customers:update',
  'customers:delete',
  'customer-identities:read',
  'customer-identities:create',
  'customer-identities:delete',
  'conversations:read',
];

function renderPage(permissions: string[] = ALL) {
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
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <CustomersPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

const table = () => within(screen.getByRole('table'));

describe('CustomersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.fetchCustomers.mockResolvedValue(all);
    mocked.fetchCustomerIdentities.mockResolvedValue([]);
    mocked.fetchCustomerConversations.mockResolvedValue([]);
  });

  it('renders customers from the API with a real count', async () => {
    renderPage();
    expect(await table().findByText('Ada Lovelace')).toBeInTheDocument();
    expect(table().getByText('Prospect')).toBeInTheDocument();
    expect(screen.getByText('2 customers')).toBeInTheDocument();
  });

  it('shows loading, empty and error states distinctly', async () => {
    mocked.fetchCustomers.mockReturnValue(new Promise(() => {}));
    const { unmount } = renderPage();
    expect(screen.getByRole('status', { name: /loading customers/i })).toBeInTheDocument();
    unmount();

    mocked.fetchCustomers.mockResolvedValue([]);
    const second = renderPage();
    expect(await screen.findByText('No customers yet')).toBeInTheDocument();
    second.unmount();

    mocked.fetchCustomers.mockRejectedValue(new Error('Boom'));
    renderPage();
    expect(await screen.findByText('Boom')).toBeInTheDocument();
    expect(screen.queryByText('No customers yet')).not.toBeInTheDocument();
  });

  it('retries after a failure', async () => {
    const user = userEvent.setup();
    mocked.fetchCustomers.mockRejectedValueOnce(new Error('Offline'));
    renderPage();
    await screen.findByText('Offline');
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await table().findByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('is restricted and makes no request without customers:read', () => {
    renderPage(['employees:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(mocked.fetchCustomers).not.toHaveBeenCalled();
  });

  it('searches and filters by status, and reports no matches', async () => {
    const user = userEvent.setup();
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.type(screen.getByLabelText('Search customers'), 'ben@');
    expect(table().getByText('Ben Carter')).toBeInTheDocument();
    expect(table().queryByText('Ada Lovelace')).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search customers'));
    await user.selectOptions(screen.getByLabelText('Filter by status'), 'active');
    expect(table().getByText('Ada Lovelace')).toBeInTheDocument();
    expect(table().queryByText('Ben Carter')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Search customers'), 'zzz');
    expect(screen.getByText('No matching customers')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(await table().findByText('Ben Carter')).toBeInTheDocument();
  });

  it('hides write controls for a read-only user', async () => {
    renderPage(['customers:read']);
    await table().findByText('Ada Lovelace');
    expect(screen.queryByRole('button', { name: /add customer/i })).not.toBeInTheDocument();
    expect(table().queryByRole('button', { name: /^edit /i })).not.toBeInTheDocument();
    expect(table().queryByRole('button', { name: /^delete /i })).not.toBeInTheDocument();
  });

  it('creates a customer with the exact payload, confirming only after success', async () => {
    const user = userEvent.setup();
    mocked.createCustomer.mockResolvedValue(cust({ _id: 'c-9', name: 'Grace Hopper' }));
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(screen.getByRole('button', { name: /add customer/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/name \*/i), 'Grace Hopper');
    await user.type(within(dialog).getByLabelText(/email \*/i), 'grace@x.com');
    await user.click(within(dialog).getByRole('button', { name: /create customer/i }));

    await waitFor(() => expect(mocked.createCustomer).toHaveBeenCalledTimes(1));
    expect(mocked.createCustomer.mock.calls[0]?.[0]).toEqual({
      name: 'Grace Hopper',
      status: 'active',
      email: 'grace@x.com',
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Grace Hopper was added.'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the form open with the server error when creation fails', async () => {
    const user = userEvent.setup();
    mocked.createCustomer.mockRejectedValue(new Error('A customer with this email already exists in this company.'));
    renderPage();
    await table().findByText('Ada Lovelace');
    await user.click(screen.getByRole('button', { name: /add customer/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/name \*/i), 'Ada Again');
    await user.type(within(dialog).getByLabelText(/email \*/i), 'ada@x.com');
    await user.click(within(dialog).getByRole('button', { name: /create customer/i }));
    expect(await within(dialog).findByText(/already exists/i)).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('prefills edit mode and submits the required name', async () => {
    const user = userEvent.setup();
    mocked.updateCustomer.mockResolvedValue({ ...ada, name: 'Ada King' });
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(table().getByRole('button', { name: 'Edit Ada Lovelace' }));
    const dialog = screen.getByRole('dialog');
    const name = within(dialog).getByLabelText(/name \*/i);
    expect(name).toHaveValue('Ada Lovelace');
    expect(within(dialog).getByLabelText(/notes/i)).toHaveValue('VIP client');
    await user.clear(name);
    await user.type(name, 'Ada King');
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(mocked.updateCustomer).toHaveBeenCalledTimes(1));
    expect(mocked.updateCustomer.mock.calls[0]?.[0]).toBe('c-1');
    expect(mocked.updateCustomer.mock.calls[0]?.[1]).toEqual({
      name: 'Ada King',
      status: 'active',
      email: 'ada@x.com',
      phone: '+2348011111111',
      notes: 'VIP client',
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Ada King was updated.'));
  });

  it('requires confirmation to delete; cancel does nothing; confirm removes it', async () => {
    const user = userEvent.setup();
    mocked.fetchCustomers.mockResolvedValueOnce(all).mockResolvedValue([ben]);
    mocked.deleteCustomer.mockResolvedValue({ ...ada, isDeleted: true });
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(table().getByRole('button', { name: 'Delete Ada Lovelace' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));
    expect(mocked.deleteCustomer).not.toHaveBeenCalled();

    await user.click(table().getByRole('button', { name: 'Delete Ada Lovelace' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /remove customer/i }));
    await waitFor(() => expect(mocked.deleteCustomer).toHaveBeenCalledTimes(1));
    expect(mocked.deleteCustomer.mock.calls[0]?.[0]).toBe('c-1');
    await waitFor(() => expect(table().queryByText('Ada Lovelace')).not.toBeInTheDocument());
  });

  it('keeps the customer and shows the error when deletion fails', async () => {
    const user = userEvent.setup();
    mocked.deleteCustomer.mockRejectedValue(new Error('Customer not found.'));
    renderPage();
    await table().findByText('Ada Lovelace');
    await user.click(table().getByRole('button', { name: 'Delete Ada Lovelace' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /remove customer/i }));
    expect(await within(dialog).findByText('Customer not found.')).toBeInTheDocument();
    expect(table().getByText('Ada Lovelace')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('shows details with identities and conversation history from the API', async () => {
    const user = userEvent.setup();
    mocked.fetchCustomerIdentities.mockResolvedValue([
      {
        _id: 'i-1',
        companyId: 'company-1',
        customerId: 'c-1',
        channelType: 'whatsapp',
        externalId: '+2348011111111',
        isDeleted: false,
        createdAt: '',
        updatedAt: '',
      },
    ]);
    mocked.fetchCustomerConversations.mockResolvedValue([
      {
        _id: 'v-1',
        companyId: 'company-1',
        customerId: 'c-1',
        channelType: 'whatsapp',
        title: 'Order enquiry',
        status: 'open',
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-03T00:00:00.000Z',
      },
    ]);
    renderPage();
    await table().findByText('Ada Lovelace');
    await user.click(table().getByRole('button', { name: 'View details for Ada Lovelace' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('VIP client')).toBeInTheDocument();
    expect(await within(dialog).findByText('+2348011111111', { selector: 'span' })).toBeInTheDocument();
    expect(await within(dialog).findByText('Order enquiry')).toBeInTheDocument();
    expect(mocked.fetchCustomerIdentities).toHaveBeenCalledWith('c-1');
    expect(mocked.fetchCustomerConversations).toHaveBeenCalledWith('c-1');
  });

  it('does not request identities or conversations without those permissions', async () => {
    const user = userEvent.setup();
    renderPage(['customers:read']);
    await table().findByText('Ada Lovelace');
    await user.click(table().getByRole('button', { name: 'View details for Ada Lovelace' }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(mocked.fetchCustomerIdentities).not.toHaveBeenCalled();
    expect(mocked.fetchCustomerConversations).not.toHaveBeenCalled();
  });

  it('links a new channel identity with the exact payload', async () => {
    const user = userEvent.setup();
    mocked.createCustomerIdentity.mockResolvedValue({
      _id: 'i-2',
      companyId: 'company-1',
      customerId: 'c-1',
      channelType: 'sms',
      externalId: '+2347000000000',
      isDeleted: false,
      createdAt: '',
      updatedAt: '',
    });
    renderPage();
    await table().findByText('Ada Lovelace');
    await user.click(table().getByRole('button', { name: 'View details for Ada Lovelace' }));
    const dialog = screen.getByRole('dialog');

    await within(dialog).findByText('No channel identities linked yet.');
    await user.selectOptions(within(dialog).getByLabelText('Channel'), 'sms');
    await user.type(within(dialog).getByLabelText('Identifier'), '+2347000000000');
    await user.click(within(dialog).getByRole('button', { name: /link identity/i }));
    await waitFor(() => expect(mocked.createCustomerIdentity).toHaveBeenCalledTimes(1));
    expect(mocked.createCustomerIdentity.mock.calls[0]?.[0]).toEqual({
      customerId: 'c-1',
      channelType: 'sms',
      externalId: '+2347000000000',
    });
  });
});
