import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchChannels,
  createWebchatChannel,
  createChannel,
  fetchWidgetSettings,
  saveWidgetSettings,
  fetchConnector,
  saveConnector,
  testConnector,
  rotateSigningSecret,
  clearConnector,
} from '../../services/api/channel';
import type { ChannelType } from '../customers/types';
import type { ConnectorSaveInput, ConnectorView, WidgetSettingsInput, WidgetView } from './types';

export const channelQueryKeys = {
  all: ['channels'] as const,
  list: () => [...channelQueryKeys.all, 'list'] as const,
  widget: (channelId: string) => [...channelQueryKeys.all, 'widget', channelId] as const,
  connector: (channelId: string) => [...channelQueryKeys.all, 'connector', channelId] as const,
};

export function useChannels(enabled = true) {
  return useQuery({
    queryKey: channelQueryKeys.list(),
    queryFn: fetchChannels,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateWebchatChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWebchatChannel,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: channelQueryKeys.list() }),
  });
}

export function useWidgetSettings(channelId: string | null, enabled = true) {
  return useQuery({
    queryKey: channelQueryKeys.widget(channelId ?? ''),
    queryFn: () => fetchWidgetSettings(channelId as string),
    enabled: enabled && !!channelId,
    refetchOnWindowFocus: false,
  });
}

export function useSaveWidgetSettings(channelId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: WidgetSettingsInput) => saveWidgetSettings(channelId, settings),
    retry: false,
    onSuccess: (view: WidgetView) => {
      queryClient.setQueryData(channelQueryKeys.widget(channelId), view);
      queryClient.invalidateQueries({ queryKey: channelQueryKeys.list() });
    },
  });
}

export function useCreateChannel() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, type }: { name: string; type: ChannelType }) => createChannel(name, type),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: channelQueryKeys.list() }),
  });
}

export function useConnector(channelId: string | null, enabled = true) {
  return useQuery({
    queryKey: channelQueryKeys.connector(channelId ?? ''),
    queryFn: () => fetchConnector(channelId as string),
    enabled: enabled && !!channelId,
    refetchOnWindowFocus: false,
  });
}

/** Every connector change returns the new admin view; keep it cached and refresh the channel list. */
function useConnectorMutation<TInput>(channelId: string, run: (input: TInput) => Promise<ConnectorView>) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: run,
    retry: false,
    onSuccess: (view: ConnectorView) => {
      queryClient.setQueryData(channelQueryKeys.connector(channelId), view);
      queryClient.invalidateQueries({ queryKey: channelQueryKeys.list() });
    },
  });
}

export function useSaveConnector(channelId: string) {
  return useConnectorMutation<ConnectorSaveInput>(channelId, (input) => saveConnector(channelId, input));
}
export function useTestConnector(channelId: string) {
  return useConnectorMutation<void>(channelId, () => testConnector(channelId));
}
export function useRotateSigningSecret(channelId: string) {
  return useConnectorMutation<void>(channelId, () => rotateSigningSecret(channelId));
}
export function useClearConnector(channelId: string) {
  return useConnectorMutation<void>(channelId, () => clearConnector(channelId));
}
