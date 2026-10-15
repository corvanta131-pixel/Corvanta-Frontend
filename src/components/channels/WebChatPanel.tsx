import { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useWidgetSettings, useSaveWidgetSettings } from '../../features/channels/hooks';
import { useAgents } from '../../features/agents/hooks';
import { getErrorMessage } from '../../utils/apiError';

interface WebChatPanelProps {
  channelId: string;
  canEdit: boolean;
  canReadAgents: boolean;
}

interface FormState {
  enabled: boolean;
  title: string;
  welcomeMessage: string;
  color: string;
  agentId: string;
  originsText: string;
}

const selectClass =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';

export function parseOrigins(text: string): string[] {
  return text
    .split(/[\n,]/)
    .map((line) => line.trim())
    .filter(Boolean);
}

export function WebChatPanel({ channelId, canEdit, canReadAgents }: WebChatPanelProps) {
  const { data, isLoading, isError, error, refetch } = useWidgetSettings(channelId);
  const agents = useAgents(canReadAgents);
  const save = useSaveWidgetSettings(channelId);
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmRotate, setConfirmRotate] = useState(false);

  useEffect(() => {
    if (data) {
      setForm({
        enabled: data.enabled,
        title: data.widget.title,
        welcomeMessage: data.widget.welcomeMessage,
        color: data.widget.color,
        agentId: data.widget.agentId ?? '',
        originsText: data.widget.allowedOrigins.join('\n'),
      });
    }
  }, [data]);

  if (isLoading || (data && !form)) {
    return <p role="status" className="text-sm text-slate-500">Loading chat settings…</p>;
  }
  if (isError || !data || !form) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" aria-hidden="true" />
        <div>
          <AlertTitle>Couldn’t load chat settings</AlertTitle>
          <AlertDescription>
            <p>{getErrorMessage(error, 'We couldn’t load the chat settings.')}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={() => void refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
              Try again
            </Button>
          </AlertDescription>
        </div>
      </Alert>
    );
  }

  const set = <K extends keyof FormState>(field: K, value: FormState[K]) => setForm({ ...form, [field]: value });

  const submit = async () => {
    try {
      await save.mutateAsync({
        enabled: form.enabled,
        title: form.title,
        welcomeMessage: form.welcomeMessage,
        color: form.color,
        agentId: form.agentId || null,
        allowedOrigins: parseOrigins(form.originsText),
      });
      toast.success('Chat settings saved.');
    } catch {
      // Shown below via save.error; the form keeps the user's values.
    }
  };

  const rotate = async () => {
    try {
      await save.mutateAsync({ rotateKey: true });
      toast.success('A new embed code was generated. Update it on your website.');
      setConfirmRotate(false);
    } catch {
      // Shown in the dialog via save.error.
    }
  };

  const copySnippet = async () => {
    if (!data.embedSnippet) return;
    try {
      await navigator.clipboard.writeText(data.embedSnippet);
      toast.success('Embed code copied.');
    } catch {
      toast.error('Couldn’t copy automatically. Select the code and copy it manually.');
    }
  };

  const activeAgents = (agents.data ?? []).filter((a) => a.status === 'active');
  const selectedAgentMissing = form.agentId !== '' && !(agents.data ?? []).some((a) => a._id === form.agentId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Website chat status</CardTitle>
        </CardHeader>
        <CardContent>
          {data.ready ? (
            <p className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Ready. Visitors on your allowed websites can chat with “{data.widget.agentName}”.
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void submit();
            }}
          >
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.enabled}
                disabled={!canEdit}
                onChange={(e) => set('enabled', e.target.checked)}
              />
              Chat is switched on
            </label>

            <div className="space-y-2">
              <Label htmlFor="widget-agent">AI agent that answers visitors</Label>
              <select
                id="widget-agent"
                className={selectClass}
                value={form.agentId}
                disabled={!canEdit || !canReadAgents}
                onChange={(e) => set('agentId', e.target.value)}
              >
                <option value="">Choose an agent…</option>
                {selectedAgentMissing && <option value={form.agentId}>Current agent</option>}
                {(agents.data ?? []).map((a) => (
                  <option key={a._id} value={a._id}>
                    {a.name}
                    {a.status === 'active' ? '' : ` (${a.status})`}
                  </option>
                ))}
              </select>
              {!canReadAgents ? (
                <p className="text-xs text-slate-500">You don’t have permission to list agents.</p>
              ) : agents.isError ? (
                <p role="alert" className="text-xs text-red-600 dark:text-red-400">
                  {getErrorMessage(agents.error, 'Couldn’t load agents.')}
                </p>
              ) : activeAgents.length === 0 && !agents.isLoading ? (
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  You have no active agents. Only an agent whose status is “active” can answer visitors.
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-origins">Websites where the chat may appear</Label>
              <textarea
                id="widget-origins"
                rows={3}
                className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                value={form.originsText}
                disabled={!canEdit}
                placeholder={'https://www.yourshop.com\nhttps://yourshop.com'}
                onChange={(e) => set('originsText', e.target.value)}
              />
              <p className="text-xs text-slate-500">
                One address per line, with https:// and no path. Visitors on any other website cannot use your chat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="widget-title">Chat title</Label>
                <Input
                  id="widget-title"
                  value={form.title}
                  maxLength={60}
                  disabled={!canEdit}
                  onChange={(e) => set('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="widget-color">Brand colour</Label>
                <input
                  id="widget-color"
                  type="color"
                  className="h-10 w-full rounded-md border border-slate-300 bg-white p-1 dark:border-slate-700"
                  value={form.color}
                  disabled={!canEdit}
                  onChange={(e) => set('color', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="widget-welcome">Welcome message</Label>
              <Input
                id="widget-welcome"
                value={form.welcomeMessage}
                maxLength={300}
                disabled={!canEdit}
                onChange={(e) => set('welcomeMessage', e.target.value)}
              />
            </div>

            {save.error && !confirmRotate && (
              <p role="alert" className="text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2">
                {getErrorMessage(save.error)}
              </p>
            )}

            {canEdit ? (
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && !confirmRotate ? 'Saving…' : 'Save settings'}
              </Button>
            ) : (
              <p className="text-sm text-slate-500">You can view these settings but not change them.</p>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Embed code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.embedSnippet ? (
            <>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Paste this once into your website, just before the closing &lt;/body&gt; tag.
              </p>
              <textarea
                readOnly
                aria-label="Embed code"
                rows={3}
                className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs dark:border-slate-700 dark:bg-slate-900"
                value={data.embedSnippet}
              />
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => void copySnippet()}>
                  <Copy className="h-4 w-4 mr-2" aria-hidden="true" />
                  Copy code
                </Button>
                {canEdit && (
                  <Button variant="ghost" size="sm" onClick={() => setConfirmRotate(true)}>
                    Generate a new code
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {canEdit
                ? 'Save your settings to generate the embed code.'
                : 'The embed code appears once an administrator saves the settings.'}
            </p>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirmRotate}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmRotate(false);
            save.reset();
          }
        }}
        onConfirm={() => void rotate()}
        title="Generate a new embed code"
        confirmLabel="Generate new code"
        pendingLabel="Generating…"
        isPending={save.isPending}
        errorMessage={save.error ? getErrorMessage(save.error) : null}
      >
        The current embed code will stop working immediately. You will need to paste the new code into your website.
      </ConfirmDialog>
    </div>
  );
}
