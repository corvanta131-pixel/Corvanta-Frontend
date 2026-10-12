import type { Employee, EmployeeStatus } from './types';

export const STATUS_LABELS: Record<EmployeeStatus, string> = {
  active: 'Active',
  invited: 'Invited',
  disabled: 'Disabled',
};

export const STATUS_STYLES: Record<EmployeeStatus, string> = {
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  invited: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  disabled: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400',
};

export function getInitials(name: string): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
  return letters || '?';
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Role name only when the API populated the role object; never guesses from an id. */
export function getRoleName(employee: Employee): string | null {
  const role = employee.roleId;
  if (role && typeof role === 'object') return role.name;
  return null;
}

export function getManagerName(employee: Employee, all: Employee[]): string | null {
  if (!employee.managerId) return null;
  return all.find((e) => e._id === employee.managerId)?.name ?? null;
}

export function getDepartments(employees: Employee[]): string[] {
  return Array.from(new Set(employees.map((e) => e.department.trim()).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}

export interface EmployeeFilterState {
  search: string;
  status: '' | EmployeeStatus;
  department: string;
}

export function filterEmployees(employees: Employee[], filters: EmployeeFilterState): Employee[] {
  const q = filters.search.trim().toLowerCase();
  return employees.filter((e) => {
    if (filters.status && e.status !== filters.status) return false;
    if (filters.department && e.department !== filters.department) return false;
    if (!q) return true;
    return [e.name, e.email, e.department, e.title].some((v) => v.toLowerCase().includes(q));
  });
}
