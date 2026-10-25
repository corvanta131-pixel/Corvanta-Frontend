import { useMemo } from 'react';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { useAgentList } from '../agents/hooks';
import { useChannels, useWidgetSettings } from '../channels/hooks';
import { useConversations } from '../conversations/hooks';
import { useEmployees } from '../users/hooks';
import { knowledgeQueryKeys } from '../knowledge/hooks';
import type { KnowledgeDocument } from '../knowledge/types';
import { listDocuments } from '../../services/api/knowledgeDocument';
import { computeSetupSteps, summarizeSetup, type SetupInput } from './setupSteps';

const MAX_KNOWLEDGE_BASES_CHECKED = 5;

export function useSetupStatus() {
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();

  const canAgents = can('agents:read', user);
  const canKnowledge = can('knowledge:read', user);
  const canChannels = can('channels:read', user);
  const canConversations = can('conversations:read', user);
  const canEmployees = can('employees:read', user);

  const agents = useAgentList(canAgents);
  const channels = useChannels(canChannels);
  const webchat = (channels.data ?? []).find((c) => c.type === 'webchat') ?? null;
  const widget = useWidgetSettings(webchat?._id ?? null, canChannels);
  const conversations = useConversations(canConversations);
  const employees = useEmployees(canEmployees);

  // Only the knowledge bases attached to ACTIVE agents matter, capped to keep this cheap.
  const attached = useMemo(() => {
    const active = (agents.data ?? []).filter((a) => a.status === 'active');
    return Array.from(new Set(active.flatMap((a) => a.knowledgeBaseIds))).slice(0, MAX_KNOWLEDGE_BASES_CHECKED);
  }, [agents.data]);

  const documentQueries = useQueries({
    queries: attached.map((id) => ({
      queryKey: knowledgeQueryKeys.documents(id),
      queryFn: () => listDocuments(id),
      enabled: canKnowledge,
      refetchOnWindowFocus: false,
    })),
  });

  const documentsData = useMemo(() => {
    const result: Record<string, KnowledgeDocument[]> = {};
    documentQueries.forEach((q, index) => {
      const id = attached[index];
      if (id && q.data) result[id] = q.data;
    });
    return result;
  }, [documentQueries, attached]);

  const documentsLoading = documentQueries.some((q) => q.isLoading);
  const documentsFailed = documentQueries.some((q) => q.isError);

  const input: SetupInput = {
    agents: { allowed: canAgents, loading: agents.isLoading, failed: agents.isError, data: agents.data },
    documents: {
      allowed: canKnowledge,
      loading: documentsLoading,
      failed: documentsFailed,
      data: documentsLoading ? undefined : documentsData,
    },
    widget: {
      allowed: canChannels,
      loading: channels.isLoading || (webchat !== null && widget.isLoading),
      failed: channels.isError || widget.isError,
      // No web chat channel yet is a legitimate "not set up" answer, not missing data.
      data: webchat === null ? (channels.data ? null : undefined) : widget.data,
    },
    conversations: { allowed: canConversations, loading: conversations.isLoading, failed: conversations.isError, data: conversations.data },
    employees: { allowed: canEmployees, loading: employees.isLoading, failed: employees.isError, data: employees.data },
    canReadKnowledge: canKnowledge,
  };

  const steps = computeSetupSteps(input);
  const progress = summarizeSetup(steps);

  const refresh = () => {
    for (const key of ['agents', 'channels', 'conversations', 'knowledge-documents', 'employees']) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  };

  return { steps, progress, refresh };
}
