import { X, Mail, Building2, Briefcase, User, Clock, Hash, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
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
    month: 'long',
    day: 'numeric',
  });
}

interface EmployeeDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeDetail({
  open,
  onOpenChange,
  employee,
  onEdit,
  onDelete,
}: EmployeeDetailProps) {
  if (!employee) return null;

  const statusLabel = STATUS_LABELS[employee.status] ?? employee.status;
  const statusStyle = STATUS_STYLES[employee.status] ?? STATUS_STYLES.disabled;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xl font-semibold">
              {getInitials(employee.name)}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left">{employee.name}</DialogTitle>
              <DialogDescription className="text-left">
                Employee details
              </DialogDescription>
            </div>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true" />
              {statusLabel}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={employee.email} />
          <InfoRow icon={<Building2 className="h-4 w-4" />} label="Department" value={employee.department || 'Not specified'} />
          <InfoRow icon={<Briefcase className="h-4 w-4" />} label="Title" value={employee.title || 'Not specified'} />
          <InfoRow icon={<User className="h-4 w-4" />} label="Manager" value={employee.managerId || 'No manager assigned'} mono={false} />
          <InfoRow icon={<Hash className="h-4 w-4" />} label="Employee ID" value={employee._id} mono />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Created" value={formatDate(employee.createdAt)} />
          <InfoRow icon={<Clock className="h-4 w-4" />} label="Last updated" value={formatDate(employee.updatedAt)} />
          {employee.lastLoginAt && (
            <InfoRow icon={<Clock className="h-4 w-4" />} label="Last login" value={formatDate(employee.lastLoginAt)} />
          )}
          <InfoRow
            icon={<Shield className="h-4 w-4" />}
            label="Role"
            value={employee.roleId ? 'Assigned' : 'No role assigned'}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onEdit(employee)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={() => onDelete(employee)}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-slate-400 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </dt>
        <dd className={`mt-0.5 text-sm text-slate-950 dark:text-slate-50 ${mono ? 'font-mono break-all' : ''}`}>
          {value}
        </dd>
      </div>
    </div>
  );
}

export type { EmployeeDetailProps };