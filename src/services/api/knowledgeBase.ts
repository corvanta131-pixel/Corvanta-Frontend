import api from './client';
import { hasStringField, pathId, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type { KnowledgeBase, KnowledgeBaseInput, KnowledgeBaseSummary } from '../../features/knowledge/types';

function assertKnowledgeBase<T extends KnowledgeBaseSummary>(value: unknown, label: string): T {
  if (!hasStringField(value, '_id') || !hasStringField(value, 'name')) {
    throw new Error(`Received an invalid knowledge base record while ${label}.`);
  }
  return value as T;
}

/** Names and status only (used by the agent form). */
export async function fetchKnowledgeBases(): Promise<KnowledgeBaseSummary[]> {
  const res = await api.get<ApiEnvelope<KnowledgeBaseSummary[]>>('/knowledge-bases/');
  const data = unwrap(res.data, 'loading knowledge bases');
  if (!Array.isArray(data)) throw new Error('Received an invalid knowledge base list.');
  return data.map((kb) => assertKnowledgeBase<KnowledgeBaseSummary>(kb, 'loading knowledge bases'));
}

export async function listKnowledgeBases(): Promise<KnowledgeBase[]> {
  const res = await api.get<ApiEnvelope<KnowledgeBase[]>>('/knowledge-bases/');
  const data = unwrap(res.data, 'loading knowledge bases');
  if (!Array.isArray(data)) throw new Error('Received an invalid knowledge base list.');
  return data.map((kb) => assertKnowledgeBase<KnowledgeBase>(kb, 'loading knowledge bases'));
}

export async function createKnowledgeBase(payload: KnowledgeBaseInput): Promise<KnowledgeBase> {
  const res = await api.post<ApiEnvelope<KnowledgeBase>>('/knowledge-bases/', payload);
  return assertKnowledgeBase<KnowledgeBase>(unwrap(res.data, 'creating the knowledge base'), 'creating the knowledge base');
}

export async function updateKnowledgeBase(id: string, payload: KnowledgeBaseInput): Promise<KnowledgeBase> {
  const res = await api.patch<ApiEnvelope<KnowledgeBase>>(pathId('/knowledge-bases', id, 'Knowledge base'), payload);
  return assertKnowledgeBase<KnowledgeBase>(unwrap(res.data, 'updating the knowledge base'), 'updating the knowledge base');
}

/** Backend soft-deletes the knowledge base. */
export async function deleteKnowledgeBase(id: string): Promise<KnowledgeBase> {
  const res = await api.delete<ApiEnvelope<KnowledgeBase>>(pathId('/knowledge-bases', id, 'Knowledge base'));
  return assertKnowledgeBase<KnowledgeBase>(unwrap(res.data, 'deleting the knowledge base'), 'deleting the knowledge base');
}
