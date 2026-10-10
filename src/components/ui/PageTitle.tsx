import type { LucideIcon } from 'lucide-react';

interface PageTitleProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageTitle({ title, description, icon: Icon, action }: PageTitleProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
      <div className="flex items-start gap-3">
        {Icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
        )}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-50">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}