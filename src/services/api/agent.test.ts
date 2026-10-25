import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

import api from './client';
import { fetchAgents, listAgents, createAgent, updateAgent, deleteAgent, fetchAgentOptions } from './agent';
import type { AgentInput } from '../../features/agents/types';

const mocked = vi.mocked(api);
const ok = (data: unknown) => ({ data: { success: true, data } });
const record = { _id: 'a-1', name: 'Support assistant', status: 'active' };
const input: AgentInput = {
  name: 'Support assistant',
  description: '',
  status: 'draft',
  provider: 'mock',
  model: 'mock-model',
  temperature: 0.2,
  maxTokens: 512,
  promptTemplate: '',
  knowledgeBaseIds: [],
};

describe('agent API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses explicit methods and paths', async () => {
    mocked.get.mockResolvedValue(ok([record]));
    await fetchAgents();
    expect(mocked.get).toHaveBeenLastCalledWith('/agents/');
    await listAgents();
    expect(mocked.get).toHaveBeenLastCalledWith('/agents/');

    mocked.post.mockResolvedValue(ok(record));
    await createAgent(input);
    expect(mocked.post).toHaveBeenCalledWith('/agents/', input);

    mocked.patch.mockResolvedValue(ok(record));
    await updateAgent('a-1', input);
    expect(mocked.patch).toHaveBeenCalledWith('/agents/a-1', input);

    mocked.delete.mockResolvedValue(ok(record));
    await deleteAgent('a-1');
    expect(mocked.delete).toHaveBeenCalledWith('/agents/a-1');
  });

  it('loads options from /agents/options', async () => {
    const options = { providers: [], models: [], defaults: {}, limits: {} };
    mocked.get.mockResolvedValue(ok(options));
    await expect(fetchAgentOptions()).resolves.toEqual(options);
    expect(mocked.get).toHaveBeenCalledWith('/agents/options');
  });

  it('rejects empty ids and malformed responses', async () => {
    await expect(updateAgent('', input)).rejects.toThrow('Agent id is required.');
    await expect(deleteAgent('')).rejects.toThrow('Agent id is required.');

    mocked.get.mockResolvedValueOnce(ok({ not: 'a list' }));
    await expect(listAgents()).rejects.toThrow('invalid agent list');
    mocked.get.mockResolvedValueOnce(ok([{ foo: 1 }]));
    await expect(listAgents()).rejects.toThrow('invalid agent record');
    mocked.get.mockResolvedValueOnce(ok({ providers: 'nope' }));
    await expect(fetchAgentOptions()).rejects.toThrow('invalid agent options');
    mocked.get.mockResolvedValueOnce({ data: { success: false, message: 'Denied', data: null } });
    await expect(listAgents()).rejects.toThrow('Denied');
    mocked.post.mockResolvedValueOnce(ok({ foo: 1 }));
    await expect(createAgent(input)).rejects.toThrow('invalid agent record');
  });
});
