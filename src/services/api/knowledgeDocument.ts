import { getErrorMessage } from '../../utils/apiError';
import type { CreateDocumentInput, IndexResult, KnowledgeDocument, SearchMode, SearchResult, UpdateDocumentInput } from '../../features/knowledge/types';

export async function listDocuments(knowledgeBaseId: string) {
  const response = await fetch(`/knowledge-documents/?knowledgeBaseId=${knowledgeBaseId}`, {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to list documents.'));
  }
  return response.json();
}

export async function createDocument(data: CreateDocumentInput) {
  const response = await fetch('/knowledge-documents/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to create document.'));
  }
  return response.json();
}

export async function updateDocument(id: string, data: UpdateDocumentInput) {
  const response = await fetch(`/knowledge-documents/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to update document.'));
  }
  return response.json();
}

export async function deleteDocument(id: string) {
  const response = await fetch(`/knowledge-documents/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to delete document.'));
  }
  return response.json();
}

export async function indexDocument(id: string) {
  const response = await fetch(`/knowledge-documents/${id}/index`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to index document.'));
  }
  return response.json();
}

export async function removeDocumentIndex(id: string) {
  const response = await fetch(`/knowledge-documents/${id}/index`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to remove document index.'));
  }
  return response.json();
}

export async function searchKnowledge(query: string, knowledgeBaseIds: string[], mode: SearchMode, limit = 5) {
  const response = await fetch('/knowledge-bases/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, knowledgeBaseIds, mode, limit }),
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to search knowledge.'));
  }
  return response.json();
}