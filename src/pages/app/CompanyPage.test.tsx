import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { CompanyPage } from './CompanyPage';
import authReducer from '../../features/auth/authSlice';
import * as companiesHooks from '../../features/companies/hooks';
import type { Company, User } from '../../features/auth/types';

vi.mock('../../features/companies/hooks');

function createMockUser(overrides: Partial<User> = {}): User {
  return {
    _id: 'user-1',
    companyId: 'company-1',
    name: 'Louis Test',
    email: 'louis@test.com',
    roleId: {
      _id: 'role-1',
      companyId: 'company-1',
      name: 'Owner',
      slug: 'owner',
      permissions: ['companies:read', 'customers:read', 'employees:read'],
      isSystem: true,
      createdBy: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      __v: 0,
    },
    employeeCode: 'EMP001',
    department: 'Engineering',
    title: 'Developer',
    managerId: null,
    status: 'active',
    isEmailVerified: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    __v: 0,
    ...overrides,
  };
}

function createMockCompany(overrides: Partial<Company> = {}): Company {
  return {
    _id: 'company-1',
    name: 'Test Company',
    slug: 'test-company',
    industry: 'Technology',
    regionId: null,
    countryId: null,
    cityId: null,
    ownerId: 'user-1',
    status: 'active',
    isDeleted: false,
    createdAt: '2024-01-15',
    updatedAt: '2024-06-20',
    __v: 0,
    ...overrides,
  };
}

function renderWithProviders(
  ui: React.ReactNode,
  {
    preloadedState,
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: 0 } },
    }),
  }: {
    preloadedState?: unknown;
    queryClient?: QueryClient;
  } = {},
) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });

  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>{ui}</MemoryRouter>
      </QueryClientProvider>
    </Provider>,
  );
}

describe('CompanyPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders company information from valid data', async () => {
    const user = createMockUser();
    const company = createMockCompany();

    (companiesHooks.useCompany as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: company,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    (companiesHooks.useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: user,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<CompanyPage />, {
      preloadedState: {
        auth: {
          user,
          company,
          accessToken: 'token',
          refreshToken: 'refresh',
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
          error: null,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getAllByText('Test Company').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Technology').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/test-company/).length).toBeGreaterThan(0);
    expect(screen.getAllByText('active').length).toBeGreaterThan(0);
  });

  it('renders loading state while data loads', () => {
    const user = createMockUser();

    (companiesHooks.useCompany as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: vi.fn(),
    });
    (companiesHooks.useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    renderWithProviders(<CompanyPage />, {
      preloadedState: {
        auth: {
          user,
          company: createMockCompany(),
          accessToken: 'token',
          refreshToken: 'refresh',
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
          error: null,
        },
      },
    });

    expect(screen.getByText('Company')).toBeInTheDocument();
    const animateElements = document.querySelectorAll('.animate-pulse');
    expect(animateElements.length).toBeGreaterThan(0);
  });

  it('renders error state when company data fails to load', () => {
    const user = createMockUser();
    const refetchMock = vi.fn();

    (companiesHooks.useCompany as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: refetchMock,
    });
    (companiesHooks.useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<CompanyPage />, {
      preloadedState: {
        auth: {
          user,
          company: createMockCompany(),
          accessToken: 'token',
          refreshToken: 'refresh',
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
          error: null,
        },
      },
    });

    expect(screen.getByText('Unable to load company information')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });

  it('renders empty state when no company is returned', () => {
    const user = createMockUser();

    (companiesHooks.useCompany as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    (companiesHooks.useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: user,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<CompanyPage />, {
      preloadedState: {
        auth: {
          user,
          company: null,
          accessToken: 'token',
          refreshToken: 'refresh',
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
          error: null,
        },
      },
    });

    expect(screen.getByText('No company found')).toBeInTheDocument();
  });

  it('renders permission-restricted state when user lacks companies:read', () => {
    const user = createMockUser({
      roleId: {
        _id: 'role-2',
        companyId: 'company-1',
        name: 'Employee',
        slug: 'employee',
        permissions: ['customers:read'],
        isSystem: false,
        createdBy: null,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        __v: 0,
      },
    });

    (companiesHooks.useCompany as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    (companiesHooks.useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<CompanyPage />, {
      preloadedState: {
        auth: {
          user,
          company: createMockCompany(),
          accessToken: 'token',
          refreshToken: 'refresh',
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
          error: null,
        },
      },
    });

    expect(screen.getByText('Access restricted')).toBeInTheDocument();
  });

  it('renders user role and company context correctly', async () => {
    const user = createMockUser();
    const company = createMockCompany();

    (companiesHooks.useCompany as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: company,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    (companiesHooks.useCurrentUser as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: user,
      isLoading: false,
      isError: false,
    });

    renderWithProviders(<CompanyPage />, {
      preloadedState: {
        auth: {
          user,
          company,
          accessToken: 'token',
          refreshToken: 'refresh',
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
          error: null,
        },
      },
    });

    await waitFor(() => {
      expect(screen.getByText('Workspace')).toBeInTheDocument();
    });

    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.getByText('User → Role → Company')).toBeInTheDocument();
  });
});
