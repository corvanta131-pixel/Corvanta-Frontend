import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchKnowledgeBases,
  listKnowledgeBases,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from '../../services/api/knowledgeBase';
import {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  indexDocument,
  removeDocumentIndex,
  searchKnowledge,
} from '../../services/api/knowledgeDocument';
import type { KnowledgeBaseInput, SearchMode, UpdateDocumentInput } from './types';

export const knowledgeQueryKeys = {
  all: ['knowledge-bases'] as const,
  full: () => [...knowledgeQueryKeys.all, 'full'] as const,
  documents: (knowledgeBaseId: string) => ['knowledge-documents', knowledgeBaseId] as const,
};

/** Names and status only (used by the agent form). */
export function useKnowledgeBases(enabled = true) {
  return useQuery({
    queryKey: knowledgeQueryKeys.all,
    queryFn: fetchKnowledgeBases,
    enabled,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useKnowledgeBaseList(enabled = true) {
  return useQuery({
    queryKey: knowledgeQueryKeys.full(),
    queryFn: listKnowledgeBases,
    enabled,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useCreateKnowledgeBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createKnowledgeBase,
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeQueryKeys.all }),
  });
}

export function useUpdateKnowledgeBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: KnowledgeBaseInput }) => updateKnowledgeBase(id, data),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: knowledgeQueryKeys.all }),
  });
}

export function useDeleteKnowledgeBase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteKnowledgeBase,
    retry: false,
    onSuccess: (_result, id) => {
      queryClient.removeQueries({ queryKey: knowledgeQueryKeys.documents(id) });
      queryClient.invalidateQueries({ queryKey: knowledgeQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['agents'] });
    },
  });
}

export function useKnowledgeDocuments(knowledgeBaseId: string | null, enabled = true) {
  return useQuery({
    queryKey: knowledgeQueryKeys.documents(knowledgeBaseId ?? ''),
    queryFn: () => listDocuments(knowledgeBaseId as string),
    enabled: enabled && !!knowledgeBaseId,
    refetchOnWindowFocus: false,
  });
}

/** Document changes refresh that knowledge base's document list. */
function useRefreshDocuments(knowledgeBaseId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: knowledgeQueryKeys.documents(knowledgeBaseId) });
}

export function useCreateDocument(knowledgeBaseId: string) {
  const refresh = useRefreshDocuments(knowledgeBaseId);
  return useMutation({ mutationFn: createDocument, retry: false, onSuccess: refresh });
}

export function useUpdateDocument(knowledgeBaseId: string) {
  const refresh = useRefreshDocuments(knowledgeBaseId);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentInput }) => updateDocument(id, data),
    retry: false,
    onSuccess: refresh,
  });
}

export function useDeleteDocument(knowledgeBaseId: string) {
  const refresh = useRefreshDocuments(knowledgeBaseId);
  return useMutation({ mutationFn: deleteDocument, retry: false, onSuccess: refresh });
}

export function useIndexDocument(knowledgeBaseId: string) {
  const refresh = useRefreshDocuments(knowledgeBaseId);
  return useMutation({ mutationFn: indexDocument, retry: false, onSettled: refresh });
}

export function useRemoveDocumentIndex(knowledgeBaseId: string) {
  const refresh = useRefreshDocuments(knowledgeBaseId);
  return useMutation({ mutationFn: removeDocumentIndex, retry: false, onSettled: refresh });
}

export function useKnowledgeSearch() {
  return useMutation({
    mutationFn: ({ query, knowledgeBaseIds, mode }: { query: string; knowledgeBaseIds: string[]; mode: SearchMode }) =>
      searchKnowledge(query, knowledgeBaseIds, mode),
    retry: false,
  });
}