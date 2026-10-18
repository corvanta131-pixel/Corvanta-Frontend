import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({ default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() } }));

import api from './client';
import {
  fetchKnowledgeBases,
  listKnowledgeBases,
  createKnowledgeBase,
  updateKnowledgeBase,
  deleteKnowledgeBase,
} from './knowledgeBase';
import {
  listDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  indexDocument,
  removeDocumentIndex,
  searchKnowledge,
} from './knowledgeDocument';

const mocked = vi.mocked(api);
const ok = (data: unknown) => ({ data: { success: true, data } });
const kb = { _id: 'kb-1', name: 'Product FAQ', status: 'active' };
const doc = { _id: 'd-1', title: 'Shipping', knowledgeBaseId: 'kb-1' };
const indexResult = { documentId: 'd-1', chunkCount: 3, vectorCount: 3, indexingState: 'indexed', lastIndexedAt: null };

describe('knowledge base API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses explicit methods and paths', async () => {
    mocked.get.mockResolvedValue(ok([kb]));
    await fetchKnowledgeBases();
    await listKnowledgeBases();
    expect(mocked.get).toHaveBeenLastCalledWith('/knowledge-bases/');

    mocked.post.mockResolvedValue(ok(kb));
    const input = { name: 'Product FAQ', description: '', status: 'active' as const };
    await createKnowledgeBase(input);
    expect(mocked.post).toHaveBeenCalledWith('/knowledge-bases/', input);

    mocked.patch.mockResolvedValue(ok(kb));
    await updateKnowledgeBase('kb-1', input);
    expect(mocked.patch).toHaveBeenCalledWith('/knowledge-bases/kb-1', input);

    mocked.delete.mockResolvedValue(ok(kb));
    await deleteKnowledgeBase('kb-1');
    expect(mocked.delete).toHaveBeenCalledWith('/knowledge-bases/kb-1');
  });

  it('rejects empty ids and malformed responses', async () => {
    await expect(updateKnowledgeBase('', { name: 'x', description: '', status: 'active' })).rejects.toThrow('Knowledge base id is required.');
    mocked.get.mockResolvedValueOnce(ok({ not: 'a list' }));
    await expect(listKnowledgeBases()).rejects.toThrow('invalid knowledge base list');
    mocked.get.mockResolvedValueOnce(ok([{ foo: 1 }]));
    await expect(listKnowledgeBases()).rejects.toThrow('invalid knowledge base record');
    mocked.get.mockResolvedValueOnce({ data: { success: false, message: 'Denied', data: null } });
    await expect(listKnowledgeBases()).rejects.toThrow('Denied');
  });
});

describe('knowledge document API service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('uses explicit methods and paths', async () => {
    mocked.get.mockResolvedValue(ok([doc]));
    await listDocuments('kb-1');
    expect(mocked.get).toHaveBeenCalledWith('/knowledge-documents/', { params: { knowledgeBaseId: 'kb-1' } });

    mocked.post.mockResolvedValue(ok(doc));
    const create = { knowledgeBaseId: 'kb-1', title: 'Shipping', content: 'Fast', summary: '', status: 'published' as const };
    await createDocument(create);
    expect(mocked.post).toHaveBeenCalledWith('/knowledge-documents/', create);

    mocked.patch.mockResolvedValue(ok(doc));
    await updateDocument('d-1', { title: 'Shipping', status: 'draft' });
    expect(mocked.patch).toHaveBeenCalledWith('/knowledge-documents/d-1', { title: 'Shipping', status: 'draft' });

    mocked.delete.mockResolvedValue(ok(doc));
    await deleteDocument('d-1');
    expect(mocked.delete).toHaveBeenCalledWith('/knowledge-documents/d-1');
  });

  it('indexes and un-indexes through the index sub-path', async () => {
    mocked.post.mockResolvedValue(ok(indexResult));
    const result = await indexDocument('d-1');
    expect(mocked.post).toHaveBeenCalledWith('/knowledge-documents/d-1/index');
    expect(result.chunkCount).toBe(3);

    mocked.delete.mockResolvedValue(ok({ ...indexResult, indexingState: 'unindexed' }));
    await removeDocumentIndex('d-1');
    expect(mocked.delete).toHaveBeenCalledWith('/knowledge-documents/d-1/index');
  });

  it('searches with the chosen mode', async () => {
    mocked.post.mockResolvedValue(ok([{ title: 'Shipping', content: 'Fast', score: 2 }]));
    const results = await searchKnowledge('how fast', ['kb-1'], 'keyword');
    expect(mocked.post).toHaveBeenCalledWith('/knowledge-bases/search', {
      query: 'how fast',
      knowledgeBaseIds: ['kb-1'],
      mode: 'keyword',
      limit: 5,
    });
    expect(results).toHaveLength(1);
  });

  it('rejects empty ids and malformed responses', async () => {
    await expect(listDocuments('')).rejects.toThrow('Knowledge base id is required.');
    await expect(indexDocument('')).rejects.toThrow('Document id is required.');
    mocked.get.mockResolvedValueOnce(ok([{ foo: 1 }]));
    await expect(listDocuments('kb-1')).rejects.toThrow('invalid document record');
    mocked.post.mockResolvedValueOnce(ok({ nope: true }));
    await expect(indexDocument('d-1')).rejects.toThrow('invalid index result');
    mocked.post.mockResolvedValueOnce(ok([{ title: 'No content' }]));
    await expect(searchKnowledge('q', [], 'keyword')).rejects.toThrow('invalid search result');
  });
});
