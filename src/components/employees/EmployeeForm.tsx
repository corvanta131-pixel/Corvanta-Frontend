import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../features/users/types';
import type { RoleSummary } from '../../features/roles/types';

/** Optional text: empty is fine, otherwise 2-100 characters (matches backend validateOptionalString). */
const optionalText = (label: string) =>
  z
    .string()
    .trim()
    .refine((v) => v === '' || (v.length >= 2 && v.length <= 100), `${label} must be 2-100 characters`);

export const employeeSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120, 'Name must be at most 120 characters'),
  email: z.string().trim().email('A valid email is required'),
  department: optionalText('Department'),
  title: optionalText('Title'),
  status: z.enum(['active', 'invited', 'disabled']),
  managerId: z.string(),
  roleId: z.string(),
  /** Create only. Empty means "no password set"; otherwise backend requires at least 8 characters. */
  password: z
    .string()
    .refine((v) => v === '' || v.length >= 8, 'Password must be at least 8 characters'),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

/** Builds the exact request body. On update, empty strings are sent so a field can be cleared. */
export function buildEmployeePayload(
  values: EmployeeFormValues,
  isEdit: boolean
): CreateEmployeeRequest | UpdateEmployeeRequest {
  const base = {
    name: values.name,
    email: values.email,
    status: values.status,
    managerId: values.managerId || null,
    ...(values.roleId ? { roleId: values.roleId } : {}),
  };
  if (isEdit) {
    return { ...base, department: values.department, title: values.title };
  }
  return {
    ...base,
    ...(values.department ? { department: values.department } : {}),
    ...(values.title ? { title: values.title } : {}),
    ...(values.password ? { password: values.password } : {}),
  };
}

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
  initial?: Employee | null;
  /** Employees selectable as manager (the employee being edited is excluded). */
  managers: Employee[];
  /** Roles to choose from; omit or pass an empty list when the user cannot read roles. */
  roles?: RoleSummary[] | undefined;
  isPending: boolean;
  errorMessage: string | null;
}

const selectClass =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';

export function EmployeeForm({
  open,
  onOpenChange,
  onSubmit,
  initial,
  managers,
  roles = [],
  isPending,
  errorMessage,
}: EmployeeFormProps) {
  const isEdit = !!initial;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { name: '', email: '', department: '', title: '', status: 'active', managerId: '', roleId: '', password: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? '',
        email: initial?.email ?? '',
        department: initial?.department ?? '',
        title: initial?.title ?? '',
        status: initial?.status ?? 'active',
        managerId: initial?.managerId ?? '',
        roleId: initial && typeof initial.roleId === 'object' && initial.roleId ? initial.roleId._id : typeof initial?.roleId === 'string' ? initial.roleId : '',
        password: '',
      });
    }
  }, [open, initial, reset]);

  const busy = isSubmitting || isPending;

  const submit = async (values: EmployeeFormValues) => {
    await onSubmit(buildEmployeePayload(values, isEdit));
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit employee' : 'Add employee'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update this team member’s details.' : 'Create a new team member for your workspace.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="mt-4 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="employee-name">Name *</Label>
            <Input id="employee-name" {...register('name')} placeholder="Full name" aria-invalid={!!errors.name} />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="employee-email">Email *</Label>
            <Input
              id="employee-email"
              type="email"
              {...register('email')}
              placeholder="name@company.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee-department">Department</Label>
              <Input
                id="employee-department"
                {...register('department')}
                placeholder="e.g. Support"
                aria-invalid={!!errors.department}
              />
              {errors.department && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.department.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-title">Title</Label>
              <Input id="employee-title" {...register('title')} placeholder="e.g. Agent" aria-invalid={!!errors.title} />
              {errors.title && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.title.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee-status">Status</Label>
              <select id="employee-status" {...register('status')} className={selectClass}>
                <option value="active">Active</option>
                <option value="invited">Invited</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-manager">Manager</Label>
              <select id="employee-manager" {...register('managerId')} className={selectClass}>
                <option value="">No manager</option>
                {managers.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {roles.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="employee-role">Role</Label>
              <select id="employee-role" {...register('roleId')} className={selectClass}>
                <option value="">{isEdit ? 'Keep current role' : 'No role (no permissions)'}</option>
                {roles.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                A role decides what this person can see and do. Without one they have no permissions.
              </p>
            </div>
          )}

          {!isEdit && (
            <div className="space-y-2">
              <Label htmlFor="employee-password">Initial password</Label>
              <Input
                id="employee-password"
                type="password"
                autoComplete="new-password"
                {...register('password')}
                placeholder="At least 8 characters (optional)"
                aria-invalid={!!errors.password}
                aria-describedby="employee-password-help"
              />
              <p id="employee-password-help" className="text-xs text-slate-500 dark:text-slate-400">
                Leave blank and this person cannot sign in until a password is set for them.
              </p>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {errorMessage && (
            <p
              className="text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2"
              role="alert"
            >
              {errorMessage}
            </p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
              {isEdit ? 'Save changes' : 'Create employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { EmployeeFormProps };
