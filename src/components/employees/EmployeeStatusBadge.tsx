import type { EmployeeStatus } from '../../features/users/types';
import { STATUS_LABELS, STATUS_STYLES } from '../../features/users/employeeUtils';

export function EmployeeStatusBadge({ status }: { status: EmployeeStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
      {STATUS_LABELS[status]}
    </span>
  );
}
