import { AlertTriangle, Bot } from 'lucide-react';
import { Button } from '../ui/Button';
import { AGENT_STATUS_LABELS, AGENT_STATUS_STYLES, agentProblems } from '../../features/agents/agentUtils';
import type { Agent, AgentOptions } from '../../features/agents/types';

interface AgentCardProps {
  agent: Agent;
  options: AgentOptions | undefined;
  knowledgeNames: string[];
  canUpdate: boolean;
  canDelete: boolean;
  busy: boolean;
  onEdit: (agent: Agent) => void;
  onDelete: (agent: Agent) => void;
  onSetStatus: (agent: Agent, status: 'active' | 'disabled') => void;
}

export function AgentCard({ agent, options, knowledgeNames, canUpdate, canDelete, busy, onEdit, onDelete, onSetStatus }: AgentCardProps) {
  const problems = agentProblems(agent, options);
  const providerLabel = options?.providers.find((p) => p.id === agent.provider)?.label ?? agent.provider;

  return (
    <li className="list-none rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300" aria-hidden="true">
          <Bot className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-slate-950 dark:text-slate-50">{agent.name}</h3>
          {agent.description && <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{agent.description}</p>}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${AGENT_STATUS_STYLES[agent.status]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {AGENT_STATUS_LABELS[agent.status]}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-400">
        <div>
          <dt className="sr-only">Provider</dt>
          <dd>{providerLabel}</dd>
        </div>
        <div>
          <dt className="sr-only">Model</dt>
          <dd>{agent.model}</dd>
        </div>
        <div className="col-span-2">
          <dt className="sr-only">Knowledge</dt>
          <dd>{knowledgeNames.length > 0 ? `Knowledge: ${knowledgeNames.join(', ')}` : 'No knowledge attached'}</dd>
        </div>
      </dl>

      {problems.length > 0 && (
        <ul className="mt-3 space-y-1" aria-label={`Problems with ${agent.name}`}>
          {problems.map((problem) => (
            <li key={problem} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {problem}
            </li>
          ))}
        </ul>
      )}

      {(canUpdate || canDelete) && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {canUpdate && agent.status !== 'active' && agent.status !== 'archived' && (
            <Button size="sm" disabled={busy} onClick={() => onSetStatus(agent, 'active')} aria-label={`Activate ${agent.name}`}>
              Activate
            </Button>
          )}
          {canUpdate && agent.status === 'active' && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onSetStatus(agent, 'disabled')} aria-label={`Disable ${agent.name}`}>
              Disable
            </Button>
          )}
          {canUpdate && (
            <Button size="sm" variant="outline" onClick={() => onEdit(agent)} aria-label={`Edit ${agent.name}`}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(agent)} aria-label={`Delete ${agent.name}`}>
              Delete
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
