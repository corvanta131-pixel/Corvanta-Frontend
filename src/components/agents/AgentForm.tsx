import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import { AGENT_STATUS_LABELS } from '../../features/agents/agentUtils';
import { AGENT_STATUSES, type Agent, type AgentInput, type AgentOptions } from '../../features/agents/types';
import type { KnowledgeBaseSummary } from '../../features/knowledge/types';

/** Mirrors the backend validators and the server's own limits (from /agents/options). */
export function makeAgentSchema(limits: AgentOptions['limits']) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(limits.nameLength.min, `Name must be at least ${limits.nameLength.min} characters`)
      .max(limits.nameLength.max, `Name must be at most ${limits.nameLength.max} characters`),
    description: z.string().max(limits.descriptionMax, `Description must be at most ${limits.descriptionMax} characters`),
    status: z.enum(['draft', 'active', 'disabled', 'archived']),
    provider: z.string().min(1, 'Choose a provider'),
    model: z.string().min(1, 'Choose a model'),
    temperature: z
      .number({ invalid_type_error: `Enter a number from ${limits.temperature.min} to ${limits.temperature.max}` })
      .min(limits.temperature.min, `Must be at least ${limits.temperature.min}`)
      .max(limits.temperature.max, `Must be at most ${limits.temperature.max}`),
    maxTokens: z
      .number({ invalid_type_error: 'Enter a whole number' })
      .int('Enter a whole number')
      .min(limits.maxTokens.min, `Must be at least ${limits.maxTokens.min}`)
      .max(limits.maxTokens.max, `The server allows at most ${limits.maxTokens.max}`),
    promptTemplate: z.string().max(limits.promptTemplateMax, `Instructions must be at most ${limits.promptTemplateMax} characters`),
    knowledgeBaseIds: z.array(z.string()),
  });
}

export type AgentFormValues = z.infer<ReturnType<typeof makeAgentSchema>>;

export function buildAgentPayload(values: AgentFormValues): AgentInput {
  return {
    name: values.name,
    description: values.description.trim(),
    status: values.status,
    provider: values.provider,
    model: values.model,
    temperature: values.temperature,
    maxTokens: values.maxTokens,
    promptTemplate: values.promptTemplate,
    knowledgeBaseIds: values.knowledgeBaseIds,
  };
}

interface AgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AgentInput) => Promise<void>;
  initial?: Agent | null;
  options: AgentOptions;
  /** Knowledge bases that can be attached; empty when the user cannot read them. */
  knowledgeBases: KnowledgeBaseSummary[];
  canReadKnowledge: boolean;
  isPending: boolean;
  errorMessage: string | null;
}

const selectClass =
  'flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';
const fieldError = 'text-sm text-red-600 dark:text-red-400';

export function AgentForm({
  open,
  onOpenChange,
  onSubmit,
  initial,
  options,
  knowledgeBases,
  canReadKnowledge,
  isPending,
  errorMessage,
}: AgentFormProps) {
  const isEdit = !!initial;
  const schema = useMemo(() => makeAgentSchema(options.limits), [options.limits]);
  const defaultProvider = options.providers[0]?.id ?? 'mock';
  const defaultModel = options.models.find((m) => m.provider === defaultProvider)?.id ?? options.models[0]?.id ?? '';
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AgentFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      status: 'draft',
      provider: defaultProvider,
      model: defaultModel,
      temperature: options.defaults.temperature,
      maxTokens: options.defaults.maxTokens,
      promptTemplate: '',
      knowledgeBaseIds: [],
    },
  });

  useEffect(() => {
    if (open) {
      setConfirmDiscard(false);
      reset({
        name: initial?.name ?? '',
        description: initial?.description ?? '',
        status: initial?.status ?? 'draft',
        provider: initial?.provider ?? defaultProvider,
        model: initial?.model ?? defaultModel,
        temperature: initial?.temperature ?? options.defaults.temperature,
        maxTokens: initial?.maxTokens ?? options.defaults.maxTokens,
        promptTemplate: initial?.promptTemplate ?? '',
        knowledgeBaseIds: initial?.knowledgeBaseIds ?? [],
      });
    }
  }, [open, initial, reset, defaultProvider, defaultModel, options.defaults.temperature, options.defaults.maxTokens]);

  const provider = watch('provider');
  const model = watch('model');
  const selectedKb = watch('knowledgeBaseIds');
  const modelChoices = options.models.filter((m) => m.provider === provider);
  const providerInfo = options.providers.find((p) => p.id === provider);

  // Keep the model consistent with the provider the user picked.
  useEffect(() => {
    if (modelChoices.length > 0 && !modelChoices.some((m) => m.id === model)) {
      setValue('model', modelChoices[0]?.id ?? '', { shouldDirty: true });
    }
  }, [provider, model, modelChoices, setValue]);

  const busy = isSubmitting || isPending;

  const requestClose = () => {
    if (busy) return;
    if (isDirty) setConfirmDiscard(true);
    else onOpenChange(false);
  };

  const toggleKb = (id: string, checked: boolean) => {
    const next = checked ? [...selectedKb, id] : selectedKb.filter((x) => x !== id);
    setValue('knowledgeBaseIds', next, { shouldDirty: true });
  };

  const maxTokensHelp = `1 to ${options.limits.maxTokens.max}`;

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit AI agent' : 'Add AI agent'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Change how this agent behaves.' : 'Describe how your assistant should talk to customers.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(async (values) => onSubmit(buildAgentPayload(values)))} className="mt-4 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="agent-name">Name *</Label>
            <Input id="agent-name" {...register('name')} placeholder="Support assistant" aria-invalid={!!errors.name} />
            {errors.name && <p className={fieldError} role="alert">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-description">Description</Label>
            <Input id="agent-description" {...register('description')} placeholder="What this agent is for" />
            {errors.description && <p className={fieldError} role="alert">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-instructions">Instructions</Label>
            <textarea
              id="agent-instructions"
              rows={6}
              {...register('promptTemplate')}
              aria-describedby="agent-instructions-help"
              placeholder="You are the friendly support assistant for ACME Ltd. Answer using the information provided. If you are not sure, say a team member will follow up."
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <p id="agent-instructions-help" className="text-xs text-slate-500 dark:text-slate-400">
              Tell the agent who it is, what it may help with, and when to hand over to a person.
            </p>
            {errors.promptTemplate && <p className={fieldError} role="alert">{errors.promptTemplate.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent-status">Status</Label>
              <select id="agent-status" {...register('status')} className={selectClass}>
                {AGENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {AGENT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-provider">Provider</Label>
              <select id="agent-provider" {...register('provider')} className={selectClass}>
                {options.providers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                    {p.configured ? '' : ' (not set up)'}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-model">Model</Label>
              <select id="agent-model" {...register('model')} className={selectClass}>
                {modelChoices.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              </select>
              {errors.model && <p className={fieldError} role="alert">{errors.model.message}</p>}
            </div>
          </div>

          {providerInfo && !providerInfo.configured && (
            <p role="note" className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              {providerInfo.label} is not set up on the server yet. You can save this agent, but it cannot reply until it is.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agent-temperature">Creativity (0 to 2)</Label>
              <Input
                id="agent-temperature"
                type="number"
                step="0.1"
                {...register('temperature', { valueAsNumber: true })}
                aria-invalid={!!errors.temperature}
              />
              <p className="text-xs text-slate-500">Lower is more predictable. Around 0.2 suits customer support.</p>
              {errors.temperature && <p className={fieldError} role="alert">{errors.temperature.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="agent-max-tokens">Maximum reply length</Label>
              <Input
                id="agent-max-tokens"
                type="number"
                step="1"
                {...register('maxTokens', { valueAsNumber: true })}
                aria-invalid={!!errors.maxTokens}
              />
              <p className="text-xs text-slate-500">In tokens ({maxTokensHelp}). Roughly 0.75 words each.</p>
              {errors.maxTokens && <p className={fieldError} role="alert">{errors.maxTokens.message}</p>}
            </div>
          </div>

          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Knowledge the agent can use</legend>
            {!canReadKnowledge ? (
              <p className="text-sm text-slate-500">You don’t have permission to view knowledge bases.</p>
            ) : knowledgeBases.length === 0 ? (
              <p className="text-sm text-slate-500">No knowledge bases yet. The agent will answer from its instructions only.</p>
            ) : (
              <div className="space-y-1">
                {knowledgeBases.map((kb) => (
                  <label key={kb._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedKb.includes(kb._id)}
                      onChange={(e) => toggleKb(kb._id, e.target.checked)}
                    />
                    {kb.name}
                    {kb.status === 'archived' ? ' (archived)' : ''}
                  </label>
                ))}
              </div>
            )}
          </fieldset>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2">
              {errorMessage}
            </p>
          )}

          {confirmDiscard && (
            <div role="alertdialog" aria-label="Discard changes?" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/20">
              <p className="font-medium">Discard your changes?</p>
              <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDiscard(false)}>
                  Keep editing
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => onOpenChange(false)}>
                  Discard
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
              {isEdit ? 'Save changes' : 'Create agent'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
