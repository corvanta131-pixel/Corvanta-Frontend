import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ default: { get: vi.fn(), patch: vi.fn(), post: vi.fn() } }));

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

describe('handoff and reply API functions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('patches handling mode and assignment with only the changed fields', async () => {
    const { updateConversation } = await import('./conversation');
    mocked.patch.mockResolvedValue(ok({ _id: 'c1', status: 'open' }));
    await updateConversation('c1', { handlingMode: 'HUMAN' });
    expect(mocked.patch).toHaveBeenLastCalledWith('/conversations/c1', { handlingMode: 'HUMAN' });
    await updateConversation('c1', { assigneeId: null });
    expect(mocked.patch).toHaveBeenLastCalledWith('/conversations/c1', { assigneeId: null });
    await expect(updateConversation('', { handlingMode: 'AI' })).rejects.toThrow('Conversation id is required.');
  });

  it('posts a reply to the replies endpoint and validates the returned message', async () => {
    const { sendReply } = await import('./conversation');
    mocked.post.mockResolvedValue(ok({ _id: 'm1', body: 'Hi' }));
    const message = await sendReply('c1', 'Hi');
    expect(message.body).toBe('Hi');
    expect(mocked.post).toHaveBeenCalledWith('/conversations/c1/replies', { body: 'Hi' });

    mocked.post.mockResolvedValueOnce(ok({ nope: true }));
    await expect(sendReply('c1', 'Hi')).rejects.toThrow('invalid message record');
    await expect(sendReply('', 'Hi')).rejects.toThrow('Conversation id is required.');
  });
});
