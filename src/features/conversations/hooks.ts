import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchConversations,
  fetchMessages,
  sendReply,
  updateConversation,
  updateConversationStatus,
  type ConversationPatch,
} from '../../services/api/conversation';
import type { Conversation, ConversationStatus } from './types';

export const conversationQueryKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationQueryKeys.all, 'list'] as const,
  messages: (id: string) => [...conversationQueryKeys.all, 'messages', id] as const,
};

export const MESSAGE_PAGE_LIMIT = 100;
const LIST_REFRESH_MS = 15_000;
const MESSAGE_REFRESH_MS = 5_000;

export function useConversations(enabled = true) {
  return useQuery({
    queryKey: conversationQueryKeys.list(),
    queryFn: fetchConversations,
    enabled,
    staleTime: 30_000,
    // New conversations and customer messages arrive without a page reload (paused in background tabs).
    refetchInterval: LIST_REFRESH_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
}

export function useConversationMessages(conversationId: string | null, enabled = true) {
  return useQuery({
    queryKey: conversationQueryKeys.messages(conversationId ?? ''),
    queryFn: () => fetchMessages(conversationId as string, MESSAGE_PAGE_LIMIT),
    enabled: enabled && !!conversationId,
    refetchInterval: MESSAGE_REFRESH_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateConversationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ConversationStatus }) => updateConversationStatus(id, status),
    retry: false,
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData<Conversation[]>(conversationQueryKeys.list(), (old) =>
        old?.map((c) => (c._id === id ? { ...c, ...updated } : c))
      );
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.list() });
    },
  });
}

/** Handoff (AI <-> person) and assignment. Status changes keep their own hook above. */
export function useUpdateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: ConversationPatch }) => updateConversation(id, patch),
    retry: false,
    onSuccess: (updated, { id }) => {
      queryClient.setQueryData<Conversation[]>(conversationQueryKeys.list(), (old) =>
        old?.map((c) => (c._id === id ? { ...c, ...updated } : c))
      );
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.list() });
    },
  });
}

export function useSendReply(conversationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: string) => sendReply(conversationId, body),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: conversationQueryKeys.list() });
    },
  });
}
