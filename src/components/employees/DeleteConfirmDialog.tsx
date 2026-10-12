import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import { Button } from '../ui/Button';

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  employeeName: string;
  isPending: boolean;
  errorMessage: string | null;
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  employeeName,
  isPending,
  errorMessage,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-left">Remove employee</DialogTitle>
              <DialogDescription className="text-left">Please confirm this action.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          Remove <span className="font-semibold text-slate-950 dark:text-slate-50">{employeeName}</span> from your
          team? Their account will be disabled and they will lose access to the workspace. The record is retained by
          the system rather than permanently erased.
        </p>

        {errorMessage && (
          <p
            className="mt-3 text-sm text-red-600 dark:text-red-400 rounded-md bg-red-50 dark:bg-red-900/20 px-3 py-2"
            role="alert"
          >
            {errorMessage}
          </p>
        )}

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isPending}>
            {isPending ? 'Removing…' : 'Remove employee'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { DeleteConfirmDialogProps };
