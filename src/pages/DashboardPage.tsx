import { useEffect } from 'react';
import { useDashboardStats } from '../features/dashboard/hooks';
import { KpiSummary } from '../components/dashboard/KpiSummary';
import { RecentConversations } from '../components/dashboard/RecentConversations';
import { RecentCustomers } from '../components/dashboard/RecentCustomers';
import { QuickActions } from '../components/dashboard/QuickActions';
import { can } from '../utils/permissions';
import { useAppSelector } from '../hooks';
import type { DashboardStats } from '../features/dashboard/types';

export function DashboardPage() {
  const { user, company } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError, refetch } = useDashboardStats();

  const stats: DashboardStats | null = data ?? null;
  const hasCustomerAccess = can('customers:read', user);
  const hasConversationAccess = can('conversations:read', user);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'l' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        const input = document.querySelector('input[type="search"]') as HTMLInputElement | null;
        if (input) {
          input.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {getGreeting()}, {user?.name || 'there'}
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Here&apos;s what&apos;s happening across your Corvanta workspace
            {company?.name && <span className="font-medium"> · {company.name}</span>}.
          </p>
        </div>
      </div>

      <section aria-labelledby="kpi-heading">
        <KpiSummary stats={stats} loading={isLoading} error={isError} />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {hasConversationAccess && (
          <section aria-labelledby="recent-conversations-heading">
            <h2 id="recent-conversations-heading" className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-4">
              Recent Conversations
            </h2>
            <RecentConversations
              conversations={stats?.conversations}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
            />
          </section>
        )}

        {hasCustomerAccess && (
          <section aria-labelledby="recent-customers-heading">
            <h2 id="recent-customers-heading" className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-4">
              Recent Customers
            </h2>
            <RecentCustomers
              customers={stats?.customers}
              isLoading={isLoading}
              isError={isError}
              onRetry={() => refetch()}
            />
          </section>
        )}
      </div>

      <section aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-4">
          Quick Actions
        </h2>
        <QuickActions />
      </section>
    </div>
  );
}