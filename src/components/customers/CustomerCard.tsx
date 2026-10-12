import { Mail, Phone, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { formatDate, getInitials } from '../../features/users/employeeUtils';
import type { Customer } from '../../features/customers/types';

interface CustomerCardProps {
  customer: Customer;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  onDetail: (c: Customer) => void;
}

export function CustomerCard({ customer, canUpdate, canDelete, onEdit, onDelete, onDetail }: CustomerCardProps) {
  return (
    <li className="list-none bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white text-sm font-semibold"
          aria-hidden="true"
        >
          {getInitials(customer.name)}
        </div>
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onDetail(customer)}
            className="text-left font-semibold text-slate-950 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            aria-label={`View details for ${customer.name}`}
          >
            {customer.name}
          </button>
          <div className="mt-0.5 flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{customer.email || 'No email'}</span>
          </div>
        </div>
        <CustomerStatusBadge status={customer.status} />
      </div>
      <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
        {customer.phone && (
          <div className="flex items-center gap-1">
            <Phone className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{customer.phone}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-slate-500">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>Added {formatDate(customer.createdAt)}</span>
        </div>
      </div>
      {(canUpdate || canDelete) && (
        <div className="mt-4 flex items-center gap-2">
          {canUpdate && (
            <Button variant="outline" size="sm" onClick={() => onEdit(customer)} aria-label={`Edit ${customer.name}`}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(customer)} aria-label={`Delete ${customer.name}`}>
              Delete
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
