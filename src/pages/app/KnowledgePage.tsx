import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../../components/ui/Dialog';
import { Loader2 } from 'lucide-react';
import {
  useKnowledgeBases,
  useCreateKnowledgeBase,
  useUpdateKnowledgeBase,
  useDeleteKnowledgeBase,
  useKnowledgeDocuments,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useIndexDocument,
  useRemoveDocumentIndex,
} from '../../features/knowledge/hooks';
import { KnowledgeBaseForm } from '../../components/knowledge/KnowledgeBaseForm';
import { DocumentForm } from '../../components/knowledge/DocumentForm';
import { DocumentCard } from '../../components/knowledge/DocumentCard';
import { KnowledgeSearchPanel } from '../../components/knowledge/KnowledgeSearchPanel';
import type { KnowledgeBase, KnowledgeDocument, SearchMode } from '../../features/knowledge/types';

export function KnowledgePage() {
  const {
    data: knowledgeBases = [],
    isLoading: isFetchingBases,
    refetch: refetchBases,
  } = useKnowledgeBases();

  const [selectedKbId, setSelectedKbId] = useState<string | null>(null);
  const [selectedKb, setSelectedKb] = useState<KnowledgeBase | null>(null);
  const [openKbForm, setOpenKbForm] = useState(false);
  const [openDocForm, setOpenDocForm] = useState(false);
  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null);
  const [editingDoc, setEditingDoc] = useState<KnowledgeDocument | null>(null);

  const {
    data: documents = [],
    isLoading: isFetchingDocs,
  } = useKnowledgeDocuments(selectedKbId ?? '');

  const {
    mutate: createKnowledgeBase,
    isPending: isCreatingKb,
  } = useCreateKnowledgeBase();

  const {
    mutate: updateKnowledgeBase,
    isPending: isUpdatingKb,
  } = useUpdateKnowledgeBase();

  const {
    mutate: deleteKnowledgeBase,
    isPending: isDeletingKb,
  } = useDeleteKnowledgeBase();

  const {
    mutate: createDocument,
    isPending: isCreatingDoc,
  } = useCreateDocument(selectedKbId!);

  const {
    mutate: updateDocument,
    isPending: isUpdatingDoc,
  } = useUpdateDocument(selectedKbId!);

  const {
    mutate: deleteDocument,
    isPending: isDeletingDoc,
  } = useDeleteDocument(selectedKbId!);

  const {
    mutate: indexDocument,
    isPending: isIndexing,
  } = useIndexDocument(selectedKbId!);

  const {
    mutate: removeDocumentIndex,
    isPending: isRemovingIndex,
  } = useRemoveDocumentIndex(selectedKbId!);

  const handleCreateKb = () => {
    setEditingKb(null);
    setOpenKbForm(true);
  };

  const handleEditKb = (kb: KnowledgeBase) => {
    setEditingKb(kb);
    setOpenKbForm(true);
  };

  const handleDeleteKb = async (id: string) => {
    await deleteKnowledgeBase({ id });
    // Refetch knowledge bases after deletion
    refetchBases();
    // If we deleted the selected KB, clear selection
    if (selectedKbId === id) {
      setSelectedKbId(null);
      setSelectedKb(null);
    }
  };

  const handleSubmitKb = async (data: Omit<KnowledgeBaseInput, 'status'> & { status: KnowledgeBase['status'] }) => {
    if (editingKb) {
      await updateKnowledgeBase({ id: editingKb._id, ...data });
    } else {
      await createKnowledgeBase(data);
    }
    setOpenKbForm(false);
    // Refetch knowledge bases after creation/update
    refetchBases();
  };

  const handleSubmitDoc = async (data: Omit<CreateDocumentInput, 'knowledgeBaseId'> & { knowledgeBaseId: string }) => {
    if (editingDoc) {
      await updateDocument({ id: editingDoc._id, ...data });
    } else {
      await createDocument({ knowledgeBaseId: selectedKbId!, ...data });
    }
    setOpenDocForm(false);
    // Refresh documents after creation/update
    if (selectedKbId) {
      // This would trigger a refetch via the useKnowledgeDocuments hook
    }
  };

  const handleDeleteDoc = async (id: string) => {
    await deleteDocument({ id });
    // Refresh documents after deletion
    if (selectedKbId) {
      // This would trigger a refetch via the useKnowledgeDocuments hook
    }
  };

  const handleIndexDoc = async (id: string) => {
    await indexDocument({ id });
  };

  const handleRemoveIndex = async (id: string) => {
    await removeDocumentIndex({ id });
  };

   const handleSetStatus = async (doc: KnowledgeDocument, status: 'published' | 'draft') => {
     await updateDocument({ id: doc._id, status });
   };

  if (isFetchingBases) {
    return (
      <div className="space-y-6">
        <PageTitle
          title="Knowledge"
          description="Manage knowledge bases and business documents"
          icon={BookOpen}
        />
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-slate-500 animate-spin" />
          <p className="text-slate-500">Loading knowledge bases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Knowledge"
        description="Manage knowledge bases and business documents"
        icon={BookOpen}
      />

      {/* Knowledge Bases List Section */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
          Knowledge Bases
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateKb}
            disabled={isCreatingKb}
          >
            {isCreatingKb ? (
              <>
                <Loader2 className="h-4 w-4 mr-2" />
                Creating...
              </>
            ) : (
              'Add Knowledge Base'
            )}
          </Button>
        </h2>

        {knowledgeBases.length === 0 ? (
          <p className="text-sm text-slate-500">No knowledge bases found. Create your first knowledge base above.</p>
        ) : (
          <div className="space-y-3">
            {knowledgeBases.map((kb) => (
              <div
                key={kb._id}
                className={`flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors ${selectedKbId === kb._id ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{kb.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{kb.description || 'No description'}</p>
                  <div className="mt-2 flex items-center gap-2 text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${kb.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-200 text-slate-800'}`}
                    >
                      {kb.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedKbId(kb._id);
                        setSelectedKb(kb);
                      }}
                      className="hover:text-blue-600"
                    >
                      Select
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditKb(kb)}
                    disabled={isUpdatingKb}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteKb(kb._id)}
                    disabled={isDeletingKb}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Knowledge Base Details */}
      {selectedKb && (
        <div className="mb-6">
          <h2 classNamebled={isUpdatingKb}
            >
              Edit KB
            </Button>
          </h2>

          {/* Documents Section */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center justify-between">
              Documents
              <Button
                variant="outline"
                size="sm"
                onClick={handleCreateDoc}
                disabled={!selectedKbId || isCreatingDoc}
              >
                {isCreatingDoc ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2" />
                    Adding...
                  </>
                ) : (
                  'Add Document'
                )}
              </Button>
            </h3>

            {isFetchingDocs ? (
              <div className="text-center py-8">
                <Loader2 className="h-6 w-6 mx-auto mb-2 text-slate-500 animate-spin" />
                <p className="text-slate-500">Loading documents...</p>
              </div>
            ) : documents.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No documents in this knowledge base. Add your first document above.</p>
            ) : (
              <ul className="space-y-3">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    canUpdate={!!selectedKbId && (doc.status === 'draft' || doc.status === 'archived')}
                    canDelete={!!selectedKbId && doc.status !== 'published'}
                    busy={isUpdatingDoc || isDeletingDoc || isIndexing || isRemovingIndex}
                    onEdit={() => {
                      setEditingDoc(doc);
                      setOpenDocForm(true);
                    }}
                    onDelete={() => handleDeleteDoc(doc._id)}
                    onSetStatus={(status) => handleSetStatus(doc, status)}
                    onIndex={() => handleIndexDoc(doc._id)}
                    onRemoveIndex={() => handleRemoveIndex(doc._id)}
                  />
                ))}
              </ul>
            )}
          </div>

          {/* Search Panel */}
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Test Your Assistant</h3>
            <KnowledgeSearchPanel
              knowledgeBaseId={selectedKbId!}
              // The KnowledgeSearchPanel handles its own search internally
              // We don't need to pass handlers since it uses the hook directly
            />
          </div>
        </div>
      )}

      {/* Knowledge Base Form Modal */}
      <KnowledgeBaseForm
        open={openKbForm}
        onOpenChange={setOpenKbForm}
        onSubmit={handleSubmitKb}
        initial={editingKb}
        isPending={isCreatingKb || isUpdatingKb}
        errorMessage={null}
      />

      {/* Document Form Modal */}
      <DocumentForm
        open={openDocForm}
        onOpenChange={setOpenDocForm}
        onSubmit={handleSubmitDoc}
        initial={editingDoc}
        isPending={isCreatingDoc || isUpdatingDoc}
        errorMessage={null}
      />
    </div>
  );
}