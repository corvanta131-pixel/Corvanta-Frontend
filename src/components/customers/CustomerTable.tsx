import { Button } from '../ui/Button';
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { formatDate, getInitials } from '../../features/users/employeeUtils';
import type { Customer } from '../../features/customers/types';

interface CustomerTableProps {
  customers: Customer[];
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
  onDetail: (c: Customer) => void;
}

export function CustomerTable({ customers, canUpdate, canDelete, onEdit, onDelete, onDetail }: CustomerTableProps) {
  const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
        <caption className="sr-only">Customers</caption>
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th scope="col" className={th}>Customer</th>
            <th scope="col" className={th}>Phone</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={th}>Added</th>
            <th scope="col" className={`${th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
          {customers.map((c) => (
            <tr key={c._id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full bg-violet-500 flex items-center justify-center text-white text-xs font-semibold"
                    aria-hidden="true"
                  >
                    {getInitials(c.name)}
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onDetail(c)}
                      className="font-medium text-slate-950 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded text-left"
                      aria-label={`View details for ${c.name}`}
                    >
                      {c.name}
                    </button>
                    <div className="text-slate-500 dark:text-slate-400 truncate">{c.email || 'No email'}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{c.phone || '—'}</td>
              <td className="px-4 py-3"><CustomerStatusBadge status={c.status} /></td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{formatDate(c.createdAt) || '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {canUpdate && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(c)} aria-label={`Edit ${c.name}`}>
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(c)} aria-label={`Delete ${c.name}`}>
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
