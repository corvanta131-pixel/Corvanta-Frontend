import { User, Clock, Mail, Building2, Briefcase } from 'lucide-react';
import { Button } from '../ui/Button';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { formatDate, getInitials } from '../../features/users/employeeUtils';
import type { Employee } from '../../features/users/types';

interface EmployeeCardProps {
  employee: Employee;
  managerName: string | null;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
  onDetail: (employee: Employee) => void;
}

export function EmployeeCard({
  employee,
  managerName,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
  onDetail,
}: EmployeeCardProps) {
  return (
    <li className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-sm transition-shadow list-none">
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold"
          aria-hidden="true"
        >
          {getInitials(employee.name)}
        </div>

        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => onDetail(employee)}
            className="text-left font-semibold text-slate-950 dark:text-slate-50 hover:text-indigo-600 dark:hover:text-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            aria-label={`View details for ${employee.name}`}
          >
            {employee.name}
          </button>
          <div className="flex items-center gap-1 mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            <Mail className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{employee.email}</span>
          </div>
        </div>

        <EmployeeStatusBadge status={employee.status} />
      </div>

      <div className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
        {employee.department && (
          <div className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{employee.department}</span>
          </div>
        )}
        {employee.title && (
          <div className="flex items-center gap-1">
            <Briefcase className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>{employee.title}</span>
          </div>
        )}
        {managerName && (
          <div className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
            <span>Manager: {managerName}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-slate-500">
          <Clock className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
          <span>Added {formatDate(employee.createdAt)}</span>
        </div>
      </div>

      {(canUpdate || canDelete) && (
        <div className="mt-4 flex items-center gap-2">
          {canUpdate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(employee)}
              aria-label={`Edit ${employee.name}`}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(employee)}
              aria-label={`Delete ${employee.name}`}
            >
              Delete
            </Button>
          )}
        </div>
      )}
    </li>
  );
}

export type { EmployeeCardProps };
