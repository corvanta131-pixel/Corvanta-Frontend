import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle2, CreditCard, Loader2, Lock, RefreshCw } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/apiError';
import { redirectTo } from '../../utils/redirect';
import { useBillingOverview, useCheckout, useVerifyPayment } from '../../features/billing/hooks';
import type { Plan } from '../../services/api/billing';

const REFERENCE = /^cv_[A-Za-z0-9_]{6,80}$/;

type Outcome =
  | { kind: 'verifying' }
  | { kind: 'success'; planName: string }
  | { kind: 'pending'; reference: string }
  | { kind: 'failed' }
  | { kind: 'error'; message: string; reference: string | null }
  | null;

function money(kobo: number, currency: string): string {
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency, maximumFractionDigits: 0 }).format(kobo / 100);
  } catch {
    return `${(kobo / 100).toLocaleString()} ${currency}`;
  }
}

function formatDate(iso: string | null): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

type VerifyFn = ReturnType<typeof useVerifyPayment>['mutate'];

/** Asks the server to confirm a payment with Paystack and turns the answer into something a person can read. */
function confirm(verify: VerifyFn, reference: string, setOutcome: (outcome: Outcome) => void) {
  setOutcome({ kind: 'verifying' });
  verify(
    { reference },
    {
      onSuccess: (result) => {
        if (result.status === 'success') setOutcome({ kind: 'success', planName: result.overview.subscription.planName });
        else if (result.status === 'pending') setOutcome({ kind: 'pending', reference });
        else setOutcome({ kind: 'failed' });
      },
      onError: (error) => setOutcome({ kind: 'error', message: getErrorMessage(error, 'We could not confirm the payment.'), reference }),
    }
  );
}

export function BillingPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('billing:read', user);
  const canManage = can('billing:manage', user);
  const [params, setParams] = useSearchParams();
  const reference = params.get('reference');

  const overviewQuery = useBillingOverview(canRead);
  const checkoutMutation = useCheckout();
  const { mutate: verify } = useVerifyPayment();
  const [outcome, setOutcome] = useState<Outcome>(null);
  const handled = useRef<string | null>(null);

  // Paystack sends the customer back here with ?reference=... : confirm it once, then tidy the address.
  useEffect(() => {
    if (!canRead || !reference) return;
    if (REFERENCE.test(reference) && handled.current !== reference) {
      handled.current = reference;
      confirm(verify, reference, setOutcome);
    }
    setParams({}, { replace: true });
  }, [canRead, reference, verify, setParams]);

  const choose = (plan: Plan) => {
    checkoutMutation.mutate(
      { planId: plan.id },
      {
        onSuccess: (result) => {
          try {
            redirectTo(result.authorizationUrl);
          } catch (error) {
            setOutcome({ kind: 'error', message: getErrorMessage(error, 'We could not open the payment page.'), reference: null });
          }
        },
      }
    );
  };

  const overview = overviewQuery.data;
  const sub = overview?.subscription;
  const paidUntil = sub && sub.planId !== 'free' && !sub.expired ? formatDate(sub.periodEnd) : null;
  const endedOn = sub?.expired ? formatDate(sub.periodEnd) : null;
  const statusLabel = sub ? (sub.status === 'free' ? 'Free plan' : sub.status === 'active' ? 'Active' : 'Expired') : '';

  return (
    <div className="space-y-6">
      <PageTitle title="Billing" description="Your plan, usage and payments" icon={CreditCard} />

      {!canRead ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Restricted access</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">You don’t have permission to view billing. Ask a workspace owner if you need access.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {outcome?.kind === 'verifying' && (
            <p role="status" className="flex items-center gap-2 rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Confirming your payment…
            </p>
          )}
          {outcome?.kind === 'success' && (
            <p role="status" className="flex items-center gap-2 rounded-md bg-green-50 px-3 py-2 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-300">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Payment received. Your plan is now {outcome.planName}.
            </p>
          )}
          {outcome?.kind === 'pending' && (
            <div role="status" className="flex flex-wrap items-center gap-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              Your payment is still being confirmed. This can take a minute.
              <Button size="sm" variant="outline" onClick={() => confirm(verify, outcome.reference, setOutcome)}>
                Check again
              </Button>
            </div>
          )}
          {outcome?.kind === 'failed' && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              The payment did not go through, so your plan was not changed. You can try again below.
            </p>
          )}
          {outcome?.kind === 'error' && (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {outcome.message}
              {outcome.reference && (
                <Button size="sm" variant="outline" onClick={() => confirm(verify, outcome.reference as string, setOutcome)}>
                  Try again
                </Button>
              )}
            </div>
          )}
          {checkoutMutation.error && (
            <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              {getErrorMessage(checkoutMutation.error, 'We could not start the payment.')}
            </p>
          )}

          {overviewQuery.isLoading ? (
            <div role="status" aria-label="Loading billing" className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : overviewQuery.isError || !overview || !sub ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <div>
                <AlertTitle>Couldn’t load billing</AlertTitle>
                <AlertDescription>
                  <p>{getErrorMessage(overviewQuery.error, 'We couldn’t load your billing details.')}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => void overviewQuery.refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                    Try again
                  </Button>
                </AlertDescription>
              </div>
            </Alert>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Your plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-2xl font-semibold">{sub.planName}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{statusLabel}</p>
                  {paidUntil && <p className="text-sm">Paid until {paidUntil}. Plans are not renewed automatically.</p>}
                  {sub.expired && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Your paid plan ended{endedOn ? ` on ${endedOn}` : ''}. You are back on the Free plan.
                    </p>
                  )}
                  {!overview.paymentsConfigured && (
                    <p className="pt-2 text-sm text-amber-700 dark:text-amber-400">Payments are not set up on this server yet, so plans cannot be bought.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {overview.usage.map((item) => (
                    <div key={item.key}>
                      <div className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span>
                          {item.used.toLocaleString()} of {item.limit.toLocaleString()}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${item.label} used`}
                        aria-valuemin={0}
                        aria-valuemax={item.limit}
                        aria-valuenow={Math.min(item.used, item.limit)}
                        className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                      >
                        <div className={`h-full rounded-full ${item.percent >= 90 ? 'bg-red-500' : 'bg-indigo-600'}`} style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-slate-500">
                    {overview.enforcement ? 'Your plan limits are enforced.' : 'Plan limits are shown but not enforced yet.'}
                  </p>
                </CardContent>
              </Card>

              <section aria-labelledby="plans-heading" className="space-y-3">
                <h2 id="plans-heading" className="text-lg font-semibold">
                  Plans
                </h2>
                {!canManage && <p className="text-sm text-slate-600 dark:text-slate-400">Only people who can manage billing can change the plan.</p>}
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Plans">
                  {overview.plans.map((plan) => (
                    <li key={plan.id} className="list-none rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold">{plan.name}</h3>
                        {plan.current && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">Current plan</span>}
                      </div>
                      <p className="mt-1 text-xl font-semibold">{plan.priceKobo === 0 ? 'Free' : `${money(plan.priceKobo, overview.currency)} / 30 days`}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{plan.description}</p>
                      <ul className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
                        <li>{plan.limits.agents} AI agents</li>
                        <li>{plan.limits.teamMembers} team members</li>
                        <li>{plan.limits.channels} channels</li>
                        <li>{plan.limits.aiRepliesPerMonth.toLocaleString()} AI replies a month</li>
                      </ul>
                      {plan.priceKobo > 0 && canManage && (
                        <Button
                          className="mt-4 w-full"
                          size="sm"
                          variant={plan.current ? 'outline' : 'default'}
                          disabled={!overview.paymentsConfigured || checkoutMutation.isPending}
                          aria-label={`Choose ${plan.name}`}
                          onClick={() => choose(plan)}
                        >
                          {checkoutMutation.isPending && checkoutMutation.variables?.planId === plan.id ? 'Opening payment…' : plan.current ? 'Add 30 days' : 'Choose plan'}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
