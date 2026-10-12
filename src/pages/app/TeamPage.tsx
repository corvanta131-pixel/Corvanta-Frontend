import { useMemo, useState } from 'react';
import { AlertCircle, Lock, RefreshCw, UserPlus, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageTitle } from '../../components/ui/PageTitle';
import { Button } from '../../components/ui/Button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/Alert';
import { Card, CardContent } from '../../components/ui/Card';
import { EmployeeFilters } from '../../components/employees/EmployeeFilters';
import { EmployeeTable } from '../../components/employees/EmployeeTable';
import { EmployeeCard } from '../../components/employees/EmployeeCard';
import { EmployeeDetail } from '../../components/employees/EmployeeDetail';
import { EmployeeForm } from '../../components/employees/EmployeeForm';
import { DeleteConfirmDialog } from '../../components/employees/DeleteConfirmDialog';
import { useAppSelector } from '../../hooks';
import { can } from '../../utils/permissions';
import { getErrorMessage, isForbiddenError } from '../../utils/apiError';
import {
  useEmployees,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
} from '../../features/users/hooks';
import {
  filterEmployees,
  getDepartments,
  getManagerName,
  type EmployeeFilterState,
} from '../../features/users/employeeUtils';
import type { Employee } from '../../features/users/types';

const EMPTY_FILTERS: EmployeeFilterState = { search: '', status: '', department: '' };

export function TeamPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const canRead = can('employees:read', currentUser);
  const canCreate = can('employees:create', currentUser);
  const canUpdate = can('employees:update', currentUser);
  const canDelete = can('employees:delete', currentUser);

  // Do not call the API at all when the user lacks read permission.
  const { data, isLoading, isError, error, refetch, isFetching } = useEmployees(canRead);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const [filters, setFilters] = useState<EmployeeFilterState>(EMPTY_FILTERS);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const employees = useMemo(() => data ?? [], [data]);
  const departments = useMemo(() => getDepartments(employees), [employees]);
  const visible = useMemo(() => filterEmployees(employees, filters), [employees, filters]);

  // Dialog targets are looked up by id so they always show fresh cache data.
  const byId = (id: string | null): Employee | null => employees.find((e) => e._id === id) ?? null;
  const detailTarget = byId(detailId);
  const editTarget = byId(editId);
  const deleteTarget = byId(deleteId);

  const canDeleteEmployee = (e: Employee) => canDelete && e._id !== currentUser?._id;
  const managerOf = (e: Employee) => getManagerName(e, employees);
  const filtersActive = filters.search.trim() !== '' || filters.status !== '' || filters.department !== '';

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

  const handleCreate = async (payload: Parameters<typeof createMutation.mutateAsync>[0]) => {
    try {
      const created = await createMutation.mutateAsync(payload);
      toast.success(`${created.name} was added to your team.`);
      closeCreate();
    } catch {
      // The failure is shown inside the form via createMutation.error; the dialog stays open.
    }
  };

  const handleUpdate = async (payload: Parameters<typeof createMutation.mutateAsync>[0]) => {
    if (!editTarget) return;
    try {
      const updated = await updateMutation.mutateAsync({ id: editTarget._id, data: payload });
      toast.success(`${updated.name} was updated.`);
      closeEdit();
    } catch {
      // The failure is shown inside the form via updateMutation.error; the dialog stays open.
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    try {
      await deleteMutation.mutateAsync(deleteTarget._id);
      toast.success(`${name} was removed from your team.`);
      setDetailId(null);
      closeDelete();
    } catch {
      // The failure is shown inside the dialog via deleteMutation.error; nothing was removed.
    }
  };

  const openEdit = (e: Employee) => {
    setDetailId(null);
    setEditId(e._id);
  };
  const openDelete = (e: Employee) => {
    setDetailId(null);
    setDeleteId(e._id);
  };

  const description = canRead && data
    ? `${employees.length} team ${employees.length === 1 ? 'member' : 'members'}${
        filtersActive ? ` · showing ${visible.length}` : ''
      }`
    : 'Manage the people in your workspace';

  return (
    <div className="space-y-6">
      <PageTitle
        title="Team"
        description={description}
        icon={Users}
        action={
          canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
              Add employee
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
              You don’t have permission to view team members. Ask a workspace owner if you need access.
            </p>
          </CardContent>
        </Card>
      ) : isLoading ? (
        <div role="status" aria-label="Loading team members" className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
          ))}
        </div>
      ) : isError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          <div>
            <AlertTitle>{isForbiddenError(error) ? 'Access denied' : 'Couldn’t load your team'}</AlertTitle>
            <AlertDescription>
              <p>{getErrorMessage(error, 'We couldn’t load team members.')}</p>
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
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <Users className="h-8 w-8 text-slate-400" aria-hidden="true" />
            <h2 className="text-lg font-semibold">No employees yet</h2>
            <p className="max-w-md text-sm text-slate-600 dark:text-slate-400">
              Team members you add will appear here.
            </p>
            {canCreate && (
              <Button onClick={() => setCreateOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" aria-hidden="true" />
                Add your first employee
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <EmployeeFilters filters={filters} onChange={setFilters} departments={departments} />

          {visible.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                <h2 className="text-lg font-semibold">No matching employees</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Nothing matches your search or filters.
                </p>
                <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="hidden md:block">
                <EmployeeTable
                  employees={visible}
                  canUpdate={canUpdate}
                  canDeleteEmployee={canDeleteEmployee}
                  onEdit={openEdit}
                  onDelete={openDelete}
                  onDetail={(e) => setDetailId(e._id)}
                />
              </div>
              <ul className="space-y-3 md:hidden" aria-label="Team members">
                {visible.map((e) => (
                  <EmployeeCard
                    key={e._id}
                    employee={e}
                    managerName={managerOf(e)}
                    canUpdate={canUpdate}
                    canDelete={canDeleteEmployee(e)}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    onDetail={(emp) => setDetailId(emp._id)}
                  />
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {canCreate && (
        <EmployeeForm
          open={createOpen}
          onOpenChange={(open) => (open ? setCreateOpen(true) : closeCreate())}
          onSubmit={handleCreate}
          managers={employees}
          isPending={createMutation.isPending}
          errorMessage={createMutation.error ? getErrorMessage(createMutation.error) : null}
        />
      )}

      {canUpdate && (
        <EmployeeForm
          open={!!editTarget}
          onOpenChange={(open) => !open && closeEdit()}
          onSubmit={handleUpdate}
          initial={editTarget}
          managers={employees.filter((e) => e._id !== editTarget?._id)}
          isPending={updateMutation.isPending}
          errorMessage={updateMutation.error ? getErrorMessage(updateMutation.error) : null}
        />
      )}

      <EmployeeDetail
        open={!!detailTarget}
        onOpenChange={(open) => !open && setDetailId(null)}
        employee={detailTarget}
        managerName={detailTarget ? managerOf(detailTarget) : null}
        canUpdate={canUpdate}
        canDelete={!!detailTarget && canDeleteEmployee(detailTarget)}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {canDelete && (
        <DeleteConfirmDialog
          open={!!deleteTarget}
          onOpenChange={(open) => !open && closeDelete()}
          onConfirm={() => void handleDelete()}
          employeeName={deleteTarget?.name ?? ''}
          isPending={deleteMutation.isPending}
          errorMessage={deleteMutation.error ? getErrorMessage(deleteMutation.error) : null}
        />
      )}
    </div>
  );
}
