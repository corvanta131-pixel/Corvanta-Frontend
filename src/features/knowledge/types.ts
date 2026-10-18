export type KnowledgeBaseStatus = 'active' | 'archived';

/** The few knowledge base fields other screens need (for example the agent form). */
export interface KnowledgeBaseSummary {
  _id: string;
  name: string;
  status: KnowledgeBaseStatus;
  description?: string | undefined;
}

/** Knowledge base as returned by /knowledge-bases. */
export interface KnowledgeBase extends KnowledgeBaseSummary {
  ownerId?: string | null | undefined;
  createdAt: string;
  updatedAt: string;
}

/** POST/PATCH body. Backend: name 2-120 (required on update too), description <= 2000. */
export interface KnowledgeBaseInput {
  name: string;
  description: string;
  status: KnowledgeBaseStatus;
}

export type DocumentStatus = 'draft' | 'published' | 'archived';
export type IndexingState = 'unindexed' | 'pending' | 'indexing' | 'indexed' | 'index_failed';

/** Document as returned by /knowledge-documents (text content only; there is no file upload). */
export interface KnowledgeDocument {
  _id: string;
  knowledgeBaseId: string;
  title: string;
  content?: string | undefined;
  summary?: string | undefined;
  /** Input only allows draft/published/archived; the model also has indexing states. */
  status: DocumentStatus | 'indexing' | 'indexed' | 'index_failed';
  indexingState: IndexingState;
  indexingError?: string | undefined;
  lastIndexedAt?: string | null | undefined;
  chunkCount: number;
  createdAt: string;
  updatedAt: string;
}

/** POST body. Backend: title 2-200, summary <= 2000, content <= 50000, status draft/published/archived. */
export interface CreateDocumentInput {
  knowledgeBaseId: string;
  title: string;
  content: string;
  summary: string;
  status: DocumentStatus;
}

/** PATCH body: only the fields being changed (title is always required by the backend). */
export interface UpdateDocumentInput {
  title: string;
  content?: string | undefined;
  summary?: string | undefined;
  status?: DocumentStatus | undefined;
}

/** From POST /knowledge-documents/:id/index (indexing finishes before the response). */
export interface IndexResult {
  documentId: string;
  chunkCount: number;
  vectorCount: number;
  indexingState: IndexingState;
  lastIndexedAt: string | null;
}

export type SearchMode = 'keyword' | 'semantic';

/** One hit from POST /knowledge-bases/search. Fields vary a little between modes. */
export interface SearchResult {
  id?: string | undefined;
  knowledgeDocumentId?: string | undefined;
  knowledgeBaseId?: string | undefined;
  title?: string | undefined;
  content: string;
  score?: number | undefined;
}