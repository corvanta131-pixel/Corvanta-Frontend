import { useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, FileText, Lock, RefreshCw } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent } from '../../components/ui/Card';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage, isForbiddenError } from '../../utils/apiError';
import { useAuditLogs } from '../../features/audit/hooks';
import type { AuditQuery } from '../../features/audit/types';

const PAGE_SIZE = 25;

function toIsoStart(date: string): string | undefined {
  return date ? new Date(`${date}T00:00:00`).toISOString() : undefined;
}
function toIsoEnd(date: string): string | undefined {
  return date ? new Date(`${date}T23:59:59.999`).toISOString() : undefined;
}
function formatWhen(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString();
}

interface FilterInputs {
  action: string;
  entityType: string;
  from: string;
  to: string;
}
const EMPTY: FilterInputs = { action: '', entityType: '', from: '', to: '' };

export function AuditPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('audit:read', user);

  const [inputs, setInputs] = useState<FilterInputs>(EMPTY);
  const [applied, setApplied] = useState<FilterInputs>(EMPTY);
  const [page, setPage] = useState(1);

  const query: AuditQuery = {
    page,
    limit: PAGE_SIZE,
    action: applied.action,
    entityType: applied.entityType,
    from: toIsoStart(applied.from),
    to: toIsoEnd(applied.to),
  };
  const { data, isLoading, isError, error, refetch, isFetching } = useAuditLogs(query, canRead);

  const invalidRange = inputs.from !== '' && inputs.to !== '' && inputs.from > inputs.to;
  const filtersActive = Object.values(applied).some((v) => v !== '');

  const apply = () => {
    if (invalidRange) return;
    setApplied(inputs);
    setPage(1);
  };
  const clear = () => {
    setInputs(EMPTY);
    setApplied(EMPTY);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Audit"
        description="A read-only record of who did what in your workspace"
        icon={FileText}
      />

      {!canRead ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Restricted access</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              You don’t have permission to view audit logs. Ask a workspace owner if you need access.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <form
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end"
            onSubmit={(e) => {
              e.preventDefault();
              apply();
            }}
          >
            <div className="space-y-1">
              <Label htmlFor="audit-action">Action</Label>
              <Input
                id="audit-action"
                value={inputs.action}
                onChange={(e) => setInputs({ ...inputs, action: e.target.value })}
                placeholder="e.g. customer.created"
                maxLength={100}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="audit-entity">Record type</Label>
              <Input
                id="audit-entity"
                value={inputs.entityType}
                onChange={(e) => setInputs({ ...inputs, entityType: e.target.value })}
                placeholder="e.g. Customer"
                maxLength={100}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="audit-from">From</Label>
              <Input
                id="audit-from"
                type="date"
                value={inputs.from}
                onChange={(e) => setInputs({ ...inputs, from: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="audit-to">To</Label>
              <Input
                id="audit-to"
                type="date"
                value={inputs.to}
                onChange={(e) => setInputs({ ...inputs, to: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={invalidRange}>Apply</Button>
              <Button type="button" variant="outline" onClick={clear} disabled={!filtersActive && inputs === EMPTY}>
                Clear
              </Button>
            </div>
            {invalidRange && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400 sm:col-span-2 lg:col-span-5">
                “From” must be on or before “To”.
              </p>
            )}
          </form>

          {isLoading ? (
            <div role="status" aria-label="Loading audit logs" className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
          ) : isError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <div>
                <AlertTitle>{isForbiddenError(error) ? 'Access denied' : 'Couldn’t load audit logs'}</AlertTitle>
                <AlertDescription>
                  <p>{getErrorMessage(error, 'We couldn’t load audit logs.')}</p>
                  {!isForbiddenError(error) && (
                    <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()} disabled={isFetching}>
                      <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                      Try again
                    </Button>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          ) : !data || data.data.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h2 className="text-lg font-semibold">
                  {filtersActive ? 'No matching activity' : 'No activity recorded yet'}
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {filtersActive
                    ? 'Nothing matches these filters.'
                    : 'Actions taken in your workspace, such as changes to customers, team members and channels, will appear here.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <caption className="sr-only">Audit log</caption>
                  <thead className="bg-slate-50 dark:bg-slate-900">
                    <tr>
                      {['When', 'Who', 'Action', 'Record', 'Details'].map((h) => (
                        <th
                          key={h}
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                    {data.data.map((entry) => (
                      <tr key={entry._id} className="align-top">
                        <td className="px-4 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {formatWhen(entry.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          {entry.actor ? (
                            <>
                              <div className="font-medium">{entry.actor.name}</div>
                              <div className="text-slate-500">{entry.actor.email}</div>
                            </>
                          ) : (
                            <span className="text-slate-500">System or removed user</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs">{entry.action}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                          {entry.entityType || '—'}
                          {entry.entityId && <div className="text-xs text-slate-500 break-all">{entry.entityId}</div>}
                        </td>
                        <td className="px-4 py-3">
                          {Object.keys(entry.metadata).length === 0 ? (
                            <span className="text-slate-500">—</span>
                          ) : (
                            <details>
                              <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400">View</summary>
                              <pre className="mt-2 max-w-xs overflow-x-auto rounded bg-slate-100 dark:bg-slate-900 p-2 text-xs">
                                {JSON.stringify(entry.metadata, null, 2)}
                              </pre>
                            </details>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <nav className="flex items-center justify-between" aria-label="Audit log pages">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} records
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1 || isFetching}>
                    <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page >= data.pagination.totalPages || isFetching}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Button>
                </div>
              </nav>
            </>
          )}
        </>
      )}
    </div>
  );
}
