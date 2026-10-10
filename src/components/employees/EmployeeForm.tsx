import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../../features/users/types';

const employeeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120, 'Name must be at most 120 characters'),
  email: z.string().email('A valid email is required'),
  department: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(['active', 'invited', 'disabled']).optional(),
  managerId: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
  initial?: Employee | null;
  title: string;
  description: string;
  submitLabel: string;
  isPending: boolean;
  error: Error | null;
}

export function EmployeeForm({
  open,
  onOpenChange,
  onSubmit,
  initial,
  title,
  description,
  submitLabel,
  isPending,
  error,
}: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: '',
      email: '',
      department: '',
      title: '',
      status: 'active',
      managerId: '',
    },
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
      });
    }
  }, [open, initial, reset]);

  const handleSubmitForm = async (values: EmployeeFormValues) => {
    const payload: CreateEmployeeRequest | UpdateEmployeeRequest = {
      name: values.name,
      email: values.email,
      department: values.department || undefined,
      title: values.title || undefined,
      status: values.status,
      managerId: values.managerId || null,
    };
    await onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="employee-name">Name *</Label>
            <Input
              id="employee-name"
              {...register('name')}
              placeholder="Employee full name"
              aria-invalid={!!errors.name}
            />
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
              placeholder="employee@company.com"
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
                placeholder="e.g. Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-title">Title</Label>
              <Input
                id="employee-title"
                {...register('title')}
                placeholder="e.g. Developer"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee-status">Status</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <select
                    id="employee-status"
                    {...field}
                    className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="active">Active</option>
                    <option value="invited">Invited</option>
                    <option value="disabled">Disabled</option>
                  </select>
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="employee-manager">Manager ID</Label>
              <Input
                id="employee-manager"
                {...register('managerId')}
                placeholder="Optional employee ID"
              />
            </div>
          </div>

          {error && (
            <p
              className="text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2"
              role="alert"
            >
              {error.message}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isPending}>
              {(isSubmitting || isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { EmployeeFormValues };
export { employeeSchema };