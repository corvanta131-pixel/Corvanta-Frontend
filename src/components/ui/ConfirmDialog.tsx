import type { ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from './Dialog';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  errorMessage: string | null;
}

/** Generic destructive-action confirmation. Nothing happens until `onConfirm` is clicked. */
export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  children,
  confirmLabel,
  pendingLabel,
  isPending,
  errorMessage,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !isPending && onOpenChange(next)}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <div>
              <DialogTitle className="text-left">{title}</DialogTitle>
              <DialogDescription className="text-left">Please confirm this action.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">{children}</div>
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
            {isPending ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
