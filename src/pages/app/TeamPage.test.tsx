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
import * as api from '../../services/api/employee';
import * as roleApi from '../../services/api/role';
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
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const mocked = vi.mocked(api);
const mockedRoles = vi.mocked(roleApi);

function makeUser(permissions: string[]): User {
  return {
    _id: 'user-1',
    companyId: 'company-1',
    name: 'Olivia Owner',
    email: 'olivia@x.com',
    roleId: {
      _id: 'role-1',
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

function emp(overrides: Partial<Employee>): Employee {
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
    ...overrides,
  };
}

const olivia = emp({ _id: 'user-1', name: 'Olivia Owner', email: 'olivia@x.com', department: 'Management', title: 'Owner' });
const ada = emp({ _id: 'emp-2', name: 'Ada Lovelace', email: 'ada@x.com', department: 'Support', title: 'Agent' });
const ben = emp({ _id: 'emp-3', name: 'Ben Carter', email: 'ben@x.com', department: 'Sales', title: 'Lead', status: 'invited' });
const all = [olivia, ada, ben];

const ALL_PERMS = ['employees:read', 'employees:create', 'employees:update', 'employees:delete'];

function renderPage(permissions: string[] = ALL_PERMS) {
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
          <TeamPage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

const table = () => within(screen.getByRole('table'));

describe('TeamPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.fetchEmployees.mockResolvedValue(all);
    mockedRoles.fetchRoles.mockResolvedValue([]);
  });

  it('renders employees returned by the API with a real count', async () => {
    renderPage();
    expect(await table().findByText('Ada Lovelace')).toBeInTheDocument();
    expect(table().getByText('Ben Carter')).toBeInTheDocument();
    expect(table().getByText('Invited')).toBeInTheDocument();
    expect(screen.getByText('3 team members')).toBeInTheDocument();
  });

  it('shows a loading state while the request is pending', () => {
    mocked.fetchEmployees.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole('status', { name: /loading team members/i })).toBeInTheDocument();
  });

  it('shows an empty state when there are no employees', async () => {
    mocked.fetchEmployees.mockResolvedValue([]);
    renderPage();
    expect(await screen.findByText('No employees yet')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows an error (not an empty list) on failure and recovers on retry', async () => {
    const user = userEvent.setup();
    mocked.fetchEmployees.mockRejectedValueOnce(new Error('Database offline'));
    renderPage();
    expect(await screen.findByText('Database offline')).toBeInTheDocument();
    expect(screen.queryByText('No employees yet')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await table().findByText('Ada Lovelace')).toBeInTheDocument();
    expect(mocked.fetchEmployees).toHaveBeenCalledTimes(2);
  });

  it('blocks the view and makes no API request without employees:read', () => {
    renderPage(['customers:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(mocked.fetchEmployees).not.toHaveBeenCalled();
  });

  it('honours the backend "*" wildcard permission', async () => {
    renderPage(['*']);
    expect(await table().findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument();
  });

  it('searches case-insensitively and reports when nothing matches', async () => {
    const user = userEvent.setup();
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.type(screen.getByLabelText('Search employees'), 'ADA');
    expect(table().getByText('Ada Lovelace')).toBeInTheDocument();
    expect(table().queryByText('Ben Carter')).not.toBeInTheDocument();
    expect(screen.getByText(/showing 1/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search employees'));
    await user.type(screen.getByLabelText('Search employees'), 'zzz');
    expect(screen.getByText('No matching employees')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /clear filters/i }));
    expect(await table().findByText('Ben Carter')).toBeInTheDocument();
  });

  it('filters by status and department', async () => {
    const user = userEvent.setup();
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.selectOptions(screen.getByLabelText('Filter by status'), 'invited');
    expect(table().getByText('Ben Carter')).toBeInTheDocument();
    expect(table().queryByText('Ada Lovelace')).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Filter by status'), '');
    await user.selectOptions(screen.getByLabelText('Filter by department'), 'Support');
    expect(table().getByText('Ada Lovelace')).toBeInTheDocument();
    expect(table().queryByText('Ben Carter')).not.toBeInTheDocument();
  });

  it('hides create, edit and delete controls for a read-only user', async () => {
    renderPage(['employees:read']);
    await table().findByText('Ada Lovelace');
    expect(screen.queryByRole('button', { name: /add employee/i })).not.toBeInTheDocument();
    expect(table().queryByRole('button', { name: /^edit /i })).not.toBeInTheDocument();
    expect(table().queryByRole('button', { name: /^delete /i })).not.toBeInTheDocument();
  });

  it('creates an employee with the exact payload and confirms only after success', async () => {
    const user = userEvent.setup();
    mocked.createEmployee.mockResolvedValue(emp({ _id: 'emp-9', name: 'Grace Hopper', email: 'grace@x.com' }));
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(screen.getByRole('button', { name: /add employee/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/name \*/i), 'Grace Hopper');
    await user.type(within(dialog).getByLabelText(/email \*/i), 'grace@x.com');
    await user.type(within(dialog).getByLabelText(/department/i), 'Support');
    await user.click(within(dialog).getByRole('button', { name: /create employee/i }));

    await waitFor(() => expect(mocked.createEmployee).toHaveBeenCalledTimes(1));
    expect(mocked.createEmployee.mock.calls[0]?.[0]).toEqual({
      name: 'Grace Hopper',
      email: 'grace@x.com',
      status: 'active',
      managerId: null,
      department: 'Support',
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Grace Hopper was added to your team.'));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('offers company roles when permitted and sends the chosen roleId', async () => {
    const user = userEvent.setup();
    mockedRoles.fetchRoles.mockResolvedValue([
      { _id: 'role-9', name: 'Support Lead', slug: 'support-lead', permissions: [], isSystem: false, createdAt: '', updatedAt: '' },
    ]);
    mocked.createEmployee.mockResolvedValue(emp({ _id: 'emp-9', name: 'Grace Hopper', email: 'grace@x.com' }));
    renderPage([...ALL_PERMS, 'roles:read']);
    await table().findByText('Ada Lovelace');

    await user.click(screen.getByRole('button', { name: /add employee/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/name \*/i), 'Grace Hopper');
    await user.type(within(dialog).getByLabelText(/email \*/i), 'grace@x.com');
    await user.selectOptions(await within(dialog).findByLabelText('Role'), 'role-9');
    await user.type(within(dialog).getByLabelText(/initial password/i), 'longenough1');
    await user.click(within(dialog).getByRole('button', { name: /create employee/i }));

    await waitFor(() => expect(mocked.createEmployee).toHaveBeenCalledTimes(1));
    expect(mocked.createEmployee.mock.calls[0]?.[0]).toEqual({
      name: 'Grace Hopper',
      email: 'grace@x.com',
      status: 'active',
      managerId: null,
      roleId: 'role-9',
      password: 'longenough1',
    });
  });

  it('does not request roles without roles:read', async () => {
    renderPage();
    await table().findByText('Ada Lovelace');
    expect(mockedRoles.fetchRoles).not.toHaveBeenCalled();
  });

  it('keeps the form open and shows the server error when creation fails', async () => {
    const user = userEvent.setup();
    mocked.createEmployee.mockRejectedValue(new Error('An employee with this email already exists in this company.'));
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(screen.getByRole('button', { name: /add employee/i }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText(/name \*/i), 'Ada Again');
    await user.type(within(dialog).getByLabelText(/email \*/i), 'ada@x.com');
    await user.click(within(dialog).getByRole('button', { name: /create employee/i }));

    expect(await within(dialog).findByText(/already exists/i)).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('does not submit an invalid create form', async () => {
    const user = userEvent.setup();
    renderPage();
    await table().findByText('Ada Lovelace');
    await user.click(screen.getByRole('button', { name: /add employee/i }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /create employee/i }));
    expect(await screen.findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(mocked.createEmployee).not.toHaveBeenCalled();
  });

  it('prefills edit mode and submits the required name and email', async () => {
    const user = userEvent.setup();
    mocked.updateEmployee.mockResolvedValue({ ...ada, name: 'Ada King' });
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(table().getByRole('button', { name: 'Edit Ada Lovelace' }));
    const dialog = screen.getByRole('dialog');
    const nameInput = within(dialog).getByLabelText(/name \*/i);
    expect(nameInput).toHaveValue('Ada Lovelace');
    expect(within(dialog).getByLabelText(/email \*/i)).toHaveValue('ada@x.com');

    await user.clear(nameInput);
    await user.type(nameInput, 'Ada King');
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(mocked.updateEmployee).toHaveBeenCalledTimes(1));
    expect(mocked.updateEmployee.mock.calls[0]?.[0]).toBe('emp-2');
    expect(mocked.updateEmployee.mock.calls[0]?.[1]).toEqual({
      name: 'Ada King',
      email: 'ada@x.com',
      department: 'Support',
      title: 'Agent',
      status: 'active',
      managerId: null,
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Ada King was updated.'));
  });

  it('requires confirmation before deleting and does nothing on cancel', async () => {
    const user = userEvent.setup();
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(table().getByRole('button', { name: 'Delete Ada Lovelace' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('Ada Lovelace')).toBeInTheDocument();
    expect(mocked.deleteEmployee).not.toHaveBeenCalled();

    await user.click(within(dialog).getByRole('button', { name: /cancel/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(mocked.deleteEmployee).not.toHaveBeenCalled();
    expect(table().getByText('Ada Lovelace')).toBeInTheDocument();
  });

  it('deletes after confirmation and removes the employee from the list', async () => {
    const user = userEvent.setup();
    mocked.fetchEmployees.mockResolvedValueOnce(all).mockResolvedValue([olivia, ben]);
    mocked.deleteEmployee.mockResolvedValue({ ...ada, isDeleted: true, status: 'disabled' });
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(table().getByRole('button', { name: 'Delete Ada Lovelace' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /remove employee/i }));

    await waitFor(() => expect(mocked.deleteEmployee).toHaveBeenCalledTimes(1));
    expect(mocked.deleteEmployee.mock.calls[0]?.[0]).toBe('emp-2');
    await waitFor(() => expect(table().queryByText('Ada Lovelace')).not.toBeInTheDocument());
    expect(toast.success).toHaveBeenCalledWith('Ada Lovelace was removed from your team.');
  });

  it('keeps the employee and shows an error when deletion fails', async () => {
    const user = userEvent.setup();
    mocked.deleteEmployee.mockRejectedValue(new Error('Employee not found.'));
    renderPage();
    await table().findByText('Ada Lovelace');

    await user.click(table().getByRole('button', { name: 'Delete Ada Lovelace' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /remove employee/i }));

    expect(await within(dialog).findByText('Employee not found.')).toBeInTheDocument();
    expect(table().getByText('Ada Lovelace')).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('does not offer to delete the signed-in user', async () => {
    renderPage();
    await table().findByText('Olivia Owner');
    expect(table().queryByRole('button', { name: 'Delete Olivia Owner' })).not.toBeInTheDocument();
    expect(table().getByRole('button', { name: 'Delete Ben Carter' })).toBeInTheDocument();
  });

  it('opens the detail dialog with real fields and no placeholder text', async () => {
    const user = userEvent.setup();
    renderPage();
    await table().findByText('Ben Carter');
    await user.click(table().getByRole('button', { name: 'View details for Ben Carter' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('ben@x.com')).toBeInTheDocument();
    expect(within(dialog).getByText('No manager assigned')).toBeInTheDocument();
    expect(within(dialog).getByText('Never')).toBeInTheDocument();
    expect(dialog.textContent).not.toMatch(/undefined|null/);
  });
});
