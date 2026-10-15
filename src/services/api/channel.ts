import api from './client';
import { hasStringField, isRecord, pathId, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { Channel, WidgetSettingsInput, WidgetView } from '../../features/channels/types';

function assertChannel(value: unknown, label: string): Channel {
  if (!hasStringField(value, '_id') || !hasStringField(value, 'type')) {
    throw new Error(`Received an invalid channel record while ${label}.`);
  }
  return value as unknown as Channel;
}

function assertWidgetView(value: unknown, label: string): WidgetView {
  if (!isRecord(value) || typeof value['channelId'] !== 'string' || !isRecord(value['widget'])) {
    throw new Error(`Received an invalid widget record while ${label}.`);
  }
  return value as unknown as WidgetView;
}

export async function fetchChannels(): Promise<Channel[]> {
  const res = await api.get<ApiEnvelope<Channel[]>>('/channels/');
  const data = unwrap(res.data, 'loading channels');
  if (!Array.isArray(data)) throw new Error('Received an invalid channel list.');
  return data.map((c) => assertChannel(c, 'loading channels'));
}

/** Creates the company's single web chat channel (the backend allows one channel per type). */
export async function createWebchatChannel(name: string): Promise<Channel> {
  const res = await api.post<ApiEnvelope<Channel>>('/channels/', { name, type: 'webchat' });
  return assertChannel(unwrap(res.data, 'creating the channel'), 'creating the channel');
}

export async function fetchWidgetSettings(channelId: string): Promise<WidgetView> {
  const res = await api.get<ApiEnvelope<WidgetView>>(`${pathId('/channels', channelId, 'Channel')}/widget`);
  return assertWidgetView(unwrap(res.data, 'loading chat settings'), 'loading chat settings');
}

export async function saveWidgetSettings(channelId: string, settings: WidgetSettingsInput): Promise<WidgetView> {
  const res = await api.put<ApiEnvelope<WidgetView>>(`${pathId('/channels', channelId, 'Channel')}/widget`, settings);
  return assertWidgetView(unwrap(res.data, 'saving chat settings'), 'saving chat settings');
}
