import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { useCompletePasswordReset } from '../../features/auth/accountHooks';
import { getErrorMessage } from '../../utils/apiError';

export const resetSchema = z
  .object({
    password: z.string().min(8, 'Use at least 8 characters').max(128, 'Use at most 128 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ['confirm'], message: 'The passwords do not match' });
type ResetValues = z.infer<typeof resetSchema>;

const TOKEN = /^[a-f0-9]{64}$/;

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const reset = useCompletePasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetValues>({ resolver: zodResolver(resetSchema), defaultValues: { password: '', confirm: '' } });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Choose a new password</CardTitle>
          <CardDescription>This also works for the invitation you received by email.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!TOKEN.test(token) ? (
            <Alert variant="destructive">
              <AlertDescription>
                This link is incomplete or damaged. <Link to="/forgot-password" className="underline">Request a new one</Link>.
              </AlertDescription>
            </Alert>
          ) : reset.isSuccess ? (
            <div role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
              Your password was updated.{' '}
              <Link to="/login" className="font-medium underline">
                Sign in
              </Link>
              .
            </div>
          ) : (
            <form
              className="space-y-4"
              noValidate
              onSubmit={handleSubmit(async (values) => {
                try {
                  await reset.mutateAsync({ token, password: values.password });
                } catch {
                  // Shown below via reset.error; the form keeps its fields.
                }
              })}
            >
              {reset.error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {getErrorMessage(reset.error, 'We could not update your password.')}{' '}
                    <Link to="/forgot-password" className="underline">Request a new link</Link>
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="reset-password">New password</Label>
                <Input id="reset-password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} />
                {errors.password && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="reset-confirm">Confirm new password</Label>
                <Input id="reset-confirm" type="password" autoComplete="new-password" aria-invalid={!!errors.confirm} {...register('confirm')} />
                {errors.confirm && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {errors.confirm.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={reset.isPending}>
                {reset.isPending ? 'Saving…' : 'Save new password'}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <Link to="/login" className="text-sm text-slate-600 hover:underline dark:text-slate-400">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
