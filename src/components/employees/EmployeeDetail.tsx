import { Mail, Building2, Briefcase, User, Clock, Hash, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import { EmployeeStatusBadge } from './EmployeeStatusBadge';
import { formatDate, getInitials, getRoleName } from '../../features/users/employeeUtils';
import type { Employee } from '../../features/users/types';

interface EmployeeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  managerName: string | null;
  canUpdate: boolean;
  canDelete: boolean;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeDetail({
  open,
  onOpenChange,
  employee,
  managerName,
  canUpdate,
  canDelete,
  onEdit,
  onDelete,
}: EmployeeDetailProps) {
  if (!employee) return null;

  const lastLogin = formatDate(employee.lastLoginAt);
  const roleName = getRoleName(employee);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-semibold"
              aria-hidden="true"
            >
              {getInitials(employee.name)}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left">{employee.name}</DialogTitle>
              <DialogDescription className="text-left">Employee details</DialogDescription>
            </div>
            <EmployeeStatusBadge status={employee.status} />
          </div>
        </DialogHeader>

        <dl className="space-y-4 mt-4">
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={employee.email} />
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Department" value={employee.department || 'Not specified'} />
          <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Title" value={employee.title || 'Not specified'} />
          <InfoRow
            icon={<User className="h-4 w-4" />}
            label="Manager"
            value={employee.managerId ? (managerName ?? 'Unavailable') : 'No manager assigned'}
          />
          <InfoRow
            icon={<Shield className="h-4 w-4" />}
            label="Role"
            value={roleName ?? 'No role assigned'}
          />
          {employee.employeeCode && (
            <InfoRow icon={<Hash className="h-4 w-4" />} label="Employee code" value={employee.employeeCode} />
          )}
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Added" value={formatDate(employee.createdAt) || 'Unknown'} />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Last login" value={lastLogin || 'Never'} />
        </dl>

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {canUpdate && (
            <Button variant="outline" onClick={() => onEdit(employee)}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button variant="destructive" onClick={() => onDelete(employee)}>
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-400" aria-hidden="true">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</dt>
        <dd className="mt-0.5 text-sm text-slate-950 dark:text-slate-50 break-words">{value}</dd>
      </div>
    </div>
  );
}

export type { EmployeeDetailProps };
