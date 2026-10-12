import { Button } from '../ui/Button';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { getInitials, getRoleName } from '../../features/users/employeeUtils';
import type { Employee } from '../../features/users/types';

interface EmployeeTableProps {
  employees: Employee[];
  canUpdate: boolean;
  /** Return false to hide delete for a row (e.g. the signed-in user). */
  canDeleteEmployee: (employee: Employee) => boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onDetail: (employee: Employee) => void;
}

export function EmployeeTable({
  employees,
  canUpdate,
  canDeleteEmployee,
  onEdit,
  onDelete,
  onDetail,
}: EmployeeTableProps) {
  const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400';
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
        <caption className="sr-only">Team members</caption>
        <thead className="bg-slate-50 dark:bg-slate-900">
          <tr>
            <th scope="col" className={th}>Name</th>
            <th scope="col" className={th}>Department</th>
            <th scope="col" className={th}>Title</th>
            <th scope="col" className={th}>Role</th>
            <th scope="col" className={th}>Status</th>
            <th scope="col" className={`${th} text-right`}>Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
          {employees.map((e) => (
            <tr key={e._id}>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold"
                    aria-hidden="true"
                  >
                    {getInitials(e.name)}
                  </div>
                  <div className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onDetail(e)}
                      className="font-medium text-slate-950 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded text-left"
                      aria-label={`View details for ${e.name}`}
                    >
                      {e.name}
                    </button>
                    <div className="text-slate-500 dark:text-slate-400 truncate">{e.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{e.department || '—'}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{e.title || '—'}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{getRoleName(e) ?? '—'}</td>
              <td className="px-4 py-3">
                <EmployeeStatusBadge status={e.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {canUpdate && (
                    <Button variant="outline" size="sm" onClick={() => onEdit(e)} aria-label={`Edit ${e.name}`}>
                      Edit
                    </Button>
                  )}
                  {canDeleteEmployee(e) && (
                    <Button variant="ghost" size="sm" onClick={() => onDelete(e)} aria-label={`Delete ${e.name}`}>
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

export type { EmployeeTableProps };
