import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import type { KnowledgeBase, KnowledgeBaseInput } from '../../features/knowledge/types';

/** Mirrors validateKnowledgeBaseInput: name 2-120, description <= 2000. */
export const knowledgeBaseSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(120, 'Name must be at most 120 characters'),
  description: z.string().max(2000, 'Description must be at most 2000 characters'),
  status: z.enum(['active', 'archived']),
});

export type KnowledgeBaseFormValues = z.infer<typeof knowledgeBaseSchema>;

interface KnowledgeBaseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: KnowledgeBaseInput) => Promise<void>;
  initial?: KnowledgeBase | null;
  isPending: boolean;
  errorMessage: string | null;
}

export function KnowledgeBaseForm({ open, onOpenChange, onSubmit, initial, isPending, errorMessage }: KnowledgeBaseFormProps) {
  const isEdit = !!initial;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<KnowledgeBaseFormValues>({
    resolver: zodResolver(knowledgeBaseSchema),
    defaultValues: { name: '', description: '', status: 'active' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: initial?.name ?? '', description: initial?.description ?? '', status: initial?.status ?? 'active' });
    }
  }, [open, initial, reset]);

  const busy = isSubmitting || isPending;

  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit knowledge base' : 'Add knowledge base'}</DialogTitle>
          <DialogDescription>A knowledge base is a collection of documents your AI agent can use to answer questions.</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (values) => onSubmit({ name: values.name, description: values.description.trim(), status: values.status }))}
          className="mt-4 space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="kb-name">Name *</Label>
            <Input id="kb-name" {...register('name')} placeholder="Product FAQ" aria-invalid={!!errors.name} />
            {errors.name && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="kb-description">Description</Label>
            <Input id="kb-description" {...register('description')} placeholder="What this collection covers" />
            {errors.description && <p className="text-sm text-red-600 dark:text-red-400" role="alert">{errors.description.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="kb-status">Status</Label>
            <select
              id="kb-status"
              {...register('status')}
              className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <option value="active">Active</option>
              <option value="archived">Archived (agents stop using it)</option>
            </select>
          </div>
          {errorMessage && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2">
              {errorMessage}
            </p>
          )}
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />}
              {isEdit ? 'Save changes' : 'Create knowledge base'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}