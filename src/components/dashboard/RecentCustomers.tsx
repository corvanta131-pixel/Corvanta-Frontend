import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { EmptyState, ErrorState } from '../dashboard/EmptyState';
import { Button } from '../ui/Button';
import type { Customer } from '../../types/dashboard';
import { formatDistanceToNow } from 'date-fns';

interface RecentCustomersProps {
  customers: Customer[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

export function RecentCustomers({ customers, isLoading, isError, onRetry }: RecentCustomersProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1">
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState onRetry={onRetry} />;
  }

  if (!customers || customers.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-6 w-6" />}
        title="No customers yet"
        description="Add your first customer to begin building your customer workspace."
        action={
          <Link to="/customers">
            <Button size="sm">Go to Customers</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {customers.slice(0, 4).map((customer) => (
        <div
          key={customer._id}
          className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center">
            <Users className="h-5 w-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-950 dark:text-slate-50 truncate">{customer.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{customer.email}</p>
          </div>
          {customer.lastConversationAt && (
            <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {formatDistanceToNow(new Date(customer.lastConversationAt), { addSuffix: true })}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}