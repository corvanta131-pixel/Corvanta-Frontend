import type { DocumentStatus, IndexingState, KnowledgeDocument } from './types';

export const DOCUMENT_STATUS_LABELS: Record<KnowledgeDocument['status'], string> = {
  draft: 'Draft',
  published: 'Published',
  archived: 'Archived',
  indexing: 'Indexing',
  indexed: 'Indexed',
  index_failed: 'Index failed',
};

export const DOCUMENT_STATUS_STYLES: Record<KnowledgeDocument['status'], string> = {
  published: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  indexed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  draft: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  indexing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  index_failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  archived: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

export const INDEXING_LABELS: Record<IndexingState, string> = {
  unindexed: 'Not indexed',
  pending: 'Waiting to index',
  indexing: 'Indexing…',
  indexed: 'Indexed',
  index_failed: 'Index failed',
};

export const EDITABLE_DOCUMENT_STATUSES: readonly DocumentStatus[] = ['draft', 'published', 'archived'];

/** Content edited after the last index, so meaning-based search would use old text. */
export function isIndexOutdated(doc: KnowledgeDocument): boolean {
  if (doc.indexingState !== 'indexed' || !doc.lastIndexedAt) return false;
  const edited = new Date(doc.updatedAt).getTime();
  const indexed = new Date(doc.lastIndexedAt).getTime();
  if (Number.isNaN(edited) || Number.isNaN(indexed)) return false;
  return edited - indexed > 5000;
}

/** Plain-language notes about what a document can and cannot do right now. */
export function documentNotes(doc: KnowledgeDocument): string[] {
  const notes: string[] = [];
  if (doc.status === 'draft') notes.push('Draft: your AI agent does not use this yet. Publish it to include it in answers.');
  if (doc.status === 'archived') notes.push('Archived: not used in answers.');
  if (doc.indexingState === 'index_failed') notes.push(doc.indexingError ? `Indexing failed: ${doc.indexingError}` : 'Indexing failed.');
  if (isIndexOutdated(doc)) notes.push('Edited since it was indexed. Re-index it to refresh meaning-based search.');
  if ((doc.content ?? '').trim() === '' && (doc.summary ?? '').trim() === '') notes.push('This document has no text yet.');
  return notes;
}

export function preview(text: string | undefined, max = 160): string {
  const clean = (text ?? '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max).trimEnd()}…` : clean;
}
