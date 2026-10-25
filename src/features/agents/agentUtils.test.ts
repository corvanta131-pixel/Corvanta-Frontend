import { describe, it, expect } from 'vitest';
import { agentProblems, agentToInput } from './agentUtils';
import type { Agent, AgentOptions } from './types';

const options: AgentOptions = {
  providers: [
    { id: 'mock', label: 'Test mode (no real AI)', configured: true },
    { id: 'openai', label: 'OpenAI', configured: false },
  ],
  models: [
    { id: 'mock-model', provider: 'mock' },
    { id: 'gpt-4o-mini', provider: 'openai' },
  ],
  defaults: { temperature: 0.2, maxTokens: 512 },
  limits: {
    temperature: { min: 0, max: 2 },
    maxTokens: { min: 1, max: 1024 },
    nameLength: { min: 2, max: 120 },
    descriptionMax: 2000,
    promptTemplateMax: 20000,
  },
};

function agent(over: Partial<Agent> = {}): Agent {
  return {
    _id: 'a-1',
    name: 'Support assistant',
    slug: 'support-assistant',
    status: 'active',
    provider: 'mock',
    model: 'mock-model',
    temperature: 0.2,
    maxTokens: 512,
    promptTemplate: 'Be helpful.',
    knowledgeBaseIds: ['kb-1'],
    createdAt: '',
    updatedAt: '',
    ...over,
  };
}

describe('agentToInput', () => {
  it('keeps every field and applies only the requested changes', () => {
    expect(agentToInput(agent({ description: 'Hello' }))).toEqual({
      name: 'Support assistant',
      description: 'Hello',
      status: 'active',
      provider: 'mock',
      model: 'mock-model',
      temperature: 0.2,
      maxTokens: 512,
      promptTemplate: 'Be helpful.',
      knowledgeBaseIds: ['kb-1'],
    });
    expect(agentToInput(agent(), { status: 'disabled' }).status).toBe('disabled');
    expect(agentToInput(agent(), { status: 'disabled' }).name).toBe('Support assistant');
  });

  it('turns missing optional fields into empty values', () => {
    const input = agentToInput(agent({ description: undefined }));
    expect(input.description).toBe('');
  });
});

describe('agentProblems', () => {
  it('reports nothing for a healthy agent', () => {
    expect(agentProblems(agent(), options)).toEqual([]);
  });

  it('flags a provider that is not set up on the server', () => {
    const problems = agentProblems(agent({ provider: 'openai', model: 'gpt-4o-mini' }), options);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/OpenAI is not set up/);
  });

  it('flags a model the server no longer allows', () => {
    expect(agentProblems(agent({ model: 'gpt-retired' }), options).join(' ')).toMatch(/gpt-retired/);
  });

  it('flags an active agent with no instructions but not a draft', () => {
    expect(agentProblems(agent({ promptTemplate: '   ' }), options).join(' ')).toMatch(/no instructions/i);
    expect(agentProblems(agent({ promptTemplate: '', status: 'draft' }), options)).toEqual([]);
  });

  it('cannot judge providers before the options have loaded', () => {
    expect(agentProblems(agent({ provider: 'openai' }), undefined)).toEqual([]);
  });
});
