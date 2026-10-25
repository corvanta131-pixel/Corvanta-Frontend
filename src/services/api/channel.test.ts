import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() } }));

import api from './client';
import { fetchChannels, createWebchatChannel, fetchWidgetSettings, saveWidgetSettings } from './channel';

const mocked = vi.mocked(api);
const ok = (data: unknown) => ({ data: { success: true, data } });
const view = { channelId: 'ch-1', enabled: false, ready: false, problems: [], widget: { key: null }, embedSnippet: null };

describe('channel API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses explicit methods and paths', async () => {
    mocked.get.mockResolvedValue(ok([{ _id: 'ch-1', type: 'webchat' }]));
    await fetchChannels();
    expect(mocked.get).toHaveBeenCalledWith('/channels/');

    mocked.post.mockResolvedValue(ok({ _id: 'ch-1', type: 'webchat' }));
    await createWebchatChannel('Website chat');
    expect(mocked.post).toHaveBeenCalledWith('/channels/', { name: 'Website chat', type: 'webchat' });

    mocked.get.mockResolvedValue(ok(view));
    await fetchWidgetSettings('ch-1');
    expect(mocked.get).toHaveBeenLastCalledWith('/channels/ch-1/widget');

    mocked.put.mockResolvedValue(ok(view));
    await saveWidgetSettings('ch-1', { enabled: true, allowedOrigins: ['https://a.com'] });
    expect(mocked.put).toHaveBeenCalledWith('/channels/ch-1/widget', { enabled: true, allowedOrigins: ['https://a.com'] });
  });

  it('rejects empty ids and malformed responses', async () => {
    await expect(fetchWidgetSettings('')).rejects.toThrow('Channel id is required.');
    mocked.get.mockResolvedValueOnce(ok({ not: 'a list' }));
    await expect(fetchChannels()).rejects.toThrow('invalid channel list');
    mocked.get.mockResolvedValueOnce(ok([{ foo: 1 }]));
    await expect(fetchChannels()).rejects.toThrow('invalid channel record');
    mocked.get.mockResolvedValueOnce(ok({ channelId: 'x' }));
    await expect(fetchWidgetSettings('ch-1')).rejects.toThrow('invalid widget record');
    mocked.get.mockResolvedValueOnce({ data: { success: false, message: 'Denied', data: null } });
    await expect(fetchChannels()).rejects.toThrow('Denied');
  });
});

describe('connector API functions', () => {
  beforeEach(() => vi.clearAllMocks());

  const view = { channelId: 'ch-1', fields: [], webhook: { url: null, verifyToken: null, needsSigningSecret: false } };

  it('uses explicit methods and paths', async () => {
    const { createChannel, fetchConnector, saveConnector, testConnector, rotateSigningSecret, clearConnector } = await import('./channel');
    const m = mocked as unknown as { post: ReturnType<typeof vi.fn>; put: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
    m.post.mockResolvedValue(ok({ _id: 'ch-1', type: 'sms' }));
    await createChannel('SMS', 'sms');
    expect(m.post).toHaveBeenCalledWith('/channels/', { name: 'SMS', type: 'sms' });

    m.get.mockResolvedValue(ok(view));
    await fetchConnector('ch-1');
    expect(m.get).toHaveBeenLastCalledWith('/channels/ch-1/connector');

    m.put.mockResolvedValue(ok(view));
    await saveConnector('ch-1', { enabled: true });
    expect(m.put).toHaveBeenCalledWith('/channels/ch-1/connector', { enabled: true });

    m.post.mockResolvedValue(ok(view));
    await testConnector('ch-1');
    expect(m.post).toHaveBeenLastCalledWith('/channels/ch-1/connector/test');
    await rotateSigningSecret('ch-1');
    expect(m.post).toHaveBeenLastCalledWith('/channels/ch-1/connector/signing-secret');

    m.delete.mockResolvedValue(ok(view));
    await clearConnector('ch-1');
    expect(m.delete).toHaveBeenCalledWith('/channels/ch-1/connector');
  });

  it('rejects empty ids and malformed responses', async () => {
    const { fetchConnector } = await import('./channel');
    await expect(fetchConnector('')).rejects.toThrow('Channel id is required.');
    mocked.get.mockResolvedValueOnce(ok({ channelId: 'x' }));
    await expect(fetchConnector('ch-1')).rejects.toThrow('invalid connection record');
  });
});
