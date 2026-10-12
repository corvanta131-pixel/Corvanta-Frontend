import { Search } from 'lucide-react';
import { Input } from '../ui/Input';
import type { EmployeeFilterState } from '../../features/users/employeeUtils';
import type { EmployeeStatus } from '../../features/users/types';

interface EmployeeFiltersProps {
  filters: EmployeeFilterState;
  onChange: (next: EmployeeFilterState) => void;
  departments: string[];
}

const selectClass =
  'h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950';

export function EmployeeFilters({ filters, onChange, departments }: EmployeeFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Search by name, email, department, or title"
          className="pl-9"
          aria-label="Search employees"
        />
      </div>

      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value as '' | EmployeeStatus })}
        className={selectClass}
        aria-label="Filter by status"
      >
        <option value="">All statuses</option>
        <option value="active">Active</option>
        <option value="invited">Invited</option>
        <option value="disabled">Disabled</option>
      </select>

      <select
        value={filters.department}
        onChange={(e) => onChange({ ...filters, department: e.target.value })}
        className={selectClass}
        aria-label="Filter by department"
        disabled={departments.length === 0}
      >
        <option value="">All departments</option>
        {departments.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
}

export type { EmployeeFiltersProps };
