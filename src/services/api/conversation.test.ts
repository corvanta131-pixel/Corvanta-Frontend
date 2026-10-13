import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ default: { get: vi.fn(), patch: vi.fn() } }));

import api from './client';
import { fetchConversations, fetchMessages, updateConversationStatus } from './conversation';

const mocked = vi.mocked(api);
const ok = (data: unknown) => ({ data: { success: true, data } });

describe('conversation API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses explicit methods and paths', async () => {
    mocked.get.mockResolvedValue(ok([{ _id: 'c1', status: 'open' }]));
    await fetchConversations();
    expect(mocked.get).toHaveBeenCalledWith('/conversations/');

    mocked.patch.mockResolvedValue(ok({ _id: 'c1', status: 'resolved' }));
    await updateConversationStatus('c1', 'resolved');
    expect(mocked.patch).toHaveBeenCalledWith('/conversations/c1', { status: 'resolved' });

    mocked.get.mockResolvedValue(ok([{ _id: 'm1', body: 'hi' }]));
    await fetchMessages('c1', 50);
    expect(mocked.get).toHaveBeenLastCalledWith('/conversations/c1/messages', { params: { limit: 50 } });
  });

  it('encodes ids, rejects empty ids, and rejects malformed records', async () => {
    mocked.get.mockResolvedValue(ok([]));
    await fetchMessages('a/b');
    expect(mocked.get).toHaveBeenCalledWith('/conversations/a%2Fb/messages', { params: { limit: 100 } });
    await expect(fetchMessages('')).rejects.toThrow('Conversation id is required.');

    mocked.get.mockResolvedValueOnce(ok([{ foo: 1 }]));
    await expect(fetchConversations()).rejects.toThrow('invalid conversation record');
    mocked.get.mockResolvedValueOnce(ok([{ _id: 'm1' }]));
    await expect(fetchMessages('c1')).rejects.toThrow('invalid message record');
    mocked.get.mockResolvedValueOnce({ data: { success: false, message: 'Nope', data: [] } });
    await expect(fetchConversations()).rejects.toThrow('Nope');
  });
});
