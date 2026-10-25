import api from './client';
import { hasStringField, isRecord, pathId, unwrap } from './envelope';
import type { ApiEnvelope } from '../../features/users/types';
import type {
  CreateDocumentInput,
  IndexResult,
  KnowledgeDocument,
  SearchMode,
  SearchResult,
  UpdateDocumentInput,
} from '../../features/knowledge/types';

function assertDocument(value: unknown, label: string): KnowledgeDocument {
  if (!hasStringField(value, '_id') || !hasStringField(value, 'title')) {
    throw new Error(`Received an invalid document record while ${label}.`);
  }
  return value as KnowledgeDocument;
}

export async function listDocuments(knowledgeBaseId: string): Promise<KnowledgeDocument[]> {
  if (!knowledgeBaseId) throw new Error('Knowledge base id is required.');
  const res = await api.get<ApiEnvelope<KnowledgeDocument[]>>('/knowledge-documents/', { params: { knowledgeBaseId } });
  const data = unwrap(res.data, 'loading documents');
  if (!Array.isArray(data)) throw new Error('Received an invalid document list.');
  return data.map((d) => assertDocument(d, 'loading documents'));
}

export async function createDocument(payload: CreateDocumentInput): Promise<KnowledgeDocument> {
  const res = await api.post<ApiEnvelope<KnowledgeDocument>>('/knowledge-documents/', payload);
  return assertDocument(unwrap(res.data, 'creating the document'), 'creating the document');
}

export async function updateDocument(id: string, payload: UpdateDocumentInput): Promise<KnowledgeDocument> {
  const res = await api.patch<ApiEnvelope<KnowledgeDocument>>(pathId('/knowledge-documents', id, 'Document'), payload);
  return assertDocument(unwrap(res.data, 'updating the document'), 'updating the document');
}

/** Backend soft-deletes the document and removes its stored text chunks. */
export async function deleteDocument(id: string): Promise<KnowledgeDocument> {
  const res = await api.delete<ApiEnvelope<KnowledgeDocument>>(pathId('/knowledge-documents', id, 'Document'));
  return assertDocument(unwrap(res.data, 'deleting the document'), 'deleting the document');
}

function assertIndexResult(value: unknown, label: string): IndexResult {
  if (!hasStringField(value, 'documentId') || !isRecord(value) || typeof value['indexingState'] !== 'string') {
    throw new Error(`Received an invalid index result while ${label}.`);
  }
  return value as unknown as IndexResult;
}

/** Splits the document into pieces and stores them; the backend finishes before it responds. */
export async function indexDocument(id: string): Promise<IndexResult> {
  const res = await api.post<ApiEnvelope<IndexResult>>(`${pathId('/knowledge-documents', id, 'Document')}/index`);
  return assertIndexResult(unwrap(res.data, 'indexing the document'), 'indexing the document');
}

export async function removeDocumentIndex(id: string): Promise<IndexResult> {
  const res = await api.delete<ApiEnvelope<IndexResult>>(`${pathId('/knowledge-documents', id, 'Document')}/index`);
  return assertIndexResult(unwrap(res.data, 'removing the index'), 'removing the index');
}

export async function searchKnowledge(
  query: string,
  knowledgeBaseIds: string[],
  mode: SearchMode,
  limit = 5
): Promise<SearchResult[]> {
  const res = await api.post<ApiEnvelope<SearchResult[]>>('/knowledge-bases/search', { query, knowledgeBaseIds, mode, limit });
  const data = unwrap(res.data, 'searching knowledge');
  if (!Array.isArray(data)) throw new Error('Received invalid search results.');
  return data.map((r) => {
    if (!isRecord(r) || typeof r['content'] !== 'string') throw new Error('Received an invalid search result.');
    return r;
  });
}
