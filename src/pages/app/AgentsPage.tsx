import { useMemo, useState } from 'react';
import { AlertCircle, Bot, Lock, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { AgentCard } from '../../components/agents/AgentCard';
import { AgentForm } from '../../components/agents/AgentForm';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage, isForbiddenError } from '../../utils/apiError';
import {
  useAgentList,
  useAgentOptions,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
} from '../../features/agents/hooks';
import { useKnowledgeBases } from '../../features/knowledge/hooks';
import { agentToInput } from '../../features/agents/agentUtils';
import type { Agent, AgentInput } from '../../features/agents/types';

export function AgentsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('agents:read', user);
  const canCreate = can('agents:create', user);
  const canUpdate = can('agents:update', user);
  const canDelete = can('agents:delete', user);
  const canReadKnowledge = can('knowledge:read', user);

  const agentsQuery = useAgentList(canRead);
  const optionsQuery = useAgentOptions(canRead);
  const knowledge = useKnowledgeBases(canRead && canReadKnowledge);
  const createMutation = useCreateAgent();
  const updateMutation = useUpdateAgent();
  const deleteMutation = useDeleteAgent();

  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const agents = useMemo(() => agentsQuery.data ?? [], [agentsQuery.data]);
  const options = optionsQuery.data;
  const kbNames = useMemo(() => new Map((knowledge.data ?? []).map((kb) => [kb._id, kb.name] as const)), [knowledge.data]);
  const byId = (id: string | null): Agent | null => agents.find((a) => a._id === id) ?? null;
  const editTarget = byId(editId);
  const deleteTarget = byId(deleteId);

  const closeCreate = () => {
    setCreateOpen(false);
    createMutation.reset();
  };
  const closeEdit = () => {
    setEditId(null);
    updateMutation.reset();
  };
  const closeDelete = () => {
    setDeleteId(null);
    deleteMutation.reset();
  };

  const handleCreate = async (payload: AgentInput) => {
    try {
      const created = await createMutation.mutateAsync(payload);
      toast.success(`${created.name} was created.`);
      closeCreate();
    } catch {
      // Shown in the form via createMutation.error; the dialog stays open with the user's values.
    }
  };

  const handleUpdate = async (payload: AgentInput) => {
    if (!editTarget) return;
    try {
      const updated = await updateMutation.mutateAsync({ id: editTarget._id, data: payload });
      toast.success(`${updated.name} was updated.`);
      closeEdit();
    } catch {
      // Shown in the form via updateMutation.error; the dialog stays open with the user's values.
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`${name} was deleted.`);
      closeDelete();
    } catch {
      // Shown in the dialog via deleteMutation.error; nothing was deleted.
    }
  };

  const handleSetStatus = async (agent: Agent, status: 'active' | 'disabled') => {
    setTogglingId(agent._id);
    try {
      await updateMutation.mutateAsync({ id: agent._id, data: agentToInput(agent, { status }) });
      toast.success(status === 'active' ? `${agent.name} is now active.` : `${agent.name} was disabled.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'The status could not be changed.'));
    } finally {
      setTogglingId(null);
    }
  };

  const loading = agentsQuery.isLoading || optionsQuery.isLoading;
  const failed = agentsQuery.isError || optionsQuery.isError;
  const failure = agentsQuery.error ?? optionsQuery.error;
  const retry = () => {
    void agentsQuery.refetch();
    void optionsQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="AI Agents"
        description="The assistants that talk to your customers"
        icon={Bot}
        action={
          canCreate && options ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add agent
            </Button>
          ) : undefined
        }
      />

      {!canRead ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Restricted access</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              You don’t have permission to view AI agents. Ask a workspace owner if you need access.
            </p>
          </CardContent>
        </Card>
      ) : loading ? (
        <div role="status" aria-label="Loading agents" className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : failed ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <div>
            <AlertTitle>{isForbiddenError(failure) ? 'Access denied' : 'Couldn’t load agents'}</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(failure, 'We couldn’t load your agents.')}</p>
              {!isForbiddenError(failure) && (
                <Button variant="outline" size="sm" className="mt-3" onClick={retry}>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Try again
                </Button>
              )}
            </AlertDescription>
          </div>
        </Alert>
      ) : agents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Bot className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">No AI agents yet</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              An agent is the assistant your customers talk to. Create one, set it to active, then connect it to your
              website chat.
            </p>
            {canCreate && options && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Create your first agent
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2" aria-label="AI agents">
          {agents.map((agent) => (
            <AgentCard
              key={agent._id}
              agent={agent}
              options={options}
              knowledgeNames={agent.knowledgeBaseIds.map((id) => kbNames.get(id) ?? 'Unknown knowledge base')}
              canUpdate={canUpdate}
              canDelete={canDelete}
              busy={togglingId === agent._id}
              onEdit={(a) => setEditId(a._id)}
              onDelete={(a) => setDeleteId(a._id)}
              onSetStatus={(a, status) => void handleSetStatus(a, status)}
            />
          ))}
        </ul>
      )}

      {options && canCreate && (
        <AgentForm
          open={createOpen}
          onOpenChange={(open) => (open ? setCreateOpen(true) : closeCreate())}
          onSubmit={handleCreate}
          options={options}
          knowledgeBases={knowledge.data ?? []}
          canReadKnowledge={canReadKnowledge}
          isPending={createMutation.isPending}
          errorMessage={createMutation.error ? getErrorMessage(createMutation.error) : null}
        />
      )}

      {options && canUpdate && (
        <AgentForm
          open={!!editTarget}
          onOpenChange={(open) => !open && closeEdit()}
          onSubmit={handleUpdate}
          initial={editTarget}
          options={options}
          knowledgeBases={knowledge.data ?? []}
          canReadKnowledge={canReadKnowledge}
          isPending={updateMutation.isPending}
          errorMessage={updateMutation.error ? getErrorMessage(updateMutation.error) : null}
        />
      )}

      {canDelete && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && closeDelete()}
          onConfirm={() => void handleDelete()}
          title="Delete AI agent"
          confirmLabel="Delete agent"
          pendingLabel="Deleting…"
          isPending={deleteMutation.isPending}
          errorMessage={deleteMutation.error ? getErrorMessage(deleteMutation.error) : null}
        >
          Delete <span className="font-semibold text-slate-950 dark:text-slate-50">{deleteTarget?.name}</span>? Any
          conversation or website chat still using it will stop getting AI replies until you choose another agent.
        </ConfirmDialog>
      )}
    </div>
  );
}
