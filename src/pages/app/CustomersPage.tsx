import { useMemo, useState } from 'react';
import { AlertCircle, Lock, RefreshCw, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { CustomerFilters } from '../../components/customers/CustomerFilters';
import { CustomerTable } from '../../components/customers/CustomerTable';
import { CustomerCard } from '../../components/customers/CustomerCard';
import { CustomerDetail } from '../../components/customers/CustomerDetail';
import { CustomerForm } from '../../components/customers/CustomerForm';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage, isForbiddenError } from '../../utils/apiError';
import {
  useCustomerList,
  useCreateCustomer,
  useUpdateCustomer,
  useDeleteCustomer,
} from '../../features/customers/hooks';
import { filterCustomers, type CustomerFilterState } from '../../features/customers/customerUtils';
import type { CreateCustomerRequest, Customer } from '../../features/customers/types';

const EMPTY_FILTERS: CustomerFilterState = { search: '', status: '' };

export function CustomersPage() {
  const user = useAppSelector((state) => state.auth.user);
  const canRead = can('customers:read', user);
  const canCreate = can('customers:create', user);
  const canUpdate = can('customers:update', user);
  const canDelete = can('customers:delete', user);

  // No request at all without customers:read.
  const { data, isLoading, isError, error, refetch, isFetching } = useCustomerList(canRead);
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deleteMutation = useDeleteCustomer();

  const [filters, setFilters] = useState<CustomerFilterState>(EMPTY_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const customers = useMemo(() => data ?? [], [data]);
  const visible = useMemo(() => filterCustomers(customers, filters), [customers, filters]);
  const byId = (id: string | null): Customer | null => customers.find((c) => c._id === id) ?? null;
  const detailTarget = byId(detailId);
  const editTarget = byId(editId);
  const deleteTarget = byId(deleteId);
  const filtersActive = filters.search.trim() !== '' || filters.status !== '';

  const closeCreate = () => {
    setCreateOpen(false);
    createMutation.reset();
  };
  const closeEdit = () => {
    setEditId(null);
    updateMutation.reset();
  };
  const closeDelete = () => {
    setDeleteId(null);
    deleteMutation.reset();
  };
  const openEdit = (c: Customer) => {
    setDetailId(null);
    setEditId(c._id);
  };
  const openDelete = (c: Customer) => {
    setDetailId(null);
    setDeleteId(c._id);
  };

  const handleCreate = async (payload: CreateCustomerRequest) => {
    try {
      const created = await createMutation.mutateAsync(payload);
      toast.success(`${created.name} was added.`);
      closeCreate();
    } catch {
      // Shown in the form via createMutation.error; the dialog stays open.
    }
  };

  const handleUpdate = async (payload: CreateCustomerRequest) => {
    if (!editTarget) return;
    try {
      const updated = await updateMutation.mutateAsync({ id: editTarget._id, data: payload });
      toast.success(`${updated.name} was updated.`);
      closeEdit();
    } catch {
      // Shown in the form via updateMutation.error; the dialog stays open.
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`${name} was removed.`);
      closeDelete();
    } catch {
      // Shown in the dialog via deleteMutation.error; nothing was removed.
    }
  };

  const description =
    canRead && data
      ? `${customers.length} ${customers.length === 1 ? 'customer' : 'customers'}${
          filtersActive ? ` · showing ${visible.length}` : ''
        }`
      : 'Manage your customers and their information';

  return (
    <div className="space-y-6">
      <PageTitle
        title="Customers"
        description={description}
        icon={Users}
        action={
          canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add customer
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
              You don’t have permission to view customers. Ask a workspace owner if you need access.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div role="status" aria-label="Loading customers" className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <div>
            <AlertTitle>{isForbiddenError(error) ? 'Access denied' : 'Couldn’t load customers'}</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(error, 'We couldn’t load customers.')}</p>
              {!isForbiddenError(error) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                >
                  <RefreshCw className="h-4 w-4 mr-2" aria-hidden="true" />
                  Try again
                </Button>
              )}
            </AlertDescription>
          </div>
        </Alert>
      ) : customers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">No customers yet</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              Customers you add will appear here.
            </p>
            {canCreate && (
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Add your first customer
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <CustomerFilters filters={filters} onChange={setFilters} />
          {visible.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <h2 className="text-lg font-semibold">No matching customers</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Nothing matches your search or filters.</p>
                <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="hidden md:block">
                <CustomerTable
                  customers={visible}
                  canUpdate={canUpdate}
                  canDelete={canDelete}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onDetail={(c) => setDetailId(c._id)}
                />
              </div>
              <ul className="space-y-3 md:hidden" aria-label="Customers">
                {visible.map((c) => (
                  <CustomerCard
                    key={c._id}
                    customer={c}
                    canUpdate={canUpdate}
                    canDelete={canDelete}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    onDetail={(cust) => setDetailId(cust._id)}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {canCreate && (
        <CustomerForm
          open={createOpen}
          onOpenChange={(open) => (open ? setCreateOpen(true) : closeCreate())}
          onSubmit={handleCreate}
          isPending={createMutation.isPending}
          errorMessage={createMutation.error ? getErrorMessage(createMutation.error) : null}
        />
      )}

      {canUpdate && (
        <CustomerForm
          open={!!editTarget}
          onOpenChange={(open) => !open && closeEdit()}
          onSubmit={handleUpdate}
          initial={editTarget}
          isPending={updateMutation.isPending}
          errorMessage={updateMutation.error ? getErrorMessage(updateMutation.error) : null}
        />
      )}

      <CustomerDetail
        open={!!detailTarget}
        onOpenChange={(open) => !open && setDetailId(null)}
        customer={detailTarget}
        canUpdate={canUpdate}
        canDelete={canDelete}
        canReadIdentities={can('customer-identities:read', user)}
        canCreateIdentities={can('customer-identities:create', user)}
        canDeleteIdentities={can('customer-identities:delete', user)}
        canReadConversations={can('conversations:read', user)}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {canDelete && (
        <ConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && closeDelete()}
          onConfirm={() => void handleDelete()}
          title="Remove customer"
          confirmLabel="Remove customer"
          pendingLabel="Removing…"
          isPending={deleteMutation.isPending}
          errorMessage={deleteMutation.error ? getErrorMessage(deleteMutation.error) : null}
        >
          Remove <span className="font-semibold text-slate-950 dark:text-slate-50">{deleteTarget?.name}</span> from
          your customers? The record is retained by the system rather than permanently erased, but it will no longer
          appear in this list.
        </ConfirmDialog>
      )}
    </div>
  );
}
