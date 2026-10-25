import type { Agent } from '../agents/types';
import type { WidgetView } from '../channels/types';
import type { Conversation } from '../conversations/types';
import type { KnowledgeDocument } from '../knowledge/types';
import type { Employee } from '../users/types';

export type StepStatus = 'done' | 'todo' | 'loading' | 'error' | 'unavailable';

export interface SetupStep {
  id: 'agent' | 'knowledge' | 'chat' | 'visitor' | 'team';
  title: string;
  /** What this step means, or what to do next, in plain language. */
  detail: string;
  status: StepStatus;
  href: string;
  actionLabel: string;
  optional: boolean;
}

/** One data source: `undefined` means "not loaded yet", `null` means "could not be loaded". */
export type Source<T> = { allowed: boolean; loading: boolean; failed: boolean; data: T | undefined };

export interface SetupInput {
  agents: Source<Agent[]>;
  /** Documents per knowledge base id for the knowledge bases attached to active agents. */
  documents: Source<Record<string, KnowledgeDocument[]>>;
  widget: Source<WidgetView | null>;
  conversations: Source<Conversation[]>;
  employees: Source<Employee[]>;
  canReadKnowledge: boolean;
}

function base(id: SetupStep['id'], title: string, href: string, actionLabel: string, optional = false) {
  return { id, title, href, actionLabel, optional };
}

/** Maps a data source to a status when it cannot give an answer yet. */
function blocked<T>(source: Source<T>, allowed = source.allowed): StepStatus | null {
  if (!allowed) return 'unavailable';
  if (source.failed) return 'error';
  if (source.loading || source.data === undefined) return 'loading';
  return null;
}

const DETAIL = {
  unavailable: 'Your role cannot check this step. Ask a workspace owner.',
  loading: 'Checking…',
  error: 'We could not check this step. Try again.',
};

/**
 * Turns real workspace data into the setup checklist. Nothing here is guessed: a step is only "done"
 * when the data proves it, and a step the user may not inspect says so instead of looking finished.
 */
export function computeSetupSteps(input: SetupInput): SetupStep[] {
  const steps: SetupStep[] = [];

  // 1. An active agent.
  {
    const s = base('agent', 'Create an AI agent', '/agents', 'Open AI Agents');
    const block = blocked(input.agents);
    if (block) {
      steps.push({ ...s, status: block, detail: DETAIL[block as keyof typeof DETAIL] });
    } else {
      const agents = input.agents.data ?? [];
      const active = agents.filter((a) => a.status === 'active');
      if (active.length > 0) {
        steps.push({ ...s, status: 'done', detail: `Active agent: ${active[0]?.name ?? ''}` });
      } else if (agents.length > 0) {
        steps.push({ ...s, status: 'todo', detail: 'You have an agent, but none is active. Open it and press Activate.' });
      } else {
        steps.push({ ...s, status: 'todo', detail: 'Create your first agent and write its instructions.' });
      }
    }
  }

  // 2. Knowledge: an active agent with an attached knowledge base that has a published document.
  {
    const s = base('knowledge', 'Teach it about your business', '/knowledge', 'Open Knowledge');
    const agentBlock = blocked(input.agents);
    if (!input.canReadKnowledge || agentBlock === 'unavailable') {
      steps.push({ ...s, status: 'unavailable', detail: DETAIL.unavailable });
    } else if (agentBlock) {
      steps.push({ ...s, status: agentBlock, detail: DETAIL[agentBlock as keyof typeof DETAIL] });
    } else {
      const active = (input.agents.data ?? []).filter((a) => a.status === 'active');
      const attached = Array.from(new Set(active.flatMap((a) => a.knowledgeBaseIds)));
      if (active.length === 0) {
        steps.push({ ...s, status: 'todo', detail: 'Activate an agent first, then give it knowledge.' });
      } else if (attached.length === 0) {
        steps.push({ ...s, status: 'todo', detail: 'Add a knowledge base and attach it to your agent.' });
      } else {
        const docBlock = blocked(input.documents, true);
        if (docBlock) {
          steps.push({ ...s, status: docBlock, detail: DETAIL[docBlock as keyof typeof DETAIL] });
        } else {
          const byKb = input.documents.data ?? {};
          const hasPublished = attached.some((id) => (byKb[id] ?? []).some((d) => d.status === 'published'));
          steps.push(
            hasPublished
              ? { ...s, status: 'done', detail: 'Your agent has published knowledge to answer from.' }
              : { ...s, status: 'todo', detail: 'Add a document to the attached knowledge base and keep it Published.' }
          );
        }
      }
    }
  }

  // 3. Website chat ready, as judged by the server.
  {
    const s = base('chat', 'Set up website chat', '/channels', 'Open Channels');
    const block = blocked(input.widget);
    if (block) {
      steps.push({ ...s, status: block, detail: DETAIL[block as keyof typeof DETAIL] });
    } else if (input.widget.data?.ready) {
      steps.push({ ...s, status: 'done', detail: 'Website chat is switched on and ready.' });
    } else {
      const problem = input.widget.data?.problems[0];
      steps.push({ ...s, status: 'todo', detail: problem ?? 'Set up website chat, choose your agent and add your website address.' });
    }
  }

  // 4. Proof that it works: a real chat from a visitor.
  {
    const s = base('visitor', 'Receive your first website chat', '/inbox', 'Open Inbox');
    const block = blocked(input.conversations);
    if (block) {
      steps.push({ ...s, status: block, detail: DETAIL[block as keyof typeof DETAIL] });
    } else if ((input.conversations.data ?? []).some((c) => c.channelType === 'webchat')) {
      steps.push({ ...s, status: 'done', detail: 'A visitor has chatted with your website chat.' });
    } else {
      steps.push({ ...s, status: 'todo', detail: 'Paste the embed code on your website, open it and send a message to test.' });
    }
  }

  // 5. Optional: a second team member.
  {
    const s = base('team', 'Invite a teammate', '/team', 'Open Team', true);
    const block = blocked(input.employees);
    if (block) {
      steps.push({ ...s, status: block, detail: DETAIL[block as keyof typeof DETAIL] });
    } else {
      const active = (input.employees.data ?? []).filter((e) => e.status === 'active' && !e.isDeleted);
      steps.push(
        active.length >= 2
          ? { ...s, status: 'done', detail: `${active.length} active team members.` }
          : { ...s, status: 'todo', detail: 'Add someone who can take over conversations from the AI.' }
      );
    }
  }

  return steps;
}

export interface SetupProgress {
  done: number;
  total: number;
  /** Required steps whose status cannot be determined for this user. */
  unchecked: number;
  complete: boolean;
}

/** Progress over the required (non-optional) steps only. */
export function summarizeSetup(steps: SetupStep[]): SetupProgress {
  const required = steps.filter((s) => !s.optional);
  const done = required.filter((s) => s.status === 'done').length;
  const unchecked = required.filter((s) => s.status === 'unavailable').length;
  return { done, total: required.length, unchecked, complete: required.length > 0 && done === required.length };
}
