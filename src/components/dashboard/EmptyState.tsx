import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white dark:bg-slate-950 dark:bg-opacity-[0.02] rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 opacity-50">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = 'Unable to load data',
  description = 'There was a problem loading this section. Please try again.',
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
        <svg
          className="h-6 w-6 text-red-600 dark:text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.8 0h13.6M5.5 4h13a2 2 0 012 2v12a2 2 0 01-2 2h-3.5l-2.5 2.5a1 1 0 01-1.4 0L6.5 18H4a2 2 0 01-2-2V6a2 2 0 012-2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm">{description}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          Try again
        </button>
      )}
    </div>
  );
}