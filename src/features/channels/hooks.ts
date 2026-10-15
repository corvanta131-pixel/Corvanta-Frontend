import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchChannels,
  createWebchatChannel,
  fetchWidgetSettings,
  saveWidgetSettings,
} from '../../services/api/channel';
import type { WidgetSettingsInput, WidgetView } from './types';

export const channelQueryKeys = {
  all: ['channels'] as const,
  list: () => [...channelQueryKeys.all, 'list'] as const,
  widget: (channelId: string) => [...channelQueryKeys.all, 'widget', channelId] as const,
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
