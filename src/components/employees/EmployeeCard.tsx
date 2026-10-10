import { User, Clock, Mail, Building2, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Employee } from '../../features/users/types';

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  invited: 'Invited',
  disabled: 'Disabled',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  invited: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  disabled: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onDetail: (employee: Employee) => void;
}

export function EmployeeCard({ employee, onEdit, onDelete, onDetail }: EmployeeCardProps) {
  const statusLabel = STATUS_LABELS[employee.status] ?? employee.status;
  const statusStyle = STATUS_STYLES[employee.status] ?? STATUS_STYLES.disabled;

  return (
    <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => onDetail(employee)}
          className="flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-full"
          aria-label={`View details for ${employee.name}`}
        >
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
            {getInitials(employee.name)}
          </div>
        </button>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onDetail(employee)}
            className="text-left font-semibold text-slate-950 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
          >
            {employee.name}
          </button>
          <div className="flex items-center gap-1 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{employee.email}</span>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
          {statusLabel}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        {employee.department && (
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{employee.department}</span>
          </div>
        )}
        {employee.title && (
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{employee.title}</span>
          </div>
        )}
        {employee.managerId && (
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <User className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Manager: {employee.managerId}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>Created {formatDate(employee.createdAt)}</span>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(employee)}>
          Edit
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(employee)}>
          Delete
        </Button>
      </div>
    </div>
  );
}

export type { EmployeeCardProps };