import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import { DOCUMENT_STATUS_LABELS, EDITABLE_DOCUMENT_STATUSES } from '../../features/knowledge/knowledgeUtils';
import type { DocumentStatus, KnowledgeDocument } from '../../features/knowledge/types';

export const CONTENT_MAX = 50000;

/** Mirrors validateKnowledgeDocumentInput: title 2-200, summary <= 2000, content <= 50000. */
export const documentSchema = z.object({
  title: z.string().trim().min(2, 'Title must be at least 2 characters').max(200, 'Title must be at most 200 characters'),
  summary: z.string().max(2000, 'Summary must be at most 2000 characters'),
  content: z.string().max(CONTENT_MAX, `Content must be at most ${CONTENT_MAX} characters`),
  status: z.enum(['draft', 'published', 'archived']),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;

export interface DocumentFormResult {
  title: string;
  summary: string;
  content: string;
  status: DocumentStatus;
}

interface DocumentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DocumentFormResult) => Promise<void>;
  initial?: KnowledgeDocument | null;
  isPending: boolean;
  errorMessage: string | null;
}

const fieldError = 'text-sm text-red-600 dark:text-red-400';

function asEditableStatus(status: KnowledgeDocument['status'] | undefined): DocumentStatus {
  return status === 'draft' || status === 'archived' ? status : 'published';
}

export function DocumentForm({ open, onOpenChange, onSubmit, initial, isPending, errorMessage }: DocumentFormProps) {
  const isEdit = !!initial;
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    // New documents default to "published": the AI agent only uses published documents.
    defaultValues: { title: '', summary: '', content: '', status: 'published' },
  });

  useEffect(() => {
    if (open) {
      setConfirmDiscard(false);
      reset({
        title: initial?.title ?? '',
        summary: initial?.summary ?? '',
        content: initial?.content ?? '',
        status: initial ? asEditableStatus(initial.status) : 'published',
      });
    }
  }, [open, initial, reset]);

  const busy = isSubmitting || isPending;
  const contentLength = watch('content').length;

  const requestClose = () => {
    if (busy) return;
    if (isDirty) setConfirmDiscard(true);
    else onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => (next ? onOpenChange(true) : requestClose())}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit document' : 'Add document'}</DialogTitle>
          <DialogDescription>
            Paste the text your AI agent should know, such as policies, prices or answers to common questions. File upload is not available yet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(async (values) => onSubmit({ ...values, title: values.title.trim() }))} className="mt-4 space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="doc-title">Title *</Label>
            <Input id="doc-title" {...register('title')} placeholder="Returns policy" aria-invalid={!!errors.title} />
            {errors.title && <p className={fieldError} role="alert">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-content">Content</Label>
            <textarea
              id="doc-content"
              rows={10}
              {...register('content')}
              placeholder="Customers can return items within 30 days with a receipt…"
              className="flex w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <p className="text-xs text-slate-500">{contentLength.toLocaleString()} / {CONTENT_MAX.toLocaleString()} characters</p>
            {errors.content && <p className={fieldError} role="alert">{errors.content.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-summary">Short summary (optional)</Label>
            <Input id="doc-summary" {...register('summary')} placeholder="One line about what this covers" />
            {errors.summary && <p className={fieldError} role="alert">{errors.summary.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="doc-status">Status</Label>
            <select
              id="doc-status"
              {...register('status')}
              aria-describedby="doc-status-help"
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {EDITABLE_DOCUMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {DOCUMENT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
            <p id="doc-status-help" className="text-xs text-slate-500">
              Only published documents are used when your AI agent answers customers.
            </p>
          </div>

          {errorMessage && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2">
              {errorMessage}
            </p>
          )}

          {confirmDiscard && (
            <div role="alertdialog" aria-label="Discard changes?" className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-700 dark:bg-amber-900/20">
              <p className="font-medium">Discard your changes?</p>
              <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setConfirmDiscard(false)}>
                  Keep editing
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => onOpenChange(false)}>
                  Discard
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={requestClose} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
              {isEdit ? 'Save changes' : 'Add document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}