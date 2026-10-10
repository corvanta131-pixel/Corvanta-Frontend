import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: ReactNode;
  iconColor?: string;
  loading?: boolean;
}

export function StatCard({ title, value, change, icon, iconColor = 'bg-indigo-100 dark:bg-indigo-900/30', loading }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6 transition-transform duration-150 hover:shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', iconColor)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          {loading ? (
            <div className="h-7 w-16 mt-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-bold text-slate-950 dark:text-slate-50 mt-1">{value}</p>
          )}
        </div>
        {change && !loading && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{change}</span>
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton({ title }: { title: string }) {
  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700 animate-pulse flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <div className="h-7 w-12 mt-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}