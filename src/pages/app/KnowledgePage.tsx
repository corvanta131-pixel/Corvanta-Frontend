import { useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Lock, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { KnowledgeBaseForm } from '../../components/knowledge/KnowledgeBaseForm';
import { DocumentForm, type DocumentFormResult } from '../../components/knowledge/DocumentForm';
import { DocumentCard } from '../../components/knowledge/DocumentCard';
import { KnowledgeSearchPanel } from '../../components/knowledge/KnowledgeSearchPanel';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage, isForbiddenError } from '../../utils/apiError';
import {
  useCreateDocument,
  useCreateKnowledgeBase,
  useDeleteDocument,
  useDeleteKnowledgeBase,
  useIndexDocument,
  useKnowledgeBaseList,
  useKnowledgeDocuments,
  useRemoveDocumentIndex,
  useUpdateDocument,
  useUpdateKnowledgeBase,
} from '../../features/knowledge/hooks';
import type { KnowledgeBase, KnowledgeBaseInput, KnowledgeDocument } from '../../features/knowledge/types';

export function KnowledgePage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('knowledge:read', user);
  const canCreate = can('knowledge:create', user);
  const canUpdate = can('knowledge:update', user);
  const canDelete = can('knowledge:delete', user);

  const kbQuery = useKnowledgeBaseList(canRead);
  const knowledgeBases = useMemo(() => kbQuery.data ?? [], [kbQuery.data]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected: KnowledgeBase | null = knowledgeBases.find((kb) => kb._id === selectedId) ?? knowledgeBases[0] ?? null;
  const selectedKbId = selected?._id ?? '';

  const docsQuery = useKnowledgeDocuments(selected?._id ?? null, canRead);
  const documents = useMemo(() => docsQuery.data ?? [], [docsQuery.data]);

  const createKb = useCreateKnowledgeBase();
  const updateKb = useUpdateKnowledgeBase();
  const deleteKb = useDeleteKnowledgeBase();
  const createDoc = useCreateDocument(selectedKbId);
  const updateDoc = useUpdateDocument(selectedKbId);
  const deleteDoc = useDeleteDocument(selectedKbId);
  const indexDoc = useIndexDocument(selectedKbId);
  const removeIndex = useRemoveDocumentIndex(selectedKbId);

  const [kbCreateOpen, setKbCreateOpen] = useState(false);
  const [kbEditOpen, setKbEditOpen] = useState(false);
  const [kbDeleteOpen, setKbDeleteOpen] = useState(false);
  const [docCreateOpen, setDocCreateOpen] = useState(false);
  const [docEditId, setDocEditId] = useState<string | null>(null);
  const [docDeleteId, setDocDeleteId] = useState<string | null>(null);
  const [busyDocId, setBusyDocId] = useState<string | null>(null);

  const docById = (id: string | null): KnowledgeDocument | null => documents.find((d) => d._id === id) ?? null;
  const docEditTarget = docById(docEditId);
  const docDeleteTarget = docById(docDeleteId);

  const closeKbCreate = () => {
    setKbCreateOpen(false);
    createKb.reset();
  };
  const closeKbEdit = () => {
    setKbEditOpen(false);
    updateKb.reset();
  };
  const closeKbDelete = () => {
    setKbDeleteOpen(false);
    deleteKb.reset();
  };
  const closeDocCreate = () => {
    setDocCreateOpen(false);
    createDoc.reset();
  };
  const closeDocEdit = () => {
    setDocEditId(null);
    updateDoc.reset();
  };
  const closeDocDelete = () => {
    setDocDeleteId(null);
    deleteDoc.reset();
  };

  const handleCreateKb = async (payload: KnowledgeBaseInput) => {
    try {
      const created = await createKb.mutateAsync(payload);
      setSelectedId(created._id);
      toast.success(`${created.name} was created.`);
      closeKbCreate();
    } catch {
      // Shown in the form via createKb.error; the dialog stays open.
    }
  };

  const handleUpdateKb = async (payload: KnowledgeBaseInput) => {
    if (!selected) return;
    try {
      const updated = await updateKb.mutateAsync({ id: selected._id, data: payload });
      toast.success(`${updated.name} was updated.`);
      closeKbEdit();
    } catch {
      // Shown in the form via updateKb.error; the dialog stays open.
    }
  };

  const handleDeleteKb = async () => {
    if (!selected) return;
    const name = selected.name;
    try {
      await deleteKb.mutateAsync(selected._id);
      setSelectedId(null);
      toast.success(`${name} was deleted.`);
      closeKbDelete();
    } catch {
      // Shown in the dialog via deleteKb.error; nothing was deleted.
    }
  };

  const handleCreateDoc = async (values: DocumentFormResult) => {
    if (!selected) return;
    try {
      const created = await createDoc.mutateAsync({ knowledgeBaseId: selected._id, ...values });
      toast.success(`${created.title} was added.`);
      closeDocCreate();
    } catch {
      // Shown in the form via createDoc.error; the dialog stays open with the user's text.
    }
  };

  const handleUpdateDoc = async (values: DocumentFormResult) => {
    if (!docEditTarget) return;
    try {
      const updated = await updateDoc.mutateAsync({ id: docEditTarget._id, data: values });
      toast.success(`${updated.title} was updated.`);
      closeDocEdit();
    } catch {
      // Shown in the form via updateDoc.error; the dialog stays open with the user's text.
    }
  };

  const handleDeleteDoc = async () => {
    if (!docDeleteTarget) return;
    const title = docDeleteTarget.title;
    try {
      await deleteDoc.mutateAsync(docDeleteTarget._id);
      toast.success(`${title} was deleted.`);
      closeDocDelete();
    } catch {
      // Shown in the dialog via deleteDoc.error; nothing was deleted.
    }
  };

  const handleSetStatus = async (doc: KnowledgeDocument, status: 'published' | 'draft') => {
    setBusyDocId(doc._id);
    try {
      await updateDoc.mutateAsync({ id: doc._id, data: { title: doc.title, status } });
      toast.success(status === 'published' ? `${doc.title} is now published.` : `${doc.title} was unpublished.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'The status could not be changed.'));
    } finally {
      setBusyDocId(null);
    }
  };

  const handleIndex = async (doc: KnowledgeDocument) => {
    setBusyDocId(doc._id);
    try {
      const result = await indexDoc.mutateAsync(doc._id);
      toast.success(`${doc.title} was indexed (${result.chunkCount} ${result.chunkCount === 1 ? 'piece' : 'pieces'}).`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'The document could not be indexed.'));
    } finally {
      setBusyDocId(null);
    }
  };

  const handleRemoveIndex = async (doc: KnowledgeDocument) => {
    setBusyDocId(doc._id);
    try {
      await removeIndex.mutateAsync(doc._id);
      toast.success(`The index for ${doc.title} was removed.`);
    } catch (error) {
      toast.error(getErrorMessage(error, 'The index could not be removed.'));
    } finally {
      setBusyDocId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Knowledge"
        description="What your AI agent knows about your business"
        icon={BookOpen}
        action={
          canCreate ? (
            <Button onClick={() => setKbCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
              Add knowledge base
            </Button>
          ) : undefined
        }
      />

      {!canRead ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Lock className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">Restricted access</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              You don’t have permission to view knowledge. Ask a workspace owner if you need access.
            </p>
          </CardContent>
        </Card>
      ) : kbQuery.isLoading ? (
        <div role="status" aria-label="Loading knowledge" className="space-y-3">
          {[0, 1].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : kbQuery.isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <div>
            <AlertTitle>{isForbiddenError(kbQuery.error) ? 'Access denied' : 'Couldn’t load knowledge'}</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(kbQuery.error, 'We couldn’t load your knowledge bases.')}</p>
              {!isForbiddenError(kbQuery.error) && (
                <Button variant="outline" size="sm" className="mt-3" onClick={() => void kbQuery.refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                  Try again
                </Button>
              )}
            </AlertDescription>
          </div>
        </Alert>
      ) : knowledgeBases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <BookOpen className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">No knowledge bases yet</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              Create a knowledge base, add documents with the answers your customers need, then attach it to your AI agent.
            </p>
            {canCreate && (
              <Button onClick={() => setKbCreateOpen(true)}>
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Create your first knowledge base
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
          <nav aria-label="Knowledge bases" className="space-y-2">
            <ul className="space-y-2">
              {knowledgeBases.map((kb) => (
                <li key={kb._id} className="list-none">
                  <button
                    type="button"
                    onClick={() => setSelectedId(kb._id)}
                    aria-current={kb._id === selected?._id ? 'true' : undefined}
                    className={`w-full rounded-xl border p-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      kb._id === selected?._id
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900'
                    }`}
                  >
                    <span className="block font-medium">{kb.name}</span>
                    <span className="block text-xs text-slate-500">{kb.status === 'archived' ? 'Archived' : 'Active'}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {selected && (
            <section aria-label={`${selected.name} documents`} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  {selected.description && <p className="text-sm text-slate-600 dark:text-slate-400">{selected.description}</p>}
                  {selected.status === 'archived' && (
                    <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">Archived: agents do not use this knowledge base.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {canCreate && (
                    <Button size="sm" onClick={() => setDocCreateOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                      Add document
                    </Button>
                  )}
                  {canUpdate && (
                    <Button size="sm" variant="outline" onClick={() => setKbEditOpen(true)}>
                      Edit knowledge base
                    </Button>
                  )}
                  {canDelete && (
                    <Button size="sm" variant="ghost" onClick={() => setKbDeleteOpen(true)}>
                      Delete knowledge base
                    </Button>
                  )}
                </div>
              </div>

              {docsQuery.isLoading ? (
                <div role="status" aria-label="Loading documents" className="space-y-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                  ))}
                </div>
              ) : docsQuery.isError ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" aria-hidden="true" />
                  <div>
                    <AlertTitle>Couldn’t load documents</AlertTitle>
                    <AlertDescription>
                      <p>{getErrorMessage(docsQuery.error, 'We couldn’t load the documents.')}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => void docsQuery.refetch()}>
                        <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
                        Try again
                      </Button>
                    </AlertDescription>
                  </div>
                </Alert>
              ) : documents.length === 0 ? (
                <Card>
                  <CardContent className="py-10 text-center">
                    <h3 className="font-semibold">No documents yet</h3>
                    <p className="mx-auto mt-1 max-w-md text-sm text-slate-600 dark:text-slate-400">
                      Add the text your agent should know. You can paste policies, prices, opening hours or common answers.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ul className="space-y-3" aria-label="Documents">
                  {documents.map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      document={doc}
                      canUpdate={canUpdate}
                      canDelete={canDelete}
                      busy={busyDocId === doc._id}
                      onEdit={(d) => setDocEditId(d._id)}
                      onDelete={(d) => setDocDeleteId(d._id)}
                      onSetStatus={(d, status) => void handleSetStatus(d, status)}
                      onIndex={(d) => void handleIndex(d)}
                      onRemoveIndex={(d) => void handleRemoveIndex(d)}
                    />
                  ))}
                </ul>
              )}

              <KnowledgeSearchPanel knowledgeBaseId={selected._id} />
            </section>
          )}
        </div>
      )}

      {canCreate && (
        <KnowledgeBaseForm
          open={kbCreateOpen}
          onOpenChange={(open) => (open ? setKbCreateOpen(true) : closeKbCreate())}
          onSubmit={handleCreateKb}
          isPending={createKb.isPending}
          errorMessage={createKb.error ? getErrorMessage(createKb.error) : null}
        />
      )}
      {canUpdate && (
        <KnowledgeBaseForm
          open={kbEditOpen}
          onOpenChange={(open) => (open ? setKbEditOpen(true) : closeKbEdit())}
          onSubmit={handleUpdateKb}
          initial={selected}
          isPending={updateKb.isPending}
          errorMessage={updateKb.error ? getErrorMessage(updateKb.error) : null}
        />
      )}
      {canDelete && (
        <ConfirmDialog
          open={kbDeleteOpen}
          onOpenChange={(open) => !open && closeKbDelete()}
          onConfirm={() => void handleDeleteKb()}
          title="Delete knowledge base"
          confirmLabel="Delete knowledge base"
          pendingLabel="Deleting…"
          isPending={deleteKb.isPending}
          errorMessage={deleteKb.error ? getErrorMessage(deleteKb.error) : null}
        >
          Delete <span className="font-semibold text-slate-950 dark:text-slate-50">{selected?.name}</span>? Its documents will no longer be available to your AI agents.
        </ConfirmDialog>
      )}

      {canCreate && selected && (
        <DocumentForm
          open={docCreateOpen}
          onOpenChange={(open) => (open ? setDocCreateOpen(true) : closeDocCreate())}
          onSubmit={handleCreateDoc}
          isPending={createDoc.isPending}
          errorMessage={createDoc.error ? getErrorMessage(createDoc.error) : null}
        />
      )}
      {canUpdate && (
        <DocumentForm
          open={!!docEditTarget}
          onOpenChange={(open) => !open && closeDocEdit()}
          onSubmit={handleUpdateDoc}
          initial={docEditTarget}
          isPending={updateDoc.isPending}
          errorMessage={updateDoc.error ? getErrorMessage(updateDoc.error) : null}
        />
      )}
      {canDelete && (
        <ConfirmDialog
          open={!!docDeleteTarget}
          onOpenChange={(open) => !open && closeDocDelete()}
          onConfirm={() => void handleDeleteDoc()}
          title="Delete document"
          confirmLabel="Delete document"
          pendingLabel="Deleting…"
          isPending={deleteDoc.isPending}
          errorMessage={deleteDoc.error ? getErrorMessage(deleteDoc.error) : null}
        >
          Delete <span className="font-semibold text-slate-950 dark:text-slate-50">{docDeleteTarget?.title}</span>? Your AI agent will stop using it.
        </ConfirmDialog>
      )}
    </div>
  );
}
