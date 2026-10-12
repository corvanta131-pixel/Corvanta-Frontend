import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
        aria-hidden="true"
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[calc(100%-2rem)] max-w-lg max-h-[85vh] overflow-y-auto">
        {React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement, { onOpenChange })
        )}
      </div>
    </div>
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  onOpenChange?: (open: boolean) => void;
}

const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, onOpenChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative rounded-lg border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-950',
        className
      )}
      {...props}
    >
      <button
        type="button"
        onClick={() => onOpenChange?.(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        <X className="h-4 w-4" />
      </button>
      {children}
    </div>
  )
);
DialogContent.displayName = 'DialogContent';

const DialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
);
DialogHeader.displayName = 'DialogHeader';

const DialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)} {...props} />
);
DialogFooter.displayName = 'DialogFooter';

const DialogTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props} />
);
DialogTitle.displayName = 'DialogTitle';

const DialogDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-slate-500 dark:text-slate-400', className)} {...props} />
);
DialogDescription.displayName = 'DialogDescription';

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};