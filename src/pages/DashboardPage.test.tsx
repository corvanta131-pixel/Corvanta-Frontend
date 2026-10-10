import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../pages/DashboardPage';
import authReducer from '../features/auth/authSlice';

function renderWithProviders(
  ui: React.ReactNode,
  {
    preloadedState,
    store = configureStore({
      reducer: { auth: authReducer },
      preloadedState,
    }),
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    }),
  }: {
    preloadedState?: unknown;
    store?: ReturnType<typeof configureStore>;
    queryClient?: QueryClient;
  } = {},
) {
  return {
    ...render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>{ui}</MemoryRouter>
        </QueryClientProvider>
      </Provider>,
    ),
    store,
    queryClient,
  };
}

describe('DashboardPage', () => {
  it('renders authenticated user information', () => {
    const user = {
      _id: 'user-1',
      companyId: 'company-1',
      name: 'Louis Test',
      email: 'louis@test.com',
      roleId: { _id: 'role-1', slug: 'owner', name: 'Owner', permissions: ['customers:read', 'conversations:read', 'agents:read', 'channels:read', 'knowledge:read', 'workflows:read', 'employees:read', 'companies:read', 'audit:read', 'settings:read'] },
      employeeCode: 'EMP001',
      department: 'Engineering',
      title: 'Developer',
      managerId: null,
      status: 'active' as const,
      isEmailVerified: true,
      isDeleted: false,
      lastLoginAt: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      __v: 0,
    };

    const company = {
      _id: 'company-1',
      name: 'Test Company',
      slug: 'test-company',
      industry: 'Technology',
      regionId: null,
      countryId: null,
      cityId: null,
      ownerId: 'user-1',
      status: 'active' as const,
      isDeleted: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      __v: 0,
    };

    renderWithProviders(<DashboardPage />, {
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

    expect(screen.getByText(/Louis Test/)).toBeInTheDocument();
    expect(screen.getByText(/Test Company/)).toBeInTheDocument();
  });

  it('renders loading skeletons while data is loading', () => {
    const user = {
      _id: 'user-1',
      companyId: 'company-1',
      name: 'Test User',
      email: 'test@example.com',
      roleId: { _id: 'role-1', slug: 'owner', name: 'Owner', permissions: [] },
      employeeCode: 'EMP001',
      department: 'Engineering',
      title: 'Developer',
      managerId: null,
      status: 'active' as const,
      isEmailVerified: true,
      isDeleted: false,
      lastLoginAt: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      __v: 0,
    };

    renderWithProviders(<DashboardPage />, {
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

    expect(screen.getByText(/Test User/)).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2, name: /Quick Actions/i })).toHaveLength(1);
  });

  it('shows empty state when no conversations', async () => {
    const user = {
      _id: 'user-1',
      companyId: 'company-1',
      name: 'Test User',
      email: 'test@example.com',
      roleId: { _id: 'role-1', slug: 'owner', name: 'Owner', permissions: ['conversations:read'] },
      employeeCode: 'EMP001',
      department: 'Engineering',
      title: 'Developer',
      managerId: null,
      status: 'active' as const,
      isEmailVerified: true,
      isDeleted: false,
      lastLoginAt: null,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      __v: 0,
    };

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          staleTime: 0,
        },
      },
    });

    queryClient.setQueryData(['dashboard', 'stats'], {
      customers: [],
      conversations: [],
      agents: [],
      channels: [],
      knowledgeBases: [],
      workflows: [],
      employees: [],
    });

    renderWithProviders(<DashboardPage />, {
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
      queryClient,
    });

    await waitFor(() => {
      expect(screen.getByText(/No conversations yet/)).toBeInTheDocument();
    });
  });
});
