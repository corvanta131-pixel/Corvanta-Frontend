import type { Agent, AgentInput, AgentOptions, AgentStatus } from './types';

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  disabled: 'Disabled',
  archived: 'Archived',
};

export const AGENT_STATUS_STYLES: Record<AgentStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  disabled: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
  archived: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

/** The request body that keeps every field of an agent as it is, optionally changing some. */
export function agentToInput(agent: Agent, changes: Partial<AgentInput> = {}): AgentInput {
  return {
    name: agent.name,
    description: agent.description ?? '',
    status: agent.status,
    provider: agent.provider,
    model: agent.model,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    promptTemplate: agent.promptTemplate ?? '',
    knowledgeBaseIds: agent.knowledgeBaseIds ?? [],
    ...changes,
  };
}

/** Problems that mean the agent cannot answer customers yet, in plain language. */
export function agentProblems(agent: Agent, options: AgentOptions | undefined): string[] {
  const problems: string[] = [];
  const provider = options?.providers.find((p) => p.id === agent.provider);
  if (provider && !provider.configured) {
    problems.push(`${provider.label} is not set up on the server yet, so this agent cannot reply.`);
  }
  if (options && !options.models.some((m) => m.id === agent.model)) {
    problems.push(`The model “${agent.model}” is no longer allowed by the server.`);
  }
  if (agent.status === 'active' && agent.promptTemplate.trim() === '') {
    problems.push('This agent has no instructions yet.');
  }
  return problems;
}
