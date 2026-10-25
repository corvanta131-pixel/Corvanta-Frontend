import { describe, it, expect } from 'vitest';
import { documentNotes, isIndexOutdated, preview } from './knowledgeUtils';
import type { KnowledgeDocument } from './types';

function doc(over: Partial<KnowledgeDocument> = {}): KnowledgeDocument {
  return {
    _id: 'd-1',
    knowledgeBaseId: 'kb-1',
    title: 'Shipping times',
    content: 'We ship in 2 days.',
    status: 'published',
    indexingState: 'unindexed',
    chunkCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...over,
  };
}

describe('isIndexOutdated', () => {
  it('is true only when edited well after the last index', () => {
    const indexed = { indexingState: 'indexed' as const, lastIndexedAt: '2025-01-01T00:00:00.000Z' };
    expect(isIndexOutdated(doc({ ...indexed, updatedAt: '2025-01-03T00:00:00.000Z' }))).toBe(true);
    expect(isIndexOutdated(doc({ ...indexed, updatedAt: '2025-01-01T00:00:02.000Z' }))).toBe(false);
    expect(isIndexOutdated(doc({ indexingState: 'unindexed', updatedAt: '2025-03-01T00:00:00.000Z' }))).toBe(false);
    expect(isIndexOutdated(doc({ indexingState: 'indexed', lastIndexedAt: null }))).toBe(false);
    expect(isIndexOutdated(doc({ ...indexed, updatedAt: 'not a date' }))).toBe(false);
  });
});

describe('documentNotes', () => {
  it('has nothing to say about a healthy published document', () => {
    expect(documentNotes(doc())).toEqual([]);
  });

  it('explains drafts and archived documents', () => {
    expect(documentNotes(doc({ status: 'draft' })).join(' ')).toMatch(/does not use this yet/i);
    expect(documentNotes(doc({ status: 'archived' })).join(' ')).toMatch(/not used in answers/i);
  });

  it('surfaces the server\'s indexing error and an out-of-date index', () => {
    expect(documentNotes(doc({ indexingState: 'index_failed', indexingError: 'Provider down' })).join(' ')).toMatch(/Provider down/);
    expect(documentNotes(doc({ indexingState: 'index_failed' })).join(' ')).toMatch(/Indexing failed\./);
    expect(
      documentNotes(doc({ indexingState: 'indexed', lastIndexedAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-02-01T00:00:00.000Z' })).join(' ')
    ).toMatch(/Re-index/);
  });

  it('flags a document with no text', () => {
    expect(documentNotes(doc({ content: '  ', summary: '' })).join(' ')).toMatch(/no text yet/i);
    expect(documentNotes(doc({ content: undefined, summary: 'Short' }))).toEqual([]);
  });
});

describe('preview', () => {
  it('collapses whitespace and truncates', () => {
    expect(preview('  a   b\n c ')).toBe('a b c');
    expect(preview('x'.repeat(200), 10)).toBe('xxxxxxxxxx…');
    expect(preview(undefined)).toBe('');
  });
});
