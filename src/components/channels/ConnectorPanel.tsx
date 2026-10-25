import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import {
  useClearConnector,
  useConnector,
  useRotateSigningSecret,
  useSaveConnector,
  useTestConnector,
} from '../../features/channels/hooks';
import { useAgents } from '../../features/agents/hooks';
import type { ConnectorSaveInput } from '../../features/channels/types';
import { getErrorMessage } from '../../utils/apiError';

interface ConnectorPanelProps {
  channelId: string;
  canEdit: boolean;
  canReadAgents: boolean;
}

interface FormState {
  values: Record<string, string>;
  agentId: string;
  aiReplies: boolean;
  enabled: boolean;
}

const selectClass =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';

async function copy(text: string, what: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${what} copied.`);
  } catch {
    toast.error('Couldn’t copy automatically. Select the text and copy it manually.');
  }
}

/** Set-up screen for one messaging channel (WhatsApp, Messenger, Instagram, SMS or email). */
export function ConnectorPanel({ channelId, canEdit, canReadAgents }: ConnectorPanelProps) {
  const { data, isLoading, isError, error, refetch } = useConnector(channelId);
  const agents = useAgents(canReadAgents);
  const save = useSaveConnector(channelId);
  const test = useTestConnector(channelId);
  const rotate = useRotateSigningSecret(channelId);
  const clear = useClearConnector(channelId);
  const [form, setForm] = useState<FormState | null>(null);
  const [revealed, setRevealed] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<'rotate' | 'clear' | null>(null);

  useEffect(() => {
    if (data) {
      setForm({
        values: Object.fromEntries(data.fields.map((f) => [f.name, f.secret ? '' : (f.display ?? '')])),
        agentId: data.settings.agentId ?? '',
        aiReplies: data.settings.aiReplies,
        enabled: data.enabled,
      });
    }
  }, [data]);

  if (isLoading || (data && !form)) return <p role="status" className="text-sm text-slate-500">Loading connection…</p>;
  if (isError || !data || !form) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <div>
          <AlertTitle>Couldn’t load this connection</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(error, 'We couldn’t load the connection settings.')}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  const setValue = (name: string, value: string) => setForm({ ...form, values: { ...form.values, [name]: value } });

  const buildInput = (): ConnectorSaveInput => {
    const credentials: Record<string, string> = {};
    for (const field of data.fields) {
      const typed = (form.values[field.name] ?? '').trim();
      const changed = field.secret ? typed !== '' : typed !== (field.display ?? '');
      if (changed) credentials[field.name] = typed;
    }
    return {
      ...(Object.keys(credentials).length > 0 ? { credentials } : {}),
      agentId: form.agentId || null,
      aiReplies: form.aiReplies,
      enabled: form.enabled,
    };
  };

  const submit = async () => {
    try {
      const view = await save.mutateAsync(buildInput());
      if (view.revealed?.signingSecret) setRevealed(view.revealed.signingSecret);
      toast.success(`${data.label} settings saved.`);
    } catch {
      // Shown below via save.error; the form keeps what was typed.
    }
  };

  const runTest = async () => {
    try {
      const view = await test.mutateAsync();
      if (view.lastTest?.ok) toast.success(view.lastTest.message);
      else toast.error(view.lastTest?.message ?? 'The connection test failed.');
    } catch {
      // Shown below via test.error.
    }
  };

  const doRotate = async () => {
    try {
      const view = await rotate.mutateAsync();
      if (view.revealed?.signingSecret) setRevealed(view.revealed.signingSecret);
      toast.success('A new signing secret was created. Update it wherever you forward email.');
      setConfirm(null);
    } catch {
      // Shown in the dialog via rotate.error.
    }
  };

  const doClear = async () => {
    try {
      await clear.mutateAsync();
      setRevealed(null);
      toast.success('The saved credentials were removed and the channel was switched off.');
      setConfirm(null);
    } catch {
      // Shown in the dialog via clear.error.
    }
  };

  const activeAgents = (agents.data ?? []).filter((a) => a.status === 'active');
  const missingAgent = form.agentId !== '' && !(agents.data ?? []).some((a) => a._id === form.agentId);
  const unsaved = JSON.stringify(buildInput().credentials ?? {}) !== '{}';

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        {data.ready ? (
          <p className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Ready. {data.label} is connected and switched on.
          </p>
        ) : (
          <div>
            <p className="text-sm font-medium">Not live yet</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-600 dark:text-slate-400">
              {data.problems.map((problem) => (
                <li key={problem}>{problem}</li>
              ))}
            </ul>
          </div>
        )}
        {data.lastTest && (
          <p className="mt-3 text-xs text-slate-500">
            Last test: {data.lastTest.ok ? 'passed' : 'failed'}. {data.lastTest.message}
          </p>
        )}
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <h3 className="font-semibold">{data.label} credentials</h3>
        {data.fields.map((field) => (
          <div key={field.name} className="space-y-1">
            <Label htmlFor={`${channelId}-${field.name}`}>{field.label}</Label>
            <Input
              id={`${channelId}-${field.name}`}
              type={field.secret ? 'password' : 'text'}
              autoComplete="off"
              value={form.values[field.name] ?? ''}
              disabled={!canEdit}
              placeholder={field.secret && field.configured ? `Saved (${field.display}). Leave blank to keep it.` : ''}
              onChange={(e) => setValue(field.name, e.target.value)}
            />
            <p className="text-xs text-slate-500">{field.help}</p>
          </div>
        ))}

        <h3 className="pt-2 font-semibold">How your assistant answers</h3>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.aiReplies}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, aiReplies: e.target.checked })}
          />
          Let the AI agent answer customers automatically
        </label>
        <div className="space-y-1">
          <Label htmlFor={`${channelId}-agent`}>AI agent</Label>
          <select
            id={`${channelId}-agent`}
            className={selectClass}
            value={form.agentId}
            disabled={!canEdit || !canReadAgents}
            onChange={(e) => setForm({ ...form, agentId: e.target.value })}
          >
            <option value="">No agent (your team answers)</option>
            {missingAgent && <option value={form.agentId}>Current agent</option>}
            {(agents.data ?? []).map((a) => (
              <option key={a._id} value={a._id}>
                {a.name}
                {a.status === 'active' ? '' : ` (${a.status})`}
              </option>
            ))}
          </select>
          {!canReadAgents ? (
            <p className="text-xs text-slate-500">You don’t have permission to list agents.</p>
          ) : activeAgents.length === 0 && !agents.isLoading ? (
            <p className="text-xs text-amber-700 dark:text-amber-400">You have no active agents. Only an active agent can answer.</p>
          ) : null}
        </div>

        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={form.enabled}
            disabled={!canEdit}
            onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
          />
          This channel is switched on
        </label>

        {save.error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {getErrorMessage(save.error)}
          </p>
        )}

        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? 'Saving…' : 'Save settings'}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={test.isPending || !data.credentialsSaved || unsaved}
              onClick={() => void runTest()}
            >
              {test.isPending ? 'Testing…' : 'Test connection'}
            </Button>
            {data.credentialsSaved && (
              <Button type="button" variant="ghost" onClick={() => setConfirm('clear')}>
                Remove credentials
              </Button>
            )}
          </div>
        ) : (
          <p className="text-sm text-slate-500">You can view these settings but not change them.</p>
        )}
        {unsaved && <p className="text-xs text-slate-500">Save your changes, then test the connection.</p>}
        {test.error && (
          <p role="alert" className="text-sm text-red-600 dark:text-red-400">
            {getErrorMessage(test.error)}
          </p>
        )}
      </form>

      <section aria-labelledby={`${channelId}-webhook`} className="space-y-3 rounded-xl border border-slate-200 p-4 dark:border-slate-800">
        <h3 id={`${channelId}-webhook`} className="font-semibold">
          Connect {data.label} to Corvanta
        </h3>
        {data.webhook.url ? (
          <>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {data.type === 'email'
                ? 'Send incoming email to this address (a forwarder such as Zapier, Make, Postmark or Mailgun can do it), signed with your signing secret.'
                : `Paste this address into ${data.label}’s webhook settings.`}
            </p>
            <div className="space-y-1">
              <Label htmlFor={`${channelId}-url`}>Webhook address</Label>
              <div className="flex gap-2">
                <Input id={`${channelId}-url`} readOnly value={data.webhook.url} />
                <Button type="button" variant="outline" onClick={() => void copy(data.webhook.url ?? '', 'Webhook address')}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Copy webhook address</span>
                </Button>
              </div>
            </div>
            {data.webhook.verifyToken && (
              <div className="space-y-1">
                <Label htmlFor={`${channelId}-token`}>Verify token</Label>
                <div className="flex gap-2">
                  <Input id={`${channelId}-token`} readOnly value={data.webhook.verifyToken} />
                  <Button type="button" variant="outline" onClick={() => void copy(data.webhook.verifyToken ?? '', 'Verify token')}>
                    <Copy className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Copy verify token</span>
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Meta asks for this when you add the webhook.</p>
              </div>
            )}
            {data.webhook.needsSigningSecret && (
              <div className="space-y-2">
                {revealed ? (
                  <div role="status" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/20">
                    <p className="font-medium">Your signing secret (shown only now)</p>
                    <code className="mt-1 block break-all text-xs">{revealed}</code>
                    <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => void copy(revealed, 'Signing secret')}>
                      Copy secret
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    The signing secret was shown once when it was created. Create a new one if you have lost it.
                  </p>
                )}
                {canEdit && (
                  <Button type="button" size="sm" variant="ghost" onClick={() => setConfirm('rotate')}>
                    Create a new signing secret
                  </Button>
                )}
              </div>
            )}
          </>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">Save your settings to get your webhook address.</p>
        )}
      </section>

      <ConfirmDialog
        open={confirm === 'clear'}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null);
            clear.reset();
          }
        }}
        onConfirm={() => void doClear()}
        title="Remove saved credentials"
        confirmLabel="Remove credentials"
        pendingLabel="Removing…"
        isPending={clear.isPending}
        errorMessage={clear.error ? getErrorMessage(clear.error) : null}
      >
        The channel will be switched off and customers on {data.label} will get no replies until you save credentials and switch it on again.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm === 'rotate'}
        onOpenChange={(open) => {
          if (!open) {
            setConfirm(null);
            rotate.reset();
          }
        }}
        onConfirm={() => void doRotate()}
        title="Create a new signing secret"
        confirmLabel="Create new secret"
        pendingLabel="Creating…"
        isPending={rotate.isPending}
        errorMessage={rotate.error ? getErrorMessage(rotate.error) : null}
      >
        The old secret stops working immediately. Update it in whatever forwards your email, or incoming email will be rejected.
      </ConfirmDialog>
    </div>
  );
}
