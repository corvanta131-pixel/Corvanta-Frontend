import { describe, it, expect } from 'vitest';
import { computeSetupSteps, summarizeSetup, type SetupInput, type Source } from './setupSteps';
import type { Agent } from '../agents/types';
import type { WidgetView } from '../channels/types';
import type { Conversation } from '../conversations/types';
import type { KnowledgeDocument } from '../knowledge/types';
import type { Employee } from '../users/types';

const ok = <T,>(data: T): Source<T> => ({ allowed: true, loading: false, failed: false, data });

function agent(over: Partial<Agent> = {}): Agent {
  return {
    _id: 'a-1',
    name: 'Support bot',
    slug: 'support-bot',
    status: 'active',
    provider: 'mock',
    model: 'mock-model',
    temperature: 0.2,
    maxTokens: 512,
    promptTemplate: 'Help.',
    knowledgeBaseIds: [],
    createdAt: '',
    updatedAt: '',
    ...over,
  };
}

function doc(over: Partial<KnowledgeDocument> = {}): KnowledgeDocument {
  return { _id: 'd-1', knowledgeBaseId: 'kb-1', title: 'FAQ', status: 'published', indexingState: 'unindexed', chunkCount: 0, createdAt: '', updatedAt: '', ...over };
}

function widget(over: Partial<WidgetView> = {}): WidgetView {
  return {
    channelId: 'ch-1',
    enabled: true,
    ready: true,
    problems: [],
    widget: { key: 'wk_x', allowedOrigins: [], agentId: null, agentName: null, agentStatus: null, title: '', welcomeMessage: '', color: '#000000' },
    embedSnippet: null,
    ...over,
  };
}

function conversation(over: Partial<Conversation> = {}): Conversation {
  return { _id: 'c-1', companyId: 'co', customerId: 'cu', channelType: 'webchat', status: 'open', createdAt: '', updatedAt: '', ...over };
}

function employee(over: Partial<Employee> = {}): Employee {
  return {
    _id: 'e-1',
    companyId: 'co',
    name: 'Sam',
    email: 's@x.com',
    roleId: null,
    employeeCode: '',
    department: '',
    title: '',
    managerId: null,
    status: 'active',
    isEmailVerified: false,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '',
    updatedAt: '',
    __v: 0,
    ...over,
  };
}

const fresh: SetupInput = {
  agents: ok([]),
  documents: ok({}),
  widget: ok(null),
  conversations: ok([]),
  employees: ok([employee()]),
  canReadKnowledge: true,
};

const byId = (input: SetupInput, id: string) => computeSetupSteps(input).find((s) => s.id === id)!;

describe('computeSetupSteps', () => {
  it('starts every required step as to-do for a brand-new workspace', () => {
    const steps = computeSetupSteps(fresh);
    expect(steps.map((s) => [s.id, s.status])).toEqual([
      ['agent', 'todo'],
      ['knowledge', 'todo'],
      ['chat', 'todo'],
      ['visitor', 'todo'],
      ['team', 'todo'],
    ]);
    expect(steps.find((s) => s.id === 'team')?.optional).toBe(true);
    expect(steps.filter((s) => !s.optional)).toHaveLength(4);
  });

  it('agent step: needs an ACTIVE agent and explains a draft', () => {
    expect(byId({ ...fresh, agents: ok([agent({ status: 'draft' })]) }, 'agent').detail).toMatch(/none is active/i);
    const done = byId({ ...fresh, agents: ok([agent()]) }, 'agent');
    expect(done.status).toBe('done');
    expect(done.detail).toContain('Support bot');
  });

  it('knowledge step: needs published documents in a knowledge base attached to an active agent', () => {
    const noAgent = byId(fresh, 'knowledge');
    expect(noAgent.detail).toMatch(/activate an agent first/i);

    const noKb = byId({ ...fresh, agents: ok([agent()]) }, 'knowledge');
    expect(noKb.detail).toMatch(/attach it to your agent/i);

    const attached = { ...fresh, agents: ok([agent({ knowledgeBaseIds: ['kb-1'] })]) };
    expect(byId({ ...attached, documents: ok({ 'kb-1': [doc({ status: 'draft' })] }) }, 'knowledge').status).toBe('todo');
    expect(byId({ ...attached, documents: ok({ 'kb-1': [doc({ status: 'draft' })] }) }, 'knowledge').detail).toMatch(/Published/);
    expect(byId({ ...attached, documents: ok({ 'kb-1': [doc()] }) }, 'knowledge').status).toBe('done');
    // A draft agent's knowledge does not count.
    const draftAgent = { ...fresh, agents: ok([agent({ status: 'draft', knowledgeBaseIds: ['kb-1'] })]), documents: ok({ 'kb-1': [doc()] }) };
    expect(byId(draftAgent, 'knowledge').status).toBe('todo');
  });

  it('chat step: trusts the server, and shows its first problem', () => {
    expect(byId({ ...fresh, widget: ok(widget()) }, 'chat').status).toBe('done');
    const notReady = byId({ ...fresh, widget: ok(widget({ ready: false, problems: ['Choose an AI agent to answer visitors.', 'The widget is switched off.'] })) }, 'chat');
    expect(notReady.status).toBe('todo');
    expect(notReady.detail).toBe('Choose an AI agent to answer visitors.');
  });

  it('visitor step: only a real web chat conversation counts', () => {
    expect(byId({ ...fresh, conversations: ok([conversation({ channelType: 'email' })]) }, 'visitor').status).toBe('todo');
    expect(byId({ ...fresh, conversations: ok([conversation()]) }, 'visitor').status).toBe('done');
  });

  it('team step: needs two active, non-deleted people', () => {
    expect(byId({ ...fresh, employees: ok([employee(), employee({ _id: 'e-2', status: 'disabled' })]) }, 'team').status).toBe('todo');
    expect(byId({ ...fresh, employees: ok([employee(), employee({ _id: 'e-2', isDeleted: true })]) }, 'team').status).toBe('todo');
    expect(byId({ ...fresh, employees: ok([employee(), employee({ _id: 'e-2' })]) }, 'team').status).toBe('done');
  });

  it('never pretends: unavailable, loading and error are reported as such', () => {
    const noAccess: Source<never[]> = { allowed: false, loading: false, failed: false, data: undefined };
    expect(byId({ ...fresh, agents: noAccess }, 'agent').status).toBe('unavailable');
    expect(byId({ ...fresh, agents: noAccess }, 'knowledge').status).toBe('unavailable');
    expect(byId({ ...fresh, canReadKnowledge: false, agents: ok([agent()]) }, 'knowledge').status).toBe('unavailable');
    expect(byId({ ...fresh, conversations: { allowed: true, loading: true, failed: false, data: undefined } }, 'visitor').status).toBe('loading');
    expect(byId({ ...fresh, widget: { allowed: true, loading: false, failed: true, data: undefined } }, 'chat').status).toBe('error');
    const docsFailed = { ...fresh, agents: ok([agent({ knowledgeBaseIds: ['kb-1'] })]), documents: { allowed: true, loading: false, failed: true, data: undefined } as Source<Record<string, KnowledgeDocument[]>> };
    expect(byId(docsFailed, 'knowledge').status).toBe('error');
  });
});

describe('summarizeSetup', () => {
  it('counts only required steps and flags completion', () => {
    const live: SetupInput = {
      agents: ok([agent({ knowledgeBaseIds: ['kb-1'] })]),
      documents: ok({ 'kb-1': [doc()] }),
      widget: ok(widget()),
      conversations: ok([conversation()]),
      employees: ok([employee()]),
      canReadKnowledge: true,
    };
    const progress = summarizeSetup(computeSetupSteps(live));
    expect(progress).toEqual({ done: 4, total: 4, unchecked: 0, complete: true });
    expect(summarizeSetup(computeSetupSteps(fresh))).toEqual({ done: 0, total: 4, unchecked: 0, complete: false });
  });

  it('is never "complete" while a step is unchecked or loading', () => {
    const noAccess: Source<never[]> = { allowed: false, loading: false, failed: false, data: undefined };
    const progress = summarizeSetup(computeSetupSteps({ ...fresh, conversations: noAccess }));
    expect(progress.unchecked).toBe(1);
    expect(progress.complete).toBe(false);
  });
});
