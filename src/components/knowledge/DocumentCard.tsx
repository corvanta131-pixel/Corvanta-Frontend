import { AlertTriangle, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import {
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_STATUS_STYLES,
  INDEXING_LABELS,
  documentNotes,
  preview,
} from '../../features/knowledge/knowledgeUtils';
import type { KnowledgeDocument } from '../../features/knowledge/types';
import { formatDate } from '../../features/users/employeeUtils';

interface DocumentCardProps {
  document: KnowledgeDocument;
  canUpdate: boolean;
  canDelete: boolean;
  busy: boolean;
  onEdit: (doc: KnowledgeDocument) => void;
  onDelete: (doc: KnowledgeDocument) => void;
  onSetStatus: (doc: KnowledgeDocument, status: 'published' | 'draft') => void;
  onIndex: (doc: KnowledgeDocument) => void;
  onRemoveIndex: (doc: KnowledgeDocument) => void;
}

export function DocumentCard({ document: doc, canUpdate, canDelete, busy, onEdit, onDelete, onSetStatus, onIndex, onRemoveIndex }: DocumentCardProps) {
  const notes = documentNotes(doc);
  const indexed = doc.indexingState === 'indexed';
  const lastIndexed = formatDate(doc.lastIndexedAt);

  return (
    <li className="list-none rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-semibold">{doc.title}</h4>
          {(doc.content || doc.summary) && (
            <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">{preview(doc.summary || doc.content)}</p>
          )}
        </div>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${DOCUMENT_STATUS_STYLES[doc.status]}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {DOCUMENT_STATUS_LABELS[doc.status]}
        </span>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        {INDEXING_LABELS[doc.indexingState]}
        {indexed ? ` · ${doc.chunkCount} ${doc.chunkCount === 1 ? 'piece' : 'pieces'}` : ''}
        {indexed && lastIndexed ? ` · ${lastIndexed}` : ''}
      </p>

      {notes.length > 0 && (
        <ul className="mt-2 space-y-1" aria-label={`Notes about ${doc.title}`}>
          {notes.map((note) => (
            <li key={note} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-400">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
              {note}
            </li>
          ))}
        </ul>
      )}

      {(canUpdate || canDelete) && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {canUpdate && doc.status !== 'published' && doc.status !== 'archived' && (
            <Button size="sm" disabled={busy} onClick={() => onSetStatus(doc, 'published')} aria-label={`Publish ${doc.title}`}>
              Publish
            </Button>
          )}
          {canUpdate && doc.status === 'published' && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => onSetStatus(doc, 'draft')} aria-label={`Unpublish ${doc.title}`}>
              Unpublish
            </Button>
          )}
          {canUpdate && (
            <Button size="sm" variant="outline" disabled={busy || doc.indexingState === 'indexing'} onClick={() => onIndex(doc)} aria-label={`${indexed ? 'Re-index' : 'Index'} ${doc.title}`}>
              {indexed ? 'Re-index' : 'Index'}
            </Button>
          )}
          {canUpdate && indexed && (
            <Button size="sm" variant="ghost" disabled={busy} onClick={() => onRemoveIndex(doc)} aria-label={`Remove index for ${doc.title}`}>
              Remove index
            </Button>
          )}
          {canUpdate && (
            <Button size="sm" variant="outline" onClick={() => onEdit(doc)} aria-label={`Edit ${doc.title}`}>
              Edit
            </Button>
          )}
          {canDelete && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(doc)} aria-label={`Delete ${doc.title}`}>
              Delete
            </Button>
          )}
        </div>
      )}
    </li>
  );
}