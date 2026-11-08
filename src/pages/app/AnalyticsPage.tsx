import { useState } from 'react';
import { Activity, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage } from '../../utils/apiError';
import { useAnalytics } from '../../features/analytics/hooks';

const RANGES = [7, 30, 90] as const;

const CHANNELS: Record<string, string> = {
  webchat: 'Website chat',
  whatsapp: 'WhatsApp',
  messenger: 'Messenger',
  instagram: 'Instagram',
  sms: 'SMS',
  email: 'Email',
  api: 'API',
};
const STATUSES: Record<string, string> = { open: 'Open', waiting: 'Waiting', resolved: 'Resolved', archived: 'Archived' };
const HANDLING: Record<string, string> = { AI: 'AI answers', HUMAN: 'Team answers', HYBRID: 'AI and team' };

/** "43s", "4m 20s", "2h 5m". */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function Bars({ title, data, labels }: { title: string; data: Record<string, number>; labels: Record<string, string> }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...entries.map(([, n]) => n));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-500">Nothing in this period.</p>
        ) : (
          <ul className="space-y-3" aria-label={title}>
            {entries.map(([key, count]) => (
              <li key={key} className="list-none">
                <div className="flex justify-between text-sm">
                  <span>{labels[key] ?? key}</span>
                  <span>{count.toLocaleString()}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800" aria-hidden="true">
                  <div className="h-full rounded-full bg-indigo-600" style={{ width: `${Math.round((count / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function Columns({ title, summary, days }: { title: string; summary: string; days: { date: string; parts: { value: number; className: string }[] }[] }) {
  const max = Math.max(1, ...days.map((d) => d.parts.reduce((sum, p) => sum + p.value, 0)));
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div role="img" aria-label={summary} className="flex h-40 items-end gap-px">
          {days.map((day) => {
            const total = day.parts.reduce((sum, p) => sum + p.value, 0);
            return (
              <div key={day.date} className="flex h-full flex-1 flex-col justify-end" title={`${day.date}: ${total}`}>
                {day.parts.map((part, index) => (
                  <div key={index} className={part.className} style={{ height: `${(part.value / max) * 100}%` }} />
                ))}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {days[0]?.date} to {days[days.length - 1]?.date}. Days are counted in UTC.
        </p>
      </CardContent>
    </Card>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <Card>
      <CardContent className="py-5">
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
        <p className="mt-1 text-3xl font-semibold">{value}</p>
        {note && <p className="mt-1 text-xs text-slate-500">{note}</p>}
      </CardContent>
    </Card>
  );
}

export function AnalyticsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('analytics:read', user);
  const [days, setDays] = useState<number>(30);
  const query = useAnalytics(days, canRead);
  const data = query.data;

  const busiest = data ? data.conversations.perDay.reduce((best, d) => (d.count > best.count ? d : best), { date: '', count: 0 }) : null;

  return (
    <div className="space-y-6">
      <PageTitle
        title="Analytics"
        description="How your assistant and team are doing"
        icon={Activity}
        action={
          canRead ? (
            <div>
              <label htmlFor="analytics-range" className="sr-only">
                Time range
              </label>
              <select
                id="analytics-range"
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                {RANGES.map((r) => (
                  <option key={r} value={r}>
                    Last {r} days
                  </option>
                ))}
              </select>
            </div>
          ) : undefined
        }
      />

      {!canRead ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Restricted access</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">You don’t have permission to view analytics. Ask a workspace owner if you need access.</p>
          </CardContent>
        </Card>
      ) : query.isLoading ? (
        <div role="status" aria-label="Loading analytics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : query.isError || !data ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <div>
            <AlertTitle>Couldn’t load analytics</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(query.error, 'We couldn’t load your analytics.')}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => void query.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                Try again
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      ) : (
        <>
          <section aria-label="Key numbers" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Conversations" value={data.conversations.total.toLocaleString()} note="Started in this period" />
            <Kpi label="Messages" value={data.messages.total.toLocaleString()} note="Customers, AI and team" />
            <Kpi
              label="Average first response"
              value={data.responseTime.averageSeconds === null ? '—' : formatDuration(data.responseTime.averageSeconds)}
              note={
                data.responseTime.averageSeconds === null
                  ? 'No conversation had both a customer message and a reply in this period.'
                  : `Across ${data.responseTime.conversationsMeasured.toLocaleString()} conversations (AI or team, whoever replied first)`
              }
            />
            <Kpi label="New customers" value={data.customers.new.toLocaleString()} note={`${data.customers.total.toLocaleString()} in total`} />
          </section>

          {data.conversations.total === 0 && data.messages.total === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <h2 className="text-lg font-semibold">No conversations in this period yet</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">Once customers start chatting, you will see volumes, who answered them and how fast.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                <Columns
                  title="Conversations per day"
                  summary={`Conversations per day: ${data.conversations.total} in total${busiest && busiest.count > 0 ? `, busiest day ${busiest.date} with ${busiest.count}` : ''}`}
                  days={data.conversations.perDay.map((d) => ({ date: d.date, parts: [{ value: d.count, className: 'bg-indigo-600' }] }))}
                />
                <Columns
                  title="Messages per day"
                  summary={`Messages per day: ${data.messages.fromCustomers} from customers, ${data.messages.fromAI} from the AI, ${data.messages.fromTeam} from your team`}
                  days={data.messages.perDay.map((d) => ({
                    date: d.date,
                    parts: [
                      { value: d.customers, className: 'bg-slate-400' },
                      { value: d.ai, className: 'bg-indigo-600' },
                      { value: d.team, className: 'bg-emerald-500' },
                    ],
                  }))}
                />
              </div>
              <p className="text-xs text-slate-500">Messages per day: grey are customers, indigo the AI, green your team.</p>

              <div className="grid gap-4 lg:grid-cols-3">
                <Bars
                  title="Who answered"
                  data={{ AI: data.messages.fromAI, HUMAN: data.messages.fromTeam }}
                  labels={{ AI: 'AI replies', HUMAN: 'Team replies' }}
                />
                <Bars title="Conversations by channel" data={data.conversations.byChannel} labels={CHANNELS} />
                <Bars title="Conversations by status" data={data.conversations.byStatus} labels={STATUSES} />
              </div>
              <Bars title="How conversations are handled" data={data.conversations.byHandling} labels={HANDLING} />
            </>
          )}
        </>
      )}
    </div>
  );
}
