import {
  Users,
  MessageSquare,
  Bot,
  MessageCircle,
  BookOpen,
} from 'lucide-react';
import { StatCard, StatCardSkeleton } from './StatCard';
import type { DashboardStats } from '../../features/dashboard/types';

interface KpiSummaryProps {
  stats: DashboardStats | null;
  loading: boolean;
  error: boolean;
}

export function KpiSummary({ stats, loading, error }: KpiSummaryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCardSkeleton title="Customers" />
        <StatCardSkeleton title="Open Conversations" />
        <StatCardSkeleton title="AI Agents" />
        <StatCardSkeleton title="Connected Channels" />
        <StatCardSkeleton title="Knowledge Bases" />
        <StatCardSkeleton title="Team Members" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <StatCardSkeleton key={i} title="Loading..." />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Customers"
        value={stats?.customers.length ?? 0}
        icon={<Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />}
        iconColor="bg-indigo-100 dark:bg-indigo-900/30"
      />
      <StatCard
        title="Open Conversations"
        value={stats?.conversations.filter((c) => c.status === 'open').length ?? 0}
        icon={<MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
        iconColor="bg-blue-100 dark:bg-blue-900/30"
      />
      <StatCard
        title="AI Agents"
        value={stats?.agents.length ?? 0}
        icon={<Bot className="h-5 w-5 text-violet-600 dark:text-violet-400" />}
        iconColor="bg-violet-100 dark:bg-violet-900/30"
      />
      <StatCard
        title="Connected Channels"
        value={stats?.channels.filter((c) => c.status === 'connected').length ?? 0}
        icon={<MessageCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />}
        iconColor="bg-cyan-100 dark:bg-cyan-900/30"
      />
      <StatCard
        title="Knowledge Bases"
        value={stats?.knowledgeBases.length ?? 0}
        icon={<BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
        iconColor="bg-purple-100 dark:bg-purple-900/30"
      />
      <StatCard
        title="Team Members"
        value={stats?.employees.length ?? 0}
        icon={<Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
        iconColor="bg-emerald-100 dark:bg-emerald-900/30"
      />
    </div>
  );
}