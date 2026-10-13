import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchConversations, fetchMessages, updateConversationStatus } from '../../services/api/conversation';
import type { Conversation, ConversationStatus } from './types';

export const conversationQueryKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationQueryKeys.all, 'list'] as const,
  messages: (id: string) => [...conversationQueryKeys.all, 'messages', id] as const,
};

export const MESSAGE_PAGE_LIMIT = 100;

export function useConversations(enabled = true) {
  return useQuery({
    queryKey: conversationQueryKeys.list(),
    queryFn: fetchConversations,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useConversationMessages(conversationId: string | null, enabled = true) {
  return useQuery({
    queryKey: conversationQueryKeys.messages(conversationId ?? ''),
    queryFn: () => fetchMessages(conversationId as string, MESSAGE_PAGE_LIMIT),
    enabled: enabled && !!conversationId,
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
