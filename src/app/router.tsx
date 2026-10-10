import { createBrowserRouter } from 'react-router-dom';
import { AuthInitializer } from '../features/auth/AuthInitializer';
import { ProtectedRoute, PublicRoute } from './router/index';
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';
import { DashboardPage } from '../pages/DashboardPage';
import { HomePage } from '../pages/public/HomePage';
import { PublicLayout } from '../layouts';
import { AppLayout } from '../components/layout/AppLayout';
import { CompanyPage } from '../pages/app/CompanyPage';
import { ServicesPage } from '../pages/app/ServicesPage';
import { TeamPage } from '../pages/app/TeamPage';
import { CustomersPage } from '../pages/app/CustomersPage';
import { InboxPage } from '../pages/app/InboxPage';
import { AgentsPage } from '../pages/app/AgentsPage';
import { ChannelsPage } from '../pages/app/ChannelsPage';
import { KnowledgePage } from '../pages/app/KnowledgePage';
import { WorkflowsPage } from '../pages/app/WorkflowsPage';
import { AuditPage } from '../pages/app/AuditPage';
import { SettingsPage } from '../pages/app/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AuthInitializer />,
    children: [
      {
        index: true,
        element: (
          <PublicLayout>
            <HomePage />
          </PublicLayout>
        ),
      },
      {
        element: <PublicRoute />,
        children: [
          { path: 'login', element: <LoginPage /> },
          { path: 'register', element: <RegisterPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <AppLayout />,
            children: [
              { path: 'dashboard', element: <DashboardPage /> },
              { path: 'company', element: <CompanyPage /> },
              { path: 'services', element: <ServicesPage /> },
              { path: 'team', element: <TeamPage /> },
              { path: 'customers', element: <CustomersPage /> },
              { path: 'inbox', element: <InboxPage /> },
              { path: 'agents', element: <AgentsPage /> },
              { path: 'channels', element: <ChannelsPage /> },
              { path: 'knowledge', element: <KnowledgePage /> },
              { path: 'workflows', element: <WorkflowsPage /> },
              { path: 'audit', element: <AuditPage /> },
              { path: 'settings', element: <SettingsPage /> },
            ],
          },
        ],
      },
    ],
  },
]);