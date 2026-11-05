import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppSelector } from '../../hooks';
import { useChangePassword } from '../../features/auth/accountHooks';
import { getErrorMessage } from '../../utils/apiError';

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'The passwords do not match' })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Choose a password different from your current one' });
type ChangeValues = z.infer<typeof changePasswordSchema>;

export function SettingsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const change = useChangePassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangeValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });

  const roleName = user && typeof user.roleId === 'object' && user.roleId ? user.roleId.name : null;
  const fieldError = 'text-sm text-red-600 dark:text-red-400';

  return (
    <div className="space-y-6">
      <PageTitle title="Settings" description="Your account and security" icon={Settings} />

      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Name</dt>
              <dd className="mt-0.5">{user?.name ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Email</dt>
              <dd className="mt-0.5 break-all">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Role</dt>
              <dd className="mt-0.5">{roleName ?? 'No role assigned'}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">Name, email and company details cannot be edited here yet.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="max-w-md space-y-4"
            noValidate
            onSubmit={handleSubmit(async (values) => {
              try {
                await change.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
                toast.success('Your password was changed.');
                reset();
              } catch {
                // Shown below via change.error; the form keeps what was typed.
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} {...register('currentPassword')} />
              {errors.currentPassword && <p role="alert" className={fieldError}>{errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register('newPassword')} />
              {errors.newPassword && <p role="alert" className={fieldError}>{errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register('confirm')} />
              {errors.confirm && <p role="alert" className={fieldError}>{errors.confirm.message}</p>}
            </div>
            {change.error && (
              <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {getErrorMessage(change.error)}
              </p>
            )}
            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? 'Saving…' : 'Change password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
