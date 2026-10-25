import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { KnowledgePage } from './KnowledgePage';
import { documentSchema } from '../../components/knowledge/DocumentForm';
import { knowledgeBaseSchema } from '../../components/knowledge/KnowledgeBaseForm';
import authReducer from '../../features/auth/authSlice';
import * as kbApi from '../../services/api/knowledgeBase';
import * as docApi from '../../services/api/knowledgeDocument';
import type { User } from '../../features/auth/types';
import type { KnowledgeBase, KnowledgeDocument } from '../../features/knowledge/types';

vi.mock('../../services/api/knowledgeBase', () => ({
  fetchKnowledgeBases: vi.fn(),
  listKnowledgeBases: vi.fn(),
  createKnowledgeBase: vi.fn(),
  updateKnowledgeBase: vi.fn(),
  deleteKnowledgeBase: vi.fn(),
}));
vi.mock('../../services/api/knowledgeDocument', () => ({
  listDocuments: vi.fn(),
  createDocument: vi.fn(),
  updateDocument: vi.fn(),
  deleteDocument: vi.fn(),
  indexDocument: vi.fn(),
  removeDocumentIndex: vi.fn(),
  searchKnowledge: vi.fn(),
}));
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const kbs = vi.mocked(kbApi);
const docs = vi.mocked(docApi);

function makeUser(permissions: string[]): User {
  return {
    _id: 'u1',
    companyId: 'c1',
    name: 'Olivia',
    email: 'o@x.com',
    roleId: {
      _id: 'r',
      companyId: 'c1',
      name: 'Owner',
      slug: 'owner',
      permissions,
      isSystem: true,
      createdBy: null,
      createdAt: '',
      updatedAt: '',
      __v: 0,
    },
    employeeCode: '',
    department: '',
    title: '',
    managerId: null,
    status: 'active',
    isEmailVerified: true,
    isDeleted: false,
    lastLoginAt: null,
    createdAt: '',
    updatedAt: '',
    __v: 0,
  };
}

const kb1: KnowledgeBase = { _id: 'kb-1', name: 'Product FAQ', description: 'Answers about products', status: 'active', createdAt: '', updatedAt: '' };
const kb2: KnowledgeBase = { _id: 'kb-2', name: 'Returns policy', status: 'active', createdAt: '', updatedAt: '' };

function document(over: Partial<KnowledgeDocument> = {}): KnowledgeDocument {
  return {
    _id: 'd-1',
    knowledgeBaseId: 'kb-1',
    title: 'Shipping times',
    content: 'We ship within two working days.',
    summary: '',
    status: 'published',
    indexingState: 'unindexed',
    chunkCount: 0,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    ...over,
  };
}

const published = document({ indexingState: 'indexed', chunkCount: 3, lastIndexedAt: '2025-01-01T00:00:00.000Z' });
const draft = document({ _id: 'd-2', title: 'Draft doc', status: 'draft' });

const ALL = ['knowledge:read', 'knowledge:create', 'knowledge:update', 'knowledge:delete'];

function renderPage(permissions: string[] = ALL) {
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: {
      auth: {
        user: makeUser(permissions),
        company: null,
        accessToken: 'a',
        refreshToken: 'r',
        isAuthenticated: true,
        isInitializing: false,
        isLoading: false,
        error: null,
      },
    },
  });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <KnowledgePage />
        </MemoryRouter>
      </QueryClientProvider>
    </Provider>
  );
}

/** Waits for the documents list (loading skeletons come first). */
const findDocs = async () => within(await screen.findByRole('list', { name: 'Documents' }));

describe('knowledge form schemas', () => {
  it('mirror the backend limits', () => {
    expect(knowledgeBaseSchema.safeParse({ name: 'A', description: '', status: 'active' }).success).toBe(false);
    expect(knowledgeBaseSchema.safeParse({ name: 'FAQ', description: 'x'.repeat(2001), status: 'active' }).success).toBe(false);
    expect(knowledgeBaseSchema.safeParse({ name: 'FAQ', description: '', status: 'active' }).success).toBe(true);
    const base = { title: 'Policy', summary: '', content: '', status: 'published' as const };
    expect(documentSchema.safeParse(base).success).toBe(true);
    expect(documentSchema.safeParse({ ...base, title: 'P' }).success).toBe(false);
    expect(documentSchema.safeParse({ ...base, content: 'x'.repeat(50001) }).success).toBe(false);
    expect(documentSchema.safeParse({ ...base, status: 'indexed' }).success).toBe(false);
  });
});

describe('KnowledgePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    kbs.listKnowledgeBases.mockResolvedValue([kb1, kb2]);
    docs.listDocuments.mockImplementation(async (id) => (id === 'kb-1' ? [published, draft] : []));
  });

  it('is restricted and makes no requests without knowledge:read', () => {
    renderPage(['customers:read']);
    expect(screen.getByText('Restricted access')).toBeInTheDocument();
    expect(kbs.listKnowledgeBases).not.toHaveBeenCalled();
    expect(docs.listDocuments).not.toHaveBeenCalled();
  });

  it('shows loading, then an error with retry', async () => {
    const user = userEvent.setup();
    kbs.listKnowledgeBases.mockReturnValueOnce(new Promise(() => {}));
    const first = renderPage();
    expect(screen.getByRole('status', { name: /loading knowledge/i })).toBeInTheDocument();
    first.unmount();

    kbs.listKnowledgeBases.mockRejectedValueOnce(new Error('Knowledge offline'));
    renderPage();
    expect(await screen.findByText('Knowledge offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByRole('navigation', { name: 'Knowledge bases' })).toBeInTheDocument();
  });

  it('shows an empty state, with a create button only when allowed', async () => {
    kbs.listKnowledgeBases.mockResolvedValue([]);
    const first = renderPage();
    expect(await screen.findByText('No knowledge bases yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create your first knowledge base/i })).toBeInTheDocument();
    first.unmount();

    renderPage(['knowledge:read']);
    expect(await screen.findByText('No knowledge bases yet')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /create your first knowledge base/i })).not.toBeInTheDocument();
  });

  it('selects the first knowledge base, loads its documents, and switches on click', async () => {
    const user = userEvent.setup();
    renderPage();
    const list = await findDocs();
    expect(await list.findByText('Shipping times')).toBeInTheDocument();
    expect(docs.listDocuments).toHaveBeenCalledWith('kb-1');
    expect(screen.getByRole('heading', { name: 'Product FAQ' })).toBeInTheDocument();

    await user.click(within(screen.getByRole('navigation', { name: 'Knowledge bases' })).getByRole('button', { name: /Returns policy/ }));
    expect(await screen.findByText('No documents yet')).toBeInTheDocument();
    expect(docs.listDocuments).toHaveBeenCalledWith('kb-2');
    expect(screen.getByRole('heading', { name: 'Returns policy' })).toBeInTheDocument();
  });

  it('shows status, indexing and plain-language notes for each document', async () => {
    docs.listDocuments.mockResolvedValue([
      published,
      draft,
      document({ _id: 'd-3', title: 'Broken doc', status: 'index_failed', indexingState: 'index_failed', indexingError: 'Embedding provider unavailable' }),
      document({ _id: 'd-4', title: 'Stale doc', indexingState: 'indexed', chunkCount: 2, lastIndexedAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-09T00:00:00.000Z' }),
    ]);
    renderPage();
    const list = await findDocs();
    expect(await list.findByText('Shipping times')).toBeInTheDocument();
    expect(list.getByText(/3 pieces/)).toBeInTheDocument();
    expect(list.getByText(/Draft: your AI agent does not use this yet/)).toBeInTheDocument();
    expect(list.getByText(/Indexing failed: Embedding provider unavailable/)).toBeInTheDocument();
    expect(list.getByText(/Edited since it was indexed/)).toBeInTheDocument();
  });

  it('shows a document error with retry', async () => {
    const user = userEvent.setup();
    docs.listDocuments.mockRejectedValueOnce(new Error('Documents offline'));
    renderPage();
    expect(await screen.findByText('Documents offline')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await (await findDocs()).findByText('Shipping times')).toBeInTheDocument();
  });

  it('creates a knowledge base with the exact payload and selects it', async () => {
    const user = userEvent.setup();
    const created: KnowledgeBase = { _id: 'kb-9', name: 'Pricing', status: 'active', createdAt: '', updatedAt: '' };
    kbs.createKnowledgeBase.mockResolvedValue(created);
    renderPage();
    await findDocs();

    await user.click(screen.getByRole('button', { name: 'Add knowledge base' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Name *'), 'Pricing');
    await user.click(within(dialog).getByRole('button', { name: /create knowledge base/i }));

    await waitFor(() => expect(kbs.createKnowledgeBase).toHaveBeenCalledTimes(1));
    expect(kbs.createKnowledgeBase.mock.calls[0]?.[0]).toEqual({ name: 'Pricing', description: '', status: 'active' });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Pricing was created.'));
  });

  it('validates and shows server errors for a knowledge base', async () => {
    const user = userEvent.setup();
    kbs.createKnowledgeBase.mockRejectedValue(new Error('A knowledge base with this name already exists in this company.'));
    renderPage();
    await findDocs();
    await user.click(screen.getByRole('button', { name: 'Add knowledge base' }));
    const dialog = screen.getByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: /create knowledge base/i }));
    expect(await within(dialog).findByText('Name must be at least 2 characters')).toBeInTheDocument();
    expect(kbs.createKnowledgeBase).not.toHaveBeenCalled();

    await user.type(within(dialog).getByLabelText('Name *'), 'Product FAQ');
    await user.click(within(dialog).getByRole('button', { name: /create knowledge base/i }));
    expect(await within(dialog).findByText(/already exists/i)).toBeInTheDocument();
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('edits a knowledge base with a prefilled form and the required name', async () => {
    const user = userEvent.setup();
    kbs.updateKnowledgeBase.mockResolvedValue({ ...kb1, name: 'Product FAQ v2' });
    renderPage();
    await findDocs();

    await user.click(screen.getByRole('button', { name: 'Edit knowledge base' }));
    const dialog = screen.getByRole('dialog');
    const name = within(dialog).getByLabelText('Name *');
    expect(name).toHaveValue('Product FAQ');
    expect(within(dialog).getByLabelText('Description')).toHaveValue('Answers about products');
    await user.clear(name);
    await user.type(name, 'Product FAQ v2');
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(kbs.updateKnowledgeBase).toHaveBeenCalledTimes(1));
    expect(kbs.updateKnowledgeBase.mock.calls[0]?.[0]).toBe('kb-1');
    expect(kbs.updateKnowledgeBase.mock.calls[0]?.[1]).toEqual({ name: 'Product FAQ v2', description: 'Answers about products', status: 'active' });
  });

  it('asks before deleting a knowledge base, and keeps it when deletion fails', async () => {
    const user = userEvent.setup();
    renderPage();
    await findDocs();

    await user.click(screen.getByRole('button', { name: 'Delete knowledge base' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));
    expect(kbs.deleteKnowledgeBase).not.toHaveBeenCalled();

    kbs.deleteKnowledgeBase.mockRejectedValue(new Error('Knowledge base not found.'));
    await user.click(screen.getByRole('button', { name: 'Delete knowledge base' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^delete knowledge base$/i }));
    expect(await within(dialog).findByText('Knowledge base not found.')).toBeInTheDocument();
    expect(kbs.deleteKnowledgeBase.mock.calls[0]?.[0]).toBe('kb-1');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('adds a document that defaults to published, with the exact payload', async () => {
    const user = userEvent.setup();
    docs.createDocument.mockResolvedValue(document({ _id: 'd-9', title: 'Returns' }));
    renderPage();
    await findDocs();

    await user.click(screen.getByRole('button', { name: 'Add document' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByLabelText('Status')).toHaveValue('published');
    await user.type(within(dialog).getByLabelText('Title *'), 'Returns');
    await user.type(within(dialog).getByLabelText('Content'), 'Returns accepted within 30 days.');
    await user.click(within(dialog).getByRole('button', { name: /add document/i }));

    await waitFor(() => expect(docs.createDocument).toHaveBeenCalledTimes(1));
    expect(docs.createDocument.mock.calls[0]?.[0]).toEqual({
      knowledgeBaseId: 'kb-1',
      title: 'Returns',
      content: 'Returns accepted within 30 days.',
      summary: '',
      status: 'published',
    });
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Returns was added.'));
  });

  it('blocks a document with a short title and keeps the form open on server errors', async () => {
    const user = userEvent.setup();
    docs.createDocument.mockRejectedValue(new Error('Knowledge base not found or does not belong to your company.'));
    renderPage();
    await findDocs();
    await user.click(screen.getByRole('button', { name: 'Add document' }));
    const dialog = screen.getByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: /add document/i }));
    expect(await within(dialog).findByText('Title must be at least 2 characters')).toBeInTheDocument();
    expect(docs.createDocument).not.toHaveBeenCalled();

    await user.type(within(dialog).getByLabelText('Title *'), 'Pricing');
    await user.type(within(dialog).getByLabelText('Content'), 'Keep this text');
    await user.click(within(dialog).getByRole('button', { name: /add document/i }));
    expect(await within(dialog).findByText(/does not belong to your company/i)).toBeInTheDocument();
    expect(within(dialog).getByLabelText('Content')).toHaveValue('Keep this text');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('edits a document, sending title, content, summary and status', async () => {
    const user = userEvent.setup();
    docs.updateDocument.mockResolvedValue({ ...published, title: 'Shipping times 2' });
    renderPage();
    const list = await findDocs();
    await user.click(await list.findByRole('button', { name: 'Edit Shipping times' }));

    const dialog = screen.getByRole('dialog');
    const title = within(dialog).getByLabelText('Title *');
    expect(title).toHaveValue('Shipping times');
    expect(within(dialog).getByLabelText('Content')).toHaveValue('We ship within two working days.');
    await user.clear(title);
    await user.type(title, 'Shipping times 2');
    await user.click(within(dialog).getByRole('button', { name: /save changes/i }));

    await waitFor(() => expect(docs.updateDocument).toHaveBeenCalledTimes(1));
    expect(docs.updateDocument.mock.calls[0]?.[0]).toBe('d-1');
    expect(docs.updateDocument.mock.calls[0]?.[1]).toEqual({
      title: 'Shipping times 2',
      summary: '',
      content: 'We ship within two working days.',
      status: 'published',
    });
  });

  it('asks before discarding unsaved document edits', async () => {
    const user = userEvent.setup();
    renderPage();
    const list = await findDocs();
    await user.click(await list.findByRole('button', { name: 'Edit Shipping times' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Content'), ' More text.');
    await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }));
    expect(screen.getByRole('alertdialog', { name: 'Discard changes?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(within(screen.getByRole('dialog')).getByLabelText('Content')).toHaveValue('We ship within two working days. More text.');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /^cancel$/i }));
    await user.click(screen.getByRole('button', { name: 'Discard' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(docs.updateDocument).not.toHaveBeenCalled();
  });

  it('publishes and unpublishes with only the title and status', async () => {
    const user = userEvent.setup();
    docs.updateDocument.mockResolvedValue(published);
    renderPage();
    const list = await findDocs();

    await user.click(await list.findByRole('button', { name: 'Publish Draft doc' }));
    await waitFor(() => expect(docs.updateDocument).toHaveBeenCalledTimes(1));
    expect(docs.updateDocument.mock.calls[0]).toEqual(['d-2', { title: 'Draft doc', status: 'published' }]);
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Draft doc is now published.'));

    await user.click(list.getByRole('button', { name: 'Unpublish Shipping times' }));
    await waitFor(() => expect(docs.updateDocument).toHaveBeenCalledTimes(2));
    expect(docs.updateDocument.mock.calls[1]).toEqual(['d-1', { title: 'Shipping times', status: 'draft' }]);
  });

  it('indexes a document and reports the result, or the failure', async () => {
    const user = userEvent.setup();
    docs.indexDocument.mockResolvedValue({ documentId: 'd-2', chunkCount: 4, vectorCount: 4, indexingState: 'indexed', lastIndexedAt: null });
    renderPage();
    const list = await findDocs();

    await user.click(await list.findByRole('button', { name: 'Index Draft doc' }));
    await waitFor(() => expect(docs.indexDocument).toHaveBeenCalledTimes(1));
    expect(docs.indexDocument.mock.calls[0]?.[0]).toBe('d-2');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('Draft doc was indexed (4 pieces).'));

    docs.indexDocument.mockRejectedValueOnce(new Error('Embedding provider unavailable'));
    await user.click(list.getByRole('button', { name: 'Re-index Shipping times' }));
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Embedding provider unavailable'));
  });

  it('removes an index', async () => {
    const user = userEvent.setup();
    docs.removeDocumentIndex.mockResolvedValue({ documentId: 'd-1', chunkCount: 0, vectorCount: 0, indexingState: 'unindexed', lastIndexedAt: null });
    renderPage();
    const list = await findDocs();
    await user.click(await list.findByRole('button', { name: 'Remove index for Shipping times' }));
    await waitFor(() => expect(docs.removeDocumentIndex).toHaveBeenCalledTimes(1));
    expect(docs.removeDocumentIndex.mock.calls[0]?.[0]).toBe('d-1');
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith('The index for Shipping times was removed.'));
  });

  it('asks before deleting a document and reports failures', async () => {
    const user = userEvent.setup();
    renderPage();
    const list = await findDocs();

    await user.click(await list.findByRole('button', { name: 'Delete Shipping times' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /cancel/i }));
    expect(docs.deleteDocument).not.toHaveBeenCalled();

    docs.deleteDocument.mockRejectedValue(new Error('Knowledge document not found.'));
    await user.click(list.getByRole('button', { name: 'Delete Shipping times' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: /^delete document$/i }));
    expect(await within(dialog).findByText('Knowledge document not found.')).toBeInTheDocument();
    expect(docs.deleteDocument.mock.calls[0]?.[0]).toBe('d-1');
    expect(toast.success).not.toHaveBeenCalled();
  });

  it('hides write controls for a read-only user but still allows searching', async () => {
    renderPage(['knowledge:read']);
    const list = await findDocs();
    await list.findByText('Shipping times');
    expect(screen.queryByRole('button', { name: /add knowledge base/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add document/i })).not.toBeInTheDocument();
    expect(list.queryByRole('button', { name: /^(edit|delete|publish|unpublish|index|re-index) /i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('tests what the assistant would find, defaulting to keyword search like the website chat', async () => {
    const user = userEvent.setup();
    docs.searchKnowledge.mockResolvedValue([{ id: 'd-1', title: 'Shipping times', content: 'We ship within two working days.', score: 3 }]);
    renderPage();
    await findDocs();

    expect(screen.getByLabelText('Search type')).toHaveValue('keyword');
    await user.type(screen.getByLabelText('A customer’s question'), 'how fast is shipping');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    await waitFor(() => expect(docs.searchKnowledge).toHaveBeenCalledTimes(1));
    expect(docs.searchKnowledge.mock.calls[0]).toEqual(['how fast is shipping', ['kb-1'], 'keyword']);
    const results = within(await screen.findByRole('list', { name: 'Search results' }));
    expect(results.getByText('Shipping times')).toBeInTheDocument();
    expect(results.getByText(/We ship within two working days/)).toBeInTheDocument();
  });

  it('explains empty search results differently for each mode, and shows errors', async () => {
    const user = userEvent.setup();
    docs.searchKnowledge.mockResolvedValue([]);
    renderPage();
    await findDocs();
    await user.type(screen.getByLabelText('A customer’s question'), 'refund');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByText(/Only published documents are searched/)).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Search type'), 'semantic');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByText(/only finds documents that have been indexed/i)).toBeInTheDocument();
    expect(docs.searchKnowledge.mock.calls[1]?.[2]).toBe('semantic');

    docs.searchKnowledge.mockRejectedValueOnce(new Error('Embedding provider unavailable'));
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByText('Embedding provider unavailable')).toBeInTheDocument();
  });
});
