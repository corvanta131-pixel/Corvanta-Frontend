import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Alert, AlertDescription } from '../../components/ui/Alert';
import { useRequestPasswordReset } from '../../features/auth/accountHooks';
import { getErrorMessage } from '../../utils/apiError';

export const forgotSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
});
type ForgotValues = z.infer<typeof forgotSchema>;

export function ForgotPasswordPage() {
  const request = useRequestPasswordReset();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: '' } });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot your password?</CardTitle>
          <CardDescription>Enter your email and we will send you a link to choose a new one.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {request.isSuccess ? (
            <div role="status" className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
              {request.data || 'If an account exists for that email, a reset link is on its way.'} The link works once and expires in 1 hour.
            </div>
          ) : (
            <form
              className="space-y-4"
              noValidate
              onSubmit={handleSubmit(async (values) => {
                try {
                  await request.mutateAsync(values.email);
                } catch {
                  // Shown below via request.error; the email stays in the field.
                }
              })}
            >
              {request.error && (
                <Alert variant="destructive">
                  <AlertDescription>{getErrorMessage(request.error, 'We could not send the email right now.')}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email</Label>
                <Input id="forgot-email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
                {errors.email && (
                  <p role="alert" className="text-sm text-red-600 dark:text-red-400">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={request.isPending}>
                {request.isPending ? 'Sending…' : 'Send reset link'}
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
