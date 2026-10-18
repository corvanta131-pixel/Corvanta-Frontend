import { getErrorMessage } from '../../utils/apiError';
import type { KnowledgeBaseInput } from '../../features/knowledge/types';

export async function createKnowledgeBase(data: KnowledgeBaseInput) {
  const response = await fetch('/knowledge-bases/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to create knowledge base.'));
  }
  return response.json();
}

export async function updateKnowledgeBase(id: string, data: KnowledgeBaseInput) {
  const response = await fetch(`/knowledge-bases/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to update knowledge base.'));
  }
  return response.json();
}

export async function deleteKnowledgeBase(id: string) {
  const response = await fetch(`/knowledge-bases/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to delete knowledge base.'));
  }
  return response.json();
}

export async function listKnowledgeBases() {
  const response = await fetch('/knowledge-bases/', {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to list knowledge bases.'));
  }
  return response.json();
}


export async function updateKnowledgeBase(id: string, data: Pick<KnowledgeBaseInput, 'name' | 'description' | 'status' | undefined>) {
  const response = await fetch(`/knowledge-bases/${id}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to update knowledge base.'));
  }
  return response.json();
}

export async function deleteKnowledgeBase(id: string) {
  const response = await fetch(`/knowledge-bases/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to delete knowledge base.'));
  }
  return response.json();
}

export async function listKnowledgeBases() {
  const response = await fetch('/knowledge-bases/', {
    method: 'GET',
  });
  if (!response.ok) {
    throw new Error(getErrorMessage(response, 'Failed to list knowledge bases.'));
  }
  return response.json();
}
