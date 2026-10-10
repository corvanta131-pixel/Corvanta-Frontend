import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '../ui/Dialog';
import { Button } from '../ui/Button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  employeeName: string;
  isPending: boolean;
  error: Error | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  employeeName,
  isPending,
  error,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-left">Delete employee</DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-slate-950 dark:text-slate-50">{employeeName}</span>?
          Their account will be deactivated and they will lose access to the Corvanta workspace.
        </p>

        {error && (
          <p
            className="text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2"
            role="alert"
          >
            {error.message}
          </p>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? 'Deleting...' : 'Delete employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { DeleteConfirmDialogProps };