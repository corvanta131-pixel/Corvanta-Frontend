import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));

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
