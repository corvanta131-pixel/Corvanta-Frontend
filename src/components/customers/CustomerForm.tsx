import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import { CUSTOMER_STATUS_LABELS } from '../../features/customers/customerUtils';
import {
  CUSTOMER_STATUSES,
  type CreateCustomerRequest,
  type Customer,
  type UpdateCustomerRequest,
} from '../../features/customers/types';

/**
 * Mirrors backend validateCustomerInput: name 2-150, email valid if present,
 * phone 2-30 if present, notes <= 2000. On create, email is required in the UI because the
 * backend rejects a second customer without an email (empty-email duplicate check).
 */
export function makeCustomerSchema(isEdit: boolean) {
  return z.object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150, 'Name must be at most 150 characters'),
    email: z
      .string()
      .trim()
      .refine((v) => (isEdit ? true : v !== ''), 'Email is required')
      .refine((v) => v === '' || z.string().email().safeParse(v).success, 'Enter a valid email address'),
    phone: z
      .string()
      .trim()
      .refine((v) => v === '' || (v.length >= 2 && v.length <= 30), 'Phone must be 2-30 characters'),
    status: z.enum(['active', 'inactive', 'prospect', 'archived']),
    notes: z.string().max(2000, 'Notes must be at most 2000 characters'),
  });
}

export type CustomerFormValues = z.infer<ReturnType<typeof makeCustomerSchema>>;

/** Exact request body. On update, empty strings are sent so a field can be cleared. */
export function buildCustomerPayload(
  values: CustomerFormValues,
  isEdit: boolean
): CreateCustomerRequest | UpdateCustomerRequest {
  const base = { name: values.name, status: values.status };
  if (isEdit) {
    return { ...base, email: values.email, phone: values.phone, notes: values.notes };
  }
  return {
    ...base,
    ...(values.email ? { email: values.email } : {}),
    ...(values.phone ? { phone: values.phone } : {}),
    ...(values.notes ? { notes: values.notes } : {}),
  };
}

interface CustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateCustomerRequest | UpdateCustomerRequest) => Promise<void>;
  initial?: Customer | null;
  isPending: boolean;
  errorMessage: string | null;
}

const fieldError = 'text-sm text-red-600 dark:text-red-400';

export function CustomerForm({ open, onOpenChange, onSubmit, initial, isPending, errorMessage }: CustomerFormProps) {
  const isEdit = !!initial;
  const schema = useMemo(() => makeCustomerSchema(isEdit), [isEdit]);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', status: 'active', notes: '' },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: initial?.name ?? '',
        email: initial?.email ?? '',
        phone: initial?.phone ?? '',
        status: initial?.status ?? 'active',
        notes: initial?.notes ?? '',
      });
    }
  }, [open, initial, reset]);

  const busy = isSubmitting || isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit customer' : 'Add customer'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update this customer’s details.' : 'Create a customer record for your company.'}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(async (values) => onSubmit(buildCustomerPayload(values, isEdit)))}
          className="mt-4 space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="customer-name">Name *</Label>
            <Input id="customer-name" {...register('name')} placeholder="Full name" aria-invalid={!!errors.name} />
            {errors.name && <p className={fieldError} role="alert">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-email">{isEdit ? 'Email' : 'Email *'}</Label>
            <Input
              id="customer-email"
              type="email"
              {...register('email')}
              placeholder="name@example.com"
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className={fieldError} role="alert">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-phone">Phone</Label>
              <Input id="customer-phone" {...register('phone')} placeholder="+234…" aria-invalid={!!errors.phone} />
              {errors.phone && <p className={fieldError} role="alert">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-status">Status</Label>
              <select
                id="customer-status"
                {...register('status')}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {CUSTOMER_STATUSES.map((s) => (
                  <option key={s} value={s}>{CUSTOMER_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer-notes">Notes</Label>
            <textarea
              id="customer-notes"
              {...register('notes')}
              rows={3}
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-700 dark:bg-slate-950"
              aria-invalid={!!errors.notes}
            />
            {errors.notes && <p className={fieldError} role="alert">{errors.notes.message}</p>}
          </div>

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
              {isEdit ? 'Save changes' : 'Create customer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
