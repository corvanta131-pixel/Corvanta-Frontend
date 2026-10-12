import { Mail, Phone, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '../ui/Dialog';
import { CustomerStatusBadge } from './CustomerStatusBadge';
import { CustomerIdentities } from './CustomerIdentities';
import { CustomerConversations } from './CustomerConversations';
import { formatDate, getInitials } from '../../features/users/employeeUtils';
import type { Customer } from '../../features/customers/types';

interface CustomerDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: Customer | null;
  canUpdate: boolean;
  canDelete: boolean;
  canReadIdentities: boolean;
  canCreateIdentities: boolean;
  canDeleteIdentities: boolean;
  canReadConversations: boolean;
  onEdit: (c: Customer) => void;
  onDelete: (c: Customer) => void;
}

export function CustomerDetail({
  open,
  onOpenChange,
  customer,
  canUpdate,
  canDelete,
  canReadIdentities,
  canCreateIdentities,
  canDeleteIdentities,
  canReadConversations,
  onEdit,
  onDelete,
}: CustomerDetailProps) {
  if (!customer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-full bg-violet-500 flex items-center justify-center text-white text-xl font-semibold"
              aria-hidden="true"
            >
              {getInitials(customer.name)}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-left">{customer.name}</DialogTitle>
              <DialogDescription className="text-left">Customer details</DialogDescription>
            </div>
            <CustomerStatusBadge status={customer.status} />
          </div>
        </DialogHeader>

        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="h-4 w-4 mt-0.5 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="sr-only">Email</dt>
              <dd>{customer.email || 'No email on file'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Phone className="h-4 w-4 mt-0.5 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="sr-only">Phone</dt>
              <dd>{customer.phone || 'No phone on file'}</dd>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 mt-0.5 text-slate-400" aria-hidden="true" />
            <div>
              <dt className="sr-only">Added</dt>
              <dd>Added {formatDate(customer.createdAt) || 'Unknown'}</dd>
            </div>
          </div>
          {customer.notes && (
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-slate-500">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap break-words">{customer.notes}</dd>
            </div>
          )}
        </dl>

        {(canReadIdentities || canReadConversations) && (
          <div className="mt-6 space-y-6">
            {canReadIdentities && (
              <CustomerIdentities
                customerId={customer._id}
                canCreate={canCreateIdentities}
                canDelete={canDeleteIdentities}
              />
            )}
            {canReadConversations && <CustomerConversations customerId={customer._id} />}
          </div>
        )}

        <DialogFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {canUpdate && <Button variant="outline" onClick={() => onEdit(customer)}>Edit</Button>}
          {canDelete && <Button variant="destructive" onClick={() => onDelete(customer)}>Delete</Button>}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
