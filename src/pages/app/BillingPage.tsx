import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { fetchBillingOverview, checkout, verifyPayment } from '../../services/api/billing';
import type { BillingOverview } from '../../services/api/billing';
import { getErrorMessage } from '../../utils/apiError';

function formatPrice(priceKobo: number, currency: string): string {
  if (priceKobo === 0) return 'Free';
  const major = priceKobo / 100;
  const formatted = new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(major);
  return `${formatted} ${currency}`;
}

function formatPercent(percent: number): string {
  return `${percent}%`;
}

export function BillingPage() {
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activated, setActivated] = useState<{ status: string; activated: boolean } | null>(null);
  const [activatedLoading, setActivatedLoading] = useState(false);

  async function refreshOverview() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBillingOverview();
      setOverview(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshOverview();
  }, []);

  async function handleCheckout(planId: string) {
    setCheckoutLoading(planId);
    setActivated(null);
    setError(null);
    try {
      const result = await checkout({ planId });
      window.location.href = result.authorizationUrl;
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setCheckoutLoading(null);
    }
  }

  async function handleVerify() {
    if (!overview?.subscription?.periodEnd || overview.subscription.status === 'expired') return;
    setActivatedLoading(true);
    try {
      const result = await verifyPayment({ reference: String(Date.now()) });
      setActivated({ status: result.status, activated: result.activated });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActivatedLoading(false);
    }
  }

  if (loading && !overview) {
    return (
      <div className="space-y-6">
        <PageTitle title="Billing" description="Manage your subscription plans and usage" icon={DollarSign} />
        <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Loading billing overview…</span>
        </div>
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="space-y-6">
        <PageTitle title="Billing" description="Manage your subscription plans and usage" icon={DollarSign} />
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-900/20 dark:text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  if (!overview) return null;

  const sub = overview.subscription;
  const effectivePlan = overview.plans.find((p) => p.id === sub.planId) ?? overview.plans[0];
  const paymentEnabled = overview.paymentsConfigured;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Billing &amp; Subscription"
        description="Your current plan, usage, and how to upgrade"
        icon={DollarSign}
        action={!paymentEnabled ? (
          <Button variant="outline" onClick={refreshOverview}>
            <AlertCircle className="mr-2 h-4 w-4" aria-hidden="true" />
            Check status
          </Button>
        ) : undefined}
      />

      {paymentEnabled && (
        <Card>
          <CardContent className="space-y-4 py-6">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Plan</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{effectivePlan?.name ?? sub.planId}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Status</dt>
                <dd className={sub.status === 'active' ? 'mt-1 text-lg font-semibold text-green-700 dark:text-green-300' : 'mt-1 text-lg font-semibold text-orange-700 dark:text-orange-300'}>
                  {sub.status}
                  {sub.expired && sub.status !== 'active' ? <span className="block text-xs text-slate-500">• expired</span> : null}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">Period ends</dt>
                <dd className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-50">{sub.periodEnd ? new Date(sub.periodEnd).toLocaleDateString() : '—'}</dd>
              </div>
            </dl>

            {sub.status !== 'active' && !sub.expired && (
              <div className="flex items-center justify-between rounded-lg bg-amber-50 p-4 dark:bg-amber-900/20">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300">This plan expires on {new Date(sub.periodEnd!).toLocaleDateString()}</p>
                <Button variant="outline" size="sm" onClick={handleVerify} disabled={activatedLoading}>
                  {activatedLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />}
                  Redeem now
                </Button>
              </div>
            )}

            {sub.expired && (
              <div className="rounded-lg border border-orange-300 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300">Your current plan has expired. Upgrade below to keep your team active.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {!paymentEnabled && (
        <Card>
          <CardContent className="space-y-3 py-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">Payments are not configured yet. Set PAYSTACK_SECRET_KEY to start buying plans.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Usage this month</CardTitle>
          <CardDescription>How much of your current plan you have used</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.usage.map((item) => (
            <div key={item.key}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                <span className="text-slate-500 dark:text-slate-400">
                  {item.used.toLocaleString()} / {item.limit.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-[width] ${
                    item.percent >= 90 ? 'bg-red-500' : item.percent >= 70 ? 'bg-amber-500' : 'bg-indigo-500'
                  }`}
                  style={{ width: `${Math.min(100, item.percent)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plans &amp; Prices</CardTitle>
          <CardDescription>Choose a plan to upgrade. Prices in {overview.currency}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {overview.plans.map((plan) => (
            <div key={plan.id}>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-950 dark:text-slate-50">{plan.name}</span>
                    {plan.current && (
                      <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">Current</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.description}</p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-950 dark:text-slate-50">{formatPrice(plan.priceKobo, overview.currency)}</span>
                  {plan.priceKobo > 0 && (
                    <button
                      onClick={() => handleCheckout(plan.id)}
                      disabled={checkoutLoading === plan.id}
                      className="ml-3 mt-1 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {checkoutLoading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <DollarSign className="h-4 w-4" aria-hidden="true" />}
                      Upgrade
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
