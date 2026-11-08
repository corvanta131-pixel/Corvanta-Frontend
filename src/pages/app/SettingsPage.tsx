import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
import { can } from '../../utils/permissions';
import { updateCompany, updateUser } from '../../features/auth/authSlice';
import { useChangePassword } from '../../features/auth/accountHooks';
import { useUpdateCompany, useUpdateMyName } from '../../features/auth/profileHooks';
import { getErrorMessage } from '../../utils/apiError';

export const nameSchema = z.object({ name: z.string().trim().min(2, 'Use at least 2 characters').max(120, 'Use at most 120 characters') });
export const companySchema = z.object({
  name: z.string().trim().min(2, 'Use at least 2 characters').max(120, 'Use at most 120 characters'),
  industry: z.string().trim().max(100, 'Use at most 100 characters'),
});
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'The passwords do not match' })
  .refine((v) => v.newPassword !== v.currentPassword, { path: ['newPassword'], message: 'Choose a password different from your current one' });

type NameValues = z.infer<typeof nameSchema>;
type CompanyValues = z.infer<typeof companySchema>;
type ChangeValues = z.infer<typeof changePasswordSchema>;

const fieldError = 'text-sm text-red-600 dark:text-red-400';
const serverError = 'rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400';
const termLabel = 'text-xs font-medium uppercase tracking-wider text-slate-500';

export function SettingsPage() {
  const dispatch = useDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const company = useAppSelector((state) => state.auth.company);
  const canEditCompany = can('companies:update', user);

  const rename = useUpdateMyName();
  const saveCompany = useUpdateCompany();
  const change = useChangePassword();

  const nameForm = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: user?.name ?? '' } });
  const companyForm = useForm<CompanyValues>({ resolver: zodResolver(companySchema), defaultValues: { name: company?.name ?? '', industry: company?.industry ?? '' } });
  const passwordForm = useForm<ChangeValues>({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });

  const { reset: resetName } = nameForm;
  const { reset: resetCompany } = companyForm;
  useEffect(() => {
    resetName({ name: user?.name ?? '' });
  }, [user?.name, resetName]);
  useEffect(() => {
    resetCompany({ name: company?.name ?? '', industry: company?.industry ?? '' });
  }, [company?.name, company?.industry, resetCompany]);

  const roleName = user && typeof user.roleId === 'object' && user.roleId ? user.roleId.name : null;

  return (
    <div className="space-y-6">
      <PageTitle title="Settings" description="Your account, company and security" icon={Settings} />

      <Card>
        <CardHeader>
          <CardTitle>Your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            className="max-w-md space-y-3"
            noValidate
            onSubmit={nameForm.handleSubmit(async (values) => {
              try {
                const result = await rename.mutateAsync(values.name);
                dispatch(updateUser({ name: result.name }));
                toast.success('Your name was updated.');
              } catch {
                // Shown below via rename.error; the field keeps what was typed.
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="profile-name">Your name</Label>
              <Input id="profile-name" autoComplete="name" aria-invalid={!!nameForm.formState.errors.name} {...nameForm.register('name')} />
              {nameForm.formState.errors.name && <p role="alert" className={fieldError}>{nameForm.formState.errors.name.message}</p>}
            </div>
            {rename.error && <p role="alert" className={serverError}>{getErrorMessage(rename.error)}</p>}
            <Button type="submit" size="sm" disabled={rename.isPending}>
              {rename.isPending ? 'Saving…' : 'Save name'}
            </Button>
          </form>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className={termLabel}>Email</dt>
              <dd className="mt-0.5 break-all">{user?.email ?? '—'}</dd>
            </div>
            <div>
              <dt className={termLabel}>Role</dt>
              <dd className="mt-0.5">{roleName ?? 'No role assigned'}</dd>
            </div>
          </dl>
          <p className="text-xs text-slate-500">Your email and role are managed by a workspace owner.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
        </CardHeader>
        <CardContent>
          {!company ? (
            <p className="text-sm text-slate-600 dark:text-slate-400">Company details are not available right now.</p>
          ) : canEditCompany ? (
            <form
              className="max-w-md space-y-3"
              noValidate
              onSubmit={companyForm.handleSubmit(async (values) => {
                try {
                  const updated = await saveCompany.mutateAsync({ name: values.name, industry: values.industry });
                  dispatch(updateCompany(updated));
                  toast.success('Company details were updated.');
                } catch {
                  // Shown below via saveCompany.error; the fields keep what was typed.
                }
              })}
            >
              <div className="space-y-2">
                <Label htmlFor="company-name">Company name</Label>
                <Input id="company-name" aria-invalid={!!companyForm.formState.errors.name} {...companyForm.register('name')} />
                {companyForm.formState.errors.name && <p role="alert" className={fieldError}>{companyForm.formState.errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-industry">Industry</Label>
                <Input id="company-industry" placeholder="For example: Retail" aria-invalid={!!companyForm.formState.errors.industry} {...companyForm.register('industry')} />
                {companyForm.formState.errors.industry && <p role="alert" className={fieldError}>{companyForm.formState.errors.industry.message}</p>}
              </div>
              {saveCompany.error && <p role="alert" className={serverError}>{getErrorMessage(saveCompany.error)}</p>}
              <Button type="submit" size="sm" disabled={saveCompany.isPending}>
                {saveCompany.isPending ? 'Saving…' : 'Save company'}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className={termLabel}>Company name</dt>
                  <dd className="mt-0.5">{company.name}</dd>
                </div>
                <div>
                  <dt className={termLabel}>Industry</dt>
                  <dd className="mt-0.5">{company.industry || '—'}</dd>
                </div>
              </dl>
              <p className="text-xs text-slate-500">Only people who can manage the company can edit these details.</p>
            </div>
          )}
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
            onSubmit={passwordForm.handleSubmit(async (values) => {
              try {
                await change.mutateAsync({ currentPassword: values.currentPassword, newPassword: values.newPassword });
                toast.success('Your password was changed.');
                passwordForm.reset();
              } catch {
                // Shown below via change.error; the form keeps what was typed.
              }
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input id="current-password" type="password" autoComplete="current-password" aria-invalid={!!passwordForm.formState.errors.currentPassword} {...passwordForm.register('currentPassword')} />
              {passwordForm.formState.errors.currentPassword && <p role="alert" className={fieldError}>{passwordForm.formState.errors.currentPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" aria-invalid={!!passwordForm.formState.errors.newPassword} {...passwordForm.register('newPassword')} />
              {passwordForm.formState.errors.newPassword && <p role="alert" className={fieldError}>{passwordForm.formState.errors.newPassword.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" aria-invalid={!!passwordForm.formState.errors.confirm} {...passwordForm.register('confirm')} />
              {passwordForm.formState.errors.confirm && <p role="alert" className={fieldError}>{passwordForm.formState.errors.confirm.message}</p>}
            </div>
            {change.error && <p role="alert" className={serverError}>{getErrorMessage(change.error)}</p>}
            <Button type="submit" disabled={change.isPending}>
              {change.isPending ? 'Saving…' : 'Change password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
